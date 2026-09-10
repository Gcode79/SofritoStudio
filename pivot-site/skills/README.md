# Sofrito Studio — Remotion Skill Pack

Branded Remotion/React guidance for producing video assets for the pivot site
(sofritostudio.com) and Sofrito Studio social content.

## Provenance

Adapted from the global `remotion-*` agent skills (Remotion official pack).
This project-local pack applies the Sofrito Studio brand rules in AGENTS.md:

- Design tokens (warm neutrals, earthy red, deep green, cream, natural
  wood/ceramic/paper, high-contrast conversion orange only for CTAs)
- Headings in serif, body/UI in sans-serif
- Realistic Social Visual Standard — no line art, vectors, clip art, or flat
  illustration; no AI imagery presented as real clients, venues, results,
  reviews, or completed projects
- On-Image Text & Spelling Protocol — Path A (deterministic text overlay) for
  any business-critical or more-than-5-word copy; no image-generated URLs,
  prices, dates, names, handles, or long headlines
- Scroll & Viewport constraints: 9:16 Reels/TikTok/Stories (1080×1920),
  4:5 Instagram feed/carousel (1080×1350), 1:1 square, LinkedIn composed
  separately
- Approval gate: all output is DRAFT — AWAITING FOUNDER APPROVAL

Excluded by directive: the legacy `remotion-abuelas-ipad` Starter Kit scaffold
and all "Abuela's iPad" ad content. This pack contains instructions only, no
ad/project content.

## Skills in this pack

| Skill | Purpose |
| --- | --- |
| `remotion-best-practices` | Router: which skill to load for a video task |
| `remotion-create` | Scaffold a project + composition (branded formats/tokens) |
| `remotion-render` | Render video/still with the CLI |
| `remotion-studio` | Open the Studio preview |
| `remotion-captions` | Generate, display, and import captions |
| `remotion-upgrade` | Upgrade Remotion + Mediabunny + skills |

Remotion's other global skills (docs, interactivity, maps, markup, multimedia,
saas) were intentionally NOT vendored. Load the global `remotion-*` skill
directly when one of those is the next task; any output must still obey the
AGENTS.md brand rules above.

## Registration

This pack lives in-repo under `pivot-site/skills/`. Individual tools/agents
discover skills from project `.agents/skills/` or `~/.agents/skills/`. To
activate, symlink or copy this directory into `pivot-site/.agents/skills/`
(or the agent's configured skill path):

```bash
# PowerShell
New-Item -ItemType Junction -Path "pivot-site\.agents\skills\remotion-best-practices" -Target "pivot-site\skills\remotion-best-practices"
```