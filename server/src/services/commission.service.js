const SystemConfig = require('../models/systemConfig.model');
const Seller = require('../models/seller.model');
const SellerOrder = require('../models/sellerOrder.model');
const { DEFAULT_COMMISSION_RATE } = require('../utils/calculateCommission');
const { SELLER_STATUS, ORDER_STATUS } = require('../constants/roles.constants');

const CONFIG_KEY = 'PLATFORM_COMMISSION';

class CommissionService {
  /**
   * Get the active global default commission percentage
   * Fallback to 8% (within the 5–10% bracket)
   */
  async getPlatformDefaultCommissionRate() {
    const config = await SystemConfig.findOne({ key: CONFIG_KEY });
    if (config?.value?.defaultCommissionRate !== undefined) {
      return Number(config.value.defaultCommissionRate);
    }
    return DEFAULT_COMMISSION_RATE;
  }

  /**
   * Get platform commission configuration and overall metrics
   */
  async getCommissionConfig() {
    let config = await SystemConfig.findOne({ key: CONFIG_KEY });
    if (!config) {
      config = await SystemConfig.create({
        key: CONFIG_KEY,
        value: {
          defaultCommissionRate: DEFAULT_COMMISSION_RATE,
          minCommissionRate: 5,
          maxCommissionRate: 25,
          minPayoutAmount: 500,
        },
        description: 'Marketplace platform commission take-rate and payout threshold configuration',
      });
    }

    // Compute marketplace-wide commission metrics
    const nonCancelledOrders = await SellerOrder.find({
      orderStatus: { $ne: ORDER_STATUS.CANCELLED },
    }).select('totalAmount commissionAmount sellerEarnings');

    let totalGrossGMV = 0;
    let totalPlatformCommission = 0;
    let totalSellerEarnings = 0;

    for (const ord of nonCancelledOrders) {
      totalGrossGMV += Number(ord.totalAmount || 0);
      totalPlatformCommission += Number(ord.commissionAmount || 0);
      totalSellerEarnings += Number(ord.sellerEarnings || 0);
    }

    const defaultRate = config.value.defaultCommissionRate || DEFAULT_COMMISSION_RATE;
    const sellersWithCustomRate = await Seller.countDocuments({
      status: SELLER_STATUS.APPROVED,
      commissionRate: { $ne: defaultRate },
    });

    const totalApprovedSellers = await Seller.countDocuments({
      status: SELLER_STATUS.APPROVED,
    });

    return {
      config: config.value,
      metrics: {
        totalGrossGMV: Math.round(totalGrossGMV * 100) / 100,
        totalPlatformCommission: Math.round(totalPlatformCommission * 100) / 100,
        totalSellerEarnings: Math.round(totalSellerEarnings * 100) / 100,
        defaultCommissionRate: defaultRate,
        sellersWithCustomRate,
        totalApprovedSellers,
      },
    };
  }

  /**
   * Update the global platform commission rate
   */
  async updateCommissionConfig({ defaultCommissionRate, minCommissionRate, maxCommissionRate, minPayoutAmount, adminUserId }) {
    const rate = Number(defaultCommissionRate);
    if (isNaN(rate) || rate < 1 || rate > 50) {
      throw new Error('Platform commission rate must be a valid number between 1% and 50%.');
    }

    let config = await SystemConfig.findOne({ key: CONFIG_KEY });
    const currentValue = config ? config.value : {};

    const updatedValue = {
      defaultCommissionRate: rate,
      minCommissionRate: minCommissionRate !== undefined ? Number(minCommissionRate) : (currentValue.minCommissionRate || 5),
      maxCommissionRate: maxCommissionRate !== undefined ? Number(maxCommissionRate) : (currentValue.maxCommissionRate || 25),
      minPayoutAmount: minPayoutAmount !== undefined ? Number(minPayoutAmount) : (currentValue.minPayoutAmount || 500),
    };

    config = await SystemConfig.findOneAndUpdate(
      { key: CONFIG_KEY },
      {
        value: updatedValue,
        updatedBy: adminUserId,
      },
      { upsert: true, new: true }
    );

    return config.value;
  }

  /**
   * Get all sellers and their assigned commission rates
   */
  async getSellerCommissions({ page = 1, limit = 20, search = '' }) {
    const query = { status: SELLER_STATUS.APPROVED };

    if (search) {
      query.$or = [
        { storeName: { $regex: search, $options: 'i' } },
        { 'businessInfo.businessName': { $regex: search, $options: 'i' } },
      ];
    }

    const defaultRate = await this.getPlatformDefaultCommissionRate();
    const skip = (Number(page) - 1) * Number(limit);

    const [sellers, total] = await Promise.all([
      Seller.find(query)
        .populate('user', 'name email')
        .sort({ storeName: 1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Seller.countDocuments(query),
    ]);

    // Aggregate lifetime sales & commission for each seller
    const sellerIds = sellers.map((s) => s._id);
    const orderAggregates = await SellerOrder.aggregate([
      {
        $match: {
          seller: { $in: sellerIds },
          orderStatus: { $ne: ORDER_STATUS.CANCELLED },
        },
      },
      {
        $group: {
          _id: '$seller',
          totalSales: { $sum: '$totalAmount' },
          totalCommission: { $sum: '$commissionAmount' },
          totalEarnings: { $sum: '$sellerEarnings' },
          orderCount: { $sum: 1 },
        },
      },
    ]);

    const statsMap = {};
    for (const agg of orderAggregates) {
      statsMap[agg._id.toString()] = agg;
    }

    const enrichedSellers = sellers.map((seller) => {
      const stats = statsMap[seller._id.toString()] || {
        totalSales: 0,
        totalCommission: 0,
        totalEarnings: 0,
        orderCount: 0,
      };

      const currentRate = seller.commissionRate !== undefined ? seller.commissionRate : defaultRate;

      return {
        _id: seller._id,
        storeName: seller.storeName,
        slug: seller.slug,
        ownerName: seller.user?.name || 'Unknown',
        ownerEmail: seller.user?.email || '',
        commissionRate: currentRate,
        isCustomRate: currentRate !== defaultRate,
        totalSales: Math.round(stats.totalSales * 100) / 100,
        totalCommission: Math.round(stats.totalCommission * 100) / 100,
        totalEarnings: Math.round(stats.totalEarnings * 100) / 100,
        orderCount: stats.orderCount,
      };
    });

    return {
      sellers: enrichedSellers,
      defaultCommissionRate: defaultRate,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)) || 1,
      },
    };
  }

  /**
   * Set a custom commission rate for an individual seller
   */
  async updateSellerCommission(sellerId, { commissionRate, adminUserId }) {
    const rate = Number(commissionRate);
    if (isNaN(rate) || rate < 0 || rate > 50) {
      throw new Error('Seller commission rate must be between 0% and 50%.');
    }

    const seller = await Seller.findById(sellerId);
    if (!seller) {
      throw new Error('Seller not found.');
    }

    seller.commissionRate = rate;
    await seller.save();

    return {
      _id: seller._id,
      storeName: seller.storeName,
      commissionRate: seller.commissionRate,
      updatedAt: seller.updatedAt,
    };
  }
}

module.exports = new CommissionService();
