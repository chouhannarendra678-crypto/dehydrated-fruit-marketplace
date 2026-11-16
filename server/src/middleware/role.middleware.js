const { errorResponse } = require('../utils/apiResponse');

/**
 * Role-based authorization middleware
 * @param  {...string} allowedRoles - Array of allowed roles e.g. 'ADMIN', 'SELLER'
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, {
        statusCode: 401,
        message: 'Authentication required before accessing this protected resource.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(res, {
        statusCode: 403,
        message: `Forbidden: role '${req.user.role}' is not authorized to access this resource.`,
      });
    }

    next();
  };
};

module.exports = authorizeRoles;
