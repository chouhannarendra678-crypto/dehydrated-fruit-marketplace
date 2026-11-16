const mongoose = require('mongoose');
const Payout = require('../models/payout.model');
const Seller = require('../models/seller.model');
const SellerOrder = require('../models/sellerOrder.model');
const commissionService = require('./commission.service');
const {
  calculateBatchPayout,
  maskAccountNumber,
} = require('../utils/calculateCommission');
const {
  PAYOUT_STATUS,
  ORDER_STATUS,
  SELLER_STATUS,
} = require('../constants/roles.constants');

class PayoutService {
  /**
   * Helper: Retrieve seller profile for authenticated seller user
   */
  async _getSellerByUserId(userId) {
    const seller = await Seller.findOne({ user: userId });
    if (!seller) {
      const error = new Error('Orchard seller profile not found.');
      error.statusCode = 404;
      throw error;
    }
    return seller;
  }

  /**
   * Seller: Get comprehensive earnings and financial metrics
   * (Strictly scoped to requesting seller only)
   */
  async getSellerEarnings(userId) {
    const seller = await this._getSellerByUserId(userId);

    // 1. Fetch all non-cancelled seller orders
    const orders = await SellerOrder.find({
      seller: seller._id,
      orderStatus: { $ne: ORDER_STATUS.CANCELLED },
    })
      .sort({ createdAt: -1 })
      .lean();

    // 2. Fetch all payouts for this seller
    const payouts = await Payout.find({ seller: seller._id }).lean();

    let totalGrossSales = 0;
    let totalCommissionDeducted = 0;
    let totalNetEarnings = 0;
    let pendingPayoutBalance = 0;

    for (const order of orders) {
      const gross = Number(order.totalAmount || 0);
      const commission = Number(order.commissionAmount || 0);
      const net = Number(order.sellerEarnings || 0);

      totalGrossSales += gross;
      totalCommissionDeducted += commission;
      totalNetEarnings += net;

      // Pending payout balance: orders not yet marked PAID or PROCESSING in a payout
      if (order.payoutStatus === PAYOUT_STATUS.PENDING) {
        pendingPayoutBalance += net;
      }
    }

    let totalPaidOut = 0;
    let processingPayoutBalance = 0;

    for (const payout of payouts) {
      if (payout.status === PAYOUT_STATUS.PAID) {
        totalPaidOut += Number(payout.amount || 0);
      } else if (payout.status === PAYOUT_STATUS.PROCESSING) {
        processingPayoutBalance += Number(payout.amount || 0);
      }
    }

    // Active commission rate
    const defaultRate = await commissionService.getPlatformDefaultCommissionRate();
    const effectiveCommissionRate =
      seller.commissionRate !== undefined ? seller.commissionRate : defaultRate;

    // Masked bank information
    const rawAccount = seller.bankInfo?.accountNumber || '';
    const maskedBank = {
      accountHolderName: seller.bankInfo?.accountHolderName || '',
      bankName: seller.bankInfo?.bankName || '',
      accountNumberMasked: maskAccountNumber(rawAccount),
      ifscCode: seller.bankInfo?.ifscCode || '',
      upiId: seller.bankInfo?.upiId || '',
      hasBankDetails: !!(rawAccount || seller.bankInfo?.upiId),
    };

    // Format recent 10 orders with financial ledger columns
    const recentOrders = orders.slice(0, 10).map((ord) => ({
      _id: ord._id,
      sellerOrderNumber: ord.sellerOrderNumber,
      createdAt: ord.createdAt,
      itemCount: ord.items?.length || 0,
      subtotal: ord.subtotal,
      shippingFee: ord.shippingFee,
      tax: ord.tax,
      totalAmount: ord.totalAmount, // Gross sales
      commissionRate: ord.commissionRate,
      commissionAmount: ord.commissionAmount,
      sellerEarnings: ord.sellerEarnings, // Net earnings
      orderStatus: ord.orderStatus,
      payoutStatus: ord.payoutStatus,
    }));

    return {
      financials: {
        totalGrossSales: Math.round(totalGrossSales * 100) / 100,
        totalCommissionDeducted: Math.round(totalCommissionDeducted * 100) / 100,
        totalNetEarnings: Math.round(totalNetEarnings * 100) / 100,
        pendingPayoutBalance: Math.round(pendingPayoutBalance * 100) / 100,
        processingPayoutBalance: Math.round(processingPayoutBalance * 100) / 100,
        totalPaidOut: Math.round(totalPaidOut * 100) / 100,
        commissionRate: effectiveCommissionRate,
        isCustomRate: effectiveCommissionRate !== defaultRate,
      },
      bankInfo: maskedBank,
      totalOrders: orders.length,
      recentOrders,
    };
  }

  /**
   * Seller: Get payout history
   * (Strictly scoped to requesting seller only)
   */
  async getSellerPayouts(userId, { page = 1, limit = 10, status = '' }) {
    const seller = await this._getSellerByUserId(userId);

    const query = { seller: seller._id };
    if (status && Object.values(PAYOUT_STATUS).includes(status.toUpperCase())) {
      query.status = status.toUpperCase();
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [payouts, total] = await Promise.all([
      Payout.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Payout.countDocuments(query),
    ]);

    return {
      payouts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)) || 1,
      },
    };
  }

  /**
   * Seller: Get single payout details
   */
  async getSellerPayoutById(userId, payoutId) {
    const seller = await this._getSellerByUserId(userId);

    const payout = await Payout.findOne({
      _id: payoutId,
      seller: seller._id,
    }).populate('sellerOrders', 'sellerOrderNumber totalAmount commissionAmount sellerEarnings createdAt items');

    if (!payout) {
      const error = new Error('Payout record not found or access unauthorized.');
      error.statusCode = 404;
      throw error;
    }

    return payout;
  }

  /**
   * Admin: Overall Platform Financial Overview
   */
  async getAdminOverview() {
    const [allOrders, allPayouts, approvedSellersCount] = await Promise.all([
      SellerOrder.find({ orderStatus: { $ne: ORDER_STATUS.CANCELLED } })
        .select('totalAmount commissionAmount sellerEarnings payoutStatus')
        .lean(),
      Payout.find().select('amount status').lean(),
      Seller.countDocuments({ status: SELLER_STATUS.APPROVED }),
    ]);

    let totalGrossGMV = 0;
    let totalPlatformCommission = 0;
    let totalSellerEarnings = 0;
    let pendingOrdersBalance = 0;

    for (const ord of allOrders) {
      totalGrossGMV += Number(ord.totalAmount || 0);
      totalPlatformCommission += Number(ord.commissionAmount || 0);
      totalSellerEarnings += Number(ord.sellerEarnings || 0);

      if (ord.payoutStatus === PAYOUT_STATUS.PENDING) {
        pendingOrdersBalance += Number(ord.sellerEarnings || 0);
      }
    }

    let totalDisbursedToSellers = 0;
    let pendingPayoutsQueue = 0;
    let processingPayoutsQueue = 0;

    for (const p of allPayouts) {
      if (p.status === PAYOUT_STATUS.PAID) {
        totalDisbursedToSellers += Number(p.amount || 0);
      } else if (p.status === PAYOUT_STATUS.PENDING) {
        pendingPayoutsQueue += Number(p.amount || 0);
      } else if (p.status === PAYOUT_STATUS.PROCESSING) {
        processingPayoutsQueue += Number(p.amount || 0);
      }
    }

    return {
      totalGrossGMV: Math.round(totalGrossGMV * 100) / 100,
      totalPlatformCommission: Math.round(totalPlatformCommission * 100) / 100,
      totalSellerEarnings: Math.round(totalSellerEarnings * 100) / 100,
      totalDisbursedToSellers: Math.round(totalDisbursedToSellers * 100) / 100,
      pendingOrdersBalance: Math.round(pendingOrdersBalance * 100) / 100,
      pendingPayoutsQueue: Math.round(pendingPayoutsQueue * 100) / 100,
      processingPayoutsQueue: Math.round(processingPayoutsQueue * 100) / 100,
      approvedSellersCount,
    };
  }

  /**
   * Admin: List all sellers with pending balances and eligible orders ready for payout
   */
  async getAdminEligibleOrders() {
    const pendingOrders = await SellerOrder.find({
      payoutStatus: PAYOUT_STATUS.PENDING,
      orderStatus: { $ne: ORDER_STATUS.CANCELLED },
    })
      .populate('seller', 'storeName slug bankInfo')
      .sort({ createdAt: 1 })
      .lean();

    // Group pending orders by seller
    const sellerMap = {};

    for (const ord of pendingOrders) {
      if (!ord.seller) continue;
      const sId = ord.seller._id.toString();

      if (!sellerMap[sId]) {
        const rawAccount = ord.seller.bankInfo?.accountNumber || '';
        sellerMap[sId] = {
          seller: {
            _id: ord.seller._id,
            storeName: ord.seller.storeName,
            slug: ord.seller.slug,
            bankDetails: {
              accountHolderName: ord.seller.bankInfo?.accountHolderName || '',
              bankName: ord.seller.bankInfo?.bankName || '',
              accountNumberMasked: maskAccountNumber(rawAccount),
              ifscCode: ord.seller.bankInfo?.ifscCode || '',
              upiId: ord.seller.bankInfo?.upiId || '',
              isConfigured: !!(rawAccount || ord.seller.bankInfo?.upiId),
            },
          },
          orders: [],
          grossTotal: 0,
          commissionTotal: 0,
          netEarningsTotal: 0,
        };
      }

      sellerMap[sId].orders.push({
        _id: ord._id,
        sellerOrderNumber: ord.sellerOrderNumber,
        createdAt: ord.createdAt,
        totalAmount: ord.totalAmount,
        commissionAmount: ord.commissionAmount,
        sellerEarnings: ord.sellerEarnings,
        orderStatus: ord.orderStatus,
      });

      sellerMap[sId].grossTotal += Number(ord.totalAmount || 0);
      sellerMap[sId].commissionTotal += Number(ord.commissionAmount || 0);
      sellerMap[sId].netEarningsTotal += Number(ord.sellerEarnings || 0);
    }

    const eligibleList = Object.values(sellerMap).map((entry) => ({
      ...entry,
      grossTotal: Math.round(entry.grossTotal * 100) / 100,
      commissionTotal: Math.round(entry.commissionTotal * 100) / 100,
      netEarningsTotal: Math.round(entry.netEarningsTotal * 100) / 100,
    }));

    return eligibleList;
  }

  /**
   * Admin: Generate a new Payout record for a seller
   */
  async generatePayout({ sellerId, sellerOrderIds, paymentMethod = 'BANK_TRANSFER', notes = '', adminUserId }) {
    if (!sellerId) {
      throw new Error('Seller ID is required to generate a payout.');
    }

    const seller = await Seller.findById(sellerId);
    if (!seller) {
      throw new Error('Seller not found.');
    }

    // Build query for orders
    const query = {
      seller: seller._id,
      payoutStatus: PAYOUT_STATUS.PENDING,
      orderStatus: { $ne: ORDER_STATUS.CANCELLED },
    };

    if (Array.isArray(sellerOrderIds) && sellerOrderIds.length > 0) {
      query._id = { $in: sellerOrderIds };
    }

    const ordersToSettle = await SellerOrder.find(query);
    if (ordersToSettle.length === 0) {
      throw new Error('No eligible pending orders found for this seller to settle.');
    }

    // Calculate aggregated batch payout totals
    const batchCalculations = calculateBatchPayout(ordersToSettle);

    // Snapshot masked bank details to prevent unnecessary exposure
    const rawAccount = seller.bankInfo?.accountNumber || '';
    const bankDetailsSnapshot = {
      accountHolderName: seller.bankInfo?.accountHolderName || seller.storeName,
      bankName: seller.bankInfo?.bankName || 'Direct Transfer',
      accountNumberMasked: maskAccountNumber(rawAccount),
      ifscCode: seller.bankInfo?.ifscCode || '',
      upiId: seller.bankInfo?.upiId || '',
    };

    const payoutNumber = Payout.generatePayoutNumber();

    const newPayout = new Payout({
      payoutNumber,
      seller: seller._id,
      sellerOrders: ordersToSettle.map((o) => o._id),
      grossAmount: batchCalculations.grossAmount,
      commissionDeducted: batchCalculations.commissionDeducted,
      amount: batchCalculations.amount, // Net payout amount
      currency: 'INR',
      status: PAYOUT_STATUS.PENDING,
      paymentMethod,
      bankDetailsSnapshot,
      notes: notes.trim(),
      initiatedBy: adminUserId,
      statusHistory: [
        {
          status: PAYOUT_STATUS.PENDING,
          timestamp: new Date(),
          note: `Payout generated for ${ordersToSettle.length} completed fruit orders`,
          changedBy: adminUserId,
        },
      ],
    });

    await newPayout.save();

    // Mark the selected SellerOrders as PROCESSING payout
    const settledOrderIds = ordersToSettle.map((o) => o._id);
    await SellerOrder.updateMany(
      { _id: { $in: settledOrderIds } },
      { payoutStatus: PAYOUT_STATUS.PROCESSING }
    );

    return newPayout;
  }

  /**
   * Admin: Update Payout Status (PROCESSING, PAID, FAILED)
   */
  async updatePayoutStatus(payoutId, { status, transactionReference = '', failureReason = '', notes = '', adminUserId }) {
    if (!Object.values(PAYOUT_STATUS).includes(status)) {
      throw new Error(`Invalid payout status. Allowed values: ${Object.values(PAYOUT_STATUS).join(', ')}`);
    }

    const payout = await Payout.findById(payoutId);
    if (!payout) {
      throw new Error('Payout record not found.');
    }

    if (payout.status === PAYOUT_STATUS.PAID) {
      throw new Error('This payout has already been marked as PAID and cannot be changed.');
    }

    const previousStatus = payout.status;
    payout.status = status;

    if (status === PAYOUT_STATUS.PROCESSING) {
      payout.processedAt = new Date();
      if (notes) payout.notes = notes;
    } else if (status === PAYOUT_STATUS.PAID) {
      if (!transactionReference.trim()) {
        throw new Error('A transaction reference (UTR or NEFT reference number) is required to mark a payout as PAID.');
      }
      payout.transactionReference = transactionReference.trim();
      payout.paidAt = new Date();
      if (notes) payout.notes = notes;

      // Update linked SellerOrders to PAID
      await SellerOrder.updateMany(
        { _id: { $in: payout.sellerOrders } },
        { payoutStatus: PAYOUT_STATUS.PAID }
      );
    } else if (status === PAYOUT_STATUS.FAILED) {
      if (!failureReason.trim()) {
        throw new Error('A failure reason is required when marking a payout as FAILED.');
      }
      payout.failureReason = failureReason.trim();
      payout.failedAt = new Date();

      // REVERT linked SellerOrders back to PENDING so seller earnings are preserved
      await SellerOrder.updateMany(
        { _id: { $in: payout.sellerOrders } },
        { payoutStatus: PAYOUT_STATUS.PENDING }
      );
    }

    payout.statusHistory.push({
      status,
      timestamp: new Date(),
      note: notes || `Status updated from ${previousStatus} to ${status}`,
      changedBy: adminUserId,
    });

    await payout.save();
    return payout;
  }

  /**
   * Admin: List all payouts across all sellers
   */
  async getAdminPayouts({ page = 1, limit = 20, status = '', sellerId = '' }) {
    const query = {};

    if (status && Object.values(PAYOUT_STATUS).includes(status.toUpperCase())) {
      query.status = status.toUpperCase();
    }

    if (sellerId && mongoose.Types.ObjectId.isValid(sellerId)) {
      query.seller = sellerId;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [payouts, total] = await Promise.all([
      Payout.find(query)
        .populate('seller', 'storeName slug logo')
        .populate('initiatedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Payout.countDocuments(query),
    ]);

    return {
      payouts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)) || 1,
      },
    };
  }

  /**
   * Admin: Get single payout details
   */
  async getAdminPayoutById(payoutId) {
    const payout = await Payout.findById(payoutId)
      .populate('seller', 'storeName slug logo businessInfo businessAddress bankInfo')
      .populate('sellerOrders', 'sellerOrderNumber totalAmount commissionRate commissionAmount sellerEarnings orderStatus payoutStatus createdAt items')
      .populate('initiatedBy', 'name email');

    if (!payout) {
      throw new Error('Payout record not found.');
    }

    return payout;
  }
}

module.exports = new PayoutService();
