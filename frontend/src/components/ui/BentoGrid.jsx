import React from 'react';
import { motion } from 'framer-motion';
import SpotlightCard from './SpotlightCard';

/**
 * 21st.dev Bento Grid & Bento Card Components
 * Asymmetrical high-signal craft grid for luxury product features, craftsmanship, and trust pillars.
 */
export function BentoGrid({ children, className = '' }) {
  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-7xl mx-auto ${className}`}
    >
      {children}
    </div>
  );
}

export function BentoCard({
  title,
  subtitle,
  description,
  badge,
  icon: Icon,
  image,
  className = '',
  actionText = 'Learn More',
  actionHref,
  children,
}) {
  return (
    <SpotlightCard
      className={`group flex flex-col justify-between overflow-hidden border border-slate-800/80 hover:border-amber-500/40 transition-all duration-500 ${className}`}
    >
      {/* Top Media / Graphic Container */}
      {image && (
        <div className="relative aspect-[16/10] -mx-6 -mt-6 mb-5 overflow-hidden bg-slate-950 border-b border-slate-800/60">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
        </div>
      )}

      {children}

      {/* Card Header & Content */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          {Icon && (
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Icon className="w-5 h-5" />
            </div>
          )}
          {badge && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-amber-500/15 text-amber-300 border border-amber-500/30">
              {badge}
            </span>
          )}
        </div>

        <div>
          {subtitle && (
            <span className="text-[11px] font-mono uppercase tracking-widest text-amber-400/90 block mb-1">
              {subtitle}
            </span>
          )}
          <h3 className="text-xl font-bold font-heading-cinzel text-white group-hover:text-amber-200 transition-colors">
            {title}
          </h3>
          <p className="text-slate-400 text-xs sm:text-sm mt-1.5 leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      {/* Action / Link if provided */}
      {actionHref && (
        <div className="mt-5 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs font-semibold text-amber-400 group-hover:text-amber-300">
          <span>{actionText}</span>
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </div>
      )}
    </SpotlightCard>
  );
}

