import { useEffect, useRef, useState } from 'react';

// ------------------------------------------------------------------
// FramerScrollTrophy.jsx — scroll-controlled video, Framer style,
// using the user's own 300 frames (not procedural Three.js, not
// a live 3D model). This is exactly the reel / Framer pattern:
// a tall sticky section, scroll progress = frame number, and
// text chapters fading in over the top.
//
// Frames (user-supplied, 2026-10-26, ezgif JPG zip):
//   300 frames, 1280x720, ~5.8 MB total
//   frame 001: trophy exploded, parts apart
//   frame 050: parts moving in
//   frame 150: gold cup almost closed
//   frame 200: close-up, gears assembling
//   frame 250-300: finished silver/gold trophy on black marble base
// Scroll: 0 -> exploded, 1 -> finished trophy + Add to Bag.
//
// Files are NOT in this push (Muse's GitHub push is text-only and
// rejects JPGs). Place them at:
//   frontend/public/framer-frames/ezgif-frame-001.jpg
//   ... through ezgif-frame-300.jpg
// and push them with normal git from your own machine. See
// frontend/FRAMER_FRAMES_README.md. Until they are there, this
// section shows a clear "frames not found" message instead of
// a blank black box, so you can tell at a glance.
// ------------------------------------------------------------------

const FRAME_COUNT = 300;
const frameUrl = (i) =>
  `/framer-frames/ezgif-frame-${String(i + 1).padStart(3, '0')}.jpg`;

const CHAPTERS = [
  { start: 0.0, end: 0.28, side: 'center', title: 'It starts in pieces.', text: 'Keep scrolling — every part flies in.' },
  { start: 0.28, end: 0.58, side: 'left', title: 'Assembling.', text: 'Gold band, cup and mechanism closing together.' },
  { start: 0.58, end: 0.86, side: 'right', title: 'Almost complete.', text: 'Handles, stem and marble base lock into place.' },
  { start: 0.86, end: 1.01, side: 'center', title: 'Finished. Ready to gift.', text: 'Silver cup, gold band, black marble base — free laser engraving included.' },
];

export default function FramerScrollTrophy({ onAddToBag, onEngrave }) {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const chapterRefs = useRef([]);
  const [loadPct, setLoadPct] = useState(0);
  const [ready, setReady] = useState(false);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;
    const ctx = canvas.getContext('2d');
    const images = new Array(FRAME_COUNT).fill(null);
    let loaded = 0;
    let failed = 0;
    let cancelled = false;
    let lastDrawn = -1;
    let raf = 0;
    let visible = true;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const rect = section.getBoundingClientRect();
      // Canvas is the sticky viewport: use window size, not section size.
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      void rect;
      lastDrawn = -1;
      draw();
    };

    // Contain-fit: whole frame always visible, never cropped.
    // (Cover-fit was the bug that cut the rim/base off the old
    // procedural trophy on wide screens.)
    const draw = () => {
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(Math.max(-rect.top / (rect.height - vh), 0), 1);
      const idx = Math.min(Math.floor(p * FRAME_COUNT), FRAME_COUNT - 1);
      if (idx === lastDrawn) return;
      // If the exact frame is not loaded yet, use the nearest loaded one.
      let img = images[idx];
      if (!img) {
        for (let d = 1; d < FRAME_COUNT; d++) {
          if (images[idx - d]) { img = images[idx - d]; break; }
          if (images[idx + d]) { img = images[idx + d]; break; }
        }
      }
      if (!img) return;
      lastDrawn = idx;
      const cw = canvas.width, ch = canvas.height;
      const scale = Math.min(cw / img.width, ch / img.height);
      const dw = img.width * scale, dh = img.height * scale;
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, cw, ch);
      ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
      // Chapters, via direct DOM style — no React state per scroll frame.
      CHAPTERS.forEach((c, i) => {
        const el = chapterRefs.current[i];
        if (!el) return;
        const fade = 0.08;
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

    // Preload: first frame first (so the section is never blank),
    // then the rest in order, in the background.
    const loadOne = (i) => new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        if (cancelled) return resolve();
        images[i] = img;
        loaded += 1;
        setLoadPct(Math.round((loaded / FRAME_COUNT) * 100));
        if (i === 0) { setReady(true); draw(); }
        resolve();
      };
      img.onerror = () => {
        if (cancelled) return resolve();
        failed += 1;
        if (failed > 10) setMissing(true);
        resolve();
      };
      img.src = frameUrl(i);
    });

    (async () => {
      await loadOne(0);
      for (let i = 1; i < FRAME_COUNT; i++) {
        if (cancelled) break;
        // Load in small batches so the page stays responsive.
        await loadOne(i);
        if (i % 10 === 0) await new Promise((r) => setTimeout(r, 0));
      }
    })();

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
  }, []);

  const chapterStyle = (side) => {
    if (side === 'center') {
      return { position: 'absolute', left: '50%', top: '12%', transform: 'translateX(-50%)', textAlign: 'center', width: 'min(560px, 90vw)' };
    }
    if (side === 'left') {
      return { position: 'absolute', left: '6vw', top: '24%', maxWidth: 360 };
    }
    return { position: 'absolute', right: '6vw', top: '24%', textAlign: 'right', maxWidth: 360 };
  };

  return (
    <section ref={sectionRef} style={{ height: '500vh', position: 'relative', background: '#000000' }}>
      <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden', background: '#000000' }}>
        <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, display: 'block' }} />
        {!ready && !missing && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c9c2b2', fontSize: 14 }}>
            Loading trophy frames… {loadPct}%
          </div>
        )}
        {missing && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24 }}>
            <div style={{ color: '#fff', maxWidth: 520 }}>
              <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Trophy frames not found</h2>
              <p style={{ color: '#c9c2b2', fontSize: 14, lineHeight: 1.6 }}>
                Copy the 300 JPGs to <code>frontend/public/framer-frames/</code> as
                <code> ezgif-frame-001.jpg … ezgif-frame-300.jpg</code> and push them
                with normal git. See <code>frontend/FRAMER_FRAMES_README.md</code>.
              </p>
            </div>
          </div>
        )}
        {CHAPTERS.map((c, i) => (
          <div
            key={c.title}
            ref={(el) => { chapterRefs.current[i] = el; }}
            style={{
              ...chapterStyle(c.side), opacity: 0, zIndex: 6,
              textShadow: '0 2px 12px rgba(0,0,0,0.9)', pointerEvents: 'none',
            }}
          >
            <h2 style={{ fontFamily: 'Cinzel, serif', color: '#fff', fontSize: 32, margin: 0 }}>{c.title}</h2>
            <p style={{ color: '#c9c2b2', marginTop: 8 }}>{c.text}</p>
            {i === CHAPTERS.length - 1 && (
              <div style={{ marginTop: 16, display: 'flex', gap: 10, justifyContent: c.side === 'center' ? 'center' : 'flex-start', flexWrap: 'wrap' }}>
                <button type="button" onClick={onAddToBag} style={{ background: '#d4af37', border: 'none', padding: '12px 20px', borderRadius: 999, fontWeight: 800, cursor: 'pointer' }}>
                  Add to Bag
                </button>
                <button type="button" onClick={onEngrave} style={{ background: 'transparent', border: '1px solid #d4af37', color: '#ffe9a8', padding: '12px 20px', borderRadius: 999, cursor: 'pointer' }}>
                  Engraving Studio →
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
