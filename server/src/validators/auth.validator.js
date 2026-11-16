const { errorResponse } = require('../utils/apiResponse');

const validateCustomerRegister = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return errorResponse(res, {
      statusCode: 400,
      message: 'Name is required and must be valid',
    });
  }

  if (!email || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/.test(email)) {
    return errorResponse(res, {
      statusCode: 400,
      message: 'A valid email address is required',
    });
  }

  if (!password || password.length < 6) {
    return errorResponse(res, {
      statusCode: 400,
      message: 'Password must be at least 6 characters long',
    });
  }

  // Security check: Never allow user to specify ADMIN or custom roles during public customer signup
  if (req.body.role && req.body.role.toUpperCase() === 'ADMIN') {
    return errorResponse(res, {
      statusCode: 403,
      message: 'Admin account creation is strictly forbidden via public registration',
    });
  }

  next();
};

const validateSellerRegister = (req, res, next) => {
  const { name, email, password, storeName } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return errorResponse(res, {
      statusCode: 400,
      message: 'Contact name is required',
    });
  }

  if (!storeName || typeof storeName !== 'string' || storeName.trim().length === 0) {
    return errorResponse(res, {
      statusCode: 400,
      message: 'Store / Brand name is required for seller registration',
    });
  }

  if (!email || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/.test(email)) {
    return errorResponse(res, {
      statusCode: 400,
      message: 'A valid business email address is required',
    });
  }

  if (!password || password.length < 6) {
    return errorResponse(res, {
      statusCode: 400,
      message: 'Password must be at least 6 characters long',
    });
  }

  if (req.body.role && req.body.role.toUpperCase() === 'ADMIN') {
    return errorResponse(res, {
      statusCode: 403,
      message: 'Admin account creation is strictly forbidden via public registration',
    });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return errorResponse(res, {
      statusCode: 400,
      message: 'Email and password are required',
    });
  }

  next();
};

const validateForgotPassword = (req, res, next) => {
  const { email } = req.body;

  if (!email || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/.test(email)) {
    return errorResponse(res, {
      statusCode: 400,
      message: 'Please provide a valid email address',
    });
  }

  next();
};

const validateResetPassword = (req, res, next) => {
  const { password } = req.body;

  if (!password || password.length < 6) {
    return errorResponse(res, {
      statusCode: 400,
      message: 'New password must be at least 6 characters long',
    });
  }

  next();
};

module.exports = {
  validateCustomerRegister,
  validateSellerRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
};
