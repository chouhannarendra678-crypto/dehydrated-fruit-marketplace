const paymentService = require('../services/payment.service');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Create Razorpay Order
 */
const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  if (!orderId) {
    return errorResponse(res, {
      statusCode: 400,
      message: 'orderId is required',
    });
  }

  const result = await paymentService.createRazorpayOrder(req.user._id, orderId);

  return successResponse(res, {
    statusCode: 200,
    message: 'Razorpay order created successfully',
    data: result,
  });
});

/**
 * Verify Razorpay payment signature
 */
const verifyPayment = asyncHandler(async (req, res) => {
  const razorpayOrderId = req.body.razorpayOrderId || req.body.razorpay_order_id;
  const razorpayPaymentId = req.body.razorpayPaymentId || req.body.razorpay_payment_id;
  const razorpaySignature = req.body.razorpaySignature || req.body.razorpay_signature;

  const result = await paymentService.verifyPayment(req.user._id, {
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  });

  return successResponse(res, {
    statusCode: 200,
    message: 'Payment verified and master order confirmed',
    data: result,
  });
});

/**
 * Handle payment failure
 */
const handlePaymentFailure = asyncHandler(async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, reason } = req.body;

  const result = await paymentService.handlePaymentFailure({
    razorpayOrderId,
    razorpayPaymentId,
    reason,
  });

  return successResponse(res, {
    statusCode: 200,
    message: 'Payment failure recorded',
    data: result,
  });
});

/**
 * Handle Razorpay Webhooks
 */
const handleWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const rawBody = req.rawBody || JSON.stringify(req.body);

  const result = await paymentService.handleWebhook(rawBody, signature);

  return res.status(200).json({
    status: 'ok',
    ...result,
  });
});

module.exports = {
  createRazorpayOrder,
  verifyPayment,
  handlePaymentFailure,
  handleWebhook,
};
