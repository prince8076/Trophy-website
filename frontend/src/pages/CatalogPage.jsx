import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, Trophy, X, AlertCircle, Sparkles } from 'lucide-react';
import TrophyCard from '../components/TrophyCard';
import HaikeiBackground from '../components/HaikeiBackground';
import { fetchProducts, fetchCategories } from '../api';
import { useTheme } from '../context/ThemeContext';

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { theme } = useTheme();

  const currentCategory = searchParams.get('category') || 'all';
  const currentSearch = searchParams.get('search') || '';
  const currentSort = searchParams.get('sort') || 'featured';

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(currentSearch);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchProducts({
      category: currentCategory,
      search: currentSearch,
      sort: currentSort,
    })
      .then(res => {
        setProducts(res);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch catalog:', err);
        setLoading(false);
      });
  }, [currentCategory, currentSearch, currentSort]);

  const updateParam = (key, value) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      nextParams.set(key, value);
    } else {
      nextParams.delete(key);
    }
    setSearchParams(nextParams);
  };

  const handleSearchSubmit = e => {
    e.preventDefault();
    updateParam('search', searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput('');
    updateParam('search', '');
  };

  return (
    <div className="relative min-h-screen py-10 overflow-hidden">
      {/* Background Haikei Organic Blobs */}
      <HaikeiBackground variant="blobs" className="opacity-70" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
        {/* Header */}
        <div className="border-b border-slate-800/80 pb-8">
          <div
            style={{
              backgroundColor: theme.bgTint,
              borderColor: theme.borderGlow,
              color: theme.primary,
            }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold mb-3 shadow-sm"
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Shreeji Corporates Master Portfolio</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white font-serif-luxury">
            Awards & Trophy Collections
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-2xl">
            Browse our hand-polished crystal, spun nickel cups, and laser-carved timber plaques. Includes complimentary personalized laser etching.
          </p>
        </div>

        {/* Filter and Search Bar */}
        <div className="space-y-4">
          {/* Category Pills with Layout Transition */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => updateParam('category', 'all')}
              style={{
                backgroundColor: currentCategory === 'all' ? theme.primary : 'rgba(15, 23, 42, 0.8)',
                color: currentCategory === 'all' ? '#020617' : '#cbd5e1',
                borderColor: currentCategory === 'all' ? theme.primary : 'rgba(51, 65, 85, 0.8)',
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shadow-sm cursor-pointer"
            >
              All Collections
            </button>
            {categories.map(cat => {
              const isActive = currentCategory === cat.slug;
              return (
                <button
                  key={cat.id}
                  onClick={() => updateParam('category', cat.slug)}
                  style={{
                    backgroundColor: isActive ? theme.primary : 'rgba(15, 23, 42, 0.8)',
                    color: isActive ? '#020617' : '#cbd5e1',
                    borderColor: isActive ? theme.primary : 'rgba(51, 65, 85, 0.8)',
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shadow-sm cursor-pointer"
                >
                  {cat.name}
                </button>
              );
            })}
          </div>

          {/* Search & Sort Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
            {/* Search Form */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search by trophy title, material, or keyword..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              {searchInput && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>

            {/* Sort By Dropdown */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <SlidersHorizontal className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-400 font-semibold">Sort By:</span>
              <select
                value={currentSort}
                onChange={e => updateParam('sort', e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="featured">Featured & Best Sellers</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest Arrivals</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {(currentCategory !== 'all' || currentSearch) && (
          <div className="flex items-center gap-2 flex-wrap text-xs text-slate-400 bg-slate-900/80 border border-slate-800 px-4 py-2.5 rounded-xl">
            <span className="font-semibold text-slate-300">Active Filters:</span>
            {currentCategory !== 'all' && (
              <span
                style={{
                  backgroundColor: `${theme.primary}18`,
                  color: theme.primary,
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-bold"
              >
                Category: {categories.find(c => c.slug === currentCategory)?.name || currentCategory}
                <button onClick={() => updateParam('category', 'all')} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {currentSearch && (
              <span
                style={{
                  backgroundColor: `${theme.primary}18`,
                  color: theme.primary,
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-bold"
              >
                Search: "{currentSearch}"
                <button onClick={handleClearSearch} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Products Grid with Framer Motion AnimatePresence */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
              <div key={n} className="h-96 bg-slate-900/80 rounded-2xl border border-slate-800" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="space-y-4">
            <div className="text-xs text-slate-400 font-medium">
              Showing <span className="text-white font-bold">{products.length}</span> trophies & awards
            </div>
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              <AnimatePresence>
                {products.map(product => (
                  <motion.div
                    layout
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                  >
                    <TrophyCard product={product} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-900/60 rounded-3xl border border-slate-800">
            <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">No Trophies Found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-6">
              We couldn't find any awards matching your current search or category filter. Try clearing filters to see all available designs.
            </p>
            <button
              onClick={() => {
                setSearchInput('');
                setSearchParams({});
              }}
              style={{
                backgroundColor: theme.primary,
                color: '#020617',
              }}
              className="px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
