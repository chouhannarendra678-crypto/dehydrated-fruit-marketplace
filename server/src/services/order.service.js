const Order = require('../models/order.model');
const SellerOrder = require('../models/sellerOrder.model');
const Product = require('../models/product.model');
const ProductVariant = require('../models/productVariant.model');
const Address = require('../models/address.model');
const Seller = require('../models/seller.model');
const cartService = require('./cart.service');
const commissionService = require('./commission.service');
const { calculateCommission } = require('../utils/calculateCommission');
const { ORDER_STATUS, PAYMENT_STATUS, PAYOUT_STATUS } = require('../constants/roles.constants');

class OrderService {
  /**
   * 1 Customer Checkout => Creates 1 Master Order and N SellerOrders
   * With atomic stock reduction and negative inventory prevention
   */
  async createOrder(customerId, { addressId, paymentMethod = 'RAZORPAY', items }) {
    // 1. Verify delivery address
    const address = await Address.findOne({ _id: addressId, user: customerId });
    if (!address) {
      const error = new Error('Valid delivery address is required');
      error.statusCode = 400;
      throw error;
    }

    const shippingAddressSnapshot = {
      fullName: address.fullName,
      phone: address.phone,
      street: address.street,
      apartment: address.apartment || '',
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country || 'India',
    };

    // 2. Recalculate cart items & groupings on server (zero trust on frontend numbers)
    let rawItems = items;
    if (!rawItems || rawItems.length === 0) {
      const dbCart = await cartService.getCart(customerId);
      rawItems = dbCart.items;
    }

    const calculatedCart = await cartService.calculateCart(rawItems);
    if (!calculatedCart.summary.isValidForCheckout || calculatedCart.items.length === 0) {
      const error = new Error(
        calculatedCart.summary.validationErrors.length > 0
          ? calculatedCart.summary.validationErrors[0]
          : 'Cart is empty or not valid for checkout'
      );
      error.statusCode = 400;
      throw error;
    }

    // 3. ATOMIC STOCK REDUCTION & NEGATIVE INVENTORY PREVENTION
    // We atomically decrement variant stock where stock >= quantity.
    // If any item fails, we rollback previously decremented stock and throw an error.
    const decrementedVariants = [];
    try {
      for (const item of calculatedCart.items) {
        const variantId = item.variant._id;
        const qtyToDeduct = item.quantity;

        const updatedVariant = await ProductVariant.findOneAndUpdate(
          { _id: variantId, stock: { $gte: qtyToDeduct } },
          { $inc: { stock: -qtyToDeduct } },
          { new: true }
        );

        if (!updatedVariant) {
          throw new Error(
            `Insufficient stock for "${item.product.name}" (${item.variant.weight}). Please adjust quantity.`
          );
        }

        // Also update cached totalStock on Product
        await Product.findByIdAndUpdate(item.product._id, {
          $inc: { totalStock: -qtyToDeduct },
        });

        decrementedVariants.push({
          variantId,
          productId: item.product._id,
          quantity: qtyToDeduct,
        });
      }
    } catch (stockError) {
      // Rollback all previously decremented variants
      for (const rollback of decrementedVariants) {
        await ProductVariant.findByIdAndUpdate(rollback.variantId, {
          $inc: { stock: rollback.quantity },
        });
        await Product.findByIdAndUpdate(rollback.productId, {
          $inc: { totalStock: rollback.quantity },
        });
      }

      stockError.statusCode = 400;
      throw stockError;
    }

    // 4. Generate Master Order Number
    const orderNumber = Order.generateOrderNumber();
    const createdSellerOrders = [];
    const sellerOrderIds = [];
    const distinctSellerIds = [];

    // Temporary placeholder for Master Order ID to link bidirectionally
    const masterOrderId = new (require('mongoose').Types.ObjectId)();

    // 5. Create Separate SellerOrders for each regional vendor
    for (let i = 0; i < calculatedCart.sellerGroups.length; i++) {
      const group = calculatedCart.sellerGroups[i];
      const sellerId = group.seller._id;
      distinctSellerIds.push(sellerId);

      const sellerOrderNumber = `${orderNumber}-S${i + 1}`;
      const sellerItems = group.items.map((item) => ({
        product: item.product._id,
        productName: item.product.name,
        productSlug: item.product.slug,
        productImage: item.product.images?.[0]?.url || '',
        variant: item.variant._id,
        weight: item.variant.weight,
        SKU: item.variant.SKU || '',
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        itemTotal: item.itemTotal,
      }));

      const sellerSubtotal = group.sellerSubtotal;
      const shippingFee = group.shippingFee;
      const sellerTax = Math.round(sellerSubtotal * 0.05);
      const totalAmount = sellerSubtotal + shippingFee + sellerTax;

      // Platform commission calculation via calculateCommission.js
      const sellerDoc = await Seller.findById(sellerId).select('commissionRate');
      const defaultPlatformRate = await commissionService.getPlatformDefaultCommissionRate();
      const effectiveRate = sellerDoc?.commissionRate !== undefined ? sellerDoc.commissionRate : defaultPlatformRate;

      const commissionResult = calculateCommission({
        subtotal: sellerSubtotal,
        shippingFee,
        tax: sellerTax,
        totalAmount,
        commissionRate: effectiveRate,
      });

      const commissionRate = commissionResult.commissionRate;
      const commissionAmount = commissionResult.platformCommission;
      const sellerEarnings = commissionResult.sellerEarning;

      const sellerOrder = new SellerOrder({
        sellerOrderNumber,
        masterOrder: masterOrderId,
        seller: sellerId,
        customer: customerId,
        shippingAddress: shippingAddressSnapshot,
        items: sellerItems,
        subtotal: sellerSubtotal,
        shippingFee,
        tax: sellerTax,
        totalAmount,
        commissionRate,
        commissionAmount,
        sellerEarnings,
        payoutStatus: PAYOUT_STATUS.PENDING,
        orderStatus: ORDER_STATUS.CONFIRMED,
        statusHistory: [
          {
            status: ORDER_STATUS.CONFIRMED,
            timestamp: new Date(),
            note: 'Vendor order confirmed from master checkout',
          },
        ],
      });

      await sellerOrder.save();
      createdSellerOrders.push(sellerOrder);
      sellerOrderIds.push(sellerOrder._id);
    }

    // 6. Create Master Order
    const masterOrderItems = calculatedCart.items.map((item) => ({
      product: item.product._id,
      productName: item.product.name,
      productSlug: item.product.slug,
      productImage: item.product.images?.[0]?.url || '',
      variant: item.variant._id,
      weight: item.variant.weight,
      SKU: item.variant.SKU || '',
      seller: item.seller._id,
      sellerName: item.seller.storeName,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      itemTotal: item.itemTotal,
    }));

    const masterOrder = new Order({
      _id: masterOrderId,
      orderNumber,
      customer: customerId,
      shippingAddress: shippingAddressSnapshot,
      sellerOrders: sellerOrderIds,
      sellers: distinctSellerIds,
      items: masterOrderItems,
      subtotal: calculatedCart.summary.subtotal,
      totalShipping: calculatedCart.summary.totalShipping,
      tax: calculatedCart.summary.tax,
      discount: calculatedCart.summary.discount,
      grandTotal: calculatedCart.summary.grandTotal,
      paymentMethod,
      paymentStatus: PAYMENT_STATUS.PENDING,
      orderStatus: ORDER_STATUS.CONFIRMED,
    });

    await masterOrder.save();

    // 7. Clear user's shopping cart
    await cartService.clearCart(customerId);

    return await masterOrder.populate([
      {
        path: 'sellerOrders',
        populate: { path: 'seller', select: 'storeName slug logo isVerified' },
      },
      { path: 'customer', select: 'name email phone' },
      { path: 'sellers', select: 'storeName slug isVerified' },
    ]);
  }

  /**
   * Get all orders placed by a customer
   */
  async getCustomerOrders(customerId, { page = 1, limit = 10, status }) {
    const query = { customer: customerId };
    if (status) query.orderStatus = status;

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate({
          path: 'sellerOrders',
          select: 'sellerOrderNumber orderStatus totalAmount trackingInfo seller',
          populate: { path: 'seller', select: 'storeName slug isVerified' },
        })
        .populate('sellers', 'storeName slug isVerified')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Order.countDocuments(query),
    ]);

    return {
      orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get specific Master Order details for customer
   */
  async getCustomerOrderById(customerId, orderId) {
    const order = await Order.findOne({
      $or: [{ _id: orderId.match(/^[0-9a-fA-F]{24}$/) ? orderId : null }, { orderNumber: orderId }],
      customer: customerId,
    })
      .populate({
        path: 'sellerOrders',
        populate: { path: 'seller', select: 'storeName slug logo isVerified businessAddress' },
      })
      .populate('sellers', 'storeName slug isVerified');

    if (!order) {
      const error = new Error('Order not found');
      error.statusCode = 404;
      throw error;
    }

    return order;
  }

  /**
   * Customer cancels an order (only if CONFIRMED or PROCESSING)
   */
  async cancelCustomerOrder(customerId, orderId, { reason = '' }) {
    const order = await Order.findOne({
      $or: [{ _id: orderId.match(/^[0-9a-fA-F]{24}$/) ? orderId : null }, { orderNumber: orderId }],
      customer: customerId,
    }).populate('sellerOrders');

    if (!order) {
      const error = new Error('Order not found');
      error.statusCode = 404;
      throw error;
    }

    if (order.orderStatus !== ORDER_STATUS.CONFIRMED && order.orderStatus !== ORDER_STATUS.PROCESSING) {
      const error = new Error('Order cannot be cancelled as it is already shipped or completed');
      error.statusCode = 400;
      throw error;
    }

    // Cancel Master Order
    order.orderStatus = ORDER_STATUS.CANCELLED;
    order.cancellationReason = reason || 'Customer requested cancellation';
    order.cancelledAt = new Date();
    await order.save();

    // Cancel all child SellerOrders and restore variant inventory
    for (const sellerOrder of order.sellerOrders) {
      sellerOrder.orderStatus = ORDER_STATUS.CANCELLED;
      sellerOrder.cancellationReason = reason || 'Customer cancelled master order';
      sellerOrder.cancelledAt = new Date();
      sellerOrder.statusHistory.push({
        status: ORDER_STATUS.CANCELLED,
        timestamp: new Date(),
        note: `Cancelled by customer: ${reason}`,
      });
      await sellerOrder.save();

      // Restore inventory
      for (const item of sellerOrder.items) {
        await ProductVariant.findByIdAndUpdate(item.variant, {
          $inc: { stock: item.quantity },
        });
        await Product.findByIdAndUpdate(item.product, {
          $inc: { totalStock: item.quantity },
        });
      }
    }

    return order;
  }

  /**
   * Seller views orders assigned strictly to their vendor account
   */
  async getSellerOrders(sellerId, { page = 1, limit = 10, status, search }) {
    const query = { seller: sellerId };
    if (status) query.orderStatus = status;
    if (search) {
      query.$or = [
        { sellerOrderNumber: { $regex: search, $options: 'i' } },
        { 'shippingAddress.fullName': { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      SellerOrder.find(query)
        .populate('customer', 'name email phone')
        .populate('masterOrder', 'orderNumber paymentStatus paymentMethod createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      SellerOrder.countDocuments(query),
    ]);

    return {
      orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Seller views a single specific sub-order
   */
  async getSellerOrderById(sellerId, sellerOrderId) {
    const sellerOrder = await SellerOrder.findOne({
      $or: [
        { _id: sellerOrderId.match(/^[0-9a-fA-F]{24}$/) ? sellerOrderId : null },
        { sellerOrderNumber: sellerOrderId },
      ],
      seller: sellerId,
    })
      .populate('customer', 'name email phone')
      .populate('masterOrder', 'orderNumber paymentStatus paymentMethod');

    if (!sellerOrder) {
      const error = new Error('Vendor order not found or unauthorized');
      error.statusCode = 404;
      throw error;
    }

    return sellerOrder;
  }

  /**
   * Seller updates fulfillment status for their own sub-order
   * Sellers CANNOT modify payment records!
   */
  async updateSellerOrderStatus(sellerId, sellerOrderId, { status, courier, trackingNumber, note }) {
    const sellerOrder = await SellerOrder.findOne({
      $or: [
        { _id: sellerOrderId.match(/^[0-9a-fA-F]{24}$/) ? sellerOrderId : null },
        { sellerOrderNumber: sellerOrderId },
      ],
      seller: sellerId,
    });

    if (!sellerOrder) {
      const error = new Error('Vendor order not found or unauthorized');
      error.statusCode = 404;
      throw error;
    }

    if (!Object.values(ORDER_STATUS).includes(status)) {
      const error = new Error('Invalid order status specified');
      error.statusCode = 400;
      throw error;
    }

    sellerOrder.orderStatus = status;
    sellerOrder.statusHistory.push({
      status,
      timestamp: new Date(),
      note: note || `Vendor updated status to ${status}`,
    });

    if (courier) sellerOrder.trackingInfo.courier = courier.trim();
    if (trackingNumber) sellerOrder.trackingInfo.trackingNumber = trackingNumber.trim();

    if (status === ORDER_STATUS.SHIPPED && !sellerOrder.trackingInfo.dispatchedAt) {
      sellerOrder.trackingInfo.dispatchedAt = new Date();
    }
    if (status === ORDER_STATUS.DELIVERED && !sellerOrder.trackingInfo.deliveredAt) {
      sellerOrder.trackingInfo.deliveredAt = new Date();
    }

    // If seller cancels their order, restore stock
    if (status === ORDER_STATUS.CANCELLED) {
      sellerOrder.cancellationReason = note || 'Vendor cancelled order';
      sellerOrder.cancelledAt = new Date();

      for (const item of sellerOrder.items) {
        await ProductVariant.findByIdAndUpdate(item.variant, {
          $inc: { stock: item.quantity },
        });
        await Product.findByIdAndUpdate(item.product, {
          $inc: { totalStock: item.quantity },
        });
      }
    }

    await sellerOrder.save();

    // Check sibling SellerOrders under Master Order to sync overall status
    const siblingOrders = await SellerOrder.find({ masterOrder: sellerOrder.masterOrder });
    const allStatuses = siblingOrders.map((o) => o.orderStatus);

    let masterStatus = ORDER_STATUS.PROCESSING;
    if (allStatuses.every((s) => s === ORDER_STATUS.DELIVERED)) {
      masterStatus = ORDER_STATUS.DELIVERED;
    } else if (allStatuses.some((s) => s === ORDER_STATUS.OUT_FOR_DELIVERY)) {
      masterStatus = ORDER_STATUS.OUT_FOR_DELIVERY;
    } else if (allStatuses.some((s) => s === ORDER_STATUS.SHIPPED)) {
      masterStatus = ORDER_STATUS.SHIPPED;
    } else if (allStatuses.every((s) => s === ORDER_STATUS.CANCELLED)) {
      masterStatus = ORDER_STATUS.CANCELLED;
    }

    await Order.findByIdAndUpdate(sellerOrder.masterOrder, { orderStatus: masterStatus });

    return sellerOrder;
  }

  /**
   * Admin: List all marketplace Master Orders
   */
  async getAdminOrders({ page = 1, limit = 20, status, paymentStatus, search }) {
    const query = {};
    if (status) query.orderStatus = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'shippingAddress.fullName': { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('customer', 'name email phone')
        .populate('sellers', 'storeName slug isVerified')
        .populate('sellerOrders')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Order.countDocuments(query),
    ]);

    return {
      orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Admin: View specific Master Order with all child SellerOrders and details
   */
  async getAdminOrderById(orderId) {
    const order = await Order.findOne({
      $or: [{ _id: orderId.match(/^[0-9a-fA-F]{24}$/) ? orderId : null }, { orderNumber: orderId }],
    })
      .populate('customer', 'name email phone')
      .populate({
        path: 'sellerOrders',
        populate: { path: 'seller', select: 'storeName slug logo isVerified businessAddress' },
      })
      .populate('sellers', 'storeName slug isVerified');

    if (!order) {
      const error = new Error('Order not found');
      error.statusCode = 404;
      throw error;
    }

    return order;
  }

  /**
   * Admin: Update Master Order status
   */
  async adminUpdateOrderStatus(orderId, { orderStatus, paymentStatus, reason }) {
    const order = await Order.findById(orderId).populate('sellerOrders');
    if (!order) {
      const error = new Error('Order not found');
      error.statusCode = 404;
      throw error;
    }

    if (orderStatus) {
      order.orderStatus = orderStatus;
      if (orderStatus === ORDER_STATUS.CANCELLED) {
        order.cancellationReason = reason || 'Cancelled by Admin';
        order.cancelledAt = new Date();

        // Restore inventory across all sub-orders
        for (const sellerOrder of order.sellerOrders) {
          sellerOrder.orderStatus = ORDER_STATUS.CANCELLED;
          await sellerOrder.save();

          for (const item of sellerOrder.items) {
            await ProductVariant.findByIdAndUpdate(item.variant, {
              $inc: { stock: item.quantity },
            });
            await Product.findByIdAndUpdate(item.product, {
              $inc: { totalStock: item.quantity },
            });
          }
        }
      }
    }

    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    await order.save();
    return order;
  }
}

module.exports = new OrderService();
