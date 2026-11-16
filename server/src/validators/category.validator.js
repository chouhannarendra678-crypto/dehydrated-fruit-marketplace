const { errorResponse } = require('../utils/apiResponse');

const validateCategoryInput = (req, res, next) => {
  const { name } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return errorResponse(res, {
      statusCode: 400,
      message: 'Category name is required',
    });
  }

  next();
};

module.exports = {
  validateCategoryInput,
};
