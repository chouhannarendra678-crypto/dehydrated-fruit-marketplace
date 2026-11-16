const commissionService = require('../services/commission.service');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/apiResponse');

/**
 * Admin: Get global platform commission configuration and statistics
 */
const getCommissionConfig = asyncHandler(async (req, res) => {
  const data = await commissionService.getCommissionConfig();
  return successResponse(res, {
    statusCode: 200,
    message: 'Commission configuration retrieved successfully',
    data,
  });
});

/**
 * Admin: Update global platform commission rate
 */
const updateCommissionConfig = asyncHandler(async (req, res) => {
  const { defaultCommissionRate, minCommissionRate, maxCommissionRate, minPayoutAmount } = req.body;
  const config = await commissionService.updateCommissionConfig({
    defaultCommissionRate,
    minCommissionRate,
    maxCommissionRate,
    minPayoutAmount,
    adminUserId: req.user._id,
  });

  return successResponse(res, {
    statusCode: 200,
    message: 'Global commission configuration updated successfully',
    data: { config },
  });
});

/**
 * Admin: Get all sellers with their active commission rates
 */
const getSellerCommissions = asyncHandler(async (req, res) => {
  const { page, limit, search } = req.query;
  const data = await commissionService.getSellerCommissions({ page, limit, search });
  return successResponse(res, {
    statusCode: 200,
    message: 'Seller commission rates retrieved successfully',
    data,
  });
});

/**
 * Admin: Update individual seller custom commission rate
 */
const updateSellerCommission = asyncHandler(async (req, res) => {
  const { commissionRate } = req.body;
  const seller = await commissionService.updateSellerCommission(req.params.sellerId, {
    commissionRate,
    adminUserId: req.user._id,
  });

  return successResponse(res, {
    statusCode: 200,
    message: 'Seller commission rate updated successfully',
    data: { seller },
  });
});

module.exports = {
  getCommissionConfig,
  updateCommissionConfig,
  getSellerCommissions,
  updateSellerCommission,
};
