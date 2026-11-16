const Seller = require('../models/seller.model');
const { ROLES, SELLER_STATUS } = require('../constants/roles.constants');
const { errorResponse } = require('../utils/apiResponse');

/**
 * Middleware to verify that the logged-in user is a Seller and attach the Seller document
 */
const isSeller = async (req, res, next) => {
  try {
    if (!req.user) {
      return errorResponse(res, {
        statusCode: 401,
        message: 'Authentication required',
      });
    }

    if (req.user.role !== ROLES.SELLER && req.user.role !== ROLES.ADMIN) {
      return errorResponse(res, {
        statusCode: 403,
        message: 'Access restricted to registered sellers only',
      });
    }

    let seller = await Seller.findOne({ user: req.user._id });

    // Auto-initialize Seller profile if user registered with role SELLER but profile was not created yet
    if (!seller && req.user.role === ROLES.SELLER) {
      const storeName = req.user.storeName || `${req.user.name}'s Fruit Store`;
      const slug = await Seller.generateSlug(storeName);
      seller = await Seller.create({
        user: req.user._id,
        storeName,
        slug,
        status: req.user.sellerStatus || SELLER_STATUS.PENDING,
      });
    }

    if (!seller && req.user.role !== ROLES.ADMIN) {
      return errorResponse(res, {
        statusCode: 404,
        message: 'Seller profile not found. Please complete seller registration.',
      });
    }

    req.seller = seller;
    next();
  } catch (error) {
    console.error('[isSeller Middleware Error]:', error.message);
    return errorResponse(res, {
      statusCode: 500,
      message: 'Failed to verify seller authorization',
    });
  }
};

/**
 * Middleware ensuring a seller is APPROVED by an admin before performing selling actions
 * (e.g. creating/updating products, publishing stock, accepting orders)
 */
const isApprovedSeller = (req, res, next) => {
  // Super admin can bypass approval check for platform testing/management
  if (req.user && req.user.role === ROLES.ADMIN) {
    return next();
  }

  if (!req.seller) {
    return errorResponse(res, {
      statusCode: 403,
      message: 'Seller account required',
    });
  }

  if (req.seller.status !== SELLER_STATUS.APPROVED) {
    return errorResponse(res, {
      statusCode: 403,
      message: `Your seller account is currently ${req.seller.status}. You cannot publish or sell products until an administrator approves your verification.`,
    });
  }

  next();
};

module.exports = {
  isSeller,
  isApprovedSeller,
};
