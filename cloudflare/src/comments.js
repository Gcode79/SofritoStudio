// Comment threads API — YouTube-style comments on recipe pages.
// Storage: Cloudflare D1 (binding "DB"). Sanitizes ALL user input server-side.
const MAX_NAME = 40;
const MAX_CONTENT = 2000;
const RECIPE_ID_RE = /^[a-z0-9\-_]{1,100}$/i;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

// Strip dangerous HTML/JS. Comments are rendered as plain text, so escaping
// < > " ' removes <script>, on* handlers, and javascript: URLs.
function sanitize(s) {
  s = String(s == null ? "" : s);
  s = s.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, ""); // control chars
  s = s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  s = s.replace(/javascript\s*:/gi, "javascript&#58;");
  s = s.replace(/&#x?[0-9a-f]{1,6}/gi, ""); // kill numeric entity smuggling
  return s.trim();
}

function validInput(body) {
  const recipeId = String((body && body.recipe_id) || "").trim();
  if (!RECIPE_ID_RE.test(recipeId)) return null;
  const authorName = sanitize(body.author_name).slice(0, MAX_NAME);
  const content = sanitize(body.content).slice(0, MAX_CONTENT);
  const parentId = body.parent_id ? String(body.parent_id).trim().slice(0, 64) : null;
  if (!authorName || !content) return null;
  return { recipeId, authorName, content, parentId };
}

function initialsAvatar(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const initials = (parts[0] && parts[0][0] ? parts[0][0] : "?") + (parts[1] && parts[1][0] ? parts[1][0] : "");
  let hue = 0;
  for (let i = 0; i < name.length; i++) hue = (hue + name.charCodeAt(i)) % 360;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=hsl(${hue},42%,46%)&color=fff&size=64&bold=true`;
}

export async function getComments(env, recipeId, sort) {
  if (!recipeId || !RECIPE_ID_RE.test(recipeId)) return json({ error: "invalid_recipe_id" }, 400);
  const top = sort === "top";
  const order = top
    ? "ORDER BY likes DESC, created_at DESC"
    : "ORDER BY created_at DESC";
  const { results: topLevel } = await env.DB.prepare(
    `SELECT * FROM comments WHERE recipe_id = ?1 AND parent_id IS NULL ${order}`
  ).bind(recipeId).all();
  const { results: all } = await env.DB.prepare(
    "SELECT * FROM comments WHERE recipe_id = ?1"
  ).bind(recipeId).all();
  const kids = {};
  all.forEach((c) => {
    if (c.parent_id) (kids[c.parent_id] = kids[c.parent_id] || []).push(c);
  });
  Object.values(kids).forEach((arr) =>
    arr.sort((a, b) => (b.created_at > a.created_at ? 1 : b.created_at < a.created_at ? -1 : b.likes - a.likes))
  );
  const build = (c) => ({
    id: c.id,
    parent_id: c.parent_id,
    author_name: c.author_name,
    avatar_url: c.avatar_url,
    content: c.content,
    likes: c.likes,
    created_at: c.created_at,
    replies: (kids[c.id] || []).map(build),
  });
  return json({
    recipe_id: recipeId,
    count: all.length,
    sort: top ? "top" : "new",
    comments: topLevel.map(build),
  });
}

export async function postComment(env, body) {
  const v = validInput(body);
  if (!v) return json({ error: "invalid_input" }, 400);
  if (v.parentId) {
    const parent = await env.DB.prepare(
      "SELECT 1 FROM comments WHERE id = ?1 AND recipe_id = ?2"
    ).bind(v.parentId, v.recipeId).first();
    if (!parent) return json({ error: "parent_not_found" }, 400);
  }
  const id = crypto.randomUUID();
  const created = new Date().toISOString();
  const avatar = initialsAvatar(v.authorName);
  await env.DB.prepare(
    "INSERT INTO comments (id, recipe_id, parent_id, author_name, avatar_url, content, likes, created_at) VALUES (?1,?2,?3,?4,?5,?6,0,?7)"
  ).bind(id, v.recipeId, v.parentId, v.authorName, avatar, v.content, created).run();
  return json(
    {
      ok: true,
      comment: {
        id,
        recipe_id: v.recipeId,
        parent_id: v.parentId,
        author_name: v.authorName,
        avatar_url: avatar,
        content: v.content,
        likes: 0,
        created_at: created,
      },
    },
    201
  );
}

export async function likeComment(env, id) {
  if (!id || String(id).length > 64) return json({ error: "invalid_input" }, 400);
  const row = await env.DB.prepare(
    "UPDATE comments SET likes = likes + 1 WHERE id = ?1 RETURNING likes"
  ).bind(String(id)).first();
  if (!row) return json({ error: "not_found" }, 404);
  return json({ ok: true, likes: row.likes });
}