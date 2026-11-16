const express = require('express');
const {
  createProduct,
  getSellerProducts,
  updateProduct,
  deleteProduct,
  getPublicProducts,
  getProductBySlug,
  adminGetAllProducts,
  adminUpdateProductStatus,
  uploadProductImage,
} = require('../controllers/product.controller');
const {
  validateProductInput,
  validateProductStatusUpdate,
} = require('../validators/product.validator');
const authenticate = require('../middleware/auth.middleware');
const authorizeRoles = require('../middleware/role.middleware');
const { isSeller, isApprovedSeller } = require('../middleware/seller.middleware');
const { ROLES } = require('../constants/roles.constants');

const router = express.Router();

// Public product exploration & details
router.get('/', getPublicProducts);
router.get('/:slug', getProductBySlug);

// Seller endpoints (Gated by isSeller and isApprovedSeller)
router.post(
  '/',
  authenticate,
  isSeller,
  isApprovedSeller,
  validateProductInput,
  createProduct
);

router.get(
  '/seller/my-products',
  authenticate,
  isSeller,
  getSellerProducts
);

router.put(
  '/:id',
  authenticate,
  isSeller,
  isApprovedSeller,
  validateProductInput,
  updateProduct
);

router.delete(
  '/:id',
  authenticate,
  isSeller,
  isApprovedSeller,
  deleteProduct
);

router.post(
  '/upload-image',
  authenticate,
  isSeller,
  uploadProductImage
);

// Admin moderation endpoints
router.get(
  '/admin/all',
  authenticate,
  authorizeRoles(ROLES.ADMIN),
  adminGetAllProducts
);

router.patch(
  '/admin/:id/status',
  authenticate,
  authorizeRoles(ROLES.ADMIN),
  validateProductStatusUpdate,
  adminUpdateProductStatus
);

module.exports = router;
