const express = require('express');
const {
  getCart,
  addItem,
  updateQuantity,
  removeItem,
  clearCart,
  syncGuestCart,
  validateCheckout,
} = require('../controllers/cart.controller');
const authenticate = require('../middleware/auth.middleware');

const router = express.Router();

// Checkout validation (server-side recalculation of prices, stock, shipping, grand total)
router.post('/validate-checkout', authenticate, validateCheckout);

// Logged-in customer cart routes
router.use(authenticate);

router.route('/')
  .get(getCart)
  .delete(clearCart);

router.post('/items', addItem);
router.post('/sync', syncGuestCart);

router.route('/items/:itemId')
  .put(updateQuantity)
  .delete(removeItem);

module.exports = router;
