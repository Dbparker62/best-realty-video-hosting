"""Real estate readiness questionnaire — multiple choice scoring."""

import logging
from datetime import datetime, timezone
from uuid import uuid4

from botocore.exceptions import ClientError

from app.services.email_service import send_questionnaire_score_email
from app.utils.database import (
    questionnaire_questions_table,
    questionnaire_submissions_table,
)
from app.utils.dynamodb import sanitize_item
from app.utils.error import bad_request, not_found

logger = logging.getLogger(__name__)

DEFAULT_QUESTIONS: list[dict] = [
    {
        "id": "default-1",
        "order_index": 1,
        "prompt": "Why are you looking into real estate?",
        "is_active": True,
        "options": [
            {"id": "a", "label": "Career change — I want a full-time real estate career", "points": 10},
            {"id": "b", "label": "Supplemental income alongside my current job", "points": 7},
            {"id": "c", "label": "I'm curious and exploring my options", "points": 4},
            {"id": "d", "label": "Not sure yet — just researching", "points": 2},
        ],
    },
    {
        "id": "default-2",
        "order_index": 2,
        "prompt": "What are you looking to get out of real estate?",
        "is_active": True,
        "options": [
            {"id": "a", "label": "Financial freedom and schedule flexibility", "points": 10},
            {"id": "b", "label": "Building long-term wealth through property", "points": 9},
            {"id": "c", "label": "Helping people find their dream homes", "points": 8},
            {"id": "d", "label": "Quick profits / flipping only", "points": 5},
        ],
    },
    {
        "id": "default-3",
        "order_index": 3,
        "prompt": "How much time are you planning on spending each week on real estate?",
        "is_active": True,
        "options": [
            {"id": "a", "label": "20+ hours — treating it like a real career", "points": 10},
            {"id": "b", "label": "10–20 hours — serious part-time commitment", "points": 8},
            {"id": "c", "label": "5–10 hours while keeping another job", "points": 5},
            {"id": "d", "label": "Less than 5 hours per week", "points": 2},
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

    for key in ("prompt", "order_index", "is_active", "options"):
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


def readiness_label(percent: int) -> str:
    if percent >= 85:
        return "Excellent fit — You're highly ready to pursue a real estate career."
    if percent >= 70:
        return "Strong potential — Real estate aligns well with your goals and commitment."
    if percent >= 50:
        return "Moderate fit — With training and consistency, you could succeed in real estate."
    if percent >= 35:
        return "Early stage — Learn more about the industry before making a big commitment."
    return "Low readiness — Real estate may not be the right fit for your goals and schedule right now."


def _score_answers(answers: list[dict]) -> dict:
    questions = {q["id"]: q for q in list_all_questions_admin()}
    score = 0
    max_score = 0
    breakdown: list[dict] = []

    for question in questions.values():
        opts = question.get("options") or []
        if opts:
            max_score += max(int(o.get("points") or 0) for o in opts)

    for answer in answers:
        qid = answer.get("question_id")
        oid = answer.get("option_id")
        question = questions.get(qid)
        if not question:
            continue

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
        score += points
        breakdown.append(
            {
                "question_id": qid,
                "prompt": question.get("prompt"),
                "selected_label": selected.get("label"),
                "points": points,
            }
        )

    if len(breakdown) != len(questions):
        bad_request(
            "INCOMPLETE_ANSWERS",
            "Please answer every question",
            {"answered": len(breakdown), "required": len(questions)},
        )

    percent = round((score / max_score) * 100) if max_score > 0 else 0
    label = readiness_label(percent)

    return {
        "score": score,
        "max_score": max_score,
        "readiness_percent": percent,
        "readiness_label": label,
        "breakdown": breakdown,
    }


def submit_questionnaire(name: str, email: str, answers: list[dict]) -> dict:
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
        "name": name,
        "email": email,
        "answers": answers,
        "score": scored["score"],
        "max_score": scored["max_score"],
        "readiness_percent": scored["readiness_percent"],
        "readiness_label": scored["readiness_label"],
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

    email_sent = send_questionnaire_score_email(
        to_address=email,
        name=name,
        readiness_percent=scored["readiness_percent"],
        readiness_label=scored["readiness_label"],
        score=scored["score"],
        max_score=scored["max_score"],
        breakdown=scored["breakdown"],
    )

    return {
        "submission_id": submission_id,
        "name": name,
        "readiness_percent": scored["readiness_percent"],
        "readiness_label": scored["readiness_label"],
        "score": scored["score"],
        "max_score": scored["max_score"],
        "email_sent": email_sent,
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
