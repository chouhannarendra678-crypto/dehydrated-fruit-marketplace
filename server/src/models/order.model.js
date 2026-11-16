const mongoose = require('mongoose');
const { ORDER_STATUS, PAYMENT_STATUS } = require('../constants/roles.constants');

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    productSlug: {
      type: String,
      required: true,
    },
    productImage: {
      type: String,
      default: '',
    },
    variant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductVariant',
      required: true,
    },
    weight: {
      type: String,
      required: true,
    },
    SKU: {
      type: String,
      default: '',
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Seller',
      required: true,
    },
    sellerName: {
      type: String,
      required: true,
    },
    unitPrice: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    itemTotal: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const shippingAddressSnapshotSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    apartment: { type: String, default: '' },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, default: 'India' },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    shippingAddress: {
      type: shippingAddressSnapshotSchema,
      required: true,
    },
    sellerOrders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SellerOrder',
      },
    ],
    sellers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller',
      },
    ],
    items: [orderItemSchema],
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    totalShipping: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    tax: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    grandTotal: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ['RAZORPAY', 'COD'],
      default: 'RAZORPAY',
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
      index: true,
    },
    paymentDetails: {
      razorpayPaymentId: { type: String, default: '' },
      razorpayOrderId: { type: String, default: '' },
      razorpaySignature: { type: String, default: '' },
      paidAt: { type: Date },
    },
    orderStatus: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.CONFIRMED,
      index: true,
    },
    cancellationReason: {
      type: String,
      default: '',
    },
    cancelledAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Method to generate unique master order numbers
orderSchema.statics.generateOrderNumber = function () {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `DF-ORD-${timestamp}-${randomPart}`;
};

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
