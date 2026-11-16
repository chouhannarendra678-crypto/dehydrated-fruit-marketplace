const authService = require('../services/auth.service');
const { successResponse } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Register a new customer
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
const registerCustomer = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;
  const result = await authService.registerCustomer({ name, email, password, phone });

  return successResponse(res, {
    statusCode: 201,
    message: 'Customer account registered successfully',
    data: result,
  });
});

/**
 * @desc    Register a new seller
 * @route   POST /api/v1/auth/seller/register
 * @access  Public
 */
const registerSeller = asyncHandler(async (req, res) => {
  const { name, email, password, storeName, phone } = req.body;
  const result = await authService.registerSeller({
    name,
    email,
    password,
    storeName,
    phone,
  });

  return successResponse(res, {
    statusCode: 201,
    message: 'Seller account registered successfully. Verification pending.',
    data: result,
  });
});

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.loginUser({ email, password });

  return successResponse(res, {
    statusCode: 200,
    message: 'Login successful',
    data: result,
  });
});

/**
 * @desc    Logout user / invalidate session
 * @route   POST /api/v1/auth/logout
 * @access  Public / Protected
 */
const logout = asyncHandler(async (req, res) => {
  return successResponse(res, {
    statusCode: 200,
    message: 'Logout successful',
    data: {},
  });
});

/**
 * @desc    Get currently logged-in user profile
 * @route   GET /api/v1/auth/me
 * @access  Protected (Customer, Seller, Admin)
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getUserProfile(req.user._id);

  return successResponse(res, {
    statusCode: 200,
    message: 'Profile retrieved successfully',
    data: { user },
  });
});

/**
 * @desc    Forgot password request
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const result = await authService.forgotPassword(email);

  return successResponse(res, {
    statusCode: 200,
    message: result.message,
    data: result,
  });
});

/**
 * @desc    Reset password using token
 * @route   POST /api/v1/auth/reset-password/:token
 * @access  Public
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  const result = await authService.resetPassword(token, password);

  return successResponse(res, {
    statusCode: 200,
    message: result.message,
    data: result,
  });
});

/**
 * @desc    Verify email address
 * @route   GET /api/v1/auth/verify-email/:token
 * @access  Public
 */
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const result = await authService.verifyEmail(token);

  return successResponse(res, {
    statusCode: 200,
    message: result.message,
    data: result,
  });
});

module.exports = {
  registerCustomer,
  registerSeller,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  verifyEmail,
};
