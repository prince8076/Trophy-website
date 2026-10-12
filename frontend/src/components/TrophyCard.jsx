import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Star, Sparkles, ArrowRight, Eye } from 'lucide-react';

export default function TrophyCard({ product }) {
  const cardRef = useRef(null);

  // Motion values for 3D tilt
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 260, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 260, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['12deg', '-12deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-12deg', '12deg']);
  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], ['0%', '100%']);
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], ['0%', '100%']);

  const handleMouseMove = e => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div className="perspective-[1000px] h-full">
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="group relative bg-slate-900/80 rounded-2xl border border-slate-800/90 hover:border-amber-500/50 transition-colors duration-300 flex flex-col overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-amber-500/10 h-full backdrop-blur-md"
      >
        {/* Specular Glare overlay */}
        <motion.div
          style={{
            background: `radial-gradient(circle at ${glareX} ${glareY}, rgba(251, 191, 36, 0.15) 0%, transparent 60%)`,
            transform: 'translateZ(40px)',
          }}
          className="absolute inset-0 pointer-events-none z-20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        />

        {/* Image Container */}
        <div
          style={{ transform: 'translateZ(20px)' }}
          className="relative aspect-square overflow-hidden bg-slate-950"
        >
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500 ease-out"
            loading="lazy"
          />

          {/* Badge */}
          {product.badge && (
            <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full shadow-lg z-10">
              {product.badge}
            </div>
          )}

          {/* Free Engraving indicator */}
          <div className="absolute bottom-3 left-3 bg-slate-950/85 backdrop-blur-md border border-slate-700/60 text-amber-300 text-[10px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1 z-10">
            <Sparkles className="w-3 h-3 text-amber-400" /> Free Laser Engraving
          </div>

          {/* 3D Depth Indicator Tag */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded text-[9px] font-mono z-10">
            3D Tilt
          </div>
        </div>

        {/* Content */}
        <div
          style={{ transform: 'translateZ(30px)' }}
          className="p-5 flex-1 flex flex-col justify-between"
        >
          <div>
            {/* Material & Rating */}
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-medium text-slate-400 truncate max-w-[60%]">
                {product.material}
              </span>
              <div className="flex items-center text-amber-400 font-semibold gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{Number(product.rating).toFixed(1)}</span>
                <span className="text-slate-500 text-[11px]">({product.reviews_count})</span>
              </div>
            </div>

            {/* Title */}
            <h3 className="font-bold text-slate-100 group-hover:text-amber-400 transition-colors line-clamp-1 text-sm sm:text-base font-serif-luxury">
              <Link to={`/product/${product.slug}`}>{product.name}</Link>
            </h3>

            {/* Dimensions */}
            <p className="text-xs text-slate-500 mt-1">Size: {product.dimensions}</p>
          </div>

          {/* Price & Action Button */}
          <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg sm:text-xl font-bold text-white">
                  ₹{Number(product.price).toLocaleString()}
                </span>
                {product.original_price && (
                  <span className="text-xs text-slate-500 line-through">
                    ₹{Number(product.original_price).toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            <Link
              to={`/product/${product.slug}`}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-amber-500/10 group-hover:translate-x-0.5 cursor-pointer"
            >
              <span>Engrave</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
