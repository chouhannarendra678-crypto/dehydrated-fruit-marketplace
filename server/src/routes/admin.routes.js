const express = require('express');
const {
  getDashboardStats,
  getCustomers,
  getCustomerById,
  getPlatformSettings,
  updatePlatformSettings,
} = require('../controllers/admin.controller');
const authenticate = require('../middleware/auth.middleware');
const authorizeRoles = require('../middleware/role.middleware');
const { ROLES } = require('../constants/roles.constants');

const router = express.Router();

// Strict Admin Authorization Middleware applied to all admin routes
router.use(authenticate, authorizeRoles(ROLES.ADMIN));

router.get('/dashboard-stats', getDashboardStats);
router.get('/customers', getCustomers);
router.get('/customers/:id', getCustomerById);
router.get('/settings', getPlatformSettings);
router.patch('/settings', updatePlatformSettings);

module.exports = router;
