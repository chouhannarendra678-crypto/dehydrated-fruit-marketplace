const mongoose = require('mongoose');

const systemConfigSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Helper to get or set a config value with a default fallback
systemConfigSchema.statics.getOrSet = async function (key, defaultValue, description = '') {
  let config = await this.findOne({ key: key.toUpperCase() });
  if (!config) {
    config = await this.create({
      key: key.toUpperCase(),
      value: defaultValue,
      description,
    });
  }
  return config.value;
};

const SystemConfig = mongoose.model('SystemConfig', systemConfigSchema);

module.exports = SystemConfig;
