const categoryService = require('../services/category.service');
const { successResponse } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const getCategories = asyncHandler(async (req, res) => {
  const categories = await categoryService.getAllCategories();
  return successResponse(res, {
    statusCode: 200,
    message: 'Categories retrieved successfully',
    data: { categories },
  });
});

const getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await categoryService.getCategoryBySlug(req.params.slug);
  return successResponse(res, {
    statusCode: 200,
    message: 'Category retrieved successfully',
    data: { category },
  });
});

const createCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory(req.body);
  return successResponse(res, {
    statusCode: 201,
    message: 'Category created successfully',
    data: { category },
  });
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.updateCategory(req.params.id, req.body);
  return successResponse(res, {
    statusCode: 200,
    message: 'Category updated successfully',
    data: { category },
  });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const result = await categoryService.deleteCategory(req.params.id);
  return successResponse(res, {
    statusCode: 200,
    message: result.message,
    data: {},
  });
});

module.exports = {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
};
