from fastapi import APIRouter, Depends

from app.models import schemas
from app.services.my_courses_service import get_my_courses
from app.utils.auth import require_customer

router = APIRouter()


@router.get("/my-courses", response_model=list[schemas.PurchasedCourseOut])
def list_my_courses(user=Depends(require_customer)):
    return get_my_courses(user["sub"])
