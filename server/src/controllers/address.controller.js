const addressService = require('../services/address.service');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/apiResponse');

/**
 * Get all addresses for logged-in user
 */
const getAddresses = asyncHandler(async (req, res) => {
  const addresses = await addressService.getAddresses(req.user._id);
  return successResponse(res, {
    statusCode: 200,
    message: 'Addresses retrieved successfully',
    data: { addresses },
  });
});

/**
 * Get single address by ID
 */
const getAddressById = asyncHandler(async (req, res) => {
  const address = await addressService.getAddressById(req.user._id, req.params.id);
  return successResponse(res, {
    statusCode: 200,
    message: 'Address retrieved successfully',
    data: { address },
  });
});

/**
 * Create new delivery address
 */
const createAddress = asyncHandler(async (req, res) => {
  const address = await addressService.createAddress(req.user._id, req.body);
  return successResponse(res, {
    statusCode: 201,
    message: 'Address added successfully',
    data: { address },
  });
});

/**
 * Update delivery address
 */
const updateAddress = asyncHandler(async (req, res) => {
  const address = await addressService.updateAddress(req.user._id, req.params.id, req.body);
  return successResponse(res, {
    statusCode: 200,
    message: 'Address updated successfully',
    data: { address },
  });
});

/**
 * Set address as default
 */
const setDefaultAddress = asyncHandler(async (req, res) => {
  const address = await addressService.setDefaultAddress(req.user._id, req.params.id);
  return successResponse(res, {
    statusCode: 200,
    message: 'Default address updated successfully',
    data: { address },
  });
});

/**
 * Delete delivery address
 */
const deleteAddress = asyncHandler(async (req, res) => {
  const result = await addressService.deleteAddress(req.user._id, req.params.id);
  return successResponse(res, {
    statusCode: 200,
    message: result.message,
    data: {},
  });
});

module.exports = {
  getAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  setDefaultAddress,
  deleteAddress,
};
