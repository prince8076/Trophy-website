import { useEffect, useRef, useState } from 'react';

// ------------------------------------------------------------------
// ShatterStage.jsx — v10, trophy-webb-shatter version.
//
// v10 changes, after the user's screenshots (hero + shatter
// still looked boring, trophy not really full screen):
//  1. TRULY FULL SCREEN. The sticky stage is now top:0,
//     height:100vh, zIndex:60 — above the sticky header
//     (z-50) — so while you scroll the shatter, the header,
//     the marquee, and the page edges are gone and the
//     trophy is the whole screen. When the section releases,
//     the header returns normally.
//  2. THIN CAPTION BAR. The bar below the canvas is now a
//     single line (~56px) instead of a tall strip, so the
//     canvas gets almost the whole viewport. Chapters still
//     live below the canvas, never over the trophy.
//  3. Progress math back to the full-viewport form:
//     p = -rect.top / (section - viewport), pin starts at
//     rect.top = 0, ends at p = 1.
// Kept from v9: 48 frames, windowed LRU cache, blurred DOM
// background, glow peaking mid-shatter, modest 1.00->1.06
// scale, word-by-word caption fill, vermilion progress,
// Skip to trophies, reduced-motion static, no autoplay/loop.
// ------------------------------------------------------------------

const FRAME_COUNT = 60;
const MAX_CACHE = 28;
const PREFETCH_AHEAD = 12;
const PREFETCH_BEHIND = 4;

const BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) || '/';
const frameUrl = (i) =>
  `${BASE}shatter-frames-webb/shatter-frame-${String(i + 1).padStart(3, '0')}.jpg`;

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
  const finalButtonsRef = useRef(null);
  const progressRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [missing, setMissing] = useState(false);
  const [reducedMotion] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  const skipToTrophies = () => {
    document.getElementById('featured-trophies')?.scrollIntoView({ behavior: 'smooth' });
  };

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
      if (glowRef.current) {
        const peak = p < 0.4 ? p / 0.4 : p < 0.8 ? 1 : Math.max(0, 1 - (p - 0.8) / 0.2);
        glowRef.current.style.opacity = String(peak * 0.55);
      }
      if (hintRef.current) {
        hintRef.current.style.opacity = String(p < 0.08 ? 1 : Math.max(0, 1 - (p - 0.08) / 0.08));
      }
      if (finalButtonsRef.current) {
        finalButtonsRef.current.style.opacity = p >= 0.97 ? '1' : '0';
        finalButtonsRef.current.style.pointerEvents = p >= 0.97 ? 'auto' : 'none';
      }
      if (canvas) {
        canvas.style.transform = `scale(${(1 + p * 0.06).toFixed(4)})`;
        canvas.style.transformOrigin = 'center';
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
      <section style={{ background: '#0B0B0E', padding: 0 }}>
        <img src={frameUrl(0)} alt="Intact gold trophy" style={{ width: '100%', display: 'block' }} />
        <p style={{ color: '#A1A1AA', textAlign: 'center', margin: 0, padding: 16, background: '#0B0B0E' }}>
          Scroll animation is off for reduced-motion. The trophy is shown intact.
        </p>
      </section>
    );
  }

  return (
    <section ref={sectionRef} style={{ height: '320vh', position: 'relative', background: '#0B0B0E' }}>
      {/* Truly full screen: above the sticky header (z-50) while pinned. */}
      <div style={{ position: 'sticky', top: 0, height: '100vh', zIndex: 60, display: 'flex', flexDirection: 'column', background: '#0B0B0E' }}>
        {/* Canvas area: full viewport, no card, no margins. */}
        <div style={{ position: 'relative', flex: 1, minHeight: 0, overflow: 'hidden', background: '#0B0B0E' }}>
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
            style={{ position: 'absolute', top: 16, left: 16, zIndex: 7, background: 'rgba(0,0,0,0.5)', border: '1px solid #26262A', color: '#E8EEF5', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '8px 14px', borderRadius: 999, whiteSpace: 'nowrap' }}
          >
            Scroll to shatter ↓
          </div>
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
                  Frame 001 failed to load from <code>/shatter-frames-webb/shatter-frame-001.jpg</code>.
                  Check you are on branch <code>trophy-webb-shatter</code>, you pulled
                  the latest, and <code>frontend/public/shatter-frames-webb/</code> exists locally.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Caption bar: below the canvas, never over the trophy. */}
        <div style={{ position: 'relative', background: '#0B0B0E', borderTop: '1px solid #26262A', flexShrink: 0 }}>
          <div
            ref={progressRef}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: '#E4572E', transformOrigin: 'left', transform: 'scaleX(0)', zIndex: 8 }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'nowrap', padding: '10px 24px' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 200, height: 48, overflow: 'hidden' }}>
              {CHAPTERS.map((c, i) => (
                <div
                  key={c.title}
                  ref={(el) => { chapterRefs.current[i] = el; }}
                  style={{
                    position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                    width: '100%', opacity: 0, textAlign: 'left',
                  }}
                >
                  <span style={{ color: '#fff', fontSize: 20, fontWeight: 800, whiteSpace: 'nowrap' }}>{c.title} </span>
                  <span style={{ color: '#E8EEF5', fontSize: 14 }}>
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
                  </span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <div ref={finalButtonsRef} style={{ display: 'flex', gap: 10, flexWrap: 'nowrap', opacity: 0, pointerEvents: 'none' }}>
                {onAddToBag && (
                  <button type="button" onClick={onAddToBag} style={{ background: '#E8EEF5', border: 'none', padding: '10px 16px', borderRadius: 999, fontWeight: 800, cursor: 'pointer', color: '#0B0B0E', whiteSpace: 'nowrap' }}>
                    Explore trophies
                  </button>
                )}
                {onEngrave && (
                  <button type="button" onClick={onEngrave} style={{ background: 'transparent', border: '1px solid #E4572E', color: '#E4572E', padding: '10px 16px', borderRadius: 999, cursor: 'pointer', fontWeight: 700, whiteSpace: 'nowrap' }}>
                    Engraving Studio →
                  </button>
                )}
              </div>
              <button type="button" onClick={skipToTrophies} style={{ background: 'transparent', border: '1px solid #26262A', color: '#A1A1AA', padding: '10px 16px', borderRadius: 999, cursor: 'pointer', fontWeight: 700, whiteSpace: 'nowrap' }}>
                Skip to trophies ↓
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
