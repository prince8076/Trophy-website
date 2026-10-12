import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Trophy,
  ShoppingBag,
  Search,
  Menu,
  X,
  Truck,
  ExternalLink,
  Crown,
  Phone,
  Sparkles,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import RealtimeColorPicker from './motion/RealtimeColorPicker';
import CommandPalette from './ui/CommandPalette';

export default function Navbar() {
  const { cartCount } = useCart();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchSubmit = e => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/catalog', label: 'All Awards' },
    { to: '/catalog?category=crystal-mementos', label: 'Crystal' },
    { to: '/catalog?category=wooden-trophies', label: 'Artisan Wood' },
    { to: '/track', label: 'Track Order', icon: Truck },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 transition-colors">
      {/* Top announcement & quick contact bar */}
      <div
        style={{
          background: `linear-gradient(90deg, ${theme.primaryDark}, ${theme.primary}, ${theme.primaryDark})`,
        }}
        className="py-1.5 px-4 text-slate-950 text-xs font-semibold shadow-inner"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 truncate">
            <Crown className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="tracking-wide text-[11px] sm:text-xs">
              SHREEJI CORPORATES — 20+ YEARS TRUST & CRAFTSMANSHIP • FREE PRECISION ENGRAVING
            </span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-[11px] font-bold">
            <a
              href="tel:+919266944393"
              className="hover:underline flex items-center gap-1 text-slate-950"
            >
              <Phone className="w-3 h-3" /> +91 92669 44393 / 87969 77707
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo with Shreeji royal motif */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div
              style={{
                background: `linear-gradient(135deg, ${theme.primaryLight}, ${theme.primary}, ${theme.primaryDark})`,
                boxShadow: `0 10px 25px -5px ${theme.primary}40`,
              }}
              className="relative w-11 h-11 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform"
            >
              <span className="font-heading-cinzel font-black text-2xl text-slate-950">S</span>
              <div className="absolute -top-1.5 -right-1.5 bg-slate-950 text-amber-400 p-0.5 rounded-full border border-amber-500/40">
                <Crown className="w-3 h-3" />
              </div>
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-wider font-heading-cinzel text-white flex items-center">
                SHREEJI<span style={{ color: theme.primary }} className="ml-1.5">CORPORATES</span>
              </span>
              <span className="block text-[10px] tracking-widest text-slate-400 uppercase -mt-0.5">
                Trophies • Mementos • Corporate Gifts
              </span>
            </div>
          </Link>

          {/* Quick Search Button triggering 21st.dev Command Palette */}
          <button
            type="button"
            onClick={() => setCommandOpen(true)}
            className="hidden md:flex items-center justify-between w-56 lg:w-68 bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 rounded-full px-3.5 py-2 text-xs text-slate-400 hover:text-slate-200 transition-all cursor-pointer shadow-sm group"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
              <span>Search awards...</span>
            </div>
            <kbd className="px-1.5 py-0.5 rounded text-[10px] bg-slate-950 text-amber-400/80 border border-slate-800 font-mono">
              ⌘K
            </kbd>
          </button>

          {/* Desktop Nav Links with Motion Pill */}
          <nav className="hidden lg:flex items-center space-x-1 text-xs font-semibold uppercase tracking-wider">
            {navLinks.map(link => {
              const isActive = location.pathname === link.to;
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className="relative px-3 py-2 rounded-xl text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
                >
                  {Icon && <Icon className="w-3.5 h-3.5" style={{ color: theme.primary }} />}
                  <span>{link.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="nav-active-pill"
                      style={{
                        backgroundColor: `${theme.primary}18`,
                        borderColor: `${theme.primary}40`,
                      }}
                      className="absolute inset-0 rounded-xl border -z-10"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Actions: Realtime Color Studio, Django Admin, Cart */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Realtime Color Accent Selector */}
            <RealtimeColorPicker />

            {/* Admin Panel Direct Studio Shortcut */}
            <Link
              to="/admin-panel"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-xs font-bold text-amber-300 transition-colors shadow-sm"
              title="Open Trophy Admin Studio"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Admin Panel</span>
            </Link>

            {/* Cart Button */}
            <Link
              to="/cart"
              style={{
                borderColor: cartCount > 0 ? `${theme.primary}50` : undefined,
              }}
              className="relative p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 transition-all flex items-center justify-center cursor-pointer"
              aria-label="View Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{ backgroundColor: theme.primary }}
                  className="absolute -top-1.5 -right-1.5 text-slate-950 font-black text-[11px] w-5 h-5 rounded-full flex items-center justify-center shadow-md"
                >
                  {cartCount}
                </motion.span>
              )}
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-800 space-y-4 animate-in fade-in">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search trophies & mementos..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-200"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            </form>

            <div className="flex flex-col space-y-2 text-sm font-medium">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-900 text-slate-200"
              >
                Home
              </Link>
              <Link
                to="/catalog"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-900 text-slate-200"
              >
                All Awards Portfolio
              </Link>
              <Link
                to="/catalog?category=corporate-leadership"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-900 text-slate-200"
              >
                Corporate & Leadership
              </Link>
              <Link
                to="/catalog?category=crystal-mementos"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-900 text-slate-200"
              >
                Crystal & Glass Mementos
              </Link>
              <Link
                to="/catalog?category=wooden-trophies"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-900 text-slate-200"
              >
                Artistic Wooden Trophies
              </Link>
              <Link
                to="/track"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-900 text-slate-200 flex items-center gap-2"
              >
                <Truck className="w-4 h-4" style={{ color: theme.primary }} /> Track My Order
              </Link>
              <Link
                to="/admin-panel"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-400" /> Admin Studio (Trophies & Orders)
              </Link>
              <div className="p-3 bg-slate-900 rounded-xl text-xs space-y-1 text-slate-400">
                <div style={{ color: theme.primary }} className="font-bold">
                  Shreeji Corporates Helpline:
                </div>
                <div>+91 92669 44393 / +91 87969 77707</div>
                <div>shreejicorporates@gmail.com</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 21st.dev Command Palette Modal */}
      <CommandPalette isOpen={commandOpen} onClose={() => setCommandOpen(false)} />
    </header>
  );
}
