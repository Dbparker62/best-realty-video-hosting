"""Transactional email via Amazon SES (purchase confirmation + welcome)."""

import logging

import boto3
from botocore.exceptions import ClientError

from app.config import (
    AWS_REGION,
    EMAIL_ENABLED,
    EMAIL_FROM,
    FRONTEND_URL,
    SUPPORT_EMAIL,
)
from app.utils.database import courses_table

logger = logging.getLogger(__name__)

_ses = boto3.client("ses", region_name=AWS_REGION)


def _is_configured() -> bool:
    return bool(EMAIL_ENABLED and EMAIL_FROM)


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


def _send_email(*, to_address: str, subject: str, html_body: str, text_body: str) -> bool:
    if not to_address or "@" not in to_address:
        logger.warning("Skipping email — invalid recipient: %s", to_address)
        return False

    if not _is_configured():
        logger.info(
            "Email not sent (SES disabled or EMAIL_FROM unset): %s → %s",
            EMAIL_FROM,
            to_address,
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
            ReplyToAddresses=[SUPPORT_EMAIL] if SUPPORT_EMAIL else [],
        )
        logger.info("Sent email %r to %s", subject, to_address)
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

    subject = f"Purchase confirmed — {course_title}"
    text_body = f"""Hi,

Thank you for your purchase!

Course: {course_title}
Amount paid: {amount_display}
Order reference: {session_id}

Start learning: {my_courses_url}
View course: {course_url}

Questions? Reply to this email or contact {SUPPORT_EMAIL or EMAIL_FROM}.

— Best Realty Courses
"""

    html_body = f"""<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
  <h2 style="color: #0f766e;">Purchase confirmed</h2>
  <p>Thank you for your purchase. Your course is ready.</p>
  <table style="margin: 16px 0; border-collapse: collapse;">
    <tr><td style="padding: 4px 12px 4px 0;"><strong>Course</strong></td><td>{course_title}</td></tr>
    <tr><td style="padding: 4px 12px 4px 0;"><strong>Amount</strong></td><td>{amount_display}</td></tr>
    <tr><td style="padding: 4px 12px 4px 0;"><strong>Order</strong></td><td style="font-size: 12px;">{session_id}</td></tr>
  </table>
  <p>
    <a href="{my_courses_url}" style="display: inline-block; background: #0f766e; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Go to My Courses</a>
  </p>
  <p style="font-size: 14px; color: #555;">
    <a href="{course_url}">Open course page</a>
  </p>
  <p style="font-size: 13px; color: #777;">Questions? Contact {SUPPORT_EMAIL or EMAIL_FROM}</p>
</body>
</html>"""

    return _send_email(
        to_address=to_address,
        subject=subject,
        html_body=html_body,
        text_body=text_body,
    )


def send_welcome_email(
    *,
    to_address: str,
    course_title: str,
    course_id: str,
) -> bool:
    site = FRONTEND_URL.rstrip("/")
    my_courses_url = f"{site}/my-courses"

    subject = "Welcome to Best Realty Courses"
    text_body = f"""Hi,

Welcome to Best Realty Courses — we're glad you're here.

You now have lifetime access to {course_title}. Sign in anytime to watch lessons, track your progress, and pick up where you left off.

Start learning: {my_courses_url}

Tips:
• Use the same email you signed up with to log in
• Visit My Courses to see everything you've purchased
• Mark lessons complete as you go to track progress

Questions? {SUPPORT_EMAIL or EMAIL_FROM}

— Best Realty Courses
"""

    html_body = f"""<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
  <h2 style="color: #0f766e;">Welcome to Best Realty Courses</h2>
  <p>We're excited to have you. Your account is active and <strong>{course_title}</strong> is ready.</p>
  <ul>
    <li>Lifetime access to your course</li>
    <li>Progress tracking across lessons</li>
    <li>Continue watching from any device</li>
  </ul>
  <p>
    <a href="{my_courses_url}" style="display: inline-block; background: #0f766e; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Go to My Courses</a>
  </p>
  <p style="font-size: 13px; color: #777;">Need help? {SUPPORT_EMAIL or EMAIL_FROM}</p>
</body>
</html>"""

    return _send_email(
        to_address=to_address,
        subject=subject,
        html_body=html_body,
        text_body=text_body,
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
