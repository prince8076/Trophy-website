import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Truck,
  CheckCircle,
  Clock,
  Sparkles,
  AlertCircle,
  PackageCheck,
  ShieldCheck,
} from 'lucide-react';
import { fetchOrderByNumber } from '../api';
import { useTheme } from '../context/ThemeContext';
import HaikeiBackground from '../components/HaikeiBackground';
import MagneticButton from '../components/motion/MagneticButton';

export default function OrderTrackingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { theme } = useTheme();
  const initialOrder = searchParams.get('order') || '';

  const [orderNumber, setOrderNumber] = useState(initialOrder);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const lookupOrder = async queryNumber => {
    if (!queryNumber.trim()) return;
    setLoading(true);
    setError('');
    try {
      const data = await fetchOrderByNumber(queryNumber.trim().toUpperCase());
      setOrder(data);
    } catch (err) {
      setError('We could not find an award order with that reference number. Please check your order ID.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrder) {
      lookupOrder(initialOrder);
    }
  }, [initialOrder]);

  const handleSearchSubmit = e => {
    e.preventDefault();
    if (orderNumber.trim()) {
      setSearchParams({ order: orderNumber.trim() });
      lookupOrder(orderNumber);
    }
  };

  return (
    <div className="relative min-h-screen py-12 overflow-hidden">
      <HaikeiBackground variant="blobs" className="opacity-60" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 relative z-10">
        <div className="text-center space-y-3">
          <div
            style={{
              backgroundColor: theme.bgTint,
              borderColor: theme.borderGlow,
              color: theme.primary,
            }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold shadow-sm"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Shreeji Concierge Tracking</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white font-serif-luxury">
            Track Your Trophy Order
          </h1>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Enter your Shreeji Corporates order reference number (e.g., TRP-B41B54FC) to view live engraving and dispatch progress.
          </p>
        </div>

        {/* Search Input Box */}
        <form
          onSubmit={handleSearchSubmit}
          className="max-w-xl mx-auto flex gap-2 p-2 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl backdrop-blur-md"
        >
          <input
            type="text"
            placeholder="Enter Order # (e.g. TRP-12345678)"
            value={orderNumber}
            onChange={e => setOrderNumber(e.target.value)}
            className="flex-1 bg-transparent px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none uppercase font-mono"
          />
          <MagneticButton
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: theme.primary,
              color: '#020617',
            }}
            className="px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
          >
            <Search className="w-4 h-4" />
            <span>{loading ? 'Searching...' : 'Track'}</span>
          </MagneticButton>
        </form>

        {error && (
          <div className="max-w-xl mx-auto p-4 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-3 shadow-md">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Order Results */}
        {order && (
          <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-8 animate-in fade-in backdrop-blur-md">
            {/* Status Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
              <div>
                <div className="text-xs text-slate-400">Order Reference</div>
                <div style={{ color: theme.primary }} className="text-xl font-bold font-mono mt-0.5">
                  {order.order_number}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Current Status:</span>
                <span
                  style={{
                    backgroundColor: `${theme.primary}20`,
                    borderColor: `${theme.primary}40`,
                    color: theme.primary,
                  }}
                  className="px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider flex items-center gap-1.5"
                >
                  <Clock className="w-3.5 h-3.5" />
                  {order.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Stepper */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-xs">
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 font-semibold">
                <CheckCircle className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
                <span>Confirmed</span>
              </div>
              <div
                style={{
                  backgroundColor: `${theme.primary}18`,
                  borderColor: `${theme.primary}40`,
                  color: theme.primary,
                }}
                className="p-3 rounded-xl border font-semibold"
              >
                <Sparkles className="w-4 h-4 mx-auto mb-1 animate-spin" />
                <span>In Laser Engraving</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-500">
                <PackageCheck className="w-4 h-4 mx-auto mb-1" />
                <span>Quality Inspection</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-500">
                <Truck className="w-4 h-4 mx-auto mb-1" />
                <span>Shipped</span>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Trophies & Custom Engraving Plates
              </h4>

              {order.items?.map(item => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs"
                >
                  <div className="flex justify-between font-bold text-white">
                    <span>{item.quantity}x {item.product_name}</span>
                    <span style={{ color: theme.primary }}>
                      ₹{(Number(item.unit_price) * item.quantity).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    Plate Finish: {item.plate_color} • Font: {item.engraving_font}
                  </div>
                  {(item.engraving_line1 || item.engraving_line2 || item.engraving_line3) && (
                    <div className="p-2.5 rounded bg-slate-900 border border-slate-800 font-serif-luxury text-center text-amber-200">
                      {item.engraving_line1 && <div>{item.engraving_line1}</div>}
                      {item.engraving_line2 && <div className="text-[11px] opacity-80">{item.engraving_line2}</div>}
                      {item.engraving_line3 && <div className="text-[10px] opacity-70">{item.engraving_line3}</div>}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Recipient & Total */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row justify-between text-xs text-slate-400 gap-4">
              <div>
                <span className="font-bold text-white block">Recipient & Shipping:</span>
                <p>{order.customer_name}</p>
                <p>{order.shipping_address}, {order.city} {order.postal_code}</p>
              </div>
              <div className="sm:text-right">
                <span className="font-bold text-white block">Total Paid:</span>
                <span style={{ color: theme.primary }} className="text-xl font-extrabold">
                  ₹{Number(order.total_amount).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
