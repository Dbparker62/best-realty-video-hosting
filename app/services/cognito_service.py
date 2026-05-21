"""Look up Cognito user attributes (e.g. email) by sub for admin reporting."""

import logging

import boto3
from botocore.exceptions import ClientError

from app.config import COGNITO_REGION, COGNITO_USER_POOL_ID

logger = logging.getLogger(__name__)

_email_cache: dict[str, str | None] = {}


def lookup_email_by_sub(user_sub: str) -> str | None:
    """
    Resolve sign-in email for a Cognito user id (sub).
    Requires Lambda IAM: cognito-idp:ListUsers on the user pool.
    """
    if not user_sub or not COGNITO_USER_POOL_ID or not COGNITO_REGION:
        return None

    if user_sub in _email_cache:
        return _email_cache[user_sub]

    email: str | None = None
    client = boto3.client("cognito-idp", region_name=COGNITO_REGION)

    try:
        response = client.list_users(
            UserPoolId=COGNITO_USER_POOL_ID,
            Filter=f'sub = "{user_sub}"',
            Limit=1,
        )
        users = response.get("Users", [])
        if users:
            for attr in users[0].get("Attributes", []):
                if attr.get("Name") == "email" and attr.get("Value"):
                    email = str(attr["Value"])
                    break
    except ClientError as exc:
        logger.warning(
            "Cognito list_users failed for sub=%s: %s",
            user_sub,
            exc.response.get("Error", {}).get("Message", exc),
        )

    if not email:
        try:
            user = client.admin_get_user(
                UserPoolId=COGNITO_USER_POOL_ID,
                Username=user_sub,
            )
            for attr in user.get("UserAttributes", []):
                if attr.get("Name") == "email" and attr.get("Value"):
                    email = str(attr["Value"])
                    break
        except ClientError as exc:
            logger.warning(
                "Cognito admin_get_user failed for sub=%s: %s",
                user_sub,
                exc.response.get("Error", {}).get("Message", exc),
            )

    _email_cache[user_sub] = email
    return email
