import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { whatsappUrl, GENERAL_ORDER_MESSAGE } from '../lib/whatsapp';

const LINKS = [
  { href: '#shatter', label: 'Shatter' },
  { href: '#trophies', label: 'Trophies' },
  { href: '#feedback', label: 'Feedback' },
  { href: '#story', label: 'About' },
  { href: '#what-we-make', label: 'What we make' },
  { href: '#principles', label: 'Values' },
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
          <span>SCROLL {Math.round(progress)}%</span>
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
