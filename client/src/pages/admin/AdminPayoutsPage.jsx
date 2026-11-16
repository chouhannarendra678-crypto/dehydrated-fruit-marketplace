import React, { useState } from 'react';
import {
  CreditCard,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
  Eye,
  Filter,
  Building2,
  AlertCircle,
  Send,
} from 'lucide-react';
import {
  useGetAdminPayoutOverviewQuery,
  useGetAdminPayoutsQuery,
  useGetAdminEligibleOrdersQuery,
  useGenerateAdminPayoutMutation,
  useUpdateAdminPayoutStatusMutation,
} from '../../services/payoutApi';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';

const AdminPayoutsPage = () => {
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [failModalOpen, setFailModalOpen] = useState(false);
  const [activePayoutForAction, setActivePayoutForAction] = useState(null);

  // Form states for payout actions
  const [utrNumber, setUtrNumber] = useState('');
  const [failureReason, setFailureReason] = useState('');
  const [actionNotes, setActionNotes] = useState('');

  // Form states for generating payout
  const [selectedSellerId, setSelectedSellerId] = useState('');
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('BANK_TRANSFER');
  const [generateNotes, setGenerateNotes] = useState('');
  const [generateError, setGenerateError] = useState('');

  // Queries & Mutations
  const { data: overviewData } = useGetAdminPayoutOverviewQuery();
  const { data: payoutsData, isLoading, error } = useGetAdminPayoutsQuery({
    status: statusFilter,
  });
  const { data: eligibleData, isLoading: loadingEligible } = useGetAdminEligibleOrdersQuery();
  const [generatePayout, { isLoading: generating }] = useGenerateAdminPayoutMutation();
  const [updatePayoutStatus, { isLoading: updatingStatus }] = useUpdateAdminPayoutStatusMutation();

  const overview = overviewData?.data || {};
  const payouts = payoutsData?.data?.payouts || [];
  const eligibleSellers = eligibleData?.data?.sellers || [];

  // Currently selected seller in the generate modal
  const activeEligibleSeller = eligibleSellers.find(
    (s) => s.seller._id === selectedSellerId
  );

  const handleOpenGenerateModal = () => {
    setSelectedSellerId(eligibleSellers[0]?.seller._id || '');
    if (eligibleSellers[0]?.orders) {
      setSelectedOrderIds(eligibleSellers[0].orders.map((o) => o._id));
    }
    setGenerateNotes('');
    setGenerateError('');
    setGenerateModalOpen(true);
  };

  const handleSellerChange = (sId) => {
    setSelectedSellerId(sId);
    const s = eligibleSellers.find((item) => item.seller._id === sId);
    if (s && s.orders) {
      setSelectedOrderIds(s.orders.map((o) => o._id));
    } else {
      setSelectedOrderIds([]);
    }
  };

  const toggleOrderSelection = (orderId) => {
    setSelectedOrderIds((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  };

  // Compute preview for selected orders
  const selectedOrdersList =
    activeEligibleSeller?.orders?.filter((o) => selectedOrderIds.includes(o._id)) || [];
  const previewGross = selectedOrdersList.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
  const previewCommission = selectedOrdersList.reduce(
    (acc, o) => acc + (o.commissionAmount || 0),
    0
  );
  const previewNet = selectedOrdersList.reduce((acc, o) => acc + (o.sellerEarnings || 0), 0);

  const handleGenerateSubmit = async (e) => {
    e.preventDefault();
    setGenerateError('');

    if (!selectedSellerId) {
      setGenerateError('Please select a seller.');
      return;
    }
    if (selectedOrderIds.length === 0) {
      setGenerateError('Please select at least one eligible order to disburse.');
      return;
    }

    try {
      await generatePayout({
        sellerId: selectedSellerId,
        sellerOrderIds: selectedOrderIds,
        paymentMethod,
        notes: generateNotes,
      }).unwrap();

      setGenerateModalOpen(false);
    } catch (err) {
      setGenerateError(err?.data?.message || 'Failed to generate payout record.');
    }
  };

  const handleMarkProcessing = async (payout) => {
    try {
      await updatePayoutStatus({
        id: payout._id,
        status: 'PROCESSING',
        notes: 'Payout queued with bank for NEFT/IMPS transfer',
      }).unwrap();
    } catch (err) {
      alert(err?.data?.message || 'Failed to update payout status.');
    }
  };

  const handleMarkPaidSubmit = async (e) => {
    e.preventDefault();
    if (!utrNumber.trim()) {
      alert('Please enter a valid bank UTR / reference number.');
      return;
    }

    try {
      await updatePayoutStatus({
        id: activePayoutForAction._id,
        status: 'PAID',
        transactionReference: utrNumber.trim(),
        notes: actionNotes.trim(),
      }).unwrap();

      setPayModalOpen(false);
      setUtrNumber('');
      setActionNotes('');
      setActivePayoutForAction(null);
    } catch (err) {
      alert(err?.data?.message || 'Failed to mark payout as PAID.');
    }
  };

  const handleMarkFailedSubmit = async (e) => {
    e.preventDefault();
    if (!failureReason.trim()) {
      alert('Please enter a reason for the failure.');
      return;
    }

    try {
      await updatePayoutStatus({
        id: activePayoutForAction._id,
        status: 'FAILED',
        failureReason: failureReason.trim(),
        notes: actionNotes.trim(),
      }).unwrap();

      setFailModalOpen(false);
      setFailureReason('');
      setActionNotes('');
      setActivePayoutForAction(null);
    } catch (err) {
      alert(err?.data?.message || 'Failed to mark payout as FAILED.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-forest/15">
        <div>
          <h1 className="font-display text-2xl font-bold text-forest">Seller Payouts Management</h1>
          <p className="text-sm text-ink/70 mt-1">
            Audit marketplace commissions, calculate net vendor earnings, and execute bank disbursements.
          </p>
        </div>
        <button
          onClick={handleOpenGenerateModal}
          disabled={eligibleSellers.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2 bg-forest text-oat-light rounded-lg text-sm font-semibold hover:bg-forest-light transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          <span>Generate Payout</span>
        </button>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Marketplace GMV */}
        <div className="bg-oat-card p-5 rounded-xl border border-forest/15 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink/65">Marketplace GMV</span>
            <span className="p-2 bg-forest/10 text-forest rounded-lg border border-forest/15">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <h2 className="font-display text-2xl font-bold text-forest">₹{overview.totalGrossGMV?.toLocaleString('en-IN') || '0'}</h2>
            <p className="text-xs text-ink/70 mt-1">Cumulative customer order volume</p>
          </div>
        </div>

        {/* Platform Commission Earned */}
        <div className="bg-oat-card p-5 rounded-xl border border-forest/15 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink/65">Platform Commission</span>
            <span className="p-2 bg-forest/10 text-forest rounded-lg border border-forest/15">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <h2 className="font-display text-2xl font-bold text-forest">₹{overview.totalPlatformCommission?.toLocaleString('en-IN') || '0'}</h2>
            <p className="text-xs text-ink/70 mt-1">Total revenue kept by marketplace</p>
          </div>
        </div>

        {/* Total Disbursed to Date */}
        <div className="bg-oat-card p-5 rounded-xl border border-forest/15 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink/65">Disbursed to Date</span>
            <span className="p-2 bg-forest/10 text-forest rounded-lg border border-forest/15">
              <CheckCircle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <h2 className="font-display text-2xl font-bold text-forest">₹{overview.totalDisbursedToSellers?.toLocaleString('en-IN') || '0'}</h2>
            <p className="text-xs text-ink/70 mt-1">Settled to vendor bank accounts</p>
          </div>
        </div>

        {/* Pending Orders Balance */}
        <div className="bg-oat-card p-5 rounded-xl border border-forest/15 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink/65">Pending Settlement</span>
            <span className="p-2 bg-amber-100 text-amber-900 rounded-lg border border-amber-200">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <h2 className="font-display text-2xl font-bold text-amber-900">₹{overview.pendingOrdersBalance?.toLocaleString('en-IN') || '0'}</h2>
            <p className="text-xs text-ink/70 mt-1">Awaiting batch payout generation</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-forest/15 pb-2">
        {['', 'PENDING', 'PROCESSING', 'PAID', 'FAILED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${statusFilter === st
              ? 'bg-forest text-oat-light'
              : 'bg-oat-card text-ink/75 hover:bg-forest/10 border border-forest/15'
              }`}
          >
            {st === '' ? 'All Payouts' : st}
          </button>
        ))}
      </div>

      {/* Payouts Table */}
      <div className="bg-oat-card rounded-xl border border-forest/15 overflow-hidden shadow-2xs">
        {isLoading ? (
          <div className="py-16 flex justify-center">
            <Loader text="Loading marketplace payouts..." />
          </div>
        ) : error ? (
          <div className="p-6 text-center text-tomato text-sm">
            Failed to load payouts. Please refresh the page.
          </div>
        ) : payouts.length === 0 ? (
          <div className="py-12">
            <EmptyState
              icon={CreditCard}
              title="No Payout Records"
              description={
                statusFilter
                  ? `No payouts with status "${statusFilter}".`
                  : 'Click "Generate Payout" to create a new disbursement for eligible sellers.'
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-forest/5 text-xs font-bold text-forest/80 uppercase tracking-wider border-b border-forest/15 text-[11px]">
                <tr>
                  <th className="px-5 py-3">Payout Ref</th>
                  <th className="px-4 py-3">Seller Store</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Gross Total</th>
                  <th className="px-4 py-3">Platform Fee</th>
                  <th className="px-4 py-3">Net Disbursed</th>
                  <th className="px-4 py-3">Bank Snapshot</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forest/10">
                {payouts.map((p) => (
                  <tr key={p._id} className="hover:bg-forest/[0.02] transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs font-bold text-forest">
                      {p.payoutNumber}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-forest">
                      {p.seller?.storeName || 'Unknown Seller'}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-ink/65">
                      {new Date(p.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-ink/75 font-medium">
                      ₹{p.grossAmount?.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-forest/80 font-medium">
                      -₹{p.commissionDeducted?.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-forest text-sm">
                      ₹{p.amount?.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3.5 text-xs">
                      <span className="font-mono text-ink/75 block">
                        {p.bankDetailsSnapshot?.accountNumberMasked || '•••• •••• ••••'}
                      </span>
                      <span className="text-[10px] text-ink/50">
                        {p.bankDetailsSnapshot?.bankName || 'Direct'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${p.status === 'PAID'
                          ? 'bg-forest/10 text-forest border-forest/20'
                          : p.status === 'PROCESSING'
                            ? 'bg-amber-100 text-amber-900 border-amber-200'
                            : p.status === 'FAILED'
                              ? 'bg-tomato/10 text-tomato border-tomato/20'
                              : 'bg-forest/15 text-forest border-forest/25'
                          }`}
                      >
                        {p.status === 'PAID' && <CheckCircle className="w-3 h-3" />}
                        {p.status === 'PROCESSING' && <Clock className="w-3 h-3" />}
                        {p.status === 'FAILED' && <AlertTriangle className="w-3 h-3" />}
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-1.5">
                      {p.status === 'PENDING' && (
                        <button
                          onClick={() => handleMarkProcessing(p)}
                          className="px-2.5 py-1 text-xs font-semibold bg-amber-100 text-amber-900 hover:bg-amber-200 rounded-lg transition-colors border border-amber-200"
                        >
                          Mark Processing
                        </button>
                      )}
                      {p.status === 'PROCESSING' && (
                        <>
                          <button
                            onClick={() => {
                              setActivePayoutForAction(p);
                              setPayModalOpen(true);
                            }}
                            className="px-2.5 py-1 text-xs font-semibold bg-forest/10 text-forest hover:bg-forest/20 rounded-lg transition-colors border border-forest/20"
                          >
                            Mark Paid
                          </button>
                          <button
                            onClick={() => {
                              setActivePayoutForAction(p);
                              setFailModalOpen(true);
                            }}
                            className="px-2.5 py-1 text-xs font-semibold bg-tomato/10 text-tomato hover:bg-tomato/20 rounded-lg transition-colors border border-tomato/20"
                          >
                            Mark Failed
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setSelectedPayout(p)}
                        className="px-2.5 py-1 text-xs font-medium text-forest hover:bg-forest/10 rounded-lg transition-colors border border-forest/15"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Generate Payout Modal */}
      {generateModalOpen && (
        <Modal
          isOpen={generateModalOpen}
          onClose={() => setGenerateModalOpen(false)}
          title="Generate Seller Payout"
        >
          <form onSubmit={handleGenerateSubmit} className="space-y-4 pt-2">
            {generateError && (
              <div className="p-3 bg-tomato/10 text-tomato text-xs rounded-lg flex items-center gap-2 border border-tomato/20">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{generateError}</span>
              </div>
            )}

            {/* Select Seller */}
            <div>
              <label className="block text-xs font-semibold text-forest mb-1">
                Select Orchard Vendor (with eligible pending orders)
              </label>
              <select
                value={selectedSellerId}
                onChange={(e) => handleSellerChange(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-forest/20 bg-oat-card text-ink focus:outline-none focus:ring-1 focus:ring-forest"
              >
                {eligibleSellers.map((s) => (
                  <option key={s.seller._id} value={s.seller._id}>
                    {s.seller.storeName} — {s.orders.length} orders pending (Net: ₹
                    {s.netEarningsTotal.toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
            </div>

            {/* Bank Snapshot Details */}
            {activeEligibleSeller && (
              <div className="bg-oat p-3 rounded-lg text-xs space-y-1 border border-forest/15">
                <div className="font-semibold text-forest flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-forest" />
                  <span>Settlement Bank: {activeEligibleSeller.seller.bankDetails.bankName || 'Direct'}</span>
                </div>
                <div className="text-ink/70">
                  Account: <span className="font-mono text-forest font-semibold">{activeEligibleSeller.seller.bankDetails.accountNumberMasked}</span>
                  {activeEligibleSeller.seller.bankDetails.ifscCode && ` | IFSC: ${activeEligibleSeller.seller.bankDetails.ifscCode}`}
                </div>
              </div>
            )}

            {/* Orders Selection */}
            {activeEligibleSeller && activeEligibleSeller.orders.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-forest">
                    Select Orders to Include in Payout Batch ({selectedOrderIds.length} of{' '}
                    {activeEligibleSeller.orders.length} selected)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedOrderIds.length === activeEligibleSeller.orders.length) {
                        setSelectedOrderIds([]);
                      } else {
                        setSelectedOrderIds(activeEligibleSeller.orders.map((o) => o._id));
                      }
                    }}
                    className="text-[11px] text-forest font-bold hover:underline"
                  >
                    {selectedOrderIds.length === activeEligibleSeller.orders.length
                      ? 'Deselect All'
                      : 'Select All'}
                  </button>
                </div>

                <div className="max-h-48 overflow-y-auto border border-forest/15 rounded-lg divide-y divide-forest/10 bg-oat-card text-xs">
                  {activeEligibleSeller.orders.map((ord) => (
                    <label
                      key={ord._id}
                      className="p-2.5 flex items-center justify-between hover:bg-oat cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedOrderIds.includes(ord._id)}
                          onChange={() => toggleOrderSelection(ord._id)}
                          className="rounded text-forest focus:ring-forest border-forest/20"
                        />
                        <span className="font-mono text-forest">{ord.sellerOrderNumber}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-forest">
                          ₹{ord.sellerEarnings?.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-ink/50 block">
                          Gross: ₹{ord.totalAmount} | Fee: -₹{ord.commissionAmount}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Calculations Preview */}
            <div className="bg-forest/5 p-3 rounded-lg border border-forest/20 text-xs space-y-1">
              <div className="flex justify-between text-ink/75">
                <span>Gross Selected Sales:</span>
                <span className="font-semibold text-forest">₹{previewGross.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-forest/80 font-medium">
                <span>Platform Commission Deducted:</span>
                <span>-₹{previewCommission.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-forest pt-1 border-t border-forest/20">
                <span>Net Disbursement Amount:</span>
                <span>₹{previewNet.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Payment Method & Notes */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-forest mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-forest/20 bg-oat-card text-ink focus:outline-none focus:ring-1 focus:ring-forest"
                >
                  <option value="BANK_TRANSFER">Bank Transfer (NEFT/RTGS)</option>
                  <option value="IMPS">IMPS Immediate</option>
                  <option value="UPI">UPI Direct</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-forest mb-1">
                  Admin Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. November Batch #1"
                  value={generateNotes}
                  onChange={(e) => setGenerateNotes(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-forest/20 bg-oat-card text-ink focus:outline-none focus:ring-1 focus:ring-forest"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 pt-3 border-t border-forest/15">
              <button
                type="button"
                onClick={() => setGenerateModalOpen(false)}
                className="px-4 py-2 bg-oat hover:bg-forest/10 text-forest text-xs font-semibold rounded-lg border border-forest/20 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={generating || selectedOrderIds.length === 0}
                className="px-4 py-2 bg-forest text-oat-light text-xs font-semibold rounded-lg hover:bg-forest-light transition-colors disabled:opacity-50"
              >
                {generating ? 'Generating...' : 'Confirm & Generate Payout'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Mark Paid Modal */}
      {payModalOpen && activePayoutForAction && (
        <Modal
          isOpen={payModalOpen}
          onClose={() => setPayModalOpen(false)}
          title={`Mark Payout as PAID (${activePayoutForAction.payoutNumber})`}
        >
          <form onSubmit={handleMarkPaidSubmit} className="space-y-4 pt-2">
            <p className="text-xs text-ink/75 leading-relaxed">
              Confirm bank disbursement for{' '}
              <strong className="text-forest font-bold">
                ₹{activePayoutForAction.amount?.toLocaleString('en-IN')}
              </strong>{' '}
              to <strong className="text-forest font-bold">{activePayoutForAction.seller?.storeName}</strong>.
            </p>

            <div>
              <label className="block text-xs font-semibold text-forest mb-1">
                Bank UTR / Transaction Reference Number <span className="text-tomato">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. UTR2026111598765432"
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-forest/20 bg-oat-card text-ink font-mono focus:outline-none focus:ring-1 focus:ring-forest"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-forest mb-1">
                Payment Notes / Bank Name
              </label>
              <input
                type="text"
                placeholder="e.g. HDFC NEFT Transfer"
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-forest/20 bg-oat-card text-ink focus:outline-none focus:ring-1 focus:ring-forest"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-forest/15">
              <button
                type="button"
                onClick={() => setPayModalOpen(false)}
                className="px-4 py-2 bg-oat text-forest text-xs font-semibold rounded-lg border border-forest/20 hover:bg-forest/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updatingStatus}
                className="px-4 py-2 bg-forest text-oat-light text-xs font-semibold rounded-lg hover:bg-forest-light transition-colors disabled:opacity-50"
              >
                {updatingStatus ? 'Updating...' : 'Disburse & Confirm Paid'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Mark Failed Modal */}
      {failModalOpen && activePayoutForAction && (
        <Modal
          isOpen={failModalOpen}
          onClose={() => setFailModalOpen(false)}
          title={`Mark Payout as FAILED (${activePayoutForAction.payoutNumber})`}
        >
          <form onSubmit={handleMarkFailedSubmit} className="space-y-4 pt-2">
            <p className="text-xs text-tomato leading-relaxed">
              Marking this payout as failed will revert all associated orders back to PENDING so
              they can be re-settled in a future payout batch.
            </p>

            <div>
              <label className="block text-xs font-semibold text-forest mb-1">
                Failure Reason <span className="text-tomato">*</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder="e.g. Invalid beneficiary IFSC code / Account frozen by recipient bank"
                value={failureReason}
                onChange={(e) => setFailureReason(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-forest/20 bg-oat-card text-ink focus:outline-none focus:ring-1 focus:ring-forest"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-forest/15">
              <button
                type="button"
                onClick={() => setFailModalOpen(false)}
                className="px-4 py-2 bg-oat text-forest text-xs font-semibold rounded-lg border border-forest/20 hover:bg-forest/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updatingStatus}
                className="px-4 py-2 bg-tomato text-white text-xs font-semibold rounded-lg hover:bg-tomato/90 transition-colors disabled:opacity-50"
              >
                {updatingStatus ? 'Updating...' : 'Confirm Payout Failure'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* View Payout Details Modal */}
      {selectedPayout && (
        <Modal
          isOpen={!!selectedPayout}
          onClose={() => setSelectedPayout(null)}
          title={`Payout ${selectedPayout.payoutNumber}`}
        >
          <div className="space-y-3 pt-2 text-xs">
            <div className="bg-oat p-3 rounded-lg border border-forest/15 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-ink/65">Seller:</span>
                <span className="font-semibold text-forest">{selectedPayout.seller?.storeName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink/65">Status:</span>
                <span className="font-bold text-forest">{selectedPayout.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink/65">Net Payout Amount:</span>
                <span className="font-bold text-sm text-forest">
                  ₹{selectedPayout.amount?.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink/65">Gross Order Total:</span>
                <span className="text-ink/80 font-medium">₹{selectedPayout.grossAmount?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-forest/80">
                <span>Commission Kept:</span>
                <span>-₹{selectedPayout.commissionDeducted?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink/65">Account:</span>
                <span className="font-mono text-forest font-semibold">{selectedPayout.bankDetailsSnapshot?.accountNumberMasked}</span>
              </div>
              {selectedPayout.transactionReference && (
                <div className="flex justify-between">
                  <span className="text-ink/65">UTR / Reference:</span>
                  <span className="font-mono font-semibold text-forest">{selectedPayout.transactionReference}</span>
                </div>
              )}
              {selectedPayout.failureReason && (
                <div className="p-2 bg-tomato/10 text-tomato border border-tomato/20 rounded mt-2">
                  <strong>Reason:</strong> {selectedPayout.failureReason}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedPayout(null)}
                className="px-4 py-2 bg-oat hover:bg-forest/10 text-forest text-xs font-semibold rounded-lg border border-forest/20 transition-colors"
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

export default AdminPayoutsPage;
