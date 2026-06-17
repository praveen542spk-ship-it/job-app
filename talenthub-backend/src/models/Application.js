// src/models/Application.js
const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Snapshot of applicant details at time of application
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: String,
    linkedIn: String,
    coverLetter: String,
    resumeUrl: String,         // path to uploaded file
    resumeOriginalName: String, // original filename for display

    status: {
      type: String,
      enum: ['pending', 'reviewed', 'interview', 'rejected', 'hired'],
      default: 'pending',
    },
    employerNotes: {
      type: String,
      select: false, // Not visible to candidates
    },
  },
  {
    timestamps: true,
  }
);

// ── One application per job per user ───────────────────────────────────
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });
applicationSchema.index({ applicant: 1, createdAt: -1 });
applicationSchema.index({ job: 1, createdAt: -1 });

module.exports = mongoose.model('Application', applicationSchema);
