import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, ShieldCheck, Star } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import ProductPrice from './ProductPrice';
import { addToCart } from '../../redux/slices/cartSlice';
import { toggleWishlistItem, selectIsInWishlist } from '../../redux/slices/wishlistSlice';

const FALLBACK_IMAGE = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300"><rect width="400" height="300" fill="%23E0D4BE"/><circle cx="200" cy="115" r="48" fill="%231D4A35" opacity="0.15"/><path d="M185 95 C185 85, 215 85, 215 95 C225 110, 220 135, 200 145 C180 135, 175 110, 185 95 Z" fill="%231D4A35" opacity="0.65"/><text x="200" y="195" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="bold" fill="%231D4A35" text-anchor="middle">Sun-Dried Natural Fruit</text><text x="200" y="218" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="600" fill="%231D4A35" opacity="0.75" text-anchor="middle">100% PURE HARVEST</text></svg>`;

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const isWishlisted = useSelector((state) => selectIsInWishlist(state, product._id));

  // Determine default variant or first variant
  const defaultVariant = product.variants?.find((v) => v.isDefault) || product.variants?.[0] || {
    weight: '100g',
    price: product.minPrice || 0,
    mrp: product.minPrice || 0,
    stock: product.totalStock || 0,
    SKU: 'DF-ITEM',
  };

  const thumbnail = product.images?.[0]?.url || FALLBACK_IMAGE;
  const seller = product.seller || {};

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    dispatch(
      addToCart({
        productId: product._id,
        variantId: defaultVariant._id || 'default',
        sellerId: seller._id || 'unknown',
        sellerName: seller.storeName || 'Certified Fruit Vendor',
        name: product.name,
        price: defaultVariant.price,
        weight: defaultVariant.weight,
        image: thumbnail,
        quantity: 1,
        stock: defaultVariant.stock,
      })
    );
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();

    dispatch(
      toggleWishlistItem({
        id: product._id,
        name: product.name,
        price: defaultVariant.price,
        image: thumbnail,
        slug: product.slug,
      })
    );
  };

  return (
    <div className="group rounded-lg bg-oat-card border border-forest/15 hover:border-forest/40 transition-all duration-150 flex flex-col justify-between overflow-hidden relative shadow-2xs w-full">
      {/* Wishlist Button */}
      <button
        type="button"
        onClick={handleToggleWishlist}
        className="absolute top-2 right-2 z-10 p-1.5 rounded-md bg-oat-light/95 border border-forest/15 text-ink-muted hover:text-tomato hover:border-tomato/40 transition-colors shadow-2xs"
        aria-label="Save to Wishlist"
      >
        <Heart
          className={`w-3.5 h-3.5 ${
            isWishlisted ? 'fill-tomato text-tomato' : 'text-ink-muted hover:text-tomato'
          }`}
        />
      </button>

      <div>
        {/* Fixed Compact Image Container */}
        <Link
          to={`/products/${product.slug}`}
          className="block relative h-32 sm:h-36 w-full overflow-hidden bg-oat-dark/20 border-b border-forest/10 shrink-0"
        >
          <img
            src={thumbnail}
            alt={product.name}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = FALLBACK_IMAGE;
            }}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
            loading="lazy"
          />
          {!product.addedSugar && (
            <span className="absolute bottom-1.5 left-1.5 text-[9px] font-semibold tracking-wide px-1.5 py-0.5 rounded-xs bg-forest/90 text-oat backdrop-blur-2xs">
              Zero Added Sugar
            </span>
          )}
        </Link>

        {/* Content */}
        <div className="p-2.5 sm:p-3 space-y-1">
          {/* Seller Tag & Rating */}
          <div className="flex items-center justify-between text-[11px] text-ink-muted">
            <Link
              to={seller.slug ? `/sellers/${seller.slug}` : '#'}
              className="hover:text-forest truncate max-w-[110px] sm:max-w-[130px] font-medium flex items-center gap-1 transition-colors"
            >
              <span>{seller.storeName || 'Verified Orchard'}</span>
              {seller.isVerified && <ShieldCheck className="w-3 h-3 text-forest shrink-0" />}
            </Link>
            <div className="flex items-center gap-1 text-[10px] font-semibold text-forest shrink-0">
              <Star className="w-3 h-3 fill-[#C88E2D] text-[#C88E2D]" />
              <span>{product.rating > 0 ? product.rating.toFixed(1) : '5.0'}</span>
            </div>
          </div>

          {/* Product Title */}
          <Link to={`/products/${product.slug}`} className="block">
            <h3 className="font-bold text-xs sm:text-sm text-forest group-hover:text-forest-dark transition-colors line-clamp-1 leading-snug" title={product.name}>
              {product.name}
            </h3>
          </Link>

          {/* Weight variant chip */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[9px] font-semibold text-forest bg-oat-dark/60 border border-forest/10 px-1.5 py-0.5 rounded-xs">
              {defaultVariant.weight}
            </span>
            {product.variants?.length > 1 && (
              <span className="text-[9px] text-ink-muted truncate">
                +{product.variants.length - 1} options
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer / Price & Add to Cart */}
      <div className="p-2.5 sm:p-3 pt-0 border-t border-forest/10 mt-1 flex items-center justify-between gap-1.5">
        <div className="min-w-0">
          <span className="text-[8px] text-ink-muted block uppercase tracking-wider font-semibold">Starts at</span>
          <ProductPrice price={defaultVariant.price} mrp={defaultVariant.mrp} size="sm" />
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md bg-forest hover:bg-forest-dark text-white shadow-2xs transition-colors active:translate-y-px shrink-0"
        >
          <ShoppingBag className="w-3 h-3" />
          <span>Add</span>
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
