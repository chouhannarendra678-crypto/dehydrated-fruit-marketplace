const express = require('express');
const {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/category.controller');
const { validateCategoryInput } = require('../validators/category.validator');
const authenticate = require('../middleware/auth.middleware');
const authorizeRoles = require('../middleware/role.middleware');
const { ROLES } = require('../constants/roles.constants');

const router = express.Router();

// Public routes
router.get('/', getCategories);
router.get('/:slug', getCategoryBySlug);

// Admin protected routes
router.post(
  '/',
  authenticate,
  authorizeRoles(ROLES.ADMIN),
  validateCategoryInput,
  createCategory
);

router.put(
  '/:id',
  authenticate,
  authorizeRoles(ROLES.ADMIN),
  validateCategoryInput,
  updateCategory
);

router.delete(
  '/:id',
  authenticate,
  authorizeRoles(ROLES.ADMIN),
  deleteCategory
);

module.exports = router;
