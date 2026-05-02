import os
from dotenv import load_dotenv

APP_ENV = os.getenv("APP_ENV", "dev")

env_file = f".env.{APP_ENV}"
load_dotenv(env_file)

AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
USERS_TABLE = os.getenv("USERS_TABLE")
COURSES_TABLE = "course-platform-courses"
VIDEO_BUCKET = "course-platform-videos-best-realty"
COGNITO_REGION = os.getenv("COGNITO_REGION")
COGNITO_USER_POOL_ID = r"us-east-1_eL4j5xZD0"
COGNITO_CLIENT_ID = r"56emmsgl9hc910uc8j9opclq6b"
LESSONS_TABLE="course-platform-lessons"
PURCHASES_TABLE="course-platform-purchases"
COURSE_ACCESS_TABLE="course-platform-course-access"
STRIPE_SECRET_KEY = "sk_test_51T5XvWRtHu6jjzYGlMyMLTW3R2gxBEvam4MhAgIXXIr2Gk7pFKjeSfkTy5nBpRP91xvgMRzxuI3u6xSfzHrUjy5x00zvzgcjte"
STRIPE_WEBHOOK_SECRET = "whsec_b73381637d9bcc94516f5b8298da8b06c003dc34b312b8785eb7ddf33c5d92b7"