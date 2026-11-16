import { useCallback, useEffect, useState, lazy, Suspense } from 'react';
import { ArrowUp, MessageCircle, Mail, MapPin, Phone } from 'lucide-react';
import Cursor from './components/Cursor';
import Intro from './components/Intro';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Story from './components/Story';
import StickyStory from './components/StickyStory';
import Horizontal from './components/Horizontal';
// PhoenixFlight is lazy: it is the big scroll section, and its
// phoenix images are separate WebP files (preloaded in index.html),
// so the chunk itself is small and the first paint (hero) is not
// held up. The chunk is warmed (see the introDone effect) while
// the user reads the hero, and the fallback renders the same
// section with its label, glow and first chapter — so there is no
// layout shift and no black void.
const PhoenixFlight = lazy(() => import('./components/PhoenixFlight'));
import TrophyCatalogue from './components/TrophyCatalogue';
import Feedback from './components/Feedback';
import Admin from './components/Admin';
import WhatWeMake from './components/WhatWeMake';
import Gallery from './components/Gallery';
import Logos from './components/Logos';
import Faq from './components/Faq';
import Principles from './components/Principles';
import { Reveal } from './components/Reveal';
import { whatsappUrl, GENERAL_ORDER_MESSAGE, WHATSAPP_DISPLAY, ORDER_EMAIL, ORDER_ADDRESS, emailUrl } from './lib/whatsapp';

// Story order (2026-11-07): the page follows one win's journey —
// Hero (promise) → Phoenix (the win takes flight) → Story/About
// (the hands behind it, Madhu, 20+ years) → How it works → the
// trophies → what we make → who we serve → feedback (proof, near
// the decision) → values → contact. Trust comes before the shop:
// About used to sit after the catalogue and feedback, which put
// the products before the person who makes them. SECTIONS must
// stay in this same DOM order or the scroll-spy highlights the
// wrong nav link (it takes the last section whose top is on screen).
const SECTIONS = ['#top', '#story', '#trophies', '#what-we-make', '#feedback', '#contact'];

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

  // Warm the PhoenixFlight chunk once the intro is done: its
  // phoenix images are separate WebP files, so the chunk itself is
  // small. Fetching it while the user reads the hero means the lazy
  // Suspense fallback almost never shows while scrolling.
  useEffect(() => {
    if (!introDone) return;
    const t = window.setTimeout(() => { import('./components/PhoenixFlight').catch(() => {}); }, 800);
    return () => window.clearTimeout(t);
  }, [introDone]);

  // Page progress, active section, back-to-top visibility.
  // (2026-11-16 perf fix) The old version ran on EVERY scroll event:
  // 9 getBoundingClientRect() reads (#contact + 8 sections) and 5
  // setState calls — a full-App re-render per scroll tick, worst on
  // mobile touch scrolling. Now: the section elements are cached
  // once, scroll events are coalesced into one rAF per frame, and
  // state is only set when a value actually CHANGED.
  useEffect(() => {
    const sectionEls = SECTIONS.map((id) => document.querySelector(id)).filter(Boolean) as HTMLElement[];
    const contact = document.querySelector('#contact') as HTMLElement | null;
    let ticking = false;
    const last = { progress: -1, scrolled: false, showTop: false, showWhatsApp: true, active: '#top' };
    const update = () => {
      ticking = false;
      const h = document.documentElement;
      const progress = Math.round((h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight)) * 100);
      const scrolled = h.scrollTop > 40;
      const showTop = h.scrollTop > window.innerHeight * 1.5;
      // Hide the floating WhatsApp pill while the contact section
      // (which already has WhatsApp + Email buttons) is on screen,
      // so it never duplicates those CTAs or overlaps the footer.
      let showWhatsApp = true;
      if (contact) {
        const r = contact.getBoundingClientRect();
        showWhatsApp = !(r.top < window.innerHeight && r.bottom > 0);
      }
      let current = '#top';
      for (let i = 0; i < sectionEls.length; i++) {
        if (sectionEls[i].getBoundingClientRect().top <= 160) current = SECTIONS[i];
      }
      if (progress !== last.progress) { setProgress(progress); last.progress = progress; }
      if (scrolled !== last.scrolled) { setScrolled(scrolled); last.scrolled = scrolled; }
      if (showTop !== last.showTop) { setShowTop(showTop); last.showTop = showTop; }
      if (showWhatsApp !== last.showWhatsApp) { setShowWhatsApp(showWhatsApp); last.showWhatsApp = showWhatsApp; }
      if (current !== last.active) { setActive(current); last.active = current; }
    };
    const onScroll = () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navigate = useCallback((href: string) => {
    const el = document.querySelector(href);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const toTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (isAdmin) {
    return (
      <Admin />
    );
  }

  return (
    <>
      {/* Skip link (2026-11-16): keyboard users can jump straight to
          the main content instead of tabbing through the nav. It is
          visually hidden until focused (see .skip-link in index.css). */}
      <a className="skip-link" href="#main-content">Skip to content</a>
      {/* The intro overlay is client-only: during the build-time
          pre-render (Node, no window) it must not render, or the
          static HTML would be a loading screen covering the content. */}
      {!introDone && typeof window !== 'undefined' && <Intro onDone={() => setIntroDone(true)} />}
      <Cursor />
      <Navbar progress={progress} active={active} scrolled={scrolled} onNavigate={navigate} />
      <main id="main-content">
        <Hero ready={introDone} onNavigate={navigate} />
        <Suspense fallback={
          <div className="shatter" id="shatter">
            <div className="shatter-sticky">
              <div className="shatter-canvas-wrap">
                <div className="flight-stage">
                  <video className="phoenix-video" muted playsInline preload="metadata" poster="/trophies/phoenix-flame-wide.webp" aria-label="Golden phoenix folding its wings and becoming a trophy">
                    <source src="/videos/phoenix-transform.webm" type="video/webm" />
                    <source src="/videos/phoenix-transform.mp4" type="video/mp4" />
                  </video>
                </div>
                <div className="shatter-overlay-label">Shreeji Corporates — Trophies, Awards &amp; Mementos</div>
                <div className="shatter-overlay-chapter-block">
                  <div className="shatter-overlay-chapter">FORGED IN <span className="shatter-title-accent">GLORY.</span></div>
                  <div className="shatter-overlay-sub">From the ashes of hard work rises the ultimate symbol of victory. Custom trophies by Shreeji Corporates, New Delhi.</div>
                </div>
              </div>
            </div>
          </div>
        }>
          <PhoenixFlight />
        </Suspense>
        <Story />
        <StickyStory />
        <TrophyCatalogue />
        <WhatWeMake />
        <Gallery />
        <Horizontal />
        <Logos />
        <Feedback />
        <Faq />
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
                <a className="btn btn-ghost" href="tel:+918796977707">
                  <Phone size={16} /> Call {WHATSAPP_DISPLAY}
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
              <p style={{ marginTop: 12, fontSize: 14, color: 'var(--muted)' }}>
                Open Monday–Saturday, 9am–8pm · Closed Sunday
              </p>
              <iframe
                title="Shreeji Corporates on Google Maps — Hastsal Vihar, Uttam Nagar, New Delhi"
                src="https://www.google.com/maps?q=28.62903,77.05921&output=embed"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                style={{ width: '100%', height: 320, border: 0, borderRadius: 16, marginTop: 24 }}
              />
            </Reveal>
          </div>
        </section>
      </main>
      <footer className="footer">
        <div className="wrap">
          <div className="footer-top">
            <div className="footer-col">
              <span className="logo"><span className="logo-dot" aria-hidden="true" /> SHREEJI</span>
              <p>Trophies, awards, mementos and corporate gifts for schools, companies, sports and government bodies in New Delhi.</p>
            </div>
            <div className="footer-col">
              <p className="label" style={{ margin: '0 0 12px' }}>Contact</p>
              <a href={whatsappUrl(GENERAL_ORDER_MESSAGE)} target="_blank" rel="noreferrer"><MessageCircle size={15} style={{ verticalAlign: -2 }} /> WhatsApp {WHATSAPP_DISPLAY}</a>
              <a href="tel:+918796977707"><Phone size={15} style={{ verticalAlign: -2 }} /> Call {WHATSAPP_DISPLAY}</a>
              <a href={emailUrl('Order enquiry', GENERAL_ORDER_MESSAGE)}><Mail size={15} style={{ verticalAlign: -2 }} /> {ORDER_EMAIL}</a>
              <span><MapPin size={15} style={{ verticalAlign: -2 }} /> {ORDER_ADDRESS}</span>
            </div>
            <div className="footer-col">
              <p className="label" style={{ margin: '0 0 12px' }}>Explore</p>
              <a href="#story" onClick={(e) => { e.preventDefault(); navigate('#story'); }}>About</a>
              <a href="#trophies" onClick={(e) => { e.preventDefault(); navigate('#trophies'); }}>Trophies</a>
              <a href="#what-we-make" onClick={(e) => { e.preventDefault(); navigate('#what-we-make'); }}>What we make</a>
              <a href="#feedback" onClick={(e) => { e.preventDefault(); navigate('#feedback'); }}>Reviews</a>
              <a href="#contact" onClick={(e) => { e.preventDefault(); navigate('#contact'); }}>Contact</a>
            </div>
          </div>
          <div className="footer-row">
            <span>© Shreeji Corporates, New Delhi — Trophies, Awards &amp; Mementos. Orders on WhatsApp and email only.</span>
            <span style={{ display: 'flex', gap: 18 }}>
              <a href="#top" onClick={(e) => { e.preventDefault(); toTop(); }}>Back to top</a>
              <a href={emailUrl('Order enquiry', GENERAL_ORDER_MESSAGE)}>Email us</a>
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
