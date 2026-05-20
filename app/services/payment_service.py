import logging
from datetime import datetime, timezone

from boto3.dynamodb.conditions import Attr
from botocore.exceptions import ClientError

from app.config import PURCHASES_HASH_KEY, PURCHASES_RANGE_KEY
from app.services.access_service import grant_course_access, has_course_access
from app.utils.database import purchases_table
from app.utils.dynamodb import sanitize_item
from app.utils.error import bad_request, conflict

logger = logging.getLogger(__name__)


def _stripe_session_dict(stripe_session) -> dict:
    if isinstance(stripe_session, dict):
        return stripe_session
    if hasattr(stripe_session, "to_dict"):
        return stripe_session.to_dict()
    return dict(stripe_session)


def _purchase_key(user_id: str, course_id: str) -> dict:
    """Build DynamoDB key for course-platform-purchases (user_id + course_id)."""
    key = {PURCHASES_HASH_KEY: user_id}
    if PURCHASES_RANGE_KEY:
        key[PURCHASES_RANGE_KEY] = course_id
    return key


def _find_purchase(user_id: str, course_id: str, session_id: str) -> dict | None:
    try:
        response = purchases_table.get_item(Key=_purchase_key(user_id, course_id))
        if "Item" in response:
            return response["Item"]
    except ClientError as exc:
        error = exc.response.get("Error", {})
        if error.get("Code") != "ValidationException":
            raise
        logger.warning(
            "Purchase get_item key mismatch; falling back to scan: %s",
            error.get("Message"),
        )

    scan = purchases_table.scan(
        FilterExpression=(
            (Attr("user_id").eq(user_id) & Attr("course_id").eq(course_id))
            | Attr("stripe_session_id").eq(session_id)
            | Attr("id").eq(session_id)
        )
    )
    items = scan.get("Items", [])
    return items[0] if items else None


def _write_purchase(purchase_item: dict) -> None:
    try:
        purchases_table.put_item(Item=sanitize_item(purchase_item))
    except ClientError as exc:
        error = exc.response.get("Error", {})
        logger.exception(
            "Failed to write purchase user=%s course=%s: %s",
            purchase_item.get("user_id"),
            purchase_item.get("course_id"),
            error.get("Message", exc),
        )
        conflict(
            "PURCHASE_WRITE_FAILED",
            "Could not save purchase record",
            {
                "aws_code": error.get("Code"),
                "aws_message": error.get("Message"),
            },
        )


def record_successful_purchase(stripe_session) -> dict:
    """
    Persist purchase to course-platform-purchases and grant access.
    Table keys: user_id (PK) + course_id (SK). Idempotent per user/course.
    """
    stripe_session = _stripe_session_dict(stripe_session)
    metadata = stripe_session.get("metadata") or {}

    user_id = metadata.get("user_id")
    course_id = metadata.get("course_id")
    session_id = stripe_session.get("id")

    if not user_id:
        bad_request(
            "MISSING_USER_ID",
            "Stripe session is missing user_id metadata",
            {"stripe_session_id": session_id},
        )

    if not course_id:
        bad_request(
            "MISSING_COURSE_ID",
            "Stripe session is missing course_id metadata",
            {"stripe_session_id": session_id},
        )

    if not session_id:
        bad_request(
            "MISSING_SESSION_ID",
            "Stripe session is missing id",
            {"user_id": user_id, "course_id": course_id},
        )

    existing_item = _find_purchase(user_id, course_id, session_id)

    if existing_item:
        logger.info(
            "Purchase already recorded for session %s (user=%s course=%s)",
            session_id,
            user_id,
            course_id,
        )
        access_item = None
        if has_course_access(user_id, course_id):
            access_item = {"user_id": user_id, "course_id": course_id}
        else:
            access_item = grant_course_access(
                user_id=user_id,
                course_id=course_id,
                source="stripe",
            )
        return {
            "purchase": existing_item,
            "access": access_item,
            "already_recorded": True,
        }

    purchase_item = {
        PURCHASES_HASH_KEY: user_id,
        PURCHASES_RANGE_KEY: course_id,
        "id": session_id,
        "stripe_session_id": session_id,
        "amount_total": stripe_session.get("amount_total"),
        "currency": stripe_session.get("currency") or "usd",
        "status": stripe_session.get("payment_status") or "paid",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    _write_purchase(purchase_item)

    access_item = grant_course_access(
        user_id=user_id,
        course_id=course_id,
        source="stripe",
    )

    logger.info(
        "Recorded purchase and granted access: session=%s user=%s course=%s",
        session_id,
        user_id,
        course_id,
    )

    return {
        "purchase": purchase_item,
        "access": access_item,
        "already_recorded": False,
    }
