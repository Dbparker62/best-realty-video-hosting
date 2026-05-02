from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class UserCreate(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=1, max_length=100)
    is_admin: bool = False


class UserOut(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    is_admin: bool


class CourseCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    price_cents: int = Field(..., ge=0)
    owner_id: str = Field(..., min_length=1)
    is_published: bool = False


class CourseUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    price_cents: Optional[int] = Field(None, ge=0)
    is_published: Optional[bool] = None


class CourseOut(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    price_cents: int
    owner_id: str
    is_published: bool = False


class LessonCreate(BaseModel):
    course_id: str = Field(..., min_length=1, max_length=100)
    title: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    order_index: int = Field(..., ge=0)
    video_s3_key: Optional[str] = Field(None, min_length=1, max_length=500)
    duration_seconds: Optional[int] = Field(None, ge=0)
    is_preview: bool = False
    is_published: bool = False


class LessonUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    order_index: Optional[int] = Field(None, ge=0)
    video_s3_key: Optional[str] = Field(None, min_length=1, max_length=500)
    duration_seconds: Optional[int] = Field(None, ge=0)
    is_preview: Optional[bool] = None
    is_published: Optional[bool] = None


class LessonOut(BaseModel):
    id: str
    course_id: str
    title: str
    description: Optional[str] = None
    order_index: int
    video_s3_key: Optional[str] = None
    duration_seconds: Optional[int] = None
    is_preview: bool = False
    is_published: bool = False


class VideoUploadRequest(BaseModel):
    course_id: str = Field(..., min_length=1, max_length=100)
    filename: str = Field(..., min_length=1, max_length=255)
    content_type: str = Field(default="video/mp4", pattern="^video/mp4$")


class LessonVideoUploadRequest(BaseModel):
    lesson_id: str = Field(..., min_length=1, max_length=100)
    filename: str = Field(..., min_length=1, max_length=255)
    content_type: str = Field(default="video/mp4", pattern="^video/mp4$")

class VideoUploadResponse(BaseModel):
    upload_url: str
    video_s3_key: str


class VideoUpdateRequest(BaseModel):
    video_s3_key: str = Field(..., min_length=1, max_length=500)

class LessonVideoUploadRequest(BaseModel):
    lesson_id: str = Field(..., min_length=1, max_length=100)
    filename: str = Field(..., min_length=1, max_length=255)
    content_type: str = Field(default="video/mp4", pattern="^video/mp4$")