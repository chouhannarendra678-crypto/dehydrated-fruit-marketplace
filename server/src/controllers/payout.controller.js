const payoutService = require('../services/payout.service');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/apiResponse');

/**
 * Seller: Get earnings, gross sales, platform commissions and net balances
 */
const getSellerEarnings = asyncHandler(async (req, res) => {
  const data = await payoutService.getSellerEarnings(req.user._id);
  return successResponse(res, {
    statusCode: 200,
    message: 'Seller earnings retrieved successfully',
    data,
  });
});

/**
 * Seller: Get payout history
 */
const getSellerPayouts = asyncHandler(async (req, res) => {
  const { page, limit, status } = req.query;
  const data = await payoutService.getSellerPayouts(req.user._id, { page, limit, status });
  return successResponse(res, {
    statusCode: 200,
    message: 'Seller payouts history retrieved successfully',
    data,
  });
});

/**
 * Seller: Get specific payout details
 */
const getSellerPayoutById = asyncHandler(async (req, res) => {
  const payout = await payoutService.getSellerPayoutById(req.user._id, req.params.id);
  return successResponse(res, {
    statusCode: 200,
    message: 'Payout details retrieved successfully',
    data: { payout },
  });
});

/**
 * Admin: Platform financial KPI overview
 */
const getAdminOverview = asyncHandler(async (req, res) => {
  const data = await payoutService.getAdminOverview();
  return successResponse(res, {
    statusCode: 200,
    message: 'Admin financial overview retrieved successfully',
    data,
  });
});

/**
 * Admin: Get eligible pending orders grouped by seller
 */
const getAdminEligibleOrders = asyncHandler(async (req, res) => {
  const data = await payoutService.getAdminEligibleOrders();
  return successResponse(res, {
    statusCode: 200,
    message: 'Eligible orders for payout retrieved successfully',
    data: { sellers: data },
  });
});

/**
 * Admin: Generate a new payout for a seller
 */
const generatePayout = asyncHandler(async (req, res) => {
  const { sellerId, sellerOrderIds, paymentMethod, notes } = req.body;
  const payout = await payoutService.generatePayout({
    sellerId,
    sellerOrderIds,
    paymentMethod,
    notes,
    adminUserId: req.user._id,
  });

  return successResponse(res, {
    statusCode: 201,
    message: 'Payout generated successfully',
    data: { payout },
  });
});

/**
 * Admin: Update payout status (PROCESSING, PAID, FAILED)
 */
const updatePayoutStatus = asyncHandler(async (req, res) => {
  const { status, transactionReference, failureReason, notes } = req.body;
  const payout = await payoutService.updatePayoutStatus(req.params.id, {
    status,
    transactionReference,
    failureReason,
    notes,
    adminUserId: req.user._id,
  });

  return successResponse(res, {
    statusCode: 200,
    message: `Payout status updated to ${status}`,
    data: { payout },
  });
});

/**
 * Admin: List all payouts across sellers
 */
const getAdminPayouts = asyncHandler(async (req, res) => {
  const { page, limit, status, sellerId } = req.query;
  const data = await payoutService.getAdminPayouts({ page, limit, status, sellerId });
  return successResponse(res, {
    statusCode: 200,
    message: 'All payouts retrieved successfully',
    data,
  });
});

/**
 * Admin: Get single payout details
 */
const getAdminPayoutById = asyncHandler(async (req, res) => {
  const payout = await payoutService.getAdminPayoutById(req.params.id);
  return successResponse(res, {
    statusCode: 200,
    message: 'Admin payout details retrieved successfully',
    data: { payout },
  });
});

module.exports = {
  getSellerEarnings,
  getSellerPayouts,
  getSellerPayoutById,
  getAdminOverview,
  getAdminEligibleOrders,
  generatePayout,
  updatePayoutStatus,
  getAdminPayouts,
  getAdminPayoutById,
};
