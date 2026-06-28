import boto3

from app.config import (
    AWS_REGION,
    COURSE_ACCESS_TABLE,
    COURSES_TABLE,
    LESSONS_TABLE,
    PROGRESS_TABLE,
    PURCHASES_TABLE,
    QUESTIONNAIRE_QUESTIONS_TABLE,
    QUESTIONNAIRE_SUBMISSIONS_TABLE,
    USERS_TABLE,
    VIDEO_BUCKET,
)

dynamodb = boto3.resource("dynamodb", region_name=AWS_REGION)
s3_client = boto3.client("s3", region_name=AWS_REGION)

purchases_table = dynamodb.Table(PURCHASES_TABLE)
course_access_table = dynamodb.Table(COURSE_ACCESS_TABLE)
progress_table = dynamodb.Table(PROGRESS_TABLE)
users_table = dynamodb.Table(USERS_TABLE)
courses_table = dynamodb.Table(COURSES_TABLE)
lessons_table = dynamodb.Table(LESSONS_TABLE)

questionnaire_questions_table = (
    dynamodb.Table(QUESTIONNAIRE_QUESTIONS_TABLE)
    if QUESTIONNAIRE_QUESTIONS_TABLE
    else None
)
questionnaire_submissions_table = (
    dynamodb.Table(QUESTIONNAIRE_SUBMISSIONS_TABLE)
    if QUESTIONNAIRE_SUBMISSIONS_TABLE
    else None
)
