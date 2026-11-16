import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, ArrowRight, Store, AlertTriangle } from 'lucide-react';
import Button from '../common/Button';

const CartSummary = ({
  subtotal = 0,
  shipping = 0,
  tax = 0,
  grandTotal = 0,
  sellerCount = 1,
  itemCount = 1,
  hasOutOfStock = false,
  onProceed,
  isProceedDisabled = false,
  className = '',
}) => {
  return (
    <div className={`bg-oat-card rounded-lg border border-forest/15 p-6 sm:p-7 shadow-2xs space-y-6 ${className}`}>
      {/* Header */}
      <div className="pb-4 border-b border-forest/15">
        <h3 className="text-lg font-bold font-display text-forest">Order Summary</h3>
        <p className="text-xs text-ink-muted mt-0.5">
          {itemCount} {itemCount === 1 ? 'item' : 'items'} across{' '}
          <strong className="text-forest">{sellerCount}</strong> {sellerCount === 1 ? 'seller' : 'sellers'}
        </p>
      </div>

      {/* Out of Stock Warning */}
      {hasOutOfStock && (
        <div className="p-3.5 rounded-md bg-tomato/10 border border-tomato/20 text-xs text-tomato flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            Some items in your cart are currently out of stock. Please adjust quantities before checkout.
          </span>
        </div>
      )}

      {/* Price Breakdown */}
      <div className="space-y-3 text-xs">
        <div className="flex justify-between items-center text-ink">
          <span className="text-ink-muted">Items Subtotal</span>
          <span className="font-semibold text-forest">₹{subtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between items-center text-ink">
          <span className="text-ink-muted flex items-center gap-1">
            <span>Orchard Dispatch Shipping</span>
            {shipping === 0 && (
              <span className="text-[10px] font-bold text-forest bg-forest/10 px-1.5 py-0.5 rounded-md border border-forest/20">
                FREE
              </span>
            )}
          </span>
          <span className="font-semibold text-forest">
            {shipping === 0 ? '₹0.00' : `₹${shipping.toFixed(2)}`}
          </span>
        </div>

        <div className="flex justify-between items-center text-ink">
          <span className="text-ink-muted">Standard GST (5%)</span>
          <span className="font-semibold text-forest">₹{tax.toFixed(2)}</span>
        </div>

        <div className="pt-4 border-t border-forest/15 flex justify-between items-baseline">
          <div>
            <span className="font-bold font-display text-sm sm:text-base text-forest">Total Amount</span>
            <p className="text-[10px] text-ink-subtle">Inclusive of all seller dispatch fees</p>
          </div>
          <span className="text-xl sm:text-2xl font-bold font-display text-forest tracking-tight">
            ₹{grandTotal.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Proceed Button */}
      <div className="pt-2">
        {onProceed ? (
          <Button
            variant="primary"
            size="lg"
            onClick={onProceed}
            disabled={hasOutOfStock || isProceedDisabled || itemCount === 0}
            className="w-full font-bold flex items-center justify-center gap-2"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Link to="/checkout" className="block">
            <Button
              variant="primary"
              size="lg"
              disabled={hasOutOfStock || isProceedDisabled || itemCount === 0}
              className="w-full font-bold flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        )}
      </div>

      {/* Security Assurance Badges */}
      <div className="pt-4 border-t border-forest/15 space-y-2 text-[11px] text-ink-muted">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-forest" />
          <span>FSSAI Certified Direct Orchard Sourcing</span>
        </div>
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-forest" />
          <span>Multi-vendor dispatch tracked independently</span>
        </div>
      </div>
    </div>
  );
};

export default CartSummary;
