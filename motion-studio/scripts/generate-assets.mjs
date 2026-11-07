// generate-assets.mjs — build-time asset generator (2026-11-07).
// Why this exists: the assistant's GitHub push tool is TEXT-ONLY, so
// binary files (og-image.jpg, apple-touch-icon.png, favicon.ico, WebP
// variants) cannot be pushed to the repo. Instead, this script generates
// them at build time from assets that ARE in the repo (favicon.svg and
// the trophy JPGs), so the deployed site serves them. It runs as the
// `prebuild` step (package.json), before Vite copies public/ to dist/.
// It is idempotent and fast (a few seconds). If a source file is
// missing it logs a warning and skips that output instead of failing
// the build — the local copy, for example, does not have the Prince
// JPGs (the user pushed those via git), so the OG image falls back to
// another trophy photo locally. On Vercel the full repo is checked out,
// so all sources are present and every file is generated.
// Outputs:
//   public/apple-touch-icon.png — 180x180, from favicon.svg
//   public/favicon.ico — 16/32/48 PNGs packed into one ICO, from favicon.svg
//   public/og-image.jpg — 1200x630 branded (orange + cup photo + wordmark)
//   public/trophies/hero-golden-phoenix.webp — the hero visual, decoded
//     from scripts/assets/hero-golden-phoenix.webp.b64 (the Golden
//     Phoenix is a binary the text-only push tool cannot carry, so it
//     ships as base64 text and is decoded here at build time).
//   public/trophies/<stem>-400.webp and <stem>-800.webp (q82) for every
//     .jpg/.jpeg in public/trophies/ — the srcset variants the product
//     cards use (see TrophyCatalogue.tsx).
// The phoenix images are NOT touched here — they live as base64 in
// src/lib/ (phoenixTrophy.ts etc.) and are imported by the component.
// (The hero Golden Phoenix is a different image from the phoenix
// section's; it is decoded here, not bundled into the JS, so the
// first paint stays fast.)

import { readdirSync, existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const PUBLIC = path.join(ROOT, 'public');
const TROPHIES = path.join(PUBLIC, 'trophies');

const log = (...args) => console.log('[generate-assets]', ...args);
const warn = (...args) => console.warn('[generate-assets] WARNING:', ...args);

// Minimal ICO writer. An .ico file can embed PNG data directly: a
// 6-byte header, one 16-byte directory entry per image, then the PNG
// bytes. No extra dependency needed (sharp cannot write ICO).
function pngToIco(images) {
  const count = images.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(count, 4);
  const entries = [];
  const datas = [];
  let offset = 6 + 16 * count;
  for (const img of images) {
    const entry = Buffer.alloc(16);
    entry[0] = img.width >= 256 ? 0 : img.width;
    entry[1] = img.height >= 256 ? 0 : img.height;
    entry[2] = 0; // colour count
    entry[3] = 0; // reserved
    entry.writeUInt16LE(1, 4); // colour planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(img.data.length, 8);
    entry.writeUInt32LE(offset, 12);
    entries.push(entry);
    datas.push(img.data);
    offset += img.data.length;
  }
  return Buffer.concat([header, ...entries, ...datas]);
}

async function buildIcons() {
  const svgPath = path.join(PUBLIC, 'favicon.svg');
  if (!existsSync(svgPath)) {
    warn('favicon.svg missing, skipping apple-touch-icon + favicon.ico');
    return;
  }
  const svg = await readFile(svgPath);
  // Apple touch icon: the SVG rasterised at 180x180. The SVG already
  // has a solid orange background, so the PNG is opaque (as Apple wants).
  await sharp(svg).resize(180, 180).png().toFile(path.join(PUBLIC, 'apple-touch-icon.png'));
  log('apple-touch-icon.png (180x180)');
  // Favicon: 16/32/48 PNGs from the same SVG, packed into one .ico.
  const sizes = [16, 32, 48];
  const pngs = [];
  for (const size of sizes) {
    const data = await sharp(svg).resize(size, size).png().toBuffer();
    pngs.push({ width: size, height: size, data });
  }
  await writeFile(path.join(PUBLIC, 'favicon.ico'), pngToIco(pngs));
  log('favicon.ico (16/32/48)');
}

async function buildOgImage() {
  // Cup photo: prefer the Prince Championship Cup, fall back to any
  // trophy photo that exists (local copies lack the Prince JPGs).
  const candidates = [
    'championship-cup-prince.jpg',
    'trophy-featured.jpg',
    'championship-cup-real.jpg',
  ];
  let cupPath = null;
  for (const name of candidates) {
    const p = path.join(TROPHIES, name);
    if (existsSync(p)) { cupPath = p; break; }
  }
  if (!cupPath) {
    warn('no trophy photo found, skipping og-image.jpg');
    return;
  }
  // 1200x630, orange background, cup photo on the right, wordmark on
  // the left. Text is an SVG overlay (sharp composites SVG); the font
  // is a generic sans (librsvg fallback) — the wordmark is set in the
  // same Space Grotesk style on the site itself. The cup photo gets a
  // thin white frame (a white rect behind it) so the black-background
  // Prince cup reads as a framed product shot on the orange, not a
  // black box pasted on.
  const cup = await sharp(cupPath).resize(560, 560, { fit: 'cover', position: 'centre' }).toBuffer();
  const frame = await sharp({
    create: { width: 572, height: 572, channels: 3, background: '#ffffff' },
  }).png().toBuffer();
  const textSvg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <text x="60" y="185" font-family="Arial, Helvetica, sans-serif" font-size="96" font-weight="700" fill="#ffffff" letter-spacing="1">SHREEJI</text>
  <text x="60" y="250" font-family="Arial, Helvetica, sans-serif" font-size="52" font-weight="700" fill="#ffffff" letter-spacing="6">CORPORATES</text>
  <rect x="60" y="278" width="64" height="5" fill="#ffffff"/>
  <text x="60" y="330" font-family="Arial, Helvetica, sans-serif" font-size="30" fill="#ffffff">Trophies, Awards &amp; Mementos</text>
  <text x="60" y="372" font-family="Arial, Helvetica, sans-serif" font-size="24" fill="#ffffff" opacity="0.85">Let Us Celebrate Your Success — New Delhi</text>
</svg>`);
  await sharp({
    create: { width: 1200, height: 630, channels: 3, background: '#f97316' },
  })
    .composite([
      { input: frame, left: 594, top: 29 },
      { input: cup, left: 600, top: 35 },
      { input: textSvg, left: 0, top: 0 },
    ])
    .jpeg({ quality: 85 })
    .toFile(path.join(PUBLIC, 'og-image.jpg'));
  log(`og-image.jpg (1200x630, cup from ${path.basename(cupPath)})`);
}

async function buildHeroPhoenix() {
  // The Golden Phoenix hero visual ships as base64 text (the push
  // tool is text-only) and is decoded to a WebP here. It is a static
  // file, NOT bundled into the JS, so the hero's first paint is not
  // slowed by it. The image is 1280x960 (4:3, matches the hero
  // panel) on a pure black background — the panel is black too, so
  // the photo blends into the frame.
  const b64Path = path.join(ROOT, 'scripts', 'assets', 'hero-golden-phoenix.webp.b64');
  if (!existsSync(b64Path)) {
    warn('hero-golden-phoenix.webp.b64 missing, skipping hero phoenix');
    return;
  }
  const b64 = (await readFile(b64Path, 'utf8')).trim();
  const buf = Buffer.from(b64, 'base64');
  // Sanity check: it must decode to a WebP, otherwise do not write a
  // corrupt file (the hero would then show a broken image).
  const meta = await sharp(buf).metadata();
  if (meta.format !== 'webp') {
    warn(`hero phoenix decoded as ${meta.format}, not webp — skipping`);
    return;
  }
  await writeFile(path.join(TROPHIES, 'hero-golden-phoenix.webp'), buf);
  log(`hero-golden-phoenix.webp (${meta.width}x${meta.height})`);
}

async function buildHeroPhoenixTransparent() {
  // The transparent Golden Phoenix (the hero visual with no box —
  // it floats on the site's white background). Ships as base64
  // text (the push tool is text-only) and is decoded to a WebP
  // with an alpha channel here. It is a static file, NOT bundled
  // into the JS, so the hero's first paint is not slowed by it.
  // Validates it decodes to a WebP WITH alpha; a flat WebP would
  // put a box back around the bird, so it warns and skips instead.
  const b64Path = path.join(ROOT, 'scripts', 'assets', 'hero-golden-phoenix-transparent.webp.b64');
  if (!existsSync(b64Path)) {
    warn('hero-golden-phoenix-transparent.webp.b64 missing, skipping transparent hero phoenix');
    return;
  }
  const b64 = (await readFile(b64Path, 'utf8')).trim();
  const buf = Buffer.from(b64, 'base64');
  const meta = await sharp(buf).metadata();
  if (meta.format !== 'webp' || !meta.hasAlpha) {
    warn(`hero transparent phoenix decoded as ${meta.format} (alpha: ${meta.hasAlpha}) — skipping`);
    return;
  }
  await writeFile(path.join(TROPHIES, 'hero-golden-phoenix-transparent.webp'), buf);
  log(`hero-golden-phoenix-transparent.webp (${meta.width}x${meta.height}, alpha)`);
}

async function buildWebpVariants() {
  if (!existsSync(TROPHIES)) {
    warn('public/trophies/ missing, skipping WebP variants');
    return;
  }
  const files = readdirSync(TROPHIES).filter(
    (f) => /\.(jpe?g)$/i.test(f) && !/-(400|800|1200)\.jpe?g$/i.test(f),
  );
  for (const file of files) {
    const stem = file.replace(/\.(jpe?g)$/i, '');
    const src = path.join(TROPHIES, file);
    for (const width of [400, 800]) {
      const out = path.join(TROPHIES, `${stem}-${width}.webp`);
      await sharp(src).resize(width).webp({ quality: 82 }).toFile(out);
    }
    log(`${stem}: -400.webp + -800.webp`);
  }
}

await buildIcons();
await buildOgImage();
await buildHeroPhoenix();
await buildHeroPhoenixTransparent();
await buildWebpVariants();
log('done');
