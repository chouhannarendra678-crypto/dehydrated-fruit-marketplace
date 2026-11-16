export const ROUTES = {
  // Public Customer Routes
  HOME: '/',
  EXPLORE: '/explore',
  PRODUCT_DETAILS: '/products/:slug',
  SELLER_STORE: '/sellers/:slug',
  CATEGORY: '/categories/:slug',

  // Customer Protected
  CART: '/cart',
  CHECKOUT: '/checkout',
  ORDERS: '/orders',
  ORDER_DETAILS: '/orders/:id',
  WISHLIST: '/wishlist',
  PROFILE: '/profile',

  // Auth Routes
  LOGIN: '/login',
  REGISTER: '/register',
  SELLER_REGISTER: '/seller/register',
  FORGOT_PASSWORD: '/forgot-password',

  // Seller Dashboard Routes
  SELLER_DASHBOARD: '/seller/dashboard',
  SELLER_PRODUCTS: '/seller/products',
  SELLER_ORDERS: '/seller/orders',
  SELLER_INVENTORY: '/seller/inventory',
  SELLER_EARNINGS: '/seller/earnings',
  SELLER_PAYOUTS: '/seller/payouts',
  SELLER_REVIEWS: '/seller/reviews',
  SELLER_PROFILE: '/seller/store-profile',
  SELLER_SETTINGS: '/seller/settings',

  // Admin Dashboard Routes
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_SELLERS: '/admin/sellers',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_CUSTOMERS: '/admin/customers',
  ADMIN_PAYOUTS: '/admin/payouts',
  ADMIN_COMMISSIONS: '/admin/commissions',
  ADMIN_REVIEWS: '/admin/reviews',
  ADMIN_CATEGORIES: '/admin/categories',
  ADMIN_SETTINGS: '/admin/settings',
};

