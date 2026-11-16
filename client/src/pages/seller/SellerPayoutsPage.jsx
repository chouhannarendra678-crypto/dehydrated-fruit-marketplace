import React, { useState } from 'react';
import {
  CreditCard,
  CheckCircle,
  Clock,
  AlertTriangle,
  Building2,
  Eye,
} from 'lucide-react';
import {
  useGetSellerEarningsQuery,
  useGetSellerPayoutsQuery,
} from '../../services/payoutApi';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';

const SellerPayoutsPage = () => {
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  const { data: earningsData } = useGetSellerEarningsQuery();
  const { data: payoutsData, isLoading, error } = useGetSellerPayoutsQuery({
    status: statusFilter,
  });

  const financials = earningsData?.data?.financials || {};
  const bankInfo = earningsData?.data?.bankInfo || {};
  const payouts = payoutsData?.data?.payouts || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-forest/15">
        <h1 className="text-2xl font-bold font-display text-forest">Payouts & Disbursements</h1>
        <p className="text-sm text-ink-muted mt-1">
          Track official settlements, bank transfer status, and payout references from the platform.
        </p>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Paid Out */}
        <div className="bg-oat-card p-5 rounded-lg border border-forest/15 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Lifetime Paid Out</span>
            <span className="p-2 bg-forest/10 text-forest rounded-md">
              <CheckCircle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-bold font-display text-forest">₹{financials.totalPaidOut?.toLocaleString('en-IN') || '0'}</h2>
            <p className="text-xs text-ink-muted mt-1">Directly credited to registered bank</p>
          </div>
        </div>

        {/* Processing Transfers */}
        <div className="bg-oat-card p-5 rounded-lg border border-forest/15 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Processing Transfers</span>
            <span className="p-2 bg-[#C88E2D]/10 text-[#C88E2D] rounded-md">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-bold font-display text-[#C88E2D]">₹{financials.processingPayoutBalance?.toLocaleString('en-IN') || '0'}</h2>
            <p className="text-xs text-ink-muted mt-1">Transfers queued with bank / clearing</p>
          </div>
        </div>

        {/* Pending Settlement Balance */}
        <div className="bg-oat-card p-5 rounded-lg border border-forest/15 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Pending Balance</span>
            <span className="p-2 bg-forest/10 text-forest rounded-md">
              <CreditCard className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-bold font-display text-forest">₹{financials.pendingPayoutBalance?.toLocaleString('en-IN') || '0'}</h2>
            <p className="text-xs text-ink-muted mt-1">Eligible for upcoming payout batch</p>
          </div>
        </div>
      </div>

      {/* Masked Bank Snapshot Info */}
      <div className="bg-oat-light border border-forest/20 rounded-lg p-4 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-oat text-forest border border-forest/15 rounded-md">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="text-xs text-ink-muted">
            <span className="font-bold font-display text-forest block text-sm">Disbursement Destination</span>
            <span>
              Bank: <strong className="text-forest">{bankInfo.bankName || 'Direct Account'}</strong> | Account:{' '}
              <strong className="text-forest font-mono">{bankInfo.accountNumberMasked || '•••• •••• ••••'}</strong>
              {bankInfo.ifscCode && ` | IFSC: ${bankInfo.ifscCode}`}
            </span>
          </div>
        </div>
        <span className="text-xs bg-forest/10 text-forest px-2.5 py-1 rounded-md font-bold border border-forest/20">
          Verified Settlement
        </span>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-forest/15 pb-2">
        {['', 'PAID', 'PROCESSING', 'PENDING', 'FAILED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
              statusFilter === st
                ? 'bg-forest text-white shadow-2xs'
                : 'bg-oat-card text-forest border border-forest/20 hover:border-forest/40'
            }`}
          >
            {st === '' ? 'All Payouts' : st}
          </button>
        ))}
      </div>

      {/* Payouts Table */}
      <div className="bg-oat-card rounded-lg border border-forest/15 overflow-hidden shadow-2xs">
        {isLoading ? (
          <div className="py-16 flex justify-center">
            <Loader message="Loading payout history..." />
          </div>
        ) : error ? (
          <div className="p-6 text-center text-tomato text-sm">
            Failed to load payouts. Please refresh the page.
          </div>
        ) : payouts.length === 0 ? (
          <div className="py-12">
            <EmptyState
              icon={CreditCard}
              title="No Payouts Found"
              description={
                statusFilter
                  ? `No payouts matching status "${statusFilter}".`
                  : 'Platform payout disbursements will be displayed here as admin batches are processed.'
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-oat text-xs font-bold text-forest uppercase tracking-wider border-b border-forest/15">
                <tr>
                  <th className="px-5 py-3">Payout Ref</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Gross Total</th>
                  <th className="px-4 py-3">Fee Deducted</th>
                  <th className="px-4 py-3">Net Disbursed</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3">UTR / Bank Ref</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forest/10">
                {payouts.map((p) => (
                  <tr key={p._id} className="hover:bg-oat/40 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs font-bold text-forest">
                      {p.payoutNumber}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-ink-muted">
                      {new Date(p.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-ink">
                      ₹{p.grossAmount?.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-[#C88E2D] font-medium">
                      -₹{p.commissionDeducted?.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3.5 font-bold font-display text-forest text-sm">
                      ₹{p.amount?.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                          p.status === 'PAID'
                            ? 'bg-forest/10 text-forest border border-forest/20'
                            : p.status === 'PROCESSING'
                            ? 'bg-[#C88E2D]/10 text-[#C88E2D] border border-[#C88E2D]/20'
                            : p.status === 'FAILED'
                            ? 'bg-tomato/10 text-tomato border border-tomato/20'
                            : 'bg-oat text-forest border border-forest/15'
                        }`}
                      >
                        {p.status === 'PAID' && <CheckCircle className="w-3 h-3" />}
                        {p.status === 'PROCESSING' && <Clock className="w-3 h-3" />}
                        {p.status === 'FAILED' && <AlertTriangle className="w-3 h-3" />}
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-ink-muted">
                      {p.paymentMethod?.replace('_', ' ')}
                    </td>
                    <td className="px-4 py-3.5 text-xs font-mono text-forest">
                      {p.transactionReference || (
                        <span className="text-ink-subtle italic">Pending UTR</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => setSelectedPayout(p)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-forest hover:underline cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payout Details Modal */}
      {selectedPayout && (
        <Modal
          isOpen={!!selectedPayout}
          onClose={() => setSelectedPayout(null)}
          title={`Payout ${selectedPayout.payoutNumber}`}
        >
          <div className="space-y-4 pt-2">
            <div className="bg-oat p-4 rounded-lg space-y-2 text-xs border border-forest/15">
              <div className="flex justify-between py-1 border-b border-forest/10">
                <span className="text-ink-muted">Status:</span>
                <span className="font-bold text-forest">{selectedPayout.status}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-forest/10">
                <span className="text-ink-muted">Net Disbursed Amount:</span>
                <span className="font-bold font-display text-sm text-forest">
                  ₹{selectedPayout.amount?.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-forest/10">
                <span className="text-ink-muted">Gross Order Total:</span>
                <span>₹{selectedPayout.grossAmount?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-forest/10">
                <span className="text-ink-muted">Marketplace Commission:</span>
                <span className="text-[#C88E2D] font-semibold">-₹{selectedPayout.commissionDeducted?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-forest/10">
                <span className="text-ink-muted">Payment Channel:</span>
                <span>{selectedPayout.paymentMethod?.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-forest/10">
                <span className="text-ink-muted">Account Credited:</span>
                <span className="font-mono text-forest">{selectedPayout.bankDetailsSnapshot?.accountNumberMasked || '•••• •••• ••••'}</span>
              </div>
              {selectedPayout.transactionReference && (
                <div className="flex justify-between py-1 border-b border-forest/10">
                  <span className="text-ink-muted">UTR / Transaction Ref:</span>
                  <span className="font-mono font-bold text-forest">{selectedPayout.transactionReference}</span>
                </div>
              )}
              {selectedPayout.failureReason && (
                <div className="p-3 bg-tomato/10 text-tomato rounded-md mt-2 border border-tomato/20">
                  <strong>Failure Reason:</strong> {selectedPayout.failureReason}
                </div>
              )}
              {selectedPayout.notes && (
                <div className="text-xs text-ink-muted pt-1">
                  <strong>Notes:</strong> {selectedPayout.notes}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedPayout(null)}
                className="px-4 py-2 bg-oat-card hover:bg-oat-dark/30 text-forest text-xs font-bold rounded-md border border-forest/20 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default SellerPayoutsPage;