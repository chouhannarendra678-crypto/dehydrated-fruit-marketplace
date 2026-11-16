const express = require('express');
const {
  checkEligibility,
  createProductReview,
  getProductReviews,
  createSellerReview,
  getSellerReviews,
  getSellerDashboardReviews,
  sellerReplyToReview,
  getAdminReviews,
  adminModerateReview,
} = require('../controllers/review.controller');
const authenticate = require('../middleware/auth.middleware');
const authorizeRoles = require('../middleware/role.middleware');
const { ROLES } = require('../constants/roles.constants');

const router = express.Router();

// --- Public Product & Seller Review Lists ---
router.get('/products/:productId', getProductReviews);
router.get('/sellers/:sellerId', getSellerReviews);

// --- Authenticated Customer Review Endpoints ---
router.get('/eligibility', authenticate, checkEligibility);
router.post('/products/:productId', authenticate, createProductReview);
router.post('/sellers/:sellerId', authenticate, createSellerReview);

// --- Seller Review Dashboard & Reply ---
router.get('/seller/my-reviews', authenticate, authorizeRoles(ROLES.SELLER), getSellerDashboardReviews);
router.post('/seller/:id/reply', authenticate, authorizeRoles(ROLES.SELLER), sellerReplyToReview);

// --- Admin Review Moderation ---
router.get('/admin/all', authenticate, authorizeRoles(ROLES.ADMIN), getAdminReviews);
router.patch('/admin/:id/status', authenticate, authorizeRoles(ROLES.ADMIN), adminModerateReview);

module.exports = router;
