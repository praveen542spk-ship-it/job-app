// src/controllers/applicationController.js
const { validationResult } = require('express-validator');
const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const {
  sendApplicationConfirmation,
  sendNewApplicationAlert,
  sendStatusUpdate,
} = require('../utils/email');
const supabase = require('../config/supabase');

// ── POST /api/applications ──────────────────────────────────────────────
const createApplication = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { jobId, phone, linkedIn, coverLetter } = req.body;

    const job = await Job.findById(jobId).populate('employer', 'name email');
    if (!job || job.status !== 'active') {
      return res.status(404).json({ success: false, message: 'Job not found or no longer accepting applications.' });
    }

    const existing = await Application.findOne({ job: jobId, applicant: req.user._id });
    if (existing) {
      return res.status(409).json({ success: false, message: 'You have already applied to this job.' });
    }

    const appData = {
      job: jobId,
      applicant: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: phone || req.user.phone,
      linkedIn: linkedIn || req.user.linkedIn,
      coverLetter,
    };

    if (req.file) {
      appData.resumeUrl = req.file.path;
      appData.resumeOriginalName = req.file.originalname;
    } else if (req.body.resumeUrl) {
      appData.resumeUrl = req.body.resumeUrl;
      appData.resumeOriginalName = req.body.resumeOriginalName || 'Saved_Resume.pdf';
    } else if (req.user.resumeUrl) {
      appData.resumeUrl = req.user.resumeUrl;
      appData.resumeOriginalName = req.user.resumeOriginalName || 'Saved_Resume.pdf';
    }

    const application = await Application.create(appData);

    await Job.findByIdAndUpdate(jobId, { $inc: { applicantCount: 1 } });

    // ✅ Supabase Realtime — New application broadcast (Employer-க்கு live notify)
    await supabase.channel('applications').send({
      type: 'broadcast',
      event: 'application_created',
      payload: {
        _id: application._id,
        jobId: jobId,
        jobTitle: job.title,
        candidateName: req.user.name,
        candidateEmail: req.user.email,
      },
    });

    // Log application activity
    await ActivityLog.create({
      activityType: 'job_apply',
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
      details: `Applied for "${job.title}" at "${job.company}"`
    }).catch(err => console.error("Activity log error:", err));

    const emailPromises = [
      sendApplicationConfirmation({
        to: req.user.email,
        candidateName: req.user.name,
        jobTitle: job.title,
        company: job.company,
      }),
      sendNewApplicationAlert({
        to: job.applyEmail || job.employer.email,
        employerName: job.employer.name,
        candidateName: req.user.name,
        candidateEmail: req.user.email,
        candidatePhone: appData.phone,
        candidateLinkedIn: appData.linkedIn,
        coverLetter: appData.coverLetter,
        resumeUrl: appData.resumeUrl,
        resumeOriginalName: appData.resumeOriginalName,
        jobTitle: job.title,
        applicationId: application._id,
      }),
      sendNewApplicationAlert({
        to: 'praveen542spk@gmail.com', // Admin notification
        employerName: 'System Admin',
        candidateName: req.user.name,
        candidateEmail: req.user.email,
        candidatePhone: appData.phone,
        candidateLinkedIn: appData.linkedIn,
        coverLetter: appData.coverLetter,
        resumeUrl: appData.resumeUrl,
        resumeOriginalName: appData.resumeOriginalName,
        jobTitle: job.title,
        applicationId: application._id,
      })
    ];

    Promise.allSettled(emailPromises).then((results) => {
      results.forEach((r, i) => {
        if (r.status === 'rejected') console.error(`Email ${i} failed:`, r.reason);
      });
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully! A confirmation email has been sent.',
      application,
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/applications/mine ──────────────────────────────────────────
const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate('job', 'title company logo location type remote salary status')
      .sort({ createdAt: -1 });

    res.json({ success: true, total: applications.length, applications });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/applications/job/:jobId ────────────────────────────────────
const getJobApplications = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    if (job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorised.' });
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate('applicant', 'name email headline skills')
      .sort({ createdAt: -1 });

    res.json({ success: true, total: applications.length, applications });
  } catch (err) {
    next(err);
  }
};

// ── PATCH /api/applications/:id/status ─────────────────────────────────
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'reviewed', 'interview', 'rejected', 'hired'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const application = await Application.findById(req.params.id)
      .populate('job', 'title company employer')
      .populate('applicant', 'name email');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    if (application.job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorised.' });
    }

    const oldStatus = application.status;
    application.status = status;
    await application.save();

    // ✅ Supabase Realtime — Status change broadcast (Candidate-க்கு live notify)
    if (oldStatus !== status) {
      await supabase.channel('applications').send({
        type: 'broadcast',
        event: 'application_status_updated',
        payload: {
          _id: application._id,
          jobTitle: application.job.title,
          candidateEmail: application.applicant.email,
          oldStatus,
          newStatus: status,
        },
      });

      sendStatusUpdate({
        to: application.applicant.email,
        candidateName: application.applicant.name,
        jobTitle: application.job.title,
        company: application.job.company,
        newStatus: status,
      }).catch(() => {});
    }

    res.json({ success: true, message: `Application status updated to "${status}".`, application });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/applications/:id ───────────────────────────────────────────
const getApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('job', 'title company logo location type')
      .populate('applicant', 'name email headline');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    const isApplicant = application.applicant._id.toString() === req.user._id.toString();
    const isEmployerOfJob = application.job.employer?.toString() === req.user._id.toString();

    if (!isApplicant && !isEmployerOfJob) {
      return res.status(403).json({ success: false, message: 'Not authorised.' });
    }

    res.json({ success: true, application });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createApplication,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
  getApplication,
};