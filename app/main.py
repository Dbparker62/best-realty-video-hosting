from fastapi import FastAPI
from mangum import Mangum
from app.routes.payments import router as payments_router
from app.routes.users import router as users_router
from app.routes.courses import router as courses_router
from app.routes.videos import router as videos_router
from app.routes.auth import router as auth_router
from app.routes.lessons import router as lessons_router
from app.routes.admin import router as admin_router
app = FastAPI(title="Real Estate Course Platform API")

app.include_router(users_router)
app.include_router(courses_router)
app.include_router(videos_router)
app.include_router(auth_router)
app.include_router(lessons_router)
app.include_router(payments_router)
app.include_router(admin_router)
@app.get("/")
def health_check():
    return {"status": "ok"}

handler = Mangum(app)