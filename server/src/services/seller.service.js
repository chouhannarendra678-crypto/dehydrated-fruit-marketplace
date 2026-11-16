const Seller = require('../models/seller.model');
const User = require('../models/user.model');
const { SELLER_STATUS } = require('../constants/roles.constants');

class SellerService {
  /**
   * Fetch current seller's complete profile
   */
  async getSellerProfile(userId) {
    let seller = await Seller.findOne({ user: userId }).populate(
      'user',
      'name email phone role avatar'
    );

    if (!seller) {
      const user = await User.findById(userId);
      if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
      }

      const storeName = user.storeName || `${user.name}'s Fruit Store`;
      const slug = await Seller.generateSlug(storeName);

      seller = await Seller.create({
        user: userId,
        storeName,
        slug,
        status: user.sellerStatus || SELLER_STATUS.PENDING,
      });

      seller = await seller.populate('user', 'name email phone role avatar');
    }

    return seller;
  }

  /**
   * Update seller store, business, address, and payout information
   */
  async updateSellerProfile(userId, updateData) {
    const seller = await Seller.findOne({ user: userId });
    if (!seller) {
      const error = new Error('Seller profile not found');
      error.statusCode = 404;
      throw error;
    }

    // Check storeName uniqueness if updating
    if (updateData.storeName && updateData.storeName !== seller.storeName) {
      const existing = await Seller.findOne({
        storeName: updateData.storeName.trim(),
        _id: { $ne: seller._id },
      });
      if (existing) {
        const error = new Error('A store with this name already exists. Please choose a distinct brand name.');
        error.statusCode = 409;
        throw error;
      }
      seller.storeName = updateData.storeName.trim();
      seller.slug = await Seller.generateSlug(seller.storeName);
    }

    if (updateData.description !== undefined) {
      seller.description = updateData.description.trim();
    }

    if (updateData.logo) {
      seller.logo = { ...seller.logo, ...updateData.logo };
    }

    if (updateData.banner) {
      seller.banner = { ...seller.banner, ...updateData.banner };
    }

    // Business info (PAN, GST, FSSAI)
    if (updateData.businessInfo) {
      seller.businessInfo = {
        ...seller.businessInfo.toObject(),
        ...updateData.businessInfo,
      };
      if (updateData.businessInfo.pan) {
        seller.businessInfo.pan = updateData.businessInfo.pan.toUpperCase().trim();
      }
      if (updateData.businessInfo.gst) {
        seller.businessInfo.gst = updateData.businessInfo.gst.toUpperCase().trim();
      }
    }

    // Physical business address
    if (updateData.businessAddress) {
      seller.businessAddress = {
        ...seller.businessAddress.toObject(),
        ...updateData.businessAddress,
      };
    }

    // Bank payout info
    if (updateData.bankInfo) {
      seller.bankInfo = {
        ...seller.bankInfo.toObject(),
        ...updateData.bankInfo,
      };
      if (updateData.bankInfo.ifscCode) {
        seller.bankInfo.ifscCode = updateData.bankInfo.ifscCode.toUpperCase().trim();
      }
    }

    // If seller was rejected, re-submitting profile resets to PENDING for admin re-evaluation
    if (seller.status === SELLER_STATUS.REJECTED) {
      seller.status = SELLER_STATUS.PENDING;
      seller.rejectionReason = '';
      await User.findByIdAndUpdate(userId, { sellerStatus: SELLER_STATUS.PENDING });
    }

    await seller.save();
    return seller.populate('user', 'name email phone role avatar');
  }

  /**
   * Public: List approved sellers for customer exploration
   */
  async getPublicSellers({ search, limit = 12 }) {
    const query = { status: SELLER_STATUS.APPROVED };

    if (search && search.trim()) {
      query.$or = [
        { storeName: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { 'businessAddress.city': { $regex: search.trim(), $options: 'i' } },
        { 'businessAddress.state': { $regex: search.trim(), $options: 'i' } },
      ];
    }

    return await Seller.find(query)
      .select('-bankInfo -businessInfo.pan -businessInfo.gst')
      .populate('user', 'name avatar')
      .sort({ rating: -1, reviewCount: -1 })
      .limit(Number(limit));
  }

  /**
   * Public store profile lookup by slug
   */
  async getSellerStoreBySlug(slug) {
    const seller = await Seller.findOne({ slug })
      .select('-bankInfo -businessInfo.pan')
      .populate('user', 'name avatar');

    if (!seller) {
      const error = new Error('Seller store not found');
      error.statusCode = 404;
      throw error;
    }

    return seller;
  }

  /**
   * Get basic dashboard metrics for vendor hub
   */
  async getSellerDashboardStats(sellerId) {
    const seller = await Seller.findById(sellerId);
    if (!seller) {
      const error = new Error('Seller not found');
      error.statusCode = 404;
      throw error;
    }

    // Metrics foundation for Phase 3
    return {
      status: seller.status,
      isVerified: seller.isVerified,
      commissionRate: seller.commissionRate,
      rejectionReason: seller.rejectionReason,
      totalSales: 0,
      totalOrders: 0,
      pendingOrders: 0,
      activeProducts: 0,
      availableBalance: 0,
      pendingPayout: 0,
    };
  }

  /**
   * Admin: List all sellers with filtering & pagination
   */
  async getAllSellers({ page = 1, limit = 10, status, search }) {
    const query = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { storeName: { $regex: search, $options: 'i' } },
        { 'businessInfo.businessName': { $regex: search, $options: 'i' } },
        { 'businessInfo.pan': { $regex: search, $options: 'i' } },
        { 'businessInfo.fssaiNumber': { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [sellers, total] = await Promise.all([
      Seller.find(query)
        .populate('user', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Seller.countDocuments(query),
    ]);

    return {
      sellers,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Admin: Approve, Reject, or Suspend a seller
   */
  async updateSellerStatus(sellerId, { status, rejectionReason, commissionRate }) {
    const seller = await Seller.findById(sellerId);
    if (!seller) {
      const error = new Error('Seller not found');
      error.statusCode = 404;
      throw error;
    }

    seller.status = status;

    if (status === SELLER_STATUS.APPROVED) {
      seller.isVerified = true;
      seller.rejectionReason = '';
    } else if (status === SELLER_STATUS.REJECTED) {
      seller.isVerified = false;
      seller.rejectionReason = rejectionReason || 'Verification requirements not satisfied';
    } else if (status === SELLER_STATUS.SUSPENDED) {
      seller.isVerified = false;
    }

    if (commissionRate !== undefined) {
      seller.commissionRate = commissionRate;
    }

    await seller.save();

    // Sync status to the linked User model
    await User.findByIdAndUpdate(seller.user, { sellerStatus: status });

    return seller.populate('user', 'name email phone');
  }
}

module.exports = new SellerService();
