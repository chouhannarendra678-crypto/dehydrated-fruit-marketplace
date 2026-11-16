import React from 'react';
import { Link } from 'react-router-dom';
import {
  Store,
  ShieldCheck,
  AlertTriangle,
  Clock,
  ExternalLink,
  Settings,
  CreditCard,
  FileText,
  CheckCircle2,
  DollarSign,
  Package,
} from 'lucide-react';
import {
  useGetSellerProfileQuery,
  useGetSellerDashboardStatsQuery,
} from '../../services/sellerApi';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';

const SellerDashboardPage = () => {
  const { data: profileData, isLoading: profileLoading } = useGetSellerProfileQuery();
  const { data: statsData, isLoading: statsLoading } = useGetSellerDashboardStatsQuery();

  if (profileLoading || statsLoading) {
    return <Loader message="Loading vendor portal..." />;
  }

  const seller = profileData?.data?.seller || {};
  const stats = statsData?.data?.stats || {};
  const status = seller.status || 'PENDING';

  const isFssaiSubmitted = Boolean(seller.businessInfo?.fssaiNumber);
  const isPanSubmitted = Boolean(seller.businessInfo?.pan);
  const isBankSubmitted = Boolean(seller.bankInfo?.accountNumber);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-forest/15">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold font-display text-forest">{seller.storeName || 'Vendor Portal'}</h1>
            {seller.isVerified ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-forest/10 text-forest border border-forest/20">
                <ShieldCheck className="w-3.5 h-3.5" /> FSSAI Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-[#C88E2D]/10 text-[#C88E2D] border border-[#C88E2D]/20">
                <Clock className="w-3.5 h-3.5" /> Verification Pending
              </span>
            )}
          </div>
          <p className="text-xs text-ink-muted mt-1">
            Platform Take-Rate: <span className="font-semibold text-forest">{seller.commissionRate || 10}%</span> | Slug: <span className="font-mono text-forest">/sellers/{seller.slug}</span>
          </p>
        </div>

        {seller.slug && (
          <Link
            to={`/sellers/${seller.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-md border border-forest/20 bg-oat-card hover:bg-oat-dark/30 text-forest transition-colors shadow-2xs"
          >
            <Store className="w-4 h-4 text-forest" />
            <span>View Public Storefront</span>
            <ExternalLink className="w-3.5 h-3.5 text-ink-subtle" />
          </Link>
        )}
      </div>

      {/* Verification Status Alerts */}
      {status === 'PENDING' && (
        <div className="p-6 rounded-lg bg-oat-card border border-forest/20 text-ink shadow-2xs space-y-4">
          <div className="flex items-start gap-3">
            <Clock className="w-6 h-6 text-[#C88E2D] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold font-display text-forest">
                Seller Verification In Progress (Status: PENDING)
              </h3>
              <p className="text-xs text-ink-muted leading-relaxed max-w-3xl">
                Your application has been received. In accordance with marketplace food safety policy, an administrator must review your 14-digit FSSAI registration, business PAN, and bank details before you can publish or sell dehydrated fruits.
              </p>
            </div>
          </div>

          {/* Onboarding Checklist */}
          <div className="pt-3 border-t border-forest/15 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-forest" />
              <span className="font-medium text-forest">1. Store Name & Account</span>
            </div>
            <div className="flex items-center gap-2">
              {isFssaiSubmitted && isPanSubmitted ? (
                <CheckCircle2 className="w-4 h-4 text-forest" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-[#C88E2D]" />
              )}
              <span className="font-medium text-forest">
                2. FSSAI & PAN {isFssaiSubmitted ? '(Submitted)' : '(Required in Settings)'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {isBankSubmitted ? (
                <CheckCircle2 className="w-4 h-4 text-forest" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-[#C88E2D]" />
              )}
              <span className="font-medium text-forest">
                3. Payout Bank Details {isBankSubmitted ? '(Submitted)' : '(Required in Settings)'}
              </span>
            </div>
          </div>

          {(!isFssaiSubmitted || !isBankSubmitted) && (
            <div className="pt-2">
              <Link to="/seller/settings">
                <Button size="sm" variant="accent" className="font-semibold">
                  Complete Verification Details
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}

      {status === 'APPROVED' && (
        <div className="p-5 rounded-lg bg-oat-card border border-forest/20 text-forest shadow-2xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-forest shrink-0" />
            <div>
              <h3 className="text-sm font-bold font-display text-forest">
                Verified Fruit Vendor (Status: APPROVED)
              </h3>
              <p className="text-xs text-ink-muted">
                Your store is fully verified and authorized. You have permission to publish dehydrated fruit listings and accept customer orders.
              </p>
            </div>
          </div>
          <Link to="/seller/products">
            <Button size="sm" variant="primary">
              Manage Products
            </Button>
          </Link>
        </div>
      )}

      {status === 'REJECTED' && (
        <div className="p-6 rounded-lg bg-tomato/10 border border-tomato/20 text-tomato shadow-2xs space-y-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-tomato shrink-0" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold font-display text-tomato">
                Seller Verification Rejected (Status: REJECTED)
              </h3>
              <p className="text-xs text-tomato/90">
                Reason: {seller.rejectionReason || 'FSSAI credentials or business information could not be verified.'}
              </p>
            </div>
          </div>
          <div className="pt-2">
            <Link to="/seller/settings">
              <Button size="sm" variant="danger">
                Update Information & Re-submit
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-oat-card p-5 rounded-lg border border-forest/15 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Gross Sales</p>
            <p className="text-2xl font-bold font-display text-forest mt-1">₹0.00</p>
            <p className="text-[11px] text-ink-subtle mt-0.5">0 completed orders</p>
          </div>
          <div className="w-11 h-11 rounded-md bg-forest/10 flex items-center justify-center text-forest">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-oat-card p-5 rounded-lg border border-forest/15 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Platform Take-Rate</p>
            <p className="text-2xl font-bold font-display text-forest mt-1">{seller.commissionRate || 10}%</p>
            <p className="text-[11px] text-ink-subtle mt-0.5">Admin configured</p>
          </div>
          <div className="w-11 h-11 rounded-md bg-forest/10 flex items-center justify-center text-forest">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-oat-card p-5 rounded-lg border border-forest/15 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Active Products</p>
            <p className="text-2xl font-bold font-display text-forest mt-1">0</p>
            <p className="text-[11px] text-ink-subtle mt-0.5">
              {status === 'APPROVED' ? 'Ready to publish' : 'Gated until approved'}
            </p>
          </div>
          <div className="w-11 h-11 rounded-md bg-forest/10 flex items-center justify-center text-forest">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-oat-card p-5 rounded-lg border border-forest/15 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Available Balance</p>
            <p className="text-2xl font-bold font-display text-forest mt-1">₹0.00</p>
            <p className="text-[11px] text-ink-subtle mt-0.5">Direct bank transfer</p>
          </div>
          <div className="w-11 h-11 rounded-md bg-forest/10 flex items-center justify-center text-forest">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Quick Setup Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-oat-card p-6 rounded-lg border border-forest/15 shadow-2xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-forest/10 flex items-center justify-center text-forest">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-display text-forest">Store Profile & Branding</h3>
              <p className="text-xs text-ink-muted">Customize banner, logo, and orchard story</p>
            </div>
          </div>
          <p className="text-xs text-ink-muted leading-relaxed">
            Ensure your store description highlights drying methods (solar, air dehydrator, no sulfur, zero added sugar) to appeal to health-conscious buyers.
          </p>
          <Link to="/seller/store-profile">
            <Button size="sm" variant="outline" className="w-full">
              Edit Store Profile
            </Button>
          </Link>
        </div>

        <div className="bg-oat-card p-6 rounded-lg border border-forest/15 shadow-2xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-forest/10 flex items-center justify-center text-forest">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-display text-forest">Verification & Bank Setup</h3>
              <p className="text-xs text-ink-muted">FSSAI, PAN, GSTIN, and payout bank account</p>
            </div>
          </div>
          <p className="text-xs text-ink-muted leading-relaxed">
            Keep your 14-digit FSSAI license and bank details up to date to guarantee automatic payout settlements upon order completion.
          </p>
          <Link to="/seller/settings">
            <Button size="sm" variant="outline" className="w-full">
              Manage Verification & Payout Details
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboardPage;
