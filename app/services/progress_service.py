from datetime import datetime, timezone

from boto3.dynamodb.conditions import Key

from app.services.access_service import has_course_access
from app.services.lesson_service import check_lesson_exists, list_lessons_for_course
from app.utils.database import progress_table
from app.utils.error import forbidden, not_found


def _progress_sk(course_id: str, lesson_id: str) -> str:
    return f"{course_id}#{lesson_id}"


def _ensure_can_track_progress(user: dict, course_id: str, lesson: dict) -> None:
    is_admin = "admin" in user.get("groups", [])
    if is_admin:
        return

    if lesson.get("is_preview"):
        return

    if has_course_access(user["sub"], course_id):
        return

    forbidden(
        "COURSE_ACCESS_REQUIRED",
        "You must purchase this course to track lesson progress",
        {"course_id": course_id},
    )


def list_lesson_progress_for_course(user_id: str, course_id: str) -> list[dict]:
    response = progress_table.query(
        KeyConditionExpression=Key("user_id").eq(user_id)
        & Key("sk").begins_with(f"{course_id}#")
    )
    return response.get("Items", [])


def summarize_course_progress(user_id: str, course_id: str) -> dict:
    lessons = list_lessons_for_course(course_id)
    total_lessons = len(lessons)
    progress_rows = list_lesson_progress_for_course(user_id, course_id)
    by_lesson = {row.get("lesson_id"): row for row in progress_rows}

    completed_count = 0
    last_watched_lesson_id = None
    last_watched_at = None

    lesson_progress = []
    for lesson in lessons:
        row = by_lesson.get(lesson["id"], {})
        completed = bool(row.get("completed"))
        if completed:
            completed_count += 1

        watched_at = row.get("last_watched_at")
        if watched_at and (last_watched_at is None or watched_at > last_watched_at):
            last_watched_at = watched_at
            last_watched_lesson_id = lesson["id"]

        lesson_progress.append(
            {
                "lesson_id": lesson["id"],
                "completed": completed,
                "position_seconds": row.get("position_seconds"),
                "last_watched_at": watched_at,
            }
        )

    progress_percent = (
        round((completed_count / total_lessons) * 100) if total_lessons > 0 else 0
    )

    return {
        "course_id": course_id,
        "progress": progress_percent,
        "completed_lessons": completed_count,
        "total_lessons": total_lessons,
        "last_watched_lesson_id": last_watched_lesson_id,
        "lessons": lesson_progress,
    }


def get_course_progress(user: dict, course_id: str) -> dict:
    from app.services.lesson_service import check_course_exists

    check_course_exists(course_id)
    user_id = user["sub"]
    is_admin = "admin" in user.get("groups", [])

    if not is_admin and not has_course_access(user_id, course_id):
        lessons = list_lessons_for_course(course_id)
        if not any(lesson.get("is_preview") for lesson in lessons):
            forbidden(
                "COURSE_ACCESS_REQUIRED",
                "You must purchase this course to view progress",
                {"course_id": course_id},
            )

    return summarize_course_progress(user_id, course_id)


def upsert_lesson_progress(
    user: dict,
    course_id: str,
    lesson_id: str,
    *,
    completed: bool | None = None,
    position_seconds: int | None = None,
) -> dict:
    lesson = check_lesson_exists(lesson_id)

    if lesson.get("course_id") != course_id:
        not_found(
            "LESSON_NOT_IN_COURSE",
            "Lesson does not belong to this course",
            {"course_id": course_id, "lesson_id": lesson_id},
        )

    _ensure_can_track_progress(user, course_id, lesson)

    user_id = user["sub"]
    sk = _progress_sk(course_id, lesson_id)
    now = datetime.now(timezone.utc).isoformat()

    existing = progress_table.get_item(Key={"user_id": user_id, "sk": sk})
    item = dict(existing.get("Item") or {})

    item.update(
        {
            "user_id": user_id,
            "sk": sk,
            "course_id": course_id,
            "lesson_id": lesson_id,
            "last_watched_at": now,
        }
    )

    if position_seconds is not None:
        item["position_seconds"] = max(0, int(position_seconds))

    if completed is not None:
        item["completed"] = completed
        if completed:
            item["completed_at"] = now
    elif "completed" not in item:
        item["completed"] = False

    progress_table.put_item(Item=item)
    return item
