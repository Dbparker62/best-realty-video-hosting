"""
Town-by-town resale requirements for the Home Sale Readiness quiz.

Add a town by copying the Highland Park entry. Keys are (county, town) in lowercase.
Only add details you have confirmed with the town (construction / zoning / fire office);
anything not listed falls back to the statewide note below.
"""

NJ_COUNTIES = (
    "Atlantic", "Bergen", "Burlington", "Camden", "Cape May", "Cumberland", "Essex",
    "Gloucester", "Hudson", "Hunterdon", "Mercer", "Middlesex", "Monmouth", "Morris",
    "Ocean", "Passaic", "Salem", "Somerset", "Sussex", "Union", "Warren",
)

TOWN_RESALE: dict[tuple[str, str], dict[str, str]] = {
    ("middlesex", "highland park"): {
        "requirement": "Resale CO / inspection required",
        "cost": "Typically $100–$150",
        "tip": (
            "Open permits must be closed, the smoke/CO certificate comes first, and a final "
            "water meter reading is needed."
        ),
    },
}

# Statewide: every resale of a one- or two-family home needs a smoke alarm, carbon monoxide
# alarm and portable fire extinguisher certificate from the local fire official.
DEFAULT_RESALE = {
    "requirement": "Smoke/CO/fire extinguisher certificate (statewide); check for a town resale CO",
    "cost": "Varies by town",
    "tip": (
        "Not in our town list yet. Every NJ one- or two-family resale needs a smoke alarm, carbon "
        "monoxide alarm, and fire extinguisher certificate. Call the town's construction or zoning "
        "office to confirm whether a resale CO inspection is also required, and close any open permits."
    ),
}


def _norm(value: str | None) -> str:
    text = " ".join((value or "").lower().replace(".", "").split())
    for suffix in (" borough", " township", " twp", " city", " town", " village", " boro"):
        if text.endswith(suffix):
            text = text[: -len(suffix)].strip()
    return text


def town_resale_info(county: str | None, town: str | None) -> dict[str, str]:
    """Requirement, cost and agent tip for a town, or the statewide fallback."""
    info = TOWN_RESALE.get((_norm(county).replace(" county", ""), _norm(town)))
    return {**DEFAULT_RESALE, **info, "known": "yes"} if info else {**DEFAULT_RESALE, "known": "no"}
