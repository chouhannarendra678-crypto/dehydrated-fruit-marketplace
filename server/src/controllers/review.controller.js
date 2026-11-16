const reviewService = require('../services/review.service');
const Seller = require('../models/seller.model');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Check customer review eligibility
 */
const checkEligibility = asyncHandler(async (req, res) => {
  const { productId, sellerId } = req.query;
  const result = await reviewService.checkEligibility(req.user._id, { productId, sellerId });

  return successResponse(res, {
    statusCode: 200,
    message: 'Eligibility status checked',
    data: result,
  });
});

/**
 * Customer creates Product review
 */
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, title, comment, images } = req.body;
  const review = await reviewService.createProductReview(req.user._id, {
    productId: req.params.productId,
    rating,
    title,
    comment,
    images,
  });

  return successResponse(res, {
    statusCode: 201,
    message: 'Product review submitted successfully',
    data: { review },
  });
});

/**
 * Public: Get reviews for a product
 */
const getProductReviews = asyncHandler(async (req, res) => {
  const { page, limit, rating } = req.query;
  const result = await reviewService.getProductReviews(req.params.productId, { page, limit, rating });

  return successResponse(res, {
    statusCode: 200,
    message: 'Product reviews retrieved successfully',
    data: result,
  });
});

/**
 * Customer creates Seller review
 */
const createSellerReview = asyncHandler(async (req, res) => {
  const { rating, title, comment, images } = req.body;
  const review = await reviewService.createSellerReview(req.user._id, {
    sellerId: req.params.sellerId,
    rating,
    title,
    comment,
    images,
  });

  return successResponse(res, {
    statusCode: 201,
    message: 'Seller review submitted successfully',
    data: { review },
  });
});

/**
 * Public: Get reviews for a seller
 */
const getSellerReviews = asyncHandler(async (req, res) => {
  const { page, limit, rating } = req.query;
  const result = await reviewService.getSellerReviews(req.params.sellerId, { page, limit, rating });

  return successResponse(res, {
    statusCode: 200,
    message: 'Seller reviews retrieved successfully',
    data: result,
  });
});

/**
 * Seller views their received reviews
 */
const getSellerDashboardReviews = asyncHandler(async (req, res) => {
  const seller = await Seller.findOne({ user: req.user._id });
  if (!seller) {
    return errorResponse(res, {
      statusCode: 403,
      message: 'Seller profile not found for this account',
    });
  }

  const { page, limit, reviewType } = req.query;
  const result = await reviewService.getSellerDashboardReviews(seller._id, { page, limit, reviewType });

  return successResponse(res, {
    statusCode: 200,
    message: 'Seller reviews retrieved successfully',
    data: result,
  });
});

/**
 * Seller replies to review
 */
const sellerReplyToReview = asyncHandler(async (req, res) => {
  const seller = await Seller.findOne({ user: req.user._id });
  if (!seller) {
    return errorResponse(res, {
      statusCode: 403,
      message: 'Seller profile not found for this account',
    });
  }

  const { comment } = req.body;
  const review = await reviewService.sellerReply(seller._id, req.params.id, comment);

  return successResponse(res, {
    statusCode: 200,
    message: 'Reply posted successfully',
    data: { review },
  });
});

/**
 * Admin: Get all reviews for moderation
 */
const getAdminReviews = asyncHandler(async (req, res) => {
  const { page, limit, status, reviewType, search } = req.query;
  const result = await reviewService.getAdminReviews({ page, limit, status, reviewType, search });

  return successResponse(res, {
    statusCode: 200,
    message: 'Admin reviews retrieved successfully',
    data: result,
  });
});

/**
 * Admin: Moderate review status (Approve/Reject)
 */
const adminModerateReview = asyncHandler(async (req, res) => {
  const { status, rejectionReason } = req.body;
  const review = await reviewService.adminModerateReview(req.params.id, { status, rejectionReason });

  return successResponse(res, {
    statusCode: 200,
    message: `Review ${status.toLowerCase()} successfully`,
    data: { review },
  });
});

module.exports = {
  checkEligibility,
  createProductReview,
  getProductReviews,
  createSellerReview,
  getSellerReviews,
  getSellerDashboardReviews,
  sellerReplyToReview,
  getAdminReviews,
  adminModerateReview,
};
