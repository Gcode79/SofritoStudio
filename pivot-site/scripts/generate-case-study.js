// ============================================================
// Sofrito Studio — generate a case study from a client brief
// Job: 4d
// MCP: openrouter
// Usage:
//   node scripts/generate-case-study.js "restaurant x: before/after" 
// Needs: OPENROUTER_API_KEY
// Output: content/queue/case-<slug>.md (anonymized)
// ============================================================
import { BANNED, askOpenRouter, writeContent, slugify } from './ai-lib.js';

const args = process.argv.slice(2);
const brief = args.find((a) => !a.startsWith('--')) || 'a family-run food truck before/after a rebrand';

const prompt = `Write a short case study for Sofrito Studio (a brand studio for food businesses). Client theme: "${brief}".

Rules:
- ANONYMIZE: replace any real names with "Restaurante Boricua", "the salsa brand", "the supper club", etc. Never invent fake names, cities, or metrics.
- Where metrics are unknown, write "result" with a placeholder like "[measurement]" rather than inventing numbers.
- Plain markdown, 300-500 words:
## Before
## What we did (3 bullets, specific)
## After
## What they say
- Warm, direct, honest. Never use ${BANNED.join(', ')}. No emojis.`;

const out = await askOpenRouter({ prompt, temperature: 0.7, maxTokens: 900 });
const p = writeContent(`case-${slugify(brief.slice(0, 40))}.md`, out);
console.log('case study:', p);
console.log('done — review for sensitivity, then add to work.html.');