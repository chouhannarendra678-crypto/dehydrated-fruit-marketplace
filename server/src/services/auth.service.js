const crypto = require('crypto');
const User = require('../models/user.model');
const { ROLES, SELLER_STATUS } = require('../constants/roles.constants');

class AuthService {
  /**
   * Register a standard Customer account
   */
  async registerCustomer({ name, email, password, phone }) {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      const error = new Error('An account with this email address already exists');
      error.statusCode = 409;
      throw error;
    }

    // Generate email verification token
    const verificationRawToken = crypto.randomBytes(32).toString('hex');
    const hashedVerificationToken = crypto
      .createHash('sha256')
      .update(verificationRawToken)
      .digest('hex');

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone: phone || '',
      role: ROLES.CUSTOMER,
      emailVerificationToken: hashedVerificationToken,
      emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    const token = user.generateAuthToken();

    return {
      user,
      token,
      emailVerificationToken: verificationRawToken,
    };
  }

  /**
   * Register a new Seller with initial PENDING status
   */
  async registerSeller({ name, email, password, storeName, phone }) {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      const error = new Error('An account with this email address already exists');
      error.statusCode = 409;
      throw error;
    }

    const verificationRawToken = crypto.randomBytes(32).toString('hex');
    const hashedVerificationToken = crypto
      .createHash('sha256')
      .update(verificationRawToken)
      .digest('hex');

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      storeName: storeName || '',
      phone: phone || '',
      role: ROLES.SELLER,
      sellerStatus: SELLER_STATUS.PENDING,
      emailVerificationToken: hashedVerificationToken,
      emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000,
    });

    const token = user.generateAuthToken();

    return {
      user,
      token,
      emailVerificationToken: verificationRawToken,
    };
  }

  /**
   * Authenticate a user with email and password
   */
  async loginUser({ email, password }) {
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const token = user.generateAuthToken();

    return {
      user,
      token,
    };
  }

  /**
   * Fetch authenticated user's current profile
   */
  async getUserProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('User profile not found');
      error.statusCode = 404;
      throw error;
    }
    return user;
  }

  /**
   * Initiate forgot password flow
   */
  async forgotPassword(email) {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't leak registered status, return standard confirmation
      return { message: 'If that email address is registered, password reset instructions have been generated.' };
    }

    const resetRawToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetRawToken)
      .digest('hex');
    user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 minutes

    await user.save({ validateBeforeSave: false });

    return {
      message: 'If that email address is registered, password reset instructions have been generated.',
      resetToken: resetRawToken, // Exposed in development/foundation response
    };
  }

  /**
   * Complete password reset
   */
  async resetPassword(token, newPassword) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      const error = new Error('Password reset token is invalid or has expired');
      error.statusCode = 400;
      throw error;
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    const authToken = user.generateAuthToken();

    return {
      message: 'Password has been successfully updated',
      user,
      token: authToken,
    };
  }

  /**
   * Verify account email address
   */
  async verifyEmail(token) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      const error = new Error('Email verification token is invalid or has expired');
      error.statusCode = 400;
      throw error;
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    return {
      message: 'Email address successfully verified',
      user,
    };
  }
}

module.exports = new AuthService();
