import React from 'react';
import { motion } from 'framer-motion';

/**
 * 21st.dev + RetroUI Shimmer Button
 * Features sweeping perimeter light beam, tactile active-press depth, and full keyboard accessibility.
 */
export default function ShimmerButton({
  children,
  onClick,
  className = '',
  shimmerColor = '#fde68a',
  shimmerDuration = '3s',
  borderRadius = '14px',
  background = 'linear-gradient(135deg, #d4af37, #f59e0b, #b45309)',
  disabled = false,
  type = 'button',
  ...props
}) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      style={{
        borderRadius,
      }}
      className={`group relative inline-flex items-center justify-center overflow-hidden p-[1.5px] font-bold text-slate-950 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${className}`}
      {...props}
    >
      {/* Animated Conic Shimmer Beam */}
      <span
        style={{
          animationDuration: shimmerDuration,
        }}
        className="absolute inset-[-100%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#0000_0%,#d4af37_50%,#fde68a_100%)] opacity-80 group-hover:opacity-100 transition-opacity"
      />

      {/* Button Body with Tactile Depth */}
      <span
        style={{
          background,
          borderRadius: `calc(${borderRadius} - 1.5px)`,
        }}
        className="relative z-10 flex h-full w-full items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-950 shadow-inner group-active:translate-y-[0.5px]"
      >
        {children}
      </span>
    </motion.button>
  );
}

