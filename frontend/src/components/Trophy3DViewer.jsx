import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Rotate3D, Sparkles, Eye, ShieldCheck, Flame, Layers } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Trophy3DViewer({
  imageUrl = "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?auto=format&fit=crop&w=1000&q=80",
  title = "Shreeji Sovereign Gold Star Flame",
  material = "24K Gold Electroplated Metal on Piano Wood",
  engravingText = "SHREEJI EXCELLENCE AWARD",
  plateColor = "Gold",
}) {
  const containerRef = useRef(null);
  const { theme } = useTheme();
  const [isAutoSpin, setIsAutoSpin] = useState(false);
  const [crystalTint, setCrystalTint] = useState('clear'); // 'clear', 'warm', 'sapphire', 'emerald'

  // Mouse tilt motion values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for fluid 3D tilt
  const springConfig = { damping: 20, stiffness: 180, mass: 0.5 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [16, -16]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-20, 20]), springConfig);
  const glareX = useTransform(mouseX, [-0.5, 0.5], ['0%', '100%']);
  const glareY = useTransform(mouseY, [-0.5, 0.5], ['0%', '100%']);

  const handleMouseMove = e => {
    if (!containerRef.current || isAutoSpin) return;
    const rect = containerRef.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(xPct);
    mouseY.set(yPct);
  };

  const handleMouseLeave = () => {
    if (!isAutoSpin) {
      mouseX.set(0);
      mouseY.set(0);
    }
  };

  const getTintOverlay = () => {
    switch (crystalTint) {
      case 'warm':
        return 'rgba(245, 158, 11, 0.15)';
      case 'sapphire':
        return 'rgba(56, 189, 248, 0.15)';
      case 'emerald':
        return 'rgba(16, 185, 129, 0.15)';
      default:
        return 'transparent';
    }
  };

  return (
    <div className="relative w-full max-w-lg mx-auto select-none">
      {/* 3D Stage Background Glow with Realtime Theme Tint */}
      <div
        style={{
          background: `radial-gradient(circle, ${theme.primary}25 0%, ${theme.primaryDark}08 50%, transparent 80%)`,
        }}
        className="absolute inset-0 rounded-3xl blur-2xl pointer-events-none transition-all duration-500"
      />

      {/* Main 3D Card Container */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative perspective-[1200px] cursor-grab active:cursor-grabbing"
      >
        <motion.div
          animate={
            isAutoSpin
              ? {
                  rotateY: [0, 360],
                  transition: { repeat: Infinity, duration: 12, ease: "linear" },
                }
              : {}
          }
          style={{
            rotateX: isAutoSpin ? 0 : rotateX,
            rotateY: isAutoSpin ? undefined : rotateY,
            transformStyle: "preserve-3d",
            borderColor: `${theme.primary}40`,
          }}
          className="relative rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border p-6 shadow-2xl backdrop-blur-xl overflow-hidden transition-all duration-300"
        >
          {/* 3D Specular Light Glare layer matching Realtime Theme */}
          <motion.div
            style={{
              background: `radial-gradient(circle at ${glareX} ${glareY}, ${theme.primaryLight}40 0%, rgba(255,255,255,0.08) 25%, transparent 70%)`,
              transform: "translateZ(60px)",
            }}
            className="absolute inset-0 pointer-events-none rounded-3xl z-30"
          />

          {/* Top Stage Badges */}
          <div
            style={{ transform: "translateZ(40px)" }}
            className="flex items-center justify-between mb-4 z-20 relative"
          >
            <div
              style={{
                backgroundColor: `${theme.primary}18`,
                borderColor: `${theme.primary}40`,
                color: theme.primary,
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold tracking-wider uppercase transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>3D Motion Runtime</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-400 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
                Interactive Tilt
              </span>
            </div>
          </div>

          {/* 3D Trophy Visual Layer */}
          <div
            style={{ transform: "translateZ(50px)" }}
            className="relative aspect-square rounded-2xl overflow-hidden bg-slate-950/90 border border-slate-800 shadow-inner flex items-center justify-center p-2"
          >
            {/* Ambient Base Light Ring with Realtime Theme Color */}
            <div
              style={{ backgroundColor: `${theme.primary}35` }}
              className="absolute bottom-4 w-4/5 h-8 rounded-full blur-xl pointer-events-none transition-colors duration-500"
            />

            {/* Simulated Crystal Color Tint Overlay */}
            <div
              style={{ backgroundColor: getTintOverlay() }}
              className="absolute inset-0 pointer-events-none z-10 transition-colors duration-300"
            />

            <motion.img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover rounded-xl transition-all duration-300"
              style={{ transform: "translateZ(30px)" }}
            />

            {/* Simulated 3D Engraved Plate on the Trophy Base */}
            <motion.div
              style={{ transform: "translateZ(80px)" }}
              className={`absolute bottom-4 left-6 right-6 p-2.5 rounded-lg border shadow-xl text-center backdrop-blur-md ${
                plateColor === 'Silver'
                  ? 'plate-silver border-slate-300'
                  : plateColor === 'Black'
                  ? 'plate-black border-amber-500'
                  : 'plate-gold border-amber-400'
              }`}
            >
              <div className="text-[11px] font-extrabold uppercase tracking-wider line-clamp-1">
                {engravingText || "SHREEJI CORPORATES"}
              </div>
              <div className="text-[9px] font-medium opacity-80 mt-0.5">
                Laser Etched • Lifetime Brilliance
              </div>
            </motion.div>
          </div>

          {/* 3D Depth Card Footer */}
          <div
            style={{ transform: "translateZ(45px)" }}
            className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between"
          >
            <div>
              <h4 className="text-sm font-bold text-white font-serif-luxury truncate max-w-[220px]">
                {title}
              </h4>
              <p style={{ color: theme.primary }} className="text-xs font-semibold mt-0.5">
                {material}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAutoSpin(!isAutoSpin)}
                style={{
                  backgroundColor: isAutoSpin ? theme.primary : 'rgba(15, 23, 42, 0.8)',
                  color: isAutoSpin ? '#020617' : '#cbd5e1',
                  borderColor: isAutoSpin ? theme.primary : 'rgba(51, 65, 85, 0.8)',
                }}
                className="p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                title="Toggle 360 Auto-Rotation"
              >
                <Rotate3D className="w-4 h-4" />
                <span className="text-[11px]">{isAutoSpin ? 'Stop Spin' : '360° Spin'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Realtime Crystal / Reflection Tint Selector */}
      <div className="mt-4 p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
        <span className="text-slate-400 flex items-center gap-1 text-[11px] font-semibold">
          <Layers className="w-3.5 h-3.5" style={{ color: theme.primary }} /> Realtime Reflection Tint:
        </span>
        <div className="flex gap-1.5">
          {[
            { id: 'clear', label: 'Clear Crystal' },
            { id: 'warm', label: 'Gold Amber' },
            { id: 'sapphire', label: 'Sapphire' },
            { id: 'emerald', label: 'Emerald' },
          ].map(tint => (
            <button
              key={tint.id}
              type="button"
              onClick={() => setCrystalTint(tint.id)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                crystalTint === tint.id
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200'
              }`}
            >
              {tint.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
