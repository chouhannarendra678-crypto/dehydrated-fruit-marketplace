import React, { useState, useEffect } from 'react';
import {
  Settings,
  ShieldCheck,
  Percent,
  Mail,
  Phone,
  DollarSign,
  Truck,
  AlertTriangle,
  CheckCircle2,
  Save,
} from 'lucide-react';
import {
  useGetPlatformSettingsQuery,
  useUpdatePlatformSettingsMutation,
} from '../../services/adminApi';
import Loader from '../../components/common/Loader';

const AdminSettingsPage = () => {
  const { data, isLoading, error } = useGetPlatformSettingsQuery();
  const [updateSettings, { isLoading: isUpdating }] = useUpdatePlatformSettingsMutation();

  const [formData, setFormData] = useState({
    marketplaceName: 'Dehydrated Fruit Marketplace',
    tagline: 'Discover. Compare. Buy. Dehydrated.',
    supportEmail: 'support@dehydratedfruit.com',
    contactPhone: '+91 98765 43210',
    defaultCommissionRate: 8,
    minPayoutThreshold: 500,
    freeShippingThreshold: 500,
    maintenanceMode: false,
    notificationAlerts: true,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (data?.data?.settings) {
      setFormData((prev) => ({
        ...prev,
        ...data.data.settings,
      }));
    }
  }, [data]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSavedSuccess(false);
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSavedSuccess(false);
    setErrorMessage('');

    try {
      await updateSettings(formData).unwrap();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      setErrorMessage(err?.data?.message || 'Failed to update marketplace settings.');
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 flex justify-center">
        <Loader text="Loading marketplace settings..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="pb-4 border-b border-forest/15">
        <h1 className="font-display text-2xl font-bold text-forest">Platform Settings & Operational Policy</h1>
        <p className="text-xs text-ink/70 mt-1">
          Configure marketplace identity, default commission rates, shipping policies, and operational switches.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3.5 bg-forest/10 border border-forest/20 rounded-xl text-forest text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>Platform settings updated and synchronized across all marketplace services.</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 bg-tomato/10 border border-tomato/20 rounded-xl text-tomato text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Marketplace Identity */}
        <div className="bg-oat-card p-6 rounded-xl border border-forest/15 shadow-2xs space-y-4">
          <h2 className="font-display font-bold text-sm text-forest flex items-center gap-2 pb-2 border-b border-forest/15">
            <Settings className="w-4 h-4 text-forest" />
            <span>Marketplace Identity</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-forest mb-1">Marketplace Name</label>
              <input
                type="text"
                required
                value={formData.marketplaceName}
                onChange={(e) => handleChange('marketplaceName', e.target.value)}
                className="w-full p-2.5 rounded-lg border border-forest/20 bg-oat-card text-ink focus:outline-none focus:ring-1 focus:ring-forest"
              />
            </div>
            <div>
              <label className="block font-semibold text-forest mb-1">Tagline</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => handleChange('tagline', e.target.value)}
                className="w-full p-2.5 rounded-lg border border-forest/20 bg-oat-card text-ink focus:outline-none focus:ring-1 focus:ring-forest"
              />
            </div>
            <div>
              <label className="block font-semibold text-forest mb-1">Customer Support Email</label>
              <input
                type="email"
                required
                value={formData.supportEmail}
                onChange={(e) => handleChange('supportEmail', e.target.value)}
                className="w-full p-2.5 rounded-lg border border-forest/20 bg-oat-card text-ink focus:outline-none focus:ring-1 focus:ring-forest"
              />
            </div>
            <div>
              <label className="block font-semibold text-forest mb-1">Support Phone</label>
              <input
                type="text"
                value={formData.contactPhone}
                onChange={(e) => handleChange('contactPhone', e.target.value)}
                className="w-full p-2.5 rounded-lg border border-forest/20 bg-oat-card text-ink focus:outline-none focus:ring-1 focus:ring-forest"
              />
            </div>
          </div>
        </div>

        {/* Financial & Commission Policies */}
        <div className="bg-oat-card p-6 rounded-xl border border-forest/15 shadow-2xs space-y-4">
          <h2 className="font-display font-bold text-sm text-forest flex items-center gap-2 pb-2 border-b border-forest/15">
            <Percent className="w-4 h-4 text-forest" />
            <span>Financial & Settlement Thresholds</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-forest mb-1">
                Default Commission Take-Rate (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="50"
                  step="0.5"
                  required
                  value={formData.defaultCommissionRate}
                  onChange={(e) => handleChange('defaultCommissionRate', e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-forest/20 bg-oat-card text-ink pr-8 font-bold focus:outline-none focus:ring-1 focus:ring-forest"
                />
                <span className="absolute right-3 top-2.5 text-xs text-ink/50 font-bold">%</span>
              </div>
              <p className="text-[11px] text-ink/60 mt-1">5% to 10% standard marketplace bracket</p>
            </div>

            <div>
              <label className="block font-semibold text-forest mb-1">
                Minimum Payout Threshold (₹)
              </label>
              <input
                type="number"
                min="100"
                step="50"
                required
                value={formData.minPayoutThreshold}
                onChange={(e) => handleChange('minPayoutThreshold', e.target.value)}
                className="w-full p-2.5 rounded-lg border border-forest/20 bg-oat-card text-ink font-bold focus:outline-none focus:ring-1 focus:ring-forest"
              />
              <p className="text-[11px] text-ink/60 mt-1">Minimum seller balance for batch settlement</p>
            </div>

            <div>
              <label className="block font-semibold text-forest mb-1">
                Free Shipping Threshold (₹)
              </label>
              <input
                type="number"
                min="0"
                step="50"
                required
                value={formData.freeShippingThreshold}
                onChange={(e) => handleChange('freeShippingThreshold', e.target.value)}
                className="w-full p-2.5 rounded-lg border border-forest/20 bg-oat-card text-ink font-bold focus:outline-none focus:ring-1 focus:ring-forest"
              />
              <p className="text-[11px] text-ink/60 mt-1">Per-seller order value for free delivery</p>
            </div>
          </div>
        </div>

        {/* System & Maintenance Switches */}
        <div className="bg-oat-card p-6 rounded-xl border border-forest/15 shadow-2xs space-y-4">
          <h2 className="font-display font-bold text-sm text-forest flex items-center gap-2 pb-2 border-b border-forest/15">
            <ShieldCheck className="w-4 h-4 text-forest" />
            <span>Platform Controls & Safety</span>
          </h2>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3 bg-oat rounded-lg border border-forest/10 cursor-pointer hover:bg-forest/5 transition-colors">
              <div>
                <span className="font-semibold text-forest block">Maintenance Mode</span>
                <span className="text-ink/65">Temporarily freeze checkout and display maintenance notice</span>
              </div>
              <input
                type="checkbox"
                checked={formData.maintenanceMode}
                onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                className="w-4 h-4 text-forest rounded focus:ring-forest border-forest/20"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-oat rounded-lg border border-forest/10 cursor-pointer hover:bg-forest/5 transition-colors">
              <div>
                <span className="font-semibold text-forest block">System Notifications</span>
                <span className="text-ink/65">Send email alerts for new seller registrations and critical orders</span>
              </div>
              <input
                type="checkbox"
                checked={formData.notificationAlerts}
                onChange={(e) => handleChange('notificationAlerts', e.target.checked)}
                className="w-4 h-4 text-forest rounded focus:ring-forest border-forest/20"
              />
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isUpdating}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-forest hover:bg-forest-light text-oat-light text-xs font-semibold rounded-lg shadow-xs transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isUpdating ? 'Saving Changes...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettingsPage;
