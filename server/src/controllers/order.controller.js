const orderService = require('../services/order.service');
const Seller = require('../models/seller.model');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Customer creates an order (Single checkout decomposes into 1 Master + N SellerOrders)
 */
const createOrder = asyncHandler(async (req, res) => {
  const { addressId, paymentMethod, items } = req.body;
  const order = await orderService.createOrder(req.user._id, {
    addressId,
    paymentMethod,
    items,
  });

  return successResponse(res, {
    statusCode: 201,
    message: 'Master Order and vendor sub-orders created successfully',
    data: { order },
  });
});

/**
 * Customer lists their Master Orders
 */
const getCustomerOrders = asyncHandler(async (req, res) => {
  const { page, limit, status } = req.query;
  const result = await orderService.getCustomerOrders(req.user._id, { page, limit, status });

  return successResponse(res, {
    statusCode: 200,
    message: 'Customer orders retrieved successfully',
    data: result,
  });
});

/**
 * Customer gets single Master Order details
 */
const getCustomerOrderById = asyncHandler(async (req, res) => {
  const order = await orderService.getCustomerOrderById(req.user._id, req.params.id);

  return successResponse(res, {
    statusCode: 200,
    message: 'Order details retrieved successfully',
    data: { order },
  });
});

/**
 * Customer cancels their Master Order
 */
const cancelCustomerOrder = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const order = await orderService.cancelCustomerOrder(req.user._id, req.params.id, { reason });

  return successResponse(res, {
    statusCode: 200,
    message: 'Order cancelled successfully',
    data: { order },
  });
});

/**
 * Seller: View sub-orders assigned to the authenticated seller
 */
const getSellerOrders = asyncHandler(async (req, res) => {
  const seller = await Seller.findOne({ user: req.user._id });
  if (!seller) {
    return errorResponse(res, {
      statusCode: 403,
      message: 'Seller profile not found for this account',
    });
  }

  const { page, limit, status, search } = req.query;
  const result = await orderService.getSellerOrders(seller._id, { page, limit, status, search });

  return successResponse(res, {
    statusCode: 200,
    message: 'Seller orders retrieved successfully',
    data: result,
  });
});

/**
 * Seller: View single sub-order details
 */
const getSellerOrderById = asyncHandler(async (req, res) => {
  const seller = await Seller.findOne({ user: req.user._id });
  if (!seller) {
    return errorResponse(res, {
      statusCode: 403,
      message: 'Seller profile not found for this account',
    });
  }

  const sellerOrder = await orderService.getSellerOrderById(seller._id, req.params.id);

  return successResponse(res, {
    statusCode: 200,
    message: 'Seller sub-order retrieved successfully',
    data: { sellerOrder },
  });
});

/**
 * Seller: Update fulfillment status of their own sub-order
 * Sellers CANNOT modify payment records!
 */
const updateSellerOrderStatus = asyncHandler(async (req, res) => {
  const seller = await Seller.findOne({ user: req.user._id });
  if (!seller) {
    return errorResponse(res, {
      statusCode: 403,
      message: 'Seller profile not found for this account',
    });
  }

  const status = req.body.status || req.body.orderStatus;
  const { courier, trackingNumber, note } = req.body;
  const updatedSellerOrder = await orderService.updateSellerOrderStatus(
    seller._id,
    req.params.id,
    { status, courier, trackingNumber, note }
  );

  return successResponse(res, {
    statusCode: 200,
    message: 'Fulfillment status updated successfully',
    data: { sellerOrder: updatedSellerOrder },
  });
});

/**
 * Admin: List all Master Orders in marketplace
 */
const getAdminOrders = asyncHandler(async (req, res) => {
  const { page, limit, status, paymentStatus, search } = req.query;
  const result = await orderService.getAdminOrders({ page, limit, status, paymentStatus, search });

  return successResponse(res, {
    statusCode: 200,
    message: 'Admin orders list retrieved successfully',
    data: result,
  });
});

/**
 * Admin: View specific Master Order with full internal breakdown
 */
const getAdminOrderById = asyncHandler(async (req, res) => {
  const order = await orderService.getAdminOrderById(req.params.id);

  return successResponse(res, {
    statusCode: 200,
    message: 'Admin order details retrieved successfully',
    data: { order },
  });
});

/**
 * Admin: Update order status or payment status
 */
const adminUpdateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus, paymentStatus, reason } = req.body;
  const order = await orderService.adminUpdateOrderStatus(req.params.id, {
    orderStatus,
    paymentStatus,
    reason,
  });

  return successResponse(res, {
    statusCode: 200,
    message: 'Order status updated by admin',
    data: { order },
  });
});

module.exports = {
  createOrder,
  getCustomerOrders,
  getCustomerOrderById,
  cancelCustomerOrder,
  getSellerOrders,
  getSellerOrderById,
  updateSellerOrderStatus,
  getAdminOrders,
  getAdminOrderById,
  adminUpdateOrderStatus,
};
