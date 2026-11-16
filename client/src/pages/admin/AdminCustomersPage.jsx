import React, { useState } from 'react';
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  MapPin,
  ShoppingBag,
  Mail,
  Calendar,
  DollarSign,
} from 'lucide-react';
import {
  useGetCustomersQuery,
  useGetCustomerByIdQuery,
} from '../../services/adminApi';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';

const AdminCustomersPage = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);

  const { data, isLoading, error } = useGetCustomersQuery({
    search,
    page,
    limit: 15,
  });

  const {
    data: detailData,
    isLoading: loadingDetails,
  } = useGetCustomerByIdQuery(selectedCustomerId, {
    skip: !selectedCustomerId,
  });

  const customers = data?.data?.customers || [];
  const pagination = data?.data?.pagination || { page: 1, totalPages: 1, total: 0 };
  const customerDetail = detailData?.data?.customer;
  const addresses = detailData?.data?.addresses || [];
  const orders = detailData?.data?.orders || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-forest/15">
        <h1 className="font-display text-2xl font-bold text-forest">Customer Directory</h1>
        <p className="text-xs text-ink/70 mt-1">
          Review buyer accounts, delivery profiles, and lifetime purchase histories.
        </p>
      </div>

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-ink/40 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by customer name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-forest/20 bg-oat-card text-ink focus:outline-none focus:ring-1 focus:ring-forest"
          />
        </div>
        <span className="text-xs font-medium text-ink/70">
          Total Registered Customers: <strong className="text-forest font-bold">{pagination.total || 0}</strong>
        </span>
      </div>

      {/* Customer Directory Table */}
      <div className="bg-oat-card rounded-xl border border-forest/15 overflow-hidden shadow-2xs">
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <Loader text="Loading customer accounts..." />
          </div>
        ) : error ? (
          <div className="p-6 text-center text-tomato text-sm">
            Failed to load customers. Please refresh.
          </div>
        ) : customers.length === 0 ? (
          <div className="py-12">
            <EmptyState
              icon={Users}
              title="No Customers Found"
              description={search ? `No customer matching "${search}".` : 'No customer accounts registered yet.'}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-forest/5 text-xs font-bold text-forest/80 uppercase tracking-wider border-b border-forest/15 text-[11px]">
                <tr>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-4 py-3">Email Address</th>
                  <th className="px-4 py-3">Joined Date</th>
                  <th className="px-4 py-3">Verified</th>
                  <th className="px-4 py-3">Orders</th>
                  <th className="px-4 py-3">Total Spent</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forest/10">
                {customers.map((c) => (
                  <tr key={c._id} className="hover:bg-forest/[0.02] transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-forest">
                      {c.name}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-ink/65">
                      {c.email}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-ink/65">
                      {new Date(c.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${
                          c.isEmailVerified
                            ? 'bg-forest/10 text-forest border-forest/20'
                            : 'bg-amber-100 text-amber-900 border-amber-200'
                        }`}
                      >
                        {c.isEmailVerified ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Verified</span>
                          </>
                        ) : (
                          <span>Pending</span>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-forest text-xs">
                      {c.orderCount || 0} orders
                    </td>
                    <td className="px-4 py-3.5 font-bold text-forest text-xs">
                      ₹{c.totalSpent?.toLocaleString('en-IN') || '0'}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => setSelectedCustomerId(c._id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-forest hover:bg-forest/10 rounded-lg transition-colors border border-forest/15"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Profile</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Profile & Order History Modal */}
      {selectedCustomerId && (
        <Modal
          isOpen={!!selectedCustomerId}
          onClose={() => setSelectedCustomerId(null)}
          title={customerDetail?.name ? `Customer Profile: ${customerDetail.name}` : 'Customer Details'}
        >
          {loadingDetails ? (
            <div className="py-12 flex justify-center">
              <Loader text="Loading customer details and orders..." />
            </div>
          ) : customerDetail ? (
            <div className="space-y-4 pt-2 text-xs">
              {/* Profile Top Stats */}
              <div className="grid grid-cols-2 gap-3 bg-oat p-3 rounded-lg border border-forest/15">
                <div>
                  <span className="text-ink/60 block text-[10px]">Email Address</span>
                  <span className="font-semibold text-forest">{customerDetail.email}</span>
                </div>
                <div>
                  <span className="text-ink/60 block text-[10px]">Total GMV Contributed</span>
                  <span className="font-bold text-forest">
                    ₹{customerDetail.totalSpent?.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Delivery Addresses */}
              <div>
                <h4 className="font-display font-bold text-forest flex items-center gap-1 mb-2 text-xs">
                  <MapPin className="w-3.5 h-3.5 text-forest" />
                  <span>Saved Addresses ({addresses.length})</span>
                </h4>
                {addresses.length === 0 ? (
                  <p className="text-ink/50 italic">No addresses saved yet.</p>
                ) : (
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {addresses.map((a) => (
                      <div
                        key={a._id}
                        className="p-2.5 bg-oat rounded-lg border border-forest/10 flex justify-between items-center"
                      >
                        <div>
                          <strong className="text-forest font-semibold">{a.fullName}</strong> ({a.phone})
                          <p className="text-[11px] text-ink/65 mt-0.5">
                            {a.street}, {a.city}, {a.state} - {a.postalCode}
                          </p>
                        </div>
                        {a.isDefault && (
                          <span className="text-[10px] px-2 py-0.5 bg-forest/10 text-forest font-bold rounded border border-forest/20">
                            Default
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Order History */}
              <div>
                <h4 className="font-display font-bold text-forest flex items-center gap-1 mb-2 text-xs">
                  <ShoppingBag className="w-3.5 h-3.5 text-forest" />
                  <span>Recent Orders ({orders.length})</span>
                </h4>
                {orders.length === 0 ? (
                  <p className="text-ink/50 italic">No orders placed by this customer.</p>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto border border-forest/15 rounded-lg divide-y divide-forest/10 bg-oat-card">
                    {orders.map((ord) => (
                      <div key={ord._id} className="p-2.5 flex justify-between items-center hover:bg-oat">
                        <div>
                          <span className="font-mono font-semibold text-forest block">
                            {ord.orderNumber}
                          </span>
                          <span className="text-[11px] text-ink/60">
                            {new Date(ord.createdAt).toLocaleDateString('en-IN')} • {ord.items?.length || 0} fruit items
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-forest block">
                            ₹{ord.totalAmount?.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] uppercase font-semibold text-forest/70">
                            {ord.orderStatus}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedCustomerId(null)}
                  className="px-4 py-2 bg-oat hover:bg-forest/10 text-forest text-xs font-semibold rounded-lg border border-forest/20 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          ) : null}
        </Modal>
      )}
    </div>
  );
};

export default AdminCustomersPage;