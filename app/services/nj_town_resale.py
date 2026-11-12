"""
Town-by-town resale requirements for the Home Sale Readiness quiz.

Add a town by copying the Highland Park entry. Keys are (county, town) in lowercase, spelled
exactly as in SERVICE_AREA.
Only add details you have confirmed with the town (construction / zoning / fire office);
anything not listed falls back to the statewide note below.
"""

# Counties and towns the Home Sale quiz covers (every municipality in each county).
SERVICE_AREA: dict[str, tuple[str, ...]] = {
    "Middlesex": (
        "Carteret", "Cranbury", "Dunellen", "East Brunswick", "Edison", "Helmetta",
        "Highland Park", "Jamesburg", "Metuchen", "Middlesex", "Milltown", "Monroe Township",
        "New Brunswick", "North Brunswick", "Old Bridge", "Perth Amboy", "Piscataway",
        "Plainsboro", "Sayreville", "South Amboy", "South Brunswick", "South Plainfield",
        "South River", "Spotswood", "Woodbridge",
    ),
    "Monmouth": (
        "Aberdeen", "Allenhurst", "Allentown", "Asbury Park", "Atlantic Highlands",
        "Avon-by-the-Sea", "Belmar", "Bradley Beach", "Brielle", "Colts Neck", "Deal", "Eatontown",
        "Englishtown", "Fair Haven", "Farmingdale", "Freehold Borough", "Freehold Township",
        "Hazlet", "Highlands", "Holmdel", "Howell", "Interlaken", "Keansburg", "Keyport",
        "Lake Como", "Little Silver", "Loch Arbour", "Long Branch", "Manalapan", "Manasquan",
        "Marlboro", "Matawan", "Middletown", "Millstone", "Monmouth Beach", "Neptune City",
        "Neptune Township", "Ocean Township", "Oceanport", "Red Bank", "Roosevelt", "Rumson",
        "Sea Bright", "Sea Girt", "Shrewsbury Borough", "Shrewsbury Township", "Spring Lake",
        "Spring Lake Heights", "Tinton Falls", "Union Beach", "Upper Freehold", "Wall",
        "West Long Branch",
    ),
}

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
        "Town-specific details not on file yet. Every NJ one- or two-family resale needs a smoke alarm, carbon "
        "monoxide alarm, and fire extinguisher certificate. Call the town's construction or zoning "
        "office to confirm whether a resale CO inspection is also required, and close any open permits."
    ),
}


def _norm(value: str | None) -> str:
    # Exact names come from the dropdown, so only case and spacing are normalized
    # (never strip "Borough"/"Township": Freehold Borough and Freehold Township differ).
    return " ".join((value or "").lower().split())


def town_resale_info(county: str | None, town: str | None) -> dict[str, str]:
    """Requirement, cost and agent tip for a town, or the statewide fallback."""
    info = TOWN_RESALE.get((_norm(county), _norm(town)))
    return {**DEFAULT_RESALE, **info, "known": "yes"} if info else {**DEFAULT_RESALE, "known": "no"}
