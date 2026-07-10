"""Transactional email via Amazon SES."""

import logging

import boto3
from botocore.exceptions import ClientError

from app.config import (
    AWS_REGION,
    EMAIL_ENABLED,
    EMAIL_FROM,
    FRONTEND_URL,
    QUESTIONNAIRE_LEAD_EMAIL,
    SCHOOL_WEBSITE_URL,
    SUPPORT_EMAIL,
)
from app.services import email_templates as templates
from app.utils.database import courses_table

logger = logging.getLogger(__name__)

_ses = boto3.client("ses", region_name=AWS_REGION)


def _is_configured() -> bool:
    return bool(EMAIL_ENABLED and EMAIL_FROM)


def _support_address() -> str:
    return SUPPORT_EMAIL or EMAIL_FROM


def _format_amount(amount_total) -> str:
    if amount_total is None:
        return "—"
    try:
        cents = int(amount_total)
        return f"${cents / 100:.2f}"
    except (TypeError, ValueError):
        try:
            return f"${float(amount_total):.2f}"
        except (TypeError, ValueError):
            return "—"


def _load_course_title(course_id: str) -> str:
    try:
        response = courses_table.get_item(Key={"id": course_id})
        item = response.get("Item") or {}
        return str(item.get("title") or "Your course")
    except Exception as exc:
        logger.warning("Could not load course title for %s: %s", course_id, exc)
        return "Your course"


def _send_email(
    *,
    to_address: str,
    subject: str,
    html_body: str,
    text_body: str,
    reply_to: str | None = None,
) -> bool:
    if not to_address or "@" not in to_address:
        logger.warning("Skipping email — invalid recipient: %s", to_address)
        return False

    if not _is_configured():
        logger.info(
            "Email not sent (SES disabled or EMAIL_FROM unset): %s → %s | subject=%r",
            EMAIL_FROM,
            to_address,
            subject,
        )
        return False

    try:
        _ses.send_email(
            Source=EMAIL_FROM,
            Destination={"ToAddresses": [to_address]},
            Message={
                "Subject": {"Data": subject, "Charset": "UTF-8"},
                "Body": {
                    "Text": {"Data": text_body, "Charset": "UTF-8"},
                    "Html": {"Data": html_body, "Charset": "UTF-8"},
                },
            },
            ReplyToAddresses=(
                [reply_to]
                if reply_to
                else ([_support_address()] if _support_address() else [])
            ),
        )
        logger.info(
            "SES email sent: to=%s subject=%r reply_to=%s",
            to_address,
            subject,
            reply_to or _support_address() or "—",
        )
        return True
    except ClientError as exc:
        error = exc.response.get("Error", {})
        logger.exception(
            "SES send_email failed to %s: %s",
            to_address,
            error.get("Message", exc),
        )
        return False


def send_purchase_confirmation_email(
    *,
    to_address: str,
    course_title: str,
    amount_display: str,
    session_id: str,
    course_id: str,
) -> bool:
    site = FRONTEND_URL.rstrip("/")
    my_courses_url = f"{site}/my-courses"
    course_url = f"{site}/courses/{course_id}"
    support = _support_address()

    return _send_email(
        to_address=to_address,
        subject=templates.purchase_confirmation_subject(course_title=course_title),
        text_body=templates.purchase_confirmation_text(
            course_title=course_title,
            amount_display=amount_display,
            session_id=session_id,
            my_courses_url=my_courses_url,
            course_url=course_url,
            support_email=support,
        ),
        html_body=templates.purchase_confirmation_html(
            course_title=course_title,
            amount_display=amount_display,
            session_id=session_id,
            my_courses_url=my_courses_url,
            course_url=course_url,
            support_email=support,
        ),
    )


def send_welcome_email(
    *,
    to_address: str,
    course_title: str,
    course_id: str,
) -> bool:
    site = FRONTEND_URL.rstrip("/")
    my_courses_url = f"{site}/my-courses"
    support = _support_address()

    return _send_email(
        to_address=to_address,
        subject=templates.welcome_subject(),
        text_body=templates.welcome_text(
            course_title=course_title,
            my_courses_url=my_courses_url,
            support_email=support,
        ),
        html_body=templates.welcome_html(
            course_title=course_title,
            my_courses_url=my_courses_url,
            support_email=support,
        ),
    )


def send_post_purchase_emails(
    *,
    customer_email: str | None,
    user_id: str,
    course_id: str,
    session_id: str,
    amount_total,
    is_first_purchase: bool,
) -> dict:
    """
    Send confirmation (always on new purchase) and welcome (first purchase only).
    Never raises — purchase flow must succeed even if email fails.
    """
    results = {"confirmation_sent": False, "welcome_sent": False}

    if not customer_email or "@" not in customer_email:
        logger.warning(
            "No customer email for purchase user=%s course=%s — skipping emails",
            user_id,
            course_id,
        )
        return results

    course_title = _load_course_title(course_id)
    amount_display = _format_amount(amount_total)

    results["confirmation_sent"] = send_purchase_confirmation_email(
        to_address=customer_email,
        course_title=course_title,
        amount_display=amount_display,
        session_id=session_id,
        course_id=course_id,
    )

    if is_first_purchase:
        results["welcome_sent"] = send_welcome_email(
            to_address=customer_email,
            course_title=course_title,
            course_id=course_id,
        )

    return results


def send_questionnaire_score_email(
    *,
    to_address: str,
    name: str,
    readiness_label: str,
    score: int,
    max_score: int,
    breakdown: list[dict],
    career_path_title: str,
    roadmap: str,
) -> bool:
    courses_url = SCHOOL_WEBSITE_URL
    support = _support_address()

    breakdown_lines = templates.format_breakdown_text(breakdown)
    breakdown_html = templates.format_breakdown_html(breakdown)

    return _send_email(
        to_address=to_address,
        subject=templates.questionnaire_score_subject(
            career_path_title=career_path_title
        ),
        text_body=templates.questionnaire_score_text(
            name=name,
            readiness_label=readiness_label,
            career_path_title=career_path_title,
            roadmap=roadmap,
            breakdown_lines=breakdown_lines,
            courses_url=courses_url,
            support_email=support,
        ),
        html_body=templates.questionnaire_score_html(
            name=name,
            readiness_label=readiness_label,
            career_path_title=career_path_title,
            roadmap=roadmap,
            breakdown_html=breakdown_html,
            courses_url=courses_url,
            support_email=support,
        ),
    )


def send_questionnaire_lead_notification_email(
    *,
    lead_name: str,
    lead_email: str,
    readiness_label: str,
    breakdown: list[dict],
    career_path_title: str,
    roadmap: str,
) -> bool:
    """Notify staff of a new quiz lead. Reply-To is set to the lead's email."""
    if not QUESTIONNAIRE_LEAD_EMAIL or "@" not in QUESTIONNAIRE_LEAD_EMAIL:
        logger.info("QUESTIONNAIRE_LEAD_EMAIL unset — skipping lead notification")
        return False

    breakdown_lines = templates.format_breakdown_text(breakdown)
    breakdown_html = templates.format_breakdown_html(breakdown)

    return _send_email(
        to_address=QUESTIONNAIRE_LEAD_EMAIL,
        subject=templates.questionnaire_lead_subject(name=lead_name),
        text_body=templates.questionnaire_lead_text(
            name=lead_name,
            email=lead_email,
            career_path_title=career_path_title,
            readiness_label=readiness_label,
            roadmap=roadmap,
            breakdown_lines=breakdown_lines,
        ),
        html_body=templates.questionnaire_lead_html(
            name=lead_name,
            email=lead_email,
            career_path_title=career_path_title,
            readiness_label=readiness_label,
            roadmap=roadmap,
            breakdown_html=breakdown_html,
        ),
        reply_to=lead_email,
    )
