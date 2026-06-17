// src/controllers/systemController.js
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const ApprovedManagement = require('../models/ApprovedManagement');
const ActivityLog = require('../models/ActivityLog');
const SupportTicket = require('../models/SupportTicket');
const SystemConfig = require('../models/SystemConfig');
const syncer = require('../utils/jobSyncer');

// ── GET SYSTEM CONFIG ───────────────────────────────────────────────────
const getSystemConfig = async (req, res, next) => {
  try {
    let config = await SystemConfig.findOne();
    if (!config) {
      config = await SystemConfig.create({});
    }
    res.json({ success: true, config });
  } catch (err) {
    next(err);
  }
};

// ── UPDATE SYSTEM CONFIG ───────────────────────────────────────────────
const updateSystemConfig = async (req, res, next) => {
  try {
    if (req.user.email !== 'praveen542spk@gmail.com' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    let config = await SystemConfig.findOne();
    if (!config) {
      config = await SystemConfig.create({});
    }

    const fields = [
      'bannerActive', 'bannerText', 'bannerColor',
      'maintenanceMode', 'maintenanceMessage', 'maintenanceEndTime',
      'maxApplicationsLimit', 'maxFileSizeLimitMb', 'categories'
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        config[field] = req.body[field];
      }
    });

    await config.save();

    // Log config update
    await ActivityLog.create({
      activityType: 'profile_update',
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
      details: 'Updated global system configurations & settings'
    }).catch(err => console.error(err));

    res.json({ success: true, message: 'Settings updated successfully.', config });
  } catch (err) {
    next(err);
  }
};

// ── CREATE SUPPORT TICKET ──────────────────────────────────────────────
const createSupportTicket = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
    }

    const ticket = await SupportTicket.create({ name, email, subject, message });

    // Log ticket submission
    await ActivityLog.create({
      activityType: 'profile_update',
      email: email,
      name: name,
      role: 'candidate',
      details: `Submitted support/feedback ticket: "${subject}"`
    }).catch(err => console.error(err));

    res.status(201).json({ success: true, message: 'Support ticket submitted successfully.', ticket });
  } catch (err) {
    next(err);
  }
};

// ── GET ALL SUPPORT TICKETS ───────────────────────────────────────────
const getSupportTickets = async (req, res, next) => {
  try {
    if (req.user.email !== 'praveen542spk@gmail.com' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    const tickets = await SupportTicket.find().sort({ createdAt: -1 });
    res.json({ success: true, tickets });
  } catch (err) {
    next(err);
  }
};

// ── UPDATE SUPPORT TICKET STATUS ──────────────────────────────────────
const updateSupportTicketStatus = async (req, res, next) => {
  try {
    if (req.user.email !== 'praveen542spk@gmail.com' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    const { id } = req.params;
    const { status, replyMessage } = req.body;

    const ticket = await SupportTicket.findById(id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found.' });
    }

    if (status) ticket.status = status;
    if (replyMessage !== undefined) ticket.replyMessage = replyMessage;

    await ticket.save();

    // Log resolution
    await ActivityLog.create({
      activityType: 'profile_update',
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
      details: `Updated support ticket: "${ticket.subject}" to status "${ticket.status}"`
    }).catch(err => console.error(err));

    res.json({ success: true, message: 'Ticket status updated.', ticket });
  } catch (err) {
    next(err);
  }
};

// ── FLAG A JOB ────────────────────────────────────────────────────────
const flagJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job listing not found.' });
    }

    job.flagCount = (job.flagCount || 0) + 1;
    await job.save();

    // Log flagging
    await ActivityLog.create({
      activityType: 'profile_update',
      email: req.user?.email || 'anonymous@talenthub.com',
      name: req.user?.name || 'Anonymous User',
      role: req.user?.role || 'candidate',
      details: `Flagged job listing: "${job.title}" at ${job.company}`
    }).catch(err => console.error(err));

    res.json({ success: true, message: 'Job listing flagged successfully.', job });
  } catch (err) {
    next(err);
  }
};

// ── UNFLAG A JOB ──────────────────────────────────────────────────────
const unflagJob = async (req, res, next) => {
  try {
    if (req.user.email !== 'praveen542spk@gmail.com' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    const { id } = req.params;
    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job listing not found.' });
    }

    job.flagCount = 0;
    await job.save();

    res.json({ success: true, message: 'Job listing flags cleared.', job });
  } catch (err) {
    next(err);
  }
};

// ── GET FLAGGED JOBS ──────────────────────────────────────────────────
const getFlaggedJobs = async (req, res, next) => {
  try {
    if (req.user.email !== 'praveen542spk@gmail.com' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    const jobs = await Job.find({ flagCount: { $gt: 0 } }).sort({ flagCount: -1 });
    res.json({ success: true, jobs });
  } catch (err) {
    next(err);
  }
};

// ── TRIGGER REMOTIVE SYNC ──────────────────────────────────────────────
const triggerExternalSync = async (req, res, next) => {
  try {
    if (req.user.email !== 'praveen542spk@gmail.com' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const results = await syncer.syncExternalJobs();

    // Log sync
    await ActivityLog.create({
      activityType: 'job_post',
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
      details: `Triggered manual syncer. Added ${results.addedCount} new jobs.`
    }).catch(err => console.error(err));

    res.json({ success: true, message: `Sync completed successfully. Added ${results.addedCount} listings.`, results });
  } catch (err) {
    next(err);
  }
};

// ── PURGE/ARCHIVE LOGS ─────────────────────────────────────────────────
const purgeLogs = async (req, res, next) => {
  try {
    if (req.user.email !== 'praveen542spk@gmail.com' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    const { days } = req.body;
    let query = {};
    let desc = "Purged all activity logs";

    if (days && parseInt(days) > 0) {
      const cutOff = new Date();
      cutOff.setDate(cutOff.getDate() - parseInt(days));
      query = { createdAt: { $lt: cutOff } };
      desc = `Archived/purged activity logs older than ${days} days`;
    }

    const result = await ActivityLog.deleteMany(query);

    // Create fresh log for audit
    await ActivityLog.create({
      activityType: 'profile_update',
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
      details: `${desc}. Removed ${result.deletedCount} items.`
    }).catch(err => console.error(err));

    res.json({ success: true, message: `Purge complete. Removed ${result.deletedCount} old records.` });
  } catch (err) {
    next(err);
  }
};

// ── TOGGLE EMPLOYER VERIFICATION BADGE ──────────────────────────────────
const toggleUserVerification = async (req, res, next) => {
  try {
    if (req.user.email !== 'praveen542spk@gmail.com' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.isVerified = !user.isVerified;
    await user.save();

    // Log verification
    await ActivityLog.create({
      activityType: 'profile_update',
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
      details: `${user.isVerified ? 'Verified' : 'Revoked verification for'} employer account: ${user.name} (${user.email})`
    }).catch(err => console.error(err));

    res.json({ success: true, message: `Employer verification status updated.`, user });
  } catch (err) {
    next(err);
  }
};

// ── TOGGLE USER BAN STATUS ─────────────────────────────────────────────
const toggleUserBan = async (req, res, next) => {
  try {
    if (req.user.email !== 'praveen542spk@gmail.com' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.isBanned = !user.isBanned;
    if (user.isBanned) {
      user.isActive = false; // Banning deactivates account too
    }
    await user.save();

    // Log ban
    await ActivityLog.create({
      activityType: 'profile_update',
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
      details: `${user.isBanned ? 'Banned' : 'Unbanned'} user account: ${user.name} (${user.email})`
    }).catch(err => console.error(err));

    res.json({ success: true, message: `User ban status updated.`, user });
  } catch (err) {
    next(err);
  }
};

// ── PASSWORD RESET PORTAL ──────────────────────────────────────────────
const resetUserPassword = async (req, res, next) => {
  try {
    if (req.user.email !== 'praveen542spk@gmail.com' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    const { userId, newPassword } = req.body;
    if (!userId || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Valid User ID and password (min 6 chars) required.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.password = newPassword;
    await user.save();

    // Log password reset
    await ActivityLog.create({
      activityType: 'profile_update',
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
      details: `Administratively reset password for user: ${user.name} (${user.email})`
    }).catch(err => console.error(err));

    res.json({ success: true, message: `Password for ${user.name} has been reset successfully.` });
  } catch (err) {
    next(err);
  }
};

// ── BACKUP DATABASE ────────────────────────────────────────────────────
const backupDatabase = async (req, res, next) => {
  try {
    if (req.user.email !== 'praveen542spk@gmail.com' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const users = await User.find();
    const jobs = await Job.find();
    const applications = await Application.find();
    const approvedmanagements = await ApprovedManagement.find();
    const activitylogs = await ActivityLog.find();
    const supporttickets = await SupportTicket.find();
    const systemconfigs = await SystemConfig.find();

    const dump = {
      users,
      jobs,
      applications,
      approvedmanagements,
      activitylogs,
      supporttickets,
      systemconfigs,
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      exportedBy: req.user.email
    };

    res.json({ success: true, dump });
  } catch (err) {
    next(err);
  }
};

// ── RESTORE DATABASE ───────────────────────────────────────────────────
const restoreDatabase = async (req, res, next) => {
  try {
    if (req.user.email !== 'praveen542spk@gmail.com' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const { dump } = req.body;
    if (!dump || !dump.version) {
      return res.status(400).json({ success: false, message: 'Invalid database dump format.' });
    }

    const currentAdmin = await User.findById(req.user._id);
    const currentApprovedEmail = await ApprovedManagement.findOne({ email: req.user.email });

    // Drop collections
    await User.deleteMany({});
    await Job.deleteMany({});
    await Application.deleteMany({});
    await ApprovedManagement.deleteMany({});
    await ActivityLog.deleteMany({});
    await SupportTicket.deleteMany({});
    await SystemConfig.deleteMany({});

    // Import collections
    if (dump.users && dump.users.length > 0) await User.insertMany(dump.users);
    if (dump.jobs && dump.jobs.length > 0) await Job.insertMany(dump.jobs);
    if (dump.applications && dump.applications.length > 0) await Application.insertMany(dump.applications);
    if (dump.approvedmanagements && dump.approvedmanagements.length > 0) await ApprovedManagement.insertMany(dump.approvedmanagements);
    if (dump.activitylogs && dump.activitylogs.length > 0) await ActivityLog.insertMany(dump.activitylogs);
    if (dump.supporttickets && dump.supporttickets.length > 0) await SupportTicket.insertMany(dump.supporttickets);
    if (dump.systemconfigs && dump.systemconfigs.length > 0) await SystemConfig.insertMany(dump.systemconfigs);

    // Safety: ensure current admin account exists in restoring database to prevent lockout
    if (currentAdmin) {
      await User.deleteOne({ _id: currentAdmin._id });
      await User.create(currentAdmin.toObject());
    }
    if (currentApprovedEmail) {
      await ApprovedManagement.deleteOne({ email: currentApprovedEmail.email });
      await ApprovedManagement.create(currentApprovedEmail.toObject());
    }

    // Log restoration
    await ActivityLog.create({
      activityType: 'profile_update',
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
      details: 'Restored database dump from backup payload file.'
    }).catch(err => console.error(err));

    res.json({ success: true, message: 'Database successfully restored from backup.' });
  } catch (err) {
    next(err);
  }
};

// ── GET DIAGNOSTICS & ANALYTICS ────────────────────────────────────────
const getDiagnostics = async (req, res, next) => {
  try {
    if (req.user.email !== 'praveen542spk@gmail.com' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    // 1. Growth Stats (Daily signups last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const growth = await User.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        total: { $sum: 1 },
        candidates: { $sum: { $cond: [{ $eq: ["$role", "candidate"] }, 1, 0] } },
        employers: { $sum: { $cond: [{ $eq: ["$role", "employer"] }, 1, 0] } }
      }},
      { $sort: { _id: 1 } }
    ]);

    // 2. Application Funnel Counts
    const funnel = await Application.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    // 3. AI Chatbot queries analytics
    const totalChats = await ActivityLog.countDocuments({ activityType: 'ai_chat' });
    const recentChats = await ActivityLog.find({ activityType: 'ai_chat' }).sort({ createdAt: -1 }).limit(100);

    const wordCounts = {};
    recentChats.forEach((chat) => {
      const text = chat.details.replace('Asked AI Career Assistant: "', '').replace(/"$/, '');
      text.split(/\s+/).forEach((w) => {
        const clean = w.toLowerCase().replace(/[^a-z]/g, '');
        if (clean.length > 3 && clean !== 'asked' && clean !== 'career' && clean !== 'assistant') {
          wordCounts[clean] = (wordCounts[clean] || 0) + 1;
        }
      });
    });

    const popularTerms = Object.entries(wordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(e => ({ term: e[0], count: e[1] }));

    // 4. Leaderboard: Employers by Listings
    const leaderboard = await Job.aggregate([
      { $group: { _id: "$company", count: { $sum: 1 }, applications: { $sum: "$applicantCount" } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      growth,
      funnel,
      chatbotStats: {
        totalChats,
        popularTerms,
        recentChats: recentChats.slice(0, 10)
      },
      leaderboard
    });
  } catch (err) {
    next(err);
  }
};

// ── DEVELOPER DEMO DATA SEEDER ──────────────────────────────────────────
const seedMockData = async (req, res, next) => {
  try {
    if (req.user.email !== 'praveen542spk@gmail.com' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    // A. Seed mock candidate users
    const mockCandidates = [
      { name: 'Karthik Raja', email: 'karthik-candidate@example.com', password: 'password123', role: 'candidate', headline: 'Lead Flutter Developer', location: 'Coimbatore, TN', bio: 'Passionate about mobile apps.' },
      { name: 'Divya Bharathi', email: 'divya-candidate@example.com', password: 'password123', role: 'candidate', headline: 'UI/UX Designer', location: 'Chennai, TN', bio: 'Creating beautiful interface designs.' },
      { name: 'Rahul Sharma', email: 'rahul-candidate@example.com', password: 'password123', role: 'candidate', headline: 'MERN Stack Engineer', location: 'Bengaluru, KA', bio: 'Full stack web specialist.' }
    ];

    const seededCandidates = [];
    for (const c of mockCandidates) {
      let u = await User.findOne({ email: c.email });
      if (!u) {
        u = await User.create(c);
      }
      seededCandidates.push(u);
    }

    // B. Seed mock employer users
    const mockEmployers = [
      { name: 'Praveen HR (Tech)', email: 'praveen-employer@example.com', password: 'password123', role: 'employer', company: 'Zoho Corporation', location: 'Chennai, TN' },
      { name: 'Anjali Sharma', email: 'anjali-employer@example.com', password: 'password123', role: 'employer', company: 'Razorpay', location: 'Bengaluru, KA' }
    ];

    const seededEmployers = [];
    for (const emp of mockEmployers) {
      let u = await User.findOne({ email: emp.email });
      if (!u) {
        u = await User.create(emp);
      }
      seededEmployers.push(u);
    }

    // C. Seed mock jobs
    const mockJobs = [
      { title: 'Senior Flutter Developer', company: 'Zoho Corporation', employer: seededEmployers[0]._id, description: 'Design and build cross-platform mobile apps for scale.', requirements: ['3+ years Flutter', 'Dart', 'State management'], category: 'Engineering', location: 'Chennai, TN', remote: 'Fully Remote', type: 'Full-time', salary: '₹12L - ₹18L', status: 'active' },
      { title: 'Graphic & UI Designer', company: 'Zoho Corporation', employer: seededEmployers[0]._id, description: 'Create stunning layouts and graphics for our global SaaS tools.', requirements: ['Figma', 'Photoshop', 'Typography'], category: 'Design', location: 'Chennai, TN', remote: 'Hybrid', type: 'Full-time', salary: '₹8L - ₹10L', status: 'active' },
      { title: 'MERN Backend Specialist', company: 'Razorpay', employer: seededEmployers[1]._id, description: 'Scale payment gateway APIs with high availability.', requirements: ['Node.js', 'Express', 'MongoDB', 'Redis'], category: 'Engineering', location: 'Bengaluru, KA', remote: 'Remote OK', type: 'Contract', salary: '₹15L - ₹22L', status: 'active' }
    ];

    const seededJobs = [];
    for (const j of mockJobs) {
      let exist = await Job.findOne({ title: j.title, company: j.company });
      if (!exist) {
        exist = await Job.create(j);
      }
      seededJobs.push(exist);
    }

    // D. Seed mock applications
    const mockApps = [
      { job: seededJobs[0]._id, applicant: seededCandidates[0]._id, name: seededCandidates[0].name, email: seededCandidates[0].email, phone: '+919999988888', linkedIn: 'linkedin.com/in/karthik', resumeUrl: 'uploads/resumes/mock.pdf', resumeOriginalName: 'Karthik_Resume.pdf', status: 'pending' },
      { job: seededJobs[1]._id, applicant: seededCandidates[1]._id, name: seededCandidates[1].name, email: seededCandidates[1].email, phone: '+919999977777', linkedIn: 'linkedin.com/in/divya', resumeUrl: 'uploads/resumes/mock.pdf', resumeOriginalName: 'Divya_UX.pdf', status: 'interview' },
      { job: seededJobs[2]._id, applicant: seededCandidates[2]._id, name: seededCandidates[2].name, email: seededCandidates[2].email, phone: '+919999966666', linkedIn: 'linkedin.com/in/rahul', resumeUrl: 'uploads/resumes/mock.pdf', resumeOriginalName: 'Rahul_MERN.pdf', status: 'reviewed' }
    ];

    for (const app of mockApps) {
      const exist = await Application.findOne({ job: app.job, email: app.email });
      if (!exist) {
        await Application.create(app);
        await Job.findByIdAndUpdate(app.job, { $inc: { applicantCount: 1 } });
      }
    }

    // E. Seed activity logs
    await ActivityLog.create({ activityType: 'register', email: 'karthik-candidate@example.com', name: 'Karthik Raja', role: 'candidate', details: 'Registered mock Candidate' }).catch(() => {});
    await ActivityLog.create({ activityType: 'register', email: 'praveen-employer@example.com', name: 'Praveen HR (Tech)', role: 'employer', details: 'Registered mock Employer' }).catch(() => {});
    await ActivityLog.create({ activityType: 'job_post', email: 'praveen-employer@example.com', name: 'Praveen HR (Tech)', role: 'employer', details: 'Posted mock Job: Senior Flutter Developer' }).catch(() => {});
    await ActivityLog.create({ activityType: 'job_apply', email: 'karthik-candidate@example.com', name: 'Karthik Raja', role: 'candidate', details: 'Applied to Zoho: Senior Flutter Developer' }).catch(() => {});

    res.json({ success: true, message: 'Demo seeding completed. Mock users, jobs, applications, and logs have been created successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSystemConfig,
  updateSystemConfig,
  createSupportTicket,
  getSupportTickets,
  updateSupportTicketStatus,
  flagJob,
  unflagJob,
  getFlaggedJobs,
  triggerExternalSync,
  purgeLogs,
  toggleUserVerification,
  toggleUserBan,
  resetUserPassword,
  backupDatabase,
  restoreDatabase,
  getDiagnostics,
  seedMockData
};
