from fastapi import APIRouter, HTTPException
from boto3.dynamodb.conditions import Attr
from uuid import uuid4

from app.models import schemas
from app.utils.database import users_table

router = APIRouter()
from fastapi import Depends
from app.utils.auth import require_authenticated_user

@router.get("/auth/me")
def auth_me(user=Depends(require_authenticated_user)):
    return user
@router.post("/users", response_model=schemas.UserOut)
def create_user(user: schemas.UserCreate):
    existing = users_table.scan(
        FilterExpression=Attr("email").eq(user.email)
    ).get("Items", [])

    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    item = {
        "id": str(uuid4()),
        "email": user.email,
        "full_name": user.full_name,
        "is_admin": user.is_admin,
    }

    users_table.put_item(Item=item)
    return item


@router.get("/users", response_model=list[schemas.UserOut])
def list_users():
    response = users_table.scan()
    return response.get("Items", [])