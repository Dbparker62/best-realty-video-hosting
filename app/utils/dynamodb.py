from decimal import Decimal
from typing import Any


def sanitize_item(item: dict[str, Any]) -> dict[str, Any]:
    """Remove None values and coerce floats for DynamoDB put_item."""
    cleaned: dict[str, Any] = {}
    for key, value in item.items():
        if value is None:
            continue
        if isinstance(value, float):
            cleaned[key] = Decimal(str(value))
        else:
            cleaned[key] = value
    return cleaned
