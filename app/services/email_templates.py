"""
Edit this file to change email wording, subject lines, and HTML styling.

Variables in {braces} are filled in automatically — keep the names as-is.
Placeholders available per template are listed in each function docstring.
"""

from html import escape


def _e(value: object) -> str:
    """Escape HTML in dynamic values."""
    return escape(str(value if value is not None else ""))


def _phone_html(phone: str | None) -> str:
    """Tap-to-call link for a lead's phone, or a placeholder when blank."""
    if not phone:
        return '<span style="color: #777;">Not provided</span>'
    digits = "".join(ch for ch in phone if ch.isdigit() or ch == "+")
    return f'<a href="tel:{_e(digits)}">{_e(phone)}</a>'


# ---------------------------------------------------------------------------
# Branding — change these once; used across all emails
# ---------------------------------------------------------------------------

BRAND_NAME = "Best School of Real Estate"
BRAND_TAGLINE = "New Jersey real estate pre-licensing education"
BRAND_COLOR = "#1f3b5c"  # navy (matches the website) for headings and buttons
BRAND_COLOR_DARK = "#0f2238"  # gradient end in the results-email header
BRAND_ACCENT = "#0f766e"  # teal accent stripe
EMAIL_BG = "#eef2f7"  # page background behind the email card


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


def format_breakdown_rows_html(breakdown: list[dict]) -> str:
    """Answer rows for the styled results emails (question small, answer bold)."""
    return "".join(
        f'<tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e9f0;">'
        f'<div style="font-size: 13px; color: #64748b; line-height: 1.4;">{_e(row.get("prompt", "Question"))}</div>'
        f'<div style="font-size: 15px; color: #0f172a; font-weight: bold; line-height: 1.5; padding-top: 2px;">'
        f'{_e(row.get("selected_label", ""))}</div></td></tr>'
        for row in breakdown
    )


def _results_email_html(
    *,
    heading: str,
    subheading: str,
    name: str,
    result_title: str,
    summary: str,
    roadmap: str,
    breakdown_rows_html: str,
    cta_url: str,
    cta_label: str,
    support_email: str,
    footer_note: str,
) -> str:
    """
    Shared layout for the quiz results emails sent to quiz takers.
    Table-based with inline styles so it renders the same in Gmail, Outlook and phones.
    """
    support_line = f" or write to {_e(support_email)}" if support_email else ""
    roadmap_html = _e(roadmap).replace("\n", "<br/>")
    font = "Arial, Helvetica, sans-serif"
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>{_e(heading)}</title>
</head>
<body style="margin: 0; padding: 0; background: {EMAIL_BG}; -webkit-text-size-adjust: 100%;">
  <!-- Inbox preview text -->
  <div style="display: none; max-height: 0; overflow: hidden; opacity: 0;">Your result: {_e(result_title)}. {_e(summary)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: {EMAIL_BG};">
    <tr>
      <td align="center" style="padding: 32px 12px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; font-family: {font};">

          <!-- Brand -->
          <tr>
            <td align="center" style="padding: 0 0 20px; font-size: 15px; font-weight: bold; color: {BRAND_COLOR}; letter-spacing: 0.3px;">
              {BRAND_NAME}
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(15, 34, 56, 0.08);">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">

                <!-- Hero -->
                <tr>
                  <td align="center" bgcolor="{BRAND_COLOR}" style="background: {BRAND_COLOR}; background-image: linear-gradient(135deg, {BRAND_COLOR} 0%, {BRAND_COLOR_DARK} 100%); padding: 36px 28px; border-radius: 16px 16px 0 0;">
                    <div style="font-size: 13px; color: #c7d7ea; text-transform: uppercase; letter-spacing: 1.5px; font-weight: bold;">{_e(heading)}</div>
                    <div style="font-size: 15px; color: #e2ebf5; padding-top: 6px;">{_e(subheading)}</div>
                    <div style="font-size: 28px; line-height: 1.25; color: #ffffff; font-weight: bold; padding-top: 18px;">{_e(result_title)}</div>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding: 32px 28px 8px; color: #0f172a; font-size: 15px; line-height: 1.6;">
                    <p style="margin: 0 0 12px;">Hi {_e(name)},</p>
                    <p style="margin: 0 0 24px; font-size: 17px; font-weight: bold; color: #0f172a;">{_e(summary)}</p>

                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background: #f1f5f9; border-left: 4px solid {BRAND_ACCENT}; border-radius: 8px; padding: 18px 20px; font-size: 15px; line-height: 1.65; color: #1e293b;">
                          {roadmap_html}
                        </td>
                      </tr>
                    </table>

                    <!-- CTA -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 28px auto;">
                      <tr>
                        <td align="center" bgcolor="{BRAND_COLOR}" style="border-radius: 10px; background: {BRAND_COLOR};">
                          <a href="{_e(cta_url)}" target="_blank" style="display: inline-block; padding: 14px 32px; font-family: {font}; font-size: 16px; font-weight: bold; color: #ffffff; text-decoration: none; border-radius: 10px;">{_e(cta_label)} &rarr;</a>
                        </td>
                      </tr>
                    </table>

                    <div style="font-size: 13px; font-weight: bold; color: #64748b; text-transform: uppercase; letter-spacing: 1px; padding-top: 4px;">Your answers</div>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 4px;">
                      {breakdown_rows_html}
                    </table>
                  </td>
                </tr>

                <!-- Sign-off -->
                <tr>
                  <td style="padding: 20px 28px 32px; font-size: 14px; line-height: 1.6; color: #475569;">
                    Questions? Just reply to this email{support_line}.
                    <div style="padding-top: 12px; color: #0f172a; font-weight: bold;">&mdash; {BRAND_NAME}</div>
                    <div style="font-size: 13px; color: #64748b;">{BRAND_TAGLINE}</div>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 20px 16px 0; font-size: 12px; line-height: 1.5; color: #94a3b8;">
              {_e(footer_note)}
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


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

Questions? Just reply to this email{f" or write to {support_email}" if support_email else ""}.

— {BRAND_NAME}
{BRAND_TAGLINE}

You're receiving this because you took our career quiz and asked for your results.
"""


def questionnaire_score_html(
    *,
    name: str,
    readiness_label: str,
    career_path_title: str,
    roadmap: str,
    breakdown_rows_html: str,
    courses_url: str,
    support_email: str,
) -> str:
    return _results_email_html(
        heading="Your NJ Real Estate Career Profile",
        subheading=BRAND_TAGLINE,
        name=name,
        result_title=career_path_title,
        summary=readiness_label,
        roadmap=roadmap,
        breakdown_rows_html=breakdown_rows_html,
        cta_url=courses_url,
        cta_label="View NJ Pre-Licensing Courses",
        support_email=support_email,
        footer_note="You're receiving this because you took our career quiz and asked for your results.",
    )


# ---------------------------------------------------------------------------
# Questionnaire lead notification (sent to staff when someone completes quiz)
# ---------------------------------------------------------------------------


def questionnaire_lead_subject(*, name: str) -> str:
    return f"New career quiz lead: {name}"


def questionnaire_lead_text(
    *,
    name: str,
    email: str,
    phone: str | None,
    lead_source: str = "Direct / unknown",
    career_path_title: str,
    readiness_label: str,
    roadmap: str,
    breakdown_lines: str,
) -> str:
    return f"""A new lead completed the NJ real estate career quiz.

Name: {name}
Email: {email}
Phone: {phone or 'Not provided'}
Came from: {lead_source}
(Reply to this email to reach them directly.)

Career path: {career_path_title}
Summary: {readiness_label}

Roadmap shown to the lead:
{roadmap}

Their answers:
{breakdown_lines}
"""


def questionnaire_lead_html(
    *,
    name: str,
    email: str,
    phone: str | None,
    lead_source: str = "Direct / unknown",
    career_path_title: str,
    readiness_label: str,
    roadmap: str,
    breakdown_html: str,
) -> str:
    return f"""<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
  <h2 style="color: {BRAND_COLOR};">New Career Quiz Lead</h2>
  <table style="margin: 16px 0; border-collapse: collapse;">
    <tr><td style="padding: 4px 12px 4px 0;"><strong>Name</strong></td><td>{_e(name)}</td></tr>
    <tr><td style="padding: 4px 12px 4px 0;"><strong>Email</strong></td><td><a href="mailto:{_e(email)}">{_e(email)}</a></td></tr>
    <tr><td style="padding: 4px 12px 4px 0;"><strong>Phone</strong></td><td>{_phone_html(phone)}</td></tr>
    <tr><td style="padding: 4px 12px 4px 0;"><strong>Came from</strong></td><td>{_e(lead_source)}</td></tr>
    <tr><td style="padding: 4px 12px 4px 0;"><strong>Career path</strong></td><td>{_e(career_path_title)}</td></tr>
  </table>
  <p><strong>{_e(readiness_label)}</strong></p>
  <p style="background: #f4f4f5; padding: 16px; border-radius: 8px;">{_e(roadmap)}</p>
  <h3 style="font-size: 16px;">Their answers</h3>
  <ul>{breakdown_html}</ul>
  <p style="font-size: 13px; color: #777;">Reply to this email to contact {_e(name)}.</p>
</body>
</html>"""


# ---------------------------------------------------------------------------
# Leadership questionnaire lead (Team vs Broker of Record)
# ---------------------------------------------------------------------------


def leadership_lead_subject(*, name: str) -> str:
    return f"New leadership quiz lead: {name}"


def leadership_lead_text(
    *,
    name: str,
    email: str,
    phone: str | None,
    lead_source: str = "Direct / unknown",
    outcome_title: str,
    outcome_summary: str,
    roadmap: str,
    breakdown_lines: str,
) -> str:
    return f"""A new lead completed the Team vs Broker of Record leadership quiz.

Name: {name}
Email: {email}
Phone: {phone or 'Not provided'}
Came from: {lead_source}
(Reply to this email to reach them directly.)

Recommended path: {outcome_title}
Summary: {outcome_summary}

Roadmap shown to the lead:
{roadmap}

Their answers:
{breakdown_lines}
"""


def leadership_lead_html(
    *,
    name: str,
    email: str,
    phone: str | None,
    lead_source: str = "Direct / unknown",
    outcome_title: str,
    outcome_summary: str,
    roadmap: str,
    breakdown_html: str,
) -> str:
    return f"""<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
  <h2 style="color: {BRAND_COLOR};">New Leadership Quiz Lead</h2>
  <p style="font-size: 14px; color: #555;">Team vs Broker of Record assessment</p>
  <table style="margin: 16px 0; border-collapse: collapse;">
    <tr><td style="padding: 4px 12px 4px 0;"><strong>Name</strong></td><td>{_e(name)}</td></tr>
    <tr><td style="padding: 4px 12px 4px 0;"><strong>Email</strong></td><td><a href="mailto:{_e(email)}">{_e(email)}</a></td></tr>
    <tr><td style="padding: 4px 12px 4px 0;"><strong>Phone</strong></td><td>{_phone_html(phone)}</td></tr>
    <tr><td style="padding: 4px 12px 4px 0;"><strong>Came from</strong></td><td>{_e(lead_source)}</td></tr>
    <tr><td style="padding: 4px 12px 4px 0;"><strong>Outcome</strong></td><td>{_e(outcome_title)}</td></tr>
  </table>
  <p><strong>{_e(outcome_summary)}</strong></p>
  <p style="background: #f4f4f5; padding: 16px; border-radius: 8px;">{_e(roadmap)}</p>
  <h3 style="font-size: 16px;">Their answers</h3>
  <ul>{breakdown_html}</ul>
  <p style="font-size: 13px; color: #777;">Reply to this email to contact {_e(name)}.</p>
</body>
</html>"""


# ---------------------------------------------------------------------------
# Leadership results (sent to the person who took the Team vs Broker quiz)
# ---------------------------------------------------------------------------


def leadership_score_subject(*, outcome_title: str) -> str:
    return f"Your leadership results — {outcome_title}"


def leadership_score_text(
    *,
    name: str,
    outcome_title: str,
    outcome_summary: str,
    roadmap: str,
    breakdown_lines: str,
    school_url: str,
    support_email: str,
) -> str:
    return f"""Hi {name},

Thanks for taking the {BRAND_NAME} Team or Broker of Record assessment.

Your recommended path: {outcome_title}
{outcome_summary}

Your next steps:
{roadmap}

Your answers:
{breakdown_lines}

Learn more: {school_url}

Questions? Just reply to this email{f" or write to {support_email}" if support_email else ""}.

— {BRAND_NAME}
{BRAND_TAGLINE}
"""


def leadership_score_html(
    *,
    name: str,
    outcome_title: str,
    outcome_summary: str,
    roadmap: str,
    breakdown_rows_html: str,
    school_url: str,
    support_email: str,
) -> str:
    return _results_email_html(
        heading="Your Leadership Results",
        subheading="Team or Broker of Record assessment",
        name=name,
        result_title=outcome_title,
        summary=outcome_summary,
        roadmap=roadmap,
        breakdown_rows_html=breakdown_rows_html,
        cta_url=school_url,
        cta_label=f"Visit {BRAND_NAME}",
        support_email=support_email,
        footer_note="You're receiving this because you took the assessment and asked for your results.",
    )
