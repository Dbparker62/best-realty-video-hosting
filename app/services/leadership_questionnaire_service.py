"""Leadership questionnaire — Build a Team vs Broker of Record."""

import logging
from datetime import datetime, timezone
from uuid import uuid4

from botocore.exceptions import ClientError

from app.services.email_service import send_leadership_lead_notification_email
from app.utils.database import questionnaire_submissions_table
from app.utils.dynamodb import sanitize_item
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


QUESTIONS: list[dict] = [
    {
        "id": "lead-1",
        "order_index": 1,
        "prompt": "What excites you most about the next stage of your real estate career?",
        "subtitle": "Choose the answer that best describes you.",
        "allow_multiple": False,
        "options": [
            _opt("a", "Recruiting agents and helping them increase their sales", team=3),
            _opt("b", "Building a recognizable team and brand", team=3),
            _opt("c", "Taking responsibility for brokerage operations and compliance", broker=3),
            _opt("d", "Leading an entire real estate office or brokerage", broker=3),
        ],
    },
    {
        "id": "lead-2",
        "order_index": 2,
        "prompt": "Which leadership responsibility sounds most appealing to you?",
        "subtitle": "Choose one.",
        "allow_multiple": False,
        "options": [
            _opt("a", "Coaching agents on lead generation and sales", team=3),
            _opt("b", "Creating systems that help a team close more transactions", team=3),
            _opt("c", "Supervising agents and ensuring proper business practices", broker=3),
            _opt("d", "Establishing policies and procedures for a brokerage", broker=3),
        ],
    },
    {
        "id": "lead-3",
        "order_index": 3,
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
        "id": "lead-4",
        "order_index": 4,
        "prompt": "Which type of success would make you feel most accomplished?",
        "subtitle": "Choose one.",
        "allow_multiple": False,
        "options": [
            _opt("a", "Seeing agents on my team increase their production", team=3),
            _opt("b", "Building one of the most successful real estate teams in my market", team=3),
            _opt("c", "Successfully overseeing the operations of a brokerage", broker=3),
            _opt("d", "Becoming the Broker of Record responsible for leading a brokerage", broker=3),
        ],
    },
    {
        "id": "lead-5",
        "order_index": 5,
        "prompt": "Which business challenge sounds most interesting?",
        "subtitle": "Choose one.",
        "allow_multiple": False,
        "options": [
            _opt("a", "Recruiting productive agents to join my team", team=3),
            _opt("b", "Developing better lead-generation and conversion systems", team=3),
            _opt("c", "Creating effective brokerage policies and procedures", broker=3),
            _opt("d", "Managing the responsibilities that come with supervising a brokerage", broker=3),
        ],
    },
    {
        "id": "lead-6",
        "order_index": 6,
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
        "order_index": 7,
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
        "order_index": 8,
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
        "id": "lead-9",
        "order_index": 9,
        "prompt": "What type of responsibility are you most comfortable taking on?",
        "subtitle": "Choose one.",
        "allow_multiple": False,
        "options": [
            _opt("a", "Helping team members reach their sales goals", team=3),
            _opt("b", "Managing team performance and lead distribution", team=3),
            _opt("c", "Supervising agents and brokerage activities", broker=3),
            _opt("d", "Taking responsibility for brokerage policies, compliance, and operations", broker=3),
        ],
    },
    {
        "id": "lead-10",
        "order_index": 10,
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

    if totals["team"] >= totals["broker"]:
        outcome = "build_team"
    else:
        outcome = "broker_of_record"

    if totals["team"] == totals["broker"]:
        outcome = "build_team"

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
    }


def submit(name: str, email: str, answers: list[dict]) -> dict:
    name = (name or "").strip()
    email = (email or "").strip().lower()

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
        "answers": answers,
        "outcome": scored["outcome"],
        "outcome_title": scored["outcome_title"],
        "outcome_summary": scored["outcome_summary"],
        "roadmap": scored["roadmap"],
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
        outcome_title=scored["outcome_title"],
        outcome_summary=scored["outcome_summary"],
        roadmap=scored["roadmap"],
        breakdown=scored["breakdown"],
    )

    logger.info(
        "Leadership questionnaire submit id=%s name=%r email=%s outcome=%s lead_email_sent=%s",
        submission_id,
        name,
        email,
        scored["outcome"],
        lead_notification_sent,
    )

    return {
        "submission_id": submission_id,
        "name": name,
        "outcome": scored["outcome"],
        "outcome_title": scored["outcome_title"],
        "outcome_summary": scored["outcome_summary"],
        "roadmap": scored["roadmap"],
        "lead_notification_sent": lead_notification_sent,
    }
