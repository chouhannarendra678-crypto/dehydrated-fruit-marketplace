const Product = require('../models/product.model');
const ProductVariant = require('../models/productVariant.model');
const Category = require('../models/category.model');
const Seller = require('../models/seller.model');
const { PRODUCT_STATUS } = require('../constants/roles.constants');

class ProductService {
  /**
   * Seller creates a new product with weight variants
   */
  async createProduct(sellerId, sellerStoreName, data) {
    // Verify category exists
    const category = await Category.findById(data.category);
    if (!category) {
      const error = new Error('Selected category does not exist');
      error.statusCode = 404;
      throw error;
    }

    const slug = await Product.generateSlug(data.name, sellerStoreName);

    const product = new Product({
      name: data.name.trim(),
      slug,
      category: data.category,
      seller: sellerId,
      description: data.description.trim(),
      images: data.images,
      ingredients: Array.isArray(data.ingredients)
        ? data.ingredients
        : data.ingredients ? [data.ingredients] : [],
      nutrition: data.nutrition || {},
      shelfLife: data.shelfLife || '12 Months',
      storageInstructions: data.storageInstructions || 'Store in a cool, dry place away from sunlight.',
      addedSugar: Boolean(data.addedSugar),
      preservatives: Boolean(data.preservatives),
      status: PRODUCT_STATUS.PENDING_APPROVAL,
    });

    await product.save();

    // Create linked weight variants
    let minPrice = Infinity;
    let totalStock = 0;
    const variantIds = [];

    for (let i = 0; i < data.variants.length; i++) {
      const v = data.variants[i];
      const variantPrice = Number(v.price);
      const variantStock = Number(v.stock);

      const variant = await ProductVariant.create({
        product: product._id,
        weight: v.weight.trim(),
        price: variantPrice,
        mrp: v.mrp ? Number(v.mrp) : variantPrice,
        SKU: v.SKU.trim().toUpperCase(),
        stock: variantStock,
        isDefault: i === 0 || Boolean(v.isDefault),
      });

      variantIds.push(variant._id);
      if (variantPrice < minPrice) minPrice = variantPrice;
      totalStock += variantStock;
    }

    product.variants = variantIds;
    product.minPrice = minPrice === Infinity ? 0 : minPrice;
    product.totalStock = totalStock;
    await product.save();

    return await product.populate([
      { path: 'category', select: 'name slug' },
      { path: 'seller', select: 'storeName slug isVerified' },
      { path: 'variants' },
    ]);
  }

  /**
   * Get products owned by a specific seller
   */
  async getSellerProducts(sellerId, { status, search, page = 1, limit = 20 }) {
    const query = { seller: sellerId };
    if (status) query.status = status;
    if (search) query.name = { $regex: search, $options: 'i' };

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .populate('variants')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(query),
    ]);

    return {
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update an existing product and its variants
   */
  async updateProduct(productId, sellerId, data, isAdmin = false) {
    const product = await Product.findById(productId);
    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    if (!isAdmin && product.seller.toString() !== sellerId.toString()) {
      const error = new Error('Unauthorized to modify this product');
      error.statusCode = 403;
      throw error;
    }

    if (data.name && data.name.trim() !== product.name) {
      const seller = await Seller.findById(product.seller);
      product.name = data.name.trim();
      product.slug = await Product.generateSlug(product.name, seller?.storeName || '');
    }

    if (data.category) product.category = data.category;
    if (data.description) product.description = data.description.trim();
    if (data.images && data.images.length > 0) product.images = data.images;
    if (data.ingredients !== undefined) {
      product.ingredients = Array.isArray(data.ingredients)
        ? data.ingredients
        : [data.ingredients];
    }
    if (data.nutrition) product.nutrition = { ...product.nutrition, ...data.nutrition };
    if (data.shelfLife) product.shelfLife = data.shelfLife;
    if (data.storageInstructions) product.storageInstructions = data.storageInstructions;
    if (data.addedSugar !== undefined) product.addedSugar = Boolean(data.addedSugar);
    if (data.preservatives !== undefined) product.preservatives = Boolean(data.preservatives);

    // If variants are replaced
    if (Array.isArray(data.variants) && data.variants.length > 0) {
      await ProductVariant.deleteMany({ product: product._id });

      let minPrice = Infinity;
      let totalStock = 0;
      const variantIds = [];

      for (let i = 0; i < data.variants.length; i++) {
        const v = data.variants[i];
        const variantPrice = Number(v.price);
        const variantStock = Number(v.stock);

        const variant = await ProductVariant.create({
          product: product._id,
          weight: v.weight.trim(),
          price: variantPrice,
          mrp: v.mrp ? Number(v.mrp) : variantPrice,
          SKU: v.SKU.trim().toUpperCase(),
          stock: variantStock,
          isDefault: i === 0 || Boolean(v.isDefault),
        });

        variantIds.push(variant._id);
        if (variantPrice < minPrice) minPrice = variantPrice;
        totalStock += variantStock;
      }

      product.variants = variantIds;
      product.minPrice = minPrice === Infinity ? 0 : minPrice;
      product.totalStock = totalStock;
    }

    // Reset status to PENDING_APPROVAL for re-moderation if updated by seller after rejection
    if (!isAdmin && product.status === PRODUCT_STATUS.REJECTED) {
      product.status = PRODUCT_STATUS.PENDING_APPROVAL;
      product.rejectionReason = '';
    }

    await product.save();

    return await product.populate([
      { path: 'category', select: 'name slug' },
      { path: 'seller', select: 'storeName slug isVerified' },
      { path: 'variants' },
    ]);
  }

  /**
   * Delete a product and its variants
   */
  async deleteProduct(productId, sellerId, isAdmin = false) {
    const product = await Product.findById(productId);
    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    if (!isAdmin && product.seller.toString() !== sellerId.toString()) {
      const error = new Error('Unauthorized to delete this product');
      error.statusCode = 403;
      throw error;
    }

    await ProductVariant.deleteMany({ product: product._id });
    await product.deleteOne();

    return { message: 'Product and variants deleted successfully' };
  }

  /**
   * Public: List approved products with multi-attribute filtering, sorting & search
   */
  async getPublicProducts(params = {}) {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      weight,
      rating,
      availability,
      inStock,
      addedSugar,
      preservatives,
      sellerSlug,
      sort = 'newest',
      page = 1,
      limit = 12,
    } = params;

    // Only approved products are publicly visible!
    const query = { status: PRODUCT_STATUS.APPROVED };

    // Multi-entity search across product name, description, ingredients, category name & seller store name
    if (search && search.trim()) {
      const term = search.trim();
      const [matchingSellers, matchingCategories] = await Promise.all([
        Seller.find({ storeName: { $regex: term, $options: 'i' } }).select('_id'),
        Category.find({ name: { $regex: term, $options: 'i' } }).select('_id'),
      ]);

      const sellerIds = matchingSellers.map((s) => s._id);
      const catIds = matchingCategories.map((c) => c._id);

      query.$or = [
        { name: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } },
        { ingredients: { $regex: term, $options: 'i' } },
        ...(sellerIds.length > 0 ? [{ seller: { $in: sellerIds } }] : []),
        ...(catIds.length > 0 ? [{ category: { $in: catIds } }] : []),
      ];
    }

    if (category) {
      const catDoc = await Category.findOne({
        $or: [{ slug: category }, { _id: category.match(/^[0-9a-fA-F]{24}$/) ? category : null }],
      });
      if (catDoc) query.category = catDoc._id;
    }

    if (sellerSlug) {
      const sellerDoc = await Seller.findOne({ slug: sellerSlug });
      if (sellerDoc) query.seller = sellerDoc._id;
    }

    // Weight filter (100g, 250g, 500g, 1kg)
    if (weight) {
      const matchingVariants = await ProductVariant.find({
        weight: { $regex: `^${weight}$`, $options: 'i' },
      }).select('product');
      const productIds = matchingVariants.map((v) => v.product);
      query._id = query._id ? { $in: productIds, ...query._id } : { $in: productIds };
    }

    // Availability / In-stock filter
    if (availability === 'in_stock' || inStock === true || inStock === 'true') {
      query.totalStock = { $gt: 0 };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      query.minPrice = {};
      if (minPrice !== undefined && minPrice !== '') query.minPrice.$gte = Number(minPrice);
      if (maxPrice !== undefined && maxPrice !== '') query.minPrice.$lte = Number(maxPrice);
      if (Object.keys(query.minPrice).length === 0) delete query.minPrice;
    }

    if (rating !== undefined && rating !== '') {
      query.rating = { $gte: Number(rating) };
    }

    if (addedSugar !== undefined && addedSugar !== '') {
      query.addedSugar = addedSugar === 'true' || addedSugar === true;
    }

    if (preservatives !== undefined && preservatives !== '') {
      query.preservatives = preservatives === 'true' || preservatives === true;
    }

    // Sort definition
    let sortOption = { isFeatured: -1, createdAt: -1 };
    switch (sort) {
      case 'price-low-high':
        sortOption = { minPrice: 1 };
        break;
      case 'price-high-low':
        sortOption = { minPrice: -1 };
        break;
      case 'top-rated':
        sortOption = { rating: -1, reviewCount: -1 };
        break;
      case 'popular':
        sortOption = { reviewCount: -1, rating: -1 };
        break;
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'relevance':
        sortOption = { isFeatured: -1, rating: -1, createdAt: -1 };
        break;
      default:
        sortOption = { isFeatured: -1, createdAt: -1 };
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .populate('seller', 'storeName slug rating isVerified logo businessAddress')
        .populate('variants')
        .sort(sortOption)
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(query),
    ]);

    return {
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Public: Get product by slug (with verification of approval state)
   */
  async getProductBySlug(slug, user = null) {
    const product = await Product.findOne({ slug })
      .populate('category', 'name slug')
      .populate('seller', 'storeName slug rating reviewCount isVerified logo businessAddress')
      .populate('variants');

    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    // Only approved products can appear publicly unless viewed by the owner seller or admin
    if (product.status !== PRODUCT_STATUS.APPROVED) {
      const isOwner = user && product.seller.user && product.seller.user.toString() === user._id.toString();
      const isAdmin = user && user.role === 'ADMIN';

      if (!isOwner && !isAdmin) {
        const error = new Error('Product not found or pending admin approval');
        error.statusCode = 404;
        throw error;
      }
    }

    return product;
  }

  /**
   * Admin: List all products across vendors
   */
  async adminGetAllProducts({ status, search, page = 1, limit = 20 }) {
    const query = {};
    if (status) query.status = status;
    if (search) query.name = { $regex: search, $options: 'i' };

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .populate('seller', 'storeName slug isVerified')
        .populate('variants')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(query),
    ]);

    return {
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Admin: Moderate product status (APPROVE, REJECT, INACTIVE)
   */
  async adminUpdateProductStatus(productId, { status, rejectionReason, isFeatured }) {
    const product = await Product.findById(productId);
    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    product.status = status;

    if (status === PRODUCT_STATUS.APPROVED) {
      product.rejectionReason = '';
    } else if (status === PRODUCT_STATUS.REJECTED) {
      product.rejectionReason = rejectionReason || 'Product submission does not meet quality standards';
    }

    if (isFeatured !== undefined) {
      product.isFeatured = Boolean(isFeatured);
    }

    await product.save();
    return await product.populate([
      { path: 'category', select: 'name slug' },
      { path: 'seller', select: 'storeName slug isVerified' },
      { path: 'variants' },
    ]);
  }
}

module.exports = new ProductService();
