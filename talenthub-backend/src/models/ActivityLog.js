// src/models/ActivityLog.js
const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  activityType: {
    type: String,
    required: true,
    enum: ['login', 'register', 'job_post', 'job_apply', 'job_delete', 'profile_update', 'status_update']
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  },
  details: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
