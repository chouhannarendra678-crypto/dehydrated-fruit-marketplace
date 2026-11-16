const express = require('express');
const {
  getMyProfile,
  updateMyProfile,
  getMyDashboardStats,
  getStoreBySlug,
  getPublicSellers,
  adminGetAllSellers,
  adminUpdateSellerStatus,
  checkSellingPermission,
} = require('../controllers/seller.controller');
const {
  validateUpdateProfile,
  validateStatusUpdate,
} = require('../validators/seller.validator');
const authenticate = require('../middleware/auth.middleware');
const authorizeRoles = require('../middleware/role.middleware');
const { isSeller, isApprovedSeller } = require('../middleware/seller.middleware');
const { ROLES } = require('../constants/roles.constants');

const router = express.Router();

// Public routes
router.get('/', getPublicSellers);
router.get('/store/:slug', getStoreBySlug);

// Seller protected routes
router.get('/me', authenticate, isSeller, getMyProfile);
router.put('/me', authenticate, isSeller, validateUpdateProfile, updateMyProfile);
router.get('/dashboard-stats', authenticate, isSeller, getMyDashboardStats);

// Selling capability check - strictly gated by isApprovedSeller
router.post(
  '/test-sell-permission',
  authenticate,
  isSeller,
  isApprovedSeller,
  checkSellingPermission
);

// Admin-only management routes
router.get(
  '/admin/all',
  authenticate,
  authorizeRoles(ROLES.ADMIN),
  adminGetAllSellers
);
router.patch(
  '/admin/:id/status',
  authenticate,
  authorizeRoles(ROLES.ADMIN),
  validateStatusUpdate,
  adminUpdateSellerStatus
);

module.exports = router;
