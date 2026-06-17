const BASE = 'http://127.0.0.1:5000/api';

const headers = (withAuth = false) => {
  const h = { 'Content-Type': 'application/json' };
  if (withAuth) {
    const token = localStorage.getItem('token');
    if (token) h['Authorization'] = `Bearer ${token}`;
  }
  return h;
};

export const api = {
  register: (data) =>
    fetch(`${BASE}/auth/register`, { method: 'POST', headers: headers(), body: JSON.stringify(data) }).then(r => r.json()),

  login: (data) =>
    fetch(`${BASE}/auth/login`, { method: 'POST', headers: headers(), body: JSON.stringify(data) }).then(r => r.json()),

  checkAdminEmail: (email) =>
    fetch(`${BASE}/auth/check-admin-email?email=${encodeURIComponent(email)}`).then(r => r.json()),

  getManagementEmails: () =>
    fetch(`${BASE}/auth/management-emails`, { headers: headers(true) }).then(r => r.json()),

  addManagementEmail: (email) =>
    fetch(`${BASE}/auth/management-emails`, { method: 'POST', headers: headers(true), body: JSON.stringify({ email }) }).then(r => r.json()),

  deleteManagementEmail: (email) =>
    fetch(`${BASE}/auth/management-emails/${encodeURIComponent(email)}`, { method: 'DELETE', headers: headers(true) }).then(r => r.json()),

  getMe: () =>
    fetch(`${BASE}/auth/me`, { headers: headers(true) }).then(r => r.json()),

  updateMe: (data) =>
    fetch(`${BASE}/auth/me`, { method: 'PATCH', headers: headers(true), body: JSON.stringify(data) }).then(r => r.json()),

  uploadResumeToProfile: (formData) =>
    fetch(`${BASE}/auth/resume`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: formData,
    }).then(r => r.json()),

  getJobs: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return fetch(`${BASE}/jobs?${q}`).then(r => r.json());
  },

  syncJobs: () =>
    fetch(`${BASE}/jobs/sync-external`, { method: 'POST', headers: headers() }).then(r => r.json()),

  getJob: (id) =>
    fetch(`${BASE}/jobs/${id}`).then(r => r.json()),

  createJob: (data) =>
    fetch(`${BASE}/jobs`, { method: 'POST', headers: headers(true), body: JSON.stringify(data) }).then(r => r.json()),

  updateJob: (id, data) =>
    fetch(`${BASE}/jobs/${id}`, { method: 'PATCH', headers: headers(true), body: JSON.stringify(data) }).then(r => r.json()),

  deleteJob: (id) =>
    fetch(`${BASE}/jobs/${id}`, { method: 'DELETE', headers: headers(true) }).then(r => r.json()),

  getMyJobs: () =>
    fetch(`${BASE}/jobs/employer/mine`, { headers: headers(true) }).then(r => r.json()),

  applyToJob: (formData) =>
    fetch(`${BASE}/applications`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: formData,
    }).then(r => r.json()),

  getMyApplications: () =>
    fetch(`${BASE}/applications/mine`, { headers: headers(true) }).then(r => r.json()),

  getJobApplications: (jobId) =>
    fetch(`${BASE}/applications/job/${jobId}`, { headers: headers(true) }).then(r => r.json()),

  updateAppStatus: (appId, status) =>
    fetch(`${BASE}/applications/${appId}/status`, {
      method: 'PATCH', headers: headers(true), body: JSON.stringify({ status }),
    }).then(r => r.json()),
  
  sendChatMessage: (message) =>
    fetch(`${BASE}/chat`, {
      method: 'POST', headers: headers(), body: JSON.stringify({ message }),
    }).then(r => r.json()),

  getActivityLogs: () =>
    fetch(`${BASE}/auth/activity-logs`, { headers: headers(true) }).then(r => r.json()),

  getAllUsers: () =>
    fetch(`${BASE}/auth/users`, { headers: headers(true) }).then(r => r.json()),

  toggleUserStatus: (id) =>
    fetch(`${BASE}/auth/users/${id}/toggle-status`, { method: 'PATCH', headers: headers(true) }).then(r => r.json()),

  toggleUserVerification: (id) =>
    fetch(`${BASE}/auth/users/${id}/verify`, { method: 'PATCH', headers: headers(true) }).then(r => r.json()),

  toggleUserBan: (id) =>
    fetch(`${BASE}/auth/users/${id}/ban`, { method: 'PATCH', headers: headers(true) }).then(r => r.json()),

  resetUserPassword: (userId, newPassword) =>
    fetch(`${BASE}/auth/users/reset-password`, { method: 'POST', headers: headers(true), body: JSON.stringify({ userId, newPassword }) }).then(r => r.json()),

  getSystemConfig: () =>
    fetch(`${BASE}/system/config`).then(r => r.json()),

  updateSystemConfig: (data) =>
    fetch(`${BASE}/system/config`, { method: 'PATCH', headers: headers(true), body: JSON.stringify(data) }).then(r => r.json()),

  createSupportTicket: (data) =>
    fetch(`${BASE}/system/tickets`, { method: 'POST', headers: headers(), body: JSON.stringify(data) }).then(r => r.json()),

  getSupportTickets: () =>
    fetch(`${BASE}/system/tickets`, { headers: headers(true) }).then(r => r.json()),

  updateSupportTicketStatus: (id, data) =>
    fetch(`${BASE}/system/tickets/${id}`, { method: 'PATCH', headers: headers(true), body: JSON.stringify(data) }).then(r => r.json()),

  flagJobListing: (id) =>
    fetch(`${BASE}/system/jobs/${id}/flag`, { method: 'PATCH', headers: headers(true) }).then(r => r.json()),

  unflagJobListing: (id) =>
    fetch(`${BASE}/system/jobs/${id}/unflag`, { method: 'PATCH', headers: headers(true) }).then(r => r.json()),

  getFlaggedJobListings: () =>
    fetch(`${BASE}/system/jobs/flagged`, { headers: headers(true) }).then(r => r.json()),

  triggerManualSync: () =>
    fetch(`${BASE}/system/sync`, { method: 'POST', headers: headers(true) }).then(r => r.json()),

  purgeActivityLogs: (days) =>
    fetch(`${BASE}/system/purge-logs`, { method: 'POST', headers: headers(true), body: JSON.stringify({ days }) }).then(r => r.json()),

  exportDatabaseBackup: () =>
    fetch(`${BASE}/system/backup`, { headers: headers(true) }).then(r => r.json()),

  restoreDatabaseFromBackup: (dump) =>
    fetch(`${BASE}/system/restore`, { method: 'POST', headers: headers(true), body: JSON.stringify({ dump }) }).then(r => r.json()),

  getDiagnosticsAndAnalytics: () =>
    fetch(`${BASE}/system/diagnostics`, { headers: headers(true) }).then(r => r.json()),

  seedDeveloperMockData: () =>
    fetch(`${BASE}/system/seed`, { method: 'POST', headers: headers(true) }).then(r => r.json()),
};