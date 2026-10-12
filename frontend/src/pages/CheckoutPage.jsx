import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  CreditCard,
  Truck,
  ArrowLeft,
  Sparkles,
  Lock,
  Building,
  CheckCircle,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import HaikeiBackground from '../components/HaikeiBackground';
import MagneticButton from '../components/motion/MagneticButton';
import { createOrder } from '../api';

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    shipping_address: '',
    city: '',
    postal_code: '',
    payment_method: 'Corporate Invoice / Net 30',
    notes: '',
  });

  if (cartItems.length === 0) {
    return (
      <div className="relative min-h-[60vh] flex items-center justify-center py-20">
        <HaikeiBackground variant="blobs" className="opacity-60" />
        <div className="max-w-md mx-auto px-4 text-center relative z-10">
          <h2 className="text-2xl font-bold text-white font-serif-luxury">Your bag is empty</h2>
          <p className="text-slate-400 text-xs mt-2 mb-6">
            Add awards from the catalog before proceeding to checkout.
          </p>
          <Link
            to="/catalog"
            style={{ backgroundColor: theme.primary }}
            className="px-6 py-3 rounded-xl text-slate-950 font-bold text-xs"
          >
            Explore Catalog
          </Link>
        </div>
      </div>
    );
  }

  const handleChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const itemsPayload = cartItems.map(item => ({
      product: item.product.id,
      product_name: item.product.name,
      unit_price: Number(item.product.price).toFixed(2),
      quantity: item.quantity,
      engraving_line1: item.engraving_line1 || '',
      engraving_line2: item.engraving_line2 || '',
      engraving_line3: item.engraving_line3 || '',
      engraving_font: item.engraving_font || 'Classic Serif',
      plate_color: item.plate_color || 'Gold',
    }));

    const orderPayload = {
      ...formData,
      total_amount: cartTotal.toFixed(2),
      items: itemsPayload,
    };

    try {
      const createdOrder = await createOrder(orderPayload);
      clearCart();
      navigate(`/order-confirmation/${createdOrder.order_number}`);
    } catch (err) {
      console.error('Order creation failed:', err);
      setError(err.message || 'Failed to complete order. Please check the information provided.');
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen py-10 overflow-hidden">
      <HaikeiBackground variant="blobs" className="opacity-50" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
        {/* Back button */}
        <div>
          <Link
            to="/cart"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Award Bag
          </Link>
        </div>

        <div className="border-b border-slate-800 pb-4">
          <h1 className="text-3xl font-extrabold text-white font-serif-luxury">
            Shreeji Corporates Checkout
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete organization & delivery destination to schedule workshop engraving
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Form Details */}
          <div className="lg:col-span-7 space-y-8">
            {/* Contact Details */}
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl backdrop-blur-md">
              <h3
                style={{ color: theme.primary }}
                className="text-xs font-bold uppercase tracking-wider flex items-center gap-2"
              >
                <span>1. Organization & Contact Person</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Contact Person Name *
                  </label>
                  <input
                    type="text"
                    name="customer_name"
                    required
                    placeholder="e.g. Rajesh Malhotra"
                    value={formData.customer_name}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Email Address (For Proof & Updates) *
                  </label>
                  <input
                    type="email"
                    name="customer_email"
                    required
                    placeholder="e.g. rajesh@enterprise.com"
                    value={formData.customer_email}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Mobile Phone (For Courier Coordination) *
                  </label>
                  <input
                    type="tel"
                    name="customer_phone"
                    required
                    placeholder="e.g. +91 98765 43210"
                    value={formData.customer_phone}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Destination */}
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl backdrop-blur-md">
              <h3
                style={{ color: theme.primary }}
                className="text-xs font-bold uppercase tracking-wider flex items-center gap-2"
              >
                <span>2. Delivery Destination in India</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Premises / Office Address / Venue *
                  </label>
                  <input
                    type="text"
                    name="shipping_address"
                    required
                    placeholder="e.g. DLF CyberCity, Tower B, 12th Floor"
                    value={formData.shipping_address}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      City / State *
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      placeholder="e.g. New Delhi / Gurugram"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      PIN Code *
                    </label>
                    <input
                      type="text"
                      name="postal_code"
                      required
                      placeholder="e.g. 110059"
                      value={formData.postal_code}
                      onChange={handleChange}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Event Date / Special Instructions
                  </label>
                  <textarea
                    name="notes"
                    rows={2}
                    placeholder="e.g. Required before Annual Award Night on 24th October"
                    value={formData.notes}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl backdrop-blur-md">
              <h3
                style={{ color: theme.primary }}
                className="text-xs font-bold uppercase tracking-wider flex items-center gap-2"
              >
                <span>3. Billing Mode</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  className={`p-4 rounded-xl border flex items-center space-x-3 cursor-pointer transition-all ${
                    formData.payment_method === 'Corporate Invoice / Net 30'
                      ? 'border-amber-400 bg-amber-500/10 text-white'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value="Corporate Invoice / Net 30"
                    checked={formData.payment_method === 'Corporate Invoice / Net 30'}
                    onChange={handleChange}
                  />
                  <Building className="w-5 h-5 text-amber-400" />
                  <div>
                    <span className="text-xs font-bold block text-white">GST Invoice / Net 30</span>
                    <span className="text-[10px] text-slate-400">Institutional PO & Bank NEFT</span>
                  </div>
                </label>

                <label
                  className={`p-4 rounded-xl border flex items-center space-x-3 cursor-pointer transition-all ${
                    formData.payment_method === 'Credit Card / UPI Demo'
                      ? 'border-amber-400 bg-amber-500/10 text-white'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value="Credit Card / UPI Demo"
                    checked={formData.payment_method === 'Credit Card / UPI Demo'}
                    onChange={handleChange}
                  />
                  <CreditCard className="w-5 h-5 text-amber-400" />
                  <div>
                    <span className="text-xs font-bold block text-white">UPI / Card Gateway</span>
                    <span className="text-[10px] text-slate-400">Instant Online Demo Clearance</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Order Review & Submit */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5 shadow-2xl">
              <h3 className="text-base font-bold text-white font-serif-luxury pb-3 border-b border-slate-800">
                Awards Being Fabricated ({cartItems.length})
              </h3>

              <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                {cartItems.map(item => (
                  <div key={item.key} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.product.image_url}
                        alt=""
                        className="w-12 h-12 rounded-lg object-cover bg-slate-950 border border-slate-800 flex-shrink-0"
                      />
                      <div>
                        <div className="font-semibold text-white truncate max-w-[170px]">
                          {item.product.name}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Qty: {item.quantity} • {item.plate_color} Plate
                        </div>
                      </div>
                    </div>
                    <span className="font-bold text-white">
                      ₹{(Number(item.product.price) * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 text-xs text-slate-300 pt-3 border-t border-slate-800">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Custom Laser Engraving</span>
                  <span className="text-emerald-400">FREE</span>
                </div>
                <div className="flex justify-between">
                  <span>Insured Packaging (Pan-India)</span>
                  <span className="text-emerald-400">FREE</span>
                </div>
                <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-slate-800">
                  <span>Total Amount</span>
                  <span style={{ color: theme.primary }} className="font-extrabold text-lg">
                    ₹{cartTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              <MagneticButton
                type="submit"
                disabled={loading}
                style={{
                  background: `linear-gradient(135deg, ${theme.primaryLight}, ${theme.primary}, ${theme.primaryDark})`,
                  boxShadow: `0 12px 28px -6px ${theme.primary}50`,
                }}
                className="w-full py-4 rounded-xl text-slate-950 font-extrabold text-sm tracking-wide transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Lock className="w-4 h-4 text-slate-950" />
                <span>{loading ? 'Transmitting to Workshop...' : 'Confirm & Place Award Order'}</span>
              </MagneticButton>

              <div className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Saved directly into Shreeji Corporates production database</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
