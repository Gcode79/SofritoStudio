# Sofrito Studio Architecture

```text
.
├── AGENTS.md
├── opencode.jsonc
├── .opencode/
│   └── agents/
│       ├── frontend.md
│       ├── backend.md
│       ├── growth.md
│       ├── seo-content.md
│       └── reviewer.md
│
├── src/                    # app/routes/pages
├── components/             # reusable UI
├── lib/                    # shared utilities and domain helpers
├── functions/              # Cloudflare server/edge endpoints
│
├── content/
│   ├── recipes/
│   ├── blog/
│   ├── guides/
│   └── email/
│
├── marketing/
│   ├── campaigns/
│   ├── experiments/
│   ├── research/
│   └── funnels/
│
├── remotion/
│   ├── compositions/
│   ├── assets/
│   └── renderers/
│
├── public/
│   ├── images/
│   └── fonts/
│
├── scripts/
├── tests/
│   ├── e2e/
│   └── unit/
│
└── docs/
    ├── analytics.md
    ├── experiments.md
    └── integrations.md
```

## Ownership

- `src`, `components`, `lib`: frontend agent
- `functions`: backend agent
- `content`: SEO/content agent
- `marketing`: growth agent
- `remotion`: frontend/content system + Remotion workflows
- `tests`, release decisions: reviewer
- `AGENTS.md`: cross-project rules
