from fastapi import APIRouter, Depends

from app.utils.auth import require_admin
from app.utils.database import purchases_table, courses_table, users_table

router = APIRouter()


@router.get("/admin/purchases")
def list_purchases_for_admin(user=Depends(require_admin)):
    """Return purchase records with course title and user email for the admin dashboard."""
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

        user_email = ""
        if user_id:
            ur = users_table.get_item(Key={"id": user_id})
            user_email = ur.get("Item", {}).get("email") or ""

        amount_cents = p.get("amount_total")
        if amount_cents is None:
            amount_dollars = 0.0
        else:
            amount_dollars = round(float(amount_cents) / 100.0, 2)

        result.append(
            {
                "id": p.get("id"),
                "course_id": course_id,
                "course_title": course_title,
                "user_id": user_id,
                "user_email": user_email,
                "amount": amount_dollars,
                "purchased_at": p.get("created_at", ""),
                "currency": p.get("currency", "usd"),
                "status": p.get("status", ""),
            }
        )

    result.sort(key=lambda x: x.get("purchased_at") or "", reverse=True)
    return result
