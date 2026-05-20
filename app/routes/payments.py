import logging

import stripe
from fastapi import APIRouter, Depends, HTTPException, Request

from app.config import (
    FRONTEND_URL,
    STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET,
)
from app.services import payment_service
from app.services.access_service import has_course_access
from app.utils.auth import require_customer
from app.utils.database import courses_table
from app.utils.error import conflict, not_found

logger = logging.getLogger(__name__)

stripe.api_key = STRIPE_SECRET_KEY
router = APIRouter()


@router.post("/checkout/{course_id}")
def create_checkout_session(
    course_id: str,
    user=Depends(require_customer),
):
    course_response = courses_table.get_item(Key={"id": course_id})

    if "Item" not in course_response:
        not_found(
            "COURSE_NOT_FOUND",
            "Course not found",
            {"course_id": course_id},
        )

    course = course_response["Item"]
    user_id = user["sub"]

    if has_course_access(user_id, course_id):
        conflict(
            "ALREADY_PURCHASED",
            "You already have access to this course",
            {"course_id": course_id},
        )

    base = FRONTEND_URL.rstrip("/")
    session = stripe.checkout.Session.create(
        payment_method_types=["card"],
        mode="payment",
        line_items=[
            {
                "price_data": {
                    "currency": "usd",
                    "product_data": {
                        "name": course["title"],
                    },
                    "unit_amount": course["price_cents"],
                },
                "quantity": 1,
            }
        ],
        success_url=f"{base}/payment/success?course_id={course_id}",
        cancel_url=f"{base}/payment/cancel",
        metadata={
            "user_id": user_id,
            "course_id": course_id,
        },
    )

    return {"checkout_url": session.url}


@router.post("/stripe/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(
            payload=payload,
            sig_header=sig_header,
            secret=STRIPE_WEBHOOK_SECRET,
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        payment_status = session.get("payment_status")

        if payment_status != "paid":
            logger.warning(
                "checkout.session.completed but payment_status=%s session=%s",
                payment_status,
                session.get("id"),
            )
            return {"received": True, "skipped": "payment_not_paid"}

        result = payment_service.record_successful_purchase(session)
        logger.info(
            "Stripe webhook processed checkout.session.completed session=%s already_recorded=%s",
            session.get("id"),
            result.get("already_recorded"),
        )

    return {"received": True}
