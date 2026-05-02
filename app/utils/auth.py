import os
import requests

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import jwt, JWTError

from app.config import COGNITO_REGION, COGNITO_USER_POOL_ID, COGNITO_CLIENT_ID


security = HTTPBearer()

COGNITO_ISSUER = (
    f"https://cognito-idp.{COGNITO_REGION}.amazonaws.com/{COGNITO_USER_POOL_ID}"
)

JWKS_URL = f"{COGNITO_ISSUER}/.well-known/jwks.json"

_jwks = requests.get(JWKS_URL).json()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    token = credentials.credentials

    print("==== AUTH DEBUG START ====")
    print("Token starts with:", token[:30])
    print("Token length:", len(token))

    try:
        unverified_header = jwt.get_unverified_header(token)
        print("Unverified header:", unverified_header)

        kid = unverified_header.get("kid")
        print("Token kid:", kid)

        print("Available JWKS kids:", [jwk["kid"] for jwk in _jwks["keys"]])

        key = None
        for jwk in _jwks["keys"]:
            if jwk["kid"] == kid:
                key = jwk
                break

        print("Matching key found:", key is not None)

        if key is None:
            raise HTTPException(status_code=401, detail="Invalid token key")

        payload = jwt.decode(
            token,
            key,
            algorithms=["RS256"],
            issuer=COGNITO_ISSUER,
            options={"verify_aud": False},
        )

        print("Decoded payload:", payload)
        print("Expected client ID:", COGNITO_CLIENT_ID)
        print("Token client_id:", payload.get("client_id"))
        print("Token use:", payload.get("token_use"))

        if payload.get("client_id") != COGNITO_CLIENT_ID:
            print("CLIENT ID MISMATCH")
            raise HTTPException(status_code=401, detail="Invalid token client")

        if payload.get("token_use") != "access":
            print("TOKEN TYPE IS NOT ACCESS")
            raise HTTPException(status_code=401, detail="Invalid token type")

        print("==== AUTH DEBUG SUCCESS ====")

        return {
            "sub": payload.get("sub"),
            "email": payload.get("email"),
            "username": payload.get("cognito:username") or payload.get("username"),
            "groups": payload.get("cognito:groups", []),
            "claims": payload,
        }

    except JWTError as e:
        print("JWT ERROR:", str(e))
        print("==== AUTH DEBUG FAILED ====")
        raise HTTPException(status_code=401, detail="Invalid or expired token")


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