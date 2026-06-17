// src/utils/email.js
const nodemailer = require('nodemailer');

// ── Create transporter based on config ─────────────────────────────────
const createTransporter = () => {
  // Option B: Resend API (recommended for production)
  if (process.env.RESEND_API_KEY) {
    return nodemailer.createTransport({
      host: 'smtp.resend.com',
      port: 465,
      secure: true,
      auth: {
        user: 'resend',
        pass: process.env.RESEND_API_KEY,
      },
    });
  }

  // Option A: Gmail SMTP
  if (process.env.EMAIL_SERVICE === 'gmail') {
    const pass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, '') : '';
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass, // App password, NOT your Gmail password
      },
    });
  }

  // Fallback: Ethereal (fake SMTP for development — logs to console)
  console.warn('⚠️  No email config found. Using Ethereal (dev-only). Emails will NOT be delivered.');
  return null;
};

// ── Shared send helper ──────────────────────────────────────────────────
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    let transporter = createTransporter();

    // If no real transporter configured, create an Ethereal test account
    if (!transporter) {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: { user: testAccount.user, pass: testAccount.pass },
      });
    }

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"TalentHub" <noreply@talenthub.dev>',
      to,
      subject,
      text: text || subject,
      html,
    });

    if (process.env.NODE_ENV === 'development') {
      console.log(`📧 Email sent to ${to} — ID: ${info.messageId}`);
      // Log Ethereal preview URL if available
      const preview = nodemailer.getTestMessageUrl(info);
      if (preview) console.log(`   Preview: ${preview}`);
    }

    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('Email send error:', err.message);
    // Don't throw — email failure shouldn't break the main request
    return { success: false, error: err.message };
  }
};

// ── Email Templates ─────────────────────────────────────────────────────

const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { margin: 0; padding: 0; background: #f5f0e8; font-family: 'Helvetica Neue', Arial, sans-serif; }
    .wrapper { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: #0d0d0d; padding: 28px 40px; border-bottom: 3px solid #c9a84c; }
    .header h1 { color: #f5f0e8; font-size: 22px; margin: 0; letter-spacing: -0.5px; }
    .header h1 span { color: #c9a84c; }
    .body { padding: 36px 40px; color: #333; line-height: 1.7; }
    .body h2 { color: #0d0d0d; font-size: 20px; margin-top: 0; }
    .highlight-box { background: #faf8f4; border: 1px solid #d8d0c4; border-left: 4px solid #c9a84c; border-radius: 6px; padding: 16px 20px; margin: 20px 0; }
    .highlight-box p { margin: 4px 0; font-size: 14px; color: #555; }
    .highlight-box strong { color: #0d0d0d; }
    .btn { display: inline-block; background: #0d0d0d; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: 600; font-size: 14px; margin: 20px 0; }
    .badge { display: inline-block; background: #dcfce7; color: #14532d; padding: 4px 12px; border-radius: 99px; font-size: 12px; font-weight: 600; }
    .footer { background: #f5f0e8; padding: 20px 40px; text-align: center; font-size: 12px; color: #8a8478; border-top: 1px solid #d8d0c4; }
    .divider { border: none; border-top: 1px solid #d8d0c4; margin: 24px 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>Talent<span>Hub</span></h1>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} TalentHub · You received this because you have an account with us.</p>
    </div>
  </div>
</body>
</html>
`;

// 1. Candidate: application confirmation
const sendApplicationConfirmation = async ({ to, candidateName, jobTitle, company }) => {
  const html = baseTemplate(`
    <h2>Application Submitted! 🎉</h2>
    <p>Hi <strong>${candidateName}</strong>,</p>
    <p>Great news — your application has been successfully received. Here's a summary:</p>
    <div class="highlight-box">
      <p><strong>Role:</strong> ${jobTitle}</p>
      <p><strong>Company:</strong> ${company}</p>
      <p><strong>Status:</strong> <span class="badge">Pending Review</span></p>
    </div>
    <p>The hiring team will review your application and reach out if they'd like to move forward. We'll notify you of any status updates.</p>
    <p>In the meantime, keep exploring other opportunities on TalentHub!</p>
    <hr class="divider">
    <p style="font-size:13px;color:#888;">If you didn't apply for this job, please ignore this email.</p>
  `);

  return sendEmail({
    to,
    subject: `✅ Application received — ${jobTitle} at ${company}`,
    html,
  });
};

// 2. Employer: new application alert
const sendNewApplicationAlert = async ({
  to,
  employerName,
  candidateName,
  candidateEmail,
  candidatePhone,
  candidateLinkedIn,
  coverLetter,
  resumeUrl,
  resumeOriginalName,
  jobTitle,
  applicationId
}) => {
  const resumeLink = resumeUrl ? (resumeUrl.startsWith('http') ? resumeUrl : `http://localhost:5000/${resumeUrl.replace(/\\/g, '/')}`) : null;

  const html = baseTemplate(`
    <h2>New Application Received 📬</h2>
    <p>Hi <strong>${employerName}</strong>,</p>
    <p>Someone just applied to your listing <strong>"${jobTitle}"</strong>. Here are the applicant's details:</p>
    
    <div class="highlight-box">
      <p><strong>Applicant Name:</strong> ${candidateName}</p>
      <p><strong>Email Address:</strong> ${candidateEmail || 'Not specified'}</p>
      <p><strong>Mobile Number:</strong> ${candidatePhone || 'Not specified'}</p>
      <p><strong>LinkedIn Profile:</strong> ${candidateLinkedIn ? `<a href="${candidateLinkedIn}" target="_blank">${candidateLinkedIn}</a>` : 'Not specified'}</p>
      ${resumeLink ? `<p><strong>Resume/CV:</strong> <a href="${resumeLink}" target="_blank" download>${resumeOriginalName || 'Download Resume'} 📥</a></p>` : ''}
    </div>

    ${coverLetter ? `
      <h3>Cover Letter:</h3>
      <div style="background: #faf8f4; border: 1px dashed #d8d0c4; border-radius: 6px; padding: 16px 20px; font-style: italic; color: #555; white-space: pre-line;">
        ${coverLetter}
      </div>
    ` : ''}

    <p style="margin-top: 24px;">Log in to your employer dashboard to view, review, or change status for this application.</p>
    <a href="${process.env.CLIENT_URL}/dashboard" class="btn">Go to Employer Dashboard →</a>
  `);

  return sendEmail({
    to,
    subject: `📬 New application for "${jobTitle}" — ${candidateName}`,
    html,
  });
};

// 3. Candidate: status update
const sendStatusUpdate = async ({ to, candidateName, jobTitle, company, newStatus }) => {
  const statusMessages = {
    reviewed: { emoji: '👀', text: 'Your application is being reviewed', detail: 'The hiring team is currently looking at your profile.' },
    interview: { emoji: '🎯', text: "You've been selected for an interview!", detail: 'Congratulations! The hiring team was impressed and would like to speak with you. They will reach out shortly with scheduling details.' },
    rejected: { emoji: '📋', text: 'Application status update', detail: 'After careful consideration, the team has decided to move forward with other candidates. We encourage you to keep applying — the right opportunity is out there!' },
    hired: { emoji: '🏆', text: "Offer extended — Congratulations!", detail: "You've received a job offer! The employer will be reaching out with the details." },
  };

  const { emoji, text, detail } = statusMessages[newStatus] || { emoji: 'ℹ️', text: 'Status updated', detail: '' };

  const html = baseTemplate(`
    <h2>${emoji} ${text}</h2>
    <p>Hi <strong>${candidateName}</strong>,</p>
    <p>${detail}</p>
    <div class="highlight-box">
      <p><strong>Role:</strong> ${jobTitle}</p>
      <p><strong>Company:</strong> ${company}</p>
      <p><strong>New Status:</strong> <span class="badge">${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}</span></p>
    </div>
    <a href="${process.env.CLIENT_URL}/dashboard" class="btn">View in Dashboard →</a>
  `);

  return sendEmail({
    to,
    subject: `${emoji} Update on your application — ${jobTitle} at ${company}`,
    html,
  });
};

// 4. Welcome email
const sendWelcomeEmail = async ({ to, name, role }) => {
  const isEmployer = role === 'employer';
  const html = baseTemplate(`
    <h2>Welcome to TalentHub! 🚀</h2>
    <p>Hi <strong>${name}</strong>,</p>
    <p>Your account is ready. Here's how to get started:</p>
    ${isEmployer ? `
      <div class="highlight-box">
        <p>✅ Post your first job listing</p>
        <p>✅ Review applications from qualified candidates</p>
        <p>✅ Manage your listings from the Employer Dashboard</p>
      </div>
      <a href="${process.env.CLIENT_URL}" class="btn">Post a Job →</a>
    ` : `
      <div class="highlight-box">
        <p>✅ Browse hundreds of open positions</p>
        <p>✅ Apply with a single click</p>
        <p>✅ Track all your applications in one place</p>
      </div>
      <a href="${process.env.CLIENT_URL}/jobs" class="btn">Browse Jobs →</a>
    `}
  `);

  return sendEmail({
    to,
    subject: '🎉 Welcome to TalentHub — you\'re all set!',
    html,
  });
};

// 5. Admin Login Alert
const sendAdminLoginAlert = async ({ name, email, role }) => {
  const html = baseTemplate(`
    <h2>🔔 Security Alert: Admin Notification</h2>
    <p>This is to inform you that a user has logged into the platform.</p>
    <div class="highlight-box">
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Role:</strong> ${role}</p>
      <p><strong>Time:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} (IST)</p>
    </div>
  `);

  return sendEmail({
    to: 'praveen542spk@gmail.com',
    subject: `🔔 Login Alert: ${name} (${role})`,
    html,
  });
};

// 6. Admin Register Alert
const sendAdminRegisterAlert = async ({ name, email, role, company }) => {
  const isEmployer = role === 'employer';
  const html = baseTemplate(`
    <h2>🆕 New User Signup Notification</h2>
    <p>A new user account has been registered on TalentHub.</p>
    <div class="highlight-box">
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Role:</strong> ${role === 'employer' ? 'Job Provider (Employer)' : role === 'admin' ? 'Admin' : 'Job Seeker (Candidate)'}</p>
      ${isEmployer && company ? `<p><strong>Company:</strong> ${company}</p>` : ''}
      <p><strong>Time:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} (IST)</p>
    </div>
  `);

  return sendEmail({
    to: 'praveen542spk@gmail.com',
    subject: `🆕 Registration Alert: ${name} (${role === 'employer' ? 'Job Provider' : role === 'admin' ? 'Admin' : 'Job Seeker'})`,
    html,
  });
};

// 7. Admin Job Post Alert
const sendAdminJobPostAlert = async ({ company, title, category, location, employerName }) => {
  const html = baseTemplate(`
    <h2>💼 New Job Posting Alert</h2>
    <p>A job provider has posted a new vacancy on the platform.</p>
    <div class="highlight-box">
      <p><strong>Job Title:</strong> ${title}</p>
      <p><strong>Company:</strong> ${company}</p>
      <p><strong>Category:</strong> ${category}</p>
      <p><strong>Location:</strong> ${location}</p>
      <p><strong>Posted By:</strong> ${employerName}</p>
      <p><strong>Time:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} (IST)</p>
    </div>
  `);

  return sendEmail({
    to: 'praveen542spk@gmail.com',
    subject: `💼 Job Post Alert: "${title}" at ${company}`,
    html,
  });
};

module.exports = {
  sendEmail,
  sendApplicationConfirmation,
  sendNewApplicationAlert,
  sendStatusUpdate,
  sendWelcomeEmail,
  sendAdminLoginAlert,
  sendAdminRegisterAlert,
  sendAdminJobPostAlert,
};
