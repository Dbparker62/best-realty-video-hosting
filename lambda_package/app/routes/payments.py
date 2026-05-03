
from app.utils.auth import require_customer
from app.utils.database import courses_table
from app.utils.error import not_found
from fastapi import APIRouter, Depends,Request, HTTPException
from app.config import STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
from app.services import payment_service
import stripe
stripe.api_key = STRIPE_SECRET_KEY
router = APIRouter()
@router.post("/checkout/{course_id}")
def create_checkout_session(
    course_id: str,
    user=Depends(require_customer)
):
    course_response = courses_table.get_item(Key={"id": course_id})

    if "Item" not in course_response:
        not_found(
            "COURSE_NOT_FOUND",
            "Course not found",
            {"course_id": course_id}
        )

    course = course_response["Item"]

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
        success_url="http://localhost:3000/success",
        cancel_url="http://localhost:3000/cancel",
        metadata={
            "user_id": user["sub"],
            "course_id": course_id,
        }
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
            secret=STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        payment_service.record_successful_purchase(session)

    return {"received": True}