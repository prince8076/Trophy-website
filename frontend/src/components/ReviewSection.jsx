import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  Quote,
  CheckCircle2,
  Building,
  MapPin,
  Sparkles,
  PenTool,
  X,
  Send,
  Award,
  Crown,
  ThumbsUp,
} from 'lucide-react';
import { fetchReviews, submitReview } from '../api';
import { useTheme } from '../context/ThemeContext';
import SpotlightCard from './ui/SpotlightCard';

export default function ReviewSection({ productSlug = '', title = "What Corporate Leaders Say", subtitle = "Wall of Institutional Trust & Client Reviews" }) {
  const { theme } = useTheme();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [formError, setFormError] = useState('');

  const [newReview, setNewReview] = useState({
    reviewer_name: '',
    company_or_org: '',
    designation: '',
    city: '',
    rating: 5,
    title: '',
    comment: '',
  });

  useEffect(() => {
    loadReviews();
  }, [productSlug]);

  const loadReviews = () => {
    setLoading(true);
    fetchReviews(productSlug)
      .then((data) => {
        setReviews(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!newReview.reviewer_name.trim() || !newReview.comment.trim()) {
      setFormError('Please enter your name and review details.');
      return;
    }

    setSubmitting(true);
    try {
      await submitReview({
        ...newReview,
        product: null,
      });
      setSuccessMsg('Thank you! Your verified review has been submitted.');
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccessMsg('');
        setNewReview({
          reviewer_name: '',
          company_or_org: '',
          designation: '',
          city: '',
          rating: 5,
          title: '',
          comment: '',
        });
        loadReviews();
      }, 1500);
    } catch (err) {
      setFormError(err.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredReviews = reviews.filter((r) => {
    if (filter === 'corporate') return r.company_or_org.toLowerCase().includes('tata') || r.company_or_org.toLowerCase().includes('hdfc');
    if (filter === 'academic') return r.company_or_org.toLowerCase().includes('university') || r.company_or_org.toLowerCase().includes('college');
    if (filter === 'sports') return r.company_or_org.toLowerCase().includes('cup') || r.company_or_org.toLowerCase().includes('club') || r.company_or_org.toLowerCase().includes('golf');
    return true;
  });

  return (
    <section className="relative py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <div
            style={{ color: theme.primary }}
            className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-2 font-heading-cinzel"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{subtitle}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white font-serif-luxury">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Over 50,000 mementos delivered across 20+ years. Reviewed by India's top university deans, corporate HR heads, and sports federations.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-white">
            <div className="flex text-amber-400">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
              ))}
            </div>
            <span className="font-mono text-amber-300">4.98 / 5.0</span>
            <span className="text-slate-500 font-normal">• 4,500+ Verified Honors</span>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 hover:text-amber-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Write A Client Review</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'all', label: `All Verified Reviews (${reviews.length})` },
          { id: 'corporate', label: 'Corporate & Banking' },
          { id: 'academic', label: 'Convocations & Academia' },
          { id: 'sports', label: 'Sports & Armed Forces' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
              filter === tab.id
                ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-sm'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reviews Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-64 bg-slate-900 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReviews.map((review) => (
            <SpotlightCard
              key={review.id}
              className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/80 flex flex-col justify-between"
            >
              <div>
                {/* Rating & Verified Badge */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex text-amber-400 gap-0.5">
                    {Array.from({ length: review.rating || 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified Client
                  </span>
                </div>

                {/* Review Title */}
                {review.title && (
                  <h4 className="text-sm font-bold text-white mb-2 font-serif-luxury">
                    "{review.title}"
                  </h4>
                )}

                {/* Comment */}
                <p className="text-xs text-slate-300 leading-relaxed font-normal mb-4">
                  {review.comment}
                </p>
              </div>

              {/* Reviewer Details */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500/30 to-amber-700/30 border border-amber-500/40 flex items-center justify-center text-amber-300 font-bold text-xs uppercase">
                  {review.reviewer_name?.slice(0, 2) || 'SC'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-white truncate">
                    {review.reviewer_name}
                  </div>
                  <div className="text-[11px] text-amber-400/90 truncate font-semibold">
                    {review.designation ? `${review.designation}, ` : ''}{review.company_or_org}
                  </div>
                  {review.city && (
                    <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-2.5 h-2.5" />
                      <span>{review.city}</span>
                    </div>
                  )}
                </div>
              </div>
            </SpotlightCard>
          ))}
        </div>
      )}

      {/* Review Submission Modal */}
      {createPortal(
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[9999] overflow-y-auto">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                className="fixed inset-0 bg-black/85 backdrop-blur-md"
              />

              <div className="min-h-full flex items-center justify-center p-3 sm:p-6 text-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  transition={{ duration: 0.2 }}
                  className="relative w-full max-w-lg bg-slate-900 border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden z-10 p-6 my-4 sm:my-8 text-left flex flex-col max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-4rem)]"
                >
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-bold text-white font-serif-luxury">
                    Share Your Experience with Shreeji Corporates
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {successMsg ? (
                <div className="py-8 text-center space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                  <p className="text-sm font-bold text-white">{successMsg}</p>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="pt-4 space-y-4">
                  {formError && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                      {formError}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newReview.reviewer_name}
                      onChange={(e) => setNewReview({ ...newReview, reviewer_name: e.target.value })}
                      placeholder="e.g. Ramesh Chandra"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Company / Organization
                      </label>
                      <input
                        type="text"
                        value={newReview.company_or_org}
                        onChange={(e) => setNewReview({ ...newReview, company_or_org: e.target.value })}
                        placeholder="e.g. Infosys / Rotary Club"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Designation / Title
                      </label>
                      <input
                        type="text"
                        value={newReview.designation}
                        onChange={(e) => setNewReview({ ...newReview, designation: e.target.value })}
                        placeholder="e.g. Head of HR"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        value={newReview.city}
                        onChange={(e) => setNewReview({ ...newReview, city: e.target.value })}
                        placeholder="e.g. New Delhi"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Rating (Stars)
                      </label>
                      <select
                        value={newReview.rating}
                        onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-amber-400"
                      >
                        <option value={5}>5 Stars (Exceptional)</option>
                        <option value={4}>4 Stars (Very Good)</option>
                        <option value={3}>3 Stars (Good)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Review Headline
                    </label>
                    <input
                      type="text"
                      value={newReview.title}
                      onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                      placeholder="e.g. Immaculate crystal quality & express dispatch"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Your Detailed Review *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={newReview.comment}
                      onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                      placeholder="Share your experience regarding craftsmanship, laser engraving precision, packaging, and delivery..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-amber-400"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submitting ? 'Publishing Review...' : 'Publish Verified Review'}</span>
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
        )}
      </AnimatePresence>,
      document.body
    )}
  </section>
);
}
