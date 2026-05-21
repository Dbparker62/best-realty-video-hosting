import logging
import os

import requests
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from app.config import COGNITO_CLIENT_ID, FRONTEND_URL

logger = logging.getLogger(__name__)

router = APIRouter()

COGNITO_DOMAIN = os.getenv("COGNITO_DOMAIN")
DEFAULT_REDIRECT_URI = os.getenv(
    "COGNITO_REDIRECT_URI",
    f"{FRONTEND_URL.rstrip('/')}/auth/callback",
)


class RefreshTokenRequest(BaseModel):
    refresh_token: str


def _exchange_tokens(data: dict) -> dict:
    if not COGNITO_DOMAIN:
        raise HTTPException(
            status_code=500,
            detail="COGNITO_DOMAIN is not configured on the API",
        )

    token_url = f"{COGNITO_DOMAIN.rstrip('/')}/oauth2/token"
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    response = requests.post(token_url, data=data, headers=headers, timeout=15)

    if response.status_code != 200:
        logger.warning(
            "Cognito token request failed: %s %s",
            response.status_code,
            response.text[:500],
        )
        raise HTTPException(
            status_code=400,
            detail={
                "message": "Failed to exchange tokens with Cognito",
                "cognito_response": response.text,
            },
        )

    return response.json()


@router.get("/auth/callback")
def auth_callback(
    code: str = Query(...),
    redirect_uri: str | None = Query(None),
):
    """
    Exchange OAuth authorization code for tokens.
    redirect_uri must match the value used in the Hosted UI login (frontend URL).
    """
    effective_redirect = (redirect_uri or DEFAULT_REDIRECT_URI).strip()

    tokens = _exchange_tokens(
        {
            "grant_type": "authorization_code",
            "client_id": COGNITO_CLIENT_ID,
            "code": code,
            "redirect_uri": effective_redirect,
        }
    )

    return {
        "message": "Login successful",
        "access_token": tokens.get("access_token"),
        "id_token": tokens.get("id_token"),
        "refresh_token": tokens.get("refresh_token"),
        "token_type": tokens.get("token_type"),
        "expires_in": tokens.get("expires_in"),
    }


@router.post("/auth/refresh")
def refresh_tokens(body: RefreshTokenRequest):
    """Issue new access/id tokens using a Cognito refresh token."""
    tokens = _exchange_tokens(
        {
            "grant_type": "refresh_token",
            "client_id": COGNITO_CLIENT_ID,
            "refresh_token": body.refresh_token,
        }
    )

    return {
        "access_token": tokens.get("access_token"),
        "id_token": tokens.get("id_token"),
        "token_type": tokens.get("token_type"),
        "expires_in": tokens.get("expires_in"),
    }
