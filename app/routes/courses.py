from fastapi import APIRouter,Depends
from uuid import uuid4

from app.utils.error import not_found
from app.models import schemas
from app.utils.database import users_table, courses_table, s3_client, VIDEO_BUCKET
from app.utils.auth import require_admin
router = APIRouter()

@router.post("/courses", response_model=schemas.CourseOut)
def create_course(course: schemas.CourseCreate, user=Depends(require_admin)):
    owner_response = users_table.get_item(Key={"id": course.owner_id})

    if "Item" not in owner_response:
        not_found(
            "OWNER_NOT_FOUND",
            "Owner not found",
            {"owner_id": course.owner_id}
        )

    item = {
        "id": str(uuid4()),
        "title": course.title,
        "description": course.description,
        "price_cents": course.price_cents,
        "owner_id": course.owner_id,
        "video_s3_key": course.video_s3_key,
    }

    courses_table.put_item(Item=item)
    return item


@router.get("/courses", response_model=list[schemas.CourseOut])
def list_courses():
    response = courses_table.scan()
    return response.get("Items", [])


