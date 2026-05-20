import logging

from app.services.access_service import has_course_access
from app.services.lesson_service import check_lesson_exists, list_lessons_for_course
from app.services import progress_store
from app.utils.error import forbidden, not_found

logger = logging.getLogger(__name__)


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


def summarize_course_progress(user_id: str, course_id: str) -> dict:
    lessons = list_lessons_for_course(course_id)
    total_lessons = len(lessons)
    completed_ids = progress_store.get_completed_lesson_ids(user_id, course_id)
    last_watched_lesson_id = progress_store.get_last_watched_lesson_id(
        user_id, course_id
    )

    completed_count = 0
    lesson_progress = []

    for lesson in lessons:
        lesson_id = lesson["id"]
        completed = lesson_id in completed_ids
        if completed:
            completed_count += 1

        lesson_progress.append(
            {
                "lesson_id": lesson_id,
                "completed": completed,
                "position_seconds": progress_store.get_lesson_position_seconds(
                    user_id, course_id, lesson_id
                ),
                "last_watched_at": None,
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

    return progress_store.save_lesson_progress(
        user["sub"],
        course_id,
        lesson_id,
        completed=bool(completed),
        position_seconds=position_seconds,
    )


def mark_lesson_complete(user: dict, course_id: str, lesson_id: str) -> dict:
    """Mark a lesson complete (writes to purchase row, returns full course progress)."""
    upsert_lesson_progress(
        user,
        course_id,
        lesson_id,
        completed=True,
        position_seconds=None,
    )
    return summarize_course_progress(user["sub"], course_id)
