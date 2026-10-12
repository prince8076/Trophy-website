import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

export default function HaikeiBackground({ variant = 'waves', className = '' }) {
  const { theme } = useTheme();

  if (variant === 'blobs') {
    return (
      <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
        {/* Animated Haikei Organic Golden Mist Blobs */}
        <motion.div
          animate={{
            scale: [1, 1.15, 0.95, 1],
            x: [0, 35, -25, 0],
            y: [0, -25, 15, 0],
            rotate: [0, 90, 180, 360],
          }}
          transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            background: `radial-gradient(circle, ${theme.primary}25 0%, ${theme.primaryDark}08 50%, transparent 75%)`,
          }}
          className="absolute -top-32 -left-32 w-[650px] h-[650px] rounded-full blur-[120px]"
        />

        <motion.div
          animate={{
            scale: [1, 1.2, 0.9, 1],
            x: [0, -40, 35, 0],
            y: [0, 35, -25, 0],
            rotate: [360, 240, 120, 0],
          }}
          transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            background: `radial-gradient(circle, ${theme.accent}20 0%, ${theme.primaryDark}05 60%, transparent 80%)`,
          }}
          className="absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full blur-[130px]"
        />

        <motion.div
          animate={{
            scale: [0.95, 1.15, 1, 0.95],
            x: [0, 25, -15, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            background: `radial-gradient(circle, ${theme.primaryLight}18 0%, transparent 70%)`,
          }}
          className="absolute bottom-10 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px]"
        />
      </div>
    );
  }

  // Default: Layered Haikei Organic Fluid Golden Wave Vectors on Deep Obsidian Black
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none select-none ${className}`}>
      {/* Background ambient lighting */}
      <div
        style={{
          background: `radial-gradient(ellipse 70% 50% at 50% -15%, ${theme.primary}28, transparent)`,
        }}
        className="absolute inset-0"
      />

      {/* Layer 1: Animated Haikei Gold Wave */}
      <svg
        className="absolute top-0 left-0 w-full h-[620px] opacity-25"
        viewBox="0 0 1440 620"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <motion.path
          animate={{
            d: [
              'M0,160 C320,300 420,0 720,120 C1020,240 1120,40 1440,160 L1440,0 L0,0 Z',
              'M0,120 C280,60 520,220 800,100 C1080,0 1260,200 1440,120 L1440,0 L0,0 Z',
              'M0,160 C320,300 420,0 720,120 C1020,240 1120,40 1440,160 L1440,0 L0,0 Z',
            ],
          }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          fill={`url(#haikei-gold-1-${theme.id})`}
        />
        <defs>
          <linearGradient id={`haikei-gold-1-${theme.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={theme.primary} stopOpacity="0.45" />
            <stop offset="50%" stopColor={theme.primaryDark} stopOpacity="0.18" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* Layer 2: Counter Wave with Accent Gold Sheen */}
      <svg
        className="absolute top-16 left-0 w-full h-[660px] opacity-20"
        viewBox="0 0 1440 660"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <motion.path
          animate={{
            d: [
              'M0,220 C220,140 480,320 720,200 C960,80 1200,260 1440,200 L1440,0 L0,0 Z',
              'M0,180 C360,280 600,120 840,240 C1080,360 1320,140 1440,180 L1440,0 L0,0 Z',
              'M0,220 C220,140 480,320 720,200 C960,80 1200,260 1440,200 L1440,0 L0,0 Z',
            ],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          fill={`url(#haikei-gold-2-${theme.id})`}
        />
        <defs>
          <linearGradient id={`haikei-gold-2-${theme.id}`} x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={theme.accent} stopOpacity="0.4" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* Subtle Golden Particle Grid */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.05]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <pattern id="haikei-grid" width="50" height="50" patternUnits="userSpaceOnUse">
          <circle cx="25" cy="25" r="1" fill={theme.primary} />
        </pattern>
        <rect width="100%" height="100%" fill="url(#haikei-grid)" />
      </svg>
    </div>
  );
}
