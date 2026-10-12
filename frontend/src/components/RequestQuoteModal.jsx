import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Send,
  MessageCircle,
  Building2,
  Phone,
  Mail,
  User,
  MapPin,
  Calendar,
  CheckCircle2,
  Sparkles,
  Layers,
  Crown,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { createEnquiry } from '../api';
import { useTheme } from '../context/ThemeContext';
import ShimmerButton from './ui/ShimmerButton';

export default function RequestQuoteModal({
  isOpen,
  onClose,
  product = null,
  initialCustomization = null,
}) {
  const { theme } = useTheme();

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    company_name: '',
    city: '',
    quantity: '10-25 pcs',
    required_date: '',
    engraving_line1: initialCustomization?.engraving_line1 || '',
    engraving_line2: initialCustomization?.engraving_line2 || '',
    engraving_line3: initialCustomization?.engraving_line3 || '',
    plate_color: initialCustomization?.plate_color || 'Gold',
    notes: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [submittedEnquiry, setSubmittedEnquiry] = useState(null);
  const [error, setError] = useState('');

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isOpen]);

  // Handle escape key to dismiss modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.customer_name.trim() || !formData.customer_phone.trim()) {
      setError('Please provide your name and phone / WhatsApp number.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        customer_email: formData.customer_email || 'client@shreejicorporates.com',
        company_name: formData.company_name,
        city: formData.city,
        product: product?.id || null,
        product_name: product?.name || 'General Custom Trophy Portfolio Enquiry',
        quantity: formData.quantity,
        required_date: formData.required_date,
        engraving_line1: formData.engraving_line1,
        engraving_line2: formData.engraving_line2,
        engraving_line3: formData.engraving_line3,
        plate_color: formData.plate_color,
        notes: formData.notes,
      };

      const result = await createEnquiry(payload);
      setSubmittedEnquiry(result);
    } catch (err) {
      setError(err.message || 'Failed to submit quote enquiry. Please try again or WhatsApp us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleWhatsAppEnquiry = () => {
    const trophyName = product?.name || 'Bespoke Custom Trophy / Award Portfolio';
    const lines = [
      formData.engraving_line1 ? `Line 1: "${formData.engraving_line1}"` : '',
      formData.engraving_line2 ? `Line 2: "${formData.engraving_line2}"` : '',
      formData.engraving_line3 ? `Line 3: "${formData.engraving_line3}"` : '',
    ].filter(Boolean).join('\n  ');

    const message = `*Namaste Shreeji Corporates!* 🏆%0A%0A` +
      `I would like to request an official quote for bespoke awards:%0A` +
      `*Product:* ${trophyName}%0A` +
      `*Quantity Required:* ${formData.quantity || '10-25 pcs'}%0A` +
      `*Client Name:* ${formData.customer_name || 'Prospective Client'}%0A` +
      `*Company / Org:* ${formData.company_name || 'N/A'}%0A` +
      `*City / Location:* ${formData.city || 'India'}%0A` +
      `*Needed By Date:* ${formData.required_date || 'Standard Delivery'}%0A` +
      (lines ? `*Laser Engraving Specs:*%0A  ${lines}%0A` : '') +
      (formData.notes ? `*Custom Notes:* ${encodeURIComponent(formData.notes)}%0A` : '') +
      `%0APlease provide digital layout proof and official quotation. Thank you!`;

    window.open(`https://wa.me/919266944393?text=${message}`, '_blank');
  };

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window Wrapper - min-h-full centering prevents negative scroll clipping */}
        <div className="min-h-full flex items-center justify-center p-3 sm:p-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-2xl bg-slate-900 border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden z-10 my-4 sm:my-8 text-left flex flex-col max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-4rem)]"
          >
            {/* Pinned Header Bar - Always visible */}
            <div className="flex-shrink-0 px-6 py-4.5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                style={{ backgroundColor: `${theme.primary}20`, color: theme.primary }}
                className="w-10 h-10 rounded-xl flex items-center justify-center border border-amber-500/30"
              >
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-serif-luxury">
                  Request Official Quote & Digital Proof
                </h3>
                <p className="text-xs text-slate-400">
                  Direct artisan manufacturing • Bulk tiered pricing • Free laser engraving
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Success State */}
          {submittedEnquiry ? (
            <div className="flex-1 overflow-y-auto min-h-0 p-6 sm:p-8 text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  Enquiry ID: {submittedEnquiry.enquiry_number}
                </span>
                <h4 className="text-2xl font-bold text-white font-serif-luxury mt-3">
                  Thank You, {submittedEnquiry.customer_name}!
                </h4>
                <p className="text-sm text-slate-300 max-w-md mx-auto mt-2 leading-relaxed">
                  Your specifications for <strong className="text-amber-300">{submittedEnquiry.product_name}</strong> have been received by Ms. Madhu Sharma and our master engraving studio.
                </p>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 max-w-md mx-auto text-left space-y-2.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">Quantity Needed:</span>
                  <span className="font-bold text-white">{submittedEnquiry.quantity}</span>
                </div>
                {submittedEnquiry.company_name && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Organization:</span>
                    <span className="font-bold text-white">{submittedEnquiry.company_name}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Contact Number:</span>
                  <span className="font-bold text-white">{submittedEnquiry.customer_phone}</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex items-center gap-2 text-emerald-400 font-semibold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Expect quotation & digital vector mockup within 2 hours</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <button
                  type="button"
                  onClick={handleWhatsAppEnquiry}
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-600/20"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Send On WhatsApp Now</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            </div>
          ) : (
            /* Form View */
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto min-h-0 p-5 sm:p-6 space-y-5">
              {error && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-medium">
                  {error}
                </div>
              )}

              {/* Selected Trophy Bar */}
              {product && (
                <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-xl bg-black border border-slate-800 overflow-hidden flex-shrink-0 flex items-center justify-center p-1">
                    <img
                      src={product.image_url || '/uploads/star-pillar-crystal-award.png'}
                      alt={product.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-amber-400 uppercase tracking-wider truncate">
                      {product.category_name || 'Artisan Trophy'}
                    </div>
                    <div className="text-sm font-bold text-white truncate font-serif-luxury">
                      {product.name}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {product.material} • Free Custom Laser Engraving
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-amber-400" /> Full Name *
                  </label>
                  <input
                    type="text"
                    name="customer_name"
                    required
                    value={formData.customer_name}
                    onChange={handleChange}
                    placeholder="e.g. Vikramaditya Sharma"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-amber-400 text-white text-xs placeholder:text-slate-600 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-amber-400" /> Phone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    name="customer_phone"
                    required
                    value={formData.customer_phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-amber-400 text-white text-xs placeholder:text-slate-600 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-amber-400" /> Company / University / Club
                  </label>
                  <input
                    type="text"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    placeholder="e.g. Tata Consultancy Services / IIT Delhi"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-amber-400 text-white text-xs placeholder:text-slate-600 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-amber-400" /> Email Address
                  </label>
                  <input
                    type="email"
                    name="customer_email"
                    value={formData.customer_email}
                    onChange={handleChange}
                    placeholder="procurement@company.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-amber-400 text-white text-xs placeholder:text-slate-600 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" /> City / Delivery Location
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g. Mumbai, New Delhi, Bengaluru"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-amber-400 text-white text-xs placeholder:text-slate-600 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-amber-400" /> Quantity Needed *
                  </label>
                  <select
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-amber-400 text-white text-xs outline-none transition-colors cursor-pointer"
                  >
                    <option value="1 - 5 pcs (Executive Prototype)">1 - 5 pcs (Executive Prototype)</option>
                    <option value="5 - 20 pcs (Department Awards)">5 - 20 pcs (Department Awards)</option>
                    <option value="20 - 50 pcs (Corporate Annual Gala)">20 - 50 pcs (Corporate Annual Gala)</option>
                    <option value="50 - 150 pcs (Convocation / League)">50 - 150 pcs (Convocation / League)</option>
                    <option value="150 - 500 pcs (Mass Institutional)">150 - 500 pcs (Mass Institutional)</option>
                    <option value="500+ pcs (National Championship / Mega Batch)">500+ pcs (Mega Batch)</option>
                  </select>
                </div>
              </div>

              {/* Engraving Requirements */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Laser Engraving Text (Complimentary)
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">No extra setup fee</span>
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    name="engraving_line1"
                    value={formData.engraving_line1}
                    onChange={handleChange}
                    placeholder="Line 1: Award Title (e.g. ANNUAL EXCELLENCE AWARD)"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 focus:border-amber-400 text-white text-xs placeholder:text-slate-600 outline-none transition-colors"
                  />
                  <input
                    type="text"
                    name="engraving_line2"
                    value={formData.engraving_line2}
                    onChange={handleChange}
                    placeholder="Line 2: Recipient / Category (e.g. Presented to Rajesh Kumar)"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 focus:border-amber-400 text-white text-xs placeholder:text-slate-600 outline-none transition-colors"
                  />
                  <input
                    type="text"
                    name="engraving_line3"
                    value={formData.engraving_line3}
                    onChange={handleChange}
                    placeholder="Line 3: Date & Organization (e.g. 2026 • Tata Consultancy Services)"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 focus:border-amber-400 text-white text-xs placeholder:text-slate-600 outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Notes / Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" /> Event / Needed By Date
                  </label>
                  <input
                    type="text"
                    name="required_date"
                    value={formData.required_date}
                    onChange={handleChange}
                    placeholder="e.g. Within 5 Days / 25th Oct 2026"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-amber-400 text-white text-xs placeholder:text-slate-600 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Additional Notes / Logo Spec
                  </label>
                  <input
                    type="text"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="e.g. We have high-res SVG vector logo to etch"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-amber-400 text-white text-xs placeholder:text-slate-600 outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Submitting Details...' : 'Submit Details For Official Quote'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleWhatsAppEnquiry}
                  className="py-3 px-6 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer border border-emerald-500/30"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Enquire via WhatsApp</span>
                </button>
              </div>

              <div className="text-center text-[11px] text-slate-500">
                🔒 Your corporate specifications remain confidential. Direct response from Ms. Madhu Sharma (+91 92669 44393).
              </div>
            </form>
          )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
