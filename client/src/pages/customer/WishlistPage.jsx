import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingBag } from 'lucide-react';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import ProductPrice from '../../components/common/ProductPrice';
import { selectWishlistItems, removeFromWishlist, clearWishlist } from '../../redux/slices/wishlistSlice';
import { addToCart } from '../../redux/slices/cartSlice';

const WishlistPage = () => {
  const dispatch = useDispatch();
  const items = useSelector(selectWishlistItems);

  const handleAddToCart = (item) => {
    dispatch(
      addToCart({
        productId: item.id,
        variantId: item.variantId || 'default',
        sellerId: item.sellerId || 'unknown',
        sellerName: item.sellerName || 'Verified Orchard',
        name: item.name,
        price: item.price,
        weight: item.weight || '100g',
        image: item.image || '',
        quantity: 1,
        stock: 50,
      })
    );
  };

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title="Your Wishlist is Empty"
        description="Save your favorite dehydrated fruits here to track batches or purchase later."
        actionLabel="Explore Fruits"
        onAction={() => (window.location.href = '/explore')}
      />
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-forest/15">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-forest">My Saved Fruits</h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-1">
            {items.length} {items.length === 1 ? 'item' : 'items'} saved in your wishlist
          </p>
        </div>

        <button
          type="button"
          onClick={() => dispatch(clearWishlist())}
          className="text-xs font-semibold text-tomato hover:text-tomato-dark inline-flex items-center gap-1.5 self-start sm:self-center cursor-pointer transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Wishlist</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="group rounded-lg bg-oat-card border border-forest/15 shadow-2xs hover:border-forest/40 hover:-translate-y-0.5 transition-all overflow-hidden flex flex-col justify-between"
          >
            <div>
              {/* Product Image */}
              <Link to={`/products/${item.slug}`} className="block relative aspect-4/3 w-full bg-oat overflow-hidden">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-forest/20">
                    <Heart className="w-8 h-8 opacity-30" />
                  </div>
                )}
              </Link>

              {/* Product Info */}
              <div className="p-4 space-y-2">
                <Link to={`/products/${item.slug}`} className="block">
                  <h3 className="font-bold font-display text-forest text-sm hover:underline line-clamp-1 transition-colors">
                    {item.name}
                  </h3>
                </Link>

                <div className="flex items-center justify-between">
                  <ProductPrice price={item.price} size="sm" />
                  {item.weight && (
                    <span className="text-[11px] font-semibold text-forest bg-oat border border-forest/15 px-2 py-0.5 rounded-md">
                      {item.weight}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 pt-0 space-y-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleAddToCart(item)}
                className="w-full font-bold text-xs"
              >
                <ShoppingBag className="w-3.5 h-3.5 mr-1.5" />
                Add to Cart
              </Button>

              <button
                type="button"
                onClick={() => dispatch(removeFromWishlist(item.id))}
                className="w-full py-1 text-center text-[11px] font-medium text-ink-muted hover:text-tomato transition-colors cursor-pointer"
              >
                Remove from wishlist
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WishlistPage;
