import React, { useState } from 'react';
import {
  Package,
  Search,
} from 'lucide-react';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import {
  useGetSellerOrdersQuery,
  useUpdateSellerOrderStatusMutation,
} from '../../services/orderApi';

const STATUS_OPTIONS = [
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
];

const STATUS_BADGES = {
  CONFIRMED: 'bg-forest/10 text-forest border-forest/20',
  PROCESSING: 'bg-[#C88E2D]/10 text-[#C88E2D] border-[#C88E2D]/20',
  SHIPPED: 'bg-forest text-white border-forest',
  OUT_FOR_DELIVERY: 'bg-forest/20 text-forest border-forest/30',
  DELIVERED: 'bg-forest text-white border-forest',
  CANCELLED: 'bg-tomato/10 text-tomato border-tomato/20',
};

const SellerOrdersPage = () => {
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useGetSellerOrdersQuery({
    page,
    limit: 10,
    status: statusFilter || undefined,
    search: searchTerm || undefined,
  });

  const [updateStatus, { isLoading: isUpdating }] = useUpdateSellerOrderStatusMutation();

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('PROCESSING');
  const [courier, setCourier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [statusNote, setStatusNote] = useState('');

  const orders = data?.data?.orders || [];
  const pagination = data?.data?.pagination || { page: 1, totalPages: 1, total: 0 };

  const handleOpenStatusModal = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.orderStatus);
    setCourier(order.trackingInfo?.courier || '');
    setTrackingNumber(order.trackingInfo?.trackingNumber || '');
    setStatusNote('');
    setShowStatusModal(true);
  };

  const handleUpdateStatusSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      await updateStatus({
        id: selectedOrder._id,
        status: newStatus,
        courier: newStatus === 'SHIPPED' ? courier : undefined,
        trackingNumber: newStatus === 'SHIPPED' ? trackingNumber : undefined,
        note: statusNote,
      }).unwrap();

      setShowStatusModal(false);
      setSelectedOrder(null);
    } catch (err) {
      alert(err?.data?.message || err?.message || 'Failed to update order status');
    }
  };

  if (isLoading) {
    return <Loader message="Loading vendor orders..." />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="pb-4 border-b border-forest/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-forest">Vendor Orders</h1>
          <p className="text-xs text-ink-muted mt-1">
            Fulfill orders assigned specifically to your orchard facility.
          </p>
        </div>

        {/* Filter & Search */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search order #..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-md border border-forest/20 text-xs bg-oat-card text-ink focus:outline-none focus:ring-1 focus:ring-forest"
            />
            <Search className="w-3.5 h-3.5 text-forest/60 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-md border border-forest/20 text-xs bg-oat-card font-medium text-forest cursor-pointer focus:outline-none focus:ring-1 focus:ring-forest"
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No Vendor Orders Found"
          description="Incoming orders for your dehydrated fruits will appear here for packaging and fulfillment."
        />
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-lg border border-forest/15 bg-oat-card shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-oat border-b border-forest/15 text-forest font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Sub-Order #</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Batches</th>
                  <th className="py-3.5 px-4">Net Subtotal</th>
                  <th className="py-3.5 px-4">Vendor Earnings</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forest/10">
                {orders.map((order) => {
                  const customer = order.customer || {};
                  const addr = order.shippingAddress || {};

                  return (
                    <tr key={order._id} className="hover:bg-oat/40 transition-colors">
                      <td className="py-4 px-4 font-mono font-bold text-forest">
                        {order.sellerOrderNumber}
                        <span className="block text-[10px] text-ink-subtle font-sans font-normal mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <p className="font-bold text-forest">{addr.fullName || customer.name}</p>
                        <p className="text-[11px] text-ink-muted">{addr.city}, {addr.state}</p>
                      </td>

                      <td className="py-4 px-4">
                        <span className="font-semibold text-ink">
                          {order.items?.length || 0} items
                        </span>
                        <p className="text-[10px] text-ink-muted line-clamp-1 max-w-[150px]">
                          {order.items?.map((i) => i.productName).join(', ')}
                        </p>
                      </td>

                      <td className="py-4 px-4 font-bold font-display text-forest">
                        ₹{order.subtotal?.toFixed(2)}
                      </td>

                      <td className="py-4 px-4">
                        <span className="font-bold font-display text-forest">
                          ₹{order.sellerEarnings?.toFixed(2)}
                        </span>
                        <span className="block text-[10px] text-ink-subtle">
                          (Comm: ₹{order.commissionAmount})
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md border ${
                            STATUS_BADGES[order.orderStatus] || 'bg-oat text-forest'
                          }`}
                        >
                          {order.orderStatus}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenStatusModal(order)}
                          className="text-xs font-bold"
                        >
                          Update Status
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

      {/* Fulfillment Status Modal */}
      {showStatusModal && selectedOrder && (
        <Modal
          isOpen={showStatusModal}
          onClose={() => setShowStatusModal(false)}
          title={`Update Fulfillment: ${selectedOrder.sellerOrderNumber}`}
        >
          <form onSubmit={handleUpdateStatusSubmit} className="space-y-4">
            <div className="p-3.5 rounded-md bg-oat border border-forest/15 text-xs text-ink space-y-1">
              <p><strong>Customer:</strong> {selectedOrder.shippingAddress?.fullName} ({selectedOrder.shippingAddress?.city})</p>
              <p><strong>Total Amount:</strong> ₹{selectedOrder.totalAmount?.toFixed(2)}</p>
              <p className="text-[11px] text-ink-muted">
                Note: Sellers can only update fulfillment milestones. Payment status is supervised centrally.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-forest block">
                Fulfillment Status <span className="text-tomato">*</span>
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-md border border-forest/20 bg-oat-light/60 text-xs font-medium text-ink focus:outline-none focus:ring-1 focus:ring-forest cursor-pointer"
              >
                {STATUS_OPTIONS.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {newStatus === 'SHIPPED' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <Input
                  label="Courier Partner"
                  placeholder="e.g. BlueDart, Delhivery"
                  value={courier}
                  onChange={(e) => setCourier(e.target.value)}
                  required
                />
                <Input
                  label="Tracking Number / AWB"
                  placeholder="e.g. BD123456789IN"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  required
                />
              </div>
            )}

            <Input
              label="Dispatch Note (Optional)"
              placeholder="e.g. Packed in moisture-proof vacuum pouch"
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
            />

            <div className="flex justify-end gap-3 pt-3 border-t border-forest/15">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowStatusModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={isUpdating}
                className="font-bold"
              >
                {isUpdating ? 'Saving...' : 'Save Fulfillment'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default SellerOrdersPage;