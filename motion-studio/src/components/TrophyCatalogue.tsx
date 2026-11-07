import { useEffect, useState } from 'react';
import { PenLine, ShieldCheck, Package, BadgeCheck, MessageCircle } from 'lucide-react';
import { Reveal } from './Reveal';
import { whatsappUrl, quoteMessage } from '../lib/whatsapp';
import { fetchProducts } from '../lib/api';

// Trophy catalogue — in the site's light/orange style.
// No prices: every trophy is "Bespoke quote". The six items below
// are the FALLBACK catalogue, used only when the FastAPI backend
// (api/) is not running or VITE_API_URL is not set. When the
// backend is up, products come from GET /api/products instead,
// with the same shape.
const FILTERS = ['All', 'Crystal', 'Metal', 'Wood', 'Acrylic'] as const;

// All six currently use the real photo the user supplied
// (/trophies/trophy-featured.jpg) until each product gets its own
// photo — replace image_url in the backend, not here, once the
// backend is the source of truth.
const PRODUCTS = [
  { name: 'Championship Cup', material: 'Metal', category: 'Metal', badge: 'Bestseller', image: '/trophies/championship-cup-prince.jpg', real: true },
  { name: 'Crystal Tower', material: 'Crystal', category: 'Crystal', badge: '', image: '/trophies/crystal-tower-prince.jpg', real: true },
  { name: 'Wooden Shield', material: 'Wood', category: 'Wood', badge: '', image: '/trophies/wooden-shield-prince.jpg', real: true },
  { name: 'Acrylic Star', material: 'Acrylic', category: 'Acrylic', badge: 'New', image: '/trophies/acrylic-star-prince.jpg', real: true },
  { name: 'Silver Salver', material: 'Metal', category: 'Metal', badge: '', image: '/trophies/silver-salver-prince.jpeg', real: true },
  { name: 'Crystal Globe', material: 'Crystal', category: 'Crystal', badge: '', image: '/trophies/crystal-globe-prince.jpg', real: true },
];

const GUARANTEES = [
  { icon: PenLine, title: 'Free laser engraving', text: 'Included with every trophy.' },
  { icon: ShieldCheck, title: 'Hand-finished', text: 'Checked before it leaves the studio.' },
  { icon: Package, title: 'Secure packaging', text: 'Packed to arrive unbroken.' },
  { icon: BadgeCheck, title: 'Bespoke quote', text: 'No hidden price — ask, and we quote.' },
];

// One evocative line per product — what the trophy is FOR, not just
// what it is made of. These are copy, not claims: no invented
// numbers, clients or prices. Keyed by name so they work whether
// the product came from the API or the fallback below.
const BLURBS: Record<string, string> = {
  'Championship Cup': 'The classic cup for the biggest win of the season.',
  'Crystal Tower': 'A tall, clear statement for a standout achievement.',
  'Wooden Shield': 'Warm wood, engraved for a lasting tribute.',
  'Acrylic Star': 'Light, modern, and made to stand out.',
  'Silver Salver': 'A timeless tray for a formal presentation.',
  'Crystal Globe': 'The world, recognised — for a global win.',
};
const blurbFor = (name: string) => BLURBS[name] ?? 'Customised in crystal, metal, acrylic or wood.';

type CatalogueProduct = { name: string; material: string; category: string; badge: string; image: string; real: boolean };

// Responsive images — REVERTED to JPEG-only (2026-11-07, same day the
// srcset went in). The srcset + WebP variants broke all 6 catalogue
// photos in the user's browser within minutes of deploying, even
// though every variant returns 200 via curl. Root cause: the browser
// had cached a 404 for the WebP variants from the brief window when
// the new deployment was live but the variants were not yet, and
// vercel.json sets a 1-year `immutable` cache on /trophies/*, so the
// browser never revalidated the 404 — and a srcset candidate that
// fails does NOT fall back to the <img> src (same trap as the
// <picture> <source> that broke the photos in the first place).
// So the catalogue is plain JPEG <img> again, which always loads.
// The WebP variants are still generated at build time by
// scripts/generate-assets.mjs (they are valid and live) — they are
// just not referenced by the catalogue until a safe way to use them
// exists. Do NOT re-add srcset (or <picture>) here until the
// /trophies/* cache headers are fixed AND the variants are confirmed
// 200 live in the user's own browser, not just via curl.

export default function TrophyCatalogue() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');
  const [products, setProducts] = useState<CatalogueProduct[]>(PRODUCTS);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let live = true;
    fetchProducts().then((api) => {
      if (!live || !api || api.length === 0) return;
      setProducts(api.map((p) => ({ name: p.name, material: p.material, category: p.category, badge: p.badge, image: p.image_url, real: true })));
    }).finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, []);
  const shown = filter === 'All' ? products : products.filter((p) => p.category === filter);
  return (
    <section className="section" id="trophies">
      <div className="wrap">
        <Reveal><p className="label">Trophies — Featured</p></Reveal>
        <Reveal>
          <h2 className="display" style={{ fontSize: 'clamp(44px, 7vw, 96px)', margin: '16px 0 12px' }}>
            Choose<br />yours.
          </h2>
          <p className="lead">
            After the break, the choice. Pick a shape, pick a material, and
            we engrave it for the win it celebrates.
          </p>
        </Reveal>
        <div className="trophy-filters">
          {FILTERS.map((f) => (
            <button key={f} type="button" className={filter === f ? 'active' : ''} onClick={() => setFilter(f)}>
              {f}
            </button>
          ))}
        </div>
        {loading ? (
          <div className="trophy-grid" aria-label="Loading trophies">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="trophy-card" aria-hidden="true">
                <div className="trophy-visual skeleton" />
                <div className="skeleton skeleton-line" />
                <div className="skeleton skeleton-line short" />
              </div>
            ))}
          </div>
        ) : (
        <div className="trophy-grid">
          {shown.map((p) => (
            <article key={p.name} className="trophy-card">
              <div className="trophy-visual">
                <img src={p.image} alt={`${p.name} — ${p.material} trophy`} loading="lazy" width={800} height={600} className={'real' in p && p.real ? 'real-photo' : ''} />
                {p.badge && <span className="trophy-badge">{p.badge}</span>}
              </div>
              <h3>{p.name}</h3>
              <p className="trophy-blurb">{blurbFor(p.name)}</p>
              <p className="trophy-meta">{p.material} · Engraving included</p>
              <div className="trophy-foot">
                <div className="trophy-foot-top">
                  <span>Bespoke quote</span>
                  <span className="trophy-foot-note">Made to order</span>
                </div>
                <a className="trophy-order" href={whatsappUrl(quoteMessage(p.name, p.material))} target="_blank" rel="noreferrer">
                  <MessageCircle size={15} /> WhatsApp to order
                </a>
              </div>
            </article>
          ))}
        </div>
        )}
        {!loading && shown.length === 0 && <p style={{ color: 'var(--muted)' }}>Nothing in this material yet.</p>}
        <div className="trophy-guarantees">
          {GUARANTEES.map((g) => (
            <div key={g.title} className="trophy-guarantee">
              <g.icon size={22} />
              <div>
                <strong>{g.title}</strong>
                <span>{g.text}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
