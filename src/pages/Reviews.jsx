// Reviews.jsx
// CRUD screens and Express APIs for: Review (Req 4)
// Record customer feedback, ratings (1-5) and testimonials (Req 3)
// College Internal Project: Project 21

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { apiRequest } from '../services/api.js';
import { 
  Star, 
  MessageSquare, 
  Filter, 
  User, 
  Scissors, 
  Award, 
  Calendar 
} from 'lucide-react';
import { LoadingState, EmptyState, ErrorAlert } from '../components/FeedbackState.jsx';

export default function Reviews() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [ratingFilter, setRatingFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReviews = async () => {
    setLoading(true);
    setError('');
    try {
      let query = '/reviews';
      if (ratingFilter !== 'All') query += `?rating=${ratingFilter}`;

      const res = await apiRequest(query);
      if (res.success) {
        setReviews(res.reviews);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch reviews.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [ratingFilter]);

  // Compute average rating
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold text-rose-600 uppercase tracking-widest">
            Client Testimonials &bull; Feedback System
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 flex items-center gap-2">
            <Star className="w-7 h-7 text-amber-500 fill-amber-500" />
            Customer Ratings &amp; Reviews
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Verified post-service reviews from completed client sessions.
          </p>
        </div>

        {/* Rating Scorecard */}
        <div className="bg-slate-900 text-white px-5 py-3 rounded-2xl flex items-center gap-4 shadow-md">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Overall Rating
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-black text-amber-400">★ {avgRating}</span>
              <span className="text-xs text-slate-400">({reviews.length} reviews)</span>
            </div>
          </div>
        </div>
      </div>

      <ErrorAlert message={error} onDismiss={() => setError('')} />

      {/* Filter by Stars */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] mr-2 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Filter Rating:
        </span>
        {['All', '5', '4', '3', '2', '1'].map((star) => (
          <button
            key={star}
            onClick={() => setRatingFilter(star)}
            className={`px-3 py-1.5 rounded-full font-semibold transition ${
              ratingFilter === star
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {star === 'All' ? 'All Reviews' : `★ ${star} Stars`}
          </button>
        ))}
      </div>

      {/* Reviews Grid */}
      {loading ? (
        <LoadingState message="Loading client reviews..." />
      ) : reviews.length === 0 ? (
        <EmptyState
          title="No reviews yet"
          message="No customer reviews found for the selected filter."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev._id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-rose-200 transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span
                        key={s}
                        className={s <= rev.rating ? 'text-amber-400' : 'text-slate-200'}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-xs text-slate-700 italic leading-relaxed">
                  "{rev.comment || 'Wonderful service and courteous staff!'}"
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-[10px]">
                    {rev.customer?.name ? rev.customer.name[0] : 'C'}
                  </div>
                  <span className="font-bold text-slate-900">{rev.customer?.name || 'Customer'}</span>
                </div>
                <div className="text-[11px] text-slate-500 pl-9">
                  <span>Treatment: <strong className="text-slate-700">{rev.service?.name}</strong></span>
                </div>
                <div className="text-[11px] text-slate-500 pl-9">
                  <span>Specialist: <strong className="text-slate-700">{rev.staff?.name}</strong></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
