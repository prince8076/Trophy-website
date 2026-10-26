import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Reveal } from './Reveal';

gsap.registerPlugin(ScrollTrigger);

/** Scroll reveal + parallax + kinetic type, in one editorial section.
 *  A masked panel reveals on entry, background layers drift at
 *  different speeds, and a large sentence fills word by word
 *  as it scrolls through the viewport. Text stays in the DOM
 *  (spans only change opacity), so it remains selectable. */
export default function Story() {
  const rootRef = useRef<HTMLElement>(null);
  const kineticRef = useRef<HTMLParagraphElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.to(panelRef.current, {
        yPercent: -8, ease: 'none',
        scrollTrigger: { trigger: rootRef.current, start: 'top bottom', end: 'bottom top', scrub: true },
      });
      // Image transformation: the panel scales up gently as it enters view.
      gsap.fromTo(panelRef.current, { scale: 0.96 }, {
        scale: 1.02, ease: 'none',
        scrollTrigger: { trigger: panelRef.current, start: 'top bottom', end: 'center center', scrub: true },
      });
      const words = kineticRef.current?.querySelectorAll('.word');
      if (words) {
        gsap.fromTo(words, { opacity: 0.18 }, {
          opacity: 1, stagger: 0.12, ease: 'none',
          scrollTrigger: { trigger: kineticRef.current, start: 'top 85%', end: 'bottom 45%', scrub: true },
        });
        gsap.fromTo(kineticRef.current, { letterSpacing: '0.04em' }, {
          letterSpacing: '0em', ease: 'none',
          scrollTrigger: { trigger: kineticRef.current, start: 'top 85%', end: 'center center', scrub: true },
        });
      }
    }, rootRef);
    return () => ctx.revert();
  }, []);

  const sentence = 'Motion should explain itself, not decorate the page.'.split(' ');

  return (
    <section ref={rootRef} className="section" id="story">
      <div className="wrap">
        <Reveal><p className="label">01 — Scroll reveal &amp; parallax</p></Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32, marginTop: 24, alignItems: 'start' }}>
          <Reveal>
            <h2 className="display" style={{ fontSize: 'clamp(36px, 5vw, 64px)', margin: 0 }}>
              The page moves <span style={{ color: 'var(--lime)' }}>with you.</span>
            </h2>
            <p className="lead" style={{ marginTop: 16 }}>
              Sections fade and rise as they arrive. Images unmask from the left.
              Background layers drift slower than the foreground — depth, not distraction.
            </p>
          </Reveal>
          <Reveal clip>
            <div className="panel" ref={panelRef}>
              <div className="panel-visual"><div className="shape" aria-hidden="true" /></div>
              <div className="panel-caption"><span>Fig. 01 — Masked reveal</span><span>Clip-path · Parallax</span></div>
            </div>
          </Reveal>
        </div>
        <p ref={kineticRef} className="kinetic" style={{ marginTop: 64 }} aria-label={sentence.join(' ')}>
          {sentence.map((w, i) => (
            <span key={i} className="word" aria-hidden="true">{w}</span>
          ))}
        </p>
        <div className="css-scroll-line" aria-hidden="true" />
        <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 10 }}>
          The lime line above is driven by native CSS scroll animation, not JavaScript, where the browser supports it.
        </p>
      </div>
    </section>
  );
}
