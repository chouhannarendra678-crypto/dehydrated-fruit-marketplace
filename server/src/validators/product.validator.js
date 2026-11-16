const mongoose = require('mongoose');
const { errorResponse } = require('../utils/apiResponse');

const validateProductInput = (req, res, next) => {
  const { name, category, description, variants, images } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return errorResponse(res, {
      statusCode: 400,
      message: 'Product name is required',
    });
  }

  if (!category || !mongoose.Types.ObjectId.isValid(category)) {
    return errorResponse(res, {
      statusCode: 400,
      message: 'A valid Category ID is required',
    });
  }

  if (!description || typeof description !== 'string' || description.trim().length < 10) {
    return errorResponse(res, {
      statusCode: 400,
      message: 'Product description must be at least 10 characters long',
    });
  }

  if (!Array.isArray(variants) || variants.length === 0) {
    return errorResponse(res, {
      statusCode: 400,
      message: 'At least one weight variant is required (e.g. 100g, 250g, 500g, 1kg)',
    });
  }

  // Validate each variant
  for (let i = 0; i < variants.length; i++) {
    const v = variants[i];
    if (!v.weight || typeof v.weight !== 'string' || v.weight.trim().length === 0) {
      return errorResponse(res, {
        statusCode: 400,
        message: `Variant #${i + 1} must have a valid weight (e.g. 100g, 250g, 500g, 1kg)`,
      });
    }

    if (v.price === undefined || isNaN(v.price) || Number(v.price) < 0) {
      return errorResponse(res, {
        statusCode: 400,
        message: `Variant #${i + 1} price must be a valid non-negative number`,
      });
    }

    if (!v.SKU || typeof v.SKU !== 'string' || v.SKU.trim().length === 0) {
      return errorResponse(res, {
        statusCode: 400,
        message: `Variant #${i + 1} SKU is required`,
      });
    }

    if (v.stock === undefined || isNaN(v.stock) || Number(v.stock) < 0) {
      return errorResponse(res, {
        statusCode: 400,
        message: `Variant #${i + 1} stock must be a non-negative number`,
      });
    }
  }

  if (!Array.isArray(images) || images.length === 0 || !images[0]?.url) {
    return errorResponse(res, {
      statusCode: 400,
      message: 'At least one product image with a valid URL is required',
    });
  }

  next();
};

const validateProductStatusUpdate = (req, res, next) => {
  const { status, rejectionReason } = req.body;
  const valid = ['PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'INACTIVE'];

  if (!status || !valid.includes(status)) {
    return errorResponse(res, {
      statusCode: 400,
      message: `Invalid product status. Expected one of: ${valid.join(', ')}`,
    });
  }

  if (status === 'REJECTED' && (!rejectionReason || rejectionReason.trim().length < 5)) {
    return errorResponse(res, {
      statusCode: 400,
      message: 'A rejection reason of at least 5 characters is required when rejecting a product.',
    });
  }

  next();
};

module.exports = {
  validateProductInput,
  validateProductStatusUpdate,
};
