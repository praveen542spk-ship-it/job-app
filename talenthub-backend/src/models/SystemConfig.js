// src/models/SystemConfig.js
const mongoose = require('mongoose');

const systemConfigSchema = new mongoose.Schema(
  {
    bannerActive: {
      type: Boolean,
      default: false,
    },
    bannerText: {
      type: String,
      default: '',
    },
    bannerColor: {
      type: String,
      default: '#6366f1',
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    maintenanceMessage: {
      type: String,
      default: 'System is currently undergoing scheduled maintenance. Please check back later!',
    },
    maintenanceEndTime: {
      type: Date,
      default: () => new Date(Date.now() + 3600000), // Default 1 hour from now
    },
    maxApplicationsLimit: {
      type: Number,
      default: 15,
    },
    maxFileSizeLimitMb: {
      type: Number,
      default: 5,
    },
    categories: {
      type: [String],
      default: ['Engineering', 'Design', 'Product', 'Marketing', 'Sales', 'Customer Support', 'Finance', 'Legal', 'Healthcare', 'Education', 'Other'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SystemConfig', systemConfigSchema);
