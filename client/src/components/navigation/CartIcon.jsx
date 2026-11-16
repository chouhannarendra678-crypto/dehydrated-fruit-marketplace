import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { selectCartItemCount } from '../../redux/slices/cartSlice';

const CartIcon = ({ className = '' }) => {
  const itemCount = useSelector(selectCartItemCount);

  return (
    <Link
      to="/cart"
      className={`relative p-2 rounded-md text-forest hover:bg-oat-dark/40 transition-colors flex items-center justify-center ${className}`}
      aria-label="View Cart"
    >
      <ShoppingBag className="w-5 h-5 text-forest" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-tomato text-white font-bold text-[10px] min-w-4.5 h-4.5 px-1 rounded-full flex items-center justify-center shadow-xs">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </Link>
  );
};

export default CartIcon;

