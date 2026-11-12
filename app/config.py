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
    "FRONTEND_URL", "https://www.bestacademyofrealestate.com"
)
# Online salesperson pre-licensing course (RECampus store). Used for the CTA in results emails.
ONLINE_COURSES_URL = os.getenv(
    "ONLINE_COURSES_URL",
    "https://home.recampus.com/shop/bestschool/real-estate-licensing/state-level"
    "?level=SALESPRSN_LICENSING&licenseType=SLP&orgCode=RE_LIC_NJ&productGroup=RE_WHOLESALE",
)
# Online broker pre-licensing courses. Used for the CTA in Team/Broker results emails.
BROKER_COURSES_URL = os.getenv(
    "BROKER_COURSES_URL",
    "https://home.recampus.com/shop/bestschool/real-estate-licensing/state-level"
    "?level=BROKER_LICENSING&licenseType=BRK&orgCode=RE_LIC_NJ&productGroup=RE_WHOLESALE",
)
SCHOOL_WEBSITE_URL = os.getenv(
    "SCHOOL_WEBSITE_URL", "https://bestschoolofrealestate.biz"
).rstrip("/")

# Transactional email (Amazon SES)
EMAIL_FROM = os.getenv("EMAIL_FROM", "").strip()
SUPPORT_EMAIL = os.getenv(
    "SUPPORT_EMAIL", "bruceparkerteam@gmail.com"
).strip()
EMAIL_ENABLED = os.getenv("EMAIL_ENABLED", "true").lower() in (
    "1",
    "true",
    "yes",
)
# Staff inboxes — notified when someone completes a quiz (comma-separated)
QUESTIONNAIRE_LEAD_EMAILS = [
    addr.strip()
    for addr in os.getenv(
        "QUESTIONNAIRE_LEAD_EMAIL",
        "bruceparkerteam@gmail.com,btestrealtyhp@gmail.com",
    ).split(",")
    if "@" in addr
]
# On by default: quiz takers get their results emailed the moment they submit.
# Needs SES production access (in the SES sandbox, sends to unverified addresses
# are rejected; staff lead emails still go out). Set "false" to turn off.
QUESTIONNAIRE_SEND_USER_EMAIL = os.getenv(
    "QUESTIONNAIRE_SEND_USER_EMAIL", "true"
).lower() in ("1", "true", "yes")

QUESTIONNAIRE_QUESTIONS_TABLE = os.getenv(
    "QUESTIONNAIRE_QUESTIONS_TABLE", "course-platform-questionnaire-questions"
)
QUESTIONNAIRE_SUBMISSIONS_TABLE = os.getenv(
    "QUESTIONNAIRE_SUBMISSIONS_TABLE", "course-platform-questionnaire-submissions"
)