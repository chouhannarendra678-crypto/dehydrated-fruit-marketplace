import React from 'react';
import { Star } from 'lucide-react';

const ProductRating = ({ rating = 0, reviewCount = null, size = 'sm', className = '' }) => {
  const numRating = Number(rating) || 0;
  const starSize = size === 'lg' ? 'w-5 h-5' : size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5';

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div className="flex items-center text-[#C88E2D]">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= Math.round(numRating)
                ? 'fill-[#C88E2D] text-[#C88E2D]'
                : 'text-oat-dark fill-oat-dark/30'
            }`}
          />
        ))}
      </div>
      <span className="text-xs font-bold text-forest">
        {numRating > 0 ? numRating.toFixed(1) : '5.0'}
      </span>
      {reviewCount !== null && (
        <span className="text-[11px] text-ink-muted">
          ({reviewCount})
        </span>
      )}
    </div>
  );
};

export default ProductRating;
