"""Where a quiz taker lands on a two-sided result bar (e.g. Referral <-> Agent)."""


def lean(*, left_label: str, right_label: str, left: int, right: int) -> dict:
    """
    position: 0 = all the way left, 100 = all the way right.
    Example: left=2, right=8 -> position 80 (80% toward the right side).
    """
    total = left + right
    position = round(right / total * 100) if total > 0 else 50
    return {
        "left_label": left_label,
        "right_label": right_label,
        "position": max(0, min(100, position)),
    }
