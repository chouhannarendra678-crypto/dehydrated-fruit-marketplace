import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Trash2, ShieldCheck } from 'lucide-react';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import SellerCartGroup from '../../components/cart/SellerCartGroup';
import CartSummary from '../../components/cart/CartSummary';
import {
  selectCartItems,
  selectCartItemsBySeller,
  selectCartSubtotal,
  updateQuantity,
  removeFromCart,
  clearCart,
} from '../../redux/slices/cartSlice';
import {
  useGetCartQuery,
  useUpdateCartItemQuantityMutation,
  useRemoveCartItemMutation,
  useClearCartMutation,
  useSyncGuestCartMutation,
  useValidateCheckoutMutation,
} from '../../services/cartApi';

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const token = useSelector((state) => state.auth.token);
  const isAuthenticated = Boolean(token);

  const localCartItems = useSelector(selectCartItems);
  const localSellerGroups = useSelector(selectCartItemsBySeller);
  const localSubtotal = useSelector(selectCartSubtotal);

  // Authenticated RTK Queries & Mutations
  const { data: serverCartData, refetch } = useGetCartQuery(undefined, {
    skip: !isAuthenticated,
  });

  const [updateServerQty] = useUpdateCartItemQuantityMutation();
  const [removeServerItem] = useRemoveCartItemMutation();
  const [clearServerCart] = useClearCartMutation();
  const [syncGuestCart] = useSyncGuestCartMutation();
  const [validateCheckout, { data: validationResult }] = useValidateCheckoutMutation();

  // On login or first mount with local cart items, sync with backend
  useEffect(() => {
    if (isAuthenticated && localCartItems.length > 0) {
      syncGuestCart(localCartItems).unwrap().then(() => {
        refetch();
      }).catch((err) => console.error('Cart sync error:', err));
    }
  }, [isAuthenticated]);

  // Recalculate server totals whenever items change
  useEffect(() => {
    if (localCartItems.length > 0) {
      validateCheckout({ items: localCartItems }).unwrap().catch(() => { });
    }
  }, [localCartItems]);

  const handleUpdateQuantity = async (productId, variantId, newQty) => {
    dispatch(updateQuantity({ productId, variantId, quantity: newQty }));

    if (isAuthenticated && serverCartData?.data?.items) {
      const serverItem = serverCartData.data.items.find(
        (i) => (i.product?._id === productId || i.product === productId) &&
          (i.variant?._id === variantId || i.variant === variantId)
      );
      if (serverItem?._id) {
        try {
          await updateServerQty({ itemId: serverItem._id, quantity: newQty }).unwrap();
        } catch (e) {
          console.error('Server qty update failed:', e);
        }
      }
    }
  };

  const handleRemove = async (productId, variantId) => {
    dispatch(removeFromCart({ productId, variantId }));

    if (isAuthenticated && serverCartData?.data?.items) {
      const serverItem = serverCartData.data.items.find(
        (i) => (i.product?._id === productId || i.product === productId) &&
          (i.variant?._id === variantId || i.variant === variantId)
      );
      if (serverItem?._id) {
        try {
          await removeServerItem(serverItem._id).unwrap();
        } catch (e) {
          console.error('Server item removal failed:', e);
        }
      }
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to empty your multi-vendor cart?')) {
      dispatch(clearCart());
      if (isAuthenticated) {
        try {
          await clearServerCart().unwrap();
        } catch (e) {
          console.error('Server clear cart failed:', e);
        }
      }
    }
  };

  if (localCartItems.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Your Multi-Vendor Cart is Empty"
        description="Discover pure sun-dried mangoes, spiced pineapples, dried figs, and berries from verified regional fruit orchards."
        actionLabel="Explore Fruit Catalog"
        onAction={() => (window.location.href = '/explore')}
      />
    );
  }

  // Use server recalculations if available, otherwise compute fallbacks
  const serverSummary = validationResult?.data?.summary || serverCartData?.data?.summary;
  const sellerGroups = validationResult?.data?.sellerGroups ||
    serverCartData?.data?.sellerGroups ||
    localSellerGroups.map((g) => ({
      sellerId: g.sellerId,
      sellerName: g.sellerName,
      items: g.items,
      subtotal: g.subtotal,
      shippingFee: g.subtotal >= 500 ? 0 : 50,
    }));

  const subtotal = serverSummary?.subtotal ?? localSubtotal;
  const shipping = serverSummary?.totalShipping ?? sellerGroups.reduce((acc, g) => acc + (g.shippingFee || 0), 0);
  const tax = serverSummary?.tax ?? Math.round(subtotal * 0.05);
  const grandTotal = serverSummary?.grandTotal ?? (subtotal + shipping + tax);
  const hasOutOfStock = serverSummary?.isValidForCheckout === false && (serverSummary?.validationErrors?.length > 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-forest/15">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-forest tracking-tight">
            Multi-Vendor Shopping Cart
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-1">
            Items from multiple regional fruit growers combined into a single, unified checkout.
          </p>
        </div>

        <button
          type="button"
          onClick={handleClearCart}
          className="text-xs font-semibold text-tomato hover:text-tomato-dark inline-flex items-center gap-1.5 self-start sm:self-center cursor-pointer transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Cart</span>
        </button>
      </div>

      {/* Main Cart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Seller Cart Groups */}
        <div className="lg:col-span-2 space-y-6">
          {sellerGroups.map((group) => (
            <SellerCartGroup
              key={group.seller?._id || group.sellerId}
              group={group}
              onUpdateQuantity={handleUpdateQuantity}
              onRemove={handleRemove}
            />
          ))}

          {/* Sourcing Guarantee Card */}
          <div className="p-4 sm:p-5 rounded-lg bg-oat-card border border-forest/15 flex items-center justify-between gap-4 text-xs text-ink shadow-2xs">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-forest shrink-0" />
              <span>
                All fruits are vacuum-packed at source orchards under strict FSSAI food hygiene parameters.
              </span>
            </div>
            <Link to="/explore" className="font-bold text-forest hover:underline shrink-0 text-[11px]">
              + Add More Fruits
            </Link>
          </div>
        </div>

        {/* Right Column: Order Summary & Checkout Trigger */}
        <div className="lg:col-span-1 sticky top-24">
          <CartSummary
            subtotal={subtotal}
            shipping={shipping}
            tax={tax}
            grandTotal={grandTotal}
            sellerCount={sellerGroups.length}
            itemCount={localCartItems.reduce((acc, i) => acc + i.quantity, 0)}
            hasOutOfStock={hasOutOfStock}
            onProceed={() => navigate('/checkout')}
          />
        </div>
      </div>
    </div>
  );
};

export default CartPage;