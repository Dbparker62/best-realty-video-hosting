import os
import requests

from fastapi import APIRouter, HTTPException, Query
from app.config import COGNITO_CLIENT_ID

router = APIRouter()

COGNITO_DOMAIN = os.getenv("COGNITO_DOMAIN")
REDIRECT_URI = os.getenv("COGNITO_REDIRECT_URI", "https://36fjcwgqfc.execute-api.us-east-1.amazonaws.com/auth/callback")


@router.get("/auth/callback")
def auth_callback(code: str = Query(...)):
    token_url = f"{COGNITO_DOMAIN}/oauth2/token"

    data = {
        "grant_type": "authorization_code",
        "client_id": COGNITO_CLIENT_ID,
        "code": code,
        "redirect_uri": REDIRECT_URI,
    }

    headers = {
        "Content-Type": "application/x-www-form-urlencoded"
    }

    response = requests.post(token_url, data=data, headers=headers)

    if response.status_code != 200:
        raise HTTPException(
            status_code=400,
            detail={
                "message": "Failed to exchange code for tokens",
                "cognito_response": response.text,
            },
        )

    tokens = response.json()

    return {
        "message": "Login successful",
        "access_token": tokens.get("access_token"),
        "id_token": tokens.get("id_token"),
        "refresh_token": tokens.get("refresh_token"),
        "token_type": tokens.get("token_type"),
        "expires_in": tokens.get("expires_in"),
    }