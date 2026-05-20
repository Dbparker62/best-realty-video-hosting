from app.services.access_service import list_course_access_for_user
from app.services.progress_service import summarize_course_progress
from app.utils.database import courses_table


def get_my_courses(user_id: str) -> list[dict]:
    access_rows = list_course_access_for_user(user_id)
    result: list[dict] = []

    for access in access_rows:
        course_id = access.get("course_id")
        if not course_id:
            continue

        course_response = courses_table.get_item(Key={"id": course_id})
        course = course_response.get("Item")
        if not course:
            continue

        summary = summarize_course_progress(user_id, course_id)

        result.append(
            {
                **course,
                "progress": summary["progress"],
                "completed_lessons": summary["completed_lessons"],
                "total_lessons": summary["total_lessons"],
                "last_watched_lesson_id": summary["last_watched_lesson_id"],
            }
        )

    result.sort(key=lambda row: row.get("title") or "")
    return result
