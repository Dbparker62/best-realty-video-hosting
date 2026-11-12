"""Home Sale Readiness quiz: how market-ready is a seller's home, plus town resale rules."""

import logging
from datetime import datetime, timezone
from uuid import uuid4

from botocore.exceptions import ClientError

from app.config import QUESTIONNAIRE_SEND_USER_EMAIL
from app.services.email_service import (
    send_home_sale_lead_notification_email,
    send_home_sale_score_email,
)
from app.services.nj_town_resale import SERVICE_AREA, town_resale_info
from app.utils.attribution import lead_source_label
from app.utils.database import questionnaire_submissions_table
from app.utils.dynamodb import sanitize_item
from app.utils.error import bad_request
from app.utils.lean import lean

logger = logging.getLogger(__name__)


def _opt(
    option_id: str,
    label: str,
    points: int | None = 10,
    *,
    priority: tuple[str, int] | None = None,
    negotiation: str | None = None,
) -> dict:
    """
    points: readiness points out of 10 (None = not scored, e.g. timing or a preference).
    priority: (to-do shown to the seller, importance 1-5; higher shows first).
    negotiation: line added to the negotiation plan.
    """
    return {
        "id": option_id,
        "label": label,
        "points": points,
        "priority": priority,
        "negotiation": negotiation,
    }


def _q(qid: str, order: int, prompt: str, options: list[dict], subtitle: str = "Choose one.") -> dict:
    return {
        "id": qid,
        "order_index": order,
        "prompt": prompt,
        "subtitle": subtitle,
        "allow_multiple": False,
        "options": options,
    }


QUESTIONS: list[dict] = [
    _q("hs-1", 1, "What's your home's first impression from the street?", [
        _opt("a", "Looks great, ready to show", 10),
        _opt("b", "Needs some touch-ups (paint, landscaping, front door)", 7, priority=("Curb appeal touch-ups", 2)),
        _opt("c", "Needs real work (siding, driveway, walkway)", 3, priority=("Exterior repairs", 4)),
    ]),
    _q("hs-2", 2, "How ready are your rooms for listing photos?", [
        _opt("a", "Ready now", 10),
        _opt("b", "A weekend of work", 7, priority=("Declutter", 3)),
        _opt("c", "Needs major decluttering or repairs", 3, priority=("Declutter and repairs", 4)),
    ]),
    _q("hs-3", 3, "How updated are your kitchen and baths?", [
        _opt("a", "Recently updated", 10),
        _opt("b", "Dated but in good shape", 7, priority=("Light kitchen/bath refresh", 1)),
        _opt("c", "Need major updates", 4, negotiation="Kitchen/baths: price in condition"),
    ]),
    _q("hs-4", 4, "Has your basement had any water or dampness?", [
        _opt("a", "Never, or no basement", 10),
        _opt("b", "Minor or already fixed", 7, priority=("Basement records", 4)),
        _opt("c", "Ongoing water or dampness", 2, priority=("Fix basement water", 5)),
    ]),
    _q("hs-5", 5, "Has your home ever had an oil tank?", [
        _opt("a", "No tank, or a tank sweep was done", 10),
        _opt("b", "Tank removed or closed, with paperwork", 9, priority=("Gather oil tank paperwork", 2)),
        _opt("c", "There's an active or buried tank", 3, priority=("Oil tank plan (sweep / removal)", 5)),
        _opt("d", "Not sure", 5, priority=("Oil tank sweep", 4)),
    ]),
    _q("hs-6", 6, "When was your roof last replaced?", [
        _opt("a", "New roof", 10),
        _opt("b", "In the last few years", 9),
        _opt("c", "More than a few years ago", 5),
        _opt("d", "Not sure", 5, priority=("Roof age / inspection", 2)),
    ]),
    _q("hs-7", 7, "How would you like to handle the roof?", [
        _opt("a", "Nothing needed, the roof is in good shape", None),
        _opt("b", "Repair or replace before listing", None, negotiation="Roof: repair/replace before listing"),
        _opt("c", "Offer a credit at closing", None, negotiation="Roof: credit at closing"),
        _opt("d", "Sell as-is and price it in", None, negotiation="Roof: as-is"),
    ]),
    _q("hs-8", 8, "When were your furnace and AC last replaced?", [
        _opt("a", "New", 10),
        _opt("b", "In the last few years", 9),
        _opt("c", "More than a few years ago", 6, priority=("HVAC service and inspection", 2)),
        _opt("d", "Not sure", 6, priority=("HVAC age / service check", 2)),
    ]),
    _q("hs-9", 9, "When was your water heater last replaced?", [
        _opt("a", "New", 10),
        _opt("b", "In the last few years", 9),
        _opt("c", "More than a few years ago", 6, priority=("Water heater check", 2)),
        _opt("d", "Not sure", 7, priority=("Water heater age check", 1)),
    ]),
    _q("hs-10", 10, "Have you tested for radon in the last 2 years?", [
        _opt("a", "Yes, results were low", 10),
        _opt("b", "Yes, and a mitigation system is installed", 10),
        _opt("c", "No", 6, priority=("Radon test", 5)),
        _opt("d", "Yes, it was high and there's no system yet", 3, priority=("Radon mitigation", 5)),
    ]),
    _q("hs-11", 11, "Has your home ever had any flooding?", [
        _opt("a", "No", 10),
        _opt("b", "Yes, once, and it was fully repaired", 6, priority=("Flood repair records for disclosure", 4)),
        _opt("c", "Yes, more than once", 3, priority=("Flood history disclosure", 5)),
    ]),
    _q("hs-12", 12, "Has any work been done without permits, like a finished basement, deck, or addition?", [
        _opt("a", "No", 10),
        _opt("b", "Yes", 4, priority=("Close out unpermitted work with the town", 5)),
        _opt("c", "Not sure", 7, priority=("Check permit history with the town", 3)),
    ]),
    _q("hs-13", 13, "Is your home part of an HOA or condo association?", [
        _opt("a", "No", None),
        _opt("b", "Yes", None, priority=("Request HOA/condo resale documents", 2)),
    ]),
    _q("hs-14", 14, "Do you have a pool?", [
        _opt("a", "No pool", 10),
        _opt("b", "Yes, in good working order", 9, priority=("Pool records and permits", 1)),
        _opt("c", "Yes, it needs work", 5, priority=("Pool repairs, or price them in", 3)),
    ]),
    _q("hs-15", 15, "When are you thinking of listing?", [
        _opt("a", "0–3 months", None),
        _opt("b", "3–6 months", None),
        _opt("c", "6–12 months", None),
        _opt("d", "Just exploring", None),
    ]),
]

TIMING_QUESTION_ID = "hs-15"


def list_questions() -> list[dict]:
    return [
        {
            "id": q["id"],
            "order_index": q["order_index"],
            "prompt": q["prompt"],
            "subtitle": q["subtitle"],
            "allow_multiple": False,
            "options": [{"id": o["id"], "label": o["label"]} for o in q["options"]],
        }
        for q in QUESTIONS
    ]


def readiness_label(score: int) -> str:
    if score >= 80:
        return "Market ready"
    if score >= 60:
        return "Almost ready"
    return "Needs prep"


SUMMARIES = {
    "Market ready": (
        "Your home is in strong shape to list. Knock out the priorities below and you'll be ready "
        "for photos, showings, and a confident asking price."
    ),
    "Almost ready": (
        "You're close. A few focused fixes and the right paperwork will help you avoid surprises "
        "at inspection and protect your sale price."
    ),
    "Needs prep": (
        "Your home needs some preparation before it hits the market. Starting now gives you time to "
        "fix what matters most, or to price the rest in with a clear plan."
    ),
}


def _roadmap(label: str, priorities: list[str], negotiation: list[str], timing: str, town: dict) -> str:
    parts = []
    if priorities:
        parts.append("Start with: " + "; ".join(priorities[:3]) + ".")
    if negotiation:
        parts.append("Negotiation plan: " + "; ".join(negotiation) + ".")
    parts.append(
        f"Town resale requirement: {town['requirement']} ({town['cost']}). Order it early. Many towns "
        "need the smoke/CO certificate before the resale inspection."
    )
    if timing in ("0–3 months",):
        parts.append("With a 0–3 month timeline, schedule inspections and the town certificate now.")
    elif timing:
        parts.append(f"Your timeline ({timing}) gives you room to handle the bigger items first.")
    return " ".join(parts)


def _score_answers(answers: list[dict]) -> dict:
    questions = {q["id"]: q for q in QUESTIONS}
    answered: set[str] = set()
    earned = 0
    possible = 0
    priorities: list[tuple[int, int, str]] = []  # (-weight, order, text)
    negotiation: list[str] = []
    breakdown: list[dict] = []
    timing = ""

    for answer in answers:
        qid = answer.get("question_id")
        option_ids = answer.get("option_ids") or []
        question = questions.get(qid)
        if not question:
            continue
        if len(option_ids) != 1:
            bad_request("INVALID_ANSWER", f"Please select one answer for: {question['prompt']}", {"question_id": qid})
        selected = next((o for o in question["options"] if o["id"] == option_ids[0]), None)
        if not selected:
            bad_request("INVALID_ANSWER", f"Invalid option for question {qid}", {"question_id": qid})

        if selected["points"] is not None:
            earned += selected["points"]
            possible += 10
        if selected["priority"]:
            text, weight = selected["priority"]
            priorities.append((-weight, question["order_index"], text))
        if selected["negotiation"]:
            negotiation.append(selected["negotiation"])
        if qid == TIMING_QUESTION_ID:
            timing = selected["label"]
        answered.add(qid)
        breakdown.append({"question_id": qid, "prompt": question["prompt"], "selected_label": selected["label"]})

    if len(answered) != len(questions):
        bad_request(
            "INCOMPLETE_ANSWERS",
            "Please answer every question",
            {"answered": len(answered), "required": len(questions)},
        )

    breakdown.sort(key=lambda b: questions[b["question_id"]]["order_index"])
    score = round(earned / possible * 100) if possible else 0
    label = readiness_label(score)
    ordered_priorities = [text for _, _, text in sorted(priorities)]

    return {
        "score": score,
        "label": label,
        "title": f"{score}% · {label}",
        "summary": SUMMARIES[label],
        "priorities": ordered_priorities,
        "negotiation": negotiation,
        "timing": timing,
        "breakdown": breakdown,
        "lean": lean(left_label="Needs prep", right_label="Market ready", left=100 - score, right=score),
    }


def preview_answers(answers: list[dict]) -> dict:
    """Score teaser before the contact form. Saves nothing, sends nothing."""
    scored = _score_answers(answers)
    top = scored["priorities"][:2]
    teaser = scored["summary"]
    if top:
        teaser += f" Your top priority: {top[0]}."
    return {
        "result": scored["label"],
        "result_title": scored["title"],
        "teaser": teaser + " Add your town to see its resale requirements.",
        "lean": scored["lean"],
    }


def submit(
    name: str,
    email: str,
    answers: list[dict],
    *,
    county: str,
    town: str,
    phone: str | None = None,
    attribution: dict | None = None,
) -> dict:
    name = (name or "").strip()
    email = (email or "").strip().lower()
    phone = (phone or "").strip() or None
    county = (county or "").strip()
    town = (town or "").strip()

    if not name:
        bad_request("NAME_REQUIRED", "Name is required")
    if not email or "@" not in email:
        bad_request("EMAIL_REQUIRED", "A valid email is required")
    if county not in SERVICE_AREA:
        bad_request("COUNTY_REQUIRED", "Please choose your county")
    if town not in SERVICE_AREA[county]:
        bad_request("TOWN_REQUIRED", "Please choose your town from the list")

    scored = _score_answers(answers)
    town_info = town_resale_info(county, town)
    roadmap = _roadmap(scored["label"], scored["priorities"], scored["negotiation"], scored["timing"], town_info)
    submission_id = str(uuid4())

    submission = {
        "id": submission_id,
        "quiz_type": "home_sale",
        "name": name,
        "email": email,
        "phone": phone,
        "county": county,
        "town": town,
        "answers": answers,
        "readiness_score": scored["score"],
        "readiness_label": scored["label"],
        "listing_timing": scored["timing"],
        "priorities": scored["priorities"],
        "negotiation_plan": scored["negotiation"],
        "town_requirement": town_info["requirement"],
        "attribution": attribution or None,
        "lead_source": lead_source_label(attribution),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    if questionnaire_submissions_table is not None:
        try:
            questionnaire_submissions_table.put_item(Item=sanitize_item(submission))
        except ClientError as exc:
            logger.warning(
                "Could not save home sale questionnaire submission: %s",
                exc.response.get("Error", {}).get("Message", exc),
            )

    report = {
        "name": name,
        "email": email,
        "phone": phone,
        "county": county,
        "town": town,
        "timing": scored["timing"],
        "score": scored["score"],
        "label": scored["label"],
        "summary": scored["summary"],
        "roadmap": roadmap,
        "town_requirement": town_info["requirement"],
        "town_cost": town_info["cost"],
        "town_tip": town_info["tip"],
        "town_known": town_info["known"] == "yes",
        "priorities": scored["priorities"],
        "negotiation": scored["negotiation"],
        "breakdown": scored["breakdown"],
    }

    lead_notification_sent = send_home_sale_lead_notification_email(report=report, attribution=attribution)
    email_sent = False
    if QUESTIONNAIRE_SEND_USER_EMAIL:
        email_sent = send_home_sale_score_email(report=report)

    logger.info(
        "Home sale questionnaire submit id=%s email=%s score=%s town=%s/%s source=%s lead_email_sent=%s user_email_sent=%s",
        submission_id, email, scored["score"], county, town, submission["lead_source"],
        lead_notification_sent, email_sent,
    )

    return {
        "submission_id": submission_id,
        "name": name,
        "readiness_score": scored["score"],
        "readiness_label": scored["label"],
        "title": scored["title"],
        "summary": scored["summary"],
        "roadmap": roadmap,
        "priorities": scored["priorities"],
        "negotiation_plan": scored["negotiation"],
        "listing_timing": scored["timing"],
        "town_requirement": town_info["requirement"],
        "town_cost": town_info["cost"],
        "lean": scored["lean"],
        "email_sent": email_sent,
        "lead_notification_sent": lead_notification_sent,
    }
