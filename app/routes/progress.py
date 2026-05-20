import logging

from fastapi import APIRouter, Depends

from app.models import schemas
from app.services import progress_service
from app.utils.auth import require_customer

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get(
    "/courses/{course_id}/progress",
    response_model=schemas.CourseProgressOut,
)
def get_course_progress(course_id: str, user=Depends(require_customer)):
    logger.info("GET progress course=%s user=%s", course_id, user["sub"])
    return progress_service.get_course_progress(user, course_id)


@router.post(
    "/courses/{course_id}/lessons/{lesson_id}/complete",
    response_model=schemas.CourseProgressOut,
)
def mark_lesson_complete(
    course_id: str,
    lesson_id: str,
    user=Depends(require_customer),
):
    logger.info(
        "POST mark complete course=%s lesson=%s user=%s",
        course_id,
        lesson_id,
        user["sub"],
    )
    return progress_service.mark_lesson_complete(user, course_id, lesson_id)


@router.put(
    "/courses/{course_id}/lessons/{lesson_id}/progress",
    response_model=schemas.CourseProgressOut,
)
def update_lesson_progress(
    course_id: str,
    lesson_id: str,
    body: schemas.LessonProgressUpdate,
    user=Depends(require_customer),
):
    logger.info(
        "PUT progress course=%s lesson=%s user=%s completed=%s",
        course_id,
        lesson_id,
        user["sub"],
        body.completed,
    )
    progress_service.upsert_lesson_progress(
        user,
        course_id,
        lesson_id,
        completed=body.completed,
        position_seconds=body.position_seconds,
    )
    return progress_service.summarize_course_progress(user["sub"], course_id)
