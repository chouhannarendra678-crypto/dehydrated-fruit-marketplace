import React, { useState } from 'react';
import {
  Star,
  CornerDownRight,
} from 'lucide-react';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import {
  useGetSellerDashboardReviewsQuery,
  useSellerReplyToReviewMutation,
} from '../../services/reviewApi';

const SellerReviewsPage = () => {
  const [page, setPage] = useState(1);
  const [reviewTypeFilter, setReviewTypeFilter] = useState('');

  const { data, isLoading } = useGetSellerDashboardReviewsQuery({
    page,
    limit: 15,
    reviewType: reviewTypeFilter || undefined,
  });

  const [sellerReply, { isLoading: isReplying }] = useSellerReplyToReviewMutation();

  const [selectedReview, setSelectedReview] = useState(null);
  const [replyText, setReplyText] = useState('');

  const reviews = data?.data?.reviews || [];
  const pagination = data?.data?.pagination || { page: 1, totalPages: 1, total: 0 };

  const handleOpenReplyModal = (review) => {
    setSelectedReview(review);
    setReplyText(review.sellerReply?.comment || '');
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!selectedReview || !replyText.trim()) return;

    try {
      await sellerReply({
        id: selectedReview._id,
        comment: replyText.trim(),
      }).unwrap();

      setSelectedReview(null);
      setReplyText('');
    } catch (err) {
      alert(err?.data?.message || err?.message || 'Failed to submit reply');
    }
  };

  if (isLoading) {
    return <Loader message="Loading customer reviews..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-forest/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-forest">Seller Reviews & Feedback</h1>
          <p className="text-xs text-ink-muted mt-1">
            Read verified customer ratings regarding your fruit batches and orchard dispatch speed.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <select
            value={reviewTypeFilter}
            onChange={(e) => setReviewTypeFilter(e.target.value)}
            className="px-3 py-1.5 rounded-md border border-forest/20 text-xs bg-oat-card font-medium text-forest cursor-pointer focus:outline-none focus:ring-1 focus:ring-forest"
          >
            <option value="">All Feedback Types</option>
            <option value="PRODUCT">Fruit Batch Reviews</option>
            <option value="SELLER">Orchard Vendor Reviews</option>
          </select>
        </div>
      </div>

      {reviews.length === 0 ? (
        <EmptyState
          icon={Star}
          title="No Reviews Found"
          description="Customer reviews specifically rating your products and store will display here."
        />
      ) : (
        <div className="space-y-4">
          <div className="divide-y divide-forest/10 rounded-lg border border-forest/15 bg-oat-card shadow-2xs overflow-hidden">
            {reviews.map((r) => (
              <div key={r._id} className="p-6 space-y-3 hover:bg-oat/30 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border ${
                      r.reviewType === 'PRODUCT' ? 'bg-[#C88E2D]/10 text-[#C88E2D] border-[#C88E2D]/20' : 'bg-forest/10 text-forest border-forest/20'
                    }`}>
                      {r.reviewType === 'PRODUCT' ? 'Fruit Batch' : 'Vendor Store'}
                    </span>
                    {r.product && (
                      <span className="font-bold text-xs font-display text-forest">
                        {r.product.name}
                      </span>
                    )}
                    <span className="text-[11px] text-ink-muted">
                      by <strong>{r.customer?.name || 'Customer'}</strong> • {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= r.rating ? 'fill-[#C88E2D] text-[#C88E2D]' : 'fill-forest/10 text-forest/20'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  {r.title && <h4 className="font-bold text-xs font-display text-forest">{r.title}</h4>}
                  <p className="text-xs text-ink-muted leading-relaxed whitespace-pre-line">
                    {r.comment}
                  </p>
                </div>

                {/* Seller Reply if present */}
                {r.sellerReply?.comment ? (
                  <div className="mt-2 p-3.5 rounded-md bg-oat border border-forest/15 space-y-1 text-xs">
                    <div className="flex items-center justify-between font-bold text-forest text-[11px]">
                      <span className="flex items-center gap-1">
                        <CornerDownRight className="w-3.5 h-3.5" /> Your Public Response:
                      </span>
                      <button
                        type="button"
                        onClick={() => handleOpenReplyModal(r)}
                        className="text-forest/70 hover:text-forest text-[10px] font-semibold cursor-pointer"
                      >
                        Edit Reply
                      </button>
                    </div>
                    <p className="text-ink pl-4 leading-relaxed">{r.sellerReply.comment}</p>
                  </div>
                ) : (
                  <div className="pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenReplyModal(r)}
                      className="text-xs font-bold text-forest hover:bg-forest/10"
                    >
                      <CornerDownRight className="w-3.5 h-3.5 mr-1" />
                      Reply to Customer
                    </Button>
                  </div>
                )}
              </div>
            ))}
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

      {/* Reply Modal */}
      {selectedReview && (
        <Modal
          isOpen={Boolean(selectedReview)}
          onClose={() => setSelectedReview(null)}
          title="Respond to Customer Review"
        >
          <form onSubmit={handleReplySubmit} className="space-y-4">
            <div className="p-3.5 rounded-md bg-oat border border-forest/15 text-xs text-ink space-y-1">
              <p><strong>Customer:</strong> {selectedReview.customer?.name} ({selectedReview.rating}★)</p>
              <p className="italic text-ink-muted">"{selectedReview.comment}"</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-forest block">
                Your Public Producer Reply <span className="text-tomato">*</span>
              </label>
              <textarea
                rows={4}
                placeholder="Thank the customer or address their feedback professionally..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-md border border-forest/20 bg-oat-light/60 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-forest leading-relaxed resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-forest/15">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedReview(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={isReplying}
                className="font-bold"
              >
                {isReplying ? 'Saving...' : 'Post Reply'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default SellerReviewsPage;
