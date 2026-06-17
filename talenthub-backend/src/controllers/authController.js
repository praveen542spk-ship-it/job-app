// src/controllers/authController.js
const { validationResult } = require('express-validator');
const User = require('../models/User');
const ApprovedManagement = require('../models/ApprovedManagement');
const ActivityLog = require('../models/ActivityLog');
const { sendTokenResponse } = require('../utils/token');
const {
  sendWelcomeEmail,
  sendAdminRegisterAlert
} = require('../utils/email');

// ── POST /api/auth/register ─────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password, role, company } = req.body;

    // Admin approval check
    if (role === 'admin') {
      const isApproved = await checkAdminApproval(email);
      if (!isApproved) {
        return res.status(400).json({ success: false, message: 'This email is not approved for Admin access. Please contact the administrator.' });
      }
    }

    // Employers must provide a company name
    if (role === 'employer' && !company) {
      return res.status(400).json({ success: false, message: 'Company name is required for employers.' });
    }

    const user = await User.create({ name, email, password, role, company });

    // Log registration activity
    await ActivityLog.create({
      activityType: 'register',
      email: user.email,
      name: user.name,
      role: user.role,
      details: `Registered new account as a ${user.role}${role === 'employer' ? ` with company "${company}"` : ''}`
    }).catch(err => console.error("Activity log error:", err));

    // Send welcome email (non-blocking)
    sendWelcomeEmail({ to: email, name, role }).catch(() => {});

    // Send admin registration email alert (non-blocking)
    sendAdminRegisterAlert({ name: user.name, email: user.email, role: user.role, company: user.company }).catch(() => {});

    // Claim any system jobs if this is the target employer email
    await claimSystemJobs(user);

    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};

// ── POST /api/auth/login ────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password, role } = req.body;

    if (role === 'admin') {
      const isApproved = await checkAdminApproval(email);
      if (!isApproved) {
        return res.status(400).json({ success: false, message: 'This email is not approved for Admin access. Please contact the administrator.' });
      }
    }

    // Explicitly select password (it's excluded by default)
    const user = await User.findOne({ email }).select('+password');

    if (user && role && user.role !== role) {
      if (role === 'admin' && await checkAdminApproval(email)) {
        user.role = 'admin';
      } else {
        const roleDisplayName = user.role === 'employer' ? 'Employer' : 'Job Seeker';
        return res.status(400).json({ 
          success: false, 
          message: `This account is registered as a ${roleDisplayName}. Please sign in under the ${roleDisplayName} tab.` 
        });
      }
    }

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account is deactivated.' });
    }

    if (role === 'admin') {
      user.role = 'admin';
    }

    // Log login activity
    await ActivityLog.create({
      activityType: 'login',
      email: user.email,
      name: user.name,
      role: user.role,
      details: `Logged into the platform as ${user.role}`
    }).catch(err => console.error("Activity log error:", err));

    // Removed admin email login alert as requested

    // Remove password before sending back
    user.password = undefined;

    // Claim any system jobs if this is the target employer email
    await claimSystemJobs(user);

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// ── Claim System Recruiter jobs for the user ──────────────────────────────
const claimSystemJobs = async (user) => {
  if (user.role === 'employer' && user.email === 'praveen542spk@gmail.com') {
    try {
      const Job = require('../models/Job');
      const systemEmp = await User.findOne({ email: 'system-employer@talenthub.com' });
      if (systemEmp) {
        const result = await Job.updateMany(
          { employer: systemEmp._id },
          { employer: user._id }
        );
        console.log(`[ClaimSystemJobs] Claimed ${result.modifiedCount} system jobs for ${user.email}`);
      }
    } catch (err) {
      console.error('[ClaimSystemJobs] Error claiming jobs:', err);
    }
  }
};

// ── GET /api/auth/me ────────────────────────────────────────────────────
const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// ── PATCH /api/auth/me ──────────────────────────────────────────────────
const updateMe = async (req, res, next) => {
  try {
    // Fields a user is allowed to update on their own profile
    const allowed = ['name', 'headline', 'bio', 'linkedIn', 'phone', 'resumeUrl', 'resumeOriginalName', 'portfolio', 'skills', 'location',
                     'company', 'companyWebsite', 'companyDescription', 'companySize'];

    const updates = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// ── Admin Helper and Handlers ──────────────────────────────────────────────
const checkAdminApproval = async (email) => {
  const normEmail = email.toLowerCase().trim();
  if (normEmail === 'praveen542spk@gmail.com') return true;
  const approved = await ApprovedManagement.findOne({ email: normEmail });
  return !!approved;
};

const checkAdminEmail = async (req, res, next) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.json({ success: true, approved: false });
    }
    const isApproved = await checkAdminApproval(email);
    res.json({ success: true, approved: isApproved });
  } catch (err) {
    next(err);
  }
};

const getApprovedManagementEmails = async (req, res, next) => {
  try {
    // Only primary admin or admin role can fetch
    if (req.user.email !== 'praveen542spk@gmail.com' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    const list = await ApprovedManagement.find().sort({ createdAt: -1 });
    res.json({ success: true, emails: list });
  } catch (err) {
    next(err);
  }
};

const addApprovedManagementEmail = async (req, res, next) => {
  try {
    if (req.user.email !== 'praveen542spk@gmail.com') {
      return res.status(403).json({ success: false, message: 'Only the primary administrator can authorize new management emails.' });
    }
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }
    const normEmail = email.toLowerCase().trim();
    if (normEmail === 'praveen542spk@gmail.com') {
      return res.status(400).json({ success: false, message: 'Primary admin is already approved.' });
    }

    const existing = await ApprovedManagement.findOne({ email: normEmail });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email is already approved.' });
    }

    const approved = await ApprovedManagement.create({ email: normEmail, approvedBy: req.user._id });
    res.status(201).json({ success: true, message: 'Email approved successfully.', approved });
  } catch (err) {
    next(err);
  }
};

const removeApprovedManagementEmail = async (req, res, next) => {
  try {
    if (req.user.email !== 'praveen542spk@gmail.com') {
      return res.status(403).json({ success: false, message: 'Only the primary administrator can revoke management email authorization.' });
    }
    const { email } = req.params;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }
    const normEmail = email.toLowerCase().trim();
    if (normEmail === 'praveen542spk@gmail.com') {
      return res.status(400).json({ success: false, message: 'Primary admin cannot be removed.' });
    }

    await ApprovedManagement.deleteOne({ email: normEmail });
    res.json({ success: true, message: 'Approved email removed successfully.' });
  } catch (err) {
    next(err);
  }
};

const getActivityLogs = async (req, res, next) => {
  try {
    if (req.user.email !== 'praveen542spk@gmail.com' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    const logs = await ActivityLog.find().sort({ createdAt: -1 }).limit(1000);
    res.json({ success: true, logs });
  } catch (err) {
    next(err);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    if (req.user.email !== 'praveen542spk@gmail.com' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    // Retrieve all users
    const users = await User.find({}).sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    next(err);
  }
};

const toggleUserStatus = async (req, res, next) => {
  try {
    if (req.user.email !== 'praveen542spk@gmail.com' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    
    // Toggle active status
    user.isActive = !user.isActive;
    await user.save();

    // Log this activity
    await ActivityLog.create({
      activityType: 'profile_update',
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
      details: `${user.isActive ? 'Activated' : 'Deactivated'} user account: ${user.name} (${user.email}, Role: ${user.role})`
    }).catch(err => console.error("Activity log error:", err));

    res.json({ success: true, message: `User account has been ${user.isActive ? 'activated' : 'deactivated'} successfully.`, user });
  } catch (err) {
    next(err);
  }
};

module.exports = {
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
};

