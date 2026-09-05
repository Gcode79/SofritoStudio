// ============================================================
// Sofrito Studio — AI content generation library (shared)
// Job: 4c
// MCP: openrouter
// Last updated: 2026-09-04
// Usage: node scripts/ai-lib.js is not runnable alone — import it.
// Requires env: OPENROUTER_API_KEY
// ============================================================
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const BANNED = [
  'leverage',
  'synergy',
  'innovative',
  'cutting-edge',
  'passionate',
  'game-changer',
  'delicious',
  'authentic',
];

export const VOICE_SYSTEM = `You write copy for a brand studio that serves food businesses (restaurants, sides, food trucks, specialty food). The brand voice is warm, direct, non-corporate, and proud of its roots — the register of a bilingual Spanish-English (PR register) kitchen that respects the owner's time.

Rules (never break these):
- Short sentences. No adverbs where a verb does the job.
- Never use these words: ${BANNED.join(', ')}.
- Specific beats generic: one detail only the business would know beats five adjectives.
- When bilingual copy is requested, write English and Spanish side by side, both natural (never machine-like Castilian).
- Never pitch in the first message; give the reader one useful thing.
- Format plain text with simple markdown (## for subheads, - for bullets). No emojis unless asked for explicitly.`;

export async function askOpenRouter({ model, system = VOICE_SYSTEM, prompt, temperature = 0.7, maxTokens = 1200 }) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    throw new Error('OPENROUTER_API_KEY not set. Copy .env.example to .env (or export it) and add your key.');
  }
  const body = {
    model: model || process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini',
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: prompt },
    ],
    temperature,
    max_tokens: maxTokens,
  };
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`OpenRouter ${res.status}: ${t.slice(0, 300)}`);
  }
  const data = await res.json();
  return data.choices[0].message.content;
}

export function slugify(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-');
}

export function outPath(rel) {
  const base = path.resolve(__dirname, '..', 'content', 'queue');
  mkdirSync(path.dirname(path.join(base, rel)), { recursive: true });
  return path.join(base, rel);
}

export function writeContent(rel, content) {
  const full = outPath(rel);
  writeFileSync(full, content, 'utf8');
  return full;
}

export function loadTemplate(name) {
  const p = path.resolve(__dirname, '..', 'scripts', name);
  return readFileSync(p, 'utf8');
}

// Tiny markdown -> HTML for post bodies (headings, emphasis, lists, links).
export function mdToHtml(md) {
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const inline = (s) =>
    esc(s)
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" class="text-orange-600 underline underline-offset-2">$1</a>');
  const lines = md.split('\n');
  let html = '';
  let inUl = false;
  for (const line of lines) {
    const h = line.match(/^(#{1,3})\s+(.*)$/);
    if (h) {
      if (inUl) { html += '</ul>'; inUl = false; }
      const lvl = h[1].length;
      const cls = lvl === 1 ? 'font-serif text-2xl text-slate-900 mt-8 mb-3' : 'font-serif text-xl text-slate-900 mt-6 mb-2';
      html += `<h${lvl} class="${cls}">${inline(h[2])}</h${lvl}>`;
      continue;
    }
    if (/^\s*-\s+/.test(line)) {
      if (!inUl) { html += '<ul class="mt-4 space-y-2 list-disc pl-6">'; inUl = true; }
      html += `<li>${inline(line.replace(/^\s*-\s+/, ''))}</li>`;
      continue;
    }
    if (inUl) { html += '</ul>'; inUl = false; }
    if (line.trim() === '') { html += '<p class="mt-4"></p>'; continue; }
    html += `<p class="mt-4">${inline(line)}</p>`;
  }
  if (inUl) html += '</ul>';
  return html;
}

export function postShell({ title, slug, description, datePublished, content }) {
  const base = loadTemplate('post-template.html');
  return base
    .replace('{{SLUG}}', slug)
    .replace('{{TITLE}}', title)
    .replace('{{DESC}}', description)
    .replace('{{DATE}}', datePublished)
    .replace('{{CONTENT}}', mdToHtml(content));
}