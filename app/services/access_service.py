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
        "completed_lesson_ids": [],
        "lesson_positions": {},
    }

    try:
        existing = course_access_table.get_item(
            Key={"user_id": user_id, "course_id": course_id}
        )
        if "Item" in existing:
            item = dict(existing["Item"])
            if "completed_lesson_ids" not in item:
                item["completed_lesson_ids"] = []
            if "lesson_positions" not in item:
                item["lesson_positions"] = {}
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


def _as_string_list(value) -> list[str]:
    if not value:
        return []
    if isinstance(value, list):
        return [str(v) for v in value if v]
    return [str(value)]


def _as_positions_map(value) -> dict[str, int]:
    if not value or not isinstance(value, dict):
        return {}
    result: dict[str, int] = {}
    for key, raw in value.items():
        try:
            result[str(key)] = max(0, int(raw))
        except (TypeError, ValueError):
            continue
    return result


def get_access_progress_record(user_id: str, course_id: str) -> dict:
    """Load progress fields stored on the course access row (same table as purchases unlock)."""
    item: dict = {}

    try:
        response = course_access_table.get_item(
            Key={"user_id": user_id, "course_id": course_id}
        )
        item = dict(response.get("Item") or {})
    except ClientError as exc:
        logger.warning(
            "Could not load access progress (user=%s course=%s): %s",
            user_id,
            course_id,
            exc.response["Error"].get("Message", exc),
        )

    if not item and _has_access_via_purchases(user_id, course_id):
        item = {
            "user_id": user_id,
            "course_id": course_id,
            "completed_lesson_ids": [],
            "lesson_positions": {},
        }

    return item


def save_lesson_progress_on_access(
    user_id: str,
    course_id: str,
    lesson_id: str,
    *,
    completed: bool | None = None,
    position_seconds: int | None = None,
) -> dict:
    """
    Persist lesson progress on the course access DynamoDB item.
    Uses the same table/keys as purchase unlock (user_id + course_id).
    """
    item = get_access_progress_record(user_id, course_id)

    if not item:
        item = grant_course_access(user_id, course_id, source="progress")

    now = datetime.now(timezone.utc).isoformat()
    completed_ids = set(_as_string_list(item.get("completed_lesson_ids")))
    positions = _as_positions_map(item.get("lesson_positions"))

    item["user_id"] = user_id
    item["course_id"] = course_id
    item["last_watched_lesson_id"] = lesson_id
    item["last_watched_at"] = now

    if position_seconds is not None:
        positions[lesson_id] = max(0, int(position_seconds))
    item["lesson_positions"] = positions

    if completed:
        completed_ids.add(lesson_id)
    item["completed_lesson_ids"] = sorted(completed_ids)

    try:
        course_access_table.put_item(Item=sanitize_item(item))
    except ClientError as exc:
        error = exc.response.get("Error", {})
        logger.exception(
            "Failed to save progress on access row user=%s course=%s: %s",
            user_id,
            course_id,
            error.get("Message", exc),
        )
        from app.utils.error import conflict

        conflict(
            "PROGRESS_WRITE_FAILED",
            "Could not save lesson progress",
            {
                "aws_code": error.get("Code"),
                "aws_message": error.get("Message"),
            },
        )

    return item


def get_completed_lesson_ids(user_id: str, course_id: str) -> set[str]:
    item = get_access_progress_record(user_id, course_id)
    return set(_as_string_list(item.get("completed_lesson_ids")))


def get_lesson_position_seconds(
    user_id: str, course_id: str, lesson_id: str
) -> int | None:
    item = get_access_progress_record(user_id, course_id)
    positions = _as_positions_map(item.get("lesson_positions"))
    return positions.get(lesson_id)


def get_last_watched_lesson_id(user_id: str, course_id: str) -> str | None:
    item = get_access_progress_record(user_id, course_id)
    return item.get("last_watched_lesson_id")
