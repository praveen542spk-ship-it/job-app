// src/routes/auth.js
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  register,
  login,
  getMe,
  updateMe,
  checkAdminEmail,
  getApprovedManagementEmails,
  addApprovedManagementEmail,
  removeApprovedManagementEmail,
  getActivityLogs,
  getAllUsers,
  toggleUserStatus
} = require('../controllers/authController');
const {
  toggleUserVerification,
  toggleUserBan,
  resetUserPassword
} = require('../controllers/systemController');
const { protect } = require('../middleware/auth');

// Validation rules
const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['candidate', 'employer', 'admin']).withMessage('Role must be candidate, employer or admin'),
];

const loginRules = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

// Routes
router.post('/register', registerRules, register);
router.post('/login',    loginRules,    login);
router.get('/check-admin-email', checkAdminEmail);
router.get('/management-emails', protect, getApprovedManagementEmails);
router.post('/management-emails', protect, addApprovedManagementEmail);
router.delete('/management-emails/:email', protect, removeApprovedManagementEmail);
router.get('/activity-logs', protect, getActivityLogs);
router.get('/users', protect, getAllUsers);
router.patch('/users/:id/toggle-status', protect, toggleUserStatus);
router.patch('/users/:id/verify', protect, toggleUserVerification);
router.patch('/users/:id/ban', protect, toggleUserBan);
router.post('/users/reset-password', protect, resetUserPassword);

const upload = require('../middleware/upload');
const User = require('../models/User');

router.get('/me',        protect,       getMe);
router.patch('/me',      protect,       updateMe);
router.patch('/resume',  protect,  upload.single('resume'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a resume file.' });
    }
    const user = await User.findByIdAndUpdate(req.user._id, {
      resumeUrl: req.file.path,
      resumeOriginalName: req.file.originalname
    }, { new: true });
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
});

const ApprovedManagement = require('../models/ApprovedManagement');

router.post('/test-setup', async (req, res) => {
  try {
    const testEmail = 'admin-test-auth@example.com';
    await User.deleteOne({ email: testEmail });
    await ApprovedManagement.deleteOne({ email: testEmail });
    await ApprovedManagement.create({ email: testEmail });
    res.json({ success: true, message: 'Test environment setup successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/test-cleanup', async (req, res) => {
  try {
    const testEmail = 'admin-test-auth@example.com';
    await User.deleteOne({ email: testEmail });
    await ApprovedManagement.deleteOne({ email: testEmail });
    
    const ActivityLog = require('../models/ActivityLog');
    await User.deleteMany({ email: { $regex: /^candidate-audit-/ } });
    await ActivityLog.deleteMany({ email: { $regex: /^candidate-audit-/ } });
    await ActivityLog.deleteMany({ email: testEmail });

    res.json({ success: true, message: 'Test environment cleaned up.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
