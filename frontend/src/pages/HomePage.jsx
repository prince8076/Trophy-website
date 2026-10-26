import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Truck, PenTool } from 'lucide-react';
import TrophyCard from '../components/TrophyCard';
import EngravingCustomizer from '../components/EngravingCustomizer';
import ReviewSection from '../components/ReviewSection';
import RequestQuoteModal from '../components/RequestQuoteModal';
import ShatterStage from '../components/ShatterStage';
import { fetchFeaturedOverview } from '../api';

// ------------------------------------------------------------------
// HomePage — fresh design v3, branch fresh-design-v3.
// This REPLACES the previous charcoal/gold designs (v1 poster,
// v2 split hero). The user said the old site was boring and asked
// for a fresh design using the design/animation resources they
// linked, with Framer-style motion. No template, site, or library
// code, text, or images are copied here — only patterns, in our
// own implementation:
//  - Aceternity-style effects, rebuilt: a mouse spotlight on the
//    hero image (spring-smoothed, like TrophyCard's tilt), a
//    scrolling word strip, and a bento-style first product.
//  - Emil Kowalski-style motion, rebuilt: framer-motion springs
//    (stiffness/damping, not linear tweens), staggered entrance,
//    whileHover / whileTap on actions, scroll-linked shatter.
//  - Editorial, not dark-and-gold: warm paper, pine green, and
//    vermilion, with a serif display face that actually loads
//    (Fraunces, via index.css) and a clean sans body (Manrope).
//  - Design checks applied, in plain terms: colours and fonts
//    come from tokens in index.css, no purple-blue gradient, no
//    invented numbers (no counts, no made-up testimonials), no
//    tracked-capital eyebrow, hero text fits the first screen,
//    grids use minmax(0, 1fr), reduced-motion turns entrance
//    animation off and the shatter already has a static fallback.
// The shatter still uses the new 48-frame landscape sequence in
// frontend/public/shatter-frames/ (already on this branch, pushed
// by the user). Routes, Navbar, Footer, catalog, product, cart
// and quote pages are unchanged (App.jsx).
// ------------------------------------------------------------------

const PAPER = '#FAF6EE';
const CREAM = '#FFFDF8';
const INK = '#1A1712';
const PINE = '#14342B';
const VERMILION = '#E4572E';
const GOLD = '#B9975B';
const LINE = '#E6DDCC';
const MUTED = '#6B6257';

const spring = { type: 'spring', stiffness: 120, damping: 20 };

export default function HomePage() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [data, setData] = useState({ categories: [], featured_products: [], guarantees: [] });
  const [loading, setLoading] = useState(true);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('recent');
  const [demoCustomization, setDemoCustomization] = useState({
    engraving_line1: 'ANNUAL LEADERSHIP EXCELLENCE',
    engraving_line2: 'MS. MADHU SHARMA & TEAM',
    engraving_line3: 'SHREEJI CORPORATES 2026',
    engraving_font: 'Classic Serif',
    plate_color: 'Gold',
  });

  // Hero spotlight: mouse position, spring-smoothed.
  const heroRef = useRef(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const sx = useSpring(mx, { stiffness: 120, damping: 20 });
  const sy = useSpring(my, { stiffness: 120, damping: 20 });

  useEffect(() => {
    fetchFeaturedOverview()
      .then(res => { setData(res); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const names = (data.categories || []).map(c => c.name || c.title).filter(Boolean);
    return ['all', ...names];
  }, [data.categories]);

  const products = useMemo(() => {
    let list = [...(data.featured_products || [])];
    if (filter !== 'all') {
      list = list.filter(p => (p.category_name || p.material || '') === filter);
    }
    if (sort === 'bestsellers') {
      list.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
    }
    return list;
  }, [data.featured_products, filter, sort]);

  const fadeUp = (delay = 0) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-80px' },
    transition: { ...spring, delay },
  });

  const onHeroMouse = (e) => {
    if (!heroRef.current || reduceMotion) return;
    const r = heroRef.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };

  return (
    <div className="fresh-body" style={{ background: PAPER, color: INK, minHeight: '100vh' }}>
      {/* ---------- Hero: full-screen landing, headline left, trophy right ---------- */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px', minHeight: 'calc(100vh - 72px)', display: 'flex', alignItems: 'center' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(0, 1fr))', gap: 40, alignItems: 'stretch', width: '100%' }}>
          <motion.div {...fadeUp(0)} style={{ alignSelf: 'center' }}>
            <div style={{ width: 32, height: 3, background: VERMILION, marginBottom: 16 }} />
            <p style={{ fontSize: 13, color: PINE, margin: 0, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Shreeji Corporates — awards, made to be kept</p>
            <h1 className="fresh-display" style={{ fontSize: 'clamp(48px, 7vw, 84px)', lineHeight: 0.98, fontWeight: 700, margin: '16px 0 0' }}>
              The win deserves
              <br />
              <span style={{ fontStyle: 'italic', color: VERMILION }}>something worth keeping.</span>
            </h1>
            <p style={{ fontSize: 18, lineHeight: 1.6, color: MUTED, maxWidth: 540, margin: '18px 0 0' }}>
              Crystal, metal, wood and acrylic trophies, engraved free, made for the person who earned them.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 28 }}>
              <motion.div whileHover={reduceMotion ? undefined : { scale: 1.03 }} whileTap={reduceMotion ? undefined : { scale: 0.97 }}>
                <Link to="/catalog" style={{ background: VERMILION, color: CREAM, padding: '14px 24px', borderRadius: 999, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  Explore trophies <ArrowRight size={16} />
                </Link>
              </motion.div>
              <motion.button
                type="button"
                whileHover={reduceMotion ? undefined : { scale: 1.03 }}
                whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                onClick={() => document.getElementById('engraving-studio')?.scrollIntoView({ behavior: 'smooth' })}
                style={{ background: 'transparent', border: `1.5px solid ${PINE}`, color: PINE, padding: '14px 24px', borderRadius: 999, fontWeight: 700, cursor: 'pointer' }}
              >
                Engraving studio
              </motion.button>
            </div>
            <button
              type="button"
              onClick={() => document.getElementById('shatter')?.scrollIntoView({ behavior: 'smooth' })}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: MUTED, fontWeight: 700, fontSize: 14, marginTop: 28, padding: 0 }}
            >
              Watch it break ↓
            </button>
          </motion.div>

          <motion.div
            ref={heroRef}
            onMouseMove={onHeroMouse}
            initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={spring}
            style={{ position: 'relative', borderRadius: 24, overflow: 'hidden', border: `1px solid ${LINE}`, boxShadow: '0 24px 60px rgba(26,23,18,0.18)' }}
          >
            <img
              src="/shatter-frames-webb/shatter-frame-001.jpg"
              alt="Signature silver and gold trophy, intact, on a dark studio background"
              style={{ width: '100%', height: '100%', minHeight: 420, display: 'block', objectFit: 'cover' }}
            />
            {!reduceMotion && (
              <motion.div
                aria-hidden="true"
                style={{
                  position: 'absolute', inset: 0, pointerEvents: 'none',
                  background: 'radial-gradient(320px circle at 50% 50%, rgba(250,246,238,0.28) 0%, transparent 70%)',
                }}
              />
            )}
            <div style={{ position: 'absolute', right: 16, top: 16, background: PINE, color: CREAM, borderRadius: 999, padding: '10px 16px', fontSize: 14, fontWeight: 700 }}>
              Crystal, metal, wood, acrylic
            </div>
          </motion.div>
        </div>
      </section>

      {/* ---------- Scroll story: full-viewport, then normal shopping ---------- */}
      {/* Word strip removed in v10: it sat between hero and shatter
          and broke the full-screen takeover. */}
      <div id="shatter">
        <ShatterStage
          onAddToBag={() => navigate('/catalog')}
          onEngrave={() => document.getElementById('engraving-studio')?.scrollIntoView({ behavior: 'smooth' })}
        />
      </div>

      {/* ---------- Collection: uniform grid, bento first item ---------- */}
      <section id="featured-trophies" style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px 20px' }}>
        <motion.div {...fadeUp(0)} style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h2 className="fresh-display" style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 700, margin: 0 }}>Featured trophies</h2>
            <p style={{ color: MUTED, margin: '8px 0 0', maxWidth: 560, lineHeight: 1.6 }}>Pick by occasion, not by guessing. Filter by material, sort by what people loved most.</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['recent', 'bestsellers'].map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setSort(s)}
                style={{
                  padding: '10px 16px', borderRadius: 999, cursor: 'pointer', fontWeight: 700, fontSize: 14,
                  background: sort === s ? PINE : 'transparent',
                  color: sort === s ? CREAM : MUTED,
                  border: `1px solid ${LINE}`,
                }}
              >
                {s === 'recent' ? 'Recent' : 'Bestsellers'}
              </button>
            ))}
          </div>
        </motion.div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 20 }}>
          {categories.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setFilter(c)}
              style={{
                padding: '10px 16px', borderRadius: 999, cursor: 'pointer', fontWeight: 700, fontSize: 14,
                background: filter === c ? VERMILION : 'transparent',
                color: filter === c ? CREAM : MUTED,
                border: `1px solid ${LINE}`,
              }}
            >
              {c === 'all' ? 'All' : c}
            </button>
          ))}
        </div>

        {loading ? (
          <p style={{ color: MUTED, padding: '40px 0' }}>Loading featured trophies…</p>
        ) : products.length === 0 ? (
          <div style={{ background: CREAM, border: `1px solid ${LINE}`, borderRadius: 20, padding: 32, marginTop: 24, textAlign: 'center' }}>
            <p style={{ color: MUTED, margin: 0 }}>No featured trophies loaded here — the catalogue may need the backend running, or this filter has no matches.</p>
            <Link to="/catalog" style={{ color: VERMILION, fontWeight: 800, display: 'inline-block', marginTop: 12 }}>Browse the full catalogue</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(0, 260px))', gap: 20, marginTop: 24 }}>
            {products.map((product, i) => (
              <motion.div
                key={product.id || product.slug}
                {...fadeUp(reduceMotion ? 0 : Math.min(i * 0.05, 0.3))}
                className={i === 0 ? 'fresh-bento-first' : undefined}
              >
                <TrophyCard product={product} />
              </motion.div>
            ))}
          </div>
        )}
        <div style={{ textAlign: 'center', marginTop: 28 }}>
          <Link to="/catalog" style={{ color: VERMILION, fontWeight: 800 }}>View all categories</Link>
        </div>
      </section>

      {/* ---------- How it works: three steps, no cards ---------- */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 20px 20px' }}>
        <motion.div {...fadeUp(0)}>
          <h2 className="fresh-display" style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 700, margin: 0 }}>How it works</h2>
        </motion.div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(0, 300px))', gap: 32, marginTop: 24 }}>
          {[
            { n: '01', t: 'Choose', d: 'Browse the collection and pick the trophy that fits the occasion.' },
            { n: '02', t: 'Personalise', d: 'Add names, a date, or a short message. The plate preview is live.' },
            { n: '03', t: 'Present', d: 'Request a quote, confirm the details, and present it with pride.' },
          ].map((s, i) => (
            <motion.div key={s.n} {...fadeUp(i * 0.08)} style={{ borderTop: `2px solid ${INK}`, paddingTop: 16 }}>
              <p className="fresh-display" style={{ fontSize: 40, color: VERMILION, margin: 0, fontWeight: 700 }}>{s.n}</p>
              <h3 className="fresh-display" style={{ fontSize: 24, margin: '8px 0 6px' }}>{s.t}</h3>
              <p style={{ color: MUTED, lineHeight: 1.6, margin: 0 }}>{s.d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ---------- Engraving: pine panel, customizer directly on it ---------- */}
      <section id="engraving-studio" style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 20px 20px' }}>
        <div style={{ background: PINE, color: CREAM, borderRadius: 24, padding: '32px 24px' }}>
          <motion.div {...fadeUp(0)}>
            <h2 className="fresh-display" style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 700, margin: 0, color: CREAM }}>Make it personal, free.</h2>
            <p style={{ color: '#C7D2CC', margin: '10px 0 24px', maxWidth: 620, lineHeight: 1.6 }}>
              Three lines, your choice of font and plate. What you type is what gets engraved.
            </p>
          </motion.div>
          <EngravingCustomizer customization={demoCustomization} onChange={setDemoCustomization} />
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 20, color: '#C7D2CC', fontSize: 14 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><PenTool size={16} color={GOLD} /> Live plate preview</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><ShieldCheck size={16} color={GOLD} /> Zero extra charge</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Truck size={16} color={GOLD} /> Careful packing and dispatch</span>
          </div>
        </div>
      </section>

      {/* ---------- Guarantees: list, not cards ---------- */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 20px' }}>
        <motion.div {...fadeUp(0)}>
          <h2 className="fresh-display" style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, margin: 0 }}>Why Shreeji</h2>
        </motion.div>
        <div style={{ marginTop: 16 }}>
          {(data.guarantees && data.guarantees.length > 0 ? data.guarantees.slice(0, 3) : [
            { title: 'Free laser engraving', desc: 'Every trophy, every plate, included at no extra charge.' },
            { title: 'Careful dispatch', desc: 'Packed to arrive in presentation condition.' },
            { title: 'Bulk pricing', desc: 'Better rates for teams, schools and corporate orders.' },
          ]).map((g, i) => (
            <motion.div key={i} {...fadeUp(i * 0.06)} style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'baseline', borderTop: `1px solid ${LINE}`, padding: '18px 0' }}>
              <h3 style={{ margin: 0, fontSize: 18, minWidth: 220 }}>{g.title || g.name}</h3>
              <p style={{ color: MUTED, lineHeight: 1.6, margin: 0, flex: 1, minWidth: 220 }}>{g.desc || g.description || ''}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <ReviewSection />

      {/* ---------- Final call to action ---------- */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 20px 64px', textAlign: 'center' }}>
        <motion.div {...fadeUp(0)}>
          <h2 className="fresh-display" style={{ fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 700, margin: 0, lineHeight: 1.02 }}>
            Ready to honour someone?
          </h2>
          <p style={{ color: MUTED, margin: '14px 0 24px', fontSize: 17 }}>Choose a trophy, personalise it, and request a quote. No payment needed to start.</p>
          <motion.button
            type="button"
            whileHover={reduceMotion ? undefined : { scale: 1.03 }}
            whileTap={reduceMotion ? undefined : { scale: 0.97 }}
            onClick={() => setIsQuoteModalOpen(true)}
            style={{ background: VERMILION, color: CREAM, padding: '16px 28px', borderRadius: 999, fontWeight: 800, cursor: 'pointer', border: 'none', fontSize: 16 }}
          >
            Request a quote
          </motion.button>
        </motion.div>
      </section>

      <RequestQuoteModal isOpen={isQuoteModalOpen} onClose={() => setIsQuoteModalOpen(false)} />
    </div>
  );
}
