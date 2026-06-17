// src/models/Job.js
const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
    logo: {
      type: String,
      default: '🏢',
    },
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
      maxlength: [10000, 'Description too long'],
    },
    requirements: {
      type: [String],
      default: [],
    },
    benefits: {
      type: [String],
      default: [],
    },
    skills: {
      type: [String],
      default: [],
    },
    location: {
      type: String,
      trim: true,
    },
    remote: {
      type: String,
      enum: ['On-site', 'Remote OK', 'Hybrid', 'Fully Remote'],
      default: 'On-site',
    },
    type: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Internship'],
      default: 'Full-time',
    },
    category: {
      type: String,
      enum: [
        'Engineering', 'Design', 'Marketing', 'Finance',
        'Healthcare', 'Education', 'Legal', 'Science', 'Other',
      ],
      required: true,
    },
    salary: {
      type: String,
      trim: true,
    },
    applyEmail: {
      type: String,
    },
    externalApplyUrl: {
      type: String,
      trim: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    flagCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'closed', 'draft'],
      default: 'active',
    },
    applicantCount: {
      type: Number,
      default: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Virtual: formatted posted date ─────────────────────────────────────
jobSchema.virtual('posted').get(function () {
  if (!this.createdAt) return 'Recently';
  const now = new Date();
  const diff = Math.floor((now - this.createdAt) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
  return this.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
});

// ── Virtual: isNew (posted within last 3 days) ─────────────────────────
jobSchema.virtual('isNew').get(function () {
  return (Date.now() - this.createdAt) < 3 * 24 * 60 * 60 * 1000;
});

// ── Indexes for fast search ─────────────────────────────────────────────
jobSchema.index({ title: 'text', company: 'text', description: 'text', skills: 'text' });
jobSchema.index({ status: 1, category: 1, type: 1, remote: 1 });
jobSchema.index({ employer: 1 });
jobSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Job', jobSchema);
