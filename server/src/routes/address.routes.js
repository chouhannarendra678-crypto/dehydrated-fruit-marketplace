const express = require('express');
const {
  getAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  setDefaultAddress,
  deleteAddress,
} = require('../controllers/address.controller');
const authenticate = require('../middleware/auth.middleware');

const router = express.Router();

// All address routes require authentication
router.use(authenticate);

router.route('/')
  .get(getAddresses)
  .post(createAddress);

router.route('/:id')
  .get(getAddressById)
  .put(updateAddress)
  .delete(deleteAddress);

router.patch('/:id/default', setDefaultAddress);

module.exports = router;
