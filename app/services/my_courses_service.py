from boto3.dynamodb.conditions import Attr

from app.services.access_service import list_course_access_for_user
from app.utils.database import courses_table, lessons_table


def _count_lessons_for_course(course_id: str) -> int:
    response = lessons_table.scan(
        FilterExpression=Attr("course_id").eq(course_id)
    )
    return len(response.get("Items", []))


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

        total_lessons = _count_lessons_for_course(course_id)

        result.append(
            {
                **course,
                "progress": 0,
                "completed_lessons": 0,
                "total_lessons": total_lessons,
                "last_watched_lesson_id": None,
            }
        )

    result.sort(key=lambda row: row.get("title") or "")
    return result
