import logging

from fastapi import APIRouter, Depends

from app.models import schemas
from app.services import lesson_service, questionnaire_service
from app.services.cognito_service import lookup_email_by_sub
from app.utils.auth import require_admin
from app.utils.database import purchases_table, courses_table, users_table
from app.utils.dynamodb import sanitize_item

logger = logging.getLogger(__name__)

router = APIRouter()


def _resolve_display_email(
    stored: str, user_id: str, *, purchase_row: dict | None = None
) -> str:
    """Sign-in email for admin tables — never show raw Cognito sub as email."""
    if stored and "@" in stored:
        return stored.strip()
    if user_id:
        looked_up = lookup_email_by_sub(user_id)
        if looked_up and "@" in looked_up:
            if purchase_row is not None and not purchase_row.get("customer_email"):
                purchase_row["customer_email"] = looked_up
                try:
                    purchases_table.put_item(Item=sanitize_item(purchase_row))
                except Exception as exc:
                    logger.warning(
                        "Could not backfill customer_email for user=%s: %s",
                        user_id,
                        exc,
                    )
            return looked_up
    return ""


@router.get("/admin/courses/{course_id}/lessons", response_model=list[schemas.LessonOut])
def admin_list_lessons(course_id: str, user=Depends(require_admin)):
    """List all lessons for a course (including drafts) — admin only."""
    return lesson_service.list_lessons_for_course(course_id)


@router.get("/admin/purchases")
def list_purchases_for_admin(user=Depends(require_admin)):
    """Return purchase records with course title and customer identifier."""
    scan = purchases_table.scan()
    items = scan.get("Items", [])
    result = []

    for p in items:
        course_id = p.get("course_id", "")
        user_id = p.get("user_id", "")

        course_title = ""
        if course_id:
            cr = courses_table.get_item(Key={"id": course_id})
            course_title = cr.get("Item", {}).get("title") or ""

        user_email = _resolve_display_email(
            p.get("customer_email") or p.get("email") or "",
            user_id,
            purchase_row=p,
        )

        amount_cents = p.get("amount_total")
        if amount_cents is None:
            amount_dollars = 0.0
        else:
            amount_dollars = round(float(amount_cents) / 100.0, 2)

        purchase_id = (
            p.get("stripe_session_id")
            or p.get("id")
            or f"{user_id}#{course_id}"
        )

        result.append(
            {
                "id": purchase_id,
                "course_id": course_id,
                "course_title": course_title,
                "user_id": user_id,
                "user_email": user_email or "—",
                "amount": amount_dollars,
                "purchased_at": p.get("created_at", ""),
                "currency": p.get("currency", "usd"),
                "status": p.get("status", ""),
            }
        )

    result.sort(key=lambda x: x.get("purchased_at") or "", reverse=True)
    return result


@router.get("/admin/users")
def list_users_for_admin(user=Depends(require_admin)):
    """
    Registered users (users table) plus unique customers from purchases (Cognito subs).
    """
    registered = users_table.scan().get("Items", [])

    customers_by_id: dict[str, dict] = {}
    for p in purchases_table.scan().get("Items", []):
        user_id = p.get("user_id")
        if not user_id:
            continue

        stored_email = p.get("customer_email") or ""
        entry = customers_by_id.setdefault(
            user_id,
            {
                "user_id": user_id,
                "email": "",
                "purchase_count": 0,
                "course_ids": set(),
            },
        )
        entry["purchase_count"] += 1
        course_id = p.get("course_id")
        if course_id:
            entry["course_ids"].add(course_id)
        resolved = _resolve_display_email(stored_email, user_id, purchase_row=p)
        if resolved:
            entry["email"] = resolved

    customers = []
    for row in customers_by_id.values():
        course_ids = sorted(row.pop("course_ids", set()))
        email = row.get("email") or _resolve_display_email("", row["user_id"])
        customers.append(
            {
                "user_id": row["user_id"],
                "email": email or "—",
                "purchase_count": row["purchase_count"],
                "course_ids": course_ids,
            }
        )
    customers.sort(key=lambda c: c.get("email") or "")

    return {
        "registered_users": registered,
        "customers": customers,
    }


@router.get(
    "/admin/questionnaire/questions",
    response_model=list[schemas.QuestionnaireQuestionAdminOut],
)
def admin_list_questionnaire_questions(user=Depends(require_admin)):
    return questionnaire_service.list_all_questions_admin()


@router.post(
    "/admin/questionnaire/questions",
    response_model=schemas.QuestionnaireQuestionAdminOut,
)
def admin_create_questionnaire_question(
    body: schemas.QuestionnaireQuestionCreate,
    user=Depends(require_admin),
):
    return questionnaire_service.create_question(
        body.model_dump(mode="json")
    )


@router.put(
    "/admin/questionnaire/questions/{question_id}",
    response_model=schemas.QuestionnaireQuestionAdminOut,
)
def admin_update_questionnaire_question(
    question_id: str,
    body: schemas.QuestionnaireQuestionUpdate,
    user=Depends(require_admin),
):
    return questionnaire_service.update_question(
        question_id,
        body.model_dump(exclude_unset=True, mode="json"),
    )


@router.delete("/admin/questionnaire/questions/{question_id}")
def admin_delete_questionnaire_question(
    question_id: str,
    user=Depends(require_admin),
):
    questionnaire_service.delete_question(question_id)
    return {"message": "Question deleted", "id": question_id}


@router.get("/admin/questionnaire/submissions")
def admin_list_questionnaire_submissions(user=Depends(require_admin)):
    return questionnaire_service.list_submissions_admin()
