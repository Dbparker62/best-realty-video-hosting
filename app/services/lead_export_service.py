"""Quiz leads as a CSV file for importing into Real Geeks (Lead Manager > Bulk Import).

Real Geeks lets you match each column to a Lead Manager field during import, so the
headers use its common field names. Anything without its own field goes into
"Important Notes". Real Geeks skips emails it already has, so re-importing an
overlapping date range doesn't create duplicates.
"""

import csv
import io
import logging
import re
from datetime import date, datetime, timedelta, timezone, tzinfo

from botocore.exceptions import ClientError

from app.utils.database import questionnaire_submissions_table

logger = logging.getLogger(__name__)

class _UsEastern(tzinfo):
    """US Eastern time without the tz database (DST: 2nd Sunday of March to 1st Sunday of November)."""

    @staticmethod
    def _nth_sunday(year: int, month: int, n: int) -> datetime:
        first = datetime(year, month, 1)
        return first + timedelta(days=(6 - first.weekday()) % 7 + 7 * (n - 1))

    def utcoffset(self, dt):
        return timedelta(hours=-4) if self.dst(dt) else timedelta(hours=-5)

    def dst(self, dt):
        naive = dt.replace(tzinfo=None)
        start = self._nth_sunday(naive.year, 3, 2).replace(hour=2)
        end = self._nth_sunday(naive.year, 11, 1).replace(hour=2)
        return timedelta(hours=1) if start <= naive < end else timedelta(0)

    def fromutc(self, dt):
        # Decide DST on the UTC clock: it starts 2am EST (07:00 UTC), ends 2am EDT (06:00 UTC).
        utc = dt.replace(tzinfo=None)
        start = self._nth_sunday(utc.year, 3, 2).replace(hour=7)
        end = self._nth_sunday(utc.year, 11, 1).replace(hour=6)
        return dt + (timedelta(hours=-4) if start <= utc < end else timedelta(hours=-5))

    def tzname(self, dt):
        return "EDT" if self.dst(dt) else "EST"


try:
    from zoneinfo import ZoneInfo

    _LOCAL_TZ: tzinfo = ZoneInfo("America/New_York")
except Exception:  # tz database not installed
    _LOCAL_TZ = _UsEastern()

QUIZ_TYPES = ("career", "leadership", "home_sale")

QUIZ_INFO = {
    "career": {
        "quiz": "NJ Real Estate Career Quiz",
        "source": "Best School of Real Estate - Career Quiz",
        "lead_type": "License student prospect",
    },
    "leadership": {
        "quiz": "Team or Broker Quiz",
        "source": "Best School of Real Estate - Team/Broker Quiz",
        "lead_type": "Team leader / broker prospect",
    },
    "home_sale": {
        "quiz": "Home Sale Readiness Quiz",
        "source": "Best Realty - Home Sale Quiz",
        "lead_type": "Seller",
    },
}

COLUMNS = [
    "First Name",
    "Last Name",
    "Email",
    "Primary Phone",
    "Source",
    "Lead Type",
    "City",
    "County",
    "State",
    "Contact Consent",
    "Consent Date",
    "Quiz",
    "Result",
    "Submitted",
    "Important Notes",
]


def scan_all_submissions() -> list[dict]:
    """Every saved quiz submission, newest first (follows DynamoDB scan pages)."""
    if questionnaire_submissions_table is None:
        return []
    items: list[dict] = []
    kwargs: dict = {}
    try:
        while True:
            page = questionnaire_submissions_table.scan(**kwargs)
            items.extend(page.get("Items", []))
            last_key = page.get("LastEvaluatedKey")
            if not last_key:
                break
            kwargs["ExclusiveStartKey"] = last_key
    except ClientError as exc:
        logger.warning(
            "Could not read quiz submissions: %s",
            exc.response.get("Error", {}).get("Message", exc),
        )
    items.sort(key=lambda x: x.get("created_at") or "", reverse=True)
    return items


def quiz_type_of(item: dict) -> str:
    # Career-quiz rows saved before quiz_type existed have no type field.
    return str(item.get("quiz_type") or "career")


def _local_time(iso: str | None) -> str:
    if not iso:
        return ""
    try:
        dt = datetime.fromisoformat(str(iso))
    except ValueError:
        return str(iso)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(_LOCAL_TZ).strftime("%Y-%m-%d %I:%M %p")


def _phone(raw: str | None) -> str:
    """Digits only, formatted (555) 555-5555 when it's a US number."""
    digits = re.sub(r"\D", "", raw or "")
    if len(digits) == 11 and digits.startswith("1"):
        digits = digits[1:]
    if len(digits) == 10:
        return f"({digits[:3]}) {digits[3:6]}-{digits[6:]}"
    return digits


def _split_name(full: str | None) -> tuple[str, str]:
    parts = (full or "").split()
    if not parts:
        return "", ""
    return parts[0], " ".join(parts[1:])


def result_text(item: dict, quiz_type: str) -> str:
    if quiz_type == "home_sale":
        score = item.get("readiness_score")
        label = item.get("readiness_label") or ""
        return f"{score}% {label}".strip() if score is not None else label
    if quiz_type == "leadership":
        return str(item.get("outcome_title") or "")
    return str(item.get("career_path_title") or item.get("readiness_label") or "")


def _consent(item: dict) -> str:
    value = item.get("contact_consent")
    if value is True:
        return "Yes"
    if value is False:
        return "No"
    return "Not asked"


def _notes(item: dict, quiz_type: str) -> str:
    info = QUIZ_INFO[quiz_type]
    lines = [f"{info['quiz']} result: {result_text(item, quiz_type)}"]
    if quiz_type == "home_sale":
        if item.get("listing_timing"):
            lines.append(f"Listing timing: {item['listing_timing']}")
        priorities = item.get("priorities") or []
        if priorities:
            lines.append("Top priorities: " + "; ".join(str(p) for p in priorities[:5]))
    for qa in item.get("answer_summary") or []:
        lines.append(f"Q: {qa.get('question', '')} A: {qa.get('answer', '')}")
    if item.get("lead_source"):
        lines.append(f"Came from: {item['lead_source']}")
    if item.get("contact_consent_text"):
        lines.append(f"Agreed to: {item['contact_consent_text']}")
    return "\n".join(lines)


def _county(item: dict) -> str:
    county = str(item.get("county") or "")
    return "" if county == "Other" else county


def _row(item: dict) -> list[str]:
    quiz_type = quiz_type_of(item)
    info = QUIZ_INFO.get(quiz_type, QUIZ_INFO["career"])
    first, last = _split_name(item.get("name"))
    return [
        first,
        last,
        str(item.get("email") or ""),
        _phone(item.get("phone")),
        info["source"],
        info["lead_type"],
        str(item.get("town") or ""),
        _county(item),
        "NJ" if quiz_type == "home_sale" and (item.get("town") or item.get("county")) else "",
        _consent(item),
        _local_time(item.get("contact_consent_at")),
        info["quiz"],
        result_text(item, quiz_type),
        _local_time(item.get("created_at")),
        _notes(item, quiz_type),
    ]


def _safe_cell(value: str) -> str:
    """Stop spreadsheet apps from running a cell as a formula (CSV injection)."""
    if value and value[0] in "=+-@\t\r":
        return "'" + value
    return value


def filter_submissions(
    items: list[dict],
    *,
    quiz: str | None = None,
    since: date | None = None,
    consent_only: bool = False,
) -> list[dict]:
    out = []
    for item in items:
        if quiz and quiz_type_of(item) != quiz:
            continue
        if consent_only and item.get("contact_consent") is not True:
            continue
        if since:
            created = str(item.get("created_at") or "")
            try:
                local_day = datetime.fromisoformat(created).astimezone(_LOCAL_TZ).date()
            except ValueError:
                continue
            if local_day < since:
                continue
        out.append(item)
    return out


def submissions_csv(items: list[dict]) -> str:
    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(COLUMNS)
    for item in items:
        writer.writerow([_safe_cell(v) for v in _row(item)])
    # Byte-order mark so Excel opens the file as UTF-8.
    return "﻿" + buffer.getvalue()
