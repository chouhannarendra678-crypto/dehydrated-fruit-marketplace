const express = require('express');
const {
  createRazorpayOrder,
  verifyPayment,
  handlePaymentFailure,
  handleWebhook,
} = require('../controllers/payment.controller');
const authenticate = require('../middleware/auth.middleware');

const router = express.Router();

// Public Webhook route (verified via x-razorpay-signature)
router.post('/webhook', handleWebhook);

// Authenticated Customer Payment Routes
router.post('/create-order', authenticate, createRazorpayOrder);
router.post('/verify', authenticate, verifyPayment);
router.post('/failure', authenticate, handlePaymentFailure);

module.exports = router;
