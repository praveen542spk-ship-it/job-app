const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

require('dotenv').config();

const express   = require('express');
const cors      = require('cors');
const morgan    = require('morgan');
const path      = require('path');
const mongoose  = require('mongoose');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

app.use(cors());

// ── MongoDB Connection ─────────────────────────
mongoose.set('bufferCommands', false); // Fail fast instead of hanging when disconnected
mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log("✅ MongoDB Connected");
})
.catch((err) => {
  console.error("❌ MongoDB connection failed:", err.message);
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(morgan('dev'));

// Static uploads folder
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ── Health Check ──────────────────────────────
app.get('/api/health', async (req, res) => {
  try {
    const Job = require('./models/Job');
    const User = require('./models/User');
    const totalJobs = await Job.countDocuments({});
    const activeJobs = await Job.countDocuments({ status: 'active' });
    const totalUsers = await User.countDocuments({});
    res.json({
      success: true,
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: "development",
      database: {
        connected: mongoose.connection.readyState === 1,
        totalJobs,
        activeJobs,
        totalUsers,
      }
    });
  } catch (err) {
    res.json({
      success: true,
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: "development",
      database: {
        connected: mongoose.connection.readyState === 1,
        error: err.message,
      }
    });
  }
});

// ── API Routes ────────────────────────────────


app.use('/api/auth',         require('./routes/auth'));
app.use('/api/jobs',         require('./routes/jobs'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/chat',         require('./routes/chat'));
app.use('/api/system',       require('./routes/system'));

// ── Error Handling ────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start Server ──────────────────────────────
const PORT = 5000;

app.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════╗
  ║   🚀 TalentHub API is running          ║
  ║   Port  : ${PORT}                      ║
  ║   Env   : development                  ║
  ║   Health: http://localhost:${PORT}/api/health ║
  ╚════════════════════════════════════════╝
  `);
});
// Trigger nodemon hot reload for Mongoose reconnection