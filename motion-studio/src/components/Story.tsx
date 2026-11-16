import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Reveal } from './Reveal';
import { webpSrcSet } from '../lib/images';

gsap.registerPlugin(ScrollTrigger);

// About — scroll reveal + a gentle panel parallax, in one editorial
// section. The old version also ran a per-word split-text reveal
// (each word a span whose opacity scrubbed with scroll) plus a
// letter-spacing tween (a layout property, forcing text reflow per
// scrub tick). Both are gone (2026-11-16): the big sentence is now
// normal text that fades up once via Reveal, so the spaces and
// accessibility are correct. The panel keeps its transform-only
// parallax/scale — cheap, and the only scrubbed effect left here.
export default function Story() {
  const rootRef = useRef<HTMLElement>(null);
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
    }, rootRef);
    return () => ctx.revert();
  }, []);

  const sentence = 'We don\u2019t just supply awards — we craft meaningful recognition.';

  return (
    <section ref={rootRef} className="section" id="story">
      <div className="wrap">
        <Reveal><p className="label">About — Shreeji Corporates</p></Reveal>
        {/* The old grid (auto-fit, align start) left a big empty white
            area under the short text column: the 4:3 photo is ~530px
            tall, the text only ~250px. Now the columns are centred
            against each other and the text column carries a compact
            "by the numbers" row, so the two sides balance. All three
            numbers are from the company profile (20+ years, 6 sectors,
            crystal/metal/acrylic/wood). */}
        <div className="story-grid">
          <Reveal>
            <h2 className="display" style={{ fontSize: 'clamp(36px, 5vw, 64px)', margin: 0, textWrap: 'balance' }}>
              Every win<br /><span style={{ color: 'var(--gold)' }}>has a story.</span>
            </h2>
            <p className="lead" style={{ marginTop: 16 }}>
              Led by Ms. Madhu Sharma, with over 20 years of experience,
              Shreeji Corporates crafts trophies, awards, mementos and
              corporate gifts that celebrate achievements, honour recipients,
              and create meaningful, lasting impressions.
            </p>
            <div className="story-stats">
              <div><strong>20+</strong><span>years of experience</span></div>
              <div><strong>6</strong><span>sectors served</span></div>
              <div><strong>4+</strong><span>materials — crystal, metal, acrylic, wood</span></div>
            </div>
          </Reveal>
          {/* No <Reveal clip> here (2026-11-07 fix): the clip-path reveal
              never fired in the user's browser, hiding this photo and
              leaving a large white void in the About section. A content
              photo renders directly; only text keeps a reveal. */}
          <div className="panel" ref={panelRef}>
            <div className="panel-visual"><img src={webpSrcSet('/trophies/championship-cup-prince.jpg').src} srcSet={webpSrcSet('/trophies/championship-cup-prince.jpg').srcSet} sizes={webpSrcSet('/trophies/championship-cup-prince.jpg').sizes} alt="Championship Cup trophy" loading="lazy" decoding="async" width={800} height={600} /></div>
            <div className="panel-caption"><span>Fig. 01 — Championship Cup</span><span>Crystal · Metal · Acrylic · Wood</span></div>
          </div>
        </div>
        <Reveal>
          <p className="kinetic" style={{ marginTop: 32 }}>{sentence}</p>
        </Reveal>
        <div className="css-scroll-line" aria-hidden="true" />
      </div>
    </section>
  );
}
