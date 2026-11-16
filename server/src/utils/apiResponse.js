/**
 * Standard API response utility functions
 */

const successResponse = (res, { statusCode = 200, message = 'Success', data = {} } = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const errorResponse = (res, { statusCode = 500, message = 'Internal Server Error', errors = null } = {}) => {
  const response = {
    success: false,
    message,
  };

  if (errors && process.env.NODE_ENV !== 'production') {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

module.exports = {
  successResponse,
  errorResponse,
};

