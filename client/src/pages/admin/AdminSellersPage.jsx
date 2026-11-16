import React, { useState } from 'react';
import {
  Users,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Search,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import {
  useAdminGetAllSellersQuery,
  useAdminUpdateSellerStatusMutation,
} from '../../services/sellerApi';

const AdminSellersPage = () => {
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [commissionRate, setCommissionRate] = useState(10);

  const { data, isLoading, refetch } = useAdminGetAllSellersQuery({
    status: statusFilter || undefined,
    search: searchTerm || undefined,
  });

  const [updateStatus, { isLoading: isUpdating }] = useAdminUpdateSellerStatusMutation();

  const handleOpenActionModal = (seller, type) => {
    setSelectedSeller(seller);
    setActionType(type);
    setCommissionRate(seller.commissionRate || 10);
    setRejectionReason('');
  };

  const handleConfirmAction = async () => {
    if (!selectedSeller || !actionType) return;

    try {
      let targetStatus = 'APPROVED';
      if (actionType === 'REJECT') targetStatus = 'REJECTED';
      if (actionType === 'SUSPEND') targetStatus = 'SUSPENDED';

      await updateStatus({
        id: selectedSeller._id,
        status: targetStatus,
        rejectionReason: actionType === 'REJECT' ? rejectionReason : undefined,
        commissionRate: Number(commissionRate) || 10,
      }).unwrap();

      setSelectedSeller(null);
      setActionType(null);
      refetch();
    } catch (err) {
      alert(err?.data?.message || 'Failed to update seller status.');
    }
  };

  const sellers = data?.data?.sellers || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-forest/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-forest">Seller Verification & Governance</h1>
          <p className="text-xs text-ink-muted mt-1">
            Review FSSAI registrations, PAN numbers, bank accounts, and approve vendors to sell on the marketplace.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-oat-card p-4 rounded-lg border border-forest/15 shadow-2xs">
        <div className="flex flex-wrap gap-2 text-xs">
          {['', 'PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-forest text-white shadow-2xs'
                  : 'bg-oat text-forest border border-forest/15 hover:border-forest/40'
              }`}
            >
              {st === '' ? 'All Sellers' : st}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-64">
          <Input
            type="text"
            icon={Search}
            placeholder="Search store, PAN, FSSAI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Sellers List */}
      {isLoading ? (
        <Loader message="Loading seller registry..." />
      ) : sellers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Sellers Found"
          description="No seller accounts match your current filter or search criteria."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {sellers.map((s) => (
            <div
              key={s._id}
              className="bg-oat-card p-6 rounded-lg border border-forest/15 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
              {/* Store & Contact Info */}
              <div className="space-y-2 min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-bold font-display text-forest truncate">{s.storeName}</h3>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${
                      s.status === 'APPROVED'
                        ? 'bg-forest/10 text-forest border-forest/20'
                        : s.status === 'PENDING'
                        ? 'bg-[#C88E2D]/10 text-[#C88E2D] border-[#C88E2D]/20'
                        : 'bg-tomato/10 text-tomato border-tomato/20'
                      }`}
                  >
                    {s.status}
                  </span>
                  {s.slug && (
                    <Link
                      to={`/sellers/${s.slug}`}
                      target="_blank"
                      className="text-forest/60 hover:text-forest"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs text-ink-muted">
                  <p>
                    <span className="font-semibold text-forest">Owner:</span> {s.user?.name || 'N/A'}
                  </p>
                  <p>
                    <span className="font-semibold text-forest">Email:</span> {s.user?.email || 'N/A'}
                  </p>
                  <p>
                    <span className="font-semibold text-forest">Phone:</span> {s.user?.phone || 'N/A'}
                  </p>
                  <p>
                    <span className="font-semibold text-forest">Commission:</span> {s.commissionRate || 10}%
                  </p>
                </div>

                {/* Compliance & Bank Details */}
                <div className="pt-2 flex flex-wrap gap-2 text-[11px]">
                  <span className="px-2 py-0.5 rounded-md bg-oat text-forest border border-forest/15 font-mono">
                    FSSAI: {s.businessInfo?.fssaiNumber || 'Not submitted'}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-oat text-forest border border-forest/15 font-mono">
                    PAN: {s.businessInfo?.pan || 'Not submitted'}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-oat text-forest border border-forest/15 font-mono">
                    GST: {s.businessInfo?.gst || 'None'}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-oat text-forest border border-forest/15">
                    Bank: {s.bankInfo?.bankName || 'Not configured'}
                  </span>
                </div>

                {s.status === 'REJECTED' && s.rejectionReason && (
                  <p className="text-xs text-tomato font-medium">
                    Rejection note: {s.rejectionReason}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {s.status !== 'APPROVED' && (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleOpenActionModal(s, 'APPROVE')}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1 text-oat" />
                    Approve
                  </Button>
                )}

                {s.status !== 'REJECTED' && (
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleOpenActionModal(s, 'REJECT')}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                )}

                {s.status === 'APPROVED' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenActionModal(s, 'SUSPEND')}
                  >
                    Suspend
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation & Details Modal */}
      <Modal
        isOpen={Boolean(selectedSeller)}
        onClose={() => setSelectedSeller(null)}
        title={`${actionType === 'APPROVE' ? 'Approve' : actionType === 'REJECT' ? 'Reject' : 'Suspend'} Seller: ${selectedSeller?.storeName}`}
      >
        <div className="space-y-4 text-xs">
          {actionType === 'APPROVE' && (
            <>
              <p className="text-ink leading-relaxed">
                Approving this seller will grant them verified status and allow them to list and sell dehydrated fruits on the marketplace.
              </p>
              <Input
                label="Agreed Platform Commission (%)"
                type="number"
                min="0"
                max="100"
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
                helperText="Standard marketplace default is 10%."
              />
            </>
          )}

          {actionType === 'REJECT' && (
            <>
              <p className="text-ink leading-relaxed">
                Please provide the reason for rejection. This will be shown to the seller on their portal so they can correct their submission.
              </p>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-forest mb-1">
                  Rejection Reason <span className="text-tomato">*</span>
                </label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. FSSAI registration number is invalid, or PAN document mismatch..."
                  className="w-full rounded-md border border-forest/20 bg-oat-light/60 p-2.5 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-forest resize-none leading-relaxed"
                  required
                />
              </div>
            </>
          )}

          {actionType === 'SUSPEND' && (
            <p className="text-ink leading-relaxed">
              Suspending this seller will temporarily block all selling permissions and deactivate their public listings.
            </p>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t border-forest/15">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedSeller(null)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              variant={actionType === 'APPROVE' ? 'primary' : 'danger'}
              size="sm"
              loading={isUpdating}
              onClick={handleConfirmAction}
            >
              Confirm {actionType}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminSellersPage;