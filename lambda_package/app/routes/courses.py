from fastapi import APIRouter, Depends
from uuid import uuid4

from boto3.dynamodb.conditions import Attr

from app.utils.error import not_found
from app.models import schemas
from app.utils.database import users_table, courses_table, lessons_table
from app.utils.auth import require_admin

router = APIRouter()


@router.post("/courses", response_model=schemas.CourseOut)
def create_course(course: schemas.CourseCreate, admin=Depends(require_admin)):
    # Default owner = signed-in admin (Cognito sub). No DynamoDB users row required for self.
    requested = (course.owner_id or "").strip()
    owner_id = requested or admin["sub"]

    if owner_id != admin["sub"]:
        owner_response = users_table.get_item(Key={"id": owner_id})

        if "Item" not in owner_response:
            not_found(
                "OWNER_NOT_FOUND",
                "Owner not found",
                {"owner_id": owner_id},
            )

    item = {
        "id": str(uuid4()),
        "title": course.title,
        "description": course.description,
        "price_cents": course.price_cents,
        "owner_id": owner_id,
        "is_published": course.is_published,
    }

    courses_table.put_item(Item=item)
    return item


@router.put("/courses/{course_id}", response_model=schemas.CourseOut)
def update_course(
    course_id: str,
    course_update: schemas.CourseUpdate,
    user=Depends(require_admin),
):
    response = courses_table.get_item(Key={"id": course_id})

    if "Item" not in response:
        not_found(
            "COURSE_NOT_FOUND",
            "Course not found",
            {"course_id": course_id},
        )

    item = response["Item"]
    update_data = course_update.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        item[key] = value

    courses_table.put_item(Item=item)
    return item


@router.delete("/courses/{course_id}")
def delete_course(course_id: str, user=Depends(require_admin)):
    course_response = courses_table.get_item(Key={"id": course_id})

    if "Item" not in course_response:
        not_found(
            "COURSE_NOT_FOUND",
            "Course not found",
            {"course_id": course_id},
        )

    lesson_response = lessons_table.scan(
        FilterExpression=Attr("course_id").eq(course_id)
    )

    for lesson in lesson_response.get("Items", []):
        lessons_table.delete_item(Key={"id": lesson["id"]})

    courses_table.delete_item(Key={"id": course_id})

    return {"message": "Course deleted", "course_id": course_id}


@router.get("/courses", response_model=list[schemas.CourseOut])
def list_courses():
    response = courses_table.scan()
    return response.get("Items", [])


