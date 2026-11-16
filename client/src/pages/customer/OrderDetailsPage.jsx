import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Store,
  MapPin,
  CreditCard,
  Truck,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import { useGetCustomerOrderByIdQuery, useCancelCustomerOrderMutation } from '../../services/orderApi';

const STATUS_BADGES = {
  CONFIRMED: 'bg-forest/10 text-forest border-forest/20',
  PROCESSING: 'bg-[#C88E2D]/10 text-[#C88E2D] border-[#C88E2D]/20',
  SHIPPED: 'bg-forest text-white border-forest',
  OUT_FOR_DELIVERY: 'bg-forest/20 text-forest border-forest/30',
  DELIVERED: 'bg-forest text-white border-forest',
  CANCELLED: 'bg-tomato/10 text-tomato border-tomato/20',
};

const OrderDetailsPage = () => {
  const { id } = useParams();
  const { data, isLoading, error } = useGetCustomerOrderByIdQuery(id);
  const [cancelOrder, { isLoading: isCancelling }] = useCancelCustomerOrderMutation();

  const order = data?.data?.order;

  const handleCancel = async () => {
    const reason = window.prompt('Please provide a reason for cancelling this order:');
    if (reason !== null) {
      try {
        await cancelOrder({ id: order._id, reason }).unwrap();
        alert('Order has been cancelled successfully and product inventory restored.');
      } catch (err) {
        alert(err?.data?.message || err?.message || 'Failed to cancel order');
      }
    }
  };

  if (isLoading) {
    return <Loader message="Loading order details..." />;
  }

  if (error || !order) {
    return (
      <EmptyState
        title="Order Not Found"
        description="We could not find the requested order in your customer account."
        actionLabel="Back to My Orders"
        onAction={() => (window.location.href = '/orders')}
      />
    );
  }

  const shippingAddress = order.shippingAddress || {};
  const sellerOrders = order.sellerOrders || [];
  const canCancel = order.orderStatus === 'CONFIRMED' || order.orderStatus === 'PROCESSING';

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-forest/15">
        <div className="flex items-center gap-3">
          <Link
            to="/orders"
            className="p-2 rounded-md border border-forest/20 text-forest hover:bg-oat-dark/30 transition-colors"
            title="Back to Orders"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold font-display text-forest tracking-tight">
                Master Order #{order.orderNumber}
              </h1>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md border ${
                  STATUS_BADGES[order.orderStatus] || 'bg-oat text-forest'
                }`}
              >
                {order.orderStatus}
              </span>
            </div>
            <p className="text-xs text-ink-muted mt-0.5">
              Placed on {new Date(order.createdAt).toLocaleString('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </p>
          </div>
        </div>

        {canCancel && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            disabled={isCancelling}
            className="text-xs font-semibold text-tomato hover:bg-tomato/10 border-tomato/30 self-start sm:self-center"
          >
            Cancel Entire Order
          </Button>
        )}
      </div>

      {/* Grid: Delivery Address & Payment Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shipping Address */}
        <div className="bg-oat-card rounded-lg p-6 border border-forest/15 shadow-2xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-forest flex items-center gap-2">
            <MapPin className="w-4 h-4 text-forest" />
            <span>Delivery Address</span>
          </h3>
          <div className="text-xs space-y-1 text-ink">
            <p className="font-bold font-display text-sm text-forest">{shippingAddress.fullName}</p>
            <p>{shippingAddress.street}{shippingAddress.apartment ? `, ${shippingAddress.apartment}` : ''}</p>
            <p>{shippingAddress.city}, {shippingAddress.state} - {shippingAddress.postalCode}</p>
            <p className="text-ink-muted pt-1">Phone: {shippingAddress.phone}</p>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-oat-card rounded-lg p-6 border border-forest/15 shadow-2xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-forest flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-forest" />
            <span>Payment Details</span>
          </h3>
          <div className="text-xs space-y-1 text-ink">
            <div className="flex justify-between py-1 border-b border-forest/10">
              <span className="text-ink-muted">Payment Method:</span>
              <span className="font-bold text-forest">{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-forest/10">
              <span className="text-ink-muted">Payment Status:</span>
              <span className="font-bold text-forest">{order.paymentStatus}</span>
            </div>
            <div className="flex justify-between py-1 pt-2 font-bold text-sm text-forest">
              <span>Grand Total:</span>
              <span className="font-display font-bold text-base">₹{order.grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Decomposed Vendor Sub-Orders */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold font-display text-forest">
            Independent Vendor Shipments ({sellerOrders.length})
          </h2>
          <p className="text-xs text-ink-muted">
            Each fruit processor packages and dispatches their portion independently.
          </p>
        </div>

        <div className="space-y-6">
          {sellerOrders.map((so) => {
            const seller = so.seller || {};
            const tracking = so.trackingInfo || {};

            return (
              <div
                key={so._id}
                className="bg-oat-card rounded-lg border border-forest/15 shadow-2xs overflow-hidden"
              >
                {/* Vendor Sub-Order Header */}
                <div className="p-5 bg-oat border-b border-forest/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-forest" />
                      <h3 className="font-bold font-display text-sm sm:text-base text-forest">
                        {seller.storeName || 'Verified Orchard Producer'}
                      </h3>
                      {seller.isVerified && (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-forest/10 text-forest text-[10px] font-bold border border-forest/20">
                          <ShieldCheck className="w-3 h-3" /> FSSAI
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-ink-muted mt-0.5">
                      Sub-Order: <span className="font-mono font-medium text-forest">{so.sellerOrderNumber}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-md border ${
                        STATUS_BADGES[so.orderStatus] || 'bg-oat text-forest'
                      }`}
                    >
                      {so.orderStatus}
                    </span>
                    <span className="font-bold font-display text-sm text-forest">
                      ₹{so.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Tracking Bar if Dispatched */}
                {(tracking.trackingNumber || tracking.courier) && (
                  <div className="p-3.5 bg-oat-light border-b border-forest/15 flex items-center justify-between text-xs text-forest">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-forest" />
                      <span>
                        Shipped via <strong>{tracking.courier || 'Express Courier'}</strong>
                        {tracking.trackingNumber && ` • Tracking: ${tracking.trackingNumber}`}
                      </span>
                    </div>
                    {tracking.dispatchedAt && (
                      <span className="text-[11px] text-ink-muted">
                        Dispatched {new Date(tracking.dispatchedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                )}

                {/* Line Items for this Vendor */}
                <div className="p-5 divide-y divide-forest/10">
                  {so.items.map((item, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between text-xs first:pt-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        {item.productImage && (
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="w-12 h-12 rounded-md object-cover border border-forest/15"
                          />
                        )}
                        <div>
                          <p className="font-bold font-display text-forest text-sm">{item.productName}</p>
                          <p className="text-ink-muted text-[11px]">
                            Weight Tier: <span className="font-semibold text-forest">{item.weight}</span> • Qty: {item.quantity}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-bold font-display text-sm text-forest">₹{item.itemTotal.toFixed(2)}</p>
                        <p className="text-[11px] text-ink-subtle">₹{item.unitPrice} each</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Vendor Sub-Order Footer */}
                <div className="p-4 bg-oat/50 border-t border-forest/15 flex items-center justify-between text-xs text-ink-muted">
                  <span>Vendor Subtotal: ₹{so.subtotal.toFixed(2)} • Shipping: {so.shippingFee === 0 ? 'FREE' : `₹${so.shippingFee}`} • GST: ₹{so.tax}</span>
                  <span className="font-bold font-display text-forest">Sub-Order Total: ₹{so.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;