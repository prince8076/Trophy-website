import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ArrowDown, ArrowRight } from 'lucide-react';

function split(line: string) {
  return line.split('').map((c, i) => (
    <span key={i} className="char" aria-hidden="true">{c === ' ' ? '\u00A0' : c}</span>
  ));
}

/** 100vh hero: staggered char rise, pointer parallax on the
 *  headline, a lightweight canvas particle field, and a hero
 *  composition that shifts as scrolling begins. */
export default function Hero({ ready, onNavigate }: { ready: boolean; onNavigate: (href: string) => void }) {
  const rootRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!ready) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = gsap.context(() => {
      if (!reduced) {
        gsap.from('.hero h1 .char', { yPercent: 110, opacity: 0, duration: 0.9, stagger: 0.022, ease: 'power3.out', delay: 0.1 });
        gsap.from('.hero-sub', { y: 24, opacity: 0, duration: 0.8, delay: 0.6, ease: 'power3.out' });
        gsap.to('.hero-content', {
          yPercent: -12, opacity: 0.35, ease: 'none',
          scrollTrigger: { trigger: rootRef.current, start: 'top top', end: 'bottom top', scrub: true },
        });
      }
    }, rootRef);
    return () => ctx.revert();
  }, [ready]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const c = canvas.getContext('2d');
    if (!c) return;
    let w = 0, h = 0, raf = 0;
    const pts = Array.from({ length: 70 }, () => ({ x: Math.random(), y: Math.random(), s: Math.random() * 1.8 + 0.4, v: Math.random() * 0.0004 + 0.0001 }));
    const resize = () => { w = canvas.width = canvas.offsetWidth; h = canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);
    const draw = () => {
      c.clearRect(0, 0, w, h);
      pts.forEach((p) => {
        p.y -= p.v; if (p.y < -0.02) p.y = 1.02;
        c.fillStyle = 'rgba(198,242,78,0.5)';
        c.beginPath(); c.arc(p.x * w, p.y * h, p.s, 0, Math.PI * 2); c.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  const onPointer = (e: React.PointerEvent) => {
    const el = titleRef.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const r = el.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
    const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
    gsap.to(el, { x: dx * 14, y: dy * 10, duration: 0.6, ease: 'power2.out' });
  };

  return (
    <section ref={rootRef} className="hero" id="top" onPointerMove={onPointer}>
      <div className="hero-grid" aria-hidden="true" />
      <canvas ref={canvasRef} className="hero-canvas" aria-hidden="true" />
      <div className="wrap hero-content">
        <p className="label">Creative Development Studio — Est. for motion</p>
        <h1 ref={titleRef} className="display" aria-label="Make the web feel alive.">
          <span aria-hidden="true">{split('MAKE THE WEB')}</span><br />
          <span aria-hidden="true">{split('FEEL ')}</span><span className="lime" aria-hidden="true">{split('ALIVE.')}</span>
        </h1>
        <div className="hero-sub">
          <p className="lead">
            We build websites where scrolling is the story — motion with purpose,
            performance first, and details you discover by exploring.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-primary" onClick={() => onNavigate('#experiments')}>
              Explore experiments <ArrowRight size={16} />
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => onNavigate('#story')}>
              See the story
            </button>
          </div>
          <div className="scroll-cue"><i aria-hidden="true" /> Scroll to explore <ArrowDown size={14} /></div>
        </div>
      </div>
    </section>
  );
}
