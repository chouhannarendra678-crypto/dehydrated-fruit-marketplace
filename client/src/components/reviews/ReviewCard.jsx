import React from 'react';
import { Star, ShieldCheck, CornerDownRight, User } from 'lucide-react';

const ReviewCard = ({ review }) => {
  const {
    customer,
    rating = 5,
    title,
    comment,
    isVerifiedPurchase = true,
    createdAt,
    sellerReply,
  } = review;

  return (
    <div className="p-5 sm:p-6 rounded-lg bg-oat-card border border-forest/15 shadow-2xs space-y-3">
      {/* Review Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-forest text-oat flex items-center justify-center font-bold text-xs shrink-0 font-display">
            {customer?.avatar?.url ? (
              <img src={customer.avatar.url} alt={customer.name} className="w-full h-full rounded-md object-cover" />
            ) : customer?.name ? (
              customer.name.charAt(0).toUpperCase()
            ) : (
              <User className="w-4 h-4" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs sm:text-sm text-forest">
                {customer?.name || 'Verified Customer'}
              </span>
              {isVerifiedPurchase && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-md bg-forest/10 text-forest border border-forest/20">
                  <ShieldCheck className="w-3 h-3 text-forest" /> Verified Buyer
                </span>
              )}
            </div>
            <span className="text-[11px] text-ink-subtle">
              {new Date(createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>

        {/* Stars */}
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-3.5 h-3.5 ${
                star <= rating
                  ? 'fill-[#C88E2D] text-[#C88E2D]'
                  : 'fill-forest/10 text-forest/20'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Title & Comment */}
      <div className="space-y-1">
        {title && (
          <h4 className="font-bold text-xs sm:text-sm text-forest font-display">
            {title}
          </h4>
        )}
        <p className="text-xs sm:text-sm text-ink-muted leading-relaxed whitespace-pre-line">
          {comment}
        </p>
      </div>

      {/* Seller Reply if present */}
      {sellerReply?.comment && (
        <div className="mt-3 p-3.5 rounded-md bg-oat border border-forest/15 space-y-1 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-forest text-[11px]">
            <CornerDownRight className="w-3.5 h-3.5" />
            <span>Response from Seller:</span>
          </div>
          <p className="text-ink text-xs leading-relaxed">
            {sellerReply.comment}
          </p>
        </div>
      )}
    </div>
  );
};

export default ReviewCard;
