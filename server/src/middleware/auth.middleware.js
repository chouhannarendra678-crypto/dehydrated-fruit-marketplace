const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const env = require('../config/env.config');
const { errorResponse } = require('../utils/apiResponse');

const authenticate = async (req, res, next) => {
  let token = null;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return errorResponse(res, {
      statusCode: 401,
      message: 'Authentication token missing. Please sign in.',
    });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return errorResponse(res, {
        statusCode: 401,
        message: 'Account associated with token no longer exists.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('[Auth Middleware Error]:', error.message);
    return errorResponse(res, {
      statusCode: 401,
      message: 'Invalid or expired authentication token. Please sign in again.',
    });
  }
};

module.exports = authenticate;
