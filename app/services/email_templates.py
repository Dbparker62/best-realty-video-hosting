"""
Edit this file to change email wording, subject lines, and HTML styling.

Variables in {braces} are filled in automatically — keep the names as-is.
Placeholders available per template are listed in each function docstring.
"""

from html import escape


def _e(value: object) -> str:
    """Escape HTML in dynamic values."""
    return escape(str(value if value is not None else ""))


# ---------------------------------------------------------------------------
# Branding — change these once; used across all emails
# ---------------------------------------------------------------------------

BRAND_NAME = "Best School Of Real Estate"
BRAND_TAGLINE = "New Jersey real estate pre-licensing education"
BRAND_COLOR = "#0f766e"  # teal accent for headings and buttons


# ---------------------------------------------------------------------------
# Purchase confirmation (sent after every checkout)
# ---------------------------------------------------------------------------


def purchase_confirmation_subject(*, course_title: str) -> str:
    return f"Purchase confirmed — {course_title}"


def purchase_confirmation_text(
    *,
    course_title: str,
    amount_display: str,
    session_id: str,
    my_courses_url: str,
    course_url: str,
    support_email: str,
) -> str:
    return f"""Hi,

Thank you for your purchase!

Course: {course_title}
Amount paid: {amount_display}
Order reference: {session_id}

Start learning: {my_courses_url}
View course: {course_url}

Questions? Reply to this email or contact {support_email}.

— {BRAND_NAME}
"""


def purchase_confirmation_html(
    *,
    course_title: str,
    amount_display: str,
    session_id: str,
    my_courses_url: str,
    course_url: str,
    support_email: str,
) -> str:
    return f"""<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
  <h2 style="color: {BRAND_COLOR};">Purchase confirmed</h2>
  <p>Thank you for your purchase. Your course is ready to watch.</p>
  <table style="margin: 16px 0; border-collapse: collapse;">
    <tr><td style="padding: 4px 12px 4px 0;"><strong>Course</strong></td><td>{_e(course_title)}</td></tr>
    <tr><td style="padding: 4px 12px 4px 0;"><strong>Amount</strong></td><td>{_e(amount_display)}</td></tr>
    <tr><td style="padding: 4px 12px 4px 0;"><strong>Order</strong></td><td style="font-size: 12px;">{_e(session_id)}</td></tr>
  </table>
  <p>
    <a href="{_e(my_courses_url)}" style="display: inline-block; background: {BRAND_COLOR}; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Go to My Courses</a>
  </p>
  <p style="font-size: 14px; color: #555;">
    <a href="{_e(course_url)}">Open course page</a>
  </p>
  <p style="font-size: 13px; color: #777;">Questions? {_e(support_email)}</p>
</body>
</html>"""


# ---------------------------------------------------------------------------
# Welcome email (first purchase only)
# ---------------------------------------------------------------------------


def welcome_subject() -> str:
    return f"Welcome to {BRAND_NAME}"


def welcome_text(
    *,
    course_title: str,
    my_courses_url: str,
    support_email: str,
) -> str:
    return f"""Hi,

Welcome to {BRAND_NAME} — we're glad you're here.

You now have lifetime access to {course_title}. Sign in anytime to watch lessons, track your progress, and pick up where you left off.

Start learning: {my_courses_url}

Tips:
• Use the same email you signed up with to log in
• Visit My Courses to see everything you've purchased
• Mark lessons complete as you go to track progress

Questions? {support_email}

— {BRAND_NAME}
"""


def welcome_html(
    *,
    course_title: str,
    my_courses_url: str,
    support_email: str,
) -> str:
    return f"""<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
  <h2 style="color: {BRAND_COLOR};">Welcome to {BRAND_NAME}</h2>
  <p>We're excited to have you. Your account is active and <strong>{_e(course_title)}</strong> is ready.</p>
  <ul>
    <li>Lifetime access to your course</li>
    <li>Progress tracking across lessons</li>
    <li>Continue watching from any device</li>
  </ul>
  <p>
    <a href="{_e(my_courses_url)}" style="display: inline-block; background: {BRAND_COLOR}; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Go to My Courses</a>
  </p>
  <p style="font-size: 13px; color: #777;">Need help? {_e(support_email)}</p>
</body>
</html>"""


# ---------------------------------------------------------------------------
# Questionnaire readiness score (sent when someone completes the quiz)
# ---------------------------------------------------------------------------


def format_breakdown_text(breakdown: list[dict]) -> str:
    return "\n".join(
        f"• {row.get('prompt', 'Question')}: {row.get('selected_label', '')}"
        for row in breakdown
    )


def format_breakdown_html(breakdown: list[dict]) -> str:
    return "".join(
        f"<li><strong>{_e(row.get('prompt', 'Question'))}</strong><br/>"
        f"{_e(row.get('selected_label', ''))}</li>"
        for row in breakdown
    )


def questionnaire_score_subject(*, career_path_title: str) -> str:
    return f"Your NJ real estate career profile — {career_path_title}"


def questionnaire_score_text(
    *,
    name: str,
    readiness_label: str,
    career_path_title: str,
    roadmap: str,
    breakdown_lines: str,
    courses_url: str,
    support_email: str,
) -> str:
    return f"""Hi {name},

Thanks for completing the {BRAND_NAME} career assessment.

{career_path_title}
{readiness_label}

Your personalized roadmap:
{roadmap}

Your answers:
{breakdown_lines}

Next step — view our NJ pre-licensing courses: {courses_url}

Questions? {support_email}

— {BRAND_NAME}
{BRAND_TAGLINE}
"""


def questionnaire_score_html(
    *,
    name: str,
    readiness_label: str,
    career_path_title: str,
    roadmap: str,
    breakdown_html: str,
    courses_url: str,
    support_email: str,
) -> str:
    return f"""<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
  <h2 style="color: {BRAND_COLOR};">Your NJ Real Estate Career Profile</h2>
  <p>Hi {_e(name)},</p>
  <p style="font-size: 14px; color: #555;">{BRAND_TAGLINE}</p>
  <p style="font-size: 22px; font-weight: bold; color: {BRAND_COLOR};">{_e(career_path_title)}</p>
  <p><strong>{_e(readiness_label)}</strong></p>
  <p style="background: #f4f4f5; padding: 16px; border-radius: 8px;">{_e(roadmap)}</p>
  <ul>{breakdown_html}</ul>
  <p>
    <a href="{_e(courses_url)}" style="display: inline-block; background: {BRAND_COLOR}; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View NJ Pre-Licensing Courses</a>
  </p>
  <p style="font-size: 13px; color: #777;">Questions? {_e(support_email)}</p>
</body>
</html>"""
