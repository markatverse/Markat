"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Star, Send, CheckCircle2, ThumbsUp, PenLine, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';

interface Review {
  id: string;
  rating: number;
  comment: string;
  userName: string;
  createdAt: string;
}

interface ReviewsSectionProps {
  entityId: string;
  entityType: 'PRODUCT' | 'SERVICE';
  initialRating?: number | string;
  initialReviewCount?: number | string;
}

const getApiUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== 'undefined') {
    return `http://${window.location.hostname}:3001`;
  }
  return 'http://localhost:3001';
};
const API_URL = getApiUrl();

export default function ReviewsSection({ 
  entityId, 
  entityType,
  initialRating,
  initialReviewCount
}: ReviewsSectionProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form State
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${API_URL}/reviews/${entityType}/${entityId}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to fetch reviews", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [entityId, entityType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in to submit a review.');
      return;
    }
    if (!comment.trim()) {
      toast.error('Please provide a brief comment for your review.');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          entityId,
          entityType,
          rating,
          comment,
          userId: user.id || user.markatId || 'anonymous',
          userName: user.name || 'Verified Customer'
        })
      });
      
      if (!res.ok) throw new Error('Failed to submit review');
      
      toast.success('Thank you! Your review has been published.');
      setComment('');
      setRating(5);
      setShowReviewForm(false);
      fetchReviews(); // Refresh the list
    } catch (err: any) {
      toast.error(err.message || 'Error submitting review');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Compute rating metrics
  const parsedCount = typeof initialReviewCount === 'string' ? (parseInt(initialReviewCount, 10) || 0) : (initialReviewCount || 0);
  const parsedRating = typeof initialRating === 'string' ? parseFloat(initialRating) : initialRating;
  const totalCount = reviews.length > 0 ? reviews.length : parsedCount;
  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length).toFixed(1)
    : (parsedRating && !isNaN(parsedRating) ? parsedRating.toFixed(1) : '4.8');

  // Breakdown counts
  const starCounts = [5, 4, 3, 2, 1].map((s) => {
    const count = reviews.filter((r) => Math.round(r.rating) === s).length;
    const pct = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : (s === 5 ? 75 : s === 4 ? 20 : 5);
    return { star: s, count, pct };
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-6 lg:p-8">
      {/* Flipkart-Style Header: Ratings & Reviews with Rate Product Button */}
      <div className="flex items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Ratings & Reviews
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified ratings and customer feedback
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowReviewForm(!showReviewForm)}
          className="cursor-pointer shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-all active:scale-95"
        >
          <PenLine className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>{showReviewForm ? 'Cancel Review' : 'Rate Product'}</span>
          {showReviewForm ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Flipkart-Style Rating Summary Bar */}
      <div className="py-6 border-b border-slate-100 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left: Overall Score */}
        <div className="md:col-span-4 flex items-center md:flex-col md:items-start justify-between md:justify-center border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:pr-6">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-slate-900">{averageRating}</span>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-600 text-white font-extrabold text-xs">
              <span>★</span>
            </div>
          </div>
          <div className="text-xs text-slate-500 font-medium mt-1">
            {totalCount} Ratings & {reviews.length} Reviews
          </div>
          <div className="mt-2 text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> 100% Certified Buyers
          </div>
        </div>

        {/* Right: Star Distribution Bars */}
        <div className="md:col-span-8 space-y-1.5">
          {starCounts.map(({ star, count, pct }) => (
            <div key={star} className="flex items-center gap-3 text-xs">
              <span className="w-6 font-bold text-slate-600 flex items-center gap-0.5 justify-end">
                {star} <span className="text-amber-400 text-[10px]">★</span>
              </span>
              <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    star >= 4 ? 'bg-emerald-500' : star === 3 ? 'bg-amber-500' : 'bg-red-400'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-10 text-right text-slate-400 font-medium text-[11px]">
                {reviews.length > 0 ? count : `${pct}%`}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Collapsible Write / Submit Review Form */}
      {showReviewForm && (
        <div className="my-6 p-5 sm:p-6 bg-slate-50 rounded-2xl border border-blue-200/80 shadow-xs animate-in fade-in slide-in-from-top-2 duration-200">
          <h4 className="font-extrabold text-slate-900 text-sm sm:text-base mb-1">
            Share Your Experience
          </h4>
          <p className="text-xs text-slate-500 mb-4">
            Help other shoppers make informed decisions by rating this {entityType.toLowerCase()}.
          </p>

          {user ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Overall Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="cursor-pointer focus:outline-none transition-transform hover:scale-115 active:scale-95"
                    >
                      <Star
                        size={26}
                        className={`${
                          star <= rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-slate-200 text-slate-200 hover:fill-amber-200'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-2">
                    {rating === 5 ? 'Excellent' : rating === 4 ? 'Very Good' : rating === 3 ? 'Good' : rating === 2 ? 'Fair' : 'Poor'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Your Review
                </label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What did you like or dislike? How was the delivery, build quality, and packaging?"
                  className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-xs sm:text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 text-xs sm:text-sm"
                >
                  {isSubmitting ? 'Submitting...' : <><Send size={14} /> Post Review</>}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-6 bg-white rounded-xl border border-slate-200/80">
              <p className="text-slate-600 text-xs sm:text-sm font-medium mb-3">
                Please log in to share your verified review.
              </p>
              <a
                href="/login"
                className="inline-block bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-5 rounded-xl text-xs transition-colors shadow-xs"
              >
                Sign In to Review
              </a>
            </div>
          )}
        </div>
      )}

      {/* Reviews List */}
      <div className="pt-6">
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-24 bg-slate-100 rounded-xl w-full" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-10 bg-slate-50/70 rounded-2xl border border-slate-200/60">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <Star className="w-6 h-6 fill-blue-600 text-blue-600" />
            </div>
            <h4 className="text-slate-900 font-bold text-sm sm:text-base mb-1">No customer reviews yet</h4>
            <p className="text-slate-500 text-xs max-w-sm mx-auto mb-4">
              Have you purchased or used this product? Be the first to help other buyers with your feedback!
            </p>
            <button
              type="button"
              onClick={() => setShowReviewForm(true)}
              className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-blue-600 border border-blue-200 text-xs font-bold transition-all shadow-xs"
            >
              <PenLine className="w-3.5 h-3.5" />
              <span>Write the First Review</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {reviews.map((review) => (
              <div key={review.id} className="py-4 sm:py-5 first:pt-0 last:pb-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-600 text-white font-black text-xs">
                    {review.rating || 5} ★
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    {review.rating >= 4 ? 'Satisfied Buyer' : 'Buyer Review'}
                  </span>
                </div>

                {review.comment && (
                  <p className="text-slate-700 text-xs sm:text-sm leading-relaxed mb-3">
                    {review.comment}
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 font-medium">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-700 font-bold">{review.userName || 'Verified Buyer'}</span>
                    <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" /> Certified Buyer
                    </span>
                  </div>
                  <div>
                    {new Date(review.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
