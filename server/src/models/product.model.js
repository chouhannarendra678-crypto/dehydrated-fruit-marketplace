const mongoose = require('mongoose');
const { PRODUCT_STATUS } = require('../constants/roles.constants');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [150, 'Product name cannot exceed 150 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
      index: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Seller',
      required: [true, 'Seller reference is required'],
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
      maxlength: [3000, 'Description cannot exceed 3000 characters'],
    },
    // Cloudinary image references
    images: {
      type: [
        {
          url: { type: String, required: true },
          publicId: { type: String, default: '' },
        },
      ],
      validate: [
        (val) => val.length > 0,
        'At least one product image is required',
      ],
    },
    // Linked variant references
    variants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductVariant',
      },
    ],
    // Cached price and stock for high-performance querying
    minPrice: {
      type: Number,
      default: 0,
      index: true,
    },
    totalStock: {
      type: Number,
      default: 0,
      index: true,
    },
    ingredients: {
      type: [String],
      default: [],
    },
    nutrition: {
      servingSize: { type: String, default: '100g' },
      calories: { type: Number, default: 0 },
      carbohydrates: { type: Number, default: 0 },
      sugar: { type: Number, default: 0 },
      protein: { type: Number, default: 0 },
      fiber: { type: Number, default: 0 },
      fat: { type: Number, default: 0 },
    },
    shelfLife: {
      type: String,
      default: '12 Months',
      trim: true,
    },
    storageInstructions: {
      type: String,
      default: 'Store in an airtight container in a cool, dry place away from direct sunlight.',
      trim: true,
    },
    addedSugar: {
      type: Boolean,
      default: false,
      index: true,
    },
    preservatives: {
      type: Boolean,
      default: false,
      index: true,
    },
    status: {
      type: String,
      enum: [
        PRODUCT_STATUS.PENDING_APPROVAL,
        PRODUCT_STATUS.APPROVED,
        PRODUCT_STATUS.REJECTED,
        PRODUCT_STATUS.INACTIVE,
      ],
      default: PRODUCT_STATUS.PENDING_APPROVAL,
      index: true,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      index: true,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Slug generator static
productSchema.statics.generateSlug = async function (name, sellerStoreName = '') {
  let combined = sellerStoreName ? `${name}-by-${sellerStoreName}` : name;
  let baseSlug = combined
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (!baseSlug) baseSlug = 'dehydrated-fruit';

  let slug = baseSlug;
  let counter = 1;

  while (await this.findOne({ slug })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};

// Index for full-text search
productSchema.index({
  name: 'text',
  description: 'text',
  ingredients: 'text',
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
