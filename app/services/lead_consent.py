"""Shared lead fields for every quiz: contact consent and a readable copy of the answers."""

from datetime import datetime, timezone

from app.utils.error import bad_request

CONSENT_TEXT_MAX = 600


def consent_fields(contact_consent: bool | None, consent_text: str | None) -> dict:
    """Validate and record the "you may contact me" checkbox.

    The quiz pages require the box, so an explicit False is rejected. None means the
    request came from a page that predates the checkbox (a tab left open across a
    deploy); it is accepted and recorded as unknown rather than losing the lead.
    """
    if contact_consent is False:
        bad_request(
            "CONSENT_REQUIRED",
            "Please check the box to let us contact you about your results.",
        )
    if contact_consent is None:
        return {"contact_consent": None}
    return {
        "contact_consent": True,
        "contact_consent_text": (consent_text or "").strip()[:CONSENT_TEXT_MAX] or None,
        "contact_consent_at": datetime.now(timezone.utc).isoformat(),
    }


def answer_summary(breakdown: list[dict]) -> list[dict]:
    """Question/answer text pairs saved with the lead, so exports don't need the quiz code."""
    return [
        {"question": str(b.get("prompt") or ""), "answer": str(b.get("selected_label") or "")}
        for b in breakdown
    ]
