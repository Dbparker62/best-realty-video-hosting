import logging

import stripe
from botocore.exceptions import ClientError
from fastapi import APIRouter, Depends, HTTPException, Request

from app.config import (
    FRONTEND_URL,
    STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET,
)
from app.models import schemas
from app.services import payment_service
from app.services.access_service import has_course_access
from app.utils.auth import require_customer
from app.utils.database import courses_table
from app.utils.error import bad_request, conflict, forbidden, not_found

logger = logging.getLogger(__name__)

stripe.api_key = STRIPE_SECRET_KEY
router = APIRouter()


# Must be registered before /checkout/{course_id} or "confirm" is treated as a course id.
@router.post("/checkout/confirm", response_model=schemas.CheckoutConfirmOut)
def confirm_checkout(
    body: schemas.CheckoutConfirmRequest,
    user=Depends(require_customer),
):
    """
    Fulfill purchase after Stripe redirect (works even if webhook is delayed or missing).
    Verifies the session belongs to the signed-in user and payment is complete.
    """
    if not STRIPE_SECRET_KEY:
        bad_request(
            "STRIPE_NOT_CONFIGURED",
            "Stripe secret key is not configured on the API",
        )

    try:
        session = stripe.checkout.Session.retrieve(body.session_id)
    except stripe.error.StripeError as exc:
        logger.exception("Stripe session retrieve failed: %s", body.session_id)
        bad_request(
            "STRIPE_ERROR",
            str(exc.user_message) if hasattr(exc, "user_message") else str(exc),
            {"session_id": body.session_id},
        )

    session_dict = payment_service._stripe_session_dict(session)
    metadata = session_dict.get("metadata") or {}

    if metadata.get("user_id") != user["sub"]:
        forbidden(
            "SESSION_USER_MISMATCH",
            "This checkout session does not belong to your account",
            {"session_id": body.session_id},
        )

    course_id = metadata.get("course_id")
    if not course_id:
        not_found(
            "MISSING_COURSE_ID",
            "Checkout session is missing course_id metadata",
            {"session_id": body.session_id},
        )

    if session_dict.get("payment_status") != "paid":
        not_found(
            "PAYMENT_NOT_COMPLETE",
            "Payment is not complete yet",
            {
                "session_id": body.session_id,
                "payment_status": session_dict.get("payment_status"),
            },
        )

    try:
        result = payment_service.record_successful_purchase(session_dict)
    except HTTPException:
        raise
    except ClientError as exc:
        error = exc.response.get("Error", {})
        logger.exception("DynamoDB error during checkout confirm")
        conflict(
            "DATABASE_ERROR",
            error.get("Message", "Database error while saving purchase"),
            {"aws_code": error.get("Code")},
        )
    except Exception as exc:
        logger.exception("Unexpected error during checkout confirm")
        conflict(
            "CONFIRM_FAILED",
            str(exc) or "Could not confirm purchase",
            {"session_id": body.session_id},
        )

    return {
        "course_id": course_id,
        "has_access": has_course_access(user["sub"], course_id),
        "already_recorded": result.get("already_recorded", False),
    }


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
    customer_email = (user.get("email") or "").strip()

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
        success_url=(
            f"{base}/payment/success?course_id={course_id}"
            "&session_id={CHECKOUT_SESSION_ID}"
        ),
        cancel_url=f"{base}/payment/cancel",
        metadata={
            "user_id": user_id,
            "course_id": course_id,
            "customer_email": customer_email,
        },
        **(
            {"customer_email": customer_email}
            if customer_email
            else {}
        ),
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
