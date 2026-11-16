const productService = require('../services/product.service');
const { uploadToCloudinary } = require('../utils/cloudinary');
const { successResponse } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(
    req.seller._id,
    req.seller.storeName,
    req.body
  );

  return successResponse(res, {
    statusCode: 201,
    message: 'Product submitted successfully and is pending admin approval',
    data: { product },
  });
});

const getSellerProducts = asyncHandler(async (req, res) => {
  const result = await productService.getSellerProducts(req.seller._id, req.query);

  return successResponse(res, {
    statusCode: 200,
    message: 'Seller products retrieved successfully',
    data: result,
  });
});

const updateProduct = asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === 'ADMIN';
  const product = await productService.updateProduct(
    req.params.id,
    req.seller ? req.seller._id : null,
    req.body,
    isAdmin
  );

  return successResponse(res, {
    statusCode: 200,
    message: 'Product updated successfully',
    data: { product },
  });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === 'ADMIN';
  const result = await productService.deleteProduct(
    req.params.id,
    req.seller ? req.seller._id : null,
    isAdmin
  );

  return successResponse(res, {
    statusCode: 200,
    message: result.message,
    data: {},
  });
});

const getPublicProducts = asyncHandler(async (req, res) => {
  const result = await productService.getPublicProducts(req.query);

  return successResponse(res, {
    statusCode: 200,
    message: 'Marketplace products retrieved successfully',
    data: result,
  });
});

const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await productService.getProductBySlug(req.params.slug, req.user);

  return successResponse(res, {
    statusCode: 200,
    message: 'Product details retrieved successfully',
    data: { product },
  });
});

const adminGetAllProducts = asyncHandler(async (req, res) => {
  const result = await productService.adminGetAllProducts(req.query);

  return successResponse(res, {
    statusCode: 200,
    message: 'All products retrieved for admin',
    data: result,
  });
});

const adminUpdateProductStatus = asyncHandler(async (req, res) => {
  const product = await productService.adminUpdateProductStatus(req.params.id, req.body);

  return successResponse(res, {
    statusCode: 200,
    message: `Product status updated to ${product.status}`,
    data: { product },
  });
});

const uploadProductImage = asyncHandler(async (req, res) => {
  const { image } = req.body;
  if (!image) {
    return res.status(400).json({ success: false, message: 'Image payload is required' });
  }

  const result = await uploadToCloudinary(image, 'dehydrated-fruits/products');

  return successResponse(res, {
    statusCode: 200,
    message: 'Image uploaded to Cloudinary successfully',
    data: result,
  });
});

module.exports = {
  createProduct,
  getSellerProducts,
  updateProduct,
  deleteProduct,
  getPublicProducts,
  getProductBySlug,
  adminGetAllProducts,
  adminUpdateProductStatus,
  uploadProductImage,
};
