import { createSlice } from '@reduxjs/toolkit';

const loadCartFromStorage = () => {
  try {
    const saved = localStorage.getItem('dehydrated_cart');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const saveCartToStorage = (items) => {
  try {
    localStorage.setItem('dehydrated_cart', JSON.stringify(items));
  } catch (e) {
    console.error('Failed to persist cart:', e);
  }
};

const initialState = {
  items: loadCartFromStorage(),
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload; // { productId, variantId, sellerId, sellerName, name, price, weight, image, quantity }
      const existingIndex = state.items.findIndex(
        (i) => i.productId === item.productId && i.variantId === item.variantId
      );

      if (existingIndex > -1) {
        state.items[existingIndex].quantity += item.quantity || 1;
      } else {
        state.items.push({ ...item, quantity: item.quantity || 1 });
      }

      saveCartToStorage(state.items);
    },
    updateQuantity: (state, action) => {
      const { productId, variantId, quantity } = action.payload;
      const index = state.items.findIndex(
        (i) => i.productId === productId && i.variantId === variantId
      );

      if (index > -1) {
        if (quantity <= 0) {
          state.items.splice(index, 1);
        } else {
          state.items[index].quantity = quantity;
        }
      }

      saveCartToStorage(state.items);
    },
    removeFromCart: (state, action) => {
      const { productId, variantId } = action.payload;
      state.items = state.items.filter(
        (i) => !(i.productId === productId && i.variantId === variantId)
      );
      saveCartToStorage(state.items);
    },
    clearCart: (state) => {
      state.items = [];
      saveCartToStorage([]);
    },
    setCartItems: (state, action) => {
      state.items = action.payload || [];
      saveCartToStorage(state.items);
    },
  },
});

export const { addToCart, updateQuantity, removeFromCart, clearCart, setCartItems } = cartSlice.actions;

export const selectCartItems = (state) => state.cart.items;

export const selectCartItemCount = (state) =>
  state.cart.items.reduce((total, item) => total + item.quantity, 0);

export const selectCartSubtotal = (state) =>
  state.cart.items.reduce((total, item) => total + item.price * item.quantity, 0);

// Group cart items by seller for multi-vendor checkout and display
export const selectCartItemsBySeller = (state) => {
  const groups = {};
  state.cart.items.forEach((item) => {
    const sellerId = item.sellerId || 'unknown_seller';
    if (!groups[sellerId]) {
      groups[sellerId] = {
        sellerId,
        sellerName: item.sellerName || 'Verified Fruit Vendor',
        items: [],
        subtotal: 0,
      };
    }
    groups[sellerId].items.push(item);
    groups[sellerId].subtotal += item.price * item.quantity;
  });
  return Object.values(groups);
};

export default cartSlice.reducer;

