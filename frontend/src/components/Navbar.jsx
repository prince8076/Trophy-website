import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Menu, X, Truck, Sparkles, Send, Phone } from 'lucide-react';
import RealtimeColorPicker from './motion/RealtimeColorPicker';
import CommandPalette from './ui/CommandPalette';
import RequestQuoteModal from './RequestQuoteModal';

// ------------------------------------------------------------------
// Navbar — v9, fresh-design-v3 version. Replaces the old dark/gold
// header (gold announcement bar + dark navy bar + a row of
// competing pills) with a clean header in the fresh palette,
// following the string-tune reference in structure only —
// patterns, not that site's content, marks, or wording:
//  - One thin header, paper background, thin bottom border,
//    generous side padding, lots of empty space.
//  - Left: mark + name. Middle: plain text links, active link
//    marked by a vermilion underline, not a background pill.
//  - Right: search (opens the existing command palette),
//    Admin as a quiet text link, and ONE vermilion pill for
//    Request Quote — the only primary action.
//  - No announcement bar. The phone number lives in the mobile
//    drawer, not as a competing banner.
//  - The gold-finish picker is kept, but moved to the mobile
//    drawer, so it does not compete with shopping on desktop.
// Kept, unchanged in behaviour: all catalogue destinations,
// search via the command palette, the mobile search form,
// Track My Order, Admin, contact details, and both modals.
// ------------------------------------------------------------------

const PAPER = '#FAF6EE';
const INK = '#1A1712';
const PINE = '#14342B';
const VERMILION = '#E4572E';
const LINE = '#E6DDCC';
const MUTED = '#6B6257';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchSubmit = e => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/catalog', label: 'All Categories' },
    { to: '/catalog?category=customized-bespoke', label: 'Bespoke' },
    { to: '/catalog?category=crystal-glass', label: 'Crystal' },
    { to: '/catalog?category=wooden-trophies', label: 'Wood' },
    { to: '/catalog?category=metal-brass', label: 'Metal & Cups' },
    { to: '/catalog?category=acrylic-plaques', label: 'Acrylic' },
  ];

  const isActive = (to) => location.pathname === to && !to.includes('?') ? true : location.pathname + location.search === to;

  return (
    <header className="sticky top-0 z-50" style={{ background: `${PAPER}E6`, backdropFilter: 'blur(12px)', borderBottom: `1px solid ${LINE}` }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72, gap: 16 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: PINE, color: PAPER, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800 }} className="fresh-display">
              S
            </div>
            <div>
              <span className="fresh-display" style={{ fontSize: 19, fontWeight: 700, color: INK, letterSpacing: '0.02em' }}>
                Shreeji <span style={{ color: PINE }}>Corporates</span>
              </span>
              <span style={{ display: 'block', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: MUTED, marginTop: 1 }}>
                Trophies • Mementos • Corporate Gifts
              </span>
            </div>
          </Link>

          <nav style={{ display: 'none', gap: 4 }} className="fresh-nav-desktop">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  padding: '8px 12px', fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
                  color: isActive(link.to) ? VERMILION : INK, textDecoration: 'none',
                  borderBottom: isActive(link.to) ? `2px solid ${VERMILION}` : '2px solid transparent',
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <style>{`@media (min-width: 1100px) { .fresh-nav-desktop { display: flex !important; } }`}</style>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
            <button
              type="button"
              onClick={() => setCommandOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'transparent', border: `1px solid ${LINE}`, borderRadius: 999, padding: '9px 16px', cursor: 'pointer', color: INK, fontSize: 14, fontWeight: 600 }}
            >
              <Search size={16} />
              <span style={{ display: 'none' }} className="fresh-search-label">Search</span>
              <style>{`@media (min-width: 640px) { .fresh-search-label { display: inline !important; } }`}</style>
            </button>
            <Link to="/admin-panel" style={{ display: 'none', alignItems: 'center', gap: 6, color: MUTED, fontSize: 13, fontWeight: 700, textDecoration: 'none' }} className="fresh-admin-link">
              <Sparkles size={14} /> Admin
              <style>{`@media (min-width: 768px) { .fresh-admin-link { display: inline-flex !important; } }`}</style>
            </Link>
            <button
              type="button"
              onClick={() => setIsQuoteModalOpen(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: VERMILION, border: 'none', borderRadius: 999, padding: '11px 20px', color: PAPER, fontSize: 14, fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap' }}
              title="Request Custom Quote & Digital Proof"
            >
              <Send size={14} /> Request Quote
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ display: 'flex', padding: 10, borderRadius: 10, border: `1px solid ${LINE}`, background: 'transparent', cursor: 'pointer', color: INK }}
              className="fresh-menu-button"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              <style>{`@media (min-width: 1100px) { .fresh-menu-button { display: none !important; } }`}</style>
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div style={{ padding: '16px 0 24px', borderTop: `1px solid ${LINE}` }}>
            <form onSubmit={handleSearchSubmit} style={{ position: 'relative', marginBottom: 16 }}>
              <input
                type="text"
                placeholder="Search trophies & mementos..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '100%', background: '#FFFDF8', border: `1px solid ${LINE}`, borderRadius: 12, padding: '12px 16px 12px 40px', fontSize: 15, color: INK }}
              />
              <Search size={16} style={{ position: 'absolute', left: 14, top: 14, color: MUTED }} />
            </form>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 15, fontWeight: 600 }}>
              <Link to="/" onClick={() => setMobileMenuOpen(false)} style={{ padding: '10px 12px', borderRadius: 10, color: INK, textDecoration: 'none' }}>Home</Link>
              <Link to="/catalog" onClick={() => setMobileMenuOpen(false)} style={{ padding: '10px 12px', borderRadius: 10, color: INK, textDecoration: 'none' }}>All Awards Portfolio</Link>
              <Link to="/catalog?category=corporate-leadership" onClick={() => setMobileMenuOpen(false)} style={{ padding: '10px 12px', borderRadius: 10, color: INK, textDecoration: 'none' }}>Corporate & Leadership</Link>
              <Link to="/catalog?category=crystal-mementos" onClick={() => setMobileMenuOpen(false)} style={{ padding: '10px 12px', borderRadius: 10, color: INK, textDecoration: 'none' }}>Crystal & Glass Mementos</Link>
              <Link to="/catalog?category=wooden-trophies" onClick={() => setMobileMenuOpen(false)} style={{ padding: '10px 12px', borderRadius: 10, color: INK, textDecoration: 'none' }}>Artistic Wooden Trophies</Link>
              <Link to="/track" onClick={() => setMobileMenuOpen(false)} style={{ padding: '10px 12px', borderRadius: 10, color: INK, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Truck size={16} /> Track My Order
              </Link>
              <Link to="/admin-panel" onClick={() => setMobileMenuOpen(false)} style={{ padding: '10px 12px', borderRadius: 10, color: PINE, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={16} /> Admin Studio (Trophies & Orders)
              </Link>
              <div style={{ marginTop: 8 }}>
                <RealtimeColorPicker />
              </div>
              <div style={{ padding: 12, background: '#FFFDF8', border: `1px solid ${LINE}`, borderRadius: 12, fontSize: 13, color: MUTED }}>
                <div style={{ color: PINE, fontWeight: 800 }}>Shreeji Corporates Helpline:</div>
                <div style={{ marginTop: 4 }}><a href="tel:+918796977707" style={{ color: INK, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}><Phone size={13} /> +91 87969 77707 / +91 92669 44393</a></div>
                <div>madhu@shreejicorporates.com</div>
                <div>shreejicorporates@gmail.com</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <CommandPalette isOpen={commandOpen} onClose={() => setCommandOpen(false)} />
      <RequestQuoteModal isOpen={isQuoteModalOpen} onClose={() => setIsQuoteModalOpen(false)} />
    </header>
  );
}
