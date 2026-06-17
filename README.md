# TalentHub — Premium MERN Job & Internship Portal 🚀

**TalentHub** is a beautiful, responsive, and full-featured MERN Stack web application designed to connect Job Seekers (Candidates) and Employers. Built with a premium Obsidian Midnight glassmorphic UI, it features real-time tracking, AI-powered tools, email alerts, and a curated database of premium Indian and global jobs.

> [!IMPORTANT]
> **Demo & Simulation Disclaimer:** 
> While the job postings and details are modeled after actual real-world positions, the **"Apply on TalentHub"** button is a simulation. It does **not** send applications to the physical companies' HR departments. Instead, all recruiter notification emails are safely routed to the owner's configured test email (e.g., your personal Gmail inbox) for seamless demonstration and testing purposes. 
> To apply in the real world, use the **"Apply on Company Site"** button which redirects to the official corporate careers portal!

---

## 🌟 Key Features & Deep Technical Highlights

### 1. 🇮🇳 Localized Tech Giants, Startups & Internships
- **Active Real-World Roles:** Curated active listings across **83 unique brands** including Zoho, TCS, Infosys, TVS Motor, Ashok Leyland, Freshworks, Swiggy, Zomato, Paytm, Razorpay, Flipkart, Google, Apple, Microsoft, OpenAI, Netflix, Tesla, and many more.
- **Engineering & Internship Focus:** Remote engineering internships and development roles for students (CSE, ECE, Mechanical, Civil) to gain corporate exposure and build resume credits.
- **Corporate Certifications:** Internships from companies (e.g., Freshworks, Intellect Design, Ashok Leyland) that provide verified certificates and corporate mentorship upon completion.


### 2. 🌐 Direct Careers Page Redirection ("Apply on Company Site")
* Adds a green **"🌐 Apply on Company Site →"** button in the job details header and sidebar.
* Redirects candidates directly to the official careers page of companies (e.g. Zoho, Google, TVS) in a new tab. This enables real-world applications directly to physical HR departments.

### 3. 📬 Real-Time Email Notifications & HR Simulation
* **HR Alert Routing:** Seeded listings' `applyEmail` is dynamically routed to the configured email (e.g., your personal Gmail `praveen542spk@gmail.com`).
* **Inbox Testing:** When a candidate applies to any listing, Nodemailer instantly fires:
  1. A **Candidate Confirmation Email** ("Application Received") to the applicant.
  2. A **New Application Alert Email** ("New applicant for [Role]") to the HR email (your inbox), allowing you to experience the exact recruiter workflow in your actual Gmail inbox!
* **Hiring Offers:** When an Employer changes an application status to "Hired" or "Interview" in the dashboard, a professional **Offer/Interview Email** is automatically sent to the candidate's real inbox.

### 4. 🧠 AI Resume Scanner & Match Score
* **Animated Laser Scan:** Includes an animated gold core and scanning loader.
* **Match Score Analysis:** Intelligently matches uploaded resume filenames and profile skills against target job tags.
* **Color-Coded Fit Summary:** Renders an emerald/yellow/red percentage score with "Matched Strengths" and actionable "Key Recommendations".

### 5. ✨ AI Cover Letter Generator
* Includes a **"✨ AI Generate"** wizard inside the application modal.
* Generates custom, high-impact cover letters on-the-fly incorporating the candidate's name, headline, skills, company name, and job title.

### 6. ⚡ Saved Profile & One-Click Quick Apply
*revamped Candidate Profile dashboard allowing real-time edits for headline, bio, skills, and resume files.
- Submitting an application auto-saves profile details. Once saved, jobs display a pulsing emerald **"⚡ One-Click Quick Apply"** button to apply instantly without filling out forms.

### 7. 📊 Employer Posting Analytics & Conversion Charts
* Displays an animated, responsive view-to-application conversion bar chart for employers.
* Computes submission rates and outputs an **AI Smart Optimizations** advice widget advising recruiters on how to optimize job cards to boost applicant quality.

### 8. 🔒 Sign-In Role Security & Auto-Tab Sync
* **Strict Role Verification:** Backend cross-references registered roles (Candidate vs Employer) at login to reject mismatched sign-ins (e.g. attempting to log in as an Employer under the Job Seeker tab).
* **Auto-Sync Navigation:** Clicking "Sign In" defaults to the Job Seeker tab, while clicking "For Employers" automatically redirects to the Employer tab.

### 9. 🤖 Real-Time MongoDB-Integrated AI Career Chatbot
* **Orbital Glowing Orb Logo:** Custom CSS-driven orbiting golden AI core trigger button.
* **Contextual Database Recommendations:** Automatically scans MongoDB listings to suggest active positions and salaries.
* **Conversational Engine:** Contextually responds to greetings, identity questions, process queries, and salary range queries.

### 10. 🌓 Dual-Theme Glassmorphism Overhaul
* **Obsidian Midnight (Dark Mode - Default):** Custom gradients, glowing borders, and glassmorphic layers.
* **Brutalist Cream (Light Mode):** Sharp editorial outlines, vintage gold accents, and high-contrast styling.
* Sunlight/Moon toggle persists your selected theme in `localStorage`.

### 11. 🛠️ Advanced Admin Moderation & System Control Panel
* **Protected Administrative Dashboard:** Administrators are automatically routed to the secure Control Panel (`admin-dash`) and general browse/apply views are hidden to ensure strict role isolation.
* **MERN Admin Panel (5 Tabs):**
  1. **📊 Reports & Analytics:** Daily signups analytics, application funnel status tracks (`pending`, `reviewed`, `interview`, `hired`), recruiter leaderboard, and chatbot diagnostic logs.
  2. **🛡️ Moderation Board:** Employer verified badge check (`✔`), user ban/domain blacklists, flagged job listing reviews, and a ticket resolution inbox.
  3. **📣 System Configs:** Real-time announcement marquee text banner editor, global maintenance lockout switch with custom countdown timer, global categories tag editor, and external scraper trigger.
  4. **🔒 Access & Security:** Primary Admin exclusive approval gate (`praveen542spk@gmail.com`) to authorize or revoke secondary admin emails, and a user password force-reset portal.
  5. **📜 System Audit & Utils:** CSV audit exporter, one-click JSON database backup stream/FileReader state restore, and log archiving.

---

## 📱 Detailed Component & Page Breakdown

### 1. Navigation & Header
* **Theme Toggle:** Dynamic Sun/Moon button that switches CSS root variables on the fly.
* **Active State Indicator:** Highlights the current page context.
* **Auto-Login:** Automatically recovers session tokens on load.

### 2. Home Page
* **Hero Search Bar:** Fast keyword search with auto-redirect to the `Browse Jobs` page.
* **Interactive Category Cards:** Direct filtering by category.
* **Featured Job Grid:** Showcases premium job cards with visual tags.

### 3. Browse Jobs Page
* **Sidebar Filters:** Advanced filters for job type, remote status, and category.
* **Bidirectional Chip Sync:** Clickable category chips sync immediately with filter states.
* **Sorting Dropdown:** Sort jobs by `Newest` or `Highest Salary`.

### 4. Job Details Page
* **Responsive Sidebar:** Summarizes key job specifications (Posted date, salary, remote status).
* **"Apply on TalentHub" Wizard:** Step-by-step modal (Personal Info, Cover Letter Generation, Resume Upload).
* **"Apply on Company Site" Link:** Opens the official corporate careers page.

### 5. Candidate Dashboard
* **Application Tracker:** Lists all applied jobs with status tags.
* **Dynamic Status Pills:** Displays status changes in real-time.

### 6. Employer Dashboard
* **Analytics Tab:** Conversions analytics chart with an AI recommendations widget.
* **Post Job Form:** Interface for adding listings.
* **Status Selector:** Recruiter dropdown to update application stages (`pending`, `reviewed`, `interview`, `rejected`, `hired`).

---

## 🛠️ Tech Stack

| Layer | Frontend (talenthub) | Backend (talenthub-backend) |
|---|---|---|
| **Framework / Library** | React.js (Vite) | Node.js + Express.js |
| **Styling** | Vanilla CSS + Theme Variable System | — |
| **Database** | — | MongoDB + Mongoose |
| **Authentication** | JWT (Local Storage) | JWT + BcryptJS |
| **Realtime Updates** | Supabase Broadcast Client | Supabase Broadcast Server |
| **Email Service** | — | Nodemailer (Gmail / Resend) |
| **File Uploads** | FormData | Multer |

---

## 📁 Project Structure

```
job-app/
├── talenthub/                 ← React.js Frontend (Vite)
│   ├── src/
│   │   ├── App.jsx            ← Main application & routing logic
│   │   ├── api.js             ← API fetch wrapper
│   │   └── index.css          ← Core design tokens & styling
│   └── package.json
│
├── talenthub-backend/         ← Node.js Backend API
│   ├── src/
│   │   ├── server.js          ← API entry point
│   │   ├── config/            ← DB connection & Supabase setup
│   │   ├── models/            ← Mongoose schemas (User, Job, Application)
│   │   ├── controllers/       ← Auth, Job, and Application controllers
│   │   └── utils/             ← Nodemailer triggers & jobSyncer utility
│   ├── .env                   ← Backend environment configs
│   └── package.json
│
└── README.md                  ← Main Project Documentation (this file)
```

---

## 🚀 Step-by-Step Setup

Open **two separate terminals** in VS Code to run both layers:

### 1. Set Up the Backend
```bash
cd talenthub-backend
npm install
```

Create a `.env` file in `talenthub-backend/` matching `.env.example`:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
EMAIL_SERVICE=gmail
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password
CLIENT_URL=http://localhost:5180
```

Start the backend:
```bash
npm run dev
```

### 2. Set Up the Frontend
```bash
cd talenthub
npm install
```

Create a `.env` file in `talenthub/` if custom ports are needed:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm run dev
```

Open your browser to `http://localhost:5180`.

---

## 🧹 Database Re-seeding & Curation
To clear any developer dummy listings and sync the database with the **122+ premium roles**:
1. Make a `POST` request to `http://localhost:5000/api/jobs/sync-external`.
2. This runs the internal `jobSyncer` which:
   - Deletes dummy test items containing "test", "dummy", or "fake".
   - Syncs real-world listings from the Remotive API.
   - Curates and seeds all 52 premium Indian and global giants.
   - Maps all `applyEmail` attributes to your configured `EMAIL_USER` for direct email routing.

---

*TalentHub — Premium MERN Job & Internship Portal*
