import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Store, Clock, ChevronRight, AlertCircle, CheckCircle2, Truck } from 'lucide-react';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import Pagination from '../../components/common/Pagination';
import { useGetCustomerOrdersQuery, useCancelCustomerOrderMutation } from '../../services/orderApi';

const STATUS_BADGES = {
  CONFIRMED: 'bg-forest/10 text-forest border-forest/20',
  PROCESSING: 'bg-[#C88E2D]/10 text-[#C88E2D] border-[#C88E2D]/20',
  SHIPPED: 'bg-forest text-white border-forest',
  OUT_FOR_DELIVERY: 'bg-forest/20 text-forest border-forest/30',
  DELIVERED: 'bg-forest text-white border-forest',
  CANCELLED: 'bg-tomato/10 text-tomato border-tomato/20',
};

const OrdersPage = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetCustomerOrdersQuery({ page, limit: 10 });
  const [cancelOrder, { isLoading: isCancelling }] = useCancelCustomerOrderMutation();

  const orders = data?.data?.orders || [];
  const pagination = data?.data?.pagination || { page: 1, totalPages: 1, total: 0 };

  const handleCancel = async (orderId) => {
    const reason = window.prompt('Please provide a reason for cancelling this order:');
    if (reason !== null) {
      try {
        await cancelOrder({ id: orderId, reason }).unwrap();
        alert('Order has been cancelled successfully and product inventory restored.');
      } catch (err) {
        alert(err?.data?.message || err?.message || 'Failed to cancel order');
      }
    }
  };

  if (isLoading) {
    return <Loader message="Retrieving your orders..." />;
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No Orders Placed Yet"
        description="When you order dehydrated fruits, your Master Orders and delivery statuses will show here."
        actionLabel="Explore Fruit Catalog"
        onAction={() => (window.location.href = '/explore')}
      />
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-2">
      <div className="pb-4 border-b border-forest/15 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-forest tracking-tight">
            My Orders
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
            Track Master Orders and separate regional vendor packages.
          </p>
        </div>
        <span className="text-xs font-semibold text-forest bg-oat-card border border-forest/15 px-3 py-1 rounded-md self-start sm:self-center">
          {pagination.total} {pagination.total === 1 ? 'Order' : 'Orders'} Total
        </span>
      </div>

      <div className="space-y-6">
        {orders.map((order) => {
          const sellerOrders = order.sellerOrders || [];
          const canCancel = order.orderStatus === 'CONFIRMED' || order.orderStatus === 'PROCESSING';

          return (
            <div
              key={order._id}
              className="bg-oat-card rounded-lg border border-forest/15 shadow-2xs overflow-hidden transition-all"
            >
              {/* Card Header */}
              <div className="p-5 bg-oat border-b border-forest/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold font-display text-sm sm:text-base text-forest">
                      #{order.orderNumber}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md border ${
                        STATUS_BADGES[order.orderStatus] || 'bg-oat text-forest'
                      }`}
                    >
                      {order.orderStatus}
                    </span>
                    <span className="text-[11px] text-ink-muted font-medium">
                      • {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-ink-muted">
                    Total: <strong className="text-forest font-display">₹{order.grandTotal.toFixed(2)}</strong> ({order.totalItems} {order.totalItems === 1 ? 'batch' : 'batches'} across {sellerOrders.length} {sellerOrders.length === 1 ? 'vendor' : 'vendors'})
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  <Link to={`/orders/${order._id}`}>
                    <Button variant="primary" size="sm" className="text-xs font-bold">
                      View Details
                    </Button>
                  </Link>

                  {canCancel && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancel(order._id)}
                      disabled={isCancelling}
                      className="text-xs text-tomato border-tomato/30 hover:bg-tomato/10"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>

              {/* Decomposed Vendor Sub-Orders Summary */}
              <div className="p-5 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-forest">
                  Dispatched From Certified Regional Orchards:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {sellerOrders.map((so) => (
                    <div
                      key={so._id || so.sellerOrderNumber}
                      className="p-3.5 rounded-md bg-oat/50 border border-forest/15 flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-1.5 font-bold text-forest">
                          <Store className="w-3.5 h-3.5" />
                          <span>{so.seller?.storeName || 'Verified Orchard'}</span>
                        </div>
                        <p className="text-[11px] text-ink-muted mt-0.5">
                          Status: <span className="font-semibold text-forest">{so.orderStatus}</span> • {so.items?.length || 0} batches
                        </p>
                      </div>
                      <span className="font-bold font-display text-forest">
                        ₹{so.totalAmount?.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="pt-6 border-t border-forest/15 flex justify-center">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
};

export default OrdersPage;