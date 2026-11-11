"""Leadership questionnaire — Build a Team vs Broker of Record."""

import logging
from datetime import datetime, timezone
from uuid import uuid4

from botocore.exceptions import ClientError

from app.config import QUESTIONNAIRE_SEND_USER_EMAIL
from app.services.email_service import (
    send_leadership_lead_notification_email,
    send_leadership_score_email,
)
from app.utils.database import questionnaire_submissions_table
from app.utils.dynamodb import sanitize_item
from app.utils.attribution import lead_source_label
from app.utils.lean import lean
from app.utils.error import bad_request

logger = logging.getLogger(__name__)

OUTCOMES = ("build_team", "broker_of_record")

OUTCOME_TITLES = {
    "build_team": "Build a Real Estate Team",
    "broker_of_record": "Become a Broker of Record",
}


def _opt(option_id: str, label: str, *, team: int = 0, broker: int = 0) -> dict:
    return {
        "id": option_id,
        "label": label,
        "path_weights": {"team": team, "broker": broker},
    }


# Five single-answer questions (trimmed from ten). An odd count means Team vs
# Broker can never tie. IDs are kept from the original quiz.
QUESTIONS: list[dict] = [
    {
        "id": "lead-3",
        "order_index": 1,
        "prompt": "How would you prefer to spend more of your workday?",
        "subtitle": "Choose one.",
        "allow_multiple": False,
        "options": [
            _opt("a", "Generating leads and creating opportunities for my team", team=3),
            _opt("b", "Coaching agents and helping them improve their performance", team=3),
            _opt("c", "Reviewing transactions and overseeing brokerage operations", broker=3),
            _opt("d", "Managing compliance, policies, and office procedures", broker=3),
        ],
    },
    {
        "id": "lead-6",
        "order_index": 2,
        "prompt": "When helping another real estate agent, what would you rather help them with?",
        "subtitle": "Choose one.",
        "allow_multiple": False,
        "options": [
            _opt("a", "Finding more clients", team=3),
            _opt("b", "Improving their sales, follow-up, and negotiation skills", team=3),
            _opt("c", "Understanding real estate rules and regulations", broker=3),
            _opt("d", "Following brokerage procedures and properly handling transactions", broker=3),
        ],
    },
    {
        "id": "lead-7",
        "order_index": 3,
        "prompt": "What kind of business do you want to build?",
        "subtitle": "Choose one.",
        "allow_multiple": False,
        "options": [
            _opt("a", "A team of agents working together to generate more business", team=3),
            _opt("b", "A strong team brand known throughout my local market", team=3),
            _opt("c", "A professionally managed real estate brokerage", broker=3),
            _opt("d", "An organization where I oversee agents, policies, and operations", broker=3),
        ],
    },
    {
        "id": "lead-8",
        "order_index": 4,
        "prompt": "Which skill would you most like to develop?",
        "subtitle": "Choose one.",
        "allow_multiple": False,
        "options": [
            _opt("a", "Recruiting and motivating agents", team=3),
            _opt("b", "Marketing, lead generation, and team growth", team=3),
            _opt("c", "Brokerage management and regulatory compliance", broker=3),
            _opt("d", "Leadership at the brokerage level", broker=3),
        ],
    },
    {
        "id": "lead-10",
        "order_index": 5,
        "prompt": "Where do you see yourself in five years?",
        "subtitle": "Choose one.",
        "allow_multiple": False,
        "options": [
            _opt("a", "Leading a productive group of real estate agents", team=3),
            _opt("b", "Growing a well-known and successful real estate team", team=3),
            _opt("c", "Managing the operations of a real estate brokerage", broker=3),
            _opt("d", "Serving as a Broker of Record and leading a brokerage", broker=3),
        ],
    },
]


def list_questions() -> list[dict]:
    return [
        {
            "id": q["id"],
            "order_index": q["order_index"],
            "prompt": q["prompt"],
            "subtitle": q.get("subtitle") or "",
            "allow_multiple": False,
            "options": [
                {"id": o["id"], "label": o["label"]} for o in q.get("options") or []
            ],
        }
        for q in QUESTIONS
    ]


def _outcome_summary(outcome: str) -> str:
    if outcome == "build_team":
        return (
            "You're wired to build and lead a real estate team — recruiting agents, "
            "creating systems, and growing production together. Your next step is "
            "developing team leadership skills and a repeatable growth model."
        )
    return (
        "You're positioned to become a Broker of Record — overseeing brokerage "
        "operations, compliance, policies, and agent supervision. Your next step "
        "is deepening brokerage management and regulatory expertise."
    )


def _outcome_roadmap(outcome: str) -> str:
    if outcome == "build_team":
        return (
            "Focus on team building: recruit productive agents, implement lead-generation "
            "systems, coach performance, and establish a team brand in your market. "
            "Best School Of Real Estate can help you take the next step in your "
            "leadership journey."
        )
    return (
        "Focus on brokerage leadership: understand NJ regulatory requirements, "
        "develop office policies and procedures, supervise agent activity, and prepare "
        "for Broker of Record responsibilities. Best School Of Real Estate can guide "
        "your path to brokerage leadership."
    )


def _score_answers(answers: list[dict]) -> dict:
    questions = {q["id"]: q for q in QUESTIONS}
    answered_ids: set[str] = set()
    breakdown: list[dict] = []
    totals = {"team": 0, "broker": 0}

    for answer in answers:
        qid = answer.get("question_id")
        option_ids = answer.get("option_ids") or []
        if not option_ids and answer.get("option_id"):
            option_ids = [answer["option_id"]]

        question = questions.get(qid)
        if not question:
            continue

        if len(option_ids) != 1:
            bad_request(
                "INVALID_ANSWER",
                f"Please select one answer for: {question.get('prompt')}",
                {"question_id": qid},
            )

        oid = option_ids[0]
        selected = None
        for opt in question.get("options") or []:
            if opt.get("id") == oid:
                selected = opt
                break

        if not selected:
            bad_request(
                "INVALID_ANSWER",
                f"Invalid option for question {qid}",
                {"question_id": qid, "option_id": oid},
            )

        weights = selected.get("path_weights") or {}
        totals["team"] += int(weights.get("team") or 0)
        totals["broker"] += int(weights.get("broker") or 0)
        answered_ids.add(qid)
        breakdown.append(
            {
                "question_id": qid,
                "prompt": question.get("prompt"),
                "selected_label": selected.get("label"),
            }
        )

    if len(answered_ids) != len(questions):
        bad_request(
            "INCOMPLETE_ANSWERS",
            "Please answer every question",
            {"answered": len(answered_ids), "required": len(questions)},
        )

    # Five questions, one point each, so a tie can't happen; Team wins one anyway.
    outcome = "build_team" if totals["team"] >= totals["broker"] else "broker_of_record"

    title = OUTCOME_TITLES[outcome]
    summary = _outcome_summary(outcome)
    roadmap = _outcome_roadmap(outcome)

    return {
        "outcome": outcome,
        "outcome_title": title,
        "outcome_summary": summary,
        "roadmap": roadmap,
        "breakdown": breakdown,
        "path_totals": totals,
        "lean": lean(
            left_label="Build a Team",
            right_label="Broker of Record",
            left=totals["team"],
            right=totals["broker"],
        ),
    }


OUTCOME_TEASERS = {
    "build_team": (
        "You're wired to recruit, coach, and grow production with a team around you. "
        "Your full results include a step-by-step roadmap for building it."
    ),
    "broker_of_record": (
        "You're drawn to running the whole operation — compliance, policies, and agent "
        "supervision. Your full results include your roadmap to Broker of Record."
    ),
}


def preview_answers(answers: list[dict]) -> dict:
    """Score answers for the pre-email results teaser. Saves nothing, sends nothing."""
    scored = _score_answers(answers)
    outcome = scored["outcome"]
    return {
        "result": outcome,
        "result_title": scored["outcome_title"],
        "teaser": OUTCOME_TEASERS[outcome],
        "lean": scored["lean"],
    }


def submit(
    name: str,
    email: str,
    answers: list[dict],
    *,
    phone: str | None = None,
    attribution: dict | None = None,
) -> dict:
    name = (name or "").strip()
    email = (email or "").strip().lower()
    phone = (phone or "").strip() or None

    if not name:
        bad_request("NAME_REQUIRED", "Name is required")
    if not email or "@" not in email:
        bad_request("EMAIL_REQUIRED", "A valid email is required")

    scored = _score_answers(answers)
    submission_id = str(uuid4())
    now = datetime.now(timezone.utc).isoformat()

    submission = {
        "id": submission_id,
        "quiz_type": "leadership",
        "name": name,
        "email": email,
        "phone": phone,
        "answers": answers,
        "outcome": scored["outcome"],
        "outcome_title": scored["outcome_title"],
        "outcome_summary": scored["outcome_summary"],
        "roadmap": scored["roadmap"],
        "attribution": attribution or None,
        "lead_source": lead_source_label(attribution),
        "created_at": now,
    }

    if questionnaire_submissions_table is not None:
        try:
            questionnaire_submissions_table.put_item(Item=sanitize_item(submission))
        except ClientError as exc:
            logger.warning(
                "Could not save leadership questionnaire submission: %s",
                exc.response.get("Error", {}).get("Message", exc),
            )

    lead_notification_sent = send_leadership_lead_notification_email(
        lead_name=name,
        lead_email=email,
        lead_phone=phone,
        outcome_title=scored["outcome_title"],
        outcome_summary=scored["outcome_summary"],
        roadmap=scored["roadmap"],
        breakdown=scored["breakdown"],
        attribution=attribution,
    )

    email_sent = False
    if QUESTIONNAIRE_SEND_USER_EMAIL:
        email_sent = send_leadership_score_email(
            to_address=email,
            name=name,
            outcome_title=scored["outcome_title"],
            outcome_summary=scored["outcome_summary"],
            roadmap=scored["roadmap"],
            breakdown=scored["breakdown"],
        )
    else:
        logger.info(
            "Skipping leadership results email for %s (QUESTIONNAIRE_SEND_USER_EMAIL=false)",
            email,
        )

    logger.info(
        "Leadership questionnaire submit id=%s name=%r email=%s outcome=%s source=%s "
        "lead_email_sent=%s user_email_sent=%s",
        submission_id,
        name,
        email,
        scored["outcome"],
        submission["lead_source"],
        lead_notification_sent,
        email_sent,
    )

    return {
        "submission_id": submission_id,
        "name": name,
        "outcome": scored["outcome"],
        "outcome_title": scored["outcome_title"],
        "outcome_summary": scored["outcome_summary"],
        "roadmap": scored["roadmap"],
        "lean": scored["lean"],
        "email_sent": email_sent,
        "lead_notification_sent": lead_notification_sent,
    }
