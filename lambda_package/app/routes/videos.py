from fastapi import APIRouter, Depends

from app.models import schemas
from app.services import lesson_service
from app.utils.auth import require_admin, require_customer

router = APIRouter()


@router.post("/lessons/{lesson_id}/video/upload-url", response_model=schemas.VideoUploadResponse)
def create_lesson_video_upload_url(
    lesson_id: str,
    request: schemas.LessonVideoUploadRequest,
    user=Depends(require_admin)
):
    return lesson_service.create_lesson_video_upload_url(lesson_id, request)


@router.put("/lessons/{lesson_id}/video")
def update_lesson_video(
    lesson_id: str,
    request: schemas.VideoUpdateRequest,
    user=Depends(require_admin)
):
    return lesson_service.update_lesson_video(lesson_id, request)


@router.get("/lessons/{lesson_id}/video-url")
def get_lesson_video_url(
    lesson_id: str,
    user=Depends(require_customer)
):
    return lesson_service.get_lesson_video_url(lesson_id, user)