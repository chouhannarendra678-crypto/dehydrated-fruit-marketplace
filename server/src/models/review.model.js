const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    reviewType: {
      type: String,
      enum: ['PRODUCT', 'SELLER'],
      required: true,
      index: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: function () {
        return this.reviewType === 'PRODUCT';
      },
      index: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Seller',
      required: true,
      index: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating from 1 to 5 stars'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    title: {
      type: String,
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
      default: '',
    },
    comment: {
      type: String,
      required: [true, 'Please provide a review comment'],
      trim: true,
      maxlength: [1000, 'Review comment cannot exceed 1000 characters'],
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, default: '' },
      },
    ],
    isVerifiedPurchase: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'APPROVED',
      index: true,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    sellerReply: {
      comment: { type: String, trim: true },
      repliedAt: { type: Date },
    },
  },
  {
    timestamps: true,
  }
);

// Unique rule: 1 review per product per customer
reviewSchema.index(
  { customer: 1, product: 1, reviewType: 1 },
  { unique: true, partialFilterExpression: { reviewType: 'PRODUCT' } }
);

// Unique rule: 1 review per seller per customer
reviewSchema.index(
  { customer: 1, seller: 1, reviewType: 1 },
  { unique: true, partialFilterExpression: { reviewType: 'SELLER' } }
);

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
