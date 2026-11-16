import React, { useState, useEffect } from 'react';
import { Store, Image, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import {
  useGetSellerProfileQuery,
  useUpdateSellerProfileMutation,
} from '../../services/sellerApi';

const SellerStoreProfilePage = () => {
  const { data, isLoading } = useGetSellerProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateSellerProfileMutation();

  const [storeName, setStoreName] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (data?.data?.seller) {
      const s = data.data.seller;
      setStoreName(s.storeName || '');
      setDescription(s.description || '');
      setLogoUrl(s.logo?.url || '');
      setBannerUrl(s.banner?.url || '');
    }
  }, [data]);

  if (isLoading) {
    return <Loader message="Loading store profile..." />;
  }

  const seller = data?.data?.seller || {};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);

    try {
      await updateProfile({
        storeName,
        description,
        logo: { url: logoUrl },
        banner: { url: bannerUrl },
      }).unwrap();

      setFeedback({
        type: 'success',
        message: 'Store profile has been updated successfully!',
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err?.data?.message || 'Failed to update store profile.',
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-forest/15">
        <div>
          <h1 className="text-2xl font-bold font-display text-forest">Store Profile & Branding</h1>
          <p className="text-xs text-ink-muted mt-1">
            Configure how your dehydrated fruit brand appears to customers across the marketplace.
          </p>
        </div>

        {seller.slug && (
          <Link
            to={`/sellers/${seller.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-md border border-forest/20 bg-oat-card hover:bg-oat-dark/30 text-forest transition-colors shadow-2xs"
          >
            <span>Preview Storefront</span>
            <ExternalLink className="w-3.5 h-3.5 text-ink-subtle" />
          </Link>
        )}
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-md text-xs flex items-center gap-2.5 ${
            feedback.type === 'success'
              ? 'bg-forest/10 border border-forest/20 text-forest'
              : 'bg-tomato/10 border border-tomato/20 text-tomato'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-forest" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-tomato" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-oat-card rounded-lg p-6 tablet:p-8 border border-forest/15 shadow-2xs space-y-6">
        <div className="space-y-4">
          <Input
            label="Store / Brand Name"
            type="text"
            icon={Store}
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            required
            helperText="Changing store name updates your unique URL slug automatically."
          />

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-forest mb-1.5">
              Public Store Slug
            </label>
            <div className="flex items-center rounded-md border border-forest/20 bg-oat px-3.5 py-2.5 text-xs text-ink-muted font-mono">
              <span>https://marketplace.com/sellers/</span>
              <span className="text-forest font-bold">{seller.slug || 'your-store'}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-forest mb-1.5">
              Brand Story / Description
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell buyers about your orchards, drying techniques (solar, cold air), quality standards, and varieties of dehydrated fruits..."
              className="w-full rounded-md border border-forest/20 bg-oat-light/60 p-3 text-sm text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-1 focus:ring-forest focus:border-forest leading-relaxed transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Store Logo Image URL"
              type="url"
              icon={Image}
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://.../logo.png"
              helperText="Square 400x400 image recommended."
            />

            <Input
              label="Store Banner Image URL"
              type="url"
              icon={Image}
              value={bannerUrl}
              onChange={(e) => setBannerUrl(e.target.value)}
              placeholder="https://.../banner.jpg"
              helperText="Wide 1200x400 banner recommended."
            />
          </div>
        </div>

        {/* Live Preview Card */}
        <div className="pt-6 border-t border-forest/15">
          <p className="text-xs font-bold text-forest uppercase tracking-wider mb-3">Live Card Preview</p>
          <div className="rounded-lg border border-forest/20 bg-oat p-5 flex items-center gap-4">
            <div className="w-14 h-14 rounded-md bg-forest text-oat flex items-center justify-center font-bold text-xl overflow-hidden shrink-0 shadow-2xs font-display">
              {logoUrl ? (
                <img src={logoUrl} alt="Store logo" className="w-full h-full object-cover" />
              ) : (
                storeName ? storeName.charAt(0) : 'S'
              )}
            </div>
            <div>
              <h4 className="font-bold font-display text-base text-forest">{storeName || 'Your Store Name'}</h4>
              <p className="text-xs text-ink-muted line-clamp-1 mt-0.5">
                {description || 'No store description provided yet.'}
              </p>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-forest font-semibold">
                <span className="text-[#C88E2D]">★ 5.0 (0 reviews)</span>
                <span>•</span>
                <span>Verified Fruit Processor</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <Button type="submit" variant="primary" loading={isUpdating} size="md">
            Save Store Profile
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SellerStoreProfilePage;
