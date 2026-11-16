import React from 'react';
import { Store, ShieldCheck, Truck, Package } from 'lucide-react';

const OrderSummary = ({ sellerGroups = [] }) => {
  if (!sellerGroups || sellerGroups.length === 0) {
    return (
      <div className="p-6 rounded-lg bg-oat-card border border-forest/15 text-center text-xs text-ink-muted">
        No items in checkout order.
      </div>
    );
  }

  return (
    <div className="bg-oat-card rounded-lg border border-forest/15 shadow-2xs p-6 sm:p-7 space-y-6">
      <div className="pb-3 border-b border-forest/15 flex items-center justify-between">
        <h3 className="text-base font-bold font-display text-forest flex items-center gap-2">
          <Package className="w-4 h-4 text-forest" />
          <span>Review Items by Orchard ({sellerGroups.length} {sellerGroups.length === 1 ? 'Seller' : 'Sellers'})</span>
        </h3>
        <span className="text-xs font-semibold text-ink-muted">
          Multi-Vendor Unified Batch
        </span>
      </div>

      <div className="space-y-6">
        {sellerGroups.map((group) => {
          const seller = group.seller || {};
          const items = group.items || [];
          const isFreeShipping = group.shippingFee === 0;

          return (
            <div
              key={seller._id || group.sellerId}
              className="rounded-lg border border-forest/15 overflow-hidden bg-oat/40"
            >
              {/* Seller Subheader */}
              <div className="p-3.5 bg-oat border-b border-forest/15 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Store className="w-3.5 h-3.5 text-forest" />
                  <span className="font-bold font-display text-forest">{seller.storeName || group.sellerName}</span>
                  {seller.isVerified && (
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-forest/10 text-forest text-[9px] font-bold border border-forest/20">
                      <ShieldCheck className="w-2.5 h-2.5" /> FSSAI
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-[11px]">
                  <Truck className="w-3 h-3 text-ink-muted" />
                  <span className={isFreeShipping ? 'font-bold text-forest' : 'text-ink-muted'}>
                    {isFreeShipping ? 'Free Dispatch' : `Shipping: ₹${group.shippingFee}`}
                  </span>
                </div>
              </div>

              {/* Items in this Seller's Order */}
              <div className="p-3.5 space-y-3">
                {items.map((item, idx) => {
                  const product = item.product || {};
                  const variant = item.variant || {};
                  const imgUrl = product.images?.[0]?.url || item.image;

                  return (
                    <div
                      key={item._id || `${item.productId}-${idx}`}
                      className="flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-md bg-oat border border-forest/15 overflow-hidden shrink-0">
                          {imgUrl ? (
                            <img src={imgUrl} alt={product.name || item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-ink-subtle">
                              DF
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold font-display text-forest truncate">{product.name || item.name}</p>
                          <p className="text-[11px] text-ink-muted">
                            Weight: <span className="font-medium text-forest">{variant.weight || item.weight}</span> • Qty: {item.quantity}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="font-bold font-display text-forest">
                          ₹{(item.itemTotal || (item.unitPrice || item.price) * item.quantity).toFixed(2)}
                        </p>
                        <p className="text-[10px] text-ink-subtle">
                          ₹{item.unitPrice || item.price} each
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Seller Subtotal */}
              <div className="px-3.5 py-2 bg-oat-card border-t border-forest/15 flex items-center justify-between text-xs text-ink-muted">
                <span>Direct Dispatch Subtotal:</span>
                <span className="font-bold font-display text-forest">
                  ₹{(group.subtotal || 0).toFixed(2)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderSummary;
