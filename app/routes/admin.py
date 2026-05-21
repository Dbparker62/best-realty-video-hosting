import logging

from fastapi import APIRouter, Depends

from app.models import schemas
from app.services import lesson_service
from app.utils.auth import require_admin
from app.utils.database import purchases_table, courses_table, users_table

logger = logging.getLogger(__name__)

router = APIRouter()


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

        user_email = (
            p.get("customer_email")
            or p.get("email")
            or ""
        )
        if not user_email and user_id:
            ur = users_table.get_item(Key={"id": user_id})
            user_email = ur.get("Item", {}).get("email") or ""

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
                "user_email": user_email or user_id or "—",
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

        entry = customers_by_id.setdefault(
            user_id,
            {
                "user_id": user_id,
                "email": p.get("customer_email") or "",
                "purchase_count": 0,
                "course_ids": set(),
            },
        )
        entry["purchase_count"] += 1
        course_id = p.get("course_id")
        if course_id:
            entry["course_ids"].add(course_id)
        if not entry["email"] and p.get("customer_email"):
            entry["email"] = p["customer_email"]

    customers = []
    for row in customers_by_id.values():
        course_ids = sorted(row.pop("course_ids", set()))
        customers.append(
            {
                **row,
                "email": row["email"] or row["user_id"],
                "course_ids": course_ids,
            }
        )
    customers.sort(key=lambda c: c.get("email") or "")

    return {
        "registered_users": registered,
        "customers": customers,
    }
