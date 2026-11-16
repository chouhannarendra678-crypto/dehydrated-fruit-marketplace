const express = require('express');
const {
  createOrder,
  getCustomerOrders,
  getCustomerOrderById,
  cancelCustomerOrder,
  getSellerOrders,
  getSellerOrderById,
  updateSellerOrderStatus,
  getAdminOrders,
  getAdminOrderById,
  adminUpdateOrderStatus,
} = require('../controllers/order.controller');
const authenticate = require('../middleware/auth.middleware');
const authorizeRoles = require('../middleware/role.middleware');
const { ROLES } = require('../constants/roles.constants');

const router = express.Router();

// All order operations require authentication
router.use(authenticate);

// --- Seller Order Routes ---
router.get('/seller/my-orders', authorizeRoles(ROLES.SELLER), getSellerOrders);
router.get('/seller/orders/:id', authorizeRoles(ROLES.SELLER), getSellerOrderById);
router.patch('/seller/orders/:id/status', authorizeRoles(ROLES.SELLER), updateSellerOrderStatus);

// --- Admin Order Routes ---
router.get('/admin/all', authorizeRoles(ROLES.ADMIN), getAdminOrders);
router.get('/admin/:id', authorizeRoles(ROLES.ADMIN), getAdminOrderById);
router.patch('/admin/:id/status', authorizeRoles(ROLES.ADMIN), adminUpdateOrderStatus);

// --- Customer Order Routes ---
router.route('/')
  .post(createOrder)
  .get(getCustomerOrders);

router.get('/:id', getCustomerOrderById);
router.post('/:id/cancel', cancelCustomerOrder);

module.exports = router;
