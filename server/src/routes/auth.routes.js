const express = require('express');
const {
  registerCustomer,
  registerSeller,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  verifyEmail,
} = require('../controllers/auth.controller');
const {
  validateCustomerRegister,
  validateSellerRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
} = require('../validators/auth.validator');
const authenticate = require('../middleware/auth.middleware');
const authorizeRoles = require('../middleware/role.middleware');
const { ROLES } = require('../constants/roles.constants');
const { successResponse } = require('../utils/apiResponse');

const router = express.Router();

// Public auth endpoints
router.post('/register', validateCustomerRegister, registerCustomer);
router.post('/seller/register', validateSellerRegister, registerSeller);
router.post('/login', validateLogin, login);
router.post('/logout', logout);
router.post('/forgot-password', validateForgotPassword, forgotPassword);
router.post('/reset-password/:token', validateResetPassword, resetPassword);
router.get('/verify-email/:token', verifyEmail);

// Protected endpoints
router.get('/me', authenticate, getMe);

// Verification routes for role authorization tests
router.get(
  '/test-role/customer',
  authenticate,
  authorizeRoles(ROLES.CUSTOMER, ROLES.ADMIN),
  (req, res) => {
    return successResponse(res, {
      statusCode: 200,
      message: 'Access granted to customer area',
      data: { user: req.user },
    });
  }
);

router.get(
  '/test-role/seller',
  authenticate,
  authorizeRoles(ROLES.SELLER, ROLES.ADMIN),
  (req, res) => {
    return successResponse(res, {
      statusCode: 200,
      message: 'Access granted to seller area',
      data: { user: req.user },
    });
  }
);

router.get(
  '/test-role/admin',
  authenticate,
  authorizeRoles(ROLES.ADMIN),
  (req, res) => {
    return successResponse(res, {
      statusCode: 200,
      message: 'Access granted to admin area',
      data: { user: req.user },
    });
  }
);

module.exports = router;
