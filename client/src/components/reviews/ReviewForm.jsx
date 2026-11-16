import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import Input from '../common/Input';
import Button from '../common/Button';

const ReviewForm = ({
  targetTitle = 'Dehydrated Fruit Batch',
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Please provide a comment sharing your feedback');
      return;
    }
    setError('');
    onSubmit({
      rating,
      title: title.trim(),
      comment: comment.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 sm:p-7 rounded-lg bg-oat-card border border-forest/15 shadow-2xs space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-forest/15">
        <div>
          <h3 className="font-bold text-base text-forest font-display">
            Write a Verified Review
          </h3>
          <p className="text-xs text-ink-muted mt-0.5">
            Share your thoughts on {targetTitle}
          </p>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-md text-forest/60 hover:text-forest hover:bg-oat-dark/30 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 rounded-md bg-tomato/10 border border-tomato/20 text-xs font-semibold text-tomato">
          {error}
        </div>
      )}

      {/* Interactive Star Rating */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-forest block">
          Your Rating <span className="text-tomato">*</span>
        </label>
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-1 hover:scale-110 transition-transform cursor-pointer"
              aria-label={`Rate ${star} stars`}
            >
              <Star
                className={`w-6 h-6 sm:w-7 sm:h-7 ${
                  star <= (hoverRating || rating)
                    ? 'fill-[#C88E2D] text-[#C88E2D]'
                    : 'fill-forest/10 text-forest/20'
                }`}
              />
            </button>
          ))}
          <span className="text-xs font-bold text-forest ml-2 font-display">
            {hoverRating || rating} of 5 Stars
          </span>
        </div>
      </div>

      <Input
        label="Review Headline / Title (Optional)"
        placeholder="e.g. Incredibly sweet and tender slices! Zero added sugar."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={120}
      />

      <div className="space-y-1">
        <label className="text-xs font-bold text-forest block">
          Your Detailed Experience <span className="text-tomato">*</span>
        </label>
        <textarea
          rows={4}
          placeholder="How was the fruit texture, moisture balance, packaging, and natural aroma?"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-md border border-forest/20 bg-oat-light/60 text-ink text-sm placeholder:text-ink-subtle focus:outline-none focus:ring-1 focus:ring-forest focus:border-forest leading-relaxed transition-all resize-none"
        />
        <p className="text-[11px] text-ink-subtle">
          Please avoid personal contact info or unrelated delivery remarks.
        </p>
      </div>

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-forest/15">
        {onCancel && (
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" size="sm" loading={isLoading}>
          Publish Review
        </Button>
      </div>
    </form>
  );
};

export default ReviewForm;
