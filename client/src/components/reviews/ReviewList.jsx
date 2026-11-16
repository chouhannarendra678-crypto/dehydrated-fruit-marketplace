import React, { useState } from 'react';
import { Star, MessageSquarePlus, Filter, ShieldCheck } from 'lucide-react';
import ReviewCard from './ReviewCard';
import ReviewForm from './ReviewForm';
import Button from '../common/Button';
import Modal from '../common/Modal';

const ReviewList = ({
  reviews = [],
  averageRating = 5,
  reviewCount = 0,
  canReview = false,
  hasReviewed = false,
  targetTitle = 'This Item',
  onSubmitReview,
  isSubmitting = false,
}) => {
  const [selectedStarFilter, setSelectedStarFilter] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);

  const filteredReviews = selectedStarFilter
    ? reviews.filter((r) => r.rating === Number(selectedStarFilter))
    : reviews;

  const handleFormSubmit = async (formData) => {
    await onSubmitReview(formData);
    setShowReviewModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Rating Aggregate Summary */}
      <div className="p-6 sm:p-8 rounded-lg bg-oat-card border border-forest/15 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xs">
        <div className="flex items-center gap-6">
          <div className="text-center sm:text-left">
            <span className="text-4xl sm:text-5xl font-bold font-display text-forest tracking-tight">
              {averageRating > 0 ? averageRating.toFixed(1) : '5.0'}
            </span>
            <div className="flex items-center justify-center sm:justify-start gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.round(averageRating || 5)
                      ? 'fill-[#C88E2D] text-[#C88E2D]'
                      : 'fill-forest/10 text-forest/20'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-ink-muted mt-1 font-medium">
              Based on {reviewCount} verified {reviewCount === 1 ? 'review' : 'reviews'}
            </p>
          </div>

          <div className="hidden sm:block border-l border-forest/15 h-16" />

          <div className="hidden sm:block text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-forest">
              <ShieldCheck className="w-4 h-4 text-forest" />
              <span>100% Authentic Customer Feedback</span>
            </div>
            <p className="text-ink-muted text-[11px]">
              Reviews are restricted exclusively to customers with verified completed orders.
            </p>
          </div>
        </div>

        {/* Write Review Action or Status */}
        <div>
          {hasReviewed ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-forest/10 text-forest border border-forest/20 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-forest" /> You reviewed this
            </span>
          ) : canReview ? (
            <Button
              variant="accent"
              size="sm"
              onClick={() => setShowReviewModal(true)}
              className="text-xs font-bold flex items-center gap-1.5"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>Write a Review</span>
            </Button>
          ) : null}
        </div>
      </div>

      {/* Star Filter Pills */}
      {reviews.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-ink-muted font-medium flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          <button
            type="button"
            onClick={() => setSelectedStarFilter('')}
            className={`px-3 py-1 rounded-md font-semibold border transition-colors cursor-pointer ${
              !selectedStarFilter
                ? 'bg-forest text-white border-forest'
                : 'bg-oat-card text-forest border-forest/20 hover:border-forest/40'
            }`}
          >
            All ({reviews.length})
          </button>
          {[5, 4, 3, 2, 1].map((s) => {
            const count = reviews.filter((r) => r.rating === s).length;
            if (count === 0) return null;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setSelectedStarFilter(String(s))}
                className={`px-3 py-1 rounded-md font-semibold border transition-colors cursor-pointer flex items-center gap-1 ${
                  selectedStarFilter === String(s)
                    ? 'bg-forest text-white border-forest'
                    : 'bg-oat-card text-forest border-forest/20 hover:border-forest/40'
                }`}
              >
                <span>{s}★</span>
                <span className="text-[10px] opacity-75">({count})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Review Cards Grid / List */}
      {filteredReviews.length === 0 ? (
        <div className="p-8 rounded-lg bg-oat-card border border-forest/15 text-center text-xs text-ink-muted">
          No reviews found matching the selected star filter.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((rev) => (
            <ReviewCard key={rev._id} review={rev} />
          ))}
        </div>
      )}

      {/* Review Submission Modal */}
      {showReviewModal && (
        <Modal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          title="Write a Verified Review"
        >
          <ReviewForm
            targetTitle={targetTitle}
            onSubmit={handleFormSubmit}
            onCancel={() => setShowReviewModal(false)}
            isLoading={isSubmitting}
          />
        </Modal>
      )}
    </div>
  );
};

export default ReviewList;
