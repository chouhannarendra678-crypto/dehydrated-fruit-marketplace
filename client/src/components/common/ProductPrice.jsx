import React from 'react';

/**
 * Standardized INR price display with optional MRP strikethrough & Tomato Red savings pill
 */
const ProductPrice = ({ price = 0, mrp = null, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'text-xs sm:text-sm font-semibold',
    md: 'text-sm sm:text-base font-bold',
    lg: 'text-xl sm:text-2xl font-bold font-display',
  };

  const formattedPrice = `₹${Number(price).toLocaleString('en-IN')}`;
  const hasDiscount = mrp && Number(mrp) > Number(price);
  const formattedMrp = hasDiscount ? `₹${Number(mrp).toLocaleString('en-IN')}` : null;
  const discountPercent = hasDiscount ? Math.round(((Number(mrp) - Number(price)) / Number(mrp)) * 100) : 0;

  return (
    <div className={`flex items-baseline gap-2 ${className}`}>
      <span className={`${sizeClasses[size]} text-forest tracking-tight`}>
        {formattedPrice}
      </span>
      {formattedMrp && (
        <span className="text-xs text-ink-muted/70 line-through font-normal">
          {formattedMrp}
        </span>
      )}
      {discountPercent > 0 && (
        <span className="text-[10px] font-bold text-tomato px-1.5 py-0.5 rounded-sm bg-tomato/10">
          -{discountPercent}%
        </span>
      )}
    </div>
  );
};

export default ProductPrice;
