import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { whatsappUrl, GENERAL_ORDER_MESSAGE } from '../lib/whatsapp';

// Nav links read top-to-bottom in the same order as the page
// (2026-11-07 story reorder, trimmed 2026-11-16): About →
// Trophies → What we make → Reviews → Contact. The Phoenix
// showcase and the Values section stay on the page but are not
// nav entries (the showcase is a visual interlude, Values is a
// supporting section) — the nav is the five places a visitor
// actually wants to go. Feedback is labelled "Reviews" because
// that is what the section is.
const LINKS = [
  { href: '#story', label: 'About' },
  { href: '#trophies', label: 'Trophies' },
  { href: '#what-we-make', label: 'What we make' },
  { href: '#feedback', label: 'Reviews' },
  { href: '#contact', label: 'Contact' },
];

export default function Navbar({ progress, active, scrolled, onNavigate }: {
  progress: number; active: string; scrolled: boolean; onNavigate: (href: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const go = (href: string) => { setOpen(false); onNavigate(href); };
  return (
    <header className={`nav${scrolled ? ' scrolled' : ''}`}>
      <div className="nav-progress" style={{ width: `${progress}%` }} aria-hidden="true" />
      <div className="nav-inner">
        <a href="#top" className="logo" onClick={(e) => { e.preventDefault(); go('#top'); }}>
          <span className="logo-dot" aria-hidden="true" /> SHREEJI
        </a>
        <nav className="nav-links" aria-label="Primary">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className={active === l.href ? 'active' : ''} onClick={(e) => { e.preventDefault(); go(l.href); }}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="nav-meta">
          {/* Desktop WhatsApp CTA (2026-11-16): orders come only
              through WhatsApp and email, so the nav carries a
              WhatsApp button — the desktop nav had none (WhatsApp
              was only in the mobile menu). Hidden on mobile by CSS
              (.nav-cta), where the floating WhatsApp button serves. */}
          <a className="btn btn-primary nav-cta" href={whatsappUrl(GENERAL_ORDER_MESSAGE)} target="_blank" rel="noreferrer">WhatsApp us</a>
          <button type="button" className="burger" aria-expanded={open} aria-label="Toggle menu" onClick={() => setOpen(!open)}>
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="mobile-menu" aria-label="Mobile">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={(e) => { e.preventDefault(); go(l.href); }}>{l.label}</a>
          ))}
          <a href={whatsappUrl(GENERAL_ORDER_MESSAGE)} target="_blank" rel="noreferrer">WhatsApp us</a>
        </nav>
      )}
    </header>
  );
}
