const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    fullName: {
      type: String,
      required: [true, 'Please provide the recipient full name'],
      trim: true,
      maxlength: [100, 'Full name cannot exceed 100 characters'],
    },
    phone: {
      type: String,
      required: [true, 'Please provide a 10-digit mobile contact number'],
      trim: true,
    },
    street: {
      type: String,
      required: [true, 'Please provide street address, house/flat number'],
      trim: true,
    },
    apartment: {
      type: String,
      default: '',
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'Please provide city / town'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'Please provide state'],
      trim: true,
    },
    postalCode: {
      type: String,
      required: [true, 'Please provide a 6-digit postal code / PIN'],
      trim: true,
    },
    country: {
      type: String,
      default: 'India',
      trim: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      enum: ['HOME', 'WORK', 'OTHER'],
      default: 'HOME',
    },
  },
  {
    timestamps: true,
  }
);

// If this address is set to default, ensure all other addresses for this user are not default
addressSchema.pre('save', async function (next) {
  if (this.isDefault) {
    await this.constructor.updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { $set: { isDefault: false } }
    );
  }
  next();
});

const Address = mongoose.model('Address', addressSchema);

module.exports = Address;
