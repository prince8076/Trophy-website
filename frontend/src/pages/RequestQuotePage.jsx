import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
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
  Trophy,
} from 'lucide-react';
import { createEnquiry } from '../api';
import { useTheme } from '../context/ThemeContext';
import HaikeiBackground from '../components/HaikeiBackground';
import SpotlightCard from '../components/ui/SpotlightCard';

export default function RequestQuotePage() {
  const { theme } = useTheme();

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    company_name: '',
    city: '',
    product_name: 'Bespoke Custom Trophy Portfolio',
    quantity: '20-50 pcs (Corporate Annual Gala)',
    required_date: '',
    engraving_line1: '',
    engraving_line2: '',
    engraving_line3: '',
    plate_color: 'Gold',
    notes: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [submittedEnquiry, setSubmittedEnquiry] = useState(null);
  const [error, setError] = useState('');

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
      const result = await createEnquiry(formData);
      setSubmittedEnquiry(result);
    } catch (err) {
      setError(err.message || 'Failed to submit quote enquiry. Please WhatsApp us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleWhatsAppEnquiry = () => {
    const lines = [
      formData.engraving_line1 ? `Line 1: "${formData.engraving_line1}"` : '',
      formData.engraving_line2 ? `Line 2: "${formData.engraving_line2}"` : '',
      formData.engraving_line3 ? `Line 3: "${formData.engraving_line3}"` : '',
    ].filter(Boolean).join('\n  ');

    const message = `*Namaste Shreeji Corporates!* 🏆%0A%0A` +
      `I would like to request an official quote for bespoke awards:%0A` +
      `*Product Idea:* ${formData.product_name || 'Bespoke Trophy'}%0A` +
      `*Quantity Required:* ${formData.quantity}%0A` +
      `*Client Name:* ${formData.customer_name || 'Prospective Client'}%0A` +
      `*Company / Org:* ${formData.company_name || 'N/A'}%0A` +
      `*City / Location:* ${formData.city || 'India'}%0A` +
      `*Needed By Date:* ${formData.required_date || 'Standard Delivery'}%0A` +
      (lines ? `*Laser Engraving Specs:*%0A  ${lines}%0A` : '') +
      (formData.notes ? `*Custom Notes:* ${encodeURIComponent(formData.notes)}%0A` : '') +
      `%0APlease provide digital layout proof and official quotation. Thank you!`;

    window.open(`https://wa.me/918796977707?text=${message}`, '_blank');
  };

  return (
    <div className="relative min-h-screen py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <HaikeiBackground variant="blobs" className="opacity-70" />

      <div className="max-w-4xl mx-auto relative z-10 space-y-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div
            style={{
              backgroundColor: theme.bgTint,
              borderColor: theme.borderGlow,
              color: theme.primary,
            }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold shadow-sm"
          >
            <Crown className="w-3.5 h-3.5" />
            <span>Direct Artisan Workshop • Zero Middlemen</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white font-serif-luxury">
            Request Custom Quotation
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Specify your requirements, quantities, and laser engraving details. Our senior award engineers led by Ms. Madhu Sharma will craft custom vector proofs and provide tiered corporate pricing within 2 hours.
          </p>
        </div>

        {submittedEnquiry ? (
          <SpotlightCard className="p-8 sm:p-12 text-center rounded-3xl bg-slate-900 border border-amber-500/40 space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                Enquiry ID: {submittedEnquiry.enquiry_number}
              </span>
              <h2 className="text-2xl font-bold text-white font-serif-luxury mt-3">
                Quotation Request Received!
              </h2>
              <p className="text-sm text-slate-300 max-w-md mx-auto mt-2 leading-relaxed">
                Thank you, <strong className="text-white">{submittedEnquiry.customer_name}</strong>. Our engraving and manufacturing team will prepare your 3D digital mockup.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <button
                type="button"
                onClick={handleWhatsAppEnquiry}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-600/20"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat on WhatsApp (+91 87969 77707)</span>
              </button>
            </div>
          </SpotlightCard>
        ) : (
          <SpotlightCard className="p-8 sm:p-10 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-medium">
                  {error}
                </div>
              )}

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 text-white text-xs placeholder:text-slate-600 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-amber-400" /> Mobile / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    name="customer_phone"
                    required
                    value={formData.customer_phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 text-white text-xs placeholder:text-slate-600 outline-none transition-colors"
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
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 text-white text-xs placeholder:text-slate-600 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-amber-400" /> Corporate Email
                  </label>
                  <input
                    type="email"
                    name="customer_email"
                    value={formData.customer_email}
                    onChange={handleChange}
                    placeholder="procurement@company.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 text-white text-xs placeholder:text-slate-600 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" /> Delivery City / State
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g. Mumbai, New Delhi, Bengaluru"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 text-white text-xs placeholder:text-slate-600 outline-none transition-colors"
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
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 text-white text-xs outline-none transition-colors cursor-pointer"
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

              {/* Trophy Type & Engraving Inscription */}
              <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Laser Engraving Text (Complimentary)
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Free precision fiber laser etching</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Trophy Type / Material Preference
                  </label>
                  <input
                    type="text"
                    name="product_name"
                    value={formData.product_name}
                    onChange={handleChange}
                    placeholder="e.g. Optical Crystal Star Pillar / 3D Gold Monogram / Teakwood Plaque"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 focus:border-amber-400 text-white text-xs placeholder:text-slate-600 outline-none transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    name="engraving_line1"
                    value={formData.engraving_line1}
                    onChange={handleChange}
                    placeholder="Line 1: Award Title (e.g. ANNUAL EXCELLENCE AWARD 2026)"
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
                    placeholder="Line 3: Organization & Date (e.g. Tata Consultancy Services)"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 focus:border-amber-400 text-white text-xs placeholder:text-slate-600 outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Submitting Details...' : 'Submit Details For Official Quote'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleWhatsAppEnquiry}
                  className="py-3.5 px-6 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer border border-emerald-500/30"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Enquire via WhatsApp</span>
                </button>
              </div>

              <div className="text-center text-[11px] text-slate-500 flex items-center justify-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Direct artisan guarantee by Ms. Madhu Sharma • Free digital proofs before crafting</span>
              </div>
            </form>
          </SpotlightCard>
        )}
      </div>
    </div>
  );
}

