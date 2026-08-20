"""Sofrito Studio — 30-day bilingual content calendar (JSON).

Generates social_automation/content_calendar.json with 30 items, each
carrying bilingual captions, hashtags, and a Reels script prompt (faceless
food-video style with voiceover), plus the dish/CTA.

Usage:
    python social_automation/generate_calendar.py
"""

import json
import sys
from datetime import date, timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

OUT = Path(__file__).resolve().parent / "content_calendar.json"

DISHES = [
    {
        "dish": "Mofongo", "es": "Mofongo",
        "promo_en": "Crispy green plantains, garlic, chicharrón — the comfort classic.",
        "promo_es": "Plátanos verdes crujientes, ajo y chicharrón: el clásico.",
        "voiceover_en": "Watch me make authentic Puerto Rican mofongo — plantains, garlic, and a crispy dome that tastes like home.",
        "voiceover_es": "Mira cómo hago mofongo puertorriqueño — plátanos, ajo y una cúpula crujiente que sabe a hogar.",
        "tags": "#mofongo #puertorico #puertoricanfood #cocina #recipe",
        "prompt": "Overhead food photography of a rustic mofongo dome stuffed with garlic shrimp, warm natural light, steam rising",
    },
    {
        "dish": "Arroz con Gandules", "es": "Arroz con gandules",
        "promo_en": "The one-pot rice and pigeon peas dish that anchors every Nochebuena table.",
        "promo_es": "El arroz con gandules que ancla cada mesa de Nochebuena.",
        "voiceover_en": "Arroz con gandules is Puerto Rico's national dish — here's the one-pot method that never fails.",
        "voiceover_es": "El arroz con gandules es el plato nacional — aquí el método de una sola olla que nunca falla.",
        "tags": "#arrozcongandules #puertoricanrice #nochebuena #latinfood",
        "prompt": "Cast iron pot of golden arroz con gandules with pigeon peas and olives, steam rising, vibrant orange rice",
    },
    {
        "dish": "Pernil", "es": "Pernil",
        "promo_en": "Slow-roasted pork shoulder with garlic mojo that fills the house.",
        "promo_es": "Pernil asado con mojo de ajo que llena la casa.",
        "voiceover_en": "The holiday centerpiece — slow-roasted pernil with shattering skin and garlic mojo.",
        "voiceover_es": "El centro de mesa de las fiestas — pernil asado con piel crujiente y mojo de ajo.",
        "tags": "#pernil #pernilrecipe #puertorico #holidaycooking",
        "prompt": "Close-up of slow-roasted pernil with golden crackling skin, garlic mojo drips, dramatic warm lighting",
    },
    {
        "dish": "Coquito", "es": "Coquito",
        "promo_en": "Coconut, cinnamon, and rum — Puerto Rico's answer to eggnog.",
        "promo_es": "Coco, canela y ron: la respuesta puertorriqueña al eggnog.",
        "voiceover_en": "This coquito recipe is smoother than store-bought and tastes like a Puerto Rican Christmas.",
        "voiceover_es": "Esta receta de coquito es más suave que la comprada y sabe a Navidad puertorriqueña.",
        "tags": "#coquito #holidaydrink #puertorico #navidad",
        "prompt": "Festive glass of creamy coquito with coconut flakes and cinnamon stick, warm bokeh lights",
    },
    {
        "dish": "Tostones", "es": "Tostones",
        "promo_en": "Twice-fried green plantains — the double-fry secret for maximum crunch.",
        "promo_es": "Plátanos verdes fritos dos veces: el secreto del crujido perfecto.",
        "voiceover_en": "The trick to perfect tostones is the double fry — low then high. Here's exactly how.",
        "voiceover_es": "El truco para unos tostones perfectos es freírlos dos veces — primero bajo, luego alto.",
        "tags": "#tostones #plantains #puertoricanfood #crispy",
        "prompt": "Stack of golden twice-fried tostones with garlic mojo dipping sauce, sprinkled with salt, warm light",
    },
    {
        "dish": "Pasteles", "es": "Pasteles",
        "promo_en": "The banana-leaf wrapped holiday staple — plus the shortcuts that make it doable.",
        "promo_es": "El clásico navideño envuelto en hoja de guineo, con atajos.",
        "voiceover_en": "Pasteles are a holiday labor of love — here's how to make them (with the time-saving shortcuts).",
        "voiceover_es": "Los pasteles son una labor de amor — aquí cómo hacerlos con atajos.",
        "tags": "#pasteles #puertoricancooking #holidayfood #navidad",
        "prompt": "Puerto Rican pasteles wrapped in banana leaves on a festive table, holiday setting",
    },
]


def main() -> None:
    start = date.today()
    items = []
    channels = ["pinterest", "instagram", "tiktok", "facebook", "blog"]
    for i in range(30):
        d = start + timedelta(days=i)
        dish = DISHES[i % len(DISHES)]
        channel = channels[i % len(channels)]
        items.append({
            "date": d.isoformat(),
            "channel": channel,
            "format": "pin" if channel == "pinterest" else ("article" if channel == "blog" else "reel"),
            "dish": dish["dish"],
            "title_en": f"{dish['dish']} Done Right",
            "title_es": f"{dish['es']} bien hecho",
            "caption_en": f"{dish['promo_en']}\n\nGet the step-by-step: https://sofritostudio.com/products.html",
            "caption_es": f"{dish['promo_es']}\n\nConsigue el paso a paso: https://sofritostudio.com/products.html",
            "reel_voiceover_en": dish["voiceover_en"],
            "reel_voiceover_es": dish["voiceover_es"],
            "hashtags": dish["tags"],
            "image_prompt": dish["prompt"],
            "cta": "https://sofritostudio.com/products.html",
            "status": "draft",
        })
    OUT.write_text(json.dumps(items, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Generated {len(items)} bilingual content items -> {OUT}")


if __name__ == "__main__":
    main()
