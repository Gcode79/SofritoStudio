"""
Sofrito Studio — weekly content calendar generator.

Writes marketing/content_calendar/calendar.md: the next 4 weeks of daily
content themes mapped to the store tiers + social queue. Idempotent and
safe to run any day — regenerates the rolling window on each run.

Run:  python content_calendar.py
"""
import datetime
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
OUT = ROOT / "marketing" / "content_calendar" / "calendar.md"

# Daily theme rotation (Mon-Sun) — dish/angle -> product tier tie-in
WEEK_THEMES = [
    ("Monday", "Sofrito batch day", "starter-kit"),
    ("Tuesday", "Weeknight arroz con pollo", "mesa"),
    ("Wednesday", "Mainland ingredient swaps", "starter-kit"),
    ("Thursday", "Holiday planning (Nochebuena)", "full-table"),
    ("Friday", "Coquito & postres", "mesa"),
    ("Saturday", "Kitchen systems & meal-prep", "kitchen-bundle"),
    ("Sunday", "Family table storytelling", "starter-kit"),
]

TIER_TAG = {
    "starter-kit": "Starter Kit $9",
    "mesa": "La Mesa $47",
    "kitchen-bundle": "Kitchen Bundle $67",
    "full-table": "Full Table $97",
}


def main():
    today = datetime.date.today()
    start = today - datetime.timedelta(days=today.weekday())  # this week's Monday

    lines = ["# Sofrito Studio — Content Calendar", ""]
    lines.append(f"Generated: {today.isoformat()} (rolling 4-week window)")
    lines.append("")

    for week in range(4):
        monday = start + datetime.timedelta(weeks=week)
        lines.append(f"## Week of {monday.isoformat()}")
        for offset, (day, theme, tier) in enumerate(WEEK_THEMES):
            date = monday + datetime.timedelta(days=offset)
            lines.append(f"- **{day} {date.isoformat()}** — {theme}  *→ {TIER_TAG[tier]}*")
        lines.append("")

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text("\n".join(lines), encoding="utf-8")
    print("wrote", OUT)


if __name__ == "__main__":
    main()