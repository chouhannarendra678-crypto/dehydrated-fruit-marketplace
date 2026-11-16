const sellerService = require('../services/seller.service');
const { successResponse } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Get currently logged-in seller profile
 * @route   GET /api/v1/sellers/me
 * @access  Protected (Seller)
 */
const getMyProfile = asyncHandler(async (req, res) => {
  const profile = await sellerService.getSellerProfile(req.user._id);

  return successResponse(res, {
    statusCode: 200,
    message: 'Seller profile retrieved successfully',
    data: { seller: profile },
  });
});

/**
 * @desc    Update store, business, FSSAI, address, or bank details
 * @route   PUT /api/v1/sellers/me
 * @access  Protected (Seller)
 */
const updateMyProfile = asyncHandler(async (req, res) => {
  const updated = await sellerService.updateSellerProfile(req.user._id, req.body);

  return successResponse(res, {
    statusCode: 200,
    message: 'Seller profile updated successfully',
    data: { seller: updated },
  });
});

/**
 * @desc    Get dashboard metrics for seller hub
 * @route   GET /api/v1/sellers/dashboard-stats
 * @access  Protected (Seller)
 */
const getMyDashboardStats = asyncHandler(async (req, res) => {
  const stats = await sellerService.getSellerDashboardStats(req.seller._id);

  return successResponse(res, {
    statusCode: 200,
    message: 'Dashboard metrics retrieved',
    data: { stats },
  });
});

/**
 * @desc    Public endpoint to view a seller store page
 * @route   GET /api/v1/sellers/store/:slug
 * @access  Public
 */
const getStoreBySlug = asyncHandler(async (req, res) => {
  const store = await sellerService.getSellerStoreBySlug(req.params.slug);

  return successResponse(res, {
    statusCode: 200,
    message: 'Storefront details retrieved',
    data: { store },
  });
});

/**
 * @desc    Public endpoint to list approved sellers
 * @route   GET /api/v1/sellers
 * @access  Public
 */
const getPublicSellers = asyncHandler(async (req, res) => {
  const sellers = await sellerService.getPublicSellers(req.query);

  return successResponse(res, {
    statusCode: 200,
    message: 'Approved sellers retrieved',
    data: { sellers },
  });
});

/**
 * @desc    Admin: List all sellers
 * @route   GET /api/v1/sellers/admin/all
 * @access  Protected (Admin)
 */
const adminGetAllSellers = asyncHandler(async (req, res) => {
  const result = await sellerService.getAllSellers(req.query);

  return successResponse(res, {
    statusCode: 200,
    message: 'Sellers list retrieved',
    data: result,
  });
});

/**
 * @desc    Admin: Approve, Reject, or Suspend seller
 * @route   PATCH /api/v1/sellers/admin/:id/status
 * @access  Protected (Admin)
 */
const adminUpdateSellerStatus = asyncHandler(async (req, res) => {
  const seller = await sellerService.updateSellerStatus(req.params.id, req.body);

  return successResponse(res, {
    statusCode: 200,
    message: `Seller status successfully updated to ${seller.status}`,
    data: { seller },
  });
});

/**
 * @desc    Test protected selling action (e.g. creating product) to verify isApprovedSeller middleware
 * @route   POST /api/v1/sellers/test-sell-permission
 * @access  Protected (Approved Seller only)
 */
const checkSellingPermission = asyncHandler(async (req, res) => {
  return successResponse(res, {
    statusCode: 200,
    message: 'Selling authorization verified. Seller is approved to publish dehydrated fruits.',
    data: {
      sellerId: req.seller._id,
      storeName: req.seller.storeName,
      status: req.seller.status,
    },
  });
});

module.exports = {
  getMyProfile,
  updateMyProfile,
  getMyDashboardStats,
  getStoreBySlug,
  getPublicSellers,
  adminGetAllSellers,
  adminUpdateSellerStatus,
  checkSellingPermission,
};
