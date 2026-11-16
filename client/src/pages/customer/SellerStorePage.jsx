import React from 'react';
import { useParams } from 'react-router-dom';
import {
  ShieldCheck,
  MapPin,
  Star,
  PackageOpen,
  Store,
} from 'lucide-react';
import { useGetSellerStoreBySlugQuery } from '../../services/sellerApi';
import { useGetPublicProductsQuery } from '../../services/productApi';
import {
  useGetSellerReviewsQuery,
  useCheckReviewEligibilityQuery,
  useCreateSellerReviewMutation,
} from '../../services/reviewApi';
import { useSelector } from 'react-redux';
import ProductGrid from '../../components/common/ProductGrid';
import ReviewList from '../../components/reviews/ReviewList';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

const SellerStorePage = () => {
  const { slug } = useParams();
  const token = useSelector((state) => state.auth.token);
  const { data: storeData, isLoading: storeLoading, error } = useGetSellerStoreBySlugQuery(slug);
  const { data: productsData, isLoading: prodsLoading } = useGetPublicProductsQuery(
    { sellerSlug: slug },
    { skip: !slug }
  );

  const store = storeData?.data?.store;

  // Seller reviews query
  const { data: reviewsData } = useGetSellerReviewsQuery(
    { sellerId: store?._id },
    { skip: !store?._id }
  );

  const { data: eligibilityData } = useCheckReviewEligibilityQuery(
    { sellerId: store?._id },
    { skip: !token || !store?._id }
  );

  const [createReview, { isLoading: isSubmittingReview }] = useCreateSellerReviewMutation();

  const reviews = reviewsData?.data?.reviews || [];
  const canReview = Boolean(eligibilityData?.data?.canReview);
  const hasReviewed = Boolean(eligibilityData?.data?.hasReviewed);

  const handleReviewSubmit = async (formData) => {
    try {
      await createReview({
        sellerId: store._id,
        ...formData,
      }).unwrap();
      alert('Thank you! Your seller rating and review has been posted.');
    } catch (err) {
      alert(err?.data?.message || err?.message || 'Failed to submit review');
    }
  };

  if (storeLoading) {
    return <Loader message="Opening seller storefront..." />;
  }

  if (error || !storeData?.data?.store) {
    return (
      <EmptyState
        icon={Store}
        title="Storefront Not Found"
        description={`We could not locate a verified seller store for "/sellers/${slug}".`}
        actionLabel="Explore Market Sellers"
        onAction={() => (window.location.href = '/explore')}
      />
    );
  }

  const address = store?.businessAddress || {};
  const products = productsData?.data?.products || [];

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-2">
      {/* Store Banner */}
      <div className="relative h-48 sm:h-64 rounded-xl bg-forest border border-forest-dark overflow-hidden shadow-2xs">
        {store.banner?.url ? (
          <img
            src={store.banner.url}
            alt={store.storeName}
            className="w-full h-full object-cover opacity-80"
          />
        ) : (
          <div className="absolute inset-0 bg-forest flex items-center justify-center text-oat/20">
            <Store className="w-24 h-24" />
          </div>
        )}
      </div>

      {/* Store Info Card */}
      <div className="relative -mt-16 sm:-mt-20 mx-4 sm:mx-8 p-6 sm:p-8 rounded-xl bg-oat-card border border-forest/15 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="flex items-start gap-5">
            {/* Logo */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-forest text-oat flex items-center justify-center font-bold text-3xl overflow-hidden shrink-0 shadow-2xs border-2 border-oat font-display">
              {store.logo?.url ? (
                <img src={store.logo.url} alt={store.storeName} className="w-full h-full object-cover" />
              ) : (
                store.storeName.charAt(0)
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold font-display text-forest">
                  {store.storeName}
                </h1>
                {store.isVerified && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-forest/10 text-forest border border-forest/20">
                    <ShieldCheck className="w-3.5 h-3.5" /> FSSAI Verified
                  </span>
                )}
              </div>

              {/* Location */}
              {(address.city || address.state) && (
                <p className="text-xs text-ink-muted flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-forest" />
                  <span>
                    {address.city}
                    {address.city && address.state ? ', ' : ''}
                    {address.state}
                  </span>
                </p>
              )}

              {/* FSSAI Display Badge */}
              {store.businessInfo?.fssaiNumber && (
                <p className="text-[11px] text-ink-muted">
                  FSSAI Lic: <span className="font-mono font-medium text-forest">{store.businessInfo.fssaiNumber}</span>
                </p>
              )}
            </div>
          </div>

          {/* Rating Summary */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-4 sm:pt-0 border-forest/15">
            <div className="flex items-center gap-1.5 bg-oat px-3 py-1.5 rounded-md border border-forest/15">
              <Star className="w-4 h-4 fill-[#C88E2D] text-[#C88E2D]" />
              <span className="font-bold text-sm text-[#C88E2D]">
                {store.rating > 0 ? store.rating.toFixed(1) : '5.0'}
              </span>
              <span className="text-xs text-ink-muted">
                ({store.reviewCount || 0} reviews)
              </span>
            </div>
            <p className="text-[11px] text-ink-muted mt-2 hidden sm:block">Certified Dried Fruits</p>
          </div>
        </div>

        {/* Story / Description */}
        {store.description && (
          <div className="mt-6 pt-6 border-t border-forest/15">
            <h3 className="text-xs font-bold uppercase tracking-wider text-forest mb-2">About The Producer</h3>
            <p className="text-sm text-ink-muted leading-relaxed max-w-4xl">
              {store.description}
            </p>
          </div>
        )}
      </div>

      {/* Store Products Catalog */}
      <div className="space-y-6 pt-4">
        <div className="flex items-center justify-between px-2 pb-2 border-b border-forest/15">
          <div>
            <h2 className="text-xl font-bold font-display text-forest">Available Fruit Batches</h2>
            <p className="text-xs text-ink-muted mt-0.5">
              Directly processed and fulfilled by {store.storeName}.
            </p>
          </div>
          <span className="text-xs font-semibold text-forest bg-oat-card border border-forest/15 px-3 py-1 rounded-md">
            {products.length} Products
          </span>
        </div>

        {prodsLoading ? (
          <Loader message="Loading store harvest batches..." />
        ) : products.length === 0 ? (
          <EmptyState
            icon={PackageOpen}
            title="No Products Currently Available"
            description={`${store.storeName} does not currently have any active dehydrated fruit batches approved for listing.`}
          />
        ) : (
          <ProductGrid products={products} />
        )}
      </div>

      {/* Seller Reviews Section */}
      <div className="space-y-4 pt-6 border-t border-forest/15">
        <h2 className="text-xl font-bold font-display text-forest px-2">Producer Reviews & Reliability</h2>
        <ReviewList
          reviews={reviews}
          averageRating={store.rating || 5}
          reviewCount={store.reviewCount || reviews.length}
          canReview={canReview}
          hasReviewed={hasReviewed}
          targetTitle={store.storeName}
          onSubmitReview={handleReviewSubmit}
          isSubmitting={isSubmittingReview}
        />
      </div>
    </div>
  );
};

export default SellerStorePage;
