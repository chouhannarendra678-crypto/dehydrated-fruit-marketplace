const { errorResponse } = require('../utils/apiResponse');
const { SELLER_STATUS } = require('../constants/roles.constants');

const validateUpdateProfile = (req, res, next) => {
  const { storeName, businessInfo, businessAddress, bankInfo } = req.body;

  if (storeName && (typeof storeName !== 'string' || storeName.trim().length < 2)) {
    return errorResponse(res, {
      statusCode: 400,
      message: 'Store name must be at least 2 characters long',
    });
  }

  // PAN format validation if provided (e.g. ABCDE1234F)
  if (businessInfo?.pan) {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(businessInfo.pan.toUpperCase())) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'Invalid PAN format. Expected 10 alphanumeric characters (e.g. ABCDE1234F).',
      });
    }
  }

  // GST format validation if provided (15 characters)
  if (businessInfo?.gst && businessInfo.gst.trim().length > 0) {
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!gstRegex.test(businessInfo.gst.toUpperCase())) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'Invalid GSTIN format. Expected 15 characters (e.g. 27ABCDE1234F1Z5).',
      });
    }
  }

  // FSSAI 14-digit validation if provided
  if (businessInfo?.fssaiNumber && businessInfo.fssaiNumber.trim().length > 0) {
    const fssaiRegex = /^[0-9]{14}$/;
    if (!fssaiRegex.test(businessInfo.fssaiNumber)) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'Invalid FSSAI number. Expected a 14-digit numeric license/registration number.',
      });
    }
  }

  // IFSC code validation if provided (11 characters)
  if (bankInfo?.ifscCode && bankInfo.ifscCode.trim().length > 0) {
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscRegex.test(bankInfo.ifscCode.toUpperCase())) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'Invalid IFSC code format. Expected 11 characters (e.g. HDFC0001234).',
      });
    }
  }

  // Pincode validation if provided (6 digits)
  if (businessAddress?.pincode && businessAddress.pincode.trim().length > 0) {
    const pincodeRegex = /^[0-9]{6}$/;
    if (!pincodeRegex.test(businessAddress.pincode)) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'Invalid pincode format. Expected 6 digits.',
      });
    }
  }

  next();
};

const validateStatusUpdate = (req, res, next) => {
  const { status, rejectionReason, commissionRate } = req.body;

  const validStatuses = Object.values(SELLER_STATUS);
  if (!status || !validStatuses.includes(status)) {
    return errorResponse(res, {
      statusCode: 400,
      message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
    });
  }

  if (status === SELLER_STATUS.REJECTED && (!rejectionReason || rejectionReason.trim().length < 5)) {
    return errorResponse(res, {
      statusCode: 400,
      message: 'A rejection reason of at least 5 characters is required when rejecting a seller.',
    });
  }

  if (commissionRate !== undefined && (isNaN(commissionRate) || commissionRate < 0 || commissionRate > 100)) {
    return errorResponse(res, {
      statusCode: 400,
      message: 'Commission rate must be a valid percentage between 0 and 100.',
    });
  }

  next();
};

module.exports = {
  validateUpdateProfile,
  validateStatusUpdate,
};
