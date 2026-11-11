"""Real estate readiness questionnaire — NJ pre-licensing career paths."""

import logging
from datetime import datetime, timezone
from uuid import uuid4

from botocore.exceptions import ClientError

from app.config import (
    QUESTIONNAIRE_SEND_USER_EMAIL,
)
from app.services.email_service import (
    send_questionnaire_lead_notification_email,
    send_questionnaire_score_email,
)
from app.utils.database import (
    questionnaire_questions_table,
    questionnaire_submissions_table,
)
from app.utils.dynamodb import sanitize_item
from app.utils.attribution import lead_source_label
from app.utils.error import bad_request, not_found

logger = logging.getLogger(__name__)

CAREER_PATHS = ("full_time", "part_time", "referral")

PATH_TITLES = {
    "full_time": "Full-Time Career Path",
    "part_time": "Part-Time Career Path",
    "referral": "Referral & Explore Path",
}


def _opt(
    option_id: str,
    label: str,
    *,
    points: int = 5,
    full_time: int = 0,
    part_time: int = 0,
    referral: int = 0,
) -> dict:
    return {
        "id": option_id,
        "label": label,
        "points": points,
        "path_weights": {
            "full_time": full_time,
            "part_time": part_time,
            "referral": referral,
        },
    }


# Four single-answer questions (trimmed from seven to raise completion rate).
# IDs are kept from the original quiz so older submissions still line up.
DEFAULT_QUESTIONS: list[dict] = [
    {
        "id": "nj-3",
        "order_index": 1,
        "prompt": "How does your current situation look?",
        "subtitle": "Choose the one that fits best.",
        "allow_multiple": False,
        "is_active": True,
        "options": [
            _opt("a", "Working full-time, I'd start on the side", points=7, part_time=5),
            _opt("b", "Between jobs / I have time now", points=9, full_time=5),
            _opt("c", "Part-time or flexible hours", points=7, part_time=4),
            _opt("d", "Retired or I have other income", points=6, referral=4, part_time=2),
        ],
    },
    {
        "id": "nj-6",
        "order_index": 2,
        "prompt": "Once you're licensed, what's your #1 goal?",
        "subtitle": "Choose the one that matters most — we'll help you build toward it.",
        "allow_multiple": False,
        "is_active": True,
        "options": [
            _opt("a", "Replace my current full-time income", points=10, full_time=5),
            _opt("b", "Earn solid extra income on the side", points=8, part_time=5),
            _opt("c", "Build a long-term career in real estate", points=9, full_time=4),
            _opt("d", "Help people find the right home", points=7, referral=2, part_time=2, full_time=1),
        ],
    },
    {
        "id": "nj-7",
        "order_index": 3,
        "prompt": "Ideally, when would you want to be licensed and working?",
        "subtitle": "Choose one.",
        "allow_multiple": False,
        "is_active": True,
        "options": [
            _opt("a", "As soon as possible (1–3 months)", points=10, full_time=4, part_time=2),
            _opt("b", "Sometime this year", points=8, full_time=2, part_time=3),
            _opt("c", "Within the next year", points=6, part_time=2, referral=2),
            _opt("d", "Just gathering info for now", points=4, referral=4),
        ],
    },
    {
        "id": "nj-4",
        "order_index": 4,
        "prompt": "New Jersey requires a 75-hour pre-licensing course before the state exam. How would you like to take it?",
        "subtitle": "This tells us which class format fits you best.",
        "allow_multiple": False,
        "is_active": True,
        "options": [
            _opt("a", "Live online via Zoom with an instructor", points=8),
            _opt("b", "Self-paced online, on my own time", points=8, part_time=1),
            _opt("c", "Either could work — I'm flexible", points=7, full_time=1, part_time=1),
        ],
    },
]


def _table_available() -> bool:
    return questionnaire_questions_table is not None


def _load_questions_from_db() -> list[dict] | None:
    if not _table_available():
        return None
    try:
        response = questionnaire_questions_table.scan()
        items = response.get("Items", [])
        return items if items else None
    except ClientError as exc:
        logger.warning(
            "Questionnaire questions table unavailable: %s",
            exc.response.get("Error", {}).get("Message", exc),
        )
        return None


def list_active_questions() -> list[dict]:
    items = _load_questions_from_db()
    if not items:
        items = DEFAULT_QUESTIONS

    active = [q for q in items if q.get("is_active", True)]
    active.sort(key=lambda q: int(q.get("order_index") or 0))
    return [_public_question(q) for q in active]


def list_all_questions_admin() -> list[dict]:
    items = _load_questions_from_db()
    if not items:
        items = DEFAULT_QUESTIONS
    items.sort(key=lambda q: int(q.get("order_index") or 0))
    return items


def _public_question(question: dict) -> dict:
    return {
        "id": question["id"],
        "order_index": int(question.get("order_index") or 0),
        "prompt": question.get("prompt") or "",
        "subtitle": question.get("subtitle") or "",
        "allow_multiple": bool(question.get("allow_multiple", False)),
        "options": [
            {"id": o["id"], "label": o.get("label") or ""}
            for o in (question.get("options") or [])
        ],
    }


def get_question_by_id(question_id: str) -> dict | None:
    for q in list_all_questions_admin():
        if q.get("id") == question_id:
            return q
    return None


def create_question(data: dict) -> dict:
    if not _table_available():
        bad_request(
            "QUESTIONNAIRE_TABLE_MISSING",
            "Set QUESTIONNAIRE_QUESTIONS_TABLE on the API to save custom questions",
        )

    item = {
        "id": str(uuid4()),
        "order_index": int(data.get("order_index") or 1),
        "prompt": (data.get("prompt") or "").strip(),
        "subtitle": (data.get("subtitle") or "").strip(),
        "allow_multiple": bool(data.get("allow_multiple", False)),
        "is_active": bool(data.get("is_active", True)),
        "options": data.get("options") or [],
    }
    if not item["prompt"]:
        bad_request("INVALID_QUESTION", "Question prompt is required")
    if len(item["options"]) < 2:
        bad_request("INVALID_QUESTION", "Each question needs at least 2 options")

    questionnaire_questions_table.put_item(Item=sanitize_item(item))
    return item


def update_question(question_id: str, data: dict) -> dict:
    existing = get_question_by_id(question_id)
    if not existing:
        not_found("QUESTION_NOT_FOUND", "Question not found", {"id": question_id})

    if not _table_available():
        bad_request(
            "QUESTIONNAIRE_TABLE_MISSING",
            "Set QUESTIONNAIRE_QUESTIONS_TABLE on the API to edit questions",
        )

    for key in ("prompt", "subtitle", "order_index", "is_active", "allow_multiple", "options"):
        if key in data and data[key] is not None:
            existing[key] = data[key]

    questionnaire_questions_table.put_item(Item=sanitize_item(existing))
    return existing


def delete_question(question_id: str) -> None:
    if not _table_available():
        bad_request(
            "QUESTIONNAIRE_TABLE_MISSING",
            "Set QUESTIONNAIRE_QUESTIONS_TABLE on the API to delete questions",
        )
    questionnaire_questions_table.delete_item(Key={"id": question_id})


def _path_weights(option: dict) -> dict[str, int]:
    weights = option.get("path_weights") or {}
    return {
        "full_time": int(weights.get("full_time") or 0),
        "part_time": int(weights.get("part_time") or 0),
        "referral": int(weights.get("referral") or 0),
    }


def _resolve_career_path(path_totals: dict[str, int]) -> str:
    if not any(path_totals.values()):
        return "part_time"

    best_score = max(path_totals.values())
    tied = [p for p in CAREER_PATHS if path_totals[p] == best_score]

    if len(tied) == 1:
        return tied[0]

    priority = ("full_time", "part_time", "referral")
    for path in priority:
        if path in tied:
            return path
    return "part_time"


def career_path_roadmap(path: str) -> str:
    license_steps = (
        "Complete New Jersey's 75-hour pre-licensing course, pass the 110-question "
        "state exam (70% to pass), and submit your license application."
    )

    if path == "full_time":
        return (
            f"You're positioned for a full-time real estate career in New Jersey. "
            f"{license_steps} With focused study, many students are licensed within "
            "1–3 months. Our live Zoom or self-paced course gives you the structure "
            "to go all-in and start building your business right away."
        )
    if path == "referral":
        return (
            f"You're a great fit to explore real estate through referrals and learning "
            f"at your own pace — while still working toward your license. "
            f"{license_steps} Start by referring friends and family, learn the business "
            "hands-on, and scale up when you're ready."
        )
    return (
        f"You're an ideal candidate for getting licensed part-time while keeping your "
        f"current job. {license_steps} Many successful NJ agents started on the side — "
        "evenings and weekends — then grew into full-time careers once their pipeline "
        "was established."
    )


def career_path_label(path: str) -> str:
    if path == "full_time":
        return (
            "Your next step is clear: enroll in our NJ pre-licensing course and pursue "
            "your license full-time. You have the motivation and timeline to make real "
            "estate your primary career."
        )
    if path == "referral":
        return (
            "You can enter real estate thoughtfully — get licensed, start with referrals, "
            "and build confidence before going full-time. New Jersey requires the same "
            "75-hour course and state exam either way, and we're here to guide you."
        )
    return (
        "Getting your New Jersey license part-time is one of the smartest paths in — "
        "keep your income steady while you learn, pass the state exam, and grow your "
        "real estate business on your schedule."
    )


def readiness_label(career_path: str) -> str:
    return career_path_label(career_path)


def _score_answers(answers: list[dict]) -> dict:
    questions = {q["id"]: q for q in list_all_questions_admin()}
    answered_ids: set[str] = set()
    score = 0
    max_score = 0
    breakdown: list[dict] = []
    path_totals = {p: 0 for p in CAREER_PATHS}

    for question in questions.values():
        points = [int(o.get("points") or 0) for o in (question.get("options") or [])]
        if points:
            # Multi-select can earn every option; single-select only the best one.
            max_score += sum(points) if question.get("allow_multiple") else max(points)

    for answer in answers:
        qid = answer.get("question_id")
        option_ids = answer.get("option_ids") or []
        if not option_ids and answer.get("option_id"):
            option_ids = [answer["option_id"]]

        question = questions.get(qid)
        if not question:
            continue

        if not option_ids:
            bad_request(
                "INCOMPLETE_ANSWERS",
                f"Please select at least one answer for: {question.get('prompt')}",
                {"question_id": qid},
            )

        if len(option_ids) > 1 and not question.get("allow_multiple"):
            bad_request(
                "INVALID_ANSWER",
                f"Please select only one answer for: {question.get('prompt')}",
                {"question_id": qid},
            )

        selected_labels: list[str] = []
        question_points = 0

        for oid in option_ids:
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

            points = int(selected.get("points") or 0)
            question_points += points
            selected_labels.append(str(selected.get("label") or ""))

            weights = _path_weights(selected)
            for path in CAREER_PATHS:
                path_totals[path] += weights[path]

        score += question_points
        answered_ids.add(qid)
        breakdown.append(
            {
                "question_id": qid,
                "prompt": question.get("prompt"),
                "selected_label": "; ".join(selected_labels),
                "points": question_points,
            }
        )

    if len(answered_ids) != len(questions):
        bad_request(
            "INCOMPLETE_ANSWERS",
            "Please answer every question",
            {"answered": len(answered_ids), "required": len(questions)},
        )

    career_path = _resolve_career_path(path_totals)
    roadmap = career_path_roadmap(career_path)
    label = career_path_label(career_path)

    return {
        "score": score,
        "max_score": max_score,
        "readiness_label": label,
        "career_path": career_path,
        "career_path_title": PATH_TITLES[career_path],
        "roadmap": roadmap,
        "breakdown": breakdown,
        "path_totals": path_totals,
    }


PATH_TEASERS = {
    "full_time": (
        "You have the motivation and timeline to make real estate your main career. "
        "Your full roadmap shows exactly how to get licensed in New Jersey and start fast."
    ),
    "part_time": (
        "You can get licensed while keeping your current income — the way many successful "
        "NJ agents started. Your full roadmap lays out the steps on your schedule."
    ),
    "referral": (
        "You can step into real estate at your own pace and still earn. Your full roadmap "
        "shows how to get licensed and start with referrals."
    ),
}


def preview_answers(answers: list[dict]) -> dict:
    """Score answers for the pre-email results teaser. Saves nothing, sends nothing."""
    scored = _score_answers(answers)
    path = scored["career_path"]
    return {
        "result": path,
        "result_title": scored["career_path_title"],
        "teaser": PATH_TEASERS[path],
    }


def submit_questionnaire(
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
        "name": name,
        "email": email,
        "phone": phone,
        "answers": answers,
        "score": scored["score"],
        "max_score": scored["max_score"],
        "readiness_label": scored["readiness_label"],
        "career_path": scored["career_path"],
        "career_path_title": scored["career_path_title"],
        "roadmap": scored["roadmap"],
        "attribution": attribution or None,
        "lead_source": lead_source_label(attribution),
        "created_at": now,
    }

    if questionnaire_submissions_table is not None:
        try:
            questionnaire_submissions_table.put_item(
                Item=sanitize_item(submission)
            )
        except ClientError as exc:
            logger.warning(
                "Could not save questionnaire submission: %s",
                exc.response.get("Error", {}).get("Message", exc),
            )

    lead_notification_sent = send_questionnaire_lead_notification_email(
        lead_name=name,
        lead_email=email,
        lead_phone=phone,
        readiness_label=scored["readiness_label"],
        breakdown=scored["breakdown"],
        career_path_title=scored["career_path_title"],
        roadmap=scored["roadmap"],
        attribution=attribution,
    )

    email_sent = False
    if QUESTIONNAIRE_SEND_USER_EMAIL:
        email_sent = send_questionnaire_score_email(
            to_address=email,
            name=name,
            readiness_label=scored["readiness_label"],
            score=scored["score"],
            max_score=scored["max_score"],
            breakdown=scored["breakdown"],
            career_path_title=scored["career_path_title"],
            roadmap=scored["roadmap"],
        )
    else:
        logger.info(
            "Skipping quiz taker results email for %s (QUESTIONNAIRE_SEND_USER_EMAIL=false)",
            email,
        )

    logger.info(
        "Questionnaire submit id=%s name=%r email=%s career_path=%s source=%s "
        "lead_email_sent=%s user_email_sent=%s",
        submission_id,
        name,
        email,
        scored["career_path"],
        submission["lead_source"],
        lead_notification_sent,
        email_sent,
    )

    return {
        "submission_id": submission_id,
        "name": name,
        "readiness_label": scored["readiness_label"],
        "career_path": scored["career_path"],
        "career_path_title": scored["career_path_title"],
        "roadmap": scored["roadmap"],
        "score": scored["score"],
        "max_score": scored["max_score"],
        "email_sent": email_sent,
        "lead_notification_sent": lead_notification_sent,
    }


def list_submissions_admin() -> list[dict]:
    if questionnaire_submissions_table is None:
        return []
    try:
        response = questionnaire_submissions_table.scan()
        items = response.get("Items", [])
        items.sort(key=lambda x: x.get("created_at") or "", reverse=True)
        return items
    except ClientError:
        return []
