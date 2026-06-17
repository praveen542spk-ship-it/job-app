// src/routes/jobs.js
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  getJobs, getJob, createJob, updateJob, deleteJob, getMyJobs, syncExternalJobs,
} = require('../controllers/jobController');
const { protect, restrictTo } = require('../middleware/auth');

// Validation rules for job creation
const jobRules = [
  body('title').trim().notEmpty().withMessage('Job title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').notEmpty().withMessage('Category is required'),
];

// Public routes
router.get('/',     getJobs);  // GET /api/jobs?search=&category=&type=&remote=&page=&sort=
router.get('/employer/mine', protect, restrictTo('employer'), getMyJobs); // must be before /:id
router.post('/sync-external', syncExternalJobs); // POST /api/jobs/sync-external — must be before /:id
router.get('/:id',  getJob);   // GET /api/jobs/:id

// Protected routes (employer only)
router.post(  '/',     protect, restrictTo('employer'), jobRules, createJob);
router.patch( '/:id',  protect, restrictTo('employer'), updateJob);
router.delete('/:id',  protect, restrictTo('employer', 'admin'), deleteJob);

module.exports = router;
