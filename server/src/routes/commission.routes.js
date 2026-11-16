const express = require('express');
const {
  getCommissionConfig,
  updateCommissionConfig,
  getSellerCommissions,
  updateSellerCommission,
} = require('../controllers/commission.controller');
const authenticate = require('../middleware/auth.middleware');
const authorizeRoles = require('../middleware/role.middleware');
const { ROLES } = require('../constants/roles.constants');

const router = express.Router();

// ==========================================
// ADMIN ONLY ROUTES (Commission Management)
// ==========================================
router.get(
  '/config',
  authenticate,
  authorizeRoles(ROLES.ADMIN),
  getCommissionConfig
);

router.patch(
  '/config',
  authenticate,
  authorizeRoles(ROLES.ADMIN),
  updateCommissionConfig
);

router.get(
  '/sellers',
  authenticate,
  authorizeRoles(ROLES.ADMIN),
  getSellerCommissions
);

router.patch(
  '/sellers/:sellerId',
  authenticate,
  authorizeRoles(ROLES.ADMIN),
  updateSellerCommission
);

module.exports = router;
