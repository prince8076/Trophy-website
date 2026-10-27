import { useEffect, useState } from 'react';
import { PenLine, ShieldCheck, Package, BadgeCheck, ArrowRight } from 'lucide-react';
import { Reveal } from './Reveal';
import { whatsappUrl, quoteMessage } from '../lib/whatsapp';
import { fetchProducts } from '../lib/api';

// Trophy catalogue — in the site's black-and-gold style.
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

type CatalogueProduct = { name: string; material: string; category: string; badge: string; image: string; real: boolean };

export default function TrophyCatalogue() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');
  const [products, setProducts] = useState<CatalogueProduct[]>(PRODUCTS);
  useEffect(() => {
    let live = true;
    fetchProducts().then((api) => {
      if (!live || !api || api.length === 0) return;
      setProducts(api.map((p) => ({ name: p.name, material: p.material, category: p.category, badge: p.badge, image: p.image_url, real: true })));
    });
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
        <div className="trophy-grid">
          {shown.map((p) => (
            <article key={p.name} className="trophy-card">
              <div className="trophy-visual">
                <img src={p.image} alt={`${p.name} — ${p.material} trophy`} loading="lazy" className={'real' in p && p.real ? 'real-photo' : ''} />
                {p.badge && <span className="trophy-badge">{p.badge}</span>}
              </div>
              <h3>{p.name}</h3>
              <p>{p.material} · {p.category}</p>
              <div className="trophy-foot">
                <span>Bespoke quote</span>
                <a href={whatsappUrl(quoteMessage(p.name, p.material))} target="_blank" rel="noreferrer">
                  WhatsApp to order <ArrowRight size={14} />
                </a>
              </div>
            </article>
          ))}
        </div>
        {shown.length === 0 && <p style={{ color: 'var(--muted)' }}>Nothing in this material yet.</p>}
        <p className="trophy-sample-note">
          Sample catalogue — photos are the real photo you supplied, replace each product&apos;s photo with its own when ready.
        </p>
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
