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
const brief = args.find((a) => !a.startsWith('--')) || 'branding for food businesses that want more locals to know they exist';
const week = args.includes('--week') ? new Date().toISOString().slice(0, 10) : 'this week';

const prompt = `You are the content lead for Sofrito Studio, a brand studio for food businesses (restaurants, CPG, food trucks, catering, specialty food). Write ${week}'s social plan. Theme: "${brief}".

Every post must stay in that niche (food-business branding, menus, storytelling, website strategy, client culture) and steer one click toward sofritostudio.com — a service, a work piece, or the free Digital Guide. Discovery posts use a soft CTA; explicit CTA only on conversion posts.

Output 7 posts, one per day, as plain markdown:
## Day <n> — <hook>
- Platform: <meta | tiktok | instagram | linkedin>
- Format: <photo | reel | carousel | text>
- Caption (max 180 words, warm and direct, EN; names or links sofritostudio.com once, naturally)
- ES translation (same tone, Dominican Coastal register)
- 3 hashtags maximum, only if natural
- Attract: how this post sends one visitor to sofritostudio.com and what they would do there
- Image: <slug>.jpg @<exact platform pixels> — subject/composition
- Alt: <screen-reader alt, max 125 chars>

Image sizes (content-guidelines.md §2): Instagram 1080x1350 (square 1080x1080, story/reel 1080x1920), Facebook 1080x1350 or 1080x1080, LinkedIn 1200x1200, X 1600x900, Pinterest 1000x1500.

Rules: never use ${BANNED.join(', ')}. No emojis. Give an opinion, not a reminder.`;

const out = await askOpenRouter({ prompt, temperature: 0.9, maxTokens: 2000 });

const dayBlocks = out.split(/^## Day /m).slice(1);
if (dayBlocks.length < 7) {
  console.error(`gate: expected 7 posts, got ${dayBlocks.length}`);
  process.exit(1);
}
const problems = [];
for (const b of dayBlocks) {
  if (!/@\d+x\d+/.test(b)) problems.push('post missing Image: <slug>.jpg @<pixels>');
  if (!/^Alt:\s*\S/m.test(b)) problems.push('post missing Alt: line');
  if (!b.toLowerCase().includes('attract:') && !b.toLowerCase().includes('- attract')) problems.push('post missing Attract: steering line');
  if (!b.includes('sofritostudio.com')) problems.push('post does not steer to sofritostudio.com');
}
if (problems.length) {
  console.error(`gate failed (content-guidelines.md §8-10):\n  - ${[...new Set(problems)].join('\n  - ')}`);
  process.exit(1);
}

const p = writeContent(`social-week-${new Date().toISOString().slice(0, 10)}.md`, out);
console.log('batch:', p);
console.log('done — review, then hand to Make scenario S7 to publish.');