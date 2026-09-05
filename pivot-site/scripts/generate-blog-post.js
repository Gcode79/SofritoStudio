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
CATEGORY: <four-or-fewer-word category label, e.g. Branding | Social | Launch | Storytelling>
---CONTENT---
<the essay markdown>`;

const out = await askOpenRouter({ prompt, temperature: 0.8, maxTokens: 1600 });

const m = out.match(/^TITLE:\s*(.+)$/m);
const d = out.match(/^DESC:\s*(.+)$/m);
const c = out.match(/^CATEGORY:\s*(.+)$/m);
const body = out.split('---CONTENT---')[1] || out;
const title = m ? m[1].trim() : topic;
const description = d ? d[1].trim() : title;
const category = (c ? c[1].trim() : 'Journal').slice(0, 40);
const slug = slugify(title);
const md = `# ${title}\n\n${body.trim()}\n`;
const mdPath = writeContent(`blog-${slug}.md`, md);
console.log('markdown:', mdPath);

// A card block matching the Journal grid's structure.
const card = (cat, t, desc, s) =>
  `      <a href="/blog/${s}.html" class="group rounded-xl bg-white ring-1 ring-slate-200 shadow-sm p-6 hover:ring-orange-300 hover:shadow-md transition">
        <p class="text-xs font-semibold uppercase tracking-widest text-slate-400">${cat}</p>
        <h2 class="mt-2 font-serif text-lg text-slate-900 group-hover:text-orange-700 transition">${t}</h2>
        <p class="mt-2 text-sm text-slate-600">${desc}</p>
      </a>`;

function updateBlogIndex() {
  const indexPath = path.resolve(__dirname, '..', 'public', 'blog', 'index.html');
  let html = readFileSync(indexPath, 'utf8');
  const newCard = card(category, title, description, slug);
  if (html.includes(`href="/blog/${slug}.html"`)) return console.log('index: already present');
  const marker = '<div class="mt-10 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">';
  if (!html.includes(marker)) return console.warn('index: grid marker not found, index not updated');
  html = html.replace(marker, `${marker}\n${newCard}`);
  writeFileSync(indexPath, html, 'utf8');
  console.log('index:', indexPath);
}

if (emit) {
  const html = postShell({ title, slug, description, datePublished: today, content: body.trim() });
  const dest = path.resolve(__dirname, '..', 'public', 'blog', `${slug}.html`);
  mkdirSync(path.dirname(dest), { recursive: true });
  writeFileSync(dest, html, 'utf8');
  console.log('post:', dest);
  updateBlogIndex();
}
console.log('done.');