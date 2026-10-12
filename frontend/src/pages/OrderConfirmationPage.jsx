import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Trophy,
  ArrowRight,
  Package,
  Sparkles,
  Calendar,
  Truck,
  Printer,
  Crown,
} from 'lucide-react';
import { fetchOrderByNumber } from '../api';
import { useTheme } from '../context/ThemeContext';
import HaikeiBackground from '../components/HaikeiBackground';
import MagneticButton from '../components/motion/MagneticButton';

export default function OrderConfirmationPage() {
  const { orderNumber } = useParams();
  const { theme } = useTheme();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderByNumber(orderNumber)
      .then(res => {
        setOrder(res);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load order:', err);
        setLoading(false);
      });
  }, [orderNumber]);

  return (
    <div className="relative min-h-screen py-16 overflow-hidden">
      <HaikeiBackground variant="blobs" className="opacity-60" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 relative z-10">
        {/* Success banner */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20 animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span
            style={{ color: theme.primary }}
            className="text-xs uppercase tracking-widest font-bold block"
          >
            Order Confirmed & Queued for Workshop
          </span>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-serif-luxury">
            Thank You, {order ? order.customer_name : 'Valued Client'}!
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Your award order has been logged into the Shreeji Corporates workshop queue. Our artisans have received your custom engraving plates for laser production.
          </p>

          {/* Order Number pill */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs sm:text-sm font-mono text-amber-300 shadow-md">
            <span>Order Reference:</span>
            <span className="font-bold text-white tracking-wider">{orderNumber}</span>
          </div>
        </div>

        {/* Progress Timeline Stepper */}
        <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-md">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6 text-center">
            Shreeji Craftsmanship & Production Pipeline
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
            <div
              style={{
                backgroundColor: `${theme.primary}18`,
                borderColor: `${theme.primary}40`,
              }}
              className="p-4 rounded-xl border text-center"
            >
              <div
                style={{ backgroundColor: theme.primary }}
                className="w-8 h-8 rounded-full text-slate-950 font-bold flex items-center justify-center mx-auto mb-2 text-xs"
              >
                1
              </div>
              <div className="text-xs font-bold text-white">Order Confirmed</div>
              <div style={{ color: theme.primary }} className="text-[10px] mt-0.5 font-semibold">
                Completed
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 font-bold flex items-center justify-center mx-auto mb-2 text-xs">
                2
              </div>
              <div className="text-xs font-bold text-white">Laser Engraving</div>
              <div className="text-[10px] text-slate-400 mt-0.5">In Progress</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 font-bold flex items-center justify-center mx-auto mb-2 text-xs">
                3
              </div>
              <div className="text-xs font-bold text-white">Quality Inspection</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Velvet Casing</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 font-bold flex items-center justify-center mx-auto mb-2 text-xs">
                4
              </div>
              <div className="text-xs font-bold text-white">Dispatched</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Pan-India Express</div>
            </div>
          </div>
        </div>

        {/* Order Details Breakdown */}
        {order && (
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white font-serif-luxury">Order Summary</h3>
                <p className="text-xs text-slate-400">
                  Recipient: {order.customer_name} ({order.customer_email})
                </p>
              </div>
              <span style={{ color: theme.primary }} className="text-xl font-extrabold">
                ₹{Number(order.total_amount).toLocaleString()}
              </span>
            </div>

            <div className="space-y-4">
              {order.items?.map(item => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row justify-between sm:items-center gap-4"
                >
                  <div>
                    <h4 className="text-sm font-bold text-white">{item.product_name}</h4>
                    <div className="text-xs text-slate-400 mt-1">
                      Qty: {item.quantity} • Plate: {item.plate_color} • Font: {item.engraving_font}
                    </div>
                    {(item.engraving_line1 || item.engraving_line2) && (
                      <div
                        style={{
                          backgroundColor: `${theme.primary}18`,
                          color: theme.primary,
                        }}
                        className="mt-2 text-[11px] px-2.5 py-1 rounded inline-block font-mono"
                      >
                        Engraved: "{item.engraving_line1}" {item.engraving_line2 && `| "${item.engraving_line2}"`}
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-white">
                    ₹{(Number(item.unit_price) * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-800 text-xs text-slate-400 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="font-bold text-slate-300 block mb-1">Shipping To:</span>
                <p>{order.shipping_address}, {order.city} {order.postal_code}</p>
              </div>
              <div>
                <span className="font-bold text-slate-300 block mb-1">Billing Status:</span>
                <p className="text-emerald-400 font-semibold">{order.payment_method}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action links with Magnetic physics */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link to={`/track?order=${orderNumber}`}>
            <MagneticButton
              style={{
                backgroundColor: theme.primary,
                color: '#020617',
              }}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <Truck className="w-4 h-4" />
              <span>Live Order Tracking</span>
            </MagneticButton>
          </Link>

          <Link to="/catalog">
            <button
              type="button"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 border border-slate-700 cursor-pointer"
            >
              <Trophy className="w-4 h-4" />
              <span>Browse Catalog</span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
