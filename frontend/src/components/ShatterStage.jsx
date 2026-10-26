import { useEffect, useRef, useState } from 'react';

// ------------------------------------------------------------------
// ShatterStage.jsx — v8, fresh-design-v3 version.
//
// v8 changes, from the scrolling references the user sent
// (patterns only, no code/text/images copied from any of them):
//  1. COMPACT PIN. Section was 420vh; now 320vh. The pinned card
//     still scrubs reversibly, but it releases sooner into the
//     normal shopping flow instead of holding the page hostage
//     for a long corporate-style introduction.
//  2. MODEST SCALE, not a full-screen zoom. The canvas scales
//     1.00 -> 1.06 as progress goes 0 -> 1, so the trophy gains
//     a little depth mid-shatter without ever covering the
//     card, the controls, or the page around it.
//  3. WORD-BY-WORD CAPTIONS. Each chapter's sentence now fills
//     in word by word as you scroll through that chapter
//     (read words full opacity, unread words dim), instead of
//     the whole sentence fading in at once.
//  4. NO second scrub, ticker, or slider around the card — one
//     exceptional pinned moment, then ordinary vertical
//     shopping content. That discipline is the lesson from the
//     commerce-first references.
// v7 mechanics kept: 48 frames, contained 16:9 card, windowed
// LRU cache, blurred DOM background, glow peaking mid-shatter,
// bottom chapter pill, vermilion progress, reduced-motion
// static card, no autoplay/loop, fully reversible.
// NEW frames: 48 frames, 1600x900 landscape, made from ONE new
// trophy image (frontend/public/shatter-frames/shatter-frame-001.jpg
// … 048.jpg). 001 intact -> 048 fully broken into large pieces.
// The old 300 portrait blue frames in framer-frames/ are NOT used
// by this version — do not mix the two sequences.
// but presented completely differently, because v4 did not
// look good: a full-width blue wall with a narrow portrait
// strip in the middle.
//
// v5 fixes, in order of importance:
//  1. CONTAINED CARD, not a full-screen wall. The stage is a
//     max-width card (rounded 20px, thin #26262A border, charcoal
//     background) on the page's charcoal background. The blue
//     frames are now a framed preview inside that card, the way
//     preview cards work on the reference listing sites —
//     intentional, not a wall.
//  2. The card itself is the sticky element. Section height is
//     420vh, sticky card height is 82vh, so the card pins while
//     you scroll, then releases. The card is NOT inside any
//     overflow-hidden div (see the new HomePage: the stage sits
//     between two plain blocks, as a direct child of <main>).
//  3. Blurred background is a DOM <img> with CSS blur, updated
//     by ref — no canvas filter on every scroll frame, which
//     was heavy and could blank.
//  4. A soft peach-to-lavender glow behind the trophy, whose
//     opacity peaks mid-shatter (scroll 40-80%) and is zero at
//     intact and at fully shattered. The glow is used for one
//     moment only, not as a permanent theme.
//  5. Chapters are a bottom pill inside the card, fully visible
//     at scroll 0%, with a dark translucent background so the
//     text is readable over the trophy — not faint text at the
//     top clashing with the trophy head and the navbar.
//  6. No autoplay, no loop. Scroll progress maps directly to
//     frames, scrolling up reverses it. Windowed LRU cache
//     (max 28 decoded frames) — do NOT preload all 300, a
//     decoded 1440x2560 frame is ~14 MB.
//  7. Reduced motion: static card with frame 001 only.
// ------------------------------------------------------------------

const FRAME_COUNT = 48;
const MAX_CACHE = 28;
const PREFETCH_AHEAD = 12;
const PREFETCH_BEHIND = 4;

const BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) || '/';
const frameUrl = (i) =>
  `${BASE}shatter-frames/shatter-frame-${String(i + 1).padStart(3, '0')}.jpg`;

const CHAPTERS = [
  { start: 0.0, end: 0.08, title: 'Intact.', text: 'Perfect, still, metallic. Scroll to break it.' },
  { start: 0.08, end: 0.27, title: 'Cracks appear.', text: 'Hairline fractures spread across the cup.' },
  { start: 0.27, end: 0.5, title: 'Breaking apart.', text: 'Lid off, handles and body start to separate.' },
  { start: 0.5, end: 0.75, title: 'Major shatter.', text: 'Large chunks break away and float outward.' },
  { start: 0.75, end: 0.97, title: 'Full explosion.', text: 'Reflective pieces suspended in the air.' },
  { start: 0.97, end: 1.01, title: 'Shattered.', text: 'Scroll back up to restore it, piece by piece.' },
];

export default function ShatterStage({ onAddToBag, onEngrave }) {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const bgRef = useRef(null);
  const glowRef = useRef(null);
  const hintRef = useRef(null);
  const chapterRefs = useRef([]);
  const chapterWordRefs = useRef([]);
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
        let victim = null;
        for (const key of cache.keys()) {
          if (key !== lastDrawn) { victim = key; break; }
        }
        if (victim === null) break;
        cache.delete(victim);
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
        console.error('[ShatterStage] frame failed to load:', img.src);
        if (i === 0 || failed > 10) setMissing(true);
      };
      img.src = frameUrl(i);
    };

    const prefetch = (idx) => {
      for (let d = 1; d <= PREFETCH_AHEAD; d++) loadOne(idx + d);
      for (let d = 1; d <= PREFETCH_BEHIND; d++) loadOne(idx - d);
    };

    const resize = () => {
      const card = canvas.parentElement;
      if (!card) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const rect = card.getBoundingClientRect();
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      lastDrawn = -1;
      draw();
    };

    const draw = () => {
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(Math.max(-rect.top / (rect.height - vh), 0), 1);
      const idx = Math.min(Math.floor(p * FRAME_COUNT), FRAME_COUNT - 1);
      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${p})`;
      }
      // Modest scale-up with progress: depth, not a takeover.
      if (canvas) {
        canvas.style.transform = `scale(${(1 + p * 0.06).toFixed(4)})`;
        canvas.style.transformOrigin = 'center';
      }
      // Glow peaks mid-shatter, zero at both ends.
      if (glowRef.current) {
        const peak = p < 0.4 ? p / 0.4 : p < 0.8 ? 1 : Math.max(0, 1 - (p - 0.8) / 0.2);
        glowRef.current.style.opacity = String(peak * 0.55);
      }
      if (hintRef.current) {
        hintRef.current.style.opacity = String(p < 0.08 ? 1 : Math.max(0, 1 - (p - 0.08) / 0.08));
      }
      loadOne(idx);
      prefetch(idx);
      if (idx === lastDrawn) return;
      let img = cache.get(idx);
      if (!img) {
        for (let d = 1; d < FRAME_COUNT; d++) {
          if (cache.has(idx - d)) { img = cache.get(idx - d); break; }
          if (cache.has(idx + d)) { img = cache.get(idx + d); break; }
        }
      }
      if (!img) return;
      lastDrawn = idx;
      if (bgRef.current && bgRef.current.dataset.frame !== String(idx)) {
        bgRef.current.dataset.frame = String(idx);
        bgRef.current.src = frameUrl(idx);
      }
      const cw = canvas.width, ch = canvas.height;
      ctx.clearRect(0, 0, cw, ch);
      const scale = Math.min(cw / img.width, ch / img.height);
      const dw = img.width * scale, dh = img.height * scale;
      ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
      CHAPTERS.forEach((c, i) => {
        const el = chapterRefs.current[i];
        if (!el) return;
        const fade = 0.08;
        const inn = i === 0 ? 1 : Math.min(Math.max((p - c.start) / fade, 0), 1);
        const out = Math.min(Math.max((c.end - p) / fade, 0), 1);
        el.style.opacity = String(Math.min(inn, out));
        el.style.pointerEvents = Math.min(inn, out) > 0.6 && i === CHAPTERS.length - 1 ? 'auto' : 'none';
        // Word-by-word fill inside the active chapter.
        const words = chapterWordRefs.current[i] || [];
        if (words.length) {
          const local = Math.min(Math.max((p - c.start) / Math.max(c.end - c.start, 0.001), 0), 1);
          const read = local * words.length;
          words.forEach((w, wi) => {
            if (w) w.style.opacity = wi < read ? '1' : '0.35';
          });
        }
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
    for (let i = 1; i < 10; i++) loadOne(i);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', resize);
    // Card size is only known after layout, so resize on next frame.
    requestAnimationFrame(resize);
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
      <section style={{ background: '#FAF6EE', padding: '24px 16px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', borderRadius: 20, overflow: 'hidden', border: '1px solid #26262A' }}>
          <img src={frameUrl(0)} alt="Intact gold trophy" style={{ width: '100%', display: 'block' }} />
        </div>
        <p style={{ color: '#A1A1AA', textAlign: 'center', marginTop: 16 }}>
          Scroll animation is off for reduced-motion. The trophy is shown intact.
        </p>
      </section>
    );
  }

  return (
    <section ref={sectionRef} style={{ height: '320vh', position: 'relative', background: '#FAF6EE' }}>
      <div style={{ position: 'sticky', top: 0, height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
        <div style={{ position: 'relative', width: 'min(1100px, 100%)', height: 'min(82vh, 620px)', aspectRatio: '16 / 9', borderRadius: 20, overflow: 'hidden', border: '1px solid #26262A', background: '#0B0B0E', boxShadow: '0 30px 80px rgba(0,0,0,0.6)' }}>
          <img
            ref={bgRef}
            alt=""
            aria-hidden="true"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(24px) brightness(0.6)', transform: 'scale(1.1)', display: 'block' }}
          />
          <div
            ref={glowRef}
            style={{
              position: 'absolute', inset: 0, opacity: 0, pointerEvents: 'none',
              background: 'radial-gradient(ellipse 60% 45% at 50% 55%, rgba(245,198,154,0.35) 0%, rgba(196,181,253,0.25) 45%, transparent 70%)',
            }}
          />
          {!ready && (
            <img
              src={frameUrl(0)}
              alt="Intact gold trophy"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
            />
          )}
          <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, display: 'block' }} />
          <div
            ref={hintRef}
            style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 7, background: 'rgba(0,0,0,0.5)', border: '1px solid #26262A', color: '#E8EEF5', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '8px 14px', borderRadius: 999, whiteSpace: 'nowrap' }}
          >
            Scroll to shatter ↓
          </div>
          <div
            ref={progressRef}
            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: '#E4572E', transformOrigin: 'left', transform: 'scaleX(0)', zIndex: 8 }}
          />
          {!ready && !missing && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E8EEF5', fontSize: 14, zIndex: 5 }}>
              Loading shatter frames…
            </div>
          )}
          {missing && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24, zIndex: 5 }}>
              <div style={{ color: '#fff', maxWidth: 520 }}>
                <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Shatter frames not found</h2>
                <p style={{ color: '#A1A1AA', fontSize: 14, lineHeight: 1.6 }}>
                  Frame 001 failed to load from <code>/shatter-frames/shatter-frame-001.jpg</code>.
                  Check you are on branch <code>fresh-design-v3</code>, you pulled
                  the latest, and <code>frontend/public/shatter-frames/</code> exists locally.
                </p>
              </div>
            </div>
          )}
          {CHAPTERS.map((c, i) => (
            <div
              key={c.title}
              ref={(el) => { chapterRefs.current[i] = el; }}
              style={{
                position: 'absolute', left: '50%', bottom: '7%', transform: 'translateX(-50%)',
                textAlign: 'center', width: 'min(560px, 90%)', opacity: 0, zIndex: 6,
                textShadow: '0 2px 12px rgba(0,0,0,0.9)', pointerEvents: 'none',
                background: 'rgba(0,0,0,0.45)', padding: '12px 16px', borderRadius: 16,
              }}
            >
              <h2 style={{ color: '#fff', fontSize: 28, margin: 0, fontWeight: 800 }}>{c.title}</h2>
              <p style={{ color: '#E8EEF5', marginTop: 6, marginBottom: 0 }}>
                {c.text.split(' ').map((w, wi) => (
                  <span
                    key={wi}
                    ref={(el) => {
                      if (!chapterWordRefs.current[i]) chapterWordRefs.current[i] = [];
                      chapterWordRefs.current[i][wi] = el;
                    }}
                    style={{ opacity: wi === 0 ? 1 : 0.35 }}
                  >
                    {w}
                    {wi < c.text.split(' ').length - 1 ? ' ' : ''}
                  </span>
                ))}
              </p>
              {i === CHAPTERS.length - 1 && (
                <div style={{ marginTop: 14, display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                  {onAddToBag && (
                    <button type="button" onClick={onAddToBag} style={{ background: '#E8EEF5', border: 'none', padding: '12px 20px', borderRadius: 999, fontWeight: 800, cursor: 'pointer', color: '#0B0B0E' }}>
                      Explore trophies
                    </button>
                  )}
                  {onEngrave && (
                    <button type="button" onClick={onEngrave} style={{ background: 'transparent', border: '1px solid #E4572E', color: '#E4572E', padding: '12px 20px', borderRadius: 999, cursor: 'pointer', fontWeight: 700 }}>
                      Engraving Studio →
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
