const express = require('express');
const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const sellerRoutes = require('./seller.routes');
const categoryRoutes = require('./category.routes');
const productRoutes = require('./product.routes');
const cartRoutes = require('./cart.routes');
const addressRoutes = require('./address.routes');
const orderRoutes = require('./order.routes');
const paymentRoutes = require('./payment.routes');
const reviewRoutes = require('./review.routes');
const payoutRoutes = require('./payout.routes');
const commissionRoutes = require('./commission.routes');
const adminRoutes = require('./admin.routes');

const router = express.Router();

// Health check endpoint at /api/v1/health
router.use('/', healthRoutes);

// Auth endpoints at /api/v1/auth
router.use('/auth', authRoutes);

// Seller endpoints at /api/v1/sellers
router.use('/sellers', sellerRoutes);

// Category endpoints at /api/v1/categories
router.use('/categories', categoryRoutes);

// Product endpoints at /api/v1/products
router.use('/products', productRoutes);

// Cart endpoints at /api/v1/cart
router.use('/cart', cartRoutes);

// Address endpoints at /api/v1/addresses
router.use('/addresses', addressRoutes);

// Order endpoints at /api/v1/orders
router.use('/orders', orderRoutes);

// Payment endpoints at /api/v1/payments
router.use('/payments', paymentRoutes);

// Review endpoints at /api/v1/reviews
router.use('/reviews', reviewRoutes);

// Payout endpoints at /api/v1/payouts
router.use('/payouts', payoutRoutes);

// Commission endpoints at /api/v1/commissions
router.use('/commissions', commissionRoutes);

// General Admin management endpoints at /api/v1/admin
router.use('/admin', adminRoutes);

module.exports = router;
