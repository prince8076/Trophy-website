import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Trophy,
  Sparkles,
  ArrowRight,
  ArrowDown,
  CheckCircle2,
  X,
  Crown,
  GraduationCap,
  Building2,
  Landmark,
  HeartHandshake,
  CalendarCheck,
} from 'lucide-react';
import TrophyCard from '../components/TrophyCard';
import TrophyScroll3D from '../components/TrophyScroll3D';
import EngravingCustomizer from '../components/EngravingCustomizer';
import Marquee from '../components/ui/Marquee';
import Counter from '../components/motion/Counter';
import ReviewSection from '../components/ReviewSection';
import RequestQuoteModal from '../components/RequestQuoteModal';
import { fetchFeaturedOverview } from '../api';
import { useTheme } from '../context/ThemeContext';

// ------------------------------------------------------------------
// HomePage rebuilt in Alok-style layout language (original Shreeji
// copy, products and links — no Alok assets, text or prices copied):
// black full-bleed hero, white/off-white body, huge bold sans
// headlines, near-full-width large rounded showcase blocks, a
// moving trust marquee, pill buttons with a gold arrow circle,
// and stacked full-width collection tiers (last one inverted black).
// The site-wide Navbar is deliberately untouched here — it carries
// search, cart, command palette and admin, and changing it would
// affect every page, not just the homepage.
// ------------------------------------------------------------------

// Pill button with a gold arrow circle, in Alok's button pattern.
function ArrowPill({ children, to, onClick, dark, gold }) {
  const inner = (
    <span className={`inline-flex items-center gap-3 rounded-full py-2 pl-2 pr-5 text-sm font-bold transition-all ${
      dark ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'
    }`}>
      <span
        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
        style={{ backgroundColor: gold }}
      >
        <ArrowRight className="w-4 h-4 text-slate-950" />
      </span>
      <span>{children}</span>
    </span>
  );
  if (to) return <Link to={to}>{inner}</Link>;
  return <button type="button" onClick={onClick} className="cursor-pointer">{inner}</button>;
}

const SHOWCASE = [
  {
    title: 'Silver & Gold Championship Cup',
    subtitle: 'Silver cup • Gold ornate band • Black marble base',
    description: 'The trophy in your photos: a polished silver cup with a gold engraved band, curling scroll handles, and a black marble base with a blank silver plate, ready for your engraving. This is also the shape the scroll trophy below now follows.',
    badge: 'Photo style',
    image: '/images/trophy-silver-gold-front.jpg',
    fallback: '/uploads/star-pillar-crystal-award.png',
    actionText: 'Browse championship cups',
    actionHref: '/catalog',
    bg: 'bg-[#f2f0ec]',
  },
  {
    title: 'Star Pillar Crystal Excellence Award Trio',
    subtitle: 'Optical K9 Crystal • 3D Frosted Star Summits',
    description: 'Monumental triple crystal pillars celebrating milestone tenure and premier honors. Flawless light-refracting beveled edges with high-precision frosted etching.',
    badge: 'Bestseller Milestone',
    image: '/uploads/star-pillar-crystal-award.png',
    actionText: 'View Crystal Trio Details',
    actionHref: '/product/star-pillar-crystal-excellence-award-trio',
    bg: 'bg-[#eef2f7]',
  },
  {
    title: "Imperial Monogram 3D Golden 'R' Plinth",
    subtitle: '24K Mirror Gold Finish • Midnight Pedestal',
    description: 'Faceted monumental monogram cast in heavy alloy with mirror-polished 24K gold finish on a hand-beveled plinth with gold-filled typography.',
    badge: 'Monogram Executive',
    image: '/uploads/golden-letter-r-monogram-trophy.png',
    actionText: 'View Monogram Plinth',
    actionHref: '/product/imperial-monogram-3d-golden-r-plinth-trophy',
    bg: 'bg-white',
  },
  {
    title: 'Custom Die-Cut Submarine Acrylic Award',
    subtitle: 'Precision Silhouette • UV Direct Print',
    description: 'Bespoke laser-cut profile with reverse-cured high-density UV coloration and dual gold standoffs. Engineered for technical and corporate milestones.',
    badge: 'Bespoke Silhouette',
    image: '/uploads/custom-submarine-acrylic-award.png',
    actionText: 'View Acrylic Award',
    actionHref: '/product/custom-die-cut-submarine-acrylic-award',
    bg: 'bg-[#f2f0ec]',
  },
  {
    title: 'Centric Deal-Toy Dimensional Metal Plaque',
    subtitle: '3D Machined Metal Letters • Shadowbox',
    description: 'High-profile corporate deal-toy featuring individual 3D metallic bronze and gold block letters set inside an archival glass frame with transaction metrics.',
    badge: 'Corporate Deal-Toy',
    image: '/uploads/centric-deal-toy-metal-letter-plaque.jpg',
    actionText: 'View Deal-Toy Plaque',
    actionHref: '/product/centric-deal-toy-metal-letter-plaque',
    bg: 'bg-[#eef2f7]',
  },
  {
    title: 'Graduation Honor Open Book & Mortarboard Plaque',
    subtitle: 'Cold-Cast Bronze • Gold Gilded Page Rims',
    description: 'Sculpted open book with gilded gold page rims, miniature 3D brass mortarboard tassel, and laser-engraved gold dedication plate set on rosewood.',
    badge: 'Valedictorian Edition',
    image: '/uploads/graduation-open-book-mortarboard-plaque.jpg',
    actionText: 'View Academia Plaque',
    actionHref: '/product/graduation-honor-open-book-mortarboard-plaque',
    bg: 'bg-white',
  },
];

const TIERS = [
  {
    name: 'Single Awards',
    tag: 'For one special win',
    price: 'Price on request',
    dots: 1,
    dark: false,
    features: [
      { text: 'Free laser engraving', yes: true },
      { text: 'Single-piece dispatch', yes: true },
      { text: 'Choice of plate colour', yes: true },
      { text: 'Bulk discount', yes: false },
      { text: 'Dedicated account manager', yes: false },
      { text: 'Bespoke 3D design', yes: false },
    ],
  },
  {
    name: 'Corporate Bulk',
    tag: 'For teams and events',
    price: 'Price on request',
    dots: 2,
    dark: false,
    features: [
      { text: 'Free laser engraving', yes: true },
      { text: 'Bulk dispatch, pan-India', yes: true },
      { text: 'Choice of plate colour', yes: true },
      { text: 'Bulk discount', yes: true },
      { text: 'Dedicated account manager', yes: false },
      { text: 'Bespoke 3D design', yes: false },
    ],
  },
  {
    name: 'Bespoke Signature',
    tag: 'For landmark honours',
    price: 'Price on request',
    dots: 3,
    dark: true,
    features: [
      { text: 'Free laser engraving', yes: true },
      { text: 'Bulk dispatch, pan-India', yes: true },
      { text: 'Choice of plate colour', yes: true },
      { text: 'Bulk discount', yes: true },
      { text: 'Dedicated account manager', yes: true },
      { text: 'Bespoke 3D design', yes: true },
    ],
  },
];

export default function HomePage() {
  const { theme, currentTheme, setCurrentTheme, themes } = useTheme();
  const [data, setData] = useState({ categories: [], featured_products: [], guarantees: [] });
  const [loading, setLoading] = useState(true);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const navigate = useNavigate();

  const [demoCustomization, setDemoCustomization] = useState({
    engraving_line1: 'ANNUAL LEADERSHIP EXCELLENCE',
    engraving_line2: 'MS. MADHU SHARMA & TEAM',
    engraving_line3: 'SHREEJI CORPORATES 2026',
    engraving_font: 'Classic Serif',
    plate_color: 'Gold',
  });

  useEffect(() => {
    fetchFeaturedOverview()
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load overview:', err);
        setLoading(false);
      });
  }, []);

  const gold = theme.primary || '#d4af37';

  return (
    <div className="bg-[#faf9f6] text-slate-900 font-sans overflow-hidden">
      {/* ------------------------------------------------ Hero: black, full-bleed, huge bold sans */}
      <section className="bg-black text-white mx-2 sm:mx-3 mt-2 rounded-[2rem] overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-10 py-12 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="lg:col-span-7 space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/20 text-xs font-bold tracking-wide">
                <Crown className="w-3.5 h-3.5" style={{ color: gold }} />
                <span>Shreeji Corporates — 20+ Years Trust • Led by Ms. Madhu Sharma</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.02]">
                Every milestone
                <br />
                deserves an
                <br />
                <span style={{ color: gold }}>immortalized honor.</span>
              </h1>
              <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed">
                India&apos;s premier artisan memento and trophy house. From optical crystal prisms and carved natural timber to spun metal championship cups — customized with free laser engraving.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <ArrowPill to="/catalog" gold={gold}>Explore all categories</ArrowPill>
                <ArrowPill onClick={() => setIsQuoteModalOpen(true)} dark gold={gold}>Request custom quote</ArrowPill>
                <a href="#engraving-studio" className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-3 text-sm font-bold hover:border-white/60 transition-colors">
                  <Sparkles className="w-4 h-4" style={{ color: gold }} /> Engraving Studio
                </a>
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
                <span className="font-bold" style={{ color: gold }}>Gold &amp; Metal Finish:</span>
                {Object.values(themes).map(palette => (
                  <button
                    key={palette.id}
                    type="button"
                    onClick={() => setCurrentTheme(palette.id)}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                      currentTheme === palette.id
                        ? 'border-white bg-white/15 text-white'
                        : 'border-white/20 bg-black text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: palette.primary }} />
                    <span>{palette.name}</span>
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/15 max-w-lg">
                <div>
                  <div className="text-2xl sm:text-3xl font-black tabular-nums"><Counter value={20} suffix="+ Yrs" /></div>
                  <div className="text-xs text-slate-400 mt-0.5">Industry Trust</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black tabular-nums"><Counter value={50000} suffix="+" /></div>
                  <div className="text-xs text-slate-400 mt-0.5">Awards Delivered</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black tabular-nums"><Counter value={100} suffix="%" /></div>
                  <div className="text-xs text-slate-400 mt-0.5">Free Engraving</div>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.2 }}
              className="lg:col-span-5"
            >
              <div className="rounded-[1.75rem] overflow-hidden bg-white/10 shadow-2xl">
                <img
                  src="/images/trophy-silver-gold-side.jpg"
                  alt="Silver and gold championship cup with ornate gold band on a black marble base"
                  className="w-full h-[420px] sm:h-[520px] object-cover"
                  onError={(e) => {
                    const src = e.currentTarget.src;
                    if (src.includes('trophy-silver-gold-side')) {
                      e.currentTarget.src = '/images/trophy-silver-gold-front.jpg';
                    } else {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/uploads/star-pillar-crystal-award.png';
                    }
                  }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-3 text-center">
                Silver cup, gold band, scroll handles, black marble base — the photo style, in the scroll story below.
              </p>
            </motion.div>
          </div>
          <div className="flex items-center justify-between pt-10 text-slate-400 text-xs font-bold uppercase tracking-widest">
            <span>Scroll to see the craft</span>
            <a href="#showcase" className="w-10 h-10 rounded-full border border-white/25 flex items-center justify-center hover:border-white/70 transition-colors" aria-label="Scroll to showcase">
              <ArrowDown className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Scroll 3D trophy — now in the photo style (silver cup, gold band). */}
      <TrophyScroll3D
        onAddToBag={() => navigate('/catalog')}
        onEngrave={() => document.getElementById('engraving-studio')?.scrollIntoView({ behavior: 'smooth' })}
      />

      {/* Trust marquee, Alok-style: plain items with dividers on white */}
      <section className="bg-white border-y border-slate-200 py-5">
        <p className="text-center text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-3">
          Trusted by India&apos;s premier convocations &amp; corporate laureates
        </p>
        <Marquee speed={32} pauseOnHover={true}>
          {[
            'SXSW Innovation Laureates',
            'Tata Consultancy Services',
            'All India University Convocations',
            'Indian Armed Forces Protocol',
            'HDFC & ICICI Executive Suites',
            'Rotary International Global Laurels',
            'Championship Sports Leagues',
            'Bespoke Deal-Toy & Founder Honors',
          ].map((text, idx) => (
            <span key={idx} className="flex items-center gap-6 pr-6 text-sm font-bold text-slate-800 whitespace-nowrap">
              <span>{text}</span>
              <span style={{ color: gold }}>|</span>
            </span>
          ))}
        </Marquee>
      </section>

      {/* Large showcase blocks, one per creation — Alok's gallery pattern */}
      <section id="showcase" className="max-w-[1400px] mx-auto px-3 sm:px-6 py-16 sm:py-24 space-y-6">
        <div className="px-2 pb-4">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: gold }}>Bespoke Signature Creations</p>
          <h2 className="text-4xl sm:text-6xl font-black tracking-tight mt-2">Work that speaks<br />before the speech.</h2>
          <p className="text-slate-500 mt-3 max-w-xl">One creation per block, large enough to judge the finish — crystal, metal, acrylic and marble, all with free laser engraving.</p>
        </div>
        {SHOWCASE.map((item, idx) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className={`rounded-[2rem] ${item.bg} border border-slate-200/70 shadow-sm overflow-hidden`}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className={`p-6 sm:p-10 flex flex-col justify-center ${idx % 2 === 1 ? 'lg:order-2' : ''}`}>
                <span className="inline-flex w-fit items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-[11px] font-bold uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: gold }} /> {item.badge}
                </span>
                <h3 className="text-3xl sm:text-4xl font-black tracking-tight mt-4 leading-tight">{item.title}</h3>
                <p className="text-sm font-bold text-slate-500 mt-2">{item.subtitle}</p>
                <p className="text-slate-600 leading-relaxed mt-3">{item.description}</p>
                <div className="pt-6">
                  <ArrowPill to={item.actionHref} gold={gold}>{item.actionText}</ArrowPill>
                </div>
              </div>
              <div className={`p-3 sm:p-4 ${idx % 2 === 1 ? 'lg:order-1' : ''}`}>
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-[320px] sm:h-[420px] object-cover rounded-[1.5rem] bg-white shadow-md"
                  onError={item.fallback ? (e) => { e.currentTarget.onerror = null; e.currentTarget.src = item.fallback; } : undefined}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </section>

      {/* Who We Serve — light cards */}
      <section id="who-we-serve" className="max-w-[1400px] mx-auto px-3 sm:px-6 pb-16 sm:pb-24">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: gold }}>Diverse Sectors</p>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight mt-2">Who we serve across India</h2>
          <p className="text-slate-500 mt-2">Tailored recognition solutions designed for every occasion and organization.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: GraduationCap, title: 'Educational Institutions', desc: 'Awards, medals, and mementos for academic excellence, school toppers, and university convocations.', tag: 'Convocations & Annual Days' },
            { icon: Trophy, title: 'Sports Associations', desc: 'Trophies and medals for tournaments, leagues, track & field events, and championship cups.', tag: 'Tournaments & Leagues' },
            { icon: Building2, title: 'Corporate Organizations', desc: 'Customized corporate gifts, employee recognition programs, leadership flame awards, and deal-toys.', tag: 'Executive Recognition' },
            { icon: Landmark, title: 'Government Bodies', desc: 'Formal mementos and medals for public service, civic dedication, and official state protocol.', tag: 'Public Service Honors' },
            { icon: HeartHandshake, title: 'Social Organizations', desc: 'Mementos and certificates for community programs, charitable initiatives, and rotary recognition.', tag: 'Community Programs' },
            { icon: CalendarCheck, title: 'Event Management', desc: 'Branded recognition products for large-scale conferences, galas, industry summits, and festivals.', tag: 'Galas & Conventions' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="p-6 rounded-[1.5rem] bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: `${gold}22`, color: gold }}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black">{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed mt-1">{item.desc}</p>
                <p className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-bold uppercase tracking-wider" style={{ color: gold }}>{item.tag}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Browse by category — light cards, same data and links as before */}
      <section className="max-w-[1400px] mx-auto px-3 sm:px-6 pb-16 sm:pb-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: gold }}>Full Manufacturing Spectrum</p>
            <h2 className="text-4xl font-black tracking-tight mt-2">Browse by award category</h2>
            <p className="text-slate-500 mt-1">From optical crystal prisms and carved natural timber to sports cups and bespoke acrylic silhouettes.</p>
          </div>
          <Link to="/catalog" className="mt-3 md:mt-0 text-sm font-bold inline-flex items-center gap-2 hover:underline" style={{ color: gold }}>
            View all categories <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {data.categories?.map((cat) => (
            <Link
              key={cat.id}
              to={`/catalog?category=${cat.slug}`}
              className="group p-5 rounded-[1.5rem] bg-white hover:bg-slate-50 border border-slate-200 hover:border-amber-500/50 transition-all shadow-sm hover:shadow-md"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${gold}22`, color: gold }}>
                  <Trophy className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono text-slate-500">{cat.products_count} awards</span>
              </div>
              <h4 className="text-sm font-black leading-snug">{cat.name}</h4>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{cat.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products — same TrophyCard grid, light heading */}
      <section className="max-w-[1400px] mx-auto px-3 sm:px-6 pb-16 sm:pb-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: gold }}>Curated Masterpieces</p>
            <h2 className="text-4xl font-black tracking-tight mt-2">Signature 3D awards &amp; trophies</h2>
            <p className="text-slate-500 mt-1">Hover to tilt in 3D perspective with real-time lighting physics.</p>
          </div>
          <Link to="/catalog" className="mt-3 md:mt-0 text-sm font-bold inline-flex items-center gap-2 hover:underline" style={{ color: gold }}>
            Explore complete catalog <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="h-96 bg-white rounded-[1.5rem] border border-slate-200" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.featured_products.map(product => (
              <TrophyCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Leadership — light block, same copy */}
      <section className="max-w-[1400px] mx-auto px-3 sm:px-6 pb-16 sm:pb-24">
        <div className="p-8 sm:p-12 rounded-[2rem] bg-white border border-slate-200 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-4">
              <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 text-xs font-bold uppercase tracking-wider">
                <Crown className="w-3.5 h-3.5" style={{ color: gold }} /> Our Story &amp; Leadership
              </p>
              <h2 className="text-3xl font-black tracking-tight mt-3">Led by Ms. Madhu Sharma</h2>
              <p className="text-sm font-bold mt-1" style={{ color: gold }}>20+ Years of Industry Trust &amp; Craftsmanship</p>
            </div>
            <div className="lg:col-span-8 space-y-4 text-slate-600 leading-relaxed lg:border-l border-slate-200 lg:pl-10">
              <p><strong className="text-slate-900">Shreeji Corporates</strong> is a professionally managed organization specializing in trophies, awards, mementos, medals, corporate gifts, and customized recognition solutions — built on an unwavering foundation of trust and expertise.</p>
              <div className="p-4 rounded-2xl border border-slate-200 bg-[#faf9f6] text-sm">
                <strong className="block mb-1 text-slate-900">Our Core Commitment:</strong>
                &quot;Every product is crafted to celebrate achievements, honor excellence, and create meaningful, lasting impressions for every client we serve.&quot;
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Engraving studio — inverted black block, same customizer */}
      <section id="engraving-studio" className="max-w-[1400px] mx-auto px-3 sm:px-6 pb-16 sm:pb-24">
        <div className="p-8 sm:p-12 rounded-[2rem] bg-black text-white shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5 space-y-4">
              <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/20 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" style={{ color: gold }} /> Live Customizer Studio
              </p>
              <h2 className="text-3xl font-black tracking-tight">
                Complimentary precision <span style={{ color: gold }}>laser engraving studio</span>
              </h2>
              <p className="text-slate-300 leading-relaxed text-sm">
                Test your award text in real time across Polished Gold, Brushed Silver, and Midnight Black plates with classic typography.
              </p>
              <div className="space-y-2 text-sm text-slate-300">
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /><span>Permanent fiber laser etching on metal plates</span></div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /><span>Zero setup fees or hidden character limits</span></div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /><span>Anti-tarnish, corrosion-resistant lifetime warranty</span></div>
              </div>
              <div className="pt-4">
                <ArrowPill to="/catalog" gold={gold}>Choose a trophy to personalize</ArrowPill>
              </div>
            </div>
            <div className="lg:col-span-7">
              <EngravingCustomizer
                customization={demoCustomization}
                onChange={setDemoCustomization}
                maxLines={3}
                maxChars={35}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Collection tiers — Alok pricing pattern, Shreeji quote model, no invented prices */}
      <section className="max-w-[1400px] mx-auto px-3 sm:px-6 pb-16 sm:pb-24">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: gold }} /> Collection Tiers
          </p>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight mt-4">Choose how you order.</h2>
          <p className="text-slate-500 mt-2">Transparent, quote-based tiers tailored to your needs. Tell us your project and find the tier that works for you.</p>
          <div className="pt-5">
            <ArrowPill onClick={() => setIsQuoteModalOpen(true)} gold={gold}>Request custom quote</ArrowPill>
          </div>
        </div>
        <div className="space-y-5">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-[2rem] p-6 sm:p-10 shadow-sm border relative ${
                tier.dark ? 'bg-black text-white border-black' : 'bg-white text-slate-900 border-slate-200'
              }`}
            >
              <div className="absolute top-6 right-6 flex gap-1.5">
                {Array.from({ length: tier.dots }).map((_, i) => (
                  <span key={i} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: gold }} />
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-5">
                  <p className="text-3xl sm:text-4xl font-black">{tier.price}</p>
                  <h3 className="text-xl font-black mt-3 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: gold }} /> {tier.name}
                  </h3>
                  <p className={tier.dark ? 'text-slate-300 mt-1' : 'text-slate-500 mt-1'}>{tier.tag}</p>
                  <div className="pt-5">
                    <ArrowPill onClick={() => setIsQuoteModalOpen(true)} dark={tier.dark} gold={gold}>Request this tier</ArrowPill>
                  </div>
                </div>
                <div className={`lg:col-span-7 rounded-[1.5rem] p-5 sm:p-6 ${tier.dark ? 'bg-white/10' : 'bg-[#faf9f6] border border-slate-100'}`}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-4">What&apos;s included</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {tier.features.map((f) => (
                      <div key={f.text} className="flex items-center gap-2 text-sm">
                        {f.yes
                          ? <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: gold }} />
                          : <X className="w-4 h-4 shrink-0 text-slate-400" />}
                        <span className={f.yes ? '' : 'text-slate-400 line-through'}>{f.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <ReviewSection />

      {/* Why choose + core values — light cards */}
      <section className="max-w-[1400px] mx-auto px-3 sm:px-6 py-16 sm:py-24">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: gold }}>Four Pillars of Excellence</p>
          <h2 className="text-4xl font-black tracking-tight mt-2">Why choose Shreeji Corporates?</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
          {[
            { num: '01', title: 'Quality', desc: 'Premium optical crystal, hand-selected timbers, and solid brass castings.' },
            { num: '02', title: 'Customization', desc: 'Design, laser engraving, and branding tailored exactly to your vision.' },
            { num: '03', title: 'Timely Delivery', desc: 'Reliable production schedules you can count on for high-stakes banquets.' },
            { num: '04', title: 'Competitive Pricing', desc: 'Value-driven direct workshop rates without compromising finishing quality.' },
          ].map(p => (
            <div key={p.num} className="p-6 rounded-[1.5rem] bg-white border border-slate-200 shadow-sm text-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-sm" style={{ backgroundColor: `${gold}22`, color: gold }}>{p.num}</div>
              <h4 className="font-black">{p.title}</h4>
              <p className="text-sm text-slate-500 mt-1">{p.desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center mb-8">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: gold }}>The Shreeji Standard</p>
          <h2 className="text-3xl font-black tracking-tight mt-2">Our core values</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { title: 'Integrity', desc: 'Honesty, transparency, and ethical practices at every step.' },
            { title: 'Quality', desc: 'Products meeting the highest standards of craftsmanship.' },
            { title: 'Customer Focus', desc: 'Striving to exceed client expectations on every order.' },
            { title: 'Reliability', desc: 'Honoring commitments with dependable, timely service.' },
            { title: 'Excellence', desc: 'Continuous innovation to achieve and sustain excellence.' },
          ].map((v) => (
            <div key={v.title} className="p-5 rounded-[1.5rem] bg-white border border-slate-200 shadow-sm text-center">
              <h4 className="font-black">{v.title}</h4>
              <p className="text-sm text-slate-500 mt-1">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="pb-4 flex justify-center">
        <a href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-xs font-bold text-slate-500 hover:text-slate-900 inline-flex items-center gap-2">
          Back to top <ArrowDown className="w-3.5 h-3.5 rotate-180" />
        </a>
      </div>

      <RequestQuoteModal isOpen={isQuoteModalOpen} onClose={() => setIsQuoteModalOpen(false)} />
    </div>
  );
}
