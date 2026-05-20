from datetime import datetime, timezone
from uuid import uuid4

from app.utils.database import purchases_table
from app.services.access_service import grant_course_access
from app.utils.error import bad_request


def record_successful_purchase(stripe_session: dict):
    stripe_session = stripe_session.to_dict()
    metadata = stripe_session.get("metadata", {})

    user_id = metadata.get("user_id")
    course_id = metadata.get("course_id")

    if not user_id:
        bad_request(
            "MISSING_USER_ID",
            "Stripe session is missing user_id metadata",
            {"stripe_session_id": stripe_session.get("id")}
        )

    if not course_id:
        bad_request(
            "MISSING_COURSE_ID",
            "Stripe session is missing course_id metadata",
            {"stripe_session_id": stripe_session.get("id")}
        )

    purchase_item = {
        "id": str(uuid4()),
        "user_id": user_id,
        "course_id": course_id,
        "stripe_session_id": stripe_session.get("id"),
        "amount_total": stripe_session.get("amount_total"),
        "currency": stripe_session.get("currency"),
        "status": stripe_session.get("payment_status", "paid"),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    purchases_table.put_item(Item=purchase_item)

    access_item = grant_course_access(
        user_id=user_id,
        course_id=course_id,
        source="stripe"
    )

    return {
        "purchase": purchase_item,
        "access": access_item,
    }