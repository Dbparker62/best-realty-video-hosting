from fastapi import HTTPException


def _build_error(code: str, message: str, details: dict | None = None):
    error_response = {
        "error": {
            "code": code,
            "message": message,
        }
    }

    if details:
        error_response["error"]["details"] = details

    return error_response


def not_found(code: str, message: str, details: dict | None = None):
    raise HTTPException(
        status_code=404,
        detail=_build_error(code, message, details)
    )


def bad_request(code: str, message: str, details: dict | None = None):
    raise HTTPException(
        status_code=400,
        detail=_build_error(code, message, details)
    )


def conflict(code: str, message: str, details: dict | None = None):
    raise HTTPException(
        status_code=409,
        detail=_build_error(code, message, details)
    )


def unauthorized(code: str, message: str, details: dict | None = None):
    raise HTTPException(
        status_code=401,
        detail=_build_error(code, message, details)
    )


def forbidden(code: str, message: str, details: dict | None = None):
    raise HTTPException(
        status_code=403,
        detail=_build_error(code, message, details)
    )