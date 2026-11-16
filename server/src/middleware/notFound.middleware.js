const { errorResponse } = require('../utils/apiResponse');

const notFound = (req, res, next) => {
  return errorResponse(res, {
    statusCode: 404,
    message: `Endpoint not found: ${req.method} ${req.originalUrl}`,
  });
};

module.exports = notFound;

