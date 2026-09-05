# Seasonal promo (S11)

Prompt for a Thanksgiving/Black Friday/Christmas campaign aimed at food brands.
Use with `generate-newsletter.js` or directly in Make's text module.

```
Write 2-3 owning-list email variants for <holiday> for a food-brand studio.
Audience: small restaurants and specialty food makers.

Each variant:
- Subject (max 45 chars)
- 80-120 words, warm and direct, PR register when Spanish
- One concrete offer tied to <package> (e.g. "Sofrito branding before the
  holiday rush")
- One honest reason why waiting until January will cost them the season

Never use: leverage, synergy, innovative, cutting-edge, passionate,
game-changer, delicious, authentic. No emojis.
```

Schedule (Make cron): send the week before the holiday, once, to `BUTTONDOWN_EMAIL`.