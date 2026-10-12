import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Star,
  CheckCircle2,
  ShieldCheck,
  Truck,
  Sparkles,
  ShoppingBag,
  ArrowLeft,
  Package,
  Layers,
  Check,
  Award,
} from 'lucide-react';
import Trophy3DViewer from '../components/Trophy3DViewer';
import EngravingCustomizer from '../components/EngravingCustomizer';
import HaikeiBackground from '../components/HaikeiBackground';
import MagneticButton from '../components/motion/MagneticButton';
import SpotlightCard from '../components/ui/SpotlightCard';
import ShimmerButton from '../components/ui/ShimmerButton';
import { fetchProductBySlug } from '../api';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { theme } = useTheme();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [viewMode, setViewMode] = useState('3d'); // '3d' or 'photo'
  const [quantity, setQuantity] = useState(1);
  const [addedToast, setAddedToast] = useState(false);
  const [activeTab, setActiveTab] = useState('specs'); // 'specs', 'craftsmanship', 'shipping'

  const [customization, setCustomization] = useState({
    engraving_line1: '',
    engraving_line2: '',
    engraving_line3: '',
    engraving_font: 'Classic Serif',
    plate_color: 'Gold',
  });

  useEffect(() => {
    setLoading(true);
    fetchProductBySlug(slug)
      .then(data => {
        setProduct(data);
        setSelectedImage(data.image_url);
        // Pre-populate line 1 as an inspiration
        setCustomization(prev => ({
          ...prev,
          engraving_line1: 'CHAMPIONSHIP WINNER',
        }));
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load product:', err);
        setLoading(false);
      });
  }, [slug]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, customization, quantity);
    setAddedToast(true);
    setTimeout(() => {
      setAddedToast(false);
    }, 3500);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 animate-pulse space-y-8">
        <div className="h-6 w-48 bg-slate-800 rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-square bg-slate-900 rounded-3xl" />
          <div className="space-y-6">
            <div className="h-10 bg-slate-800 rounded w-3/4" />
            <div className="h-6 bg-slate-850 rounded w-1/4" />
            <div className="h-32 bg-slate-900 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-white font-serif-luxury">Award Not Found</h2>
        <p className="text-slate-400 text-sm mt-2 mb-6">
          The requested trophy may have been retired or moved.
        </p>
        <Link
          to="/catalog"
          style={{ backgroundColor: theme.primary }}
          className="px-6 py-3 rounded-xl text-slate-950 font-bold text-sm shadow-md"
        >
          Return to Trophy Catalog
        </Link>
      </div>
    );
  }

  const allImages = [product.image_url, ...(product.secondary_images || [])];

  return (
    <div className="relative min-h-screen py-10 overflow-hidden">
      <HaikeiBackground variant="blobs" className="opacity-60" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-xs text-slate-400">
          <Link to="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link to="/catalog" className="hover:text-white transition-colors">
            Catalog
          </Link>
          <span>/</span>
          <Link
            to={`/catalog?category=${product.category_slug}`}
            style={{ color: theme.primary }}
            className="font-semibold hover:underline"
          >
            {product.category_name}
          </Link>
          <span>/</span>
          <span className="text-slate-200 truncate max-w-xs">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Image Gallery or 3D Stage */}
          <div className="lg:col-span-6 space-y-4 lg:sticky lg:top-28">
            {/* View Mode Toggle */}
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Visual Presentation
              </span>
              <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setViewMode('3d')}
                  style={{
                    backgroundColor: viewMode === '3d' ? theme.primary : 'transparent',
                    color: viewMode === '3d' ? '#020617' : '#94a3b8',
                  }}
                  className="px-3 py-1 rounded-lg font-bold transition-all cursor-pointer"
                >
                  ✨ 3D Motion Stage
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('photo')}
                  style={{
                    backgroundColor: viewMode === 'photo' ? theme.primary : 'transparent',
                    color: viewMode === 'photo' ? '#020617' : '#94a3b8',
                  }}
                  className="px-3 py-1 rounded-lg font-bold transition-all cursor-pointer"
                >
                  Photo Gallery
                </button>
              </div>
            </div>

            {viewMode === '3d' ? (
              <Trophy3DViewer
                imageUrl={selectedImage}
                title={product.name}
                material={product.material}
                engravingText={customization.engraving_line1}
                plateColor={customization.plate_color}
              />
            ) : (
              <>
                {/* Main Visual with uncropped luxury presentation */}
                <div className="relative aspect-square rounded-3xl overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-slate-800 shadow-2xl flex items-center justify-center p-6">
                  <img
                    src={selectedImage}
                    alt={product.name}
                    className="w-full h-full object-contain drop-shadow-2xl"
                  />
                  {product.badge && (
                    <div
                      style={{
                        backgroundColor: theme.primary,
                        color: '#020617',
                      }}
                      className="absolute top-4 left-4 font-black text-xs uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-lg"
                    >
                      {product.badge}
                    </div>
                  )}
                </div>

                {/* Thumbnail Strip */}
                {allImages.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {allImages.map((imgUrl, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(imgUrl)}
                        className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all p-1 bg-slate-950 cursor-pointer ${
                          selectedImage === imgUrl
                            ? 'border-amber-400 scale-95 shadow-md'
                            : 'border-slate-800 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={imgUrl} alt="" className="w-full h-full object-contain" />
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Specs Highlights with 21st.dev SpotlightCard */}
            <SpotlightCard className="p-6 rounded-2xl grid grid-cols-3 gap-4 text-center">
              <div>
                <span className="block text-[11px] uppercase tracking-wider text-slate-400 font-mono">
                  Material
                </span>
                <span className="text-xs font-bold text-white mt-1 block">
                  {product.material}
                </span>
              </div>
              <div className="border-x border-slate-800">
                <span className="block text-[11px] uppercase tracking-wider text-slate-400">
                  Dimensions
                </span>
                <span className="text-xs font-bold text-white mt-1 block">
                  {product.dimensions}
                </span>
              </div>
              <div>
                <span className="block text-[11px] uppercase tracking-wider text-slate-400">
                  Net Weight
                </span>
                <span className="text-xs font-bold text-white mt-1 block">
                  {product.weight}
                </span>
              </div>
            </SpotlightCard>
          </div>

          {/* Right Column: Pricing, Engraving Customizer & Add To Cart */}
          <div className="lg:col-span-6 space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span
                  style={{ color: theme.primary }}
                  className="text-xs font-bold uppercase tracking-widest font-mono"
                >
                  {product.category_name}
                </span>
                <span className="text-slate-600">•</span>
                <div className="flex items-center text-amber-400 text-xs font-bold gap-1 tabular-nums">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{Number(product.rating).toFixed(1)}</span>
                  <span className="text-slate-500 font-normal">
                    ({product.reviews_count} reviews)
                  </span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-white font-heading-cinzel">
                {product.name}
              </h1>

              {/* Price section in INR (₹) with tabular-nums */}
              <div className="mt-4 flex items-baseline gap-3 tabular-nums">
                <span className="text-3xl sm:text-4xl font-black text-amber-400 font-heading-cinzel">
                  ₹&nbsp;{Number(product.price).toLocaleString('en-IN')}
                </span>
                {product.original_price && (
                  <span className="text-sm text-slate-500 line-through">
                    ₹&nbsp;{Number(product.original_price).toLocaleString('en-IN')}
                  </span>
                )}
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-800/40 px-2.5 py-0.5 rounded-full">
                  Workshop Ready • Free Laser Engraving
                </span>
              </div>

              <p className="mt-4 text-sm text-slate-300 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Interactive Engraving Studio Section */}
            <div className="pt-2">
              <EngravingCustomizer
                maxLines={product.max_engraving_lines || 3}
                maxChars={product.max_chars_per_line || 35}
                customization={customization}
                onChange={setCustomization}
              />
            </div>

            {/* Order Actions */}
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Award Quantity
                </span>
                <div className="flex items-center border border-slate-700 rounded-xl overflow-hidden bg-slate-950 tabular-nums">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3.5 py-2 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 text-xs font-bold text-white min-w-[2.5rem] text-center">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3.5 py-2 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <ShimmerButton
                  onClick={handleAddToCart}
                  className="flex-1 py-1"
                >
                  <ShoppingBag className="w-4 h-4 text-slate-950 mr-1" />
                  <span className="tabular-nums">
                    Add to Bag (₹&nbsp;{(Number(product.price) * quantity).toLocaleString('en-IN')})
                  </span>
                </ShimmerButton>

                <button
                  type="button"
                  onClick={() => {
                    addToCart(product, customization, quantity);
                    navigate('/cart');
                  }}
                  className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider border border-slate-700 hover:border-amber-500/40 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-400"
                >
                  Instant Checkout
                </button>
              </div>

              {/* Toast feedback */}
              {addedToast && (
                <div className="flex items-center justify-between bg-emerald-950/90 border border-emerald-700/60 p-3 rounded-xl text-emerald-300 text-xs animate-in fade-in slide-in-from-top-2">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Check className="w-4 h-4 text-emerald-400" /> Added to your shopping bag with custom plate details!
                  </span>
                  <Link to="/cart" className="underline font-bold text-emerald-200">
                    View Bag
                  </Link>
                </div>
              )}
            </div>

            {/* Informational Tabs (Specs, Craftsmanship, Shipping) */}
            <div className="space-y-4 pt-2">
              <div className="flex border-b border-slate-800 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveTab('specs')}
                  className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer ${
                    activeTab === 'specs'
                      ? 'border-amber-400 text-white'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Craftsmanship & Specs
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('customization')}
                  className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer ${
                    activeTab === 'customization'
                      ? 'border-amber-400 text-white'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Laser Engraving Proof
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('dispatch')}
                  className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer ${
                    activeTab === 'dispatch'
                      ? 'border-amber-400 text-white'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Velvet Packaging & Dispatch
                </button>
              </div>

              <div className="text-xs text-slate-300 leading-relaxed bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                {activeTab === 'specs' && (
                  <ul className="space-y-1.5 list-disc list-inside text-slate-400">
                    <li>Manufactured by master craftsmen at Shreeji Corporates workshop in New Delhi.</li>
                    <li>Grade-A flawless optical crystal with diamond beveled refraction angles.</li>
                    <li>Solid piano-lacquered timber block with anti-scratch velvet footing.</li>
                  </ul>
                )}
                {activeTab === 'customization' && (
                  <p className="text-slate-400">
                    High precision computerized fiber laser engraving. Free setup for organization logos, custom crests, and individual recipient names. A digital layout proof can also be confirmed via WhatsApp/email.
                  </p>
                )}
                {activeTab === 'dispatch' && (
                  <p className="text-slate-400">
                    Each award arrives nested securely inside a custom satin/velvet-lined presentation gift case, insured and bubble-armored for zero-breakage delivery anywhere in India.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
