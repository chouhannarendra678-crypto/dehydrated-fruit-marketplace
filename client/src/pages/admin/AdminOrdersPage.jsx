import React, { useState } from 'react';
import {
  Package,
  Search,
  Store,
  CreditCard,
  Eye,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import {
  useGetAdminOrdersQuery,
  useAdminUpdateOrderStatusMutation,
} from '../../services/orderApi';

const STATUS_BADGES = {
  CONFIRMED: 'bg-forest/15 text-forest border-forest/25',
  PROCESSING: 'bg-amber-100 text-amber-900 border-amber-200',
  SHIPPED: 'bg-forest/20 text-forest border-forest/30',
  OUT_FOR_DELIVERY: 'bg-forest/10 text-forest border-forest/20',
  DELIVERED: 'bg-forest/10 text-forest border-forest/20',
  CANCELLED: 'bg-tomato/10 text-tomato border-tomato/20',
};

const AdminOrdersPage = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useGetAdminOrdersQuery({
    page,
    limit: 15,
    status: statusFilter || undefined,
    paymentStatus: paymentFilter || undefined,
    search: search || undefined,
  });

  const [updateOrderStatus, { isLoading: isUpdating }] = useAdminUpdateOrderStatusMutation();

  const [inspectOrder, setInspectOrder] = useState(null);

  const orders = data?.data?.orders || [];
  const pagination = data?.data?.pagination || { page: 1, totalPages: 1, total: 0 };

  const handleAdminStatusChange = async (orderId, newStatus) => {
    if (window.confirm(`Are you sure you want to change order status to ${newStatus}?`)) {
      try {
        await updateOrderStatus({ id: orderId, orderStatus: newStatus }).unwrap();
        if (inspectOrder?._id === orderId) {
          setInspectOrder((prev) => ({ ...prev, orderStatus: newStatus }));
        }
      } catch (err) {
        alert(err?.data?.message || err?.message || 'Failed to update order status');
      }
    }
  };

  if (isLoading) {
    return <Loader message="Loading marketplace orders..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-forest/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-forest">Marketplace Orders Super-Admin</h1>
          <p className="text-xs text-ink/70 mt-1">
            Supervise all customer Master Orders and underlying orchard SellerOrders.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by order #..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg border border-forest/20 text-xs bg-oat-card text-ink focus:outline-none focus:ring-1 focus:ring-forest"
            />
            <Search className="w-3.5 h-3.5 text-ink/40 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-forest/20 text-xs bg-oat-card font-medium text-forest cursor-pointer focus:outline-none focus:ring-1 focus:ring-forest"
          >
            <option value="">All Fulfillment Statuses</option>
            {['CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-forest/20 text-xs bg-oat-card font-medium text-forest cursor-pointer focus:outline-none focus:ring-1 focus:ring-forest"
          >
            <option value="">All Payments</option>
            {['PENDING', 'PAID', 'FAILED', 'REFUNDED'].map((pt) => (
              <option key={pt} value={pt}>
                {pt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No Marketplace Orders Found"
          description="Orders placed across any regional fruit sellers will be indexed here."
        />
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-forest/15 bg-oat-card shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-forest/5 border-b border-forest/15 text-forest/80 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Master Order #</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Vendors Involved</th>
                  <th className="py-3.5 px-4">Grand Total</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Order Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forest/10">
                {orders.map((order) => {
                  const customer = order.customer || {};
                  const addr = order.shippingAddress || {};
                  const sellers = order.sellers || [];

                  return (
                    <tr key={order._id} className="hover:bg-forest/[0.02] transition-colors">
                      <td className="py-4 px-4 font-mono font-bold text-forest">
                        {order.orderNumber}
                        <span className="block text-[10px] text-ink/60 font-sans font-normal mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <p className="font-semibold text-forest">{addr.fullName || customer.name}</p>
                        <p className="text-[11px] text-ink/60">{customer.email}</p>
                      </td>

                      <td className="py-4 px-4">
                        <span className="font-semibold text-forest">
                          {sellers.length} {sellers.length === 1 ? 'Vendor' : 'Vendors'}
                        </span>
                        <p className="text-[10px] text-ink/60 line-clamp-1 max-w-[150px]">
                          {sellers.map((s) => s.storeName).join(', ')}
                        </p>
                      </td>

                      <td className="py-4 px-4 font-bold text-forest text-sm">
                        ₹{order.grandTotal.toFixed(2)}
                      </td>

                      <td className="py-4 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          order.paymentStatus === 'PAID'
                            ? 'bg-forest/10 text-forest border-forest/20'
                            : 'bg-amber-100 text-amber-900 border-amber-200'
                        }`}>
                          {order.paymentMethod} • {order.paymentStatus}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                            STATUS_BADGES[order.orderStatus] || 'bg-oat text-ink/75 border-forest/10'
                          }`}
                        >
                          {order.orderStatus}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setInspectOrder(order)}
                          className="text-xs font-semibold text-forest hover:bg-forest/10"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          Inspect
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex justify-center pt-2">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      )}

      {/* Admin Order Inspection Modal */}
      {inspectOrder && (
        <Modal
          isOpen={Boolean(inspectOrder)}
          onClose={() => setInspectOrder(null)}
          title={`Order Supervision: #${inspectOrder.orderNumber}`}
        >
          <div className="space-y-5 text-xs max-h-[75vh] overflow-y-auto pr-1">
            {/* Status & Quick Change */}
            <div className="p-4 rounded-xl bg-oat border border-forest/15 flex items-center justify-between">
              <div>
                <span className="text-ink/60 block text-[11px]">Current Status</span>
                <span className={`inline-block mt-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                  STATUS_BADGES[inspectOrder.orderStatus] || 'bg-oat text-ink/75 border-forest/10'
                }`}>
                  {inspectOrder.orderStatus}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-ink/70">Override:</span>
                <select
                  value={inspectOrder.orderStatus}
                  onChange={(e) => handleAdminStatusChange(inspectOrder._id, e.target.value)}
                  className="px-2 py-1 rounded-lg border border-forest/20 bg-oat-card font-medium text-forest cursor-pointer focus:outline-none focus:ring-1 focus:ring-forest"
                >
                  {['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Customer & Address */}
            <div className="space-y-1.5">
              <h4 className="font-display font-bold text-forest uppercase tracking-wider text-[11px]">
                Customer & Shipping
              </h4>
              <div className="p-3 rounded-lg bg-oat-card border border-forest/15">
                <p className="font-bold text-forest">{inspectOrder.shippingAddress?.fullName}</p>
                <p className="text-ink/70">{inspectOrder.shippingAddress?.street}, {inspectOrder.shippingAddress?.city}, {inspectOrder.shippingAddress?.state} - {inspectOrder.shippingAddress?.postalCode}</p>
                <p className="text-ink/70 mt-1">Phone: {inspectOrder.shippingAddress?.phone}</p>
              </div>
            </div>

            {/* Line Items & Vendors */}
            <div className="space-y-1.5">
              <h4 className="font-display font-bold text-forest uppercase tracking-wider text-[11px]">
                Items Across Vendors ({inspectOrder.items?.length})
              </h4>
              <div className="divide-y divide-forest/10 rounded-lg border border-forest/15 bg-oat-card overflow-hidden">
                {inspectOrder.items?.map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-forest">{item.productName}</p>
                      <p className="text-ink/65 text-[10px]">
                        {item.weight} • Qty: {item.quantity} • Orchard: <strong className="text-forest font-semibold">{item.sellerName}</strong>
                      </p>
                    </div>
                    <span className="font-bold text-forest">₹{item.itemTotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="p-4 rounded-xl bg-forest/5 border border-forest/15 space-y-1.5">
              <div className="flex justify-between text-ink/75">
                <span>Items Subtotal:</span>
                <span className="font-bold text-forest">₹{inspectOrder.subtotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-ink/75">
                <span>Total Shipping:</span>
                <span className="font-bold text-forest">₹{inspectOrder.totalShipping?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-ink/75">
                <span>GST (5%):</span>
                <span className="font-bold text-forest">₹{inspectOrder.tax?.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-forest/15 flex justify-between font-bold text-sm text-forest">
                <span>Grand Total:</span>
                <span>₹{inspectOrder.grandTotal?.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminOrdersPage;