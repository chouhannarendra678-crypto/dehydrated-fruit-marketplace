import React from 'react';
import {
  DollarSign,
  ShoppingBag,
  Users,
  Percent,
  ArrowUpRight,
  Store,
  FolderTree,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGetDashboardStatsQuery } from '../../services/adminApi';
import Loader from '../../components/common/Loader';

const AdminDashboardPage = () => {
  const { data, isLoading, error } = useGetDashboardStatsQuery();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader size="lg" message="Loading executive marketplace analytics..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-tomato/10 border border-tomato/20 rounded-lg text-tomato text-sm">
        Failed to load marketplace analytics. Please refresh or verify admin credentials.
      </div>
    );
  }

  const {
    financials = {},
    orders = {},
    sellers = {},
    pendingApprovals = {},
    categoryDistribution = [],
    recentOrders = [],
    recentSellers = [],
  } = data?.data || {};

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-forest/15">
        <div>
          <h1 className="text-2xl font-bold font-display text-forest">Executive Marketplace Dashboard</h1>
          <p className="text-xs text-ink-muted mt-1">
            Real-time multi-vendor metrics across fruit orders, producer compliance, platform revenue, and catalogs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/admin/settings"
            className="px-3.5 py-1.5 bg-oat-card hover:bg-oat-dark/30 text-forest border border-forest/20 rounded-md text-xs font-semibold transition-colors"
          >
            Settings
          </Link>
          <Link
            to="/admin/payouts"
            className="px-3.5 py-1.5 bg-forest hover:bg-forest-muted text-white rounded-md text-xs font-bold transition-colors shadow-2xs"
          >
            Disburse Payouts
          </Link>
        </div>
      </div>

      {/* KPI Cards Row 1: Core Financials & Orders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* GMV */}
        <div className="bg-oat-card p-5 rounded-lg border border-forest/15 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Gross Market Value (GMV)</span>
            <div className="w-10 h-10 rounded-md bg-forest/10 text-forest flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-bold font-display text-forest">₹{financials.totalGMV?.toLocaleString('en-IN') || '0'}</h2>
            <p className="text-[11px] text-ink-muted mt-1">Total customer purchases to date</p>
          </div>
        </div>

        {/* Platform Commission Revenue */}
        <div className="bg-oat-card p-5 rounded-lg border border-forest/15 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Platform Take-Revenue</span>
            <div className="w-10 h-10 rounded-md bg-[#C88E2D]/10 text-[#C88E2D] flex items-center justify-center">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-bold font-display text-[#C88E2D]">₹{financials.totalPlatformRevenue?.toLocaleString('en-IN') || '0'}</h2>
            <p className="text-[11px] text-ink-muted mt-1">Net platform fee retained</p>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-oat-card p-5 rounded-lg border border-forest/15 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Total Customer Orders</span>
            <div className="w-10 h-10 rounded-md bg-forest/10 text-forest flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-bold font-display text-forest">{orders.total || 0}</h2>
            <p className="text-[11px] text-forest font-medium mt-1">
              {orders.breakdown?.DELIVERED || 0} fulfilled | {orders.breakdown?.PROCESSING || 0} in progress
            </p>
          </div>
        </div>

        {/* Verified Sellers */}
        <div className="bg-oat-card p-5 rounded-lg border border-forest/15 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Active Orchard Vendors</span>
            <div className="w-10 h-10 rounded-md bg-forest/10 text-forest flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-bold font-display text-forest">{sellers.APPROVED || 0}</h2>
            <p className="text-[11px] text-[#C88E2D] font-medium mt-1">
              {sellers.PENDING || 0} pending onboarding approval
            </p>
          </div>
        </div>
      </div>

      {/* Pending Approvals & Action Center */}
      <div>
        <h3 className="text-sm font-bold font-display text-forest mb-3">Moderation & Action Center</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Pending Sellers */}
          <Link
            to="/admin/sellers"
            className="bg-oat-card p-4 rounded-lg border border-forest/15 hover:border-forest/40 transition-all shadow-2xs group"
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-ink-muted">Seller Onboarding</span>
              <span
                className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                  pendingApprovals.sellers > 0 ? 'bg-[#C88E2D]/10 text-[#C88E2D] border border-[#C88E2D]/20' : 'bg-oat text-forest'
                }`}
              >
                {pendingApprovals.sellers || 0} Pending
              </span>
            </div>
            <p className="text-xs text-ink-muted mt-2 group-hover:text-forest flex items-center gap-1 font-semibold">
              <span>Review FSSAI & compliance</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </p>
          </Link>

          {/* Pending Products */}
          <Link
            to="/admin/products"
            className="bg-oat-card p-4 rounded-lg border border-forest/15 hover:border-forest/40 transition-all shadow-2xs group"
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-ink-muted">Fruit Submissions</span>
              <span
                className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                  pendingApprovals.products > 0 ? 'bg-[#C88E2D]/10 text-[#C88E2D] border border-[#C88E2D]/20' : 'bg-oat text-forest'
                }`}
              >
                {pendingApprovals.products || 0} Pending
              </span>
            </div>
            <p className="text-xs text-ink-muted mt-2 group-hover:text-forest flex items-center gap-1 font-semibold">
              <span>Moderate batches & purity</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </p>
          </Link>

          {/* Pending Payouts */}
          <Link
            to="/admin/payouts"
            className="bg-oat-card p-4 rounded-lg border border-forest/15 hover:border-forest/40 transition-all shadow-2xs group"
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-ink-muted">Payout Queue</span>
              <span
                className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                  pendingApprovals.payouts > 0 ? 'bg-forest/10 text-forest border border-forest/20' : 'bg-oat text-forest'
                }`}
              >
                {pendingApprovals.payouts || 0} Batches
              </span>
            </div>
            <p className="text-xs text-ink-muted mt-2 group-hover:text-forest flex items-center gap-1 font-semibold">
              <span>Execute bank transfers</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </p>
          </Link>

          {/* Pending Reviews */}
          <Link
            to="/admin/reviews"
            className="bg-oat-card p-4 rounded-lg border border-forest/15 hover:border-forest/40 transition-all shadow-2xs group"
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-ink-muted">Customer Feedback</span>
              <span
                className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                  pendingApprovals.reviews > 0 ? 'bg-[#C88E2D]/10 text-[#C88E2D] border border-[#C88E2D]/20' : 'bg-oat text-forest'
                }`}
              >
                {pendingApprovals.reviews || 0} Pending
              </span>
            </div>
            <p className="text-xs text-ink-muted mt-2 group-hover:text-forest flex items-center gap-1 font-semibold">
              <span>Audit rating authenticity</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </p>
          </Link>
        </div>
      </div>

      {/* Row 2: Recent Activity Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Master Orders */}
        <div className="bg-oat-card rounded-lg border border-forest/15 shadow-2xs p-5">
          <div className="flex justify-between items-center pb-3 border-b border-forest/15">
            <h3 className="font-bold font-display text-sm text-forest flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-forest" />
              <span>Recent Orders</span>
            </h3>
            <Link to="/admin/orders" className="text-xs text-forest hover:underline font-semibold">
              View All ({orders.total || 0})
            </Link>
          </div>

          <div className="divide-y divide-forest/10 mt-2">
            {recentOrders.length === 0 ? (
              <p className="text-xs text-ink-muted py-6 text-center">No orders recorded yet.</p>
            ) : (
              recentOrders.map((ord) => (
                <div key={ord._id} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-forest">{ord.orderNumber}</span>
                    <p className="text-[11px] text-ink-muted">{ord.customerName} • {new Date(ord.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold font-display text-xs text-forest">₹{ord.totalAmount?.toLocaleString('en-IN')}</span>
                    <span className="block text-[10px] uppercase font-bold text-forest">{ord.orderStatus}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Seller Applications */}
        <div className="bg-oat-card rounded-lg border border-forest/15 shadow-2xs p-5">
          <div className="flex justify-between items-center pb-3 border-b border-forest/15">
            <h3 className="font-bold font-display text-sm text-forest flex items-center gap-2">
              <Users className="w-4 h-4 text-forest" />
              <span>Vendor Applications</span>
            </h3>
            <Link to="/admin/sellers" className="text-xs text-forest hover:underline font-semibold">
              Manage Sellers
            </Link>
          </div>

          <div className="divide-y divide-forest/10 mt-2">
            {recentSellers.length === 0 ? (
              <p className="text-xs text-ink-muted py-6 text-center">No seller applications yet.</p>
            ) : (
              recentSellers.map((s) => (
                <div key={s._id} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold font-display text-forest">{s.storeName}</span>
                    <p className="text-[11px] text-ink-muted">{s.ownerName} ({s.ownerEmail})</p>
                  </div>
                  <div>
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                        s.status === 'APPROVED'
                          ? 'bg-forest/10 text-forest border border-forest/20'
                          : s.status === 'PENDING'
                          ? 'bg-[#C88E2D]/10 text-[#C88E2D] border border-[#C88E2D]/20'
                          : 'bg-tomato/10 text-tomato border border-tomato/20'
                        }`}
                    >
                      {s.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Row 3: Category Taxonomy & Catalog Distribution */}
      <div className="bg-oat-card rounded-lg border border-forest/15 shadow-2xs p-5">
        <div className="flex justify-between items-center pb-3 border-b border-forest/15 mb-4">
          <div>
            <h3 className="font-bold font-display text-sm text-forest flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-forest" />
              <span>Fruit Taxonomy & Catalog Distribution</span>
            </h3>
            <p className="text-xs text-ink-muted mt-0.5">Approved and live fruit listings categorized by dehydrated varietals</p>
          </div>
          <Link to="/admin/categories" className="text-xs text-forest hover:underline font-semibold">
            Manage Categories
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {categoryDistribution.map((cat) => (
            <div key={cat._id} className="p-3 bg-oat rounded-md border border-forest/15 text-center">
              <span className="text-xs font-bold font-display text-forest block truncate">{cat.name}</span>
              <span className="text-lg font-bold font-display text-forest mt-1 block">{cat.productCount}</span>
              <span className="text-[10px] text-ink-muted">fruit products</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;