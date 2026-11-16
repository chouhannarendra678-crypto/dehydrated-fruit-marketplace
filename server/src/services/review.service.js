const mongoose = require('mongoose');
const Review = require('../models/review.model');
const Order = require('../models/order.model');
const Product = require('../models/product.model');
const Seller = require('../models/seller.model');

class ReviewService {
  /**
   * Recalculate average rating & reviewCount on a Product
   */
  async recalculateProductRating(productId) {
    const stats = await Review.aggregate([
      {
        $match: {
          product: new mongoose.Types.ObjectId(productId),
          reviewType: 'PRODUCT',
          status: 'APPROVED',
        },
      },
      {
        $group: {
          _id: '$product',
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
    ]);

    const rating = stats.length > 0 ? Math.round(stats[0].avgRating * 10) / 10 : 0;
    const reviewCount = stats.length > 0 ? stats[0].count : 0;

    await Product.findByIdAndUpdate(productId, { rating, reviewCount });
    return { rating, reviewCount };
  }

  /**
   * Recalculate average rating & reviewCount on a Seller
   */
  async recalculateSellerRating(sellerId) {
    const stats = await Review.aggregate([
      {
        $match: {
          seller: new mongoose.Types.ObjectId(sellerId),
          reviewType: 'SELLER',
          status: 'APPROVED',
        },
      },
      {
        $group: {
          _id: '$seller',
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
    ]);

    const rating = stats.length > 0 ? Math.round(stats[0].avgRating * 10) / 10 : 0;
    const reviewCount = stats.length > 0 ? stats[0].count : 0;

    await Seller.findByIdAndUpdate(sellerId, { rating, reviewCount });
    return { rating, reviewCount };
  }

  /**
   * Check eligibility for a customer to review a product or seller
   */
  async checkEligibility(customerId, { productId, sellerId }) {
    if (productId) {
      // Find an order placed by customer containing this product
      const eligibleOrder = await Order.findOne({
        customer: customerId,
        'items.product': productId,
        orderStatus: { $ne: 'CANCELLED' },
      });

      const existingReview = await Review.findOne({
        customer: customerId,
        product: productId,
        reviewType: 'PRODUCT',
      });

      return {
        canReview: Boolean(eligibleOrder),
        hasReviewed: Boolean(existingReview),
        existingReview,
        orderId: eligibleOrder?._id,
      };
    }

    if (sellerId) {
      // Find an order placed by customer from this seller
      const eligibleOrder = await Order.findOne({
        customer: customerId,
        sellers: sellerId,
        orderStatus: { $ne: 'CANCELLED' },
      });

      const existingReview = await Review.findOne({
        customer: customerId,
        seller: sellerId,
        reviewType: 'SELLER',
      });

      return {
        canReview: Boolean(eligibleOrder),
        hasReviewed: Boolean(existingReview),
        existingReview,
        orderId: eligibleOrder?._id,
      };
    }

    return { canReview: false, hasReviewed: false };
  }

  /**
   * Create a Product Review
   */
  async createProductReview(customerId, { productId, rating, title = '', comment, images = [] }) {
    const product = await Product.findById(productId);
    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    // Eligibility check: Only customers who bought this fruit can review!
    const eligibility = await this.checkEligibility(customerId, { productId });
    if (!eligibility.canReview) {
      const error = new Error('Only verified purchasers of this dehydrated fruit batch can submit a review.');
      error.statusCode = 403;
      throw error;
    }

    if (eligibility.hasReviewed) {
      const error = new Error('You have already submitted a review for this fruit batch.');
      error.statusCode = 400;
      throw error;
    }

    const review = new Review({
      customer: customerId,
      reviewType: 'PRODUCT',
      product: product._id,
      seller: product.seller,
      order: eligibility.orderId,
      rating: Number(rating),
      title: title ? title.trim() : '',
      comment: comment.trim(),
      images: Array.isArray(images) ? images : [],
      isVerifiedPurchase: true,
      status: 'APPROVED',
    });

    await review.save();

    // Recalculate Product average rating
    await this.recalculateProductRating(product._id);

    return await review.populate('customer', 'name avatar');
  }

  /**
   * Create a Seller Review
   */
  async createSellerReview(customerId, { sellerId, rating, title = '', comment, images = [] }) {
    const seller = await Seller.findById(sellerId);
    if (!seller) {
      const error = new Error('Seller not found');
      error.statusCode = 404;
      throw error;
    }

    // Eligibility check
    const eligibility = await this.checkEligibility(customerId, { sellerId });
    if (!eligibility.canReview) {
      const error = new Error('Only customers who have ordered from this orchard can submit a vendor review.');
      error.statusCode = 403;
      throw error;
    }

    if (eligibility.hasReviewed) {
      const error = new Error('You have already submitted a review for this orchard vendor.');
      error.statusCode = 400;
      throw error;
    }

    const review = new Review({
      customer: customerId,
      reviewType: 'SELLER',
      seller: seller._id,
      order: eligibility.orderId,
      rating: Number(rating),
      title: title ? title.trim() : '',
      comment: comment.trim(),
      images: Array.isArray(images) ? images : [],
      isVerifiedPurchase: true,
      status: 'APPROVED',
    });

    await review.save();

    // Recalculate Seller average rating
    await this.recalculateSellerRating(seller._id);

    return await review.populate('customer', 'name avatar');
  }

  /**
   * Get approved reviews for a specific Product
   */
  async getProductReviews(productId, { page = 1, limit = 10, rating }) {
    const query = {
      product: productId,
      reviewType: 'PRODUCT',
      status: 'APPROVED',
    };

    if (rating) {
      query.rating = Number(rating);
    }

    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find(query)
        .populate('customer', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Review.countDocuments(query),
    ]);

    return {
      reviews,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get approved reviews for a specific Seller
   */
  async getSellerReviews(sellerId, { page = 1, limit = 10, rating }) {
    const query = {
      seller: sellerId,
      reviewType: 'SELLER',
      status: 'APPROVED',
    };

    if (rating) {
      query.rating = Number(rating);
    }

    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find(query)
        .populate('customer', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Review.countDocuments(query),
    ]);

    return {
      reviews,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Seller views all reviews directed to them (Seller Reviews and Product Reviews)
   */
  async getSellerDashboardReviews(sellerId, { page = 1, limit = 20, reviewType }) {
    const query = { seller: sellerId };
    if (reviewType) query.reviewType = reviewType;

    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find(query)
        .populate('customer', 'name avatar')
        .populate('product', 'name slug images')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Review.countDocuments(query),
    ]);

    return {
      reviews,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Seller replies to a review
   */
  async sellerReply(sellerId, reviewId, comment) {
    const review = await Review.findOne({ _id: reviewId, seller: sellerId });
    if (!review) {
      const error = new Error('Review not found or unauthorized');
      error.statusCode = 404;
      throw error;
    }

    review.sellerReply = {
      comment: comment.trim(),
      repliedAt: new Date(),
    };

    await review.save();
    return review;
  }

  /**
   * Admin lists all reviews with moderation filters
   */
  async getAdminReviews({ page = 1, limit = 20, status, reviewType, search }) {
    const query = {};
    if (status) query.status = status;
    if (reviewType) query.reviewType = reviewType;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { comment: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find(query)
        .populate('customer', 'name email avatar')
        .populate('product', 'name slug')
        .populate('seller', 'storeName slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Review.countDocuments(query),
    ]);

    return {
      reviews,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Admin moderates review status
   */
  async adminModerateReview(reviewId, { status, rejectionReason }) {
    const review = await Review.findById(reviewId);
    if (!review) {
      const error = new Error('Review not found');
      error.statusCode = 404;
      throw error;
    }

    review.status = status;
    if (rejectionReason !== undefined) {
      review.rejectionReason = rejectionReason;
    }

    await review.save();

    // Recalculate ratings
    if (review.reviewType === 'PRODUCT' && review.product) {
      await this.recalculateProductRating(review.product);
    } else if (review.reviewType === 'SELLER' && review.seller) {
      await this.recalculateSellerRating(review.seller);
    }

    return review;
  }
}

module.exports = new ReviewService();
