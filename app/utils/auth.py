import logging
import os
import requests

from fastapi import Depends, Header, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import jwt, JWTError

from app.config import COGNITO_REGION, COGNITO_USER_POOL_ID, COGNITO_CLIENT_ID

logger = logging.getLogger(__name__)

security = HTTPBearer(auto_error=False)

COGNITO_ISSUER = (
    f"https://cognito-idp.{COGNITO_REGION}.amazonaws.com/{COGNITO_USER_POOL_ID}"
)

JWKS_URL = f"{COGNITO_ISSUER}/.well-known/jwks.json"

_jwks: dict = {"keys": []}


def _load_jwks() -> None:
    global _jwks
    if not COGNITO_REGION or not COGNITO_USER_POOL_ID:
        logger.error("COGNITO_REGION or COGNITO_USER_POOL_ID is not configured")
        return
    try:
        _jwks = requests.get(JWKS_URL, timeout=10).json()
    except Exception as exc:
        logger.exception("Failed to load Cognito JWKS: %s", exc)


_load_jwks()


def _refresh_jwks() -> None:
    _load_jwks()


def _token_client_matches(payload: dict) -> bool:
    if not COGNITO_CLIENT_ID:
        return True
    token_client = payload.get("client_id") or payload.get("aud")
    if not token_client:
        return True
    return str(token_client) == str(COGNITO_CLIENT_ID)


def _decode_cognito_token(token: str, *, expected_use: str | None = None) -> dict:
    try:
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get("kid")

        key = None
        for jwk in _jwks.get("keys", []):
            if jwk.get("kid") == kid:
                key = jwk
                break

        if key is None:
            _refresh_jwks()
            for jwk in _jwks.get("keys", []):
                if jwk.get("kid") == kid:
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
        if expected_use and token_use and token_use != expected_use:
            raise HTTPException(status_code=401, detail="Invalid token type")

        if not _token_client_matches(payload):
            raise HTTPException(status_code=401, detail="Invalid token client")

        return payload
    except HTTPException:
        raise
    except JWTError as exc:
        logger.info("JWT validation failed: %s", exc)
        raise HTTPException(status_code=401, detail="Invalid or expired token")


def _decode_bearer_token(token: str) -> dict:
    """Accept Cognito access or id token in Authorization header."""
    last_error: HTTPException | None = None
    for token_use in ("access", "id"):
        try:
            return _decode_cognito_token(token, expected_use=token_use)
        except HTTPException as exc:
            last_error = exc
            if exc.detail == "Invalid token type":
                continue
            raise
    if last_error:
        raise last_error
    raise HTTPException(status_code=401, detail="Invalid or expired token")


def _groups_from_payload(payload: dict) -> list:
    raw = payload.get("cognito:groups", [])
    if isinstance(raw, list):
        return [str(g) for g in raw]
    if isinstance(raw, str) and raw:
        return [raw]
    return []


def _user_from_payload(payload: dict, groups: list | None = None) -> dict:
    resolved_groups = groups if groups is not None else _groups_from_payload(payload)
    email = payload.get("email") or payload.get("username")
    return {
        "sub": payload.get("sub"),
        "email": email,
        "username": payload.get("cognito:username") or payload.get("username"),
        "groups": resolved_groups,
        "claims": payload,
    }


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    x_id_token: str | None = Header(default=None, alias="X-Id-Token"),
):
    if credentials is None or not credentials.credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = credentials.credentials.strip()
    if token.lower().startswith("bearer "):
        token = token[7:].strip()

    payload = _decode_bearer_token(token)
    user = _user_from_payload(payload)

    if x_id_token:
        try:
            id_payload = _decode_cognito_token(x_id_token, expected_use="id")
            if not user["groups"]:
                user["groups"] = _groups_from_payload(id_payload)
            if not user["email"]:
                user["email"] = id_payload.get("email")
        except HTTPException:
            logger.debug("Ignoring invalid X-Id-Token header")

    return user


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
