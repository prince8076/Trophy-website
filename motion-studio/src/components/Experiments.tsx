import { useEffect, useRef, useState } from 'react';
import { Reveal } from './Reveal';

/** Magnetic button: translates toward the pointer, springs back on leave. */
function MagneticButton({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLButtonElement>(null);
  const onMove = (e: React.PointerEvent) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.25}px)`;
  };
  const onLeave = () => { if (ref.current) ref.current.style.transform = 'translate(0,0)'; };
  return <button ref={ref} type="button" className="btn btn-primary" onPointerMove={onMove} onPointerLeave={onLeave}>{children}</button>;
}

/** Cursor-tracking demo: layers inside the stage follow the pointer at different depths. */
function CursorStage() {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.PointerEvent) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = (e.clientX - r.left) / r.width - 0.5;
    const dy = (e.clientY - r.top) / r.height - 0.5;
    el.querySelectorAll<HTMLElement>('.demo-layer').forEach((layer, i) => {
      layer.style.transform = `translate(${dx * (20 + i * 18)}px, ${dy * (20 + i * 18)}px)`;
    });
  };
  return (
    <div ref={ref} className="exp-stage" onPointerMove={onMove}>
      <div className="demo-layer" style={{ borderColor: 'var(--lime)' }} />
      <div className="demo-layer" style={{ width: 60, height: 60 }} />
      <span style={{ position: 'relative', fontSize: 13, color: 'var(--muted)' }}>Move your pointer here</span>
    </div>
  );
}

/** Scroll-progress demo: bar + box scale follow page scroll (rAF, no React state per frame). */
function ProgressStage() {
  const barRef = useRef<HTMLElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      const h = document.documentElement;
      const p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
      if (barRef.current) barRef.current.style.width = `${p * 100}%`;
      if (boxRef.current) boxRef.current.style.transform = `scale(${0.7 + p * 0.5}) rotate(${p * 45}deg)`;
      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div className="exp-stage" style={{ flexDirection: 'column', gap: 16 }}>
      <div ref={boxRef} className="demo-box" aria-hidden="true" />
      <div className="exp-bar" style={{ width: '80%' }}><i ref={barRef} /></div>
      <span style={{ fontSize: 13, color: 'var(--muted)' }}>This box follows page scroll</span>
    </div>
  );
}

export default function Experiments() {
  const [parallax, setParallax] = useState(0);
  const [kineticOn, setKineticOn] = useState(false);
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const el = parallaxRef.current; if (!el) return;
      const r = el.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, 1 - r.top / window.innerHeight));
      setParallax(p);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section className="section" id="experiments">
      <div className="wrap">
        <Reveal><p className="label">04 — Motion experiments</p></Reveal>
        <Reveal>
          <h2 className="display" style={{ fontSize: 'clamp(40px, 6vw, 84px)', margin: '16px 0 0' }}>
            Motion <span style={{ color: 'var(--lime)' }}>experiments</span>
          </h2>
          <p className="lead" style={{ marginTop: 12 }}>Six live demonstrations. Nothing here is a mockup — move, scroll, and hover.</p>
        </Reveal>
        <div className="exp-grid">
          <Reveal className="exp-card">
            <h3 style={{ margin: 0 }}>01 · Reveal</h3>
            <p style={{ color: 'var(--muted)', fontSize: 14 }}>Elements animate into view on scroll, once, via IntersectionObserver.</p>
            <div className="exp-stage"><div className="demo-box" style={{ animation: 'char-up 1s ease both' }} /></div>
          </Reveal>
          <div className="exp-card">
            <h3 style={{ margin: 0 }}>02 · Parallax</h3>
            <p style={{ color: 'var(--muted)', fontSize: 14 }}>Layers respond to scroll progress at different speeds.</p>
            <div className="exp-stage" ref={parallaxRef}>
              <div className="demo-layer" style={{ transform: `translateY(${parallax * -30}px)` }} />
              <div className="demo-box" style={{ transform: `translateY(${parallax * 20}px)` }} />
            </div>
          </div>
          <div className="exp-card">
            <h3 style={{ margin: 0 }}>03 · Kinetic Type</h3>
            <p style={{ color: 'var(--muted)', fontSize: 14 }}>Oversized text animates word by word. Press play.</p>
            <div className="exp-stage">
              <div className="demo-text" aria-label="Words move">
                {'Words move'.split(' ').map((w, i) => (
                  <span key={i} style={{ opacity: kineticOn ? 1 : 0.25, color: kineticOn && i === 1 ? 'var(--lime)' : undefined, transition: `opacity 0.4s ${i * 0.2}s` }}>{w}</span>
                ))}
              </div>
            </div>
            <button type="button" className="btn btn-ghost" onClick={() => setKineticOn(!kineticOn)}>{kineticOn ? 'Reset' : 'Play words'}</button>
          </div>
          <div className="exp-card">
            <h3 style={{ margin: 0 }}>04 · Magnetic Buttons</h3>
            <p style={{ color: 'var(--muted)', fontSize: 14 }}>Buttons subtly follow the pointer, then spring back.</p>
            <div className="exp-stage"><MagneticButton>Pull me</MagneticButton></div>
          </div>
          <div className="exp-card">
            <h3 style={{ margin: 0 }}>05 · Cursor Tracking</h3>
            <p style={{ color: 'var(--muted)', fontSize: 14 }}>Selected elements react to cursor position at different depths.</p>
            <CursorStage />
          </div>
          <div className="exp-card">
            <h3 style={{ margin: 0 }}>06 · Scroll Progress</h3>
            <p style={{ color: 'var(--muted)', fontSize: 14 }}>A visual element transforms continuously as the page scrolls.</p>
            <ProgressStage />
          </div>
        </div>
      </div>
    </section>
  );
}
