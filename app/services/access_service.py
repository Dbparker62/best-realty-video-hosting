import logging
from datetime import datetime, timezone

from boto3.dynamodb.conditions import Attr, Key
from botocore.exceptions import ClientError

from app.utils.database import course_access_table, purchases_table
from app.utils.dynamodb import sanitize_item

logger = logging.getLogger(__name__)


def grant_course_access(user_id: str, course_id: str, source: str = "stripe"):
    item = {
        "user_id": user_id,
        "course_id": course_id,
        "access_granted_at": datetime.now(timezone.utc).isoformat(),
        "source": source,
    }

    try:
        course_access_table.put_item(Item=sanitize_item(item))
    except ClientError as exc:
        logger.warning(
            "Could not write course access table (user=%s course=%s): %s",
            user_id,
            course_id,
            exc.response["Error"].get("Message", exc),
        )

    return item


def _has_access_via_purchases(user_id: str, course_id: str) -> bool:
    response = purchases_table.scan(
        FilterExpression=Attr("user_id").eq(user_id)
        & Attr("course_id").eq(course_id)
    )
    return bool(response.get("Items"))


def has_course_access(user_id: str, course_id: str) -> bool:
    try:
        response = course_access_table.get_item(
            Key={
                "user_id": user_id,
                "course_id": course_id,
            }
        )
        if "Item" in response:
            return True
    except ClientError as exc:
        logger.warning(
            "course access lookup failed (user=%s course=%s): %s",
            user_id,
            course_id,
            exc.response["Error"].get("Message", exc),
        )

    return _has_access_via_purchases(user_id, course_id)


def list_course_access_for_user(user_id: str) -> list[dict]:
    items: list[dict] = []

    try:
        response = course_access_table.query(
            KeyConditionExpression=Key("user_id").eq(user_id)
        )
        items = response.get("Items", [])
    except ClientError as exc:
        logger.warning(
            "course access query failed for user %s: %s",
            user_id,
            exc.response["Error"].get("Message", exc),
        )

    if items:
        return items

    seen: set[str] = set()
    fallback: list[dict] = []
    purchase_scan = purchases_table.scan(
        FilterExpression=Attr("user_id").eq(user_id)
    )
    for purchase in purchase_scan.get("Items", []):
        course_id = purchase.get("course_id")
        if not course_id or course_id in seen:
            continue
        seen.add(course_id)
        fallback.append(
            {
                "user_id": user_id,
                "course_id": course_id,
                "source": "purchase",
            }
        )

    return fallback
