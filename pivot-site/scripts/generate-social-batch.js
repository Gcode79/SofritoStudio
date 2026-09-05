// ============================================================
// Sofrito Studio — generate a week of social posts
// Job: 4b
// MCP: openrouter
// Usage:
//   node scripts/generate-social-batch.js "brief or theme" [--week]
// Needs: OPENROUTER_API_KEY
// Output: content/queue/social-week-<date>.md (7 captions, ready copy-paste)
// Note: actual publishing across channels is done by the Make.com
// automation (automations/make/README.md, scenario S7).
// ============================================================
import {
  BANNED,
  askOpenRouter,
  writeContent,
} from './ai-lib.js';

const args = process.argv.slice(2);
const brief = args.find((a) => !a.startsWith('--')) || 'a small food business that wants more locals to know they exist';
const week = args.includes('--week') ? new Date().toISOString().slice(0, 10) : 'this week';

const prompt = `You are a content lead for a food business. Write ${week}'s social plan. Business theme: "${brief}".

Output 7 posts, one per day, as plain markdown:
## Day <n> — <hook>
- Platform: <meta | tiktok | instagram | linkedin>
- Format: <photo | reel | carousel | text>
- Caption (max 180 words, warm and direct, EN)
- ES translation (same tone, Dominican Coastal register)
- 3 hashtags maximum, only if natural
- One-sentence reason this post earns attention

Rules: never use ${BANNED.join(', ')}. No emojis. Give an opinion, not a reminder.`;

const out = await askOpenRouter({ prompt, temperature: 0.9, maxTokens: 2000 });
const p = writeContent(`social-week-${new Date().toISOString().slice(0, 10)}.md`, out);
console.log('batch:', p);
console.log('done — review, then hand to Make scenario S7 to publish.');