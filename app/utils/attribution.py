"""Turn browser-captured lead attribution into a short human-readable label."""


def lead_source_label(attribution: dict | None) -> str:
    """
    Examples:
      {"utm_source": "instagram", "utm_medium": "bio"}       -> "instagram / bio"
      {"utm_source": "youtube", "utm_campaign": "nj-license"} -> "youtube (campaign: nj-license)"
      {"inferred_source": "instagram-app"}                    -> "instagram-app (no UTM tag)"
      None / {}                                               -> "Direct / unknown"
    """
    a = attribution or {}
    source = (a.get("utm_source") or "").strip()
    medium = (a.get("utm_medium") or "").strip()
    campaign = (a.get("utm_campaign") or "").strip()

    if source or medium:
        label = " / ".join(part for part in (source, medium) if part)
        if campaign:
            label += f" (campaign: {campaign})"
        return label

    inferred = (a.get("inferred_source") or "").strip()
    if inferred:
        return f"{inferred} (no UTM tag)"

    return "Direct / unknown"
