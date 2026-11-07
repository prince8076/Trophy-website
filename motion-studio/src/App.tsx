import { useCallback, useEffect, useRef, useState, lazy, Suspense } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { ArrowUp, MessageCircle, Mail, MapPin } from 'lucide-react';
import Cursor from './components/Cursor';
import Intro from './components/Intro';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Story from './components/Story';
import StickyStory from './components/StickyStory';
import Horizontal from './components/Horizontal';
// PhoenixFlight is lazy: it carries the five embedded phoenix photos
// (~560 KB of base64). Loading it as a separate chunk means the first
// paint (hero) is not held up by those images; the chunk is warmed
// (see the introDone effect) while the user reads the hero, and the
// fallback renders the same black section with its label, glow and
// first chapter — so there is no layout shift and no black void.
const PhoenixFlight = lazy(() => import('./components/PhoenixFlight'));
import TrophyCatalogue from './components/TrophyCatalogue';
import Feedback from './components/Feedback';
import Admin from './components/Admin';
import WhatWeMake from './components/WhatWeMake';
import Principles from './components/Principles';
import { Reveal } from './components/Reveal';
import { whatsappUrl, GENERAL_ORDER_MESSAGE, WHATSAPP_DISPLAY, ORDER_EMAIL, ORDER_ADDRESS, emailUrl } from './lib/whatsapp';

gsap.registerPlugin(ScrollTrigger);

// Story order (2026-11-07): the page follows one win's journey —
// Hero (promise) → Phoenix (the win takes flight) → Story/About
// (the hands behind it, Madhu, 20+ years) → How it works → the
// trophies → what we make → who we serve → feedback (proof, near
// the decision) → values → contact. Trust comes before the shop:
// About used to sit after the catalogue and feedback, which put
// the products before the person who makes them. SECTIONS must
// stay in this same DOM order or the scroll-spy highlights the
// wrong nav link (it takes the last section whose top is on screen).
const SECTIONS = ['#top', '#shatter', '#story', '#trophies', '#what-we-make', '#feedback', '#principles', '#contact'];

export default function App() {
  // Admin view: ?admin=1 renders the admin page instead of the
  // landing page. No router is used on purpose — a query param
  // works on any static host without server rewrites, and the
  // admin page is deliberately NOT in the main nav.
  const isAdmin = typeof window !== 'undefined'
    && new URLSearchParams(window.location.search).get('admin') === '1';
  const [introDone, setIntroDone] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('#top');
  const [showTop, setShowTop] = useState(false);
  const [showWhatsApp, setShowWhatsApp] = useState(true);
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

  // Warm the PhoenixFlight chunk once the intro is done: it carries
  // the five embedded phoenix photos (~560 KB of base64). Fetching it
  // while the user reads the hero means the lazy Suspense fallback
  // almost never shows while scrolling — the black void people saw
  // was that fallback, not a missing image.
  useEffect(() => {
    if (!introDone) return;
    const t = window.setTimeout(() => { import('./components/PhoenixFlight').catch(() => {}); }, 800);
    return () => window.clearTimeout(t);
  }, [introDone]);

  // Page progress, active section, back-to-top visibility.
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
      setProgress(p * 100);
      setScrolled(h.scrollTop > 40);
      setShowTop(h.scrollTop > window.innerHeight * 1.5);
      // Hide the floating WhatsApp pill while the contact section
      // (which already has WhatsApp + Email buttons) is on screen,
      // so it never duplicates those CTAs or overlaps the footer.
      const contact = document.querySelector('#contact');
      if (contact) {
        const r = contact.getBoundingClientRect();
        setShowWhatsApp(!(r.top < window.innerHeight && r.bottom > 0));
      }
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

  if (isAdmin) {
    return (
      <>
        <div className="grain" aria-hidden="true" />
        <Admin />
      </>
    );
  }

  return (
    <>
      {!introDone && <Intro onDone={() => setIntroDone(true)} />}
      <div className="grain" aria-hidden="true" />
      <Cursor />
      <Navbar progress={progress} active={active} scrolled={scrolled} onNavigate={navigate} />
      <main>
        <Hero ready={introDone} onNavigate={navigate} />
        <Suspense fallback={
          <div className="shatter" id="shatter">
            <div className="shatter-sticky">
              <div className="shatter-canvas-wrap">
                <div className="portrait-glow" style={{ opacity: 0.35 }} aria-hidden="true" />
                <div className="shatter-overlay-label">Shreeji Corporates — Trophies, Awards &amp; Mementos</div>
                <div className="shatter-overlay-chapter-block">
                  <div className="shatter-overlay-chapter">Crafted to perfection.</div>
                  <div className="shatter-overlay-sub">One trophy, made to celebrate one achievement — with 20+ years of expertise behind it.</div>
                </div>
              </div>
              <div className="shatter-progress" />
            </div>
          </div>
        }>
          <PhoenixFlight />
        </Suspense>
        <Story />
        <StickyStory />
        <TrophyCatalogue />
        <WhatWeMake />
        <Horizontal />
        <Feedback />
        <Principles />
        <section className="cta" id="contact">
          <div className="wrap">
            <Reveal><p className="label">Order — Shreeji Corporates</p></Reveal>
            <Reveal>
              <h2 className="display" style={{ fontSize: 'clamp(44px, 7vw, 96px)', margin: '16px 0 28px', textWrap: 'balance' }}>
                Let us<br />celebrate <span style={{ color: 'var(--gold)' }}>your success.</span>
              </h2>
              <p className="lead">
                Tell us what you need — the occasion, the design, the
                quantity — on WhatsApp or email, and we will quote it,
                make it, and deliver it.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 28 }}>
                <a className="btn btn-primary" href={whatsappUrl(GENERAL_ORDER_MESSAGE)} target="_blank" rel="noreferrer">
                  <MessageCircle size={16} /> WhatsApp {WHATSAPP_DISPLAY}
                </a>
                <a className="btn btn-ghost" href={emailUrl('Order enquiry', GENERAL_ORDER_MESSAGE)}>
                  <Mail size={16} /> Email {ORDER_EMAIL}
                </a>
              </div>
              <p style={{ marginTop: 20, fontSize: 14, color: 'var(--muted)' }}>
                20+ years · Free engraving · Made to order · No checkout, no forms — just a message.
              </p>
              <p className="lead" style={{ marginTop: 24, fontSize: 16, textWrap: 'balance' }}>
                <MapPin size={16} style={{ verticalAlign: -2 }} /> {ORDER_ADDRESS.replace(' – 110059', ' – 110059')}
              </p>
            </Reveal>
          </div>
        </section>
      </main>
      <footer className="footer">
        <div className="wrap">
          <div className="footer-top">
            <div className="footer-col">
              <span className="logo"><span className="logo-dot" aria-hidden="true" /> SHREEJI</span>
              <p>We don&rsquo;t just supply awards — we craft meaningful recognition. Trophies, awards, mementos and corporate gifts, made end-to-end under one roof.</p>
            </div>
            <div className="footer-col">
              <p className="label" style={{ margin: '0 0 12px' }}>Contact</p>
              <a href={whatsappUrl(GENERAL_ORDER_MESSAGE)} target="_blank" rel="noreferrer"><MessageCircle size={15} style={{ verticalAlign: -2 }} /> WhatsApp {WHATSAPP_DISPLAY}</a>
              <a href={emailUrl('Order enquiry', GENERAL_ORDER_MESSAGE)}><Mail size={15} style={{ verticalAlign: -2 }} /> {ORDER_EMAIL}</a>
              <span><MapPin size={15} style={{ verticalAlign: -2 }} /> {ORDER_ADDRESS}</span>
            </div>
            <div className="footer-col">
              <p className="label" style={{ margin: '0 0 12px' }}>Explore</p>
              <a href="#story" onClick={(e) => { e.preventDefault(); navigate('#story'); }}>About</a>
              <a href="#trophies" onClick={(e) => { e.preventDefault(); navigate('#trophies'); }}>Trophies</a>
              <a href="#what-we-make" onClick={(e) => { e.preventDefault(); navigate('#what-we-make'); }}>What we make</a>
              <a href="#feedback" onClick={(e) => { e.preventDefault(); navigate('#feedback'); }}>Feedback</a>
              <a href="#principles" onClick={(e) => { e.preventDefault(); navigate('#principles'); }}>Values</a>
            </div>
          </div>
          <div className="footer-row">
            <span>© Shreeji Corporates, New Delhi — Trophies, Awards &amp; Mementos. Orders on WhatsApp and email only.</span>
            <span style={{ display: 'flex', gap: 18 }}>
              <a href="#top" onClick={(e) => { e.preventDefault(); toTop(); }}>Back to top</a>
              <a href={whatsappUrl(GENERAL_ORDER_MESSAGE)} target="_blank" rel="noreferrer">WhatsApp us</a>
              <a href={emailUrl('Order enquiry', GENERAL_ORDER_MESSAGE)}>Email us</a>
              <a href="?admin=1">Admin</a>
            </span>
          </div>
        </div>
      </footer>
      <a
        className="whatsapp-float"
        href={whatsappUrl(GENERAL_ORDER_MESSAGE)}
        target="_blank"
        rel="noreferrer"
        aria-label={`Chat with Shreeji Corporates on WhatsApp, ${WHATSAPP_DISPLAY}`}
        style={{ opacity: showWhatsApp ? 1 : 0, pointerEvents: showWhatsApp ? 'auto' : 'none' }}
      >
        <MessageCircle size={22} /> <span className="whatsapp-float-label">WhatsApp us</span>
      </a>
      <button type="button" className={`back-top${showTop ? ' show' : ''}`} aria-label="Back to top" onClick={toTop}>
        <ArrowUp size={20} />
      </button>
    </>
  );
}
