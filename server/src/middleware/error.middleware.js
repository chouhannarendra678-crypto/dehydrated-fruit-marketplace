const { errorResponse } = require('../utils/apiResponse');

// Centralized error handling middleware
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${err.name || 'Error'}: ${err.message}`);
  if (err.stack && process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  // Handle Mongoose CastError / ValidationError
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid resource ID: ${err.value}`;
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    const messages = Object.values(err.errors).map((val) => val.message);
    message = `Validation Error: ${messages.join(', ')}`;
  } else if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `Duplicate key error: '${field}' already exists`;
  }

  return errorResponse(res, {
    statusCode,
    message,
    errors: err.errors || null,
  });
};

module.exports = errorHandler;

