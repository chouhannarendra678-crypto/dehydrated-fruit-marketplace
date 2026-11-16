import React from 'react';
import {
  DollarSign,
  TrendingUp,
  Percent,
  Clock,
  CheckCircle,
  Building2,
  AlertCircle,
  ArrowUpRight,
} from 'lucide-react';
import { useGetSellerEarningsQuery } from '../../services/payoutApi';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { Link } from 'react-router-dom';

const SellerEarningsPage = () => {
  const { data, isLoading, error } = useGetSellerEarningsQuery();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader size="lg" message="Loading financial ledger and earnings..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-tomato/10 border border-tomato/20 rounded-lg text-tomato flex items-center gap-3">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <p className="text-sm">Failed to load earnings information. Please try refreshing.</p>
      </div>
    );
  }

  const { financials = {}, bankInfo = {}, recentOrders = [] } = data?.data || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-forest/15">
        <div>
          <h1 className="text-2xl font-bold font-display text-forest">Earnings & Commission</h1>
          <p className="text-sm text-ink-muted mt-1">
            Review gross sales, marketplace commission deductions, and net payouts for your orchard batches.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/seller/payouts"
            className="inline-flex items-center gap-2 px-4 py-2 bg-forest text-white rounded-md text-xs font-bold hover:bg-forest-muted transition-colors shadow-2xs"
          >
            <span>View Payout History</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Sales */}
        <div className="bg-oat-card p-5 rounded-lg border border-forest/15 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Gross Fruit Sales</span>
            <span className="p-2 bg-forest/10 text-forest rounded-md">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-bold font-display text-forest">₹{financials.totalGrossSales?.toLocaleString('en-IN') || '0'}</h2>
            <p className="text-xs text-ink-muted mt-1">Total value of all customer orders</p>
          </div>
        </div>

        {/* Platform Fee Deducted */}
        <div className="bg-oat-card p-5 rounded-lg border border-forest/15 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Marketplace Fee</span>
            <span className="p-2 bg-[#C88E2D]/10 text-[#C88E2D] rounded-md">
              <Percent className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-bold font-display text-[#C88E2D]">-₹{financials.totalCommissionDeducted?.toLocaleString('en-IN') || '0'}</h2>
            <p className="text-xs text-ink-muted mt-1">
              Platform take-rate: <span className="font-semibold text-forest">{financials.commissionRate}%</span>
              {financials.isCustomRate && <span className="ml-1 text-forest font-medium">(Custom rate)</span>}
            </p>
          </div>
        </div>

        {/* Net Vendor Earnings */}
        <div className="bg-oat-card p-5 rounded-lg border border-forest/15 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Net Earnings</span>
            <span className="p-2 bg-forest/10 text-forest rounded-md">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-bold font-display text-forest">₹{financials.totalNetEarnings?.toLocaleString('en-IN') || '0'}</h2>
            <p className="text-xs text-ink-muted mt-1">Gross sales minus marketplace fee</p>
          </div>
        </div>

        {/* Pending Payout Balance */}
        <div className="bg-oat-card p-5 rounded-lg border border-forest/15 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Pending Balance</span>
            <span className="p-2 bg-forest/10 text-forest rounded-md">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-bold font-display text-forest">₹{financials.pendingPayoutBalance?.toLocaleString('en-IN') || '0'}</h2>
            <p className="text-xs text-ink-muted mt-1">Awaiting next admin payout batch</p>
          </div>
        </div>
      </div>

      {/* Banking & Settlement Banner */}
      <div className="bg-oat-light border border-forest/20 rounded-lg p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-2xs">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-forest text-oat rounded-md shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold font-display text-forest">Registered Settlement Account</h3>
            {bankInfo.hasBankDetails ? (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-ink-muted">
                <span><strong className="text-forest">Bank:</strong> {bankInfo.bankName || 'Direct Transfer'}</span>
                <span><strong className="text-forest">Account:</strong> <span className="font-mono text-ink">{bankInfo.accountNumberMasked}</span></span>
                {bankInfo.ifscCode && <span><strong className="text-forest">IFSC:</strong> {bankInfo.ifscCode}</span>}
                {bankInfo.upiId && <span><strong className="text-forest">UPI:</strong> {bankInfo.upiId}</span>}
              </div>
            ) : (
              <p className="text-xs text-[#C88E2D] mt-0.5">
                No bank account details configured yet. Please configure your payout details in store settings.
              </p>
            )}
          </div>
        </div>
        <Link
          to="/seller/settings"
          className="text-xs font-bold text-forest hover:underline shrink-0"
        >
          Manage Payout Details
        </Link>
      </div>

      {/* Recent Orders Ledger Table */}
      <div className="bg-oat-card rounded-lg border border-forest/15 overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-forest/15 flex justify-between items-center bg-oat/50">
          <div>
            <h3 className="font-bold font-display text-forest">Recent Orders Ledger</h3>
            <p className="text-xs text-ink-muted mt-0.5">Itemized commission and earnings breakdown</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-oat text-forest border border-forest/15 rounded-md">
            Showing {recentOrders.length} orders
          </span>
        </div>

        {recentOrders.length === 0 ? (
          <div className="py-12">
            <EmptyState
              icon={DollarSign}
              title="No Sales Recorded Yet"
              description="When customers place orders for your dehydrated fruits, earnings and commission deductions will be listed here."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-oat text-xs font-bold text-forest uppercase tracking-wider border-b border-forest/15">
                <tr>
                  <th className="px-5 py-3">Order Number</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Gross Sales</th>
                  <th className="px-4 py-3">Commission</th>
                  <th className="px-4 py-3">Fee Deducted</th>
                  <th className="px-4 py-3">Net Earning</th>
                  <th className="px-4 py-3">Order Status</th>
                  <th className="px-5 py-3">Payout Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forest/10">
                {recentOrders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-oat/40 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-forest">
                      <span className="font-mono text-xs">{ord.sellerOrderNumber}</span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-ink-muted">
                      {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3.5 font-bold font-display text-forest">
                      ₹{ord.totalAmount?.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-ink-muted">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-oat text-forest border border-forest/15">
                        {ord.commissionRate}%
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs font-medium text-[#C88E2D]">
                      -₹{ord.commissionAmount?.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3.5 font-bold font-display text-forest">
                      ₹{ord.sellerEarnings?.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-oat text-forest border border-forest/15">
                        {ord.orderStatus}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                          ord.payoutStatus === 'PAID'
                            ? 'bg-forest/10 text-forest border border-forest/20'
                            : ord.payoutStatus === 'PROCESSING'
                            ? 'bg-[#C88E2D]/10 text-[#C88E2D] border border-[#C88E2D]/20'
                            : 'bg-oat text-forest border border-forest/15'
                          }`}
                      >
                        {ord.payoutStatus === 'PAID' && <CheckCircle className="w-3 h-3" />}
                        {ord.payoutStatus === 'PROCESSING' && <Clock className="w-3 h-3" />}
                        {ord.payoutStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerEarningsPage;