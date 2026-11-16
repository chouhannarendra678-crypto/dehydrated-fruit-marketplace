const express = require('express');
const {
  getSellerEarnings,
  getSellerPayouts,
  getSellerPayoutById,
  getAdminOverview,
  getAdminEligibleOrders,
  generatePayout,
  updatePayoutStatus,
  getAdminPayouts,
  getAdminPayoutById,
} = require('../controllers/payout.controller');
const authenticate = require('../middleware/auth.middleware');
const authorizeRoles = require('../middleware/role.middleware');
const { isSeller, isApprovedSeller } = require('../middleware/seller.middleware');
const { ROLES } = require('../constants/roles.constants');

const router = express.Router();

// ==========================================
// SELLER PROTECTED ROUTES
// Seller can see ONLY their own financial information
// ==========================================
router.get(
  '/seller/earnings',
  authenticate,
  isSeller,
  isApprovedSeller,
  getSellerEarnings
);

router.get(
  '/seller/history',
  authenticate,
  isSeller,
  isApprovedSeller,
  getSellerPayouts
);

router.get(
  '/seller/:id',
  authenticate,
  isSeller,
  isApprovedSeller,
  getSellerPayoutById
);

// ==========================================
// ADMIN ONLY ROUTES
// Super Admin can see and manage all platform payouts
// ==========================================
router.get(
  '/admin/overview',
  authenticate,
  authorizeRoles(ROLES.ADMIN),
  getAdminOverview
);

router.get(
  '/admin/eligible-orders',
  authenticate,
  authorizeRoles(ROLES.ADMIN),
  getAdminEligibleOrders
);

router.post(
  '/admin/generate',
  authenticate,
  authorizeRoles(ROLES.ADMIN),
  generatePayout
);

router.patch(
  '/admin/:id/status',
  authenticate,
  authorizeRoles(ROLES.ADMIN),
  updatePayoutStatus
);

router.get(
  '/admin/all',
  authenticate,
  authorizeRoles(ROLES.ADMIN),
  getAdminPayouts
);

router.get(
  '/admin/:id',
  authenticate,
  authorizeRoles(ROLES.ADMIN),
  getAdminPayoutById
);

module.exports = router;
