const User = require('../models/user.model');
const Seller = require('../models/seller.model');
const Product = require('../models/product.model');
const Order = require('../models/order.model');
const SellerOrder = require('../models/sellerOrder.model');
const Category = require('../models/category.model');
const Review = require('../models/review.model');
const Payout = require('../models/payout.model');
const Address = require('../models/address.model');
const SystemConfig = require('../models/systemConfig.model');

const {
  ROLES,
  SELLER_STATUS,
  PRODUCT_STATUS,
  ORDER_STATUS,
  PAYOUT_STATUS,
} = require('../constants/roles.constants');

const SETTINGS_KEY = 'PLATFORM_SETTINGS';

const DEFAULT_SETTINGS = {
  marketplaceName: 'Dehydrated Fruit Marketplace',
  tagline: 'Discover. Compare. Buy. Dehydrated.',
  supportEmail: 'support@dehydratedfruit.com',
  contactPhone: '+91 98765 43210',
  defaultCommissionRate: 8,
  minPayoutThreshold: 500,
  freeShippingThreshold: 500,
  maintenanceMode: false,
  notificationAlerts: true,
};

class AdminService {
  /**
   * Complete marketplace executive KPI & dashboard analytics
   */
  async getDashboardStats() {
    // 1. Parallel aggregations for speed
    const [
      allOrders,
      allSellerOrders,
      sellerCounts,
      productCounts,
      totalCustomers,
      pendingPayoutsCount,
      pendingReviewsCount,
      categories,
      recentOrders,
      recentSellers,
    ] = await Promise.all([
      // Master orders
      Order.find({ orderStatus: { $ne: ORDER_STATUS.CANCELLED } })
        .select('totalAmount orderStatus createdAt')
        .lean(),

      // Seller orders for platform commission and payouts
      SellerOrder.find({ orderStatus: { $ne: ORDER_STATUS.CANCELLED } })
        .select('totalAmount commissionAmount sellerEarnings orderStatus')
        .lean(),

      // Seller status distribution
      Seller.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),

      // Product status distribution
      Product.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),

      // Customer count
      User.countDocuments({ role: ROLES.CUSTOMER }),

      // Pending payouts queue count
      Payout.countDocuments({ status: PAYOUT_STATUS.PENDING }),

      // Pending reviews moderation queue count
      Review.countDocuments({ status: 'PENDING' }),

      // Categories
      Category.find().select('name slug image').lean(),

      // Recent 5 orders
      Order.find()
        .populate('customer', 'name email')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),

      // Recent 5 seller applications
      Seller.find()
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    // 2. Financial Metrics
    let totalGMV = 0;
    const orderStatusCounts = {
      CONFIRMED: 0,
      PROCESSING: 0,
      SHIPPED: 0,
      OUT_FOR_DELIVERY: 0,
      DELIVERED: 0,
      CANCELLED: 0,
    };

    for (const ord of allOrders) {
      totalGMV += Number(ord.totalAmount || 0);
      if (orderStatusCounts[ord.orderStatus] !== undefined) {
        orderStatusCounts[ord.orderStatus]++;
      }
    }

    let totalPlatformRevenue = 0;
    let totalSellerEarnings = 0;

    for (const so of allSellerOrders) {
      totalPlatformRevenue += Number(so.commissionAmount || 0);
      totalSellerEarnings += Number(so.sellerEarnings || 0);
    }

    // 3. Seller metrics
    const sellersSummary = {
      total: 0,
      APPROVED: 0,
      PENDING: 0,
      REJECTED: 0,
      SUSPENDED: 0,
    };

    for (const sc of sellerCounts) {
      if (sellersSummary[sc._id] !== undefined) {
        sellersSummary[sc._id] = sc.count;
      }
      sellersSummary.total += sc.count;
    }

    // 4. Product metrics
    const productsSummary = {
      total: 0,
      APPROVED: 0,
      PENDING_APPROVAL: 0,
      REJECTED: 0,
      INACTIVE: 0,
    };

    for (const pc of productCounts) {
      if (productsSummary[pc._id] !== undefined) {
        productsSummary[pc._id] = pc.count;
      }
      productsSummary.total += pc.count;
    }

    // 5. Category breakdown
    const productCategoryAggs = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    const catMap = {};
    for (const agg of productCategoryAggs) {
      if (agg._id) catMap[agg._id.toString()] = agg.count;
    }

    const categoryDistribution = categories.map((cat) => ({
      _id: cat._id,
      name: cat.name,
      slug: cat.slug,
      productCount: catMap[cat._id.toString()] || 0,
    }));

    return {
      financials: {
        totalGMV: Math.round(totalGMV * 100) / 100,
        totalPlatformRevenue: Math.round(totalPlatformRevenue * 100) / 100,
        totalSellerEarnings: Math.round(totalSellerEarnings * 100) / 100,
      },
      orders: {
        total: allOrders.length,
        breakdown: orderStatusCounts,
      },
      sellers: sellersSummary,
      products: productsSummary,
      customers: {
        total: totalCustomers,
      },
      pendingApprovals: {
        sellers: sellersSummary.PENDING,
        products: productsSummary.PENDING_APPROVAL,
        payouts: pendingPayoutsCount,
        reviews: pendingReviewsCount,
      },
      categoryDistribution,
      recentOrders: recentOrders.map((ord) => ({
        _id: ord._id,
        orderNumber: ord.orderNumber,
        customerName: ord.customer?.name || 'Customer',
        customerEmail: ord.customer?.email || '',
        totalAmount: ord.totalAmount,
        orderStatus: ord.orderStatus,
        paymentStatus: ord.paymentStatus,
        createdAt: ord.createdAt,
      })),
      recentSellers: recentSellers.map((s) => ({
        _id: s._id,
        storeName: s.storeName,
        slug: s.slug,
        ownerName: s.user?.name || '',
        ownerEmail: s.user?.email || '',
        status: s.status,
        createdAt: s.createdAt,
      })),
    };
  }

  /**
   * Customer directory list with order stats
   */
  async getCustomers({ page = 1, limit = 20, search = '' }) {
    const query = { role: ROLES.CUSTOMER };

    if (search && search.trim()) {
      const term = search.trim();
      query.$or = [
        { name: { $regex: term, $options: 'i' } },
        { email: { $regex: term, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [customers, total] = await Promise.all([
      User.find(query)
        .select('name email role createdAt isEmailVerified')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      User.countDocuments(query),
    ]);

    const customerIds = customers.map((c) => c._id);

    // Aggregate orders & total spent per customer
    const orderAggs = await Order.aggregate([
      {
        $match: {
          customer: { $in: customerIds },
          orderStatus: { $ne: ORDER_STATUS.CANCELLED },
        },
      },
      {
        $group: {
          _id: '$customer',
          totalSpent: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 },
        },
      },
    ]);

    const spentMap = {};
    for (const agg of orderAggs) {
      spentMap[agg._id.toString()] = agg;
    }

    const enrichedCustomers = customers.map((c) => {
      const stats = spentMap[c._id.toString()] || { totalSpent: 0, orderCount: 0 };
      return {
        ...c,
        orderCount: stats.orderCount,
        totalSpent: Math.round(stats.totalSpent * 100) / 100,
      };
    });

    return {
      customers: enrichedCustomers,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)) || 1,
      },
    };
  }

  /**
   * Single customer profile with address book & orders
   */
  async getCustomerById(customerId) {
    const customer = await User.findOne({ _id: customerId, role: ROLES.CUSTOMER })
      .select('-password')
      .lean();

    if (!customer) {
      const error = new Error('Customer account not found.');
      error.statusCode = 404;
      throw error;
    }

    const [addresses, orders] = await Promise.all([
      Address.find({ user: customer._id }).lean(),
      Order.find({ customer: customer._id })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean(),
    ]);

    let totalSpent = 0;
    for (const ord of orders) {
      if (ord.orderStatus !== ORDER_STATUS.CANCELLED) {
        totalSpent += Number(ord.totalAmount || 0);
      }
    }

    return {
      customer: {
        ...customer,
        totalSpent: Math.round(totalSpent * 100) / 100,
        orderCount: orders.length,
      },
      addresses,
      orders,
    };
  }

  /**
   * Platform global settings
   */
  async getPlatformSettings() {
    let config = await SystemConfig.findOne({ key: SETTINGS_KEY });
    if (!config) {
      config = await SystemConfig.create({
        key: SETTINGS_KEY,
        value: DEFAULT_SETTINGS,
        description: 'Global marketplace configuration parameters',
      });
    }
    return config.value;
  }

  /**
   * Update platform global settings
   */
  async updatePlatformSettings(settingsData, adminUserId) {
    let config = await SystemConfig.findOne({ key: SETTINGS_KEY });
    const current = config ? config.value : DEFAULT_SETTINGS;

    const updated = {
      ...current,
      ...settingsData,
      defaultCommissionRate:
        settingsData.defaultCommissionRate !== undefined
          ? Number(settingsData.defaultCommissionRate)
          : current.defaultCommissionRate,
      minPayoutThreshold:
        settingsData.minPayoutThreshold !== undefined
          ? Number(settingsData.minPayoutThreshold)
          : current.minPayoutThreshold,
      freeShippingThreshold:
        settingsData.freeShippingThreshold !== undefined
          ? Number(settingsData.freeShippingThreshold)
          : current.freeShippingThreshold,
      maintenanceMode: Boolean(settingsData.maintenanceMode),
    };

    config = await SystemConfig.findOneAndUpdate(
      { key: SETTINGS_KEY },
      {
        value: updated,
        updatedBy: adminUserId,
      },
      { upsert: true, new: true }
    );

    return config.value;
  }
}

module.exports = new AdminService();
