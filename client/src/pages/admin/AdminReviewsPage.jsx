import React, { useState } from 'react';
import {
  Star,
  Search,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Filter,
  Eye,
  Store,
  Package,
} from 'lucide-react';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import {
  useGetAdminReviewsQuery,
  useAdminModerateReviewMutation,
} from '../../services/reviewApi';

const STATUS_BADGES = {
  APPROVED: 'bg-forest/10 text-forest border-forest/20',
  PENDING: 'bg-amber-100 text-amber-900 border-amber-200',
  REJECTED: 'bg-tomato/10 text-tomato border-tomato/20',
};

const AdminReviewsPage = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useGetAdminReviewsQuery({
    page,
    limit: 15,
    status: statusFilter || undefined,
    reviewType: typeFilter || undefined,
    search: search || undefined,
  });

  const [moderateReview, { isLoading: isModerating }] = useAdminModerateReviewMutation();
  const [inspectReview, setInspectReview] = useState(null);

  const reviews = data?.data?.reviews || [];
  const pagination = data?.data?.pagination || { page: 1, totalPages: 1, total: 0 };

  const handleModerate = async (reviewId, newStatus) => {
    let rejectionReason = '';
    if (newStatus === 'REJECTED') {
      rejectionReason = window.prompt('Provide a reason for rejecting this review:') || 'Violation of content policy';
    }

    try {
      await moderateReview({
        id: reviewId,
        status: newStatus,
        rejectionReason,
      }).unwrap();

      if (inspectReview?._id === reviewId) {
        setInspectReview((prev) => ({ ...prev, status: newStatus, rejectionReason }));
      }
    } catch (err) {
      alert(err?.data?.message || err?.message || 'Failed to moderate review');
    }
  };

  if (isLoading) {
    return <Loader message="Loading reviews for moderation..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-forest/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-forest">Review Moderation Console</h1>
          <p className="text-xs text-ink/70 mt-1">
            Supervise dual review streams: Product Reviews and Orchard Seller Reviews.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search comments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg border border-forest/20 text-xs bg-oat-card text-ink focus:outline-none focus:ring-1 focus:ring-forest"
            />
            <Search className="w-3.5 h-3.5 text-ink/40 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-forest/20 text-xs bg-oat-card font-medium text-forest cursor-pointer focus:outline-none focus:ring-1 focus:ring-forest"
          >
            <option value="">All Review Types</option>
            <option value="PRODUCT">Product Reviews</option>
            <option value="SELLER">Seller Reviews</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-forest/20 text-xs bg-oat-card font-medium text-forest cursor-pointer focus:outline-none focus:ring-1 focus:ring-forest"
          >
            <option value="">All Moderation Statuses</option>
            <option value="APPROVED">Approved</option>
            <option value="PENDING">Pending</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {reviews.length === 0 ? (
        <EmptyState
          icon={Star}
          title="No Reviews Found in Queue"
          description="Customer submissions matching your criteria will appear here."
        />
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-forest/15 bg-oat-card shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-forest/5 border-b border-forest/15 text-forest/80 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Type & Target</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Rating</th>
                  <th className="py-3.5 px-4">Comment</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forest/10">
                {reviews.map((r) => (
                  <tr key={r._id} className="hover:bg-forest/[0.02] transition-colors">
                    <td className="py-4 px-4">
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider mb-1 border ${
                        r.reviewType === 'PRODUCT'
                          ? 'bg-forest/10 text-forest border-forest/20'
                          : 'bg-oat text-forest border-forest/15'
                      }`}>
                        {r.reviewType}
                      </span>
                      <p className="font-semibold text-forest truncate max-w-[160px]">
                        {r.reviewType === 'PRODUCT' ? r.product?.name : r.seller?.storeName}
                      </p>
                    </td>

                    <td className="py-4 px-4">
                      <p className="font-semibold text-forest">{r.customer?.name || 'Customer'}</p>
                      <p className="text-[10px] text-ink/60">{r.customer?.email}</p>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1 font-bold text-forest">
                        <Star className="w-3.5 h-3.5 fill-forest text-forest" />
                        <span>{r.rating}.0</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 max-w-xs">
                      {r.title && <p className="font-bold text-forest truncate mb-0.5">{r.title}</p>}
                      <p className="text-ink/80 text-[11px] line-clamp-2 leading-relaxed">
                        {r.comment}
                      </p>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          STATUS_BADGES[r.status] || 'bg-oat text-ink/75 border-forest/10'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {r.status !== 'APPROVED' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleModerate(r._id, 'APPROVED')}
                            className="text-xs text-forest hover:bg-forest/10 px-2 py-1"
                            title="Approve Review"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </Button>
                        )}
                        {r.status !== 'REJECTED' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleModerate(r._id, 'REJECTED')}
                            className="text-xs text-tomato hover:bg-tomato/10 px-2 py-1"
                            title="Reject Review"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
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
    </div>
  );
};

export default AdminReviewsPage;
