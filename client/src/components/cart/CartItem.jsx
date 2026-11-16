import React from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, AlertCircle } from 'lucide-react';
import ProductPrice from '../common/ProductPrice';

const CartItem = ({
  item,
  onUpdateQuantity,
  onRemove,
  isUpdating = false,
}) => {
  const {
    productId,
    variantId,
    name,
    weight,
    price,
    mrp,
    quantity,
    image,
    stock = 99,
    slug,
    isOutOfStock = false,
  } = item;

  const handleDecrease = () => {
    if (quantity > 1) {
      onUpdateQuantity(productId, variantId, quantity - 1);
    } else {
      onRemove(productId, variantId);
    }
  };

  const handleIncrease = () => {
    if (quantity < stock) {
      onUpdateQuantity(productId, variantId, quantity + 1);
    }
  };

  const isMaxStockReached = quantity >= stock;

  return (
    <div className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-forest/10 last:border-b-0 transition-opacity ${
      isUpdating ? 'opacity-60 pointer-events-none' : ''
    }`}>
      {/* Product Image & Info */}
      <div className="flex items-center gap-4 min-w-0">
        <Link
          to={slug ? `/products/${slug}` : '#'}
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-md bg-oat border border-forest/15 overflow-hidden shrink-0 block relative"
        >
          {image ? (
            <img src={image} alt={name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-ink-subtle text-xs">
              Fruit
            </div>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-oat/90 backdrop-blur-xs flex items-center justify-center text-[10px] font-bold text-tomato">
              Sold Out
            </div>
          )}
        </Link>

        <div className="space-y-1 min-w-0">
          <Link
            to={slug ? `/products/${slug}` : '#'}
            className="font-bold text-sm sm:text-base font-display text-forest hover:underline line-clamp-1 transition-colors block"
          >
            {name}
          </Link>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-forest bg-oat border border-forest/15 px-2 py-0.5 rounded-md">
              Weight: {weight}
            </span>
            <span className="text-ink-muted">
              Unit: ₹{price}
            </span>
          </div>

          {isOutOfStock ? (
            <p className="text-xs font-semibold text-tomato flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> Out of stock
            </p>
          ) : isMaxStockReached && stock < 10 ? (
            <p className="text-[11px] text-[#C88E2D] font-medium">
              Only {stock} available in stock
            </p>
          ) : null}
        </div>
      </div>

      {/* Quantity Controls, Price & Remove Button */}
      <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-forest/10">
        {/* Quantity Toggle */}
        <div className="flex items-center border border-forest/20 rounded-md bg-oat shadow-2xs">
          <button
            type="button"
            onClick={handleDecrease}
            className="p-1.5 hover:bg-oat-dark/30 text-forest rounded-l-md transition-colors cursor-pointer"
            aria-label="Decrease quantity"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="w-8 text-center text-xs font-bold text-forest">{quantity}</span>
          <button
            type="button"
            onClick={handleIncrease}
            disabled={isMaxStockReached}
            className={`p-1.5 hover:bg-oat-dark/30 rounded-r-md transition-colors ${
              isMaxStockReached ? 'opacity-30 cursor-not-allowed' : 'text-forest cursor-pointer'
            }`}
            aria-label="Increase quantity"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Item Total Price */}
        <div className="text-right min-w-[70px]">
          <span className="font-bold font-display text-sm sm:text-base text-forest">
            ₹{(price * quantity).toFixed(2)}
          </span>
          {mrp > price && (
            <span className="block text-[10px] text-ink-subtle line-through">
              ₹{(mrp * quantity).toFixed(2)}
            </span>
          )}
        </div>

        {/* Remove Button */}
        <button
          type="button"
          onClick={() => onRemove(productId, variantId)}
          className="p-2 text-ink-muted hover:text-tomato hover:bg-tomato/10 rounded-md transition-colors cursor-pointer"
          title="Remove item"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default CartItem;