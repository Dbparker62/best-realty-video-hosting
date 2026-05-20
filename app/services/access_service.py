from datetime import datetime, timezone

from boto3.dynamodb.conditions import Key

from app.utils.database import course_access_table


def grant_course_access(user_id: str, course_id: str, source: str = "stripe"):
    item = {
        "user_id": user_id,
        "course_id": course_id,
        "access_granted_at": datetime.now(timezone.utc).isoformat(),
        "source": source,
    }

    course_access_table.put_item(Item=item)
    return item


def has_course_access(user_id: str, course_id: str) -> bool:
    response = course_access_table.get_item(
        Key={
            "user_id": user_id,
            "course_id": course_id,
        }
    )

    return "Item" in response


def list_course_access_for_user(user_id: str) -> list[dict]:
    response = course_access_table.query(
        KeyConditionExpression=Key("user_id").eq(user_id)
    )
    return response.get("Items", [])