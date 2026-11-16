const mongoose = require('mongoose');
const { SELLER_STATUS } = require('../constants/roles.constants');

const sellerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    storeName: {
      type: String,
      required: [true, 'Store name is required'],
      unique: true,
      trim: true,
      maxlength: [100, 'Store name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Store description cannot exceed 1000 characters'],
      default: '',
    },
    logo: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    banner: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    // Business Registration Information
    businessInfo: {
      businessName: { type: String, trim: true, default: '' },
      businessType: {
        type: String,
        enum: ['PROPRIETORSHIP', 'PARTNERSHIP', 'LLP', 'PRIVATE_LIMITED', 'INDIVIDUAL'],
        default: 'INDIVIDUAL',
      },
      pan: {
        type: String,
        uppercase: true,
        trim: true,
        default: '',
      },
      gst: {
        type: String,
        uppercase: true,
        trim: true,
        default: '',
      },
      // Mandatory for dehydrated food processors
      fssaiNumber: {
        type: String,
        trim: true,
        default: '',
      },
      fssaiCertificate: {
        url: { type: String, default: '' },
        publicId: { type: String, default: '' },
      },
    },
    // Business Physical Address
    businessAddress: {
      street: { type: String, trim: true, default: '' },
      city: { type: String, trim: true, default: '' },
      state: { type: String, trim: true, default: '' },
      pincode: { type: String, trim: true, default: '' },
      country: { type: String, default: 'India' },
    },
    // Payout / Bank Account Information
    bankInfo: {
      accountHolderName: { type: String, trim: true, default: '' },
      accountNumber: { type: String, trim: true, default: '' },
      ifscCode: { type: String, uppercase: true, trim: true, default: '' },
      bankName: { type: String, trim: true, default: '' },
      branchName: { type: String, trim: true, default: '' },
      upiId: { type: String, trim: true, default: '' },
    },
    status: {
      type: String,
      enum: [
        SELLER_STATUS.PENDING,
        SELLER_STATUS.APPROVED,
        SELLER_STATUS.REJECTED,
        SELLER_STATUS.SUSPENDED,
      ],
      default: SELLER_STATUS.PENDING,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    commissionRate: {
      type: Number,
      default: 10, // 10% default platform commission
      min: 0,
      max: 100,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Helper function to generate URL slug from store name
sellerSchema.statics.generateSlug = async function (storeName) {
  let baseSlug = storeName
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (!baseSlug) baseSlug = 'seller-store';

  let slug = baseSlug;
  let counter = 1;

  while (await this.findOne({ slug })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};

const Seller = mongoose.model('Seller', sellerSchema);

module.exports = Seller;
