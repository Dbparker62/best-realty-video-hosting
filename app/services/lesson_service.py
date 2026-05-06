from uuid import uuid4
from boto3.dynamodb.conditions import Attr
from app.models import schemas
from app.utils.database import courses_table, lessons_table
from app.utils.error import not_found
from app.utils.database import s3_client, VIDEO_BUCKET
from app.utils.error import bad_request
from app.services.access_service import has_course_access
from app.utils.error import forbidden
from app.config import CLOUDFRONT_DOMAIN
from botocore.signers import CloudFrontSigner
from datetime import datetime, timedelta, timezone
import os

from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding



def rsa_signer(message):
    private_key = os.getenv("CLOUDFRONT_PRIVATE_KEY").replace("\\n", "\n")

    key = serialization.load_pem_private_key(
        private_key.encode(),
        password=None,
    )

    return key.sign(
        message,
        padding.PKCS1v15(),
        hashes.SHA1(),
    )


def generate_signed_url(url):
    key_pair_id = os.getenv("CLOUDFRONT_KEY_PAIR_ID")

    expire = datetime.now(timezone.utc) + timedelta(minutes=30)

    signer = CloudFrontSigner(key_pair_id, rsa_signer)

    return signer.generate_presigned_url(
        url,
        date_less_than=expire,
    )

def check_course_exists(course_id: str):
    course_response = courses_table.get_item(Key={"id": course_id})

    if "Item" not in course_response:
        not_found(
            "COURSE_NOT_FOUND",
            "Course not found",
            {"course_id": course_id}
        )

    return course_response["Item"]


def check_lesson_exists(lesson_id: str):
    lesson_response = lessons_table.get_item(Key={"id": lesson_id})

    if "Item" not in lesson_response:
        not_found(
            "LESSON_NOT_FOUND",
            "Lesson not found",
            {"lesson_id": lesson_id}
        )

    return lesson_response["Item"]


def create_lesson(course_id: str, lesson: schemas.LessonCreate):
    check_course_exists(course_id)

    item = {
        "id": str(uuid4()),
        "course_id": course_id,
        "title": lesson.title,
        "description": lesson.description,
        "order_index": lesson.order_index,
        "video_s3_key": lesson.video_s3_key,
        "duration_seconds": lesson.duration_seconds,
        "is_preview": lesson.is_preview,
        "is_published": lesson.is_published,
    }

    lessons_table.put_item(Item=item)
    return item


def list_lessons_for_course(course_id: str):
    check_course_exists(course_id)

    response = lessons_table.scan(
        FilterExpression=Attr("course_id").eq(course_id)
    )

    lessons = response.get("Items", [])
    lessons.sort(key=lambda lesson: lesson.get("order_index", 0))

    return lessons


def get_lesson(lesson_id: str):
    return check_lesson_exists(lesson_id)


def update_lesson(lesson_id: str, lesson_update: schemas.LessonUpdate):
    existing_lesson = check_lesson_exists(lesson_id)

    update_data = lesson_update.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        existing_lesson[key] = value

    lessons_table.put_item(Item=existing_lesson)

    return existing_lesson


def delete_lesson(lesson_id: str):
    check_lesson_exists(lesson_id)

    lessons_table.delete_item(Key={"id": lesson_id})

    return {
        "message": "Lesson deleted successfully",
        "lesson_id": lesson_id
    }

def create_lesson_video_upload_url(lesson_id: str, request: schemas.LessonVideoUploadRequest):
    check_lesson_exists(lesson_id)

    video_s3_key = f"lessons/{lesson_id}/{request.filename}"

    upload_url = s3_client.generate_presigned_url(
        "put_object",
        Params={
            "Bucket": VIDEO_BUCKET,
            "Key": video_s3_key,
            "ContentType": request.content_type,
        },
        ExpiresIn=3600
    )

    return {
        "upload_url": upload_url,
        "video_s3_key": video_s3_key
    }


def update_lesson_video(lesson_id: str, request: schemas.VideoUpdateRequest):
    lesson = check_lesson_exists(lesson_id)

    lesson["video_s3_key"] = request.video_s3_key
    if request.duration_seconds is not None:
        lesson["duration_seconds"] = request.duration_seconds

    lessons_table.put_item(Item=lesson)

    return {
        "message": "Lesson video updated successfully",
        "lesson_id": lesson_id,
        "video_s3_key": request.video_s3_key
    }


def get_lesson_video_url(lesson_id: str, user: dict):
    lesson = check_lesson_exists(lesson_id)

    course_id = lesson["course_id"]
    user_id = user["sub"]
    is_admin = "admin" in user.get("groups", [])

    if not is_admin and not has_course_access(user_id, course_id):
        forbidden(
            "COURSE_ACCESS_REQUIRED",
            "You must purchase this course to access this lesson",
            {
                "course_id": course_id,
                "lesson_id": lesson_id
            }
        )

    if not lesson.get("video_s3_key"):
        bad_request(
            "NO_VIDEO_UPLOADED",
            "No video has been uploaded for this lesson",
            {"lesson_id": lesson_id}
        )

    cloudfront_url = f"{CLOUDFRONT_DOMAIN}/{lesson['video_s3_key']}"

    video_url = generate_signed_url(cloudfront_url)

    return {
        "video_url": video_url
    }