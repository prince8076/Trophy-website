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
// as wide as a portrait trophy can go without cropping it). A blurred
// cover version of the same frame sits behind it, so the whole screen
// feels full instead of empty black on the sides. Only a thin lime
// progress line remains, and it is not text.
// Frames: 120 JPGs from the user's Webb shatter video, on black, in
// motion-studio/public/shatter-frames-webb/ (binaries, not in this push).
// Reduced motion: static frame 001 only.
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
  const chapterRef = useRef<HTMLDivElement | null>(null);
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
      // Contain-fit only — no zoom, no crop: whole pieces in frame.
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
        <img src={frameUrl(0)} alt="Intact gold trophy" style={{ width: '100%', height: '100vh', objectFit: 'contain', display: 'block', background: '#0a0a0b' }} />
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
              <h3>Shatter frames not found</h3>
              <p>
                Frame 001 failed to load from <code>/shatter-frames-webb/shatter-frame-001.jpg</code>.
                Copy the 120 video frames into <code>motion-studio/public/shatter-frames-webb/</code>,
                on branch <code>motion-studio-shatter</code>, and push via normal git.
              </p>
            </div>
          )}
          <canvas ref={canvasRef} className="shatter-canvas" />
          <div className="shatter-overlay-label">Trophy — Webb Ellis Cup</div>
          <div className="shatter-overlay-chapter" ref={chapterRef}>Intact.</div>
        </div>
        <div className="shatter-progress" ref={progressRef} />
      </div>
    </section>
  );
}
