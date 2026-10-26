import { useEffect, useRef, useState } from 'react';

// TrophyShatter — ALIVE-style scroll shatter, built only for motion-studio.
// It is NOT the old trophy site's ShatterStage: no paper/pine/vermilion,
// no catalogue, no engraving, no old navbar. Deep black, warm white,
// acid lime, thin borders, small technical labels — the ALIVE tokens only.
//
// Frames: 120 JPGs extracted from the user's own Webb shatter video,
// blue studio background removed to pure black. They are binaries, so
// they are NOT in this repo push — copy them to
// motion-studio/public/shatter-frames-webb/ (shatter-frame-001.jpg … 120.jpg)
// and push via normal git. Until then, frame 001 shows the not-found note.
//
// Scroll: pinned 400vh section, sticky 100vh stage, canvas contain-fit,
// reversible, no autoplay/loop. Windowed cache (60 decoded, prefetch
// 24 ahead / 12 behind) so a fast scroll does not jump or drop frames.
// Reduced motion: static frame 001 + a short note, no animation.
const FRAME_COUNT = 120;
const MAX_CACHE = 60;
const PREFETCH_AHEAD = 24;
const PREFETCH_BEHIND = 12;

const BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) || '/';
const frameUrl = (i: number) =>
  `${BASE}shatter-frames-webb/shatter-frame-${String(i + 1).padStart(3, '0')}.jpg`;

const CHAPTERS = [
  { start: 0.0, end: 0.08, title: 'Intact.' },
  { start: 0.08, end: 0.25, title: 'Cracks.' },
  { start: 0.25, end: 0.5, title: 'Breaking.' },
  { start: 0.5, end: 0.75, title: 'Major shatter.' },
  { start: 0.75, end: 0.97, title: 'Full explosion.' },
  { start: 0.97, end: 1.01, title: 'Shattered.' },
];

export default function TrophyShatter() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<HTMLSpanElement | null>(null);
  const chapterRef = useRef<HTMLDivElement | null>(null);
  const hintRef = useRef<HTMLDivElement | null>(null);
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
    if (!ctx) return undefined;
    const cache = new Map<number, HTMLImageElement>();
    const loading = new Set<number>();
    let cancelled = false;
    let lastDrawn = -1;
    let raf = 0;
    let visible = true;
    let failed = 0;

    const touch = (i: number, img: HTMLImageElement) => {
      cache.delete(i);
      cache.set(i, img);
      while (cache.size > MAX_CACHE) {
        let victim: number | null = null;
        for (const key of cache.keys()) {
          if (key !== lastDrawn) { victim = key; break; }
        }
        if (victim === null) break;
        cache.delete(victim);
      }
    };

    const loadOne = (i: number) => {
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
        if (i === 0 || failed > 10) setMissing(true);
      };
      img.src = frameUrl(i);
    };

    const prefetch = (idx: number) => {
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
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${p})`;
      if (frameRef.current) frameRef.current.textContent = `FRAME ${String(idx + 1).padStart(3, '0')} / ${FRAME_COUNT}`;
      if (hintRef.current) hintRef.current.style.opacity = p < 0.08 ? '1' : '0';
      if (chapterRef.current) {
        const c = CHAPTERS.find((ch) => p >= ch.start && p < ch.end) || CHAPTERS[CHAPTERS.length - 1];
        chapterRef.current.textContent = c.title;
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
      const cw = canvas.width, ch = canvas.height;
      ctx.clearRect(0, 0, cw, ch);
      const scale = Math.min(cw / img.width, ch / img.height);
      const dw = img.width * scale, dh = img.height * scale;
      ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
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
    for (let i = 1; i < 20; i++) loadOne(i);
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
  }, [reducedMotion]);

  if (reducedMotion) {
    return (
      <section className="shatter" id="shatter">
        <div className="wrap">
          <p className="label">Trophy — Scroll shatter</p>
          <img src={frameUrl(0)} alt="Intact gold trophy" style={{ width: '100%', maxWidth: 520, display: 'block', margin: '24px auto 0' }} />
          <p style={{ color: 'var(--muted)', textAlign: 'center', marginTop: 16 }}>
            Scroll animation is off for reduced motion. The trophy is shown intact.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="shatter" id="shatter" ref={sectionRef}>
      <div className="shatter-sticky">
        <div className="shatter-top">
          <span className="label">Trophy — Scroll to break</span>
          <span className="shatter-frame" ref={frameRef}>FRAME 001 / 120</span>
        </div>
        <div className="shatter-canvas-wrap">
          {!ready && !missing && (
            <div className="shatter-loading">Loading shatter frames…</div>
          )}
          {missing && (
            <div className="shatter-missing">
              <h3>Shatter frames not found</h3>
              <p>
                Frame 001 failed to load from <code>/shatter-frames-webb/shatter-frame-001.jpg</code>.
                Copy the 120 video frames into <code>motion-studio/public/shatter-frames-webb/</code>,
                on branch <code>motion-studio-shatter</code>, and push via normal git.
              </p>
            </div>
          )}
          <canvas ref={canvasRef} className="shatter-canvas" />
          <div className="shatter-hint" ref={hintRef}>Scroll ↓</div>
        </div>
        <div className="shatter-bottom">
          <div className="shatter-progress" ref={progressRef} />
          <div className="shatter-chapter" ref={chapterRef}>Intact.</div>
          <p className="shatter-note">
            A trophy, broken by scroll. Intact, then cracks, then full explosion — scroll back up to restore it.
          </p>
        </div>
      </div>
    </section>
  );
}
