const Cart = require('../models/cart.model');
const Product = require('../models/product.model');
const ProductVariant = require('../models/productVariant.model');
const Seller = require('../models/seller.model');
const Address = require('../models/address.model');
const { PRODUCT_STATUS } = require('../constants/roles.constants');

// Free shipping threshold per seller (₹500), otherwise flat ₹50 shipping per seller
const FREE_SHIPPING_THRESHOLD = 500;
const STANDARD_SHIPPING_PER_SELLER = 50;
const GST_TAX_RATE = 0.05; // 5% GST on packaged dried fruits

class CartService {
  /**
   * Recalculates all cart items, seller groups, shipping, and grand totals directly against DB records.
   * NEVER trusts frontend prices or totals!
   */
  async calculateCart(rawItems) {
    const evaluatedItems = [];
    const validationErrors = [];
    let isValidForCheckout = true;

    for (const raw of rawItems) {
      const productId = raw.product?._id || raw.product || raw.productId;
      const variantId = raw.variant?._id || raw.variant || raw.variantId;
      const quantity = Math.max(1, parseInt(raw.quantity, 10) || 1);

      // Load live product
      const product = await Product.findById(productId).populate('seller', 'storeName slug isVerified logo businessAddress');
      if (!product) {
        validationErrors.push('One of the products in your cart is no longer available.');
        isValidForCheckout = false;
        continue;
      }

      if (product.status !== PRODUCT_STATUS.APPROVED) {
        validationErrors.push(`"${product.name}" is currently not available for purchase.`);
        isValidForCheckout = false;
        continue;
      }

      // Load live variant
      const variant = await ProductVariant.findOne({ _id: variantId, product: product._id });
      if (!variant) {
        validationErrors.push(`Selected weight option for "${product.name}" is no longer available.`);
        isValidForCheckout = false;
        continue;
      }

      const availableStock = variant.stock;
      const isOutOfStock = availableStock <= 0;
      let effectiveQuantity = quantity;

      if (isOutOfStock) {
        validationErrors.push(`"${product.name}" (${variant.weight}) is currently out of stock.`);
        isValidForCheckout = false;
      } else if (quantity > availableStock) {
        validationErrors.push(
          `"${product.name}" (${variant.weight}) only has ${availableStock} units in stock. Please adjust quantity.`
        );
        isValidForCheckout = false;
        effectiveQuantity = availableStock;
      }

      const unitPrice = variant.price;
      const mrp = variant.mrp || variant.price;
      const itemTotal = unitPrice * effectiveQuantity;

      evaluatedItems.push({
        _id: raw._id,
        product: {
          _id: product._id,
          name: product.name,
          slug: product.slug,
          images: product.images,
          addedSugar: product.addedSugar,
          preservatives: product.preservatives,
        },
        variant: {
          _id: variant._id,
          weight: variant.weight,
          price: unitPrice,
          mrp,
          SKU: variant.SKU,
          stock: availableStock,
        },
        seller: {
          _id: product.seller._id,
          storeName: product.seller.storeName,
          slug: product.seller.slug,
          isVerified: product.seller.isVerified,
          city: product.seller.businessAddress?.city || '',
          state: product.seller.businessAddress?.state || '',
        },
        quantity: effectiveQuantity,
        unitPrice,
        mrp,
        itemTotal,
        isOutOfStock,
        maxStock: availableStock,
      });
    }

    if (evaluatedItems.length === 0) {
      isValidForCheckout = false;
    }

    // Group items by Seller (Multi-Vendor grouping)
    const sellerGroupsMap = {};
    let subtotal = 0;
    let totalItems = 0;

    for (const item of evaluatedItems) {
      const sId = item.seller._id.toString();
      if (!sellerGroupsMap[sId]) {
        sellerGroupsMap[sId] = {
          seller: item.seller,
          items: [],
          sellerSubtotal: 0,
          sellerItemCount: 0,
          shippingFee: 0,
          freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
          amountNeededForFreeShipping: FREE_SHIPPING_THRESHOLD,
        };
      }

      sellerGroupsMap[sId].items.push(item);
      sellerGroupsMap[sId].sellerSubtotal += item.itemTotal;
      sellerGroupsMap[sId].sellerItemCount += item.quantity;

      subtotal += item.itemTotal;
      totalItems += item.quantity;
    }

    // Calculate shipping per seller
    let totalShipping = 0;
    const sellerGroups = Object.values(sellerGroupsMap).map((group) => {
      if (group.sellerSubtotal >= FREE_SHIPPING_THRESHOLD) {
        group.shippingFee = 0;
        group.amountNeededForFreeShipping = 0;
      } else {
        group.shippingFee = STANDARD_SHIPPING_PER_SELLER;
        group.amountNeededForFreeShipping = FREE_SHIPPING_THRESHOLD - group.sellerSubtotal;
      }
      totalShipping += group.shippingFee;
      return group;
    });

    const tax = Math.round(subtotal * GST_TAX_RATE);
    const discount = 0;
    const grandTotal = subtotal + totalShipping + tax - discount;

    return {
      items: evaluatedItems,
      sellerGroups,
      summary: {
        subtotal,
        totalShipping,
        tax,
        discount,
        grandTotal,
        totalItems,
        sellerCount: sellerGroups.length,
        isValidForCheckout,
        validationErrors,
      },
    };
  }

  /**
   * Get user's cart
   */
  async getCart(userId) {
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }

    return await this.calculateCart(cart.items);
  }

  /**
   * Add an item to user's cart
   */
  async addItem(userId, { productId, variantId, quantity = 1 }) {
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }

    // Validate product & variant exist
    const product = await Product.findById(productId);
    if (!product || product.status !== PRODUCT_STATUS.APPROVED) {
      const error = new Error('Product not available for purchase');
      error.statusCode = 400;
      throw error;
    }

    const variant = await ProductVariant.findOne({ _id: variantId, product: product._id });
    if (!variant) {
      const error = new Error('Product weight option not found');
      error.statusCode = 400;
      throw error;
    }

    const qtyToAdd = Math.max(1, parseInt(quantity, 10) || 1);

    const existingIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId.toString() && item.variant.toString() === variantId.toString()
    );

    if (existingIndex > -1) {
      const newQty = cart.items[existingIndex].quantity + qtyToAdd;
      if (newQty > variant.stock) {
        cart.items[existingIndex].quantity = variant.stock;
      } else {
        cart.items[existingIndex].quantity = newQty;
      }
    } else {
      cart.items.push({
        product: product._id,
        variant: variant._id,
        seller: product.seller,
        quantity: Math.min(qtyToAdd, variant.stock),
      });
    }

    await cart.save();
    return await this.calculateCart(cart.items);
  }

  /**
   * Update item quantity in cart
   */
  async updateItemQuantity(userId, itemId, quantity) {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      const error = new Error('Cart not found');
      error.statusCode = 404;
      throw error;
    }

    const itemIndex = cart.items.findIndex((item) => item._id.toString() === itemId.toString());
    if (itemIndex === -1) {
      const error = new Error('Cart item not found');
      error.statusCode = 404;
      throw error;
    }

    const targetItem = cart.items[itemIndex];
    const qty = parseInt(quantity, 10);

    if (qty <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      const variant = await ProductVariant.findById(targetItem.variant);
      if (variant && qty > variant.stock) {
        targetItem.quantity = variant.stock;
      } else {
        targetItem.quantity = qty;
      }
    }

    await cart.save();
    return await this.calculateCart(cart.items);
  }

  /**
   * Remove item from cart
   */
  async removeItem(userId, itemId) {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      const error = new Error('Cart not found');
      error.statusCode = 404;
      throw error;
    }

    cart.items = cart.items.filter((item) => item._id.toString() !== itemId.toString());
    await cart.save();

    return await this.calculateCart(cart.items);
  }

  /**
   * Clear all items from cart
   */
  async clearCart(userId) {
    let cart = await Cart.findOne({ user: userId });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    return await this.calculateCart([]);
  }

  /**
   * Merge guest cart items into user's DB cart upon login
   */
  async syncGuestCart(userId, guestItems = []) {
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }

    for (const g of guestItems) {
      const productId = g.productId || g.product?._id;
      const variantId = g.variantId || g.variant?._id;
      const quantity = Math.max(1, parseInt(g.quantity, 10) || 1);

      if (!productId || !variantId) continue;

      const product = await Product.findById(productId);
      if (!product || product.status !== PRODUCT_STATUS.APPROVED) continue;

      const variant = await ProductVariant.findOne({ _id: variantId, product: product._id });
      if (!variant || variant.stock <= 0) continue;

      const existingIndex = cart.items.findIndex(
        (i) => i.product.toString() === productId.toString() && i.variant.toString() === variantId.toString()
      );

      if (existingIndex > -1) {
        cart.items[existingIndex].quantity = Math.min(
          cart.items[existingIndex].quantity + quantity,
          variant.stock
        );
      } else {
        cart.items.push({
          product: product._id,
          variant: variant._id,
          seller: product.seller,
          quantity: Math.min(quantity, variant.stock),
        });
      }
    }

    await cart.save();
    return await this.calculateCart(cart.items);
  }

  /**
   * Server-side checkout calculation and validation
   * Supports either logged-in user cart or explicit items payload
   */
  async validateCheckout(userId, { items, addressId }) {
    let rawItems = [];

    if (Array.isArray(items) && items.length > 0) {
      rawItems = items;
    } else if (userId) {
      const cart = await Cart.findOne({ user: userId });
      rawItems = cart ? cart.items : [];
    }

    const calculated = await this.calculateCart(rawItems);

    let address = null;
    if (addressId) {
      address = await Address.findById(addressId);
      if (!address) {
        calculated.summary.isValidForCheckout = false;
        calculated.summary.validationErrors.push('Selected shipping address is invalid.');
      }
    }

    return {
      ...calculated,
      address,
    };
  }
}

module.exports = new CartService();
