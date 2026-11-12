import logging

from fastapi import APIRouter, HTTPException

from app.models import schemas
from app.services import email_service

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/contact", response_model=schemas.ContactMessageOut)
def send_contact_message(body: schemas.ContactMessageIn):
    """Email a website contact-form message to staff."""
    if body.website:
        # Honeypot filled in: almost certainly a bot. Pretend it worked.
        logger.info("Contact form honeypot triggered; message dropped")
        return {"sent": True}

    sent = email_service.send_contact_message_email(
        name=body.name.strip(),
        email=str(body.email),
        phone=(body.phone or "").strip() or None,
        subject_key=body.subject,
        order_number=(body.order_number or "").strip() or None,
        message=body.message.strip(),
        attribution=body.attribution.model_dump(exclude_none=True) if body.attribution else None,
    )
    if not sent:
        raise HTTPException(
            status_code=503,
            detail="We couldn't send your message right now. Please call or email us instead.",
        )
    return {"sent": True}
