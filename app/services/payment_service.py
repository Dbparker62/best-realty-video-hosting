import logging
from datetime import datetime, timezone

from app.services.access_service import grant_course_access, has_course_access
from app.utils.database import purchases_table
from app.utils.error import bad_request

logger = logging.getLogger(__name__)


def _stripe_session_dict(stripe_session) -> dict:
    if isinstance(stripe_session, dict):
        return stripe_session
    if hasattr(stripe_session, "to_dict"):
        return stripe_session.to_dict()
    return dict(stripe_session)


def record_successful_purchase(stripe_session) -> dict:
    """
    Persist purchase to course-platform-purchases and grant access in course access table.
    Idempotent on Stripe checkout session id (webhook retries).
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

    existing = purchases_table.get_item(Key={"id": session_id})
    if "Item" in existing:
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
            "purchase": existing["Item"],
            "access": access_item,
            "already_recorded": True,
        }

    purchase_item = {
        "id": session_id,
        "user_id": user_id,
        "course_id": course_id,
        "stripe_session_id": session_id,
        "amount_total": stripe_session.get("amount_total"),
        "currency": stripe_session.get("currency"),
        "status": stripe_session.get("payment_status", "paid"),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    purchases_table.put_item(Item=purchase_item)

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
