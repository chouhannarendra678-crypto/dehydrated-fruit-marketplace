import React, { useState } from 'react';
import {
  Percent,
  TrendingUp,
  DollarSign,
  Users,
  Settings2,
  Edit2,
  Search,
  CheckCircle,
  AlertCircle,
  Building2,
} from 'lucide-react';
import {
  useGetAdminCommissionConfigQuery,
  useUpdateAdminCommissionConfigMutation,
  useGetAdminSellerCommissionsQuery,
  useUpdateAdminSellerCommissionMutation,
} from '../../services/payoutApi';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';

const AdminCommissionsPage = () => {
  const [search, setSearch] = useState('');
  const [globalModalOpen, setGlobalModalOpen] = useState(false);
  const [sellerModalOpen, setSellerModalOpen] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState(null);

  // Form states
  const [defaultRate, setDefaultRate] = useState(8);
  const [minPayoutAmount, setMinPayoutAmount] = useState(500);
  const [customSellerRate, setCustomSellerRate] = useState(8);

  const { data: configData, isLoading: loadingConfig } = useGetAdminCommissionConfigQuery();
  const { data: sellersData, isLoading: loadingSellers, error } = useGetAdminSellerCommissionsQuery({
    search,
  });

  const [updateGlobalConfig, { isLoading: updatingConfig }] =
    useUpdateAdminCommissionConfigMutation();
  const [updateSellerCommission, { isLoading: updatingSeller }] =
    useUpdateAdminSellerCommissionMutation();

  const config = configData?.data?.config || {};
  const metrics = configData?.data?.metrics || {};
  const sellers = sellersData?.data?.sellers || [];
  const defaultCommissionRate =
    metrics.defaultCommissionRate || config.defaultCommissionRate || 8;

  const handleOpenGlobalModal = () => {
    setDefaultRate(config.defaultCommissionRate || 8);
    setMinPayoutAmount(config.minPayoutAmount || 500);
    setGlobalModalOpen(true);
  };

  const handleGlobalSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateGlobalConfig({
        defaultCommissionRate: Number(defaultRate),
        minPayoutAmount: Number(minPayoutAmount),
      }).unwrap();
      setGlobalModalOpen(false);
    } catch (err) {
      alert(err?.data?.message || 'Failed to update global commission rate.');
    }
  };

  const handleOpenSellerModal = (seller) => {
    setSelectedSeller(seller);
    setCustomSellerRate(seller.commissionRate);
    setSellerModalOpen(true);
  };

  const handleSellerSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSeller) return;

    try {
      await updateSellerCommission({
        sellerId: selectedSeller._id,
        commissionRate: Number(customSellerRate),
      }).unwrap();
      setSellerModalOpen(false);
      setSelectedSeller(null);
    } catch (err) {
      alert(err?.data?.message || 'Failed to update seller commission rate.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-forest/15">
        <div>
          <h1 className="font-display text-2xl font-bold text-forest">Commission Management</h1>
          <p className="text-sm text-ink/70 mt-1">
            Configure marketplace platform take-rates (5%–10% bracket) and vendor-specific commission overrides.
          </p>
        </div>
        <button
          onClick={handleOpenGlobalModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-forest text-oat-light rounded-lg text-sm font-semibold hover:bg-forest-light transition-colors shadow-xs"
        >
          <Settings2 className="w-4 h-4" />
          <span>Configure Global Take-Rate</span>
        </button>
      </div>

      {/* Top Cards: Global Commission & Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Global Commission Take-Rate */}
        <div className="bg-forest/5 border border-forest/25 p-5 rounded-xl shadow-2xs md:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-forest">Platform Take-Rate</span>
            <span className="p-2 bg-forest text-oat-light rounded-lg shadow-xs">
              <Percent className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <h2 className="font-display text-3xl font-extrabold text-forest">{defaultCommissionRate}%</h2>
              <span className="text-xs text-ink/65">default rate</span>
            </div>
            <p className="text-xs text-ink/70 mt-2 leading-relaxed">
              Applied automatically to all standard dehydrated fruit sales.
            </p>
          </div>
        </div>

        {/* Total Platform Commission Collected */}
        <div className="bg-oat-card p-5 rounded-xl border border-forest/15 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink/65">Total Revenue</span>
            <span className="p-2 bg-forest/10 text-forest rounded-lg border border-forest/15">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <h2 className="font-display text-2xl font-bold text-forest">₹{metrics.totalPlatformCommission?.toLocaleString('en-IN') || '0'}</h2>
            <p className="text-xs text-ink/70 mt-1">Platform fee retained across all orders</p>
          </div>
        </div>

        {/* Total Gross GMV */}
        <div className="bg-oat-card p-5 rounded-xl border border-forest/15 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink/65">Total Gross GMV</span>
            <span className="p-2 bg-forest/10 text-forest rounded-lg border border-forest/15">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <h2 className="font-display text-2xl font-bold text-forest">₹{metrics.totalGrossGMV?.toLocaleString('en-IN') || '0'}</h2>
            <p className="text-xs text-ink/70 mt-1">Gross sales generated by orchard vendors</p>
          </div>
        </div>

        {/* Custom Rate Sellers */}
        <div className="bg-oat-card p-5 rounded-xl border border-forest/15 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink/65">Vendor Tiers</span>
            <span className="p-2 bg-forest/10 text-forest rounded-lg border border-forest/15">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <h2 className="font-display text-2xl font-bold text-forest">{metrics.sellersWithCustomRate || 0}</h2>
            <p className="text-xs text-ink/70 mt-1">
              Out of {metrics.totalApprovedSellers || 0} sellers with custom rates
            </p>
          </div>
        </div>
      </div>

      {/* Seller Specific Rates Table */}
      <div className="bg-oat-card rounded-xl border border-forest/15 overflow-hidden shadow-2xs">
        {/* Table Header / Search */}
        <div className="p-4 border-b border-forest/15 flex flex-col sm:flex-row justify-between items-center gap-3 bg-forest/5">
          <div>
            <h3 className="font-display font-bold text-forest text-base">Seller Commission Rates</h3>
            <p className="text-xs text-ink/70 mt-0.5">Customize individual vendor rates based on volume or partnership</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-ink/40 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search vendor store..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-forest/20 bg-oat-card text-ink focus:outline-none focus:ring-1 focus:ring-forest"
            />
          </div>
        </div>

        {loadingSellers ? (
          <div className="py-16 flex justify-center">
            <Loader text="Loading seller commission rates..." />
          </div>
        ) : error ? (
          <div className="p-6 text-center text-tomato text-sm">
            Failed to load seller commission rates.
          </div>
        ) : sellers.length === 0 ? (
          <div className="py-12">
            <EmptyState
              icon={Percent}
              title="No Vendors Found"
              description="Approved fruit producers will appear here to manage individual commission rates."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-forest/5 text-xs font-bold text-forest/80 uppercase tracking-wider border-b border-forest/15 text-[11px]">
                <tr>
                  <th className="px-5 py-3">Vendor / Store</th>
                  <th className="px-4 py-3">Owner</th>
                  <th className="px-4 py-3">Active Rate</th>
                  <th className="px-4 py-3">Rate Status</th>
                  <th className="px-4 py-3">Gross Sales</th>
                  <th className="px-4 py-3">Fee Paid</th>
                  <th className="px-4 py-3">Net Earnings</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forest/10">
                {sellers.map((s) => (
                  <tr key={s._id} className="hover:bg-forest/[0.02] transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-forest">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-forest flex-shrink-0" />
                        <span>{s.storeName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-ink/70">
                      <div className="font-medium text-ink">{s.ownerName}</div>
                      <div className="text-[11px] text-ink/50">{s.ownerEmail}</div>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-forest">
                      {s.commissionRate}%
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                          s.isCustomRate
                            ? 'bg-forest/10 text-forest border-forest/20'
                            : 'bg-oat text-ink/70 border-forest/10'
                        }`}
                      >
                        {s.isCustomRate ? 'Custom Tier' : 'Default (Standard)'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-ink/75 font-medium">
                      ₹{s.totalSales?.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-forest/80 font-medium">
                      ₹{s.totalCommission?.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3.5 text-xs font-semibold text-forest">
                      ₹{s.totalEarnings?.toLocaleString('en-IN')}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleOpenSellerModal(s)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-forest hover:bg-forest/10 rounded-lg transition-colors border border-forest/15"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit Rate</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Global Commission Modal */}
      {globalModalOpen && (
        <Modal
          isOpen={globalModalOpen}
          onClose={() => setGlobalModalOpen(false)}
          title="Configure Global Platform Commission"
        >
          <form onSubmit={handleGlobalSubmit} className="space-y-4 pt-2">
            <p className="text-xs text-ink/75 leading-relaxed">
              Adjust the baseline marketplace take-rate. All sellers without a custom override will automatically use this rate for subsequent order calculations.
            </p>

            <div>
              <label className="block text-xs font-semibold text-forest mb-1">
                Default Commission Percentage (%) <span className="text-tomato">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min="1"
                  max="50"
                  step="0.5"
                  value={defaultRate}
                  onChange={(e) => setDefaultRate(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-forest/20 bg-oat-card text-ink font-bold pr-8 focus:outline-none focus:ring-1 focus:ring-forest"
                />
                <span className="absolute right-3 top-2.5 text-xs text-ink/50 font-bold">%</span>
              </div>
              <p className="text-[11px] text-ink/60 mt-1">Recommended baseline: 5% to 10%</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-forest mb-1">
                Minimum Payout Threshold (₹)
              </label>
              <input
                type="number"
                min="100"
                step="50"
                value={minPayoutAmount}
                onChange={(e) => setMinPayoutAmount(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-forest/20 bg-oat-card text-ink focus:outline-none focus:ring-1 focus:ring-forest font-semibold"
              />
              <p className="text-[11px] text-ink/60 mt-1">Minimum seller balance required to initiate a payout batch.</p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-forest/15">
              <button
                type="button"
                onClick={() => setGlobalModalOpen(false)}
                className="px-4 py-2 bg-oat text-forest text-xs font-semibold rounded-lg border border-forest/20 hover:bg-forest/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updatingConfig}
                className="px-4 py-2 bg-forest text-oat-light text-xs font-semibold rounded-lg hover:bg-forest-light transition-colors disabled:opacity-50"
              >
                {updatingConfig ? 'Saving...' : 'Save Global Policy'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Individual Seller Rate Modal */}
      {sellerModalOpen && selectedSeller && (
        <Modal
          isOpen={sellerModalOpen}
          onClose={() => setSellerModalOpen(false)}
          title={`Edit Commission for ${selectedSeller.storeName}`}
        >
          <form onSubmit={handleSellerSubmit} className="space-y-4 pt-2">
            <p className="text-xs text-ink/75 leading-relaxed">
              Set a dedicated commission percentage for{' '}
              <strong className="text-forest font-bold">{selectedSeller.storeName}</strong>. This rate overrides the global default of {defaultCommissionRate}%.
            </p>

            <div>
              <label className="block text-xs font-semibold text-forest mb-1">
                Custom Commission Percentage (%) <span className="text-tomato">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min="0"
                  max="50"
                  step="0.5"
                  value={customSellerRate}
                  onChange={(e) => setCustomSellerRate(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-forest/20 bg-oat-card text-ink font-bold pr-8 focus:outline-none focus:ring-1 focus:ring-forest"
                />
                <span className="absolute right-3 top-2.5 text-xs text-ink/50 font-bold">%</span>
              </div>
              <p className="text-[11px] text-ink/60 mt-1">
                Tip: Enter {defaultCommissionRate}% to reset back to standard platform rate.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-forest/15">
              <button
                type="button"
                onClick={() => setSellerModalOpen(false)}
                className="px-4 py-2 bg-oat text-forest text-xs font-semibold rounded-lg border border-forest/20 hover:bg-forest/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updatingSeller}
                className="px-4 py-2 bg-forest text-oat-light text-xs font-semibold rounded-lg hover:bg-forest-light transition-colors disabled:opacity-50"
              >
                {updatingSeller ? 'Updating...' : 'Update Vendor Rate'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default AdminCommissionsPage;
