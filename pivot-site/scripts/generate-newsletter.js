// ============================================================
// Sofrito Studio — generate the monthly customer newsletter
// Job: 4c
// MCP: openrouter
// Usage:
//   node scripts/generate-newsletter.js "theme or angle" [--months 3]
// Needs: OPENROUTER_API_KEY
// Output: content/queue/newsletter-<date>.md (copy, ready to paste
// into a Buttondown draft or owned digest).
// ============================================================
import { BANNED, askOpenRouter, writeContent } from './ai-lib.js';

const args = process.argv.slice(2);
const theme = args.find((a) => !a.startsWith('--')) || 'the food we shared this month';
const months = args.find((a) => a.startsWith('--months')) || '--months 3';

const prompt = `Write this month's customer newsletter for Sofrito Studio, a brand studio for food businesses (restaurants, CPG, food trucks, catering, specialty food). The reader is a food-business owner/operator. Theme: "${theme}".

Structure (plain markdown, no emojis, no ${BANNED.join(', ')}):
# <subject line>
- 120-180 words, one clear point, warm and direct, on-niche (food-business branding/marketing)
- A "what we learned / one story" section in second person
- A "what our clients are doing" line, generic and honest (no invented names)
- A single CTA: one link to sofritostudio.com/services.html
- IMAGE: <slug>-hero.jpg @1200px wide — subject/composition (email hero, content-guidelines.md §4, export 600-640px@2x)
- ALT: <screen-reader alt, max 125 chars>
- Sign-off: "Sofrito Studio — su marca se sirve como un plato."

Feel free to switch between English and Spanish naturally (Puerto Rican directness when Spanish).`;

const out = await askOpenRouter({ prompt, temperature: 0.8, maxTokens: 900 });
if (!/^IMAGE:\s*\S/m.test(out) || !/^ALT:\s*\S/m.test(out) || !out.includes('sofritostudio.com/services.html')) {
  console.error('gate failed — newsletter needs an IMAGE: line (email spec), an ALT: line, and the services.html CTA (content-guidelines.md §4/§9)');
  process.exit(1);
}
const p = writeContent(`newsletter-${new Date().toISOString().slice(0, 10)}.md`, out);
console.log('newsletter:', p);
console.log('done — review, then paste into Buttondown draft.');