import { useEffect, useRef, useState } from 'react';

// ------------------------------------------------------------------
// TrophyShatterScroll.jsx — v2, FORWARD, for the NEW frames the user
// pushed to frontend/public/framer-frames/ on branch
// framer-frames-scroll, commit c420e058 (2026-10-26, "Replace
// scroll trophy frames with 2x upscaled frames").
//
// This REPLACES the v1 reversed component. v1 played the OLD
// assembling sequence backwards. The new folder is a REAL
// shatter sequence, verified frame by frame:
//   frame 001: intact gold Webb Ellis Cup, blue studio background
//   frame 020: still intact
//   frame 040: cracks radiating across the cup
//   frame 080: breaking apart — lid off, handles flying
//   frame 150: major shatter, pieces midair
//   frame 250-300: full explosion, pieces suspended / fallen,
//                 base split — this is the end image
// Scroll: 0% -> 001 intact, 100% -> 300 shattered.
// Scrolling up reverses it. No autoplay, no loop, nothing
// moves when you stop scrolling — draw() only runs on
// scroll / resize / visibility change, via requestAnimationFrame.
//
// PERFORMANCE — read this before changing the preload:
// The new frames are 1440x2560 portrait, ~400-550 KB each,
// ~140 MB for all 300. A decoded frame is ~14 MB in memory.
// Preloading all 300 (what the old component did) would use
// ~4 GB decoded and crash mobile browsers. So this version
// NEVER preloads all frames. It keeps a windowed LRU cache
// of at most 28 decoded frames, prefetches ~12 ahead in the
// scroll direction, and evicts frames far from the current
// one. The browser's HTTP cache still holds the JPG bytes,
// so scrolling back is fast, but decoded memory stays bounded.
// Trade-off, stated plainly: a fast scroll into a section
// you have not visited yet will show the nearest cached
// frame for a beat while the exact frame downloads. That is
// the price of not crashing on 2x portrait frames. If you
// want the old all-preload behaviour back, resize the frames
// to ~720px wide first — do NOT just raise MAX_CACHE.
//
// Background: the frames are BLUE, not black. The section
// and canvas fill are blue (#0a2f8f) so the contain-fit
// pillarbox bars blend with the frame edges instead of
// showing black bars. Do not change this back to black
// without also changing the frames.
// ------------------------------------------------------------------

const FRAME_COUNT = 300;
const MAX_CACHE = 28;
const PREFETCH_AHEAD = 12;
const PREFETCH_BEHIND = 4;
const BG = '#0a2f8f';

const frameUrl = (i) =>
  `/framer-frames/ezgif-frame-${String(i + 1).padStart(3, '0')}.jpg`;

// Chapters, verified against the sampled frames above.
const CHAPTERS = [
  { start: 0.0, end: 0.08, title: 'Intact.', text: 'Perfect, still, metallic. Scroll to break it.' },
  { start: 0.08, end: 0.27, title: 'Cracks appear.', text: 'Hairline fractures spread across the cup.' },
  { start: 0.27, end: 0.5, title: 'Breaking apart.', text: 'Lid off, handles and body start to separate.' },
  { start: 0.5, end: 0.75, title: 'Major shatter.', text: 'Large chunks break away and float outward.' },
  { start: 0.75, end: 0.97, title: 'Full explosion.', text: 'Reflective pieces suspended in the air.' },
  { start: 0.97, end: 1.01, title: 'Shattered.', text: 'Scroll back up to restore it, piece by piece.' },
];

export default function TrophyShatterScroll({ onAddToBag, onEngrave }) {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const chapterRefs = useRef([]);
  const progressRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [missing, setMissing] = useState(false);
  const [reducedMotion] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useEffect(() => {
    if (reducedMotion) return undefined;
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return undefined;
    const ctx = canvas.getContext('2d');
    // LRU cache: Map keeps insertion order; re-insert on use.
    const cache = new Map();
    const loading = new Set();
    let cancelled = false;
    let lastDrawn = -1;
    let raf = 0;
    let visible = true;
    let failed = 0;

    const touch = (i, img) => {
      cache.delete(i);
      cache.set(i, img);
      while (cache.size > MAX_CACHE) {
        const oldest = cache.keys().next().value;
        if (oldest === lastDrawn) { cache.delete(oldest); cache.set(oldest, cache.get(oldest)); break; }
        cache.delete(oldest);
      }
    };

    const loadOne = (i) => {
      if (i < 0 || i >= FRAME_COUNT || cache.has(i) || loading.has(i)) return;
      loading.add(i);
      const img = new Image();
      img.onload = () => {
        loading.delete(i);
        if (cancelled) return;
        touch(i, img);
        if (i === 0) { setReady(true); draw(); }
      };
      img.onerror = () => {
        loading.delete(i);
        if (cancelled) return;
        failed += 1;
        if (failed > 10) setMissing(true);
      };
      img.src = frameUrl(i);
    };

    const prefetch = (idx) => {
      for (let d = 1; d <= PREFETCH_AHEAD; d++) loadOne(idx + d);
      for (let d = 1; d <= PREFETCH_BEHIND; d++) loadOne(idx - d);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      lastDrawn = -1;
      draw();
    };

    // Contain-fit: whole portrait frame always visible, never cropped.
    const draw = () => {
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(Math.max(-rect.top / (rect.height - vh), 0), 1);
      const idx = Math.min(Math.floor(p * FRAME_COUNT), FRAME_COUNT - 1);
      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${p})`;
      }
      loadOne(idx);
      prefetch(idx);
      if (idx === lastDrawn) return;
      let img = cache.get(idx);
      if (!img) {
        // Nearest cached frame, so a fast scroll never shows a blank box.
        for (let d = 1; d < FRAME_COUNT; d++) {
          if (cache.has(idx - d)) { img = cache.get(idx - d); break; }
          if (cache.has(idx + d)) { img = cache.get(idx + d); break; }
        }
      }
      if (!img) return;
      lastDrawn = idx;
      const cw = canvas.width, ch = canvas.height;
      const scale = Math.min(cw / img.width, ch / img.height);
      const dw = img.width * scale, dh = img.height * scale;
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, cw, ch);
      ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
      CHAPTERS.forEach((c, i) => {
        const el = chapterRefs.current[i];
        if (!el) return;
        const fade = 0.05;
        const inn = Math.min(Math.max((p - c.start) / fade, 0), 1);
        const out = Math.min(Math.max((c.end - p) / fade, 0), 1);
        const o = Math.min(inn, out);
        el.style.opacity = String(o);
        el.style.pointerEvents = o > 0.6 && i === CHAPTERS.length - 1 ? 'auto' : 'none';
      });
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

    loadOne(0);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', resize);
    resize();
    draw();

    return () => {
      cancelled = true;
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  if (reducedMotion) {
    return (
      <section style={{ background: BG, padding: '48px 24px', textAlign: 'center' }}>
        <img
          src={frameUrl(0)}
          alt="Intact gold trophy"
          style={{ maxWidth: 'min(720px, 92vw)', width: '100%', display: 'block', margin: '0 auto' }}
        />
        <p style={{ color: '#dbeafe', marginTop: 16 }}>
          Scroll animation is off for reduced-motion. The trophy is shown intact.
        </p>
      </section>
    );
  }

  return (
    <section ref={sectionRef} style={{ height: '500vh', position: 'relative', background: BG }}>
      <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden', background: BG }}>
        <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, display: 'block' }} />
        <div
          ref={progressRef}
          style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 2,
            background: '#d4af37', transformOrigin: 'left', transform: 'scaleX(0)', zIndex: 8,
          }}
        />
        {!ready && !missing && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dbeafe', fontSize: 14 }}>
            Loading shatter frames…
          </div>
        )}
        {missing && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24 }}>
            <div style={{ color: '#fff', maxWidth: 520 }}>
              <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Shatter frames not found</h2>
              <p style={{ color: '#dbeafe', fontSize: 14, lineHeight: 1.6 }}>
                Expected 300 JPGs at <code>frontend/public/framer-frames/</code> as
                <code> ezgif-frame-001.jpg … ezgif-frame-300.jpg</code> on this branch.
              </p>
            </div>
          </div>
        )}
        {CHAPTERS.map((c, i) => (
          <div
            key={c.title}
            ref={(el) => { chapterRefs.current[i] = el; }}
            style={{
              position: 'absolute', left: '50%', top: '10%', transform: 'translateX(-50%)',
              textAlign: 'center', width: 'min(560px, 90vw)', opacity: 0, zIndex: 6,
              textShadow: '0 2px 12px rgba(0,0,0,0.9)', pointerEvents: 'none',
            }}
          >
            <h2 style={{ fontFamily: 'Cinzel, serif', color: '#fff', fontSize: 32, margin: 0 }}>{c.title}</h2>
            <p style={{ color: '#dbeafe', marginTop: 8 }}>{c.text}</p>
            {i === CHAPTERS.length - 1 && (
              <div style={{ marginTop: 16, display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                {onAddToBag && (
                  <button type="button" onClick={onAddToBag} style={{ background: '#d4af37', border: 'none', padding: '12px 20px', borderRadius: 999, fontWeight: 800, cursor: 'pointer' }}>
                    Add to Bag
                  </button>
                )}
                {onEngrave && (
                  <button type="button" onClick={onEngrave} style={{ background: 'transparent', border: '1px solid #d4af37', color: '#ffe9a8', padding: '12px 20px', borderRadius: 999, cursor: 'pointer' }}>
                    Engraving Studio →
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
