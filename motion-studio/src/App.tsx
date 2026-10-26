import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { ArrowUp, ArrowRight } from 'lucide-react';
import Cursor from './components/Cursor';
import Intro from './components/Intro';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Story from './components/Story';
import StickyStory from './components/StickyStory';
import Horizontal from './components/Horizontal';
import TrophyShatter from './components/TrophyShatter';
import Experiments from './components/Experiments';
import Principles from './components/Principles';
import ContactModal from './components/ContactModal';
import { Reveal } from './components/Reveal';

gsap.registerPlugin(ScrollTrigger);

const SECTIONS = ['#top', '#shatter', '#story', '#experiments', '#principles', '#contact'];

export default function App() {
  const [introDone, setIntroDone] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('#top');
  const [showTop, setShowTop] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const lenisRef = useRef<Lenis | null>(null);

  // Smooth scrolling: Lenis on desktop, native on mobile / reduced motion.
  // Lenis is wired into GSAP's ticker so ScrollTrigger stays in sync,
  // and everything is torn down on unmount.
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    if (reduced || coarse) return;
    const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1 });
    lenisRef.current = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Page progress, active section, back-to-top visibility.
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
      setProgress(p * 100);
      setScrolled(h.scrollTop > 40);
      setShowTop(h.scrollTop > window.innerHeight * 1.5);
      let current = '#top';
      for (const id of SECTIONS) {
        const el = document.querySelector(id);
        if (el && el.getBoundingClientRect().top <= 160) current = id;
      }
      setActive(current);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navigate = useCallback((href: string) => {
    const el = document.querySelector(href);
    if (!el) return;
    if (lenisRef.current) lenisRef.current.scrollTo(el as HTMLElement, { offset: -70, duration: 1.2 });
    else el.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const toTop = useCallback(() => {
    if (lenisRef.current) lenisRef.current.scrollTo(0, { duration: 1.2 });
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <>
      {!introDone && <Intro onDone={() => setIntroDone(true)} />}
      <div className="grain" aria-hidden="true" />
      <Cursor />
      <Navbar progress={progress} active={active} scrolled={scrolled} onNavigate={navigate} />
      <main>
        <Hero ready={introDone} onNavigate={navigate} />
        <TrophyShatter />
        <Story />
        <StickyStory />
        <Horizontal />
        <Experiments />
        <Principles />
        <section className="cta" id="contact">
          <div className="wrap">
            <Reveal><p className="label">06 — Final call</p></Reveal>
            <Reveal>
              <h2 className="display">
                Let’s make<br />something <span style={{ color: 'var(--lime)' }}>move.</span>
              </h2>
              <p className="lead">
                A short conversation, a clear brief, and a site that feels alive
                from the first scroll. No invented promises — just motion, built well.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 28 }}>
                <button type="button" className="btn btn-primary" onClick={() => setContactOpen(true)}>
                  Start a project <ArrowRight size={16} />
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => navigate('#experiments')}>
                  Revisit the experiments
                </button>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <footer className="footer">
        <div className="wrap footer-row">
          <span>© ALIVE — Creative Development Studio. Original design, built for this demo.</span>
          <span style={{ display: 'flex', gap: 18 }}>
            <a href="#top" onClick={(e) => { e.preventDefault(); toTop(); }}>Back to top</a>
            <a href="#experiments" onClick={(e) => { e.preventDefault(); navigate('#experiments'); }}>Experiments</a>
            <a href="https://example.com" target="_blank" rel="noreferrer">Social — placeholder</a>
          </span>
        </div>
      </footer>
      <button type="button" className={`back-top${showTop ? ' show' : ''}`} aria-label="Back to top" onClick={toTop}>
        <ArrowUp size={20} />
      </button>
      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </>
  );
}
