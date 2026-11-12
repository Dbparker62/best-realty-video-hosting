/** Counties and towns the Home Sale quiz covers (must match app/services/nj_town_resale.py). */
export const SERVICE_AREA: Record<string, readonly string[]> = {
  Middlesex: [
    "Carteret", "Cranbury", "Dunellen", "East Brunswick", "Edison", "Helmetta", "Highland Park",
    "Jamesburg", "Metuchen", "Middlesex", "Milltown", "Monroe Township", "New Brunswick",
    "North Brunswick", "Old Bridge", "Perth Amboy", "Piscataway", "Plainsboro", "Sayreville",
    "South Amboy", "South Brunswick", "South Plainfield", "South River", "Spotswood", "Woodbridge",
  ],
  Monmouth: [
    "Aberdeen", "Allenhurst", "Allentown", "Asbury Park", "Atlantic Highlands", "Avon-by-the-Sea",
    "Belmar", "Bradley Beach", "Brielle", "Colts Neck", "Deal", "Eatontown", "Englishtown",
    "Fair Haven", "Farmingdale", "Freehold Borough", "Freehold Township", "Hazlet", "Highlands",
    "Holmdel", "Howell", "Interlaken", "Keansburg", "Keyport", "Lake Como", "Little Silver",
    "Loch Arbour", "Long Branch", "Manalapan", "Manasquan", "Marlboro", "Matawan", "Middletown",
    "Millstone", "Monmouth Beach", "Neptune City", "Neptune Township", "Ocean Township",
    "Oceanport", "Red Bank", "Roosevelt", "Rumson", "Sea Bright", "Sea Girt", "Shrewsbury Borough",
    "Shrewsbury Township", "Spring Lake", "Spring Lake Heights", "Tinton Falls", "Union Beach",
    "Upper Freehold", "Wall", "West Long Branch",
  ],
}

export const SERVICE_COUNTIES = Object.keys(SERVICE_AREA)
