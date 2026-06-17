// src/routes/system.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
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
  backupDatabase,
  restoreDatabase,
  getDiagnostics,
  seedMockData
} = require('../controllers/systemController');

// Public endpoints (no authentication needed)
router.get('/config', getSystemConfig);
router.post('/tickets', createSupportTicket);

// Protected endpoints (requires logged-in user)
router.patch('/jobs/:id/flag', protect, flagJob);

// Admin-restricted endpoints (requires logged-in admin user)
router.patch('/config', protect, updateSystemConfig);
router.get('/tickets', protect, getSupportTickets);
router.patch('/tickets/:id', protect, updateSupportTicketStatus);
router.patch('/jobs/:id/unflag', protect, unflagJob);
router.get('/jobs/flagged', protect, getFlaggedJobs);
router.post('/sync', protect, triggerExternalSync);
router.post('/purge-logs', protect, purgeLogs);
router.get('/backup', protect, backupDatabase);
router.post('/restore', protect, restoreDatabase);
router.get('/diagnostics', protect, getDiagnostics);
router.post('/seed', protect, seedMockData);

module.exports = router;
