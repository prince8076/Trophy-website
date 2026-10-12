import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  Tag,
  CheckCircle,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import HaikeiBackground from '../components/HaikeiBackground';
import MagneticButton from '../components/motion/MagneticButton';

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, clearCart, cartTotal } = useCart();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoMessage, setPromoMessage] = useState('');

  const applyPromo = e => {
    e.preventDefault();
    const code = promoCode.trim().toUpperCase();
    if (code === 'VICTORY10' || code === 'SHREEJI10') {
      setDiscountPercent(0.10);
      setPromoMessage('10% Shreeji Corporates Discount Applied!');
    } else if (code === 'GOLD20') {
      setDiscountPercent(0.20);
      setPromoMessage('20% Executive Partner Discount Applied!');
    } else {
      setDiscountPercent(0);
      setPromoMessage('Invalid promo code. Try "SHREEJI10"');
    }
  };

  const discountAmount = cartTotal * discountPercent;
  const finalTotal = Math.max(0, cartTotal - discountAmount);

  if (cartItems.length === 0) {
    return (
      <div className="relative min-h-[70vh] flex items-center justify-center py-20 overflow-hidden">
        <HaikeiBackground variant="blobs" className="opacity-60" />
        <div className="max-w-md mx-auto px-4 text-center relative z-10">
          <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-6 text-slate-500 shadow-xl">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-white font-serif-luxury">
            Your Award Bag is Empty
          </h2>
          <p className="text-xs text-slate-400 mt-2 mb-8 leading-relaxed">
            Explore our collection of trophies, mementos, crystal obelisks, and championship cups with complimentary custom laser engraving.
          </p>
          <Link to="/catalog">
            <MagneticButton
              style={{
                backgroundColor: theme.primary,
                color: '#020617',
              }}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-xs tracking-wider uppercase shadow-xl cursor-pointer"
            >
              <span>Browse Trophy Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </MagneticButton>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen py-10 overflow-hidden">
      <HaikeiBackground variant="blobs" className="opacity-50" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 relative z-10">
        <div className="border-b border-slate-800 pb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-white font-serif-luxury">
              Your Awards Bag
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Review your awards and custom laser engraved plate details
            </p>
          </div>
          <button
            onClick={clearCart}
            className="text-xs text-rose-400 hover:text-rose-300 font-semibold transition-colors cursor-pointer"
          >
            Clear Bag
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-6">
            {cartItems.map(item => {
              const hasEngraving =
                item.engraving_line1 || item.engraving_line2 || item.engraving_line3;

              const plateClass =
                item.plate_color === 'Silver'
                  ? 'plate-silver border-slate-300'
                  : item.plate_color === 'Black'
                  ? 'plate-black border-amber-500'
                  : 'plate-gold border-amber-400';

              return (
                <div
                  key={item.key}
                  className="p-6 rounded-2xl bg-slate-900/85 border border-slate-800 hover:border-slate-700 transition-all space-y-4 shadow-xl backdrop-blur-md"
                >
                  <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
                    {/* Thumbnail & Info */}
                    <div className="flex items-center gap-4">
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-20 h-20 rounded-xl object-cover bg-slate-950 border border-slate-800 flex-shrink-0"
                      />
                      <div>
                        <span
                          style={{ color: theme.primary }}
                          className="text-[10px] uppercase font-bold tracking-wider"
                        >
                          {item.product.category_name}
                        </span>
                        <h3 className="text-sm sm:text-base font-bold text-white">
                          <Link to={`/product/${item.product.slug}`} className="hover:underline">
                            {item.product.name}
                          </Link>
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          ₹{Number(item.product.price).toLocaleString()} each • {item.product.material}
                        </p>
                      </div>
                    </div>

                    {/* Quantity & Item Subtotal */}
                    <div className="flex items-center justify-between w-full sm:w-auto sm:space-x-6 border-t sm:border-t-0 border-slate-800 pt-3 sm:pt-0">
                      {/* Stepper */}
                      <div className="flex items-center border border-slate-700 rounded-xl bg-slate-950 overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.key, item.quantity - 1)}
                          className="px-3 py-1.5 text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="px-3 py-1.5 text-xs font-bold text-white min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.key, item.quantity + 1)}
                          className="px-3 py-1.5 text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-base font-extrabold text-white">
                          ₹{(Number(item.product.price) * item.quantity).toLocaleString()}
                        </span>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.key)}
                        className="p-2 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Remove Award"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Engraved Plate Details Preview */}
                  <div className="pt-3 border-t border-slate-800/80">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-2.5">
                      <Sparkles className="w-3.5 h-3.5" style={{ color: theme.primary }} />
                      <span>
                        Engraving Plate Configuration ({item.plate_color} Finish • {item.engraving_font})
                      </span>
                    </div>

                    {hasEngraving ? (
                      <div
                        className={`p-3.5 rounded-lg border-2 text-center text-xs shadow-md ${plateClass}`}
                      >
                        {item.engraving_line1 && (
                          <div className="font-bold uppercase tracking-wider">{item.engraving_line1}</div>
                        )}
                        {item.engraving_line2 && (
                          <div className="font-semibold text-[11px] mt-0.5">{item.engraving_line2}</div>
                        )}
                        {item.engraving_line3 && (
                          <div className="font-normal text-[10px] mt-0.5 opacity-90">{item.engraving_line3}</div>
                        )}
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 italic">
                        Blank plate requested (No text provided)
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5 shadow-2xl">
              <h3 className="text-lg font-bold text-white font-serif-luxury pb-3 border-b border-slate-800">
                Order Summary
              </h3>

              {/* Promo code form */}
              <form onSubmit={applyPromo} className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" style={{ color: theme.primary }} /> Promo Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Try SHREEJI10"
                    value={promoCode}
                    onChange={e => setPromoCode(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 uppercase"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                {promoMessage && (
                  <p
                    className={`text-[11px] font-medium ${
                      discountPercent > 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {promoMessage}
                  </p>
                )}
              </form>

              {/* Price lines in INR (₹) */}
              <div className="space-y-2.5 text-xs text-slate-300 pt-2 border-t border-slate-800">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-white">₹{cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Laser Engraving Setup</span>
                  <span className="text-emerald-400 font-semibold">FREE (₹0.00)</span>
                </div>
                <div className="flex justify-between">
                  <span>Insured Delivery (Pan-India)</span>
                  <span className="text-emerald-400 font-semibold">FREE</span>
                </div>
                {discountPercent > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount ({(discountPercent * 100).toFixed(0)}%)</span>
                    <span>-₹{discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-white pt-3 border-t border-slate-800">
                  <span>Total Amount</span>
                  <span style={{ color: theme.primary }} className="font-extrabold text-lg">
                    ₹{finalTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Checkout Button with Magnetic physics */}
              <MagneticButton
                onClick={() => navigate('/checkout')}
                style={{
                  background: `linear-gradient(135deg, ${theme.primaryLight}, ${theme.primary}, ${theme.primaryDark})`,
                  boxShadow: `0 12px 28px -6px ${theme.primary}50`,
                }}
                className="w-full py-4 rounded-xl text-slate-950 font-extrabold text-sm tracking-wide transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </MagneticButton>

              <div className="text-[11px] text-slate-400 space-y-1.5 pt-2 text-center">
                <div className="flex items-center justify-center gap-1.5 text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>256-bit Secure Checkout • Shreeji Corporates Guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
