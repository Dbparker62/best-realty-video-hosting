import os

from fastapi import FastAPI
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
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI(title="Real Estate Course Platform API")

app.include_router(users_router)
app.include_router(courses_router)
app.include_router(videos_router)
app.include_router(auth_router)
app.include_router(lessons_router)
app.include_router(payments_router)
app.include_router(admin_router)
app.include_router(my_courses_router)
app.include_router(progress_router)
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
)
@app.get("/")
def health_check():
    return {"status": "ok"}

handler = Mangum(app)