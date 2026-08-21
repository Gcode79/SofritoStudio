// Recipe-photo sync pipeline.
//
// Objective: every recipe has its own unique photo (no duplicates). Source
// photos are named rec-<dish>.jpg and placed in deploy2/images/ (the staging
// source of truth). This script:
//   1. derives the canonical required set from the blog HTML references,
//   2. finds any rec-<dish>.jpg already present in deploy2/images/,
//   3. converts .jpg -> .webp (Pillow) where the HTML references .webp,
//   4. syncs both into deploy/images/ and the repo-root images/,
//   5. reports which recipes are still missing photos.
//
// Usage: node tools/sync-recipe-photos.js
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const DEP = path.join(ROOT, "deploy");
const DEP2 = path.join(ROOT, "deploy2");
const BLOG = path.join(DEP, "blog");
const IMG = path.join(ROOT, "images");
const SRC = path.join(DEP2, "images");   // staging source for new photos
const DST = path.join(DEP, "images");    // merged deploy target

// 1. Collect the required set from blog HTML.
const req = {}; // dish -> { jpg: bool, webp: bool }
const refs = [];
[path.join(BLOG, "*.html"), path.join(DEP, "blog.html")].forEach(pat => {
  // glob manually
  let files = [];
  if (pat.includes("*")) {
    const dir = path.dirname(pat), base = path.basename(pat).replace(".html", "");
    files = fs.readdirSync(dir).filter(f => f.endsWith(".html")).map(f => path.join(dir, f));
  } else {
    files = [pat];
  }
  files.forEach(f => {
    if (!fs.existsSync(f)) return;
    const html = fs.readFileSync(f, "utf8");
    const m = html.match(/rec-([a-z0-9-]+)\.(jpg|webp)/g) || [];
    m.forEach(r => {
      const mm = r.match(/rec-([a-z0-9-]+)\.(jpg|webp)/);
      const dish = mm[1], ext = mm[2];
      req[dish] = req[dish] || { jpg: false, webp: false };
      req[dish][ext] = true;
      refs.push(r);
    });
  });
});

const dishes = Object.keys(req).sort();
console.log("Required recipe photos: " + dishes.length);

// 2. Convert jpg -> webp for any source jpg that exists in SRC.
let converted = 0;
dishes.forEach(d => {
  const jpg = path.join(SRC, `rec-${d}.jpg`);
  const webp = path.join(SRC, `rec-${d}.webp`);
  if (req[d].webp && !fs.existsSync(webp) && fs.existsSync(jpg)) {
    try {
      execSync(`python -c "from PIL import Image; Image.open(r'${jpg}').save(r'${webp}', 'WEBP', quality=82)"`);
      converted++;
    } catch (e) {
      console.log("  webp FAILED: " + d);
    }
  }
});
if (converted) console.log("Converted " + converted + " jpg -> webp");

// 3. Sync existing source files into DST and repo-root IMG.
const copyInto = (dir, name) => {
  const src = path.join(SRC, name);
  const dst = path.join(dir, name);
  if (fs.existsSync(src)) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.copyFileSync(src, dst);
    return true;
  }
  return false;
};
let synced = 0;
dishes.forEach(d => {
  ["jpg", "webp"].forEach(ext => {
    if (req[d][ext]) {
      if (copyInto(DST, `rec-${d}.${ext}`)) synced++;
      if (copyInto(IMG, `rec-${d}.${ext}`)) synced++;
    }
  });
});
console.log("Synced " + synced + " files into deploy/images/ + root images/");

// 4. Report missing.
const missing = dishes.filter(d => !fs.existsSync(path.join(DST, `rec-${d}.jpg`)));
if (missing.length) {
  console.log("\nMISSING recipe photos (" + missing.length + ") - drop rec-<dish>.jpg into deploy2/images/ and re-run:");
  missing.forEach(d => console.log("  rec-" + d + ".jpg"));
} else {
  console.log("\nAll recipe photos present.");
}

// 5. Verify all references resolve in the deploy tree.
const bad = refs.filter(r => !fs.existsSync(path.join(DST, r)));
console.log("Verification: " + refs.length + " blog references, " + bad.length + " unresolved.");
bad.forEach(b => console.log("  MISSING " + b));