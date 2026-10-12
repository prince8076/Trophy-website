import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Trophy,
  Crown,
  Sparkles,
  Truck,
  ArrowRight,
  X,
  ExternalLink,
  Shield,
  Layers,
} from 'lucide-react';
import { fetchProducts, fetchCategories } from '../../api';

/**
 * 21st.dev Command Palette (⌘K / Ctrl+K)
 * Fast spotlight search across trophies, categories, engraving tools, and order tracking.
 */
export default function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      fetchProducts().then(setProducts).catch(() => []);
      fetchCategories().then(setCategories).catch(() => []);
    }
  }, [isOpen]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = e => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose ? onClose(!isOpen) : null;
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredProducts = products
    .filter(
      p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.material?.toLowerCase().includes(query.toLowerCase()) ||
        p.category_name?.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 6);

  const handleSelect = url => {
    navigate(url);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          className="relative w-full max-w-2xl bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Search Input Bar */}
          <div className="flex items-center px-4 py-3.5 border-b border-slate-800 bg-slate-950/50">
            <Search className="w-5 h-5 text-amber-400 mr-3 flex-shrink-0" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search trophies, crystal awards, materials, or commands..."
              className="w-full bg-transparent text-sm sm:text-base text-slate-100 placeholder-slate-500 focus:outline-none"
            />
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Categories Pills */}
          <div className="px-4 py-2.5 bg-slate-950/30 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto text-[11px] font-semibold text-slate-400 scrollbar-none">
            <span className="text-slate-500 flex-shrink-0">Jump to:</span>
            <button
              onClick={() => handleSelect('/catalog?category=crystal-mementos')}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-amber-500/20 hover:text-amber-300 border border-slate-700/60 whitespace-nowrap"
            >
              💎 Optical Crystal
            </button>
            <button
              onClick={() => handleSelect('/catalog?category=acrylic-plaques')}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-amber-500/20 hover:text-amber-300 border border-slate-700/60 whitespace-nowrap"
            >
              🏆 Custom Acrylic
            </button>
            <button
              onClick={() => handleSelect('/catalog?category=wooden-trophies')}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-amber-500/20 hover:text-amber-300 border border-slate-700/60 whitespace-nowrap"
            >
              🪵 Teakwood Honors
            </button>
            <button
              onClick={() => handleSelect('/admin-panel')}
              className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 whitespace-nowrap"
            >
              ⚡ Admin Studio
            </button>
          </div>

          {/* Search Results List */}
          <div className="max-h-96 overflow-y-auto p-3 space-y-1">
            {filteredProducts.length > 0 ? (
              <div>
                <div className="px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                  Catalog Trophies ({filteredProducts.length})
                </div>
                {filteredProducts.map(p => (
                  <div
                    key={p.id}
                    onClick={() => handleSelect(`/product/${p.slug}`)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/80 cursor-pointer group transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden flex-shrink-0 p-1">
                        <img
                          src={p.image_url}
                          alt={p.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                          {p.name}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {p.category_name} • {p.material}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-xs font-bold text-amber-400 font-mono">
                        ₹{parseFloat(p.price).toLocaleString('en-IN')}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all ml-auto mt-0.5" />
                    </div>
                  </div>
                ))}
              </div>
            ) : query ? (
              <div className="text-center py-10 text-slate-500 text-xs">
                No trophies matching "<span className="text-amber-300">{query}</span>"
              </div>
            ) : (
              <div className="p-4 space-y-3">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  Quick Actions
                </div>
                <div
                  onClick={() => handleSelect('/catalog')}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800 cursor-pointer text-xs font-semibold text-slate-200"
                >
                  <span className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-400" /> Browse Entire 2026 Collection
                  </span>
                  <span className="text-[10px] text-slate-500">Go →</span>
                </div>
                <div
                  onClick={() => handleSelect('/admin-panel')}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800 cursor-pointer text-xs font-semibold text-amber-300"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" /> Open Admin Studio (Upload & Price Manager)
                  </span>
                  <span className="text-[10px] text-slate-500">Go →</span>
                </div>
                <div
                  onClick={() => handleSelect('/track')}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800 cursor-pointer text-xs font-semibold text-slate-200"
                >
                  <span className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-amber-400" /> Track Consignment & Order
                  </span>
                  <span className="text-[10px] text-slate-500">Go →</span>
                </div>
              </div>
            )}
          </div>

          {/* Footer Keybindings */}
          <div className="px-4 py-2 border-t border-slate-800 bg-slate-950/80 text-[11px] text-slate-500 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 border border-slate-700">ESC</kbd> to close
              </span>
              <span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 border border-slate-700">↵</kbd> to select
              </span>
            </div>
            <span className="text-amber-400 font-mono text-[10px]">Shreeji Studio Search</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

