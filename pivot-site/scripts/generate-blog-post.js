// ============================================================
// Sofrito Studio — generate a blog post (Journal essay)
// Job: 4a
// MCP: openrouter
// Usage:
//   node scripts/generate-blog-post.js "Title or angle" [--emit]
//   --emit also renders public/blog/<slug>.html from the post shell.
// Needs: OPENROUTER_API_KEY
// ============================================================
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import {
  __dirname,
  askOpenRouter,
  slugify,
  writeContent,
  postShell,
  BANNED,
} from './ai-lib.js';

const args = process.argv.slice(2);
const angle = args.find((a) => !a.startsWith('--')) || '';
const emit = args.includes('--emit');
const today = new Date().toISOString().slice(0, 10);

const ideas = ['food brand voice', 'menus that convert', 'why logos fail without a story', 'seasonal content for restaurants', 'the taste-first method'];
const topic = angle || ideas[Math.floor(Math.random() * ideas.length)];

const prompt = `Write a Journal essay for a food-business brand studio. Topic/angle: "${topic}".

Shape:
- A working title and a one-line description.
- 600-900 words. Start strong and specific (no "in today's world").
- Use plain markdown: ## subheads, - bullets, occasional **bold**.
- End with one concrete action the reader can do today.
- Never use these words: ${BANNED.join(', ')}. No emojis.

Output exactly this format:
TITLE: <title>
DESC: <one-line description>
---CONTENT---
<the essay markdown>`;

const out = await askOpenRouter({ prompt, temperature: 0.8, maxTokens: 1600 });

const m = out.match(/^TITLE:\s*(.+)$/m);
const d = out.match(/^DESC:\s*(.+)$/m);
const body = out.split('---CONTENT---')[1] || out;
const title = m ? m[1].trim() : topic;
const description = d ? d[1].trim() : title;
const slug = slugify(title);
const md = `# ${title}\n\n${body.trim()}\n`;
const mdPath = writeContent(`blog-${slug}.md`, md);
console.log('markdown:', mdPath);

if (emit) {
  const html = postShell({ title, slug, description, datePublished: today, content: body.trim() });
  const dest = path.resolve(__dirname, '..', 'public', 'blog', `${slug}.html`);
  mkdirSync(path.dirname(dest), { recursive: true });
  writeFileSync(dest, html, 'utf8');
  console.log('post:', dest);
}
console.log('done.');