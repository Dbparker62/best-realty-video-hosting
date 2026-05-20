import os
from dotenv import load_dotenv

APP_ENV = os.getenv("APP_ENV", "prod")

env_file = f".env.{APP_ENV}"
load_dotenv(env_file)

AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
USERS_TABLE = os.getenv("USERS_TABLE")
COURSES_TABLE = os.getenv("COURSES_TABLE")
VIDEO_BUCKET = os.getenv("VIDEO_BUCKET")
COGNITO_REGION = os.getenv("COGNITO_REGION")
COGNITO_USER_POOL_ID = os.getenv("COGNITO_USER_POOL_ID")
COGNITO_CLIENT_ID = os.getenv("COGNITO_CLIENT_ID")
LESSONS_TABLE=os.getenv("LESSONS_TABLE")
PURCHASES_TABLE = os.getenv("PURCHASES_TABLE", "course-platform-purchases")
# DynamoDB key schema for course-platform-purchases (partition + sort key)
PURCHASES_HASH_KEY = os.getenv("PURCHASES_HASH_KEY", "user_id")
PURCHASES_RANGE_KEY = os.getenv("PURCHASES_RANGE_KEY", "course_id")
COURSE_ACCESS_TABLE = os.getenv(
    "COURSE_ACCESS_TABLE", "course-platform-course-access"
)
PROGRESS_TABLE = os.getenv(
    "PROGRESS_TABLE", "course-platform-lesson-progress"
)
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")
CLOUDFRONT_DOMAIN = os.getenv("CLOUDFRONT_DOMAIN")
FRONTEND_URL = os.getenv(
    "FRONTEND_URL", "https://best-realty-video-hosting.vercel.app"
)