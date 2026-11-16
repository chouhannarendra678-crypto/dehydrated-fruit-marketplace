import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  mobileMenuOpen: false,
  cartDrawerOpen: false,
  notification: null, // { type: 'success' | 'error' | 'info', message: '' }
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },
    setMobileMenuOpen: (state, action) => {
      state.mobileMenuOpen = action.payload;
    },
    toggleCartDrawer: (state) => {
      state.cartDrawerOpen = !state.cartDrawerOpen;
    },
    setCartDrawerOpen: (state, action) => {
      state.cartDrawerOpen = action.payload;
    },
    showNotification: (state, action) => {
      state.notification = action.payload;
    },
    clearNotification: (state) => {
      state.notification = null;
    },
  },
});

export const {
  toggleMobileMenu,
  setMobileMenuOpen,
  toggleCartDrawer,
  setCartDrawerOpen,
  showNotification,
  clearNotification,
} = uiSlice.actions;

export const selectMobileMenuOpen = (state) => state.ui.mobileMenuOpen;
export const selectCartDrawerOpen = (state) => state.ui.cartDrawerOpen;
export const selectNotification = (state) => state.ui.notification;

export default uiSlice.reducer;

