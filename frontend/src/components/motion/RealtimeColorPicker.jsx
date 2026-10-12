import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Check, Crown, X } from 'lucide-react';
import { useTheme, THEME_PALETTES } from '../../context/ThemeContext';

export default function RealtimeColorPicker() {
  const { currentTheme, setCurrentTheme, theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* Trigger Button with Golden Sheen */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold transition-all shadow-md backdrop-blur-md cursor-pointer border-amber-500/40 bg-black/80 text-amber-300"
        title="Select Luxury Gold Finish"
      >
        <span
          className="w-2.5 h-2.5 rounded-full shadow-sm animate-pulse"
          style={{ backgroundColor: theme.primary }}
        />
        <span className="hidden sm:inline font-sans-montserrat">{theme.name}</span>
        <Crown className="w-3.5 h-3.5 text-amber-400" />
      </motion.button>

      {/* Floating Gold Finish Selector */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-3 w-80 p-5 rounded-2xl bg-[#0c0c10] border border-amber-500/40 shadow-2xl shadow-black z-50 backdrop-blur-2xl space-y-3.5"
            >
              <div className="flex items-center justify-between pb-2.5 border-b border-amber-500/20">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-extrabold text-white uppercase tracking-wider font-heading-cinzel">
                    Black & Gold Metal Finishes
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-[11px] text-slate-300 leading-snug">
                Switch between master handcrafted gold and brass formulations. The entire stage updates immediately.
              </p>

              <div className="space-y-2.5">
                {Object.values(THEME_PALETTES).map(palette => {
                  const isActive = currentTheme === palette.id;
                  return (
                    <motion.button
                      key={palette.id}
                      type="button"
                      whileHover={{ x: 3 }}
                      onClick={() => {
                        setCurrentTheme(palette.id);
                        setIsOpen(false);
                      }}
                      className={`w-full p-3 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                        isActive
                          ? 'border-amber-400 bg-amber-500/15 shadow-md shadow-amber-500/10'
                          : 'border-slate-800/80 bg-black/60 hover:bg-slate-900 hover:border-amber-500/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-6 h-6 rounded-full border border-amber-400/40 shadow-inner flex items-center justify-center flex-shrink-0"
                          style={{
                            background: palette.plateGradient,
                          }}
                        >
                          {isActive && <Check className="w-3.5 h-3.5 text-slate-950 font-black" />}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white leading-tight font-sans-montserrat">
                            {palette.name}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{palette.label}</div>
                        </div>
                      </div>

                      <div
                        className="w-2.5 h-2.5 rounded-full opacity-90 shadow-sm"
                        style={{ backgroundColor: palette.primary }}
                      />
                    </motion.button>
                  );
                })}
              </div>

              <div className="pt-1 text-center border-t border-slate-800/80 text-[10px] text-amber-400/80 font-mono">
                Shreeji Corporates Bespoke Metallic Spec
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
