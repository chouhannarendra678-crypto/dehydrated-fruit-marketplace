const mongoose = require('mongoose');
const { PAYOUT_STATUS } = require('../constants/roles.constants');

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: Object.values(PAYOUT_STATUS),
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    note: {
      type: String,
      default: '',
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { _id: false }
);

const payoutSchema = new mongoose.Schema(
  {
    payoutNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
      uppercase: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Seller',
      required: true,
      index: true,
    },
    sellerOrders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SellerOrder',
      },
    ],
    grossAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    commissionDeducted: {
      type: Number,
      required: true,
      min: 0,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    status: {
      type: String,
      enum: Object.values(PAYOUT_STATUS),
      default: PAYOUT_STATUS.PENDING,
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ['BANK_TRANSFER', 'UPI', 'NEFT', 'IMPS'],
      default: 'BANK_TRANSFER',
    },
    bankDetailsSnapshot: {
      accountHolderName: { type: String, default: '' },
      bankName: { type: String, default: '' },
      accountNumberMasked: { type: String, default: '' },
      ifscCode: { type: String, default: '' },
      upiId: { type: String, default: '' },
    },
    transactionReference: {
      type: String,
      default: '',
      trim: true,
    },
    processedAt: {
      type: Date,
    },
    paidAt: {
      type: Date,
    },
    failedAt: {
      type: Date,
    },
    failureReason: {
      type: String,
      default: '',
      trim: true,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    initiatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    statusHistory: [statusHistorySchema],
  },
  {
    timestamps: true,
  }
);

// Helper static to generate standardized unique Payout Number
payoutSchema.statics.generatePayoutNumber = function () {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `DF-PAY-${timestamp}-${random}`;
};

const Payout = mongoose.model('Payout', payoutSchema);

module.exports = Payout;
