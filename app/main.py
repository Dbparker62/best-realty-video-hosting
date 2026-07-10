import logging
import os

from botocore.exceptions import ClientError
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from mangum import Mangum
from app.routes.payments import router as payments_router
from app.routes.users import router as users_router
from app.routes.courses import router as courses_router
from app.routes.videos import router as videos_router
from app.routes.auth import router as auth_router
from app.routes.lessons import router as lessons_router
from app.routes.admin import router as admin_router
from app.routes.my_courses import router as my_courses_router
from app.routes.progress import router as progress_router
from app.routes.leadership_questionnaire import router as leadership_questionnaire_router
from app.routes.questionnaire import router as questionnaire_router
from fastapi.middleware.cors import CORSMiddleware
logger = logging.getLogger(__name__)

logging.getLogger().setLevel(logging.INFO)

app = FastAPI(title="Real Estate Course Platform API")


@app.exception_handler(HTTPException)
async def http_exception_handler(_request: Request, exc: HTTPException):
    detail = exc.detail
    if not isinstance(detail, dict):
        detail = {"error": {"code": "HTTP_ERROR", "message": str(detail)}}
    return JSONResponse(status_code=exc.status_code, content=detail)


@app.exception_handler(ClientError)
async def dynamodb_exception_handler(_request: Request, exc: ClientError):
    error = exc.response.get("Error", {})
    logger.exception("DynamoDB client error: %s", error.get("Message", exc))
    return JSONResponse(
        status_code=503,
        content={
            "error": {
                "code": "DYNAMODB_ERROR",
                "message": error.get("Message", "Database error"),
                "details": {"aws_code": error.get("Code")},
            }
        },
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(_request: Request, exc: Exception):
    logger.exception("Unhandled API error")
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "code": "INTERNAL_ERROR",
                "message": str(exc) or "Internal server error",
            }
        },
    )

app.include_router(users_router)
app.include_router(courses_router)
app.include_router(videos_router)
app.include_router(auth_router)
app.include_router(lessons_router)
app.include_router(payments_router)
app.include_router(admin_router)
app.include_router(my_courses_router)
app.include_router(progress_router)
app.include_router(questionnaire_router)
app.include_router(leadership_questionnaire_router)
_cors_origins = [
    "http://localhost:3000",
    "https://best-realty-video-hosting.vercel.app",
]
_extra_origins = os.getenv("CORS_ALLOWED_ORIGINS", "")
if _extra_origins:
    _cors_origins.extend(
        origin.strip() for origin in _extra_origins.split(",") if origin.strip()
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)
@app.get("/")
def health_check():
    return {"status": "ok"}

handler = Mangum(app)