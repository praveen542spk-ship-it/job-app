// src/routes/applications.js
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  createApplication,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
  getApplication,
} = require('../controllers/applicationController');
const { protect, restrictTo } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Validation rules
const applicationRules = [
  body('jobId').notEmpty().withMessage('Job ID is required'),
];

// All application routes require authentication
router.use(protect);

// Candidate routes
router.post('/',
  restrictTo('candidate'),
  upload.single('resume'),   // handles multipart/form-data with a "resume" file field
  applicationRules,
  createApplication
);

router.get('/mine', restrictTo('candidate'), getMyApplications);

// Employer routes
router.get('/job/:jobId', restrictTo('employer'), getJobApplications);

router.patch('/:id/status',
  restrictTo('employer'),
  body('status').notEmpty().withMessage('Status is required'),
  updateApplicationStatus
);

// Shared (candidate sees own, employer sees for their jobs)
router.get('/:id', getApplication);

module.exports = router;
