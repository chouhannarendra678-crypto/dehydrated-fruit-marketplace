const cartService = require('../services/cart.service');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/apiResponse');

/**
 * Get user's cart with real-time recalculations
 */
const getCart = asyncHandler(async (req, res) => {
  const cartData = await cartService.getCart(req.user._id);
  return successResponse(res, {
    statusCode: 200,
    message: 'Cart retrieved successfully',
    data: cartData,
  });
});

/**
 * Add item to cart
 */
const addItem = asyncHandler(async (req, res) => {
  const { productId, variantId, quantity } = req.body;
  const cartData = await cartService.addItem(req.user._id, { productId, variantId, quantity });
  return successResponse(res, {
    statusCode: 200,
    message: 'Item added to cart',
    data: cartData,
  });
});

/**
 * Update item quantity
 */
const updateQuantity = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const cartData = await cartService.updateItemQuantity(req.user._id, req.params.itemId, quantity);
  return successResponse(res, {
    statusCode: 200,
    message: 'Cart item quantity updated',
    data: cartData,
  });
});

/**
 * Remove item from cart
 */
const removeItem = asyncHandler(async (req, res) => {
  const cartData = await cartService.removeItem(req.user._id, req.params.itemId);
  return successResponse(res, {
    statusCode: 200,
    message: 'Item removed from cart',
    data: cartData,
  });
});

/**
 * Clear cart
 */
const clearCart = asyncHandler(async (req, res) => {
  const cartData = await cartService.clearCart(req.user._id);
  return successResponse(res, {
    statusCode: 200,
    message: 'Cart cleared successfully',
    data: cartData,
  });
});

/**
 * Sync guest cart items into DB cart upon customer sign-in
 */
const syncGuestCart = asyncHandler(async (req, res) => {
  const { items } = req.body;
  const cartData = await cartService.syncGuestCart(req.user._id, items);
  return successResponse(res, {
    statusCode: 200,
    message: 'Guest cart synced successfully',
    data: cartData,
  });
});

/**
 * Validate and calculate checkout summary (server-side validation)
 */
const validateCheckout = asyncHandler(async (req, res) => {
  const userId = req.user ? req.user._id : null;
  const { items, addressId } = req.body;
  const checkoutData = await cartService.validateCheckout(userId, { items, addressId });
  return successResponse(res, {
    statusCode: 200,
    message: 'Checkout validation and recalculation complete',
    data: checkoutData,
  });
});

module.exports = {
  getCart,
  addItem,
  updateQuantity,
  removeItem,
  clearCart,
  syncGuestCart,
  validateCheckout,
};
