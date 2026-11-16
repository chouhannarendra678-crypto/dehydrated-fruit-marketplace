import React from 'react';
import { ShieldCheck, Receipt } from 'lucide-react';

const PriceBreakdown = ({
  summary = {},
  sellerCount = 1,
  className = '',
}) => {
  const {
    subtotal = 0,
    totalShipping = 0,
    tax = 0,
    discount = 0,
    grandTotal = 0,
    totalItems = 0,
  } = summary;

  return (
    <div className={`bg-oat-card rounded-lg border border-forest/15 p-6 sm:p-7 shadow-2xs space-y-6 ${className}`}>
      <div className="pb-4 border-b border-forest/15 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold font-display text-forest flex items-center gap-2">
            <Receipt className="w-4 h-4 text-forest" />
            <span>Price Breakdown</span>
          </h3>
          <p className="text-[11px] text-ink-muted mt-0.5">
            Verified by server against real-time stock and prices
          </p>
        </div>
        <span className="text-xs font-bold text-forest bg-forest/10 px-2.5 py-1 rounded-md border border-forest/20">
          {totalItems} {totalItems === 1 ? 'Item' : 'Items'}
        </span>
      </div>

      <div className="space-y-3 text-xs">
        <div className="flex justify-between items-center text-ink">
          <span className="text-ink-muted">Items Subtotal</span>
          <span className="font-semibold text-forest">₹{subtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between items-center text-ink">
          <div className="space-y-0.5">
            <span className="text-ink-muted block">Orchard Shipping Total</span>
            <span className="text-[10px] text-ink-subtle">({sellerCount} regional {sellerCount === 1 ? 'dispatch' : 'dispatches'})</span>
          </div>
          <span className="font-semibold text-forest">
            {totalShipping === 0 ? (
              <span className="text-forest font-bold">FREE</span>
            ) : (
              `₹${totalShipping.toFixed(2)}`
            )}
          </span>
        </div>

        <div className="flex justify-between items-center text-ink">
          <span className="text-ink-muted">GST Tax (5%)</span>
          <span className="font-semibold text-forest">₹{tax.toFixed(2)}</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between items-center text-tomato font-semibold">
            <span>Special Promotional Discount</span>
            <span>-₹{discount.toFixed(2)}</span>
          </div>
        )}

        <div className="pt-4 border-t border-forest/15 flex justify-between items-baseline">
          <div>
            <span className="font-bold font-display text-sm sm:text-base text-forest">Grand Total</span>
            <p className="text-[10px] text-ink-subtle">Final payable amount</p>
          </div>
          <span className="text-2xl font-bold font-display text-forest tracking-tight">
            ₹{grandTotal.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="p-3 rounded-md bg-oat border border-forest/15 text-[11px] text-forest flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-forest shrink-0" />
        <span>Prices and taxes locked. No hidden charges during checkout.</span>
      </div>
    </div>
  );
};

export default PriceBreakdown;
