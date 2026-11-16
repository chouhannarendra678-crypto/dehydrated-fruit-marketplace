import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  ShoppingBag,
  ShieldCheck,
  CheckCircle2,
  Truck,
  RotateCcw,
  Sparkles,
  Store,
  ChevronRight,
  Plus,
  Minus,
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ProductGallery from '../../components/common/ProductGallery';
import ProductPrice from '../../components/common/ProductPrice';
import ProductRating from '../../components/common/ProductRating';
import Button from '../../components/common/Button';
import ReviewList from '../../components/reviews/ReviewList';
import { useGetProductBySlugQuery } from '../../services/productApi';
import {
  useGetProductReviewsQuery,
  useCheckReviewEligibilityQuery,
  useCreateProductReviewMutation,
} from '../../services/reviewApi';
import { addToCart } from '../../redux/slices/cartSlice';
import { toggleWishlistItem, selectIsInWishlist } from '../../redux/slices/wishlistSlice';

const ProductDetailsPage = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const token = useSelector((state) => state.auth.token);
  const { data, isLoading, error } = useGetProductBySlugQuery(slug);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const product = data?.data?.product;
  const isWishlisted = useSelector((state) => (product ? selectIsInWishlist(state, product._id) : false));

  // Reviews query
  const { data: reviewsData } = useGetProductReviewsQuery(
    { productId: product?._id },
    { skip: !product?._id }
  );

  const { data: eligibilityData } = useCheckReviewEligibilityQuery(
    { productId: product?._id },
    { skip: !token || !product?._id }
  );

  const [createReview, { isLoading: isSubmittingReview }] = useCreateProductReviewMutation();

  const reviews = reviewsData?.data?.reviews || [];
  const canReview = Boolean(eligibilityData?.data?.canReview);
  const hasReviewed = Boolean(eligibilityData?.data?.hasReviewed);

  const handleReviewSubmit = async (formData) => {
    try {
      await createReview({
        productId: product._id,
        ...formData,
      }).unwrap();
      alert('Thank you! Your verified fruit review has been published.');
    } catch (err) {
      alert(err?.data?.message || err?.message || 'Failed to submit review');
    }
  };

  if (isLoading) {
    return <Loader message="Loading dried fruit product..." />;
  }

  if (error || !product) {
    return (
      <EmptyState
        title="Product Not Found"
        description="The dehydrated fruit product you requested is not available or is currently pending moderation."
        actionLabel="Browse Marketplace"
        onAction={() => (window.location.href = '/explore')}
      />
    );
  }

  const variants = product.variants || [];
  const activeVariant = variants[selectedVariantIndex] || {
    weight: '100g',
    price: product.minPrice || 0,
    mrp: product.minPrice || 0,
    stock: product.totalStock || 0,
  };

  const seller = product.seller || {};
  const isOutOfStock = (activeVariant.stock || 0) <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    dispatch(
      addToCart({
        productId: product._id,
        variantId: activeVariant._id || 'default',
        sellerId: seller._id || 'unknown',
        sellerName: seller.storeName || 'Verified Orchard',
        name: product.name,
        price: activeVariant.price,
        weight: activeVariant.weight,
        image: product.images?.[0]?.url || '',
        quantity,
        stock: activeVariant.stock,
      })
    );
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  const handleToggleWishlist = () => {
    dispatch(
      toggleWishlistItem({
        id: product._id,
        name: product.name,
        price: activeVariant.price,
        image: product.images?.[0]?.url || '',
        slug: product.slug,
      })
    );
  };

  return (
    <div className="space-y-12 max-w-7xl mx-auto py-2">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-ink-muted">
        <Link to="/" className="hover:text-forest">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/explore" className="hover:text-forest">Fruits</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        {product.category?.name && (
          <>
            <Link to={`/explore?category=${product.category.slug}`} className="hover:text-forest">
              {product.category.name}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
          </>
        )}
        <span className="text-forest font-semibold truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 tablet:gap-12 items-start">
        {/* Left: Gallery */}
        <div>
          <ProductGallery images={product.images} alt={product.name} />
        </div>

        {/* Right: Info & Variant Selection */}
        <div className="space-y-6">
          {/* Seller & Verification */}
          <div className="flex items-center justify-between">
            <Link
              to={seller.slug ? `/sellers/${seller.slug}` : '#'}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest hover:underline"
            >
              <Store className="w-4 h-4 text-forest" />
              <span>{seller.storeName || 'Verified Fruit Vendor'}</span>
              {seller.isVerified && (
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-forest/10 text-forest text-[10px] font-bold border border-forest/20">
                  <ShieldCheck className="w-3 h-3" /> FSSAI Verified
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={handleToggleWishlist}
              className="p-2 rounded-md border border-forest/20 bg-oat-card hover:bg-oat-dark/30 text-forest transition-colors cursor-pointer"
              aria-label="Wishlist"
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-tomato text-tomato' : 'text-forest'}`} />
            </button>
          </div>

          {/* Title & Rating */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-forest tracking-tight leading-snug">
              {product.name}
            </h1>
            <ProductRating rating={product.rating} reviewCount={product.reviewCount} size="md" />
          </div>

          {/* Dynamic Price Display */}
          <div className="p-4 rounded-lg bg-oat-card border border-forest/15 flex items-center justify-between shadow-2xs">
            <div>
              <ProductPrice price={activeVariant.price} mrp={activeVariant.mrp} size="lg" />
              <p className="text-[11px] text-ink-muted mt-0.5">Inclusive of all taxes • Weight: {activeVariant.weight}</p>
            </div>
            {isOutOfStock ? (
              <span className="text-xs font-bold text-tomato bg-tomato/10 px-3 py-1 rounded-md border border-tomato/20">
                Out of Stock
              </span>
            ) : (
              <span className="text-xs font-bold text-forest bg-forest/10 px-3 py-1 rounded-md border border-forest/20">
                In Stock ({activeVariant.stock} left)
              </span>
            )}
          </div>

          {/* Weight Variant Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-forest">
              Select Weight Tier
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {variants.map((v, idx) => (
                <button
                  key={v._id || idx}
                  type="button"
                  onClick={() => setSelectedVariantIndex(idx)}
                  className={`p-3 rounded-md border text-center transition-all cursor-pointer ${
                    selectedVariantIndex === idx
                      ? 'border-forest bg-forest text-oat font-bold shadow-2xs'
                      : 'border-forest/20 hover:border-forest/40 bg-oat-card text-forest'
                  }`}
                >
                  <p className="text-sm font-semibold">{v.weight}</p>
                  <p className={`text-xs mt-0.5 ${selectedVariantIndex === idx ? 'text-oat/80' : 'text-ink-muted'}`}>
                    ₹{v.price}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Selector & Action Buttons */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <label className="text-xs font-bold uppercase tracking-wider text-forest">
                Quantity:
              </label>
              <div className="flex items-center border border-forest/20 rounded-md bg-oat-card shadow-2xs">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-oat-dark/30 text-forest rounded-l-md transition-colors cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-10 text-center text-xs font-bold text-forest">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(activeVariant.stock || 10, quantity + 1))}
                  className="p-2 hover:bg-oat-dark/30 text-forest rounded-r-md transition-colors cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <Button
                variant="outline"
                size="lg"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className="w-full font-bold"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
              <Button
                variant="primary"
                size="lg"
                disabled={isOutOfStock}
                onClick={handleBuyNow}
                className="w-full font-bold"
              >
                Buy Now
              </Button>
            </div>
          </div>

          {/* Trust Guarantees */}
          <div className="pt-4 border-t border-forest/15 grid grid-cols-2 gap-4 text-xs text-ink-muted">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-forest" />
              <span>Direct Orchard Dispatch</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-forest" />
              <span>Multi-Vendor Combined Cart</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs / Detailed Specs */}
      <div className="bg-oat-card rounded-xl p-6 sm:p-10 border border-forest/15 shadow-2xs space-y-8">
        {/* Description */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold font-display text-forest">About This Dehydrated Fruit</h3>
          <p className="text-sm text-ink-muted leading-relaxed whitespace-pre-line">
            {product.description}
          </p>
        </div>

        {/* Nutritional & Ingredient Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-forest/15">
          {/* Ingredients & Pure Standards */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold font-display text-forest uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-forest" />
              <span>Ingredients & Standards</span>
            </h4>
            <div className="space-y-2 text-xs">
              <div className="p-3.5 rounded-md bg-oat/60 border border-forest/15">
                <p className="font-semibold text-forest">Pure Ingredients:</p>
                <p className="text-ink-muted mt-0.5">
                  {product.ingredients?.length > 0 ? product.ingredients.join(', ') : '100% Dehydrated Fruit'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-md border border-forest/15 bg-oat/60">
                  <span className="text-ink-subtle block text-[10px] uppercase font-bold">Added Sugar</span>
                  <span className="font-bold text-forest">{product.addedSugar ? 'Yes (Syrup Infused)' : 'No Added Sugar'}</span>
                </div>
                <div className="p-3 rounded-md border border-forest/15 bg-oat/60">
                  <span className="text-ink-subtle block text-[10px] uppercase font-bold">Preservatives</span>
                  <span className="font-bold text-forest">{product.preservatives ? 'Sulfites Present' : 'Zero Preservatives'}</span>
                </div>
                <div className="p-3 rounded-md border border-forest/15 bg-oat/60">
                  <span className="text-ink-subtle block text-[10px] uppercase font-bold">Shelf Life</span>
                  <span className="font-bold text-forest">{product.shelfLife || '12 Months'}</span>
                </div>
                <div className="p-3 rounded-md border border-forest/15 bg-oat/60">
                  <span className="text-ink-subtle block text-[10px] uppercase font-bold">SKU Reference</span>
                  <span className="font-mono text-forest">{activeVariant.SKU || 'DF-ITEM'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Nutrition Table */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold font-display text-forest uppercase tracking-wider">
              Nutritional Profile (Per 100g)
            </h4>
            <div className="rounded-md border border-forest/20 overflow-hidden text-xs">
              <div className="flex justify-between py-2 px-4 bg-oat border-b border-forest/20 font-bold text-forest">
                <span>Energy / Calories</span>
                <span>{product.nutrition?.calories || 300} kcal</span>
              </div>
              <div className="flex justify-between py-2 px-4 border-b border-forest/10">
                <span className="text-ink-muted">Total Carbohydrates</span>
                <span className="font-medium text-forest">{product.nutrition?.carbohydrates || 0}g</span>
              </div>
              <div className="flex justify-between py-2 px-4 border-b border-forest/10">
                <span className="text-ink-muted">Natural Fruit Sugars</span>
                <span className="font-medium text-forest">{product.nutrition?.sugar || 0}g</span>
              </div>
              <div className="flex justify-between py-2 px-4 border-b border-forest/10">
                <span className="text-ink-muted">Dietary Fiber</span>
                <span className="font-medium text-forest">{product.nutrition?.fiber || 0}g</span>
              </div>
              <div className="flex justify-between py-2 px-4 border-b border-forest/10">
                <span className="text-ink-muted">Protein</span>
                <span className="font-medium text-forest">{product.nutrition?.protein || 0}g</span>
              </div>
              <div className="flex justify-between py-2 px-4">
                <span className="text-ink-muted">Total Fat</span>
                <span className="font-medium text-forest">{product.nutrition?.fat || 0}g</span>
              </div>
            </div>
          </div>
        </div>

        {/* Storage Instruction */}
        {product.storageInstructions && (
          <div className="pt-4 border-t border-forest/15 text-xs text-ink-muted">
            <span className="font-semibold text-forest">Storage Advice: </span>
            {product.storageInstructions}
          </div>
        )}
      </div>

      {/* Seller Storefront Card */}
      <div className="bg-oat-light border border-forest/20 rounded-xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xs">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-md bg-forest text-oat flex items-center justify-center font-bold text-2xl overflow-hidden shrink-0 font-display shadow-2xs">
            {seller.logo?.url ? (
              <img src={seller.logo.url} alt={seller.storeName} className="w-full h-full object-cover" />
            ) : (
              seller.storeName ? seller.storeName.charAt(0) : 'S'
            )}
          </div>
          <div>
            <h4 className="text-base font-bold font-display text-forest">{seller.storeName}</h4>
            <p className="text-xs text-ink-muted line-clamp-1 mt-0.5">{seller.description || 'Verified Dried Fruit Producer'}</p>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-forest font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Certified Processor</span>
              <span>•</span>
              <span className="text-[#C88E2D]">★ {seller.rating > 0 ? seller.rating.toFixed(1) : '5.0'}</span>
            </div>
          </div>
        </div>
        {seller.slug && (
          <Link to={`/sellers/${seller.slug}`}>
            <Button size="sm" variant="outline">
              Visit Seller Store
            </Button>
          </Link>
        )}
      </div>

      {/* Customer Reviews Section */}
      <div className="space-y-4 pt-4 border-t border-forest/15">
        <h3 className="text-xl font-bold font-display text-forest">Customer Reviews & Ratings</h3>
        <ReviewList
          reviews={reviews}
          averageRating={product.rating || 5}
          reviewCount={product.reviewCount || reviews.length}
          canReview={canReview}
          hasReviewed={hasReviewed}
          targetTitle={product.name}
          onSubmitReview={handleReviewSubmit}
          isSubmitting={isSubmittingReview}
        />
      </div>
    </div>
  );
};

export default ProductDetailsPage;