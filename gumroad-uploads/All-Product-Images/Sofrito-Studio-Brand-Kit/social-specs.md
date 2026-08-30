# Sofrito Studio — Social Platform Specs

Canonical handles: **Instagram** @pr.sofritostudio · **Facebook** /SofritoStudio · **TikTok** @sofritostudio (to confirm)

Files are pre-labeled and grouped by platform in this kit (`facebook/`, `instagram/`, `tiktok/`).

---

## Facebook  (`facebook/`)
| Asset | Size (px) | File |
|---|---|---|
| Page cover photo | **851 × 315** (min 820 × 312) | `cover-851x315.png` / `.jpg` |
| Profile picture | **170 × 170** (upload 320×320 for retina) | `profile-170x170.png` |
| Feed / shared-link image | **1200 × 630** | — |
| Square feed post | 1080 × 1080 | — |
| Story | 1080 × 1920 | `../instagram/reel-story-1080x1920.png` |

**Cover safe zone:** keep text/logo clear of the bottom-left ~170×170 profile-picture area.

## Instagram  (`instagram/`)
| Asset | Size (px) | File |
|---|---|---|
| Profile picture | **320 × 320** | `profile-320x320.png` |
| Square feed | **1080 × 1080** | — |
| Portrait feed | **1080 × 1350** (4:5) | — |
| Landscape feed | **1080 × 566** | — |
| Reels / Stories | **1080 × 1920** (9:16) | `reel-story-1080x1920.png` |

**Reels safe zones:** captions/UI overlap top (~250px) and bottom (~340px) — keep key content in the middle.

## TikTok  (`tiktok/`)
| Asset | Size (px) | File |
|---|---|---|
| Profile picture | **200 × 200** | `profile-200x200.png` |
| Videos | **1080 × 1920** (9:16) | `reel-story-1080x1920.png` |
| Video cover/thumbnail | 1080 × 1920 | `reel-story-1080x1920.png` |

**Safe zones:** right-side UI (caption, buttons) overlaps bottom-right ~120px; top ~150px for clock/battery; keep hooks centered.

---

## One template fits all verticals
`reel-story-1080x1920.png` (in `instagram/` + `tiktok/`, plus a copy at the kit root) is the branded 9:16 base — red gradient + badge + wordmark — usable for **IG Reels, IG Stories, and TikTok**; add captions/overlay hooks around the center-safe area.

## Format rules
- Logos ship as **SVG** (vector) **+ PNG** (raster) at the kit root — use PNG for social uploads.
- Save covers/thumbnails as **PNG or JPG (quality ≥ 90)**; export at 2× for retina where supported.
- Keep the logo ≥ clear space = badge height on all sides; never stretch or recolor.