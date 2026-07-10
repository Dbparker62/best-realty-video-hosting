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
    owner_id: Optional[str] = Field(
        default=None,
        description="If omitted, the API sets owner to the authenticated admin's Cognito sub.",
    )
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


class CourseAccessOut(BaseModel):
    has_access: bool
    course_id: str


class CheckoutConfirmRequest(BaseModel):
    session_id: str = Field(..., min_length=1)


class CheckoutConfirmOut(BaseModel):
    course_id: str
    has_access: bool
    already_recorded: bool = False


class PurchasedCourseOut(CourseOut):
    progress: int = 0
    completed_lessons: int = 0
    total_lessons: int = 0
    last_watched_lesson_id: Optional[str] = None


class LessonProgressUpdate(BaseModel):
    completed: Optional[bool] = None
    position_seconds: Optional[int] = Field(None, ge=0)


class LessonProgressOut(BaseModel):
    lesson_id: str
    completed: bool = False
    position_seconds: Optional[int] = None
    last_watched_at: Optional[str] = None


class CourseLessonProgressOut(BaseModel):
    lesson_id: str
    completed: bool = False
    position_seconds: Optional[int] = None
    last_watched_at: Optional[str] = None


class CourseProgressOut(BaseModel):
    course_id: str
    progress: int = 0
    completed_lessons: int = 0
    total_lessons: int = 0
    last_watched_lesson_id: Optional[str] = None
    lessons: list[CourseLessonProgressOut] = []


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
    duration_seconds: Optional[int] = Field(None, ge=0)


class QuestionnaireOptionIn(BaseModel):
    id: str = Field(..., min_length=1, max_length=50)
    label: str = Field(..., min_length=1, max_length=500)
    points: int = Field(..., ge=0, le=100)


class QuestionnaireOptionOut(BaseModel):
    id: str
    label: str


class QuestionnaireOptionAdminOut(QuestionnaireOptionOut):
    points: int


class QuestionnaireQuestionCreate(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=500)
    subtitle: Optional[str] = Field(None, max_length=500)
    order_index: int = Field(default=1, ge=0)
    is_active: bool = True
    allow_multiple: bool = False
    options: list[QuestionnaireOptionIn] = Field(..., min_length=2)


class QuestionnaireQuestionUpdate(BaseModel):
    prompt: Optional[str] = Field(None, min_length=1, max_length=500)
    subtitle: Optional[str] = Field(None, max_length=500)
    order_index: Optional[int] = Field(None, ge=0)
    is_active: Optional[bool] = None
    allow_multiple: Optional[bool] = None
    options: Optional[list[QuestionnaireOptionIn]] = Field(None, min_length=2)


class QuestionnaireQuestionPublicOut(BaseModel):
    id: str
    order_index: int
    prompt: str
    subtitle: str = ""
    allow_multiple: bool = False
    options: list[QuestionnaireOptionOut]


class QuestionnaireQuestionAdminOut(BaseModel):
    id: str
    order_index: int
    prompt: str
    is_active: bool = True
    options: list[QuestionnaireOptionAdminOut]


class QuestionnaireAnswerIn(BaseModel):
    question_id: str
    option_ids: list[str] = Field(..., min_length=1)


class QuestionnaireSubmitIn(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    answers: list[QuestionnaireAnswerIn] = Field(..., min_length=1)


class QuestionnaireSubmitOut(BaseModel):
    submission_id: str
    name: str
    readiness_label: str
    career_path: str
    career_path_title: str
    roadmap: str
    score: int
    max_score: int
    email_sent: bool = False
    lead_notification_sent: bool = False