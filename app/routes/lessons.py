from fastapi import APIRouter, Depends

from app.models import schemas
from app.utils.auth import require_admin, require_customer
from app.services import lesson_service

router = APIRouter()


@router.post("/courses/{course_id}/lessons", response_model=schemas.LessonOut)
def create_lesson(
    course_id: str,
    lesson: schemas.LessonCreate,
    user=Depends(require_admin)
):
    return lesson_service.create_lesson(course_id, lesson)


@router.get("/courses/{course_id}/lessons", response_model=list[schemas.LessonOut])
def list_lessons_for_course(
    course_id: str,
    user=Depends(require_customer)
):
    return lesson_service.list_lessons_for_course(course_id)


@router.get("/lessons/{lesson_id}", response_model=schemas.LessonOut)
def get_lesson(
    lesson_id: str,
    user=Depends(require_customer)
):
    return lesson_service.get_lesson(lesson_id)


@router.put("/lessons/{lesson_id}", response_model=schemas.LessonOut)
def update_lesson(
    lesson_id: str,
    lesson_update: schemas.LessonUpdate,
    user=Depends(require_admin)
):
    return lesson_service.update_lesson(lesson_id, lesson_update)


@router.delete("/lessons/{lesson_id}")
def delete_lesson(
    lesson_id: str,
    user=Depends(require_admin)
):
    return lesson_service.delete_lesson(lesson_id)

