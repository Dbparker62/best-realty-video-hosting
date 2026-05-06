import boto3
from app.config import AWS_REGION, USERS_TABLE, COURSES_TABLE, LESSONS_TABLE, VIDEO_BUCKET,PURCHASES_TABLE,COURSE_ACCESS_TABLE

dynamodb = boto3.resource("dynamodb", region_name=AWS_REGION)
s3_client = boto3.client("s3", region_name=AWS_REGION)
purchases_table = dynamodb.Table(PURCHASES_TABLE)
course_access_table = dynamodb.Table(COURSE_ACCESS_TABLE)
VIDEO_BUCKET = VIDEO_BUCKET
users_table = dynamodb.Table(USERS_TABLE)
courses_table = dynamodb.Table(COURSES_TABLE)
lessons_table = dynamodb.Table(LESSONS_TABLE)
dynamodb = boto3.resource("dynamodb", region_name=AWS_REGION)
s3_client = boto3.client("s3", region_name=AWS_REGION)
purchases_table = dynamodb.Table(PURCHASES_TABLE)
course_access_table = dynamodb.Table(COURSE_ACCESS_TABLE)


users_table = dynamodb.Table(USERS_TABLE)
courses_table = dynamodb.Table(COURSES_TABLE)