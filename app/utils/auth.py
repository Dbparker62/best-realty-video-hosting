import os
import requests

from fastapi import Depends, Header, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import jwt, JWTError

from app.config import COGNITO_REGION, COGNITO_USER_POOL_ID, COGNITO_CLIENT_ID


security = HTTPBearer(auto_error=False)

COGNITO_ISSUER = (
    f"https://cognito-idp.{COGNITO_REGION}.amazonaws.com/{COGNITO_USER_POOL_ID}"
)

JWKS_URL = f"{COGNITO_ISSUER}/.well-known/jwks.json"

_jwks = requests.get(JWKS_URL).json()


def _decode_cognito_token(token: str, *, expected_use: str | None) -> dict:
    try:
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get("kid")

        key = None
        for jwk in _jwks["keys"]:
            if jwk["kid"] == kid:
                key = jwk
                break

        if key is None:
            raise HTTPException(status_code=401, detail="Invalid token key")

        payload = jwt.decode(
            token,
            key,
            algorithms=["RS256"],
            issuer=COGNITO_ISSUER,
            options={"verify_aud": False},
        )

        token_use = payload.get("token_use")
        if expected_use and token_use != expected_use:
            raise HTTPException(status_code=401, detail="Invalid token type")

        if token_use == "access" and payload.get("client_id") != COGNITO_CLIENT_ID:
            raise HTTPException(status_code=401, detail="Invalid token client")

        if token_use == "id":
            if payload.get("aud") != COGNITO_CLIENT_ID:
                raise HTTPException(status_code=401, detail="Invalid token audience")

        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


def _groups_from_payload(payload: dict) -> list:
    raw = payload.get("cognito:groups", [])
    if isinstance(raw, list):
        return [str(g) for g in raw]
    if isinstance(raw, str) and raw:
        return [raw]
    return []


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    x_id_token: str | None = Header(default=None, alias="X-Id-Token"),
):
    if credentials is None or not credentials.credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = credentials.credentials

    access_payload = _decode_cognito_token(token, expected_use="access")
    groups = _groups_from_payload(access_payload)

    if not groups and x_id_token:
        id_payload = _decode_cognito_token(x_id_token, expected_use="id")
        groups = _groups_from_payload(id_payload)

    return {
        "sub": access_payload.get("sub"),
        "email": access_payload.get("email") or access_payload.get("username"),
        "username": access_payload.get("cognito:username")
        or access_payload.get("username"),
        "groups": groups,
        "claims": access_payload,
    }


def require_authenticated_user(current_user=Depends(get_current_user)):
    return current_user


def require_admin(current_user=Depends(get_current_user)):
    if "admin" not in current_user["groups"]:
        raise HTTPException(status_code=403, detail="Admin access required")

    return current_user


def require_customer(current_user=Depends(get_current_user)):
    groups = current_user["groups"]

    if "customer" not in groups and "admin" not in groups:
        raise HTTPException(status_code=403, detail="Customer access required")

    return current_user


def require_admin_or_customer(current_user=Depends(get_current_user)):
    groups = current_user["groups"]

    if "customer" not in groups and "admin" not in groups:
        raise HTTPException(
            status_code=403,
            detail="Customer or admin access required",
        )

    return current_user