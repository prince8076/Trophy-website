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
  // Re-encode at quality 70 to compress (the source is 307 KB at
  // 1280x1116; the hero renders it at ~420-600px wide). PageSpeed
  // 2026-11-17: q82 shipped 293 KB; q70 is ~240 KB with no visible
  // loss on the feathers (alpha preserved). Then a 640px mobile
  // variant for the hero's srcset (the mobile hero visual is max
  // 420px wide).
  await sharp(buf).webp({ quality: 70 }).toFile(path.join(TROPHIES, 'hero-golden-phoenix-transparent.webp'));
  log(`hero-golden-phoenix-transparent.webp (${meta.width}x${meta.height}, alpha, q70)`);
  await sharp(buf).resize(640).webp({ quality: 70 }).toFile(path.join(TROPHIES, 'hero-golden-phoenix-transparent-640.webp'));
  log('hero-golden-phoenix-transparent-640.webp (640px mobile variant)');
}

async function buildNewProductPhotos() {
  // The three regenerated catalogue photos (2026-11-07 redesign):
  // each has a DIFFERENT engraving, so the catalogue no longer shows
  // "Best Software Developer and Prince" on all six products. They
  // ship as base64 text (the push tool is text-only) and are decoded
  // here to the same paths the catalogue and the database already
  // use — so no catalogue code or DB change is needed; the deployed
  // site simply serves the new photo at the old URL. Each is a
  // 1200x900 JPEG on a pure black background (padded to 4:3, the
  // catalogue frame), matching the site's premium product standard.
  // Validates each decodes to a JPEG, otherwise warns and skips.
  // Runs BEFORE buildOgImage and buildWebpVariants, so those use
  // the new photos too. The other three products (Wooden Shield,
  // Acrylic Star, Silver Salver) still use the Prince photos until
  // their varied-engraving versions are generated.
  const jobs = [
    ['championship-cup-new.jpg.b64', 'championship-cup-prince.jpg'],
    ['crystal-tower-new.jpg.b64', 'crystal-tower-prince.jpg'],
    ['crystal-globe-new.jpg.b64', 'crystal-globe-prince.jpg'],
    ['crystal-gold-new.jpg.b64', 'crystal-gold-prince.jpg'],
  ];
  for (const [b64Name, outName] of jobs) {
    const b64Path = path.join(ROOT, 'scripts', 'assets', b64Name);
    if (!existsSync(b64Path)) {
      warn(`${b64Name} missing, skipping ${outName}`);
      continue;
    }
    const b64 = (await readFile(b64Path, 'utf8')).trim();
    const buf = Buffer.from(b64, 'base64');
    const meta = await sharp(buf).metadata();
    if (meta.format !== 'jpeg') {
      warn(`${b64Name} decoded as ${meta.format}, not jpeg — skipping ${outName}`);
      continue;
    }
    await writeFile(path.join(TROPHIES, outName), buf);
    log(`${outName} (new photo, ${meta.width}x${meta.height})`);
  }
}

async function buildFlameWide() {
  // The WIDE flaming phoenix as ONE image (2026-11-16): the same
  // wide 16:9 golden phoenix (wings spread, transparent background)
  // that the lightweight PhoenixFlight showcase uses. It ships as
  // base64 text (the push tool is text-only) and is decoded here to
  // a static WebP with an alpha channel. This builder was MISSING
  // until 2026-11-16 — the file public/trophies/phoenix-flame-wide.webp
  // was never in the repo and never generated, so the phoenix section
  // showed a broken image (HTTP 404) on the live site. Validates it
  // decodes to a WebP WITH alpha; a flat WebP would put a white box
  // around the bird, so it warns and skips instead.
  const b64Path = path.join(ROOT, 'scripts', 'assets', 'phoenix-flame-wide.webp.b64');
  if (!existsSync(b64Path)) {
    warn('phoenix-flame-wide.webp.b64 missing, skipping phoenix-flame-wide.webp');
    return;
  }
  const b64 = (await readFile(b64Path, 'utf8')).trim();
  const buf = Buffer.from(b64, 'base64');
  const meta = await sharp(buf).metadata();
  if (meta.format !== 'webp' || !meta.hasAlpha) {
    warn(`phoenix-flame-wide.webp.b64 decoded as ${meta.format} (alpha: ${meta.hasAlpha}) — skipping`);
    return;
  }
  // PageSpeed 2026-11-17: the poster is fetched EAGERLY on page
  // load (video posters are not lazy), so its 249 KB competed with
  // the hero for first-paint bandwidth. Re-encode at 1600w q70
  // (~154 KB, alpha preserved): it is only the brief loading visual
  // and the video-failure fallback, so 1600w is plenty. The
  // fallback <img> in PhoenixFlight.tsx uses 1600x900 to match.
  await sharp(buf).resize(1600).webp({ quality: 70 }).toFile(path.join(TROPHIES, 'phoenix-flame-wide.webp'));
  log(`phoenix-flame-wide.webp (1600x900, alpha, q70)`);
}

async function buildFlameWideLayers() {
  // The WIDE flaming phoenix wing layers (2026-11-07): ONE wide
  // 16:9 phoenix (wings spanning the full screen), split into three
  // transparent WebP layers — left wing, body, right wing — so the
  // section can CLOSE the wings as you scroll by foreshortening
  // them (scaleX toward the body), NOT by rotating them. Rotation
  // was tried and failed: it swung the wingtips down-and-OUT into
  // an inverted-V and split the bird into panels. Foreshortening
  // (the wings compress toward the body, like folding back) has no
  // big arc and no diagonal cut edge. Two bugs from the rotation
  // attempt are fixed here: the body strip is wide (36-64%) so the
  // head is FULLY inside the body (no duplicate head), and every
  // strip boundary is FEATHERED (alpha fades over a ~4% band) so
  // there is no sharp vertical seam. They ship as base64 text (the
  // push tool is text-only) and are decoded here to static WebP
  // files with an alpha channel. Validates each decodes to a WebP
  // WITH alpha; a flat WebP would put a white box around the bird,
  // so it warns and skips instead.
  const jobs = [
    ['phoenix-wide-layer-wing-left.webp.b64', 'phoenix-wide-layer-wing-left.webp'],
    ['phoenix-wide-layer-body.webp.b64', 'phoenix-wide-layer-body.webp'],
    ['phoenix-wide-layer-wing-right.webp.b64', 'phoenix-wide-layer-wing-right.webp'],
  ];
  for (const [b64Name, outName] of jobs) {
    const b64Path = path.join(ROOT, 'scripts', 'assets', b64Name);
    if (!existsSync(b64Path)) {
      warn(`${b64Name} missing, skipping ${outName}`);
      continue;
    }
    const b64 = (await readFile(b64Path, 'utf8')).trim();
    const buf = Buffer.from(b64, 'base64');
    const meta = await sharp(buf).metadata();
    if (meta.format !== 'webp' || !meta.hasAlpha) {
      warn(`${b64Name} decoded as ${meta.format} (alpha: ${meta.hasAlpha}) — skipping ${outName}`);
      continue;
    }
    await writeFile(path.join(TROPHIES, outName), buf);
    log(`${outName} (${meta.width}x${meta.height}, alpha)`);
  }
}

async function buildMarbleBase() {
  // The marble base (2026-11-08): the polished black marble plinth
  // cropped from the hero's Golden Phoenix trophy — the brand's
  // real trophy base — on a full-size (1920x1080) transparent
  // canvas so it aligns exactly with the bird layers (same
  // coordinate system, same object-fit: contain). It sits at the
  // bottom centre, where the folded bird's tail meets it. The bird
  // layers render ON TOP of the base (z-index), so the tail and
  // feathers overlap the base's top edge — the bird stands ON the
  // base. It ships as base64 text (the push tool is text-only) and
  // is decoded here to a static WebP with an alpha channel.
  // Validates it decodes to a WebP WITH alpha.
  const b64Path = path.join(ROOT, 'scripts', 'assets', 'phoenix-marble-base.webp.b64');
  if (!existsSync(b64Path)) {
    warn('phoenix-marble-base.webp.b64 missing, skipping phoenix-marble-base.webp');
    return;
  }
  const b64 = (await readFile(b64Path, 'utf8')).trim();
  const buf = Buffer.from(b64, 'base64');
  const meta = await sharp(buf).metadata();
  if (meta.format !== 'webp' || !meta.hasAlpha) {
    warn(`phoenix-marble-base.webp.b64 decoded as ${meta.format} (alpha: ${meta.hasAlpha}) — skipping`);
    return;
  }
  await writeFile(path.join(TROPHIES, 'phoenix-marble-base.webp'), buf);
  log(`phoenix-marble-base.webp (${meta.width}x${meta.height}, alpha)`);
}

async function buildFlamePhoenixWhite() {
  // The flaming phoenix (2026-11-07): ONE golden phoenix on fire,
  // generated on a pure white background with its wings spread, the
  // white cut out by hand (border-connected flood fill on
  // near-white pixels, feathered) to a transparent WebP. It ships
  // as base64 text (the push tool is text-only) and is decoded here
  // to a static WebP with an alpha channel. Validates it decodes to
  // a WebP WITH alpha; a flat WebP would put a white box around the
  // bird, so it warns and skips instead.
  // NOTE: splitting this image into wing/body layers and rotating
  // the wings was TRIED and REVERTED — the rigid rotation split the
  // bird into visible panels (a duplicate head, a sharp vertical
  // seam, white gaps, and the wings tilting out into an inverted-V
  // instead of folding in). A true wing fold needs a video or a 3D
  // model, which this stack cannot generate, so the phoenix is one
  // image that rises and breathes instead.
  const b64Path = path.join(ROOT, 'scripts', 'assets', 'phoenix-flame-white.webp.b64');
  if (!existsSync(b64Path)) {
    warn('phoenix-flame-white.webp.b64 missing, skipping phoenix-flame-white.webp');
    return;
  }
  const b64 = (await readFile(b64Path, 'utf8')).trim();
  const buf = Buffer.from(b64, 'base64');
  const meta = await sharp(buf).metadata();
  if (meta.format !== 'webp' || !meta.hasAlpha) {
    warn(`phoenix-flame-white.webp.b64 decoded as ${meta.format} (alpha: ${meta.hasAlpha}) — skipping`);
    return;
  }
  await writeFile(path.join(TROPHIES, 'phoenix-flame-white.webp'), buf);
  log(`phoenix-flame-white.webp (${meta.width}x${meta.height}, alpha)`);
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
    // 400 / 800 / 1200 (the source JPGs are 1200x900 max, so 1200 is
    // the full-size WebP — no upscaling to 1600). The catalogue and
    // other sections use these via srcset (see src/lib/images.ts).
    // Quality 75 (was 82, PageSpeed 2026-11-17): the -400 variants
    // are already tiny; q75 trims the -800/-1200 ones ~20% with no
    // visible loss on product photos.
    for (const width of [400, 800, 1200]) {
      const out = path.join(TROPHIES, `${stem}-${width}.webp`);
      await sharp(src).resize(width).webp({ quality: 75 }).toFile(out);
    }
    log(`${stem}: -400.webp + -800.webp + -1200.webp`);
  }
}

// Placeholder images (2026-11-16) — for the What-we-make cards and
// the gallery, whose real photos the user has not supplied yet.
// Generated at build time from SVG (sharp composites text), so no
// binary has to be pushed. Each placeholder is written ONLY if the
// file does not already exist — so the user can drop a real photo
// into public/images/ (via git) and the build will keep it instead
// of overwriting it with the placeholder. The placeholder is a
// dark panel with an orange border and a label, so it reads as
// "photo coming soon" rather than a broken image.
async function buildGalleryPhotos() {
  // Real gallery photos (2026-11-17): the user flagged the black
  // "Photo coming soon" placeholders in the Gallery, so 4 real photos
  // were generated (workshop x2, engraving x2) and ship as base64
  // text (the push tool is text-only). They are decoded here to the
  // same /images/gallery-*.webp paths the Gallery already uses, so no
  // Gallery code change is needed for these 4. Runs BEFORE
  // buildPlaceholders, so the placeholder generator sees the real
  // files and skips them. The 2 "Past project" gallery items reuse
  // catalogue trophy photos instead (see Gallery.tsx). Validates each
  // decodes to a JPEG, otherwise warns and skips (the placeholder
  // will then be generated as before).
  const jobs = [
    ['gallery-workshop-1.jpg.b64', 'gallery-workshop-1.webp'],
    ['gallery-workshop-2.jpg.b64', 'gallery-workshop-2.webp'],
    ['gallery-engraving-1.jpg.b64', 'gallery-engraving-1.webp'],
    ['gallery-engraving-2.jpg.b64', 'gallery-engraving-2.webp'],
  ];
  const { mkdirSync } = await import('node:fs');
  mkdirSync(path.join(PUBLIC, 'images'), { recursive: true });
  for (const [b64Name, outName] of jobs) {
    const b64Path = path.join(ROOT, 'scripts', 'assets', b64Name);
    if (!existsSync(b64Path)) {
      warn(`${b64Name} missing, skipping ${outName}`);
      continue;
    }
    const b64 = (await readFile(b64Path, 'utf8')).trim();
    const buf = Buffer.from(b64, 'base64');
    const meta = await sharp(buf).metadata();
    if (meta.format !== 'jpeg') {
      warn(`${b64Name} decoded as ${meta.format}, not jpeg — skipping ${outName}`);
      continue;
    }
    await sharp(buf).webp({ quality: 70 }).toFile(path.join(PUBLIC, 'images', outName));
    log(`${outName} (real gallery photo, ${meta.width}x${meta.height}, q70)`);
  }
}

async function buildPlaceholders() {
  const dir = path.join(PUBLIC, 'images');
  const { mkdirSync } = await import('node:fs');
  mkdirSync(dir, { recursive: true });
  const jobs = [
    ['gifts.webp', 'Corporate Gifts', 'Photo coming soon'],
    ['materials.webp', 'Materials', 'Photo coming soon'],
    ['workshop.webp', 'End-to-end service', 'Photo coming soon'],
    ['gallery-workshop-1.webp', 'Workshop', 'Photo coming soon'],
    ['gallery-workshop-2.webp', 'Workshop', 'Photo coming soon'],
    ['gallery-engraving-1.webp', 'Engraving', 'Photo coming soon'],
    ['gallery-engraving-2.webp', 'Engraving', 'Photo coming soon'],
    ['gallery-project-1.webp', 'Past project', 'Photo coming soon'],
    ['gallery-project-2.webp', 'Past project', 'Photo coming soon'],
  ];
  for (const [name, title, sub] of jobs) {
    const out = path.join(dir, name);
    if (existsSync(out)) {
      log(`${name} already exists (real photo), keeping it`);
      continue;
    }
    const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
  <rect width="800" height="600" fill="#111111"/>
  <rect x="16" y="16" width="768" height="568" fill="none" stroke="#f97316" stroke-width="3" opacity="0.6"/>
  <text x="400" y="290" font-family="Arial, Helvetica, sans-serif" font-size="44" font-weight="700" fill="#ffffff" text-anchor="middle">${title}</text>
  <text x="400" y="340" font-family="Arial, Helvetica, sans-serif" font-size="24" fill="#f97316" text-anchor="middle">${sub}</text>
</svg>`);
    await sharp(svg).webp({ quality: 80 }).toFile(out);
    log(`placeholder ${name}`);
  }
}

await buildIcons();
await buildNewProductPhotos();
await buildOgImage();
await buildHeroPhoenix();
await buildHeroPhoenixTransparent();
await buildFlameWide();
await buildFlameWideLayers();
await buildMarbleBase();
await buildFlamePhoenixWhite();
await buildWebpVariants();
await buildGalleryPhotos();
await buildPlaceholders();
log('done');
