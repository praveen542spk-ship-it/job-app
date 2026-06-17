# TalentHub — Backend API

Node.js + Express + MongoDB REST API with JWT authentication and email notifications.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 18+ |
| Framework | Express 4 |
| Database | MongoDB + Mongoose |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Email | Nodemailer (Gmail SMTP or Resend) |
| File Uploads | Multer |
| Validation | express-validator |

---

## Project Structure

```
talenthub-backend/
├── src/
│   ├── server.js                  ← Entry point
│   ├── config/
│   │   └── db.js                  ← MongoDB connection
│   ├── models/
│   │   ├── User.js                ← User schema
│   │   ├── Job.js                 ← Job schema
│   │   └── Application.js         ← Application schema
│   ├── controllers/
│   │   ├── authController.js      ← Register, login, profile
│   │   ├── jobController.js       ← Job CRUD
│   │   └── applicationController.js ← Apply, track, update status
│   ├── routes/
│   │   ├── auth.js
│   │   ├── jobs.js
│   │   └── applications.js
│   ├── middleware/
│   │   ├── auth.js                ← JWT protect + restrictTo
│   │   ├── upload.js              ← Multer resume upload
│   │   └── errorHandler.js        ← Global error handler
│   └── utils/
│       ├── email.js               ← Nodemailer templates
│       └── token.js               ← JWT helper
├── uploads/                       ← Resume files (auto-created)
├── .env.example                   ← Copy to .env
├── .gitignore
└── package.json
```

---

## Step-by-Step Setup

### Step 1 — Clone / Create the Backend Folder

Open a **new** VS Code terminal (separate from your frontend). Then:

```bash
# If you received this as a zip, unzip it
# If starting fresh, the folder is already named talenthub-backend

cd talenthub-backend
```

---

### Step 2 — Install Dependencies

```bash
npm install
```

---

### Step 3 — Set Up MongoDB

You need a running MongoDB instance. Choose one:

**Option A — Free MongoDB Atlas (recommended, no install needed)**
1. Go to https://cloud.mongodb.com and create a free account
2. Create a free **M0** cluster
3. Click **Connect** → **Connect your application**
4. Copy the connection string — it looks like:
   ```
   mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/talenthub
   ```

**Option B — Local MongoDB**
1. Install MongoDB Community: https://www.mongodb.com/try/download/community
2. Start the service: `mongod --dbpath /data/db`
3. Your URI will be: `mongodb://localhost:27017/talenthub`

---

### Step 4 — Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env
```

Open `.env` in VS Code and fill in your values:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/talenthub
JWT_SECRET=paste_a_long_random_string_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

**Generate a secure JWT secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Copy the output and paste it as your `JWT_SECRET`.

---

### Step 5 — Configure Email (Pick One)

**Option A — Gmail (easiest for testing)**

1. Go to your Google Account → Security → **2-Step Verification** (must be ON)
2. Search for **App passwords** → Create one for "Mail"
3. Copy the 16-character password
4. In `.env`:
   ```env
   EMAIL_SERVICE=gmail
   EMAIL_USER=yourgmail@gmail.com
   EMAIL_PASS=abcd efgh ijkl mnop
   EMAIL_FROM="TalentHub <yourgmail@gmail.com>"
   ```

**Option B — Resend (recommended for production, 3000 free emails/month)**

1. Sign up at https://resend.com
2. Create an API key
3. In `.env`:
   ```env
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
   EMAIL_FROM="TalentHub <onboarding@resend.dev>"
   ```

> **Note:** If you skip email config entirely, the server still works — emails are just logged to the terminal using Ethereal (a fake SMTP for development).

---

### Step 6 — Start the Server

```bash
npm run dev
```

You should see:
```
✅ MongoDB connected: cluster0.xxxxx.mongodb.net

  ╔════════════════════════════════════════╗
  ║   🚀 TalentHub API is running          ║
  ║   Port  : 5000                         ║
  ╚════════════════════════════════════════╝
```

Test it by opening: http://localhost:5000/api/health

---

### Step 7 — Connect the Frontend

In your frontend (`talenthub/src`), create a file `src/api.js`:

```javascript
// src/api.js
const BASE = 'http://localhost:5000/api';

const headers = (withAuth = false) => {
  const h = { 'Content-Type': 'application/json' };
  if (withAuth) {
    const token = localStorage.getItem('token');
    if (token) h['Authorization'] = `Bearer ${token}`;
  }
  return h;
};

export const api = {
  // Auth
  register: (data) =>
    fetch(`${BASE}/auth/register`, { method: 'POST', headers: headers(), body: JSON.stringify(data) }).then(r => r.json()),

  login: (data) =>
    fetch(`${BASE}/auth/login`, { method: 'POST', headers: headers(), body: JSON.stringify(data) }).then(r => r.json()),

  getMe: () =>
    fetch(`${BASE}/auth/me`, { headers: headers(true) }).then(r => r.json()),

  // Jobs
  getJobs: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return fetch(`${BASE}/jobs?${q}`).then(r => r.json());
  },

  getJob: (id) =>
    fetch(`${BASE}/jobs/${id}`).then(r => r.json()),

  createJob: (data) =>
    fetch(`${BASE}/jobs`, { method: 'POST', headers: headers(true), body: JSON.stringify(data) }).then(r => r.json()),

  updateJob: (id, data) =>
    fetch(`${BASE}/jobs/${id}`, { method: 'PATCH', headers: headers(true), body: JSON.stringify(data) }).then(r => r.json()),

  getMyJobs: () =>
    fetch(`${BASE}/jobs/employer/mine`, { headers: headers(true) }).then(r => r.json()),

  // Applications (uses FormData for file upload)
  applyToJob: (formData) =>
    fetch(`${BASE}/applications`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: formData, // FormData handles Content-Type automatically
    }).then(r => r.json()),

  getMyApplications: () =>
    fetch(`${BASE}/applications/mine`, { headers: headers(true) }).then(r => r.json()),

  getJobApplications: (jobId) =>
    fetch(`${BASE}/applications/job/${jobId}`, { headers: headers(true) }).then(r => r.json()),

  updateAppStatus: (appId, status) =>
    fetch(`${BASE}/applications/${appId}/status`, {
      method: 'PATCH', headers: headers(true), body: JSON.stringify({ status }),
    }).then(r => r.json()),
};
```

Then in `App.jsx`, replace the mock `onLogin` handler with real API calls:

```javascript
// Login example
const handleLogin = async (formData) => {
  const res = await api.login(formData);
  if (res.success) {
    localStorage.setItem('token', res.token);
    setUser(res.user);
  } else {
    toast(res.message, 'error');
  }
};

// Load jobs from API instead of INITIAL_JOBS
useEffect(() => {
  api.getJobs().then(res => {
    if (res.success) setJobs(res.jobs);
  });
}, []);
```

---

## API Reference

All routes prefixed with `/api`. Protected routes require `Authorization: Bearer <token>` header.

### Authentication

| Method | Endpoint | Auth | Body | Description |
|---|---|---|---|---|
| POST | `/auth/register` | — | `{ name, email, password, role, company? }` | Register new user |
| POST | `/auth/login` | — | `{ email, password }` | Login, returns JWT |
| GET | `/auth/me` | ✅ | — | Get current user profile |
| PATCH | `/auth/me` | ✅ | `{ name, bio, headline, ... }` | Update profile |

**Register body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "mypassword",
  "role": "candidate"
}
```
For employers, add `"company": "Acme Corp"`.

**Login response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "_id": "...", "name": "Jane", "role": "candidate", ... }
}
```

---

### Jobs

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/jobs` | — | Any | List all active jobs |
| GET | `/jobs/:id` | — | Any | Get single job detail |
| GET | `/jobs/employer/mine` | ✅ | Employer | Get my posted jobs |
| POST | `/jobs` | ✅ | Employer | Create a job listing |
| PATCH | `/jobs/:id` | ✅ | Employer | Update or close a listing |
| DELETE | `/jobs/:id` | ✅ | Employer | Delete a listing |

**GET /jobs — Query Parameters:**
```
?search=react          Full-text search (title, description, skills)
?category=Engineering  Filter by category
?type=Full-time        Filter by job type
?remote=Remote+OK      Filter by remote policy
?page=1                Page number (default: 1)
?limit=12              Results per page (default: 12)
?sort=newest           Sort: newest | oldest | featured
```

**POST /jobs body:**
```json
{
  "title": "Senior Frontend Engineer",
  "description": "Join our team...",
  "category": "Engineering",
  "type": "Full-time",
  "remote": "Remote OK",
  "location": "San Francisco, CA",
  "salary": "$150k – $200k",
  "requirements": ["5+ years React", "TypeScript"],
  "benefits": ["Health insurance", "Unlimited PTO"],
  "skills": ["React", "TypeScript"]
}
```

**PATCH /jobs/:id — close a listing:**
```json
{ "status": "closed" }
```

---

### Applications

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| POST | `/applications` | ✅ | Candidate | Submit application (multipart/form-data) |
| GET | `/applications/mine` | ✅ | Candidate | My submitted applications |
| GET | `/applications/job/:jobId` | ✅ | Employer | All apps for a job |
| PATCH | `/applications/:id/status` | ✅ | Employer | Update application status |
| GET | `/applications/:id` | ✅ | Both | View single application |

**POST /applications — FormData fields:**
```
jobId          (required) Job's MongoDB _id
name           (required) Applicant's full name
email          (required) Applicant's email
phone          (optional)
linkedIn       (optional)
coverLetter    (optional)
resume         (optional) File field — PDF/DOC/DOCX up to 10MB
```

**PATCH /applications/:id/status body:**
```json
{ "status": "interview" }
```
Valid statuses: `pending` → `reviewed` → `interview` → `hired` or `rejected`

---

## Email Notifications

Emails are sent automatically on these events:

| Trigger | Recipients | Template |
|---|---|---|
| New user registers | New user | Welcome email with getting-started guide |
| Application submitted | Candidate + Employer | Confirmation with job details / New applicant alert |
| Status updated | Candidate | Status change notification with current stage |

All emails are non-blocking — if email fails, the API response still succeeds.

---

## Running Both Servers

Open **two separate terminals** in VS Code:

**Terminal 1 — Backend:**
```bash
cd talenthub-backend
npm run dev
# Runs on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd talenthub
npm run dev
# Runs on http://localhost:5173
```

---

## Troubleshooting

| Problem | Solution |
|---|---|
| `MongoServerError: Authentication failed` | Check MONGO_URI username/password |
| `ECONNREFUSED` on MongoDB | Start MongoDB service or check Atlas IP whitelist |
| Emails not sending (Gmail) | Enable 2FA and use an App Password, not your real password |
| `CORS error` in browser | Make sure `CLIENT_URL` in `.env` matches your frontend URL |
| `Cannot POST /api/applications` | Use `multipart/form-data` not `application/json` when uploading files |
| Port 5000 already in use | Change `PORT=5001` in `.env` |
| JWT token invalid | Token may be expired — log out and log in again |

---

## Deployment Checklist

Before going live:

- [ ] Set `NODE_ENV=production` in your hosting environment
- [ ] Use a strong, unique `JWT_SECRET` (64+ random characters)
- [ ] Set `CLIENT_URL` to your real frontend domain
- [ ] Use MongoDB Atlas with IP allowlist configured
- [ ] Configure a real email provider (Resend recommended)
- [ ] Add rate limiting: `npm install express-rate-limit`
- [ ] Add a helmet for security headers: `npm install helmet`
- [ ] Store `uploads/` on cloud storage (AWS S3 or Cloudinary) not local disk

---

*TalentHub Backend — Node.js + Express + MongoDB*
