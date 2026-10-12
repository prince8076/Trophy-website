import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Star, Sparkles, ArrowRight, Eye, ShieldCheck } from 'lucide-react';

export default function TrophyCard({ product }) {
  const cardRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Motion values for smooth 3D tilt
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 260, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 260, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['9deg', '-9deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-9deg', '9deg']);

  const handleMouseMove = e => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setMousePos({ x: mouseX, y: mouseY });

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <div className="perspective-[1000px] h-full">
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        whileHover={{ scale: 1.015 }}
        transition={{ type: 'spring', stiffness: 320, damping: 24 }}
        className="group relative bg-slate-900/80 rounded-2xl border border-slate-800/90 hover:border-amber-500/40 transition-colors duration-300 flex flex-col overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-amber-500/10 h-full backdrop-blur-md"
      >
        {/* 21st.dev Dynamic Radial Spotlight Border & Surface Glow */}
        <div
          className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
          style={{
            background: isHovered
              ? `radial-gradient(350px circle at ${mousePos.x}px ${mousePos.y}px, rgba(212, 175, 55, 0.14), transparent 70%)`
              : 'none',
          }}
        />

        {/* Image Container with uncropped presentation */}
        <div
          style={{ transform: 'translateZ(20px)' }}
          className="relative aspect-square overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-3.5 border-b border-slate-800/60"
        >
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-106 transition-transform duration-500 ease-out drop-shadow-xl"
            loading="lazy"
            onError={e => {
              e.currentTarget.src =
                'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?auto=format&fit=crop&w=600&q=80';
            }}
          />

          {/* RetroUI High-Contrast Badge */}
          {product.badge && (
            <div className="absolute top-3 left-3 bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-md shadow-md border border-amber-300/60 z-20">
              {product.badge}
            </div>
          )}

          {/* Free Engraving indicator */}
          <div className="absolute bottom-3 left-3 bg-slate-950/90 backdrop-blur-md border border-amber-500/30 text-amber-300 text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 z-20">
            <Sparkles className="w-3 h-3 text-amber-400" /> Free Laser Engraving
          </div>

          {/* 3D Depth Indicator Tag */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-slate-950/80 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded text-[9px] font-mono z-20">
            3D Tilt
          </div>
        </div>

        {/* Content Section */}
        <div
          style={{ transform: 'translateZ(30px)' }}
          className="p-5 flex-1 flex flex-col justify-between"
        >
          <div>
            {/* Category / Material & Rating */}
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-mono text-[11px] text-amber-400/90 uppercase tracking-wider truncate max-w-[65%]">
                {product.category_name || product.material}
              </span>
              <div className="flex items-center text-amber-400 font-bold gap-1 tabular-nums">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{Number(product.rating).toFixed(1)}</span>
                <span className="text-slate-500 text-[11px]">({product.reviews_count})</span>
              </div>
            </div>

            {/* Title with link */}
            <h3 className="font-bold text-slate-100 group-hover:text-amber-300 transition-colors line-clamp-1 text-sm sm:text-base font-serif-luxury">
              <Link to={`/product/${product.slug}`} className="hover:underline">
                {product.name}
              </Link>
            </h3>

            {/* Dimensions */}
            <p className="text-xs text-slate-500 mt-1 font-mono">Size:&nbsp;{product.dimensions}</p>
          </div>

          {/* Bespoke Quote & Action Button (No Rates per Client Specs) */}
          <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-extrabold text-amber-400 font-heading-cinzel tracking-wider uppercase">
                Bespoke Quote
              </span>
              <span className="text-[10px] text-slate-400">
                Bulk Tiered • Free Proof
              </span>
            </div>

            <Link
              to={`/product/${product.slug}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-black uppercase tracking-wide transition-all shadow-md shadow-amber-500/10 group-hover:translate-x-0.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              <span>Enquire</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

