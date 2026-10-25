import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Trophy,
  Award,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  Star,
  CheckCircle2,
  Crown,
  Gem,
  Medal,
  Shield,
  GraduationCap,
  Building2,
  Landmark,
  HeartHandshake,
  CalendarCheck,
  Palette,
  Eye,
  Send,
  Layers,
} from 'lucide-react';
import TrophyCard from '../components/TrophyCard';
import Trophy3DViewer from '../components/Trophy3DViewer';
import TrophyScroll3D from '../components/TrophyScroll3D';
import EngravingCustomizer from '../components/EngravingCustomizer';
import HaikeiBackground from '../components/HaikeiBackground';
import TextReveal from '../components/motion/TextReveal';
import MagneticButton from '../components/motion/MagneticButton';
import Counter from '../components/motion/Counter';
import SpotlightCard from '../components/ui/SpotlightCard';
import ShimmerButton from '../components/ui/ShimmerButton';
import Marquee from '../components/ui/Marquee';
import { BentoGrid, BentoCard } from '../components/ui/BentoGrid';
import ReviewSection from '../components/ReviewSection';
import RequestQuoteModal from '../components/RequestQuoteModal';
import { fetchFeaturedOverview } from '../api';
import { useTheme } from '../context/ThemeContext';

const categoryIconMap = {
  Trophy: Trophy,
  Award: Award,
  Gem: Gem,
  Crown: Crown,
  Medal: Medal,
  Shield: Shield,
};

export default function HomePage() {
  const { theme, currentTheme, setCurrentTheme, themes } = useTheme();
  const [data, setData] = useState({ categories: [], featured_products: [], guarantees: [] });
  const [loading, setLoading] = useState(true);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const navigate = useNavigate();

  // Demo state for the homepage interactive preview
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

  return (
    <div className="relative space-y-28 overflow-hidden">
      {/* Background Haikei Organic Waves & Mesh */}
      <HaikeiBackground variant="waves" className="z-0" />
      <HaikeiBackground variant="blobs" className="z-0" />

      {/* Hero Section with Motion Primitives & 3D Stage */}
      <section className="relative pt-12 pb-20 md:pt-24 md:pb-36 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines & Motion Reveals */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="lg:col-span-7 space-y-6 text-center lg:text-left"
            >
              {/* Shreeji Authority Badge */}
              <motion.div
                whileHover={{ scale: 1.03 }}
                style={{
                  borderColor: theme.borderGlow,
                  backgroundColor: theme.bgTint,
                  color: theme.primary,
                }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold tracking-wide shadow-sm"
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Shreeji Corporates — 20+ Years Trust • Led by Ms. Madhu Sharma</span>
              </motion.div>

              {/* Headline with TextReveal Motion Primitive */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.12] font-serif-luxury">
                <TextReveal delay={0.05}>Every Milestone Deserves</TextReveal> <br />
                <span
                  style={{
                    background: `linear-gradient(135deg, ${theme.primaryLight} 0%, ${theme.primary} 50%, ${theme.primaryDark} 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                  className="inline-block"
                >
                  <TextReveal delay={0.3}>An Immortalized Honor.</TextReveal>
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                India's premier artisan memento and trophy house. From optical crystal prisms and carved natural timber to spun metal championship cups — customized with free laser engraving.
              </p>

              {/* Black & Gold Luxury Metal Finishes */}
              <div className="pt-2 flex items-center justify-center lg:justify-start gap-2 flex-wrap text-xs">
                <span className="text-amber-400/90 font-bold flex items-center gap-1 text-[11px] font-heading-cinzel">
                  <Crown className="w-3.5 h-3.5 text-amber-400" /> Gold & Metal Finish:
                </span>
                {Object.values(themes).map(palette => (
                  <button
                    key={palette.id}
                    type="button"
                    onClick={() => setCurrentTheme(palette.id)}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                      currentTheme === palette.id
                        ? 'border-amber-400 bg-amber-500/20 text-amber-200 shadow-md shadow-amber-500/10'
                        : 'border-slate-800 bg-black/70 text-slate-400 hover:text-white hover:border-amber-500/30'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: palette.primary }} />
                    <span>{palette.name}</span>
                  </button>
                ))}
              </div>

              {/* CTAs with ShimmerButton, Request Quote & Engraving Studio */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-3 flex-wrap">
                <Link to="/catalog">
                  <ShimmerButton className="w-full sm:w-auto">
                    <span>Explore All Categories</span>
                    <ArrowRight className="w-4 h-4" />
                  </ShimmerButton>
                </Link>

                <button
                  type="button"
                  onClick={() => setIsQuoteModalOpen(true)}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Send className="w-4 h-4 text-amber-400" />
                  <span>Request Custom Quote</span>
                </button>

                <a href="#engraving-studio">
                  <MagneticButton className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-700 hover:border-amber-500/40 text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer">
                    <Sparkles className="w-4 h-4" style={{ color: theme.primary }} />
                    <span>Engraving Studio</span>
                  </MagneticButton>
                </a>
              </div>

              {/* Metrics with Animated Counter */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-800/80 max-w-lg mx-auto lg:mx-0">
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-white font-heading-cinzel tabular-nums">
                    <Counter value={20} suffix="+ Yrs" />
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">Industry Trust</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-white font-heading-cinzel tabular-nums">
                    <Counter value={50000} suffix="+" />
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">Awards Delivered</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-white font-heading-cinzel tabular-nums">
                    <Counter value={100} suffix="%" />
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">Free Engraving</div>
                </div>
              </div>
            </motion.div>

            {/* Right Column: 3D Trophy Stage */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.2 }}
              className="lg:col-span-5"
            >
              <Trophy3DViewer
                title="Optical Star Pillar Crystal Award"
                imageUrl="/uploads/star-pillar-crystal-award.png"
                material="Optical K9 Crystal Prism • Heavy Diamond Plinth"
                engravingText={demoCustomization.engraving_line1}
                plateColor={demoCustomization.plate_color}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Scroll 3D Trophy — free stack: Three.js + Poly Haven CC0 HDRI fallback.
          Scroll rotates a real 3D trophy; Add to Bag goes to /catalog,
          Engraving scrolls to the engraving studio below. */}
      <TrophyScroll3D
        onAddToBag={() => navigate('/catalog')}
        onEngrave={() => document.getElementById('engraving-studio')?.scrollIntoView({ behavior: 'smooth' })}
      />

      {/* 21st.dev Trust Laureates Marquee */}
      <section className="relative z-10 border-y border-slate-800/80 bg-slate-950/70 backdrop-blur-md py-4">
        <div className="max-w-7xl mx-auto px-4 mb-2 flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase tracking-widest">
          <span className="flex items-center gap-1.5 text-amber-400 font-bold">
            <Sparkles className="w-3.5 h-3.5" /> Trusted by India's Premier Convocations & Corporate Laureates
          </span>
          <span className="hidden sm:inline text-slate-500">Pan-India Express Dispatch • 20+ Yrs</span>
        </div>
        <Marquee speed={32} pauseOnHover={true}>
          {[
            { text: 'SXSW Innovation Laureates', icon: '⭐' },
            { text: 'Tata Consultancy Services', icon: '🏛️' },
            { text: 'All India University Convocations', icon: '🎓' },
            { text: 'Indian Armed Forces Protocol', icon: '🎖️' },
            { text: 'HDFC & ICICI Executive Suites', icon: '💎' },
            { text: 'Rotary International Global Laurels', icon: '👑' },
            { text: 'Championship Sports Leagues', icon: '🏆' },
            { text: 'Bespoke Deal-Toy & Founder Honors', icon: '📜' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-bold text-slate-200 whitespace-nowrap shadow-sm hover:border-amber-500/40 hover:text-amber-300 transition-colors"
            >
              <span>{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </Marquee>
      </section>

      {/* Leadership & Story Spotlight (Brochure Page 2) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/90 border border-slate-800/90 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-4 text-center lg:text-left">
              <div
                style={{
                  backgroundColor: theme.bgTint,
                  borderColor: theme.borderGlow,
                  color: theme.primary,
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider mb-3"
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Our Story & Leadership</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white font-serif-luxury">
                Led by Ms. Madhu Sharma
              </h2>
              <p style={{ color: theme.primary }} className="text-xs font-semibold mt-1">
                20+ Years of Industry Trust & Craftsmanship
              </p>
            </div>

            <div className="lg:col-span-8 space-y-4 text-sm text-slate-300 leading-relaxed border-t lg:border-t-0 lg:border-l border-slate-800 pt-6 lg:pt-0 lg:pl-10">
              <p>
                <strong>Shreeji Corporates</strong> is a professionally managed organization specializing in trophies, awards, mementos, medals, corporate gifts, and customized recognition solutions — built on an unwavering foundation of trust and expertise.
              </p>
              <div
                style={{
                  backgroundColor: `${theme.primary}12`,
                  borderColor: `${theme.primary}30`,
                  color: theme.primaryLight,
                }}
                className="p-4 rounded-xl border text-xs"
              >
                <strong className="block mb-1 text-white">Our Core Commitment:</strong>
                "Every product is crafted to celebrate achievements, honor excellence, and create meaningful, lasting impressions for every client we serve."
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who We Serve — Interactive Bento Grid (Brochure Page 3) */}
      <section id="who-we-serve" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div
            style={{ color: theme.primary }}
            className="text-xs font-bold uppercase tracking-widest mb-2"
          >
            Diverse Sectors
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white font-serif-luxury">
            Who We Serve Across India
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Tailored recognition solutions designed for every occasion and organization.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: GraduationCap,
              title: 'Educational Institutions',
              desc: 'Awards, medals, and mementos for academic excellence, school toppers, and university convocations.',
              tag: 'Convocations & Annual Days',
            },
            {
              icon: Trophy,
              title: 'Sports Associations',
              desc: 'Trophies and medals for tournaments, leagues, track & field events, and championship cups.',
              tag: 'Tournaments & Leagues',
            },
            {
              icon: Building2,
              title: 'Corporate Organizations',
              desc: 'Customized corporate gifts, employee recognition programs, leadership flame awards, and deal-toys.',
              tag: 'Executive Recognition',
            },
            {
              icon: Landmark,
              title: 'Government Bodies',
              desc: 'Formal mementos and medals for public service, civic dedication, and official state protocol.',
              tag: 'Public Service Honors',
            },
            {
              icon: HeartHandshake,
              title: 'Social Organizations',
              desc: 'Mementos and certificates for community programs, charitable initiatives, and rotary recognition.',
              tag: 'Community Programs',
            },
            {
              icon: CalendarCheck,
              title: 'Event Management',
              desc: 'Branded recognition products for large-scale conferences, galas, industry summits, and festivals.',
              tag: 'Galas & Conventions',
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between shadow-lg"
              >
                <div>
                  <div
                    style={{
                      backgroundColor: `${theme.primary}18`,
                      color: theme.primary,
                    }}
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-inner"
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
                <div
                  style={{ color: theme.primary }}
                  className="mt-6 pt-3 border-t border-slate-800 text-[11px] font-bold uppercase tracking-wider"
                >
                  {item.tag}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 21st.dev Bento Grid: Bespoke Signature Honors */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div
            style={{ color: theme.primary }}
            className="text-xs font-mono font-bold uppercase tracking-widest mb-2 flex items-center justify-center gap-1.5"
          >
            <Crown className="w-3.5 h-3.5" /> 21st-Century Craftsmanship
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-heading-cinzel">
            Bespoke Signature <span style={{ color: theme.primary }}>Creations</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
            Every trophy engineered with architectural precision — optical K9 crystal prisms, electroplated 24K gold letterforms, precision die-cut acrylics, and cold-cast bronze.
          </p>
        </div>

        <BentoGrid>
          {/* Card 1: Star Pillar Crystal (Spans 2 columns on lg) */}
          <BentoCard
            title="Star Pillar Crystal Excellence Award Trio"
            subtitle="Optical K9 Crystal • 3D Frosted Star Summits"
            description="Monumental triple crystal pillars celebrating milestone tenure and premier honors like SXSW. Flawless light-refracting beveled edges with high-precision frosted etching."
            badge="Bestseller Milestone"
            icon={Gem}
            image="/uploads/star-pillar-crystal-award.png"
            className="lg:col-span-2"
            actionText="View Crystal Trio Details"
            actionHref="/product/star-pillar-crystal-excellence-award-trio"
          />

          {/* Card 2: Imperial Monogram 3D Golden 'R' */}
          <BentoCard
            title="Imperial Monogram 3D Golden 'R' Plinth"
            subtitle="24K Mirror Gold Finish • Midnight Pedestal"
            description="Faceted monumental monogram cast in heavy alloy with mirror-polished 24K gold finish on a hand-beveled plinth with gold-filled typography."
            badge="Monogram Executive"
            icon={Crown}
            image="/uploads/golden-letter-r-monogram-trophy.png"
            actionText="View Monogram Plinth"
            actionHref="/product/imperial-monogram-3d-golden-r-plinth-trophy"
          />

          {/* Card 3: Custom Submarine Acrylic */}
          <BentoCard
            title="Custom Die-Cut Submarine Acrylic Award"
            subtitle="Precision Silhouette • UV Direct Print"
            description="Bespoke laser-cut profile with reverse-cured high-density UV coloration and dual gold standoffs. Engineered for technical and corporate milestones."
            badge="Bespoke Silhouette"
            icon={Shield}
            image="/uploads/custom-submarine-acrylic-award.png"
            actionText="View Acrylic Award"
            actionHref="/product/custom-die-cut-submarine-acrylic-award"
          />

          {/* Card 4: Centric Deal-Toy Metal Letter Plaque */}
          <BentoCard
            title="Centric Deal-Toy Dimensional Metal Plaque"
            subtitle="3D Machined Metal Letters • Shadowbox"
            description="High-profile corporate deal-toy featuring individual 3D metallic bronze and gold block letters set inside an archival glass frame with transaction metrics."
            badge="Corporate Deal-Toy"
            icon={Trophy}
            image="/uploads/centric-deal-toy-metal-letter-plaque.jpg"
            actionText="View Deal-Toy Plaque"
            actionHref="/product/centric-deal-toy-metal-letter-plaque"
          />

          {/* Card 5: Graduation Open Book & Mortarboard */}
          <BentoCard
            title="Graduation Honor Open Book & Mortarboard Plaque"
            subtitle="Cold-Cast Bronze • Gold Gilded Page Rims"
            description="Sculpted open book with gilded gold page rims, miniature 3D brass mortarboard tassel, and laser-engraved gold dedication plate set on rosewood."
            badge="Valedictorian Edition"
            icon={Award}
            image="/uploads/graduation-open-book-mortarboard-plaque.jpg"
            actionText="View Academia Plaque"
            actionHref="/product/graduation-honor-open-book-mortarboard-plaque"
          />
        </BentoGrid>
      </section>

      {/* 11 Premier Trophy Categories (Benson Trophy, Talisman India & Trophy India Standard) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <div
              style={{ color: theme.primary }}
              className="text-xs font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1.5"
            >
              <Crown className="w-3.5 h-3.5" /> Full Manufacturing Spectrum
            </div>
            <h2 className="text-3xl font-bold text-white font-serif-luxury">
              Browse by Award Category
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              From optical crystal prisms and carved natural timber to sports cups and bespoke acrylic silhouettes
            </p>
          </div>
          <Link
            to="/catalog"
            style={{ color: theme.primary }}
            className="mt-3 md:mt-0 text-xs font-bold hover:underline inline-flex items-center gap-1 uppercase tracking-wider"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3.5">
          {data.categories?.map((cat) => (
            <Link
              key={cat.id}
              to={`/catalog?category=${cat.slug}`}
              className="group p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between shadow-sm hover:shadow-lg hover:shadow-amber-500/10 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  style={{ backgroundColor: `${theme.primary}18`, color: theme.primary }}
                  className="w-9 h-9 rounded-xl flex items-center justify-center border border-amber-500/20 group-hover:scale-110 transition-transform"
                >
                  <Trophy className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono text-slate-500 group-hover:text-amber-300 transition-colors">
                  {cat.products_count} awards
                </span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors font-serif-luxury leading-snug">
                  {cat.name}
                </h4>
                <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products with 3D Tilt Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <div
              style={{ color: theme.primary }}
              className="text-xs font-bold uppercase tracking-widest mb-2"
            >
              Curated Masterpieces
            </div>
            <h2 className="text-3xl font-bold text-white font-serif-luxury">
              Signature 3D Awards & Trophies
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Hover to tilt in 3D perspective with real-time lighting physics
            </p>
          </div>
          <Link
            to="/catalog"
            style={{ color: theme.primary }}
            className="mt-4 md:mt-0 text-xs font-bold hover:underline inline-flex items-center gap-1 uppercase tracking-wider"
          >
            <span>Explore Complete Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="h-96 bg-slate-900 rounded-2xl" />
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

      {/* Interactive Engraving Studio */}
      <section id="engraving-studio" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5 space-y-4">
              <div
                style={{
                  backgroundColor: theme.bgTint,
                  borderColor: theme.borderGlow,
                  color: theme.primary,
                }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Live Customizer Studio</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-white font-serif-luxury">
                Complimentary Precision <br />
                <span style={{ color: theme.primary }}>Laser Engraving Studio</span>
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Test your award text in real time across Polished Gold, Brushed Silver, and Midnight Black plates with classic typography.
              </p>

              <div className="pt-2 space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Permanent fiber laser etching on metal plates</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Zero setup fees or hidden character limits</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Anti-tarnish, corrosion-resistant lifetime warranty</span>
                </div>
              </div>

              <div className="pt-4">
                <Link to="/catalog">
                  <MagneticButton
                    style={{
                      backgroundColor: theme.primary,
                      color: '#020617',
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-lg cursor-pointer"
                  >
                    <span>Choose a Trophy to Personalize</span>
                    <ArrowRight className="w-4 h-4" />
                  </MagneticButton>
                </Link>
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

      {/* Verified Corporate & Institutional Client Reviews */}
      <ReviewSection />

      {/* Why Choose Shreeji Corporates (Brochure Page 9) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/90 border border-slate-800">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div
              style={{ color: theme.primary }}
              className="text-xs font-bold uppercase tracking-widest mb-1"
            >
              Four Pillars of Excellence
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-serif-luxury">
              Why Choose Shreeji Corporates?
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                num: '01',
                title: 'Quality',
                desc: 'Premium optical crystal, hand-selected timbers, and solid brass castings.',
              },
              {
                num: '02',
                title: 'Customization',
                desc: 'Design, laser engraving, and branding tailored exactly to your vision.',
              },
              {
                num: '03',
                title: 'Timely Delivery',
                desc: 'Reliable production schedules you can count on for high-stakes banquets.',
              },
              {
                num: '04',
                title: 'Competitive Pricing',
                desc: 'Value-driven direct workshop rates without compromising finishing quality.',
              },
            ].map(p => (
              <div
                key={p.num}
                className="p-6 rounded-2xl bg-slate-950 border border-slate-800/80 text-center"
              >
                <div
                  style={{
                    backgroundColor: `${theme.primary}18`,
                    color: theme.primary,
                  }}
                  className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-mono font-bold text-sm"
                >
                  {p.num}
                </div>
                <h4 className="text-sm font-bold text-white mb-1">{p.title}</h4>
                <p className="text-xs text-slate-400">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values (Brochure Page 8) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div
            style={{ color: theme.primary }}
            className="text-xs font-bold uppercase tracking-widest mb-2"
          >
            The Shreeji Standard
          </div>
          <h2 className="text-3xl font-bold text-white font-serif-luxury">
            Our Core Values
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { title: 'Integrity', desc: 'Honesty, transparency, and ethical practices at every step.' },
            { title: 'Quality', desc: 'Products meeting the highest standards of craftsmanship.' },
            { title: 'Customer Focus', desc: 'Striving to exceed client expectations on every order.' },
            { title: 'Reliability', desc: 'Honoring commitments with dependable, timely service.' },
            { title: 'Excellence', desc: 'Continuous innovation to achieve and sustain excellence.' },
          ].map((v, i) => (
            <div key={i} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
              <h4 className="text-sm font-bold text-white mb-1">{v.title}</h4>
              <p className="text-xs text-slate-400">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Global Quote Request Modal */}
      <RequestQuoteModal isOpen={isQuoteModalOpen} onClose={() => setIsQuoteModalOpen(false)} />
    </div>
  );
}
