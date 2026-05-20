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

       

        if payload.get("client_id") != COGNITO_CLIENT_ID:
            
            raise HTTPException(status_code=401, detail="Invalid token client")

        if payload.get("token_use") != "access":
           
            raise HTTPException(status_code=401, detail="Invalid token type")

       

        return {
            "sub": payload.get("sub"),
            "email": payload.get("email"),
            "username": payload.get("cognito:username") or payload.get("username"),
            "groups": payload.get("cognito:groups", []),
            "claims": payload,
        }

    except JWTError as e:
      
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