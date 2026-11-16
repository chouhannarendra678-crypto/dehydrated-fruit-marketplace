const adminService = require('../services/admin.service');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/apiResponse');

/**
 * Admin: Marketplace Executive Dashboard KPIs & Analytics
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  const data = await adminService.getDashboardStats();
  return successResponse(res, {
    statusCode: 200,
    message: 'Dashboard analytics retrieved successfully',
    data,
  });
});

/**
 * Admin: Customer directory listing
 */
const getCustomers = asyncHandler(async (req, res) => {
  const { page, limit, search } = req.query;
  const data = await adminService.getCustomers({ page, limit, search });
  return successResponse(res, {
    statusCode: 200,
    message: 'Customers retrieved successfully',
    data,
  });
});

/**
 * Admin: Single customer details with addresses and orders
 */
const getCustomerById = asyncHandler(async (req, res) => {
  const data = await adminService.getCustomerById(req.params.id);
  return successResponse(res, {
    statusCode: 200,
    message: 'Customer details retrieved successfully',
    data,
  });
});

/**
 * Admin: Get global marketplace settings
 */
const getPlatformSettings = asyncHandler(async (req, res) => {
  const data = await adminService.getPlatformSettings();
  return successResponse(res, {
    statusCode: 200,
    message: 'Platform settings retrieved successfully',
    data: { settings: data },
  });
});

/**
 * Admin: Update global marketplace settings
 */
const updatePlatformSettings = asyncHandler(async (req, res) => {
  const data = await adminService.updatePlatformSettings(req.body, req.user._id);
  return successResponse(res, {
    statusCode: 200,
    message: 'Platform settings updated successfully',
    data: { settings: data },
  });
});

module.exports = {
  getDashboardStats,
  getCustomers,
  getCustomerById,
  getPlatformSettings,
  updatePlatformSettings,
};
