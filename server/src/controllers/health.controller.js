const { successResponse } = require('../utils/apiResponse');

const getHealthStatus = (req, res) => {
  return successResponse(res, {
    statusCode: 200,
    message: 'API is running',
    data: {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      service: 'Dehydrated Fruit Marketplace API',
      version: '1.0.0',
    },
  });
};

module.exports = {
  getHealthStatus,
};

