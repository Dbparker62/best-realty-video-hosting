"""
Lesson progress is stored in two places:
1. course-platform-lesson-progress (user_id + sk) — one row per lesson
2. course-platform-purchases (user_id + course_id) — completed_lesson_ids on purchase row
"""

import logging
from datetime import datetime, timezone

from boto3.dynamodb.conditions import Attr, Key
from botocore.exceptions import ClientError

from app.config import PURCHASES_HASH_KEY, PURCHASES_RANGE_KEY
from app.utils.database import progress_table, purchases_table
from app.utils.dynamodb import sanitize_item
from app.utils.error import conflict

logger = logging.getLogger(__name__)


def _progress_sk(course_id: str, lesson_id: str) -> str:
    return f"{course_id}#{lesson_id}"


def _purchase_key(user_id: str, course_id: str) -> dict:
    key = {PURCHASES_HASH_KEY: user_id}
    if PURCHASES_RANGE_KEY:
        key[PURCHASES_RANGE_KEY] = course_id
    return key


def _as_string_list(value) -> list[str]:
    if not value:
        return []
    if isinstance(value, list):
        return [str(v) for v in value if v]
    return [str(value)]


def _normalize_completed(value) -> bool:
    if value is None:
        return False
    if isinstance(value, bool):
        return value
    try:
        return bool(int(value))
    except (TypeError, ValueError):
        return bool(value)


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


def _find_purchase_by_scan(user_id: str, course_id: str) -> dict | None:
    scan = purchases_table.scan(
        FilterExpression=Attr("user_id").eq(user_id)
        & Attr("course_id").eq(course_id)
    )
    items = scan.get("Items", [])
    return items[0] if items else None


def load_purchase_row(user_id: str, course_id: str) -> dict | None:
    try:
        response = purchases_table.get_item(Key=_purchase_key(user_id, course_id))
        if "Item" in response:
            return dict(response["Item"])
    except ClientError as exc:
        error = exc.response.get("Error", {})
        if error.get("Code") != "ValidationException":
            raise
        logger.warning(
            "Purchase get_item for progress failed, using scan: %s",
            error.get("Message"),
        )

    found = _find_purchase_by_scan(user_id, course_id)
    return dict(found) if found else None


def _list_progress_table_rows(user_id: str, course_id: str) -> list[dict]:
    try:
        response = progress_table.query(
            KeyConditionExpression=Key("user_id").eq(user_id)
            & Key("sk").begins_with(f"{course_id}#")
        )
        return response.get("Items", [])
    except ClientError as exc:
        logger.warning(
            "Progress table query failed user=%s course=%s: %s",
            user_id,
            course_id,
            exc.response.get("Error", {}).get("Message", exc),
        )
        return []


def get_completed_lesson_ids(user_id: str, course_id: str) -> set[str]:
    completed: set[str] = set()

    purchase = load_purchase_row(user_id, course_id)
    if purchase:
        completed.update(_as_string_list(purchase.get("completed_lesson_ids")))

    for row in _list_progress_table_rows(user_id, course_id):
        if _normalize_completed(row.get("completed")):
            lesson_id = row.get("lesson_id")
            if lesson_id:
                completed.add(str(lesson_id))

    return completed


def get_lesson_position_seconds(
    user_id: str, course_id: str, lesson_id: str
) -> int | None:
    sk = _progress_sk(course_id, lesson_id)
    try:
        response = progress_table.get_item(Key={"user_id": user_id, "sk": sk})
        if "Item" in response:
            pos = response["Item"].get("position_seconds")
            if pos is not None:
                return int(pos)
    except ClientError:
        pass

    purchase = load_purchase_row(user_id, course_id)
    if purchase:
        return _as_positions_map(purchase.get("lesson_positions")).get(lesson_id)
    return None


def get_last_watched_lesson_id(user_id: str, course_id: str) -> str | None:
    last_id = None
    last_at = None

    purchase = load_purchase_row(user_id, course_id)
    if purchase:
        last_id = purchase.get("last_watched_lesson_id")
        last_at = purchase.get("last_watched_at")

    for row in _list_progress_table_rows(user_id, course_id):
        watched_at = row.get("last_watched_at")
        if watched_at and (last_at is None or watched_at > last_at):
            last_at = watched_at
            last_id = row.get("lesson_id")

    return str(last_id) if last_id else None


def _save_progress_table_row(
    user_id: str,
    course_id: str,
    lesson_id: str,
    *,
    completed: bool,
    position_seconds: int | None,
    now: str,
) -> dict:
    sk = _progress_sk(course_id, lesson_id)
    item: dict = {
        "user_id": user_id,
        "sk": sk,
        "course_id": course_id,
        "lesson_id": lesson_id,
        "last_watched_at": now,
        "completed": completed,
    }

    if completed:
        item["completed_at"] = now

    if position_seconds is not None:
        item["position_seconds"] = max(0, int(position_seconds))

    try:
        existing = progress_table.get_item(Key={"user_id": user_id, "sk": sk})
        if "Item" in existing:
            merged = dict(existing["Item"])
            merged.update(item)
            item = merged
    except ClientError:
        pass

    progress_table.put_item(Item=sanitize_item(item))
    return item


def _save_purchase_row_progress(
    user_id: str,
    course_id: str,
    lesson_id: str,
    *,
    completed: bool,
    position_seconds: int | None,
    now: str,
) -> dict | None:
    row = load_purchase_row(user_id, course_id)
    if not row:
        return None

    completed_ids = set(_as_string_list(row.get("completed_lesson_ids")))
    positions = _as_positions_map(row.get("lesson_positions"))

    row["last_watched_lesson_id"] = lesson_id
    row["last_watched_at"] = now

    if position_seconds is not None:
        positions[lesson_id] = max(0, int(position_seconds))
    row["lesson_positions"] = positions

    if completed:
        completed_ids.add(lesson_id)
    row["completed_lesson_ids"] = sorted(completed_ids)

    purchases_table.put_item(Item=sanitize_item(row))
    return row


def save_lesson_progress(
    user_id: str,
    course_id: str,
    lesson_id: str,
    *,
    completed: bool = False,
    position_seconds: int | None = None,
) -> dict:
    now = datetime.now(timezone.utc).isoformat()
    progress_row = None
    purchase_row = None
    errors: list[str] = []

    try:
        progress_row = _save_progress_table_row(
            user_id,
            course_id,
            lesson_id,
            completed=completed,
            position_seconds=position_seconds,
            now=now,
        )
    except ClientError as exc:
        errors.append(
            f"lesson-progress table: {exc.response.get('Error', {}).get('Message', exc)}"
        )

    try:
        purchase_row = _save_purchase_row_progress(
            user_id,
            course_id,
            lesson_id,
            completed=completed,
            position_seconds=position_seconds,
            now=now,
        )
    except ClientError as exc:
        errors.append(
            f"purchases table: {exc.response.get('Error', {}).get('Message', exc)}"
        )

    if not progress_row and not purchase_row:
        conflict(
            "PROGRESS_WRITE_FAILED",
            "Could not save lesson progress",
            {"errors": errors, "user_id": user_id, "course_id": course_id},
        )

    logger.info(
        "Saved lesson progress user=%s course=%s lesson=%s completed=%s "
        "(progress_table=%s purchase_row=%s)",
        user_id,
        course_id,
        lesson_id,
        completed,
        bool(progress_row),
        bool(purchase_row),
    )

    return purchase_row or progress_row or {}
