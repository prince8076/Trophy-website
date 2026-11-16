import { useEffect, useState } from 'react';
import { PenLine, ShieldCheck, Package, BadgeCheck, MessageCircle } from 'lucide-react';
import { Reveal } from './Reveal';
import { whatsappUrl, quoteMessage } from '../lib/whatsapp';
import { fetchProducts } from '../lib/api';
import { webpSrcSet } from '../lib/images';

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
  { icon: BadgeCheck, title: 'Bespoke quote', text: 'No hidden price. Ask, and we quote.' },
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
  'Crystal Globe': 'The world, recognised for a global win.',
  'Crystal Gold Star': 'Faceted crystal crowned with a gold star. A striking centrepiece for the highest honour.',
};
const blurbFor = (name: string) => BLURBS[name] ?? 'Customised in crystal, metal, acrylic or wood.';

type CatalogueProduct = { name: string; material: string; category: string; badge: string; image: string; real: boolean };

// Responsive images — WebP srcset (2026-11-16, re-enabled). The
// srcset + WebP variants were REVERTED to JPEG-only on 2026-11-07
// after they broke all 6 catalogue photos in the user's browser
// within minutes: the browser had cached a 404 for the WebP
// variants from the brief window when the new deployment was live
// but the variants were not yet, and vercel.json then set a 1-year
// `immutable` cache on /trophies/*, so the browser never
// revalidated the 404 — and a srcset candidate that fails does NOT
// fall back to the <img> src. Both causes are now fixed:
// /trophies/* is `public, max-age=86400` (1 day), and the variants
// are generated in the SAME build (prebuild) as the HTML that
// references them, so there is no window where the HTML references
// a variant that does not exist. The variants were confirmed 200
// live before srcset was re-enabled. See src/lib/images.ts.

export default function TrophyCatalogue() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');
  const [products, setProducts] = useState<CatalogueProduct[]>(PRODUCTS);
  // Loading starts false (not true): the fallback PRODUCTS above are
  // already present, so the grid renders immediately — and the
  // build-time pre-render (which never runs effects) includes the
  // real products instead of skeletons. The API fetch below still
  // replaces them when it returns.
  const [loading, setLoading] = useState(false);
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
      {/* Product structured data (2026-11-16): one Product per
          catalogue item, built from the live product list. No
          offers/price (the shop is bespoke-quote, no prices exist)
          and no aggregateRating (the reviews are placeholders, not
          verified Google reviews). Image is the absolute .com URL. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': products.map((p) => ({
              '@type': 'Product',
              name: p.name,
              image: `https://www.shreejicorporates.com${p.image}`,
              description: BLURBS[p.name] ?? 'Customised in crystal, metal, acrylic or wood.',
              material: p.material,
              category: p.category,
              brand: { '@type': 'Brand', name: 'Shreeji Corporates' },
            })),
          }),
        }}
      />
      <div className="wrap">
        <Reveal><p className="label">Trophies, Featured</p></Reveal>
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
                <img src={webpSrcSet(p.image).src} srcSet={webpSrcSet(p.image).srcSet} sizes={webpSrcSet(p.image).sizes} alt={`${p.name}, ${p.material} trophy`} loading="lazy" decoding="async" width={800} height={600} className={'real' in p && p.real ? 'real-photo' : ''} />
                {p.badge && <span className="trophy-badge">{p.badge}</span>}
              </div>
              <h3>{p.name}</h3>
              <p className="trophy-blurb">{blurbFor(p.name)}</p>
              <p className="trophy-meta">{p.material} · Engraving included</p>
              <div className="trophy-foot">
                <div className="trophy-foot-top">
                  <span>Bespoke quote · Made to order</span>
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
        {/* Downloadable catalogue PDF [PLACEHOLDER]: the button links
            to /catalogue.pdf, which does not exist yet — it will 404
            until the owner supplies the PDF (drop it into
            public/catalogue.pdf via git, no code change needed). */}
        <div style={{ marginTop: 28 }}>
          <a className="btn btn-ghost" href="/catalogue.pdf" download>
            Download catalogue (PDF)
          </a>
        </div>
      </div>
    </section>
  );
}
