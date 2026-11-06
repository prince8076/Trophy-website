import { useEffect, useRef, useState } from 'react';

// TrophyShatter — full-screen version, motion-studio only.
// Background is pure black on both sides: the blurred cover layer was
// removed at the user's request — no gold blur on the left/right, just
// the sharp trophy on black, at full 100vh. NO zoom: the 2.2x camera
// push-in was REVERTED at the user's request — it cropped the lid and
// base off-screen at full explosion, so whole pieces were not in
// frame. Drawing is plain contain-fit again, so every piece, lid to
// base, stays whole in frame at every scroll position. The only text is OVERLAID
// on top of the canvas (pointer-events: none), so it never shrinks
// the trophy: a small top-left label, and a large chapter word
// bottom-left that changes with scroll. No SCROLL pill, no frame
// counter, no bottom note bar, no "scroll to…" instruction.
// The canvas is the whole sticky stage, so the trophy fills the full
// height of the screen (its width is then ~56% of the height, which is
// as wide as a portrait trophy can go without cropping it). Only a thin lime
// progress line remains, and it is not text.
//
// How the shatter works — NO frame files at all (2026-11-07 rewrite):
// the old version needed 240 JPGs, then 80 generated WebP keyframes —
// both are binary files the user had to push via normal git, which is
// why the shatter never actually went live. This version shatters in
// the browser at runtime, from the one photo already in the repo:
// /trophies/championship-cup-prince.jpg (live, 200). On first approach
// it loads that single photo, cuts it into jittered grid shards once
// (offscreen canvases), then every scroll frame draws the shards with
// a translation + rotation driven by scroll progress — intact at the
// top, exploded at the bottom. Same look as the generated keyframes,
// zero new assets, zero git steps for the user, and the download is
// one ~260 KB photo instead of ~96 MB of frames. Nothing shatter-related
// downloads until the section is approached (IntersectionObserver below).
// Reduced motion: static cup photo only.
const BASE_W = 960;
const BASE_H = 540;
const COLS = 10;
const ROWS = 8;

const BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) || '/';
const CUP_URL = `${BASE}trophies/championship-cup-prince.jpg`;

// Deterministic RNG so the shard pattern is the same every visit.
function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Shard = {
  tile: HTMLCanvasElement; x0: number; y0: number; w: number; h: number;
  cx: number; cy: number; ux: number; uy: number; speed: number; rot: number;
};

// Cut the base (960x540, cup centred on black) into jittered grid shards.
function buildShards(base: HTMLCanvasElement): Shard[] {
  const rand = mulberry32(42);
  const cupH = 500;
  const cupW = Math.round(cupH * 1792 / 1344);
  const ox = Math.floor((BASE_W - cupW) / 2);
  const oy = Math.floor((BASE_H - cupH) / 2);
  const xs = Array.from({ length: COLS + 1 }, (_, i) => ox + Math.round(i * cupW / COLS));
  const ys = Array.from({ length: ROWS + 1 }, (_, j) => oy + Math.round(j * cupH / ROWS));
  const pts: Array<Array<[number, number]>> = [];
  for (let j = 0; j <= ROWS; j++) {
    const row: Array<[number, number]> = [];
    for (let i = 0; i <= COLS; i++) {
      const jx = i === 0 || i === COLS ? 0 : Math.round(rand() * 28 - 14);
      const jy = j === 0 || j === ROWS ? 0 : Math.round(rand() * 28 - 14);
      row.push([xs[i] + jx, ys[j] + jy]);
    }
    pts.push(row);
  }
  const cx0 = BASE_W / 2, cy0 = BASE_H / 2;
  const shards: Shard[] = [];
  const bctx = base.getContext('2d');
  for (let j = 0; j < ROWS; j++) {
    for (let i = 0; i < COLS; i++) {
      const poly = [pts[j][i], pts[j][i + 1], pts[j + 1][i + 1], pts[j + 1][i]];
      const x0 = Math.min(...poly.map((p) => p[0]));
      const y0 = Math.min(...poly.map((p) => p[1]));
      const x1 = Math.max(...poly.map((p) => p[0]));
      const y1 = Math.max(...poly.map((p) => p[1]));
      const w = x1 - x0, h = y1 - y0;
      if (w <= 0 || h <= 0) continue;
      // Skip (almost) all-black shards — invisible on a black background.
      if (bctx) {
        const data = bctx.getImageData(x0, y0, w, h).data;
        let max = 0;
        for (let k = 0; k < data.length; k += 16) if (data[k] > max) max = data[k];
        if (max < 18) continue;
      }
      const tile = document.createElement('canvas');
      tile.width = w; tile.height = h;
      const tctx = tile.getContext('2d');
      if (!tctx) continue;
      tctx.beginPath();
      tctx.moveTo(poly[0][0] - x0, poly[0][1] - y0);
      for (let k = 1; k < 4; k++) tctx.lineTo(poly[k][0] - x0, poly[k][1] - y0);
      tctx.closePath();
      tctx.clip();
      tctx.drawImage(base, -x0, -y0);
      const scx = poly.reduce((s, p) => s + p[0], 0) / 4;
      const scy = poly.reduce((s, p) => s + p[1], 0) / 4;
      const dx = scx - cx0, dy = scy - cy0;
      const dist = Math.hypot(dx, dy) || 1;
      shards.push({
        tile, x0, y0, w, h,
        cx: scx - x0, cy: scy - y0,
        ux: dx / dist, uy: dy / dist,
        speed: 0.6 + rand() * 0.9,
        rot: rand() * 140 - 70,
      });
    }
  }
  return shards;
}

// Meaningful chapter text, from the Shreeji Corporates company profile
// the user supplied (NOT invented): 20+ years, led by Ms. Madhu Sharma,
// trophies / awards / medals / mementos / corporate gifts, materials
// crystal / metal / acrylic / wood, end-to-end consultation / design /
// production / delivery, serving schools, sports, corporates, government
// and social bodies, based in New Delhi. The old one-word labels
// (Intact. / Cracks. / Breaking. …) are gone.
// The shatter is framed as a moment breaking open in celebration, never
// as a Shreeji trophy breaking — these are not fragile products.
const CHAPTERS = [
  { start: 0.0, end: 0.08, title: 'Crafted to perfection.', sub: 'One trophy, made to celebrate one achievement — with 20+ years of expertise behind it.' },
  { start: 0.08, end: 0.25, title: 'Every win has a story.', sub: 'Effort, discipline and belief — the moments Shreeji Corporates was built to honour.' },
  { start: 0.25, end: 0.5, title: 'The moment breaks open.', sub: 'A win, finally recognised — in crystal, metal, acrylic or wood, made to your vision.' },
  { start: 0.5, end: 0.75, title: 'Shared by many, owned by one.', sub: 'For schools, sports associations, corporates, government and social bodies — every sector, every occasion.' },
  { start: 0.75, end: 0.97, title: 'Recognition that reaches everyone.', sub: 'From consultation and design to production and delivery — end-to-end, under one roof.' },
  { start: 0.97, end: 1.01, title: 'We craft meaningful recognition.', sub: 'We don\u2019t just supply awards — we celebrate your success. Shreeji Corporates, New Delhi.' },
];

export default function TrophyShatter() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const chapterRef = useRef<HTMLDivElement | null>(null);
  const chapterSubRef = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);
  const [missing, setMissing] = useState(false);
  const [started, setStarted] = useState(false);
  const [reducedMotion] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  // Lazy start: the cup photo downloads only when the user scrolls
  // near the section (600px root margin), so initial page load
  // downloads nothing shatter-related.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setStarted(true); io.disconnect(); } },
      { rootMargin: '600px' },
    );
    io.observe(section);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (reducedMotion || !started) return undefined;
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;
    let cancelled = false;
    let raf = 0;
    let visible = true;
    let base: HTMLCanvasElement | null = null;
    let shards: Shard[] = [];

    // Load the cup photo (already in the repo) and cut it into shards once.
    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      const b = document.createElement('canvas');
      b.width = BASE_W; b.height = BASE_H;
      const bctx = b.getContext('2d');
      if (!bctx) { setMissing(true); return; }
      bctx.fillStyle = '#000000';
      bctx.fillRect(0, 0, BASE_W, BASE_H);
      const cupH = 500;
      const cupW = Math.round(cupH * img.width / img.height);
      bctx.drawImage(img, (BASE_W - cupW) / 2, (BASE_H - cupH) / 2, cupW, cupH);
      base = b;
      shards = buildShards(b);
      setReady(true);
      draw();
    };
    img.onerror = () => { if (!cancelled) setMissing(true); };
    img.src = CUP_URL;

    const resize = () => {
      const card = canvas.parentElement;
      if (!card) return;
      const rect = card.getBoundingClientRect();
      canvas.width = Math.floor(rect.width);
      canvas.height = Math.floor(rect.height);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      draw();
    };

    const draw = () => {
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(Math.max(-rect.top / (rect.height - vh), 0), 1);
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${p})`;
      if (chapterRef.current) {
        const c = CHAPTERS.find((ch) => p >= ch.start && p < ch.end) || CHAPTERS[CHAPTERS.length - 1];
        chapterRef.current.textContent = c.title;
        if (chapterSubRef.current) chapterSubRef.current.textContent = c.sub;
      }
      if (!base) return;
      const cw = canvas.width, ch = canvas.height;
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, cw, ch);
      // Contain-fit only — no zoom, no crop: whole pieces in frame.
      const scale = Math.min(cw / BASE_W, ch / BASE_H);
      const ox = (cw - BASE_W * scale) / 2;
      const oy = (ch - BASE_H * scale) / 2;
      // Intact for the first 12% of the scroll, then explode.
      const raw = Math.max(0, (p - 0.12) / 0.88);
      const d = raw * raw * (3 - 2 * raw); // smoothstep
      if (d <= 0) {
        ctx.drawImage(base, ox, oy, BASE_W * scale, BASE_H * scale);
        return;
      }
      for (const s of shards) {
        const move = d * 260 * s.speed;
        const dx = s.ux * move;
        const dy = s.uy * move + d * d * 140; // slight fall
        const ang = (s.rot * d * Math.PI) / 180;
        ctx.save();
        ctx.translate(ox + (s.x0 + s.cx + dx) * scale, oy + (s.y0 + s.cy + dy) * scale);
        ctx.rotate(ang);
        ctx.drawImage(s.tile, -s.cx * scale, -s.cy * scale, s.w * scale, s.h * scale);
        ctx.restore();
      }
    };

    const onScroll = () => {
      if (!visible) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(draw);
    };

    const observer = new IntersectionObserver(
      ([entry]) => { visible = entry.isIntersecting; if (visible) onScroll(); },
      { threshold: 0 },
    );
    observer.observe(section);

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', resize);
    requestAnimationFrame(resize);
    draw();

    return () => {
      cancelled = true;
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(raf);
    };
  }, [reducedMotion, started]);

  if (reducedMotion) {
    return (
      <section className="shatter" id="shatter" ref={sectionRef}>
        {started ? (
          <img src={CUP_URL} alt="Championship Cup trophy" loading="lazy" style={{ width: '100%', height: '100vh', objectFit: 'contain', display: 'block', background: '#000000' }} />
        ) : (
          <div style={{ width: '100%', height: '100vh', background: '#000000' }} />
        )}
      </section>
    );
  }

  return (
    <section className="shatter" id="shatter" ref={sectionRef}>
      <div className="shatter-sticky">
        <div className="shatter-canvas-wrap">
          {!ready && !missing && <div className="shatter-loading" />}
          {missing && (
            <div className="shatter-missing">
              <img src={CUP_URL} alt="Championship Cup trophy" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', background: '#000000' }} />
            </div>
          )}
          <canvas ref={canvasRef} className="shatter-canvas" />
          <div className="shatter-overlay-label">Shreeji Corporates — Trophies, Awards &amp; Mementos</div>
          <div className="shatter-overlay-chapter-block">
            <div className="shatter-overlay-chapter" ref={chapterRef}>Crafted to perfection.</div>
            <div className="shatter-overlay-sub" ref={chapterSubRef}>One trophy, made to celebrate one achievement — with 20+ years of expertise behind it.</div>
          </div>
        </div>
        <div className="shatter-progress" ref={progressRef} />
      </div>
    </section>
  );
}
