import React from 'react';
import { Link } from 'react-router-dom';
import { Store, ShieldCheck, Truck } from 'lucide-react';
import CartItem from './CartItem';

const SellerCartGroup = ({
  group,
  onUpdateQuantity,
  onRemove,
  isUpdating = false,
}) => {
  const {
    sellerName,
    sellerSlug,
    isVerified,
    city,
    state,
    items = [],
    subtotal = 0,
    shippingFee = 0,
  } = group;

  const FREE_SHIPPING_LIMIT = 500;
  const isFreeShipping = subtotal >= FREE_SHIPPING_LIMIT;
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_LIMIT - subtotal);

  return (
    <div className="bg-oat-card rounded-lg border border-forest/15 shadow-2xs overflow-hidden">
      {/* Seller Header */}
      <div className="p-4 sm:p-5 bg-oat border-b border-forest/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-forest text-oat flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs font-display">
            <Store className="w-5 h-5 text-oat" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Link
                to={sellerSlug ? `/sellers/${sellerSlug}` : '#'}
                className="font-bold text-sm sm:text-base font-display text-forest hover:underline transition-colors"
              >
                {sellerName || 'Verified Fruit Producer'}
              </Link>
              {isVerified && (
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-forest/10 text-forest text-[10px] font-bold border border-forest/20">
                  <ShieldCheck className="w-3 h-3" /> FSSAI
                </span>
              )}
            </div>
            {(city || state) && (
              <p className="text-[11px] text-ink-muted">
                Fulfilling from {city}{city && state ? ', ' : ''}{state}
              </p>
            )}
          </div>
        </div>

        {/* Shipping Tier Indicator for this Seller */}
        <div className="text-left sm:text-right">
          {isFreeShipping ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-forest/10 text-forest border border-forest/20 text-xs font-bold">
              <Truck className="w-3.5 h-3.5" /> Free Dispatch
            </span>
          ) : (
            <div className="text-xs">
              <span className="text-ink-muted">Shipping: </span>
              <span className="font-bold text-forest">₹{shippingFee || 50}</span>
              <p className="text-[10px] text-forest font-medium mt-0.5">
                Add ₹{amountToFreeShipping.toFixed(0)} more for Free Shipping
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Item List for this Seller */}
      <div className="divide-y divide-forest/10">
        {items.map((item) => (
          <CartItem
            key={`${item.productId}-${item.variantId}`}
            item={item}
            onUpdateQuantity={onUpdateQuantity}
            onRemove={onRemove}
            isUpdating={isUpdating}
          />
        ))}
      </div>

      {/* Seller Subtotal Footer */}
      <div className="p-4 sm:p-5 bg-oat/50 border-t border-forest/15 flex items-center justify-between text-xs">
        <span className="font-semibold text-ink-muted">
          Subtotal from {sellerName} ({items.length} {items.length === 1 ? 'batch' : 'batches'}):
        </span>
        <span className="font-bold font-display text-sm text-forest">
          ₹{subtotal.toFixed(2)}
        </span>
      </div>
    </div>
  );
};

export default SellerCartGroup;
