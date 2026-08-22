"""
Sofrito Studio — monthly re-engagement for past customers.

Sends a warm "still cooking?" email to buyers whose most recent purchase
was 21–50 days ago (a fresh cohort each month, no state needed). Runs from
.github/workflows/reengagement.yml on the 1st of the month.

Reuses the Gumroad sales fetch + language detection from
run_package_sequences.py. Sends via mailer (Resend-preferred).
"""

import os
import sys
import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from mailer.gmail_sender import send_email  # noqa: E402
from mailer.run_package_sequences import fetch_sales, sale_language  # noqa: E402

# Send to buyers whose most recent sale is 21-50 days old
MIN_AGE, MAX_AGE = 21, 50
DAYS_BACK = MAX_AGE + 5

CONTENT = {
    "en": (
        "Still cooking? Here's what's new at Sofrito Studio",
        "Hey — it's been a few weeks since your last order. Hope the sofrito's been flowing.\n\n"
        "A few things that are new on the site:\n\n"
        "• New seasonal guides — Thanksgiving Boricua and Navidad Boricua are reader favorites\n"
        "• The membership — a new member-only recipe and printable every month\n"
        "• Fresh free recipes on the blog, every week\n\n"
        "If there's a dish you've been wanting to master, just reply and tell me — "
        "I read every message and it genuinely shapes what I publish next.\n\n"
        "Buen provecho,\n— Josh, Sofrito Studio",
    ),
    "es": (
        "¿Sigues cocinando? Esto es nuevo en Sofrito Studio",
        "Oye — pasaron unas semanas desde tu última compra. Espero que el sofrito no pare.\n\n"
        "Algunas cosas nuevas en el sitio:\n\n"
        "• Guías de temporada — Acción de Gracias Boricua y Navidad Boricua son favoritas de los lectores\n"
        "• La membresía — una receta nueva solo para miembros y un imprimible cada mes\n"
        "• Recetas gratis nuevas en el blog, cada semana\n\n"
        "Si hay un plato que quieras dominar, solo respóndeme y cuéntame — "
        "leo cada mensaje y de verdad define lo que publico después.\n\n"
        "Buen provecho,\n— Josh, Sofrito Studio",
    ),
}


def main() -> None:
    token = os.getenv("GUMROAD_ACCESS_TOKEN", "")
    if not token:
        print("GUMROAD_ACCESS_TOKEN not set; skipping.")
        return

    today = datetime.date.today()
    after = (today - datetime.timedelta(days=DAYS_BACK)).isoformat()
    sales = fetch_sales(token, after, today.isoformat())
    print(f"sales since {after}: {len(sales)}")

    # most recent sale age per buyer
    latest = {}
    for s in sales:
        email = s.get("email", "")
        if not email or s.get("refunded"):
            continue
        created = s.get("created_at", "")[:10]
        try:
            age = (today - datetime.date.fromisoformat(created)).days
        except Exception:
            continue
        if email not in latest or age < latest[email]["age"]:
            latest[email] = {"age": age, "sale": s}

    sent = 0
    for email, info in latest.items():
        age = info["age"]
        if not (MIN_AGE <= age <= MAX_AGE):
            continue
        lang = sale_language(info["sale"])
        subj, body = CONTENT[lang]
        try:
            send_email(email, subj, body)
            print(f"re-engaged d{age} [{lang}] -> {email}")
            sent += 1
        except Exception as e:
            print(f"  ! failed {email}: {str(e)[:100]}")

    print(f"done. re-engagement emails sent: {sent}")


if __name__ == "__main__":
    main()