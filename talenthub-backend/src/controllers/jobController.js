// src/controllers/jobController.js
const { validationResult } = require('express-validator');
const Job = require('../models/Job');
const supabase = require('../config/supabase');
const ActivityLog = require('../models/ActivityLog');
const { sendAdminJobPostAlert } = require('../utils/email');

// ── GET /api/jobs ───────────────────────────────────────────────────────
const getJobs = async (req, res, next) => {
  try {
    const { search, category, type, remote, page = 1, limit = 12, sort = 'newest' } = req.query;

    const filter = { status: 'active' };
    if (search) filter.$text = { $search: search };
    if (category) filter.category = category;
    if (type)     filter.type     = type;
    if (remote)   filter.remote   = remote;

    console.log("🔍 [getJobs] Query Filter:", filter);

    const sortMap = {
      newest:   { createdAt: -1 },
      oldest:   { createdAt:  1 },
      featured: { featured: -1, createdAt: -1 },
    };
    const sortObj = sortMap[sort] || sortMap.newest;
    const skip = (Number(page) - 1) * Number(limit);

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(Number(limit))
        .populate('employer', 'name company isVerified'),
      Job.countDocuments(filter),
    ]);

    console.log(`📦 [getJobs] Found ${jobs.length} jobs in this page out of total ${total} active jobs`);

    res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / Number(limit)), jobs });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/jobs/:id ───────────────────────────────────────────────────
const getJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate('employer', 'name company email isVerified');

    if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });

    Job.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } }).exec();

    res.json({ success: true, job });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/jobs ──────────────────────────────────────────────────────
const createJob = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const job = await Job.create({
      ...req.body,
      employer: req.user._id,
      company: req.user.company || req.user.name,
      applyEmail: req.body.applyEmail || req.user.email,
    });

    // Log job posting activity
    await ActivityLog.create({
      activityType: 'job_post',
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
      details: `Posted new job: "${job.title}" at "${job.company}"`
    }).catch(err => console.error("Activity log error:", err));

    // Send email alert to admin (non-blocking)
    sendAdminJobPostAlert({
      company: job.company,
      title: job.title,
      category: job.category,
      location: job.location,
      employerName: req.user.name
    }).catch(() => {});

    // ✅ Supabase Realtime — New job broadcast
    await supabase.channel('jobs').send({
      type: 'broadcast',
      event: 'job_created',
      payload: {
        _id: job._id,
        title: job.title,
        company: job.company,
        location: job.location,
        type: job.type,
      },
    });

    res.status(201).json({ success: true, job });
  } catch (err) {
    next(err);
  }
};

// ── PATCH /api/jobs/:id ─────────────────────────────────────────────────
const updateJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });

    if (job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorised to edit this listing.' });
    }

    const allowed = ['title', 'description', 'requirements', 'benefits', 'skills',
                     'location', 'remote', 'type', 'salary', 'category', 'status', 'applyEmail'];

    const updates = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const updated = await Job.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });

    // ✅ Supabase Realtime — Job updated broadcast
    await supabase.channel('jobs').send({
      type: 'broadcast',
      event: 'job_updated',
      payload: {
        _id: updated._id,
        title: updated.title,
        status: updated.status,
      },
    });

    res.json({ success: true, job: updated });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/jobs/:id ────────────────────────────────────────────────
const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });

    if (job.employer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorised.' });
    }

    await job.deleteOne();

    // Log job deletion activity
    await ActivityLog.create({
      activityType: 'job_delete',
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
      details: `Deleted job: "${job.title}" at "${job.company}"`
    }).catch(err => console.error("Activity log error:", err));

    // ✅ Supabase Realtime — Job deleted broadcast
    await supabase.channel('jobs').send({
      type: 'broadcast',
      event: 'job_deleted',
      payload: { _id: req.params.id },
    });

    res.json({ success: true, message: 'Job listing deleted.' });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/jobs/employer/mine ─────────────────────────────────────────
const getMyJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ employer: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, total: jobs.length, jobs });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/jobs/sync-external ─────────────────────────────────────────
const syncExternalJobs = async (req, res, next) => {
  try {
    // 1. Wipe out any actually fake test jobs (like ones containing "test", "dummy", "fake" in title/company)
    const deleteResult = await Job.deleteMany({
      $or: [
        { title: { $regex: /test|dummy|fake/i } },
        { company: { $regex: /test|dummy|fake/i } }
      ]
    });
    console.log(`🧹 Deleted ${deleteResult.deletedCount} dummy test jobs.`);

    // 2. Re-seed clean high-quality premium jobs and pull real remote jobs from API

    const syncer = require('../utils/jobSyncer');
    const results = await syncer.syncExternalJobs();
    
    // 3. Update all existing jobs in the database to have a valid externalApplyUrl if they don't have one!
    const allJobs = await Job.find({});
    let updatedCount = 0;
    const getCompanyCareersUrl = (company) => {
      if (!company) return 'https://google.com/search?q=careers';
      const name = company.toLowerCase();
      if (name.includes('zoho')) return 'https://careers.zoho.com';
      if (name.includes('tcs') || name.includes('tata consultancy')) return 'https://www.tcs.com/careers';
      if (name.includes('infosys')) return 'https://www.infosys.com/careers.html';
      if (name.includes('tvs')) return 'https://www.tvsmotor.com/careers';
      if (name.includes('ashok leyland')) return 'https://www.ashokleyland.com/en/careers';
      if (name.includes('freshworks')) return 'https://www.freshworks.com/company/careers/';
      if (name.includes('chargebee')) return 'https://www.chargebee.com/careers/';
      if (name.includes('kissflow')) return 'https://kissflow.com/careers/';
      if (name.includes('swiggy')) return 'https://careers.swiggy.com';
      if (name.includes('zomato')) return 'https://www.zomato.com/careers';
      if (name.includes('paytm')) return 'https://paytm.com/careers';
      if (name.includes('razorpay')) return 'https://razorpay.com/careers';
      if (name.includes('flipkart')) return 'https://www.flipkartcareers.com';
      if (name.includes('wipro')) return 'https://careers.wipro.com';
      if (name.includes('ola')) return 'https://www.olacabs.com/careers';
      if (name.includes('hcltech') || name.includes('hcl')) return 'https://www.hcltech.com/careers';
      if (name.includes('cognizant')) return 'https://careers.cognizant.com';
      if (name.includes('google')) return 'https://careers.google.com';
      if (name.includes('deepmind')) return 'https://careers.google.com/jobs/results/?q=deepmind';
      if (name.includes('figma')) return 'https://www.figma.com/careers/';
      if (name.includes('spotify')) return 'https://www.lifeatspotify.com';
      if (name.includes('openai')) return 'https://openai.com/careers';
      if (name.includes('netflix')) return 'https://jobs.netflix.com';
      if (name.includes('tesla')) return 'https://www.tesla.com/careers';
      if (name.includes('airbnb')) return 'https://news.airbnb.com/careers/';
      if (name.includes('amazon')) return 'https://www.amazon.jobs';
      if (name.includes('microsoft')) return 'https://careers.microsoft.com';
      if (name.includes('apple')) return 'https://www.apple.com/careers/';
      if (name.includes('uber')) return 'https://www.uber.com/careers/';
      if (name.includes('slack')) return 'https://careers.slack.com/';
      if (name.includes('tiktok')) return 'https://careers.tiktok.com/';
      if (name.includes('stripe')) return 'https://stripe.com/jobs';
      if (name.includes('wealthsimple')) return 'https://www.wealthsimple.com/careers';
      if (name.includes('cvs')) return 'https://jobs.cvshealth.com';
      if (name.includes('teladoc')) return 'https://www.teladochealth.com/careers';
      if (name.includes('khan academy')) return 'https://www.khanacademy.org/careers';
      if (name.includes('coursera')) return 'https://about.coursera.org/careers';
      if (name.includes('legalzoom')) return 'https://www.legalzoom.com/careers';
      if (name.includes('linklaters')) return 'https://careers.linklaters.com';
      if (name.includes('pfizer')) return 'https://careers.pfizer.com';
      if (name.includes('iqvia')) return 'https://jobs.iqvia.com';
      if (name.includes('zepto')) return 'https://www.zepto.co.in/careers';
      if (name.includes('blinkit')) return 'https://careers.blinkit.com';
      if (name.includes('phonepe')) return 'https://www.phonepe.com/careers';
      if (name.includes('meesho')) return 'https://www.meesho.careers';
      if (name.includes('groww')) return 'https://groww.in/careers';
      if (name.includes('upstox')) return 'https://upstox.com/careers';
      if (name.includes('bharatpe')) return 'https://bharatpe.com/careers';
      if (name.includes('licious')) return 'https://www.licious.in/careers';
      if (name.includes('ibm')) return 'https://www.ibm.com/employment';
      if (name.includes('accenture')) return 'https://www.accenture.com/in-en/careers';
      if (name.includes('capgemini')) return 'https://www.capgemini.com/careers/';
      if (name.includes('oracle')) return 'https://www.oracle.com/corporate/careers/';
      if (name.includes('salesforce')) return 'https://www.salesforce.com/company/careers/';
      if (name.includes('adobe')) return 'https://www.adobe.com/careers.html';
      if (name.includes('cisco')) return 'https://www.cisco.com/c/en/us/about/careers.html';
      if (name.includes('intel')) return 'https://www.intel.com/content/www/us/en/jobs/jobs-at-intel.html';
      if (name.includes('nvidia')) return 'https://www.nvidia.com/en-us/about-nvidia/careers/';
      if (name.includes('jio')) return 'https://careers.jio.com';
      if (name.includes('airtel')) return 'https://www.airtel.in/careers';
      if (name.includes('tata')) return 'https://www.tata.com/careers';
      if (name.includes('mahindra')) return 'https://www.mahindracareers.com';
      if (name.includes('l&t') || name.includes('larsen')) return 'https://www.larsentoubro.com/corporate/careers/';
      if (name.includes('bosch')) return 'https://www.bosch.in/careers/';
      if (name.includes('siemens')) return 'https://new.siemens.com/in/en/company/jobs.html';
      if (name.includes('godrej')) return 'https://www.godrejcareers.com';
      return `https://www.google.com/search?q=${encodeURIComponent(company + ' careers')}`;
    };

    for (const job of allJobs) {
      let modified = false;
      if (!job.externalApplyUrl) {
        job.externalApplyUrl = getCompanyCareersUrl(job.company);
        modified = true;
      }
      if ((job.applyEmail === 'system-employer@talenthub.com' || !job.applyEmail) && process.env.EMAIL_USER) {
        job.applyEmail = process.env.EMAIL_USER;
        modified = true;
      }
      if (modified) {
        await job.save();
        updatedCount++;
      }
    }
    console.log(`✅ Updated ${updatedCount} existing jobs with Careers URLs and HR apply emails.`);


    res.status(200).json({
      success: true,
      message: `Successfully cleaned non-premium listings and synced premium jobs!`,
      deletedCount: deleteResult.deletedCount,
      updatedCount,
      results,
    });
  } catch (err) {
    next(err);
  }
};


module.exports = { getJobs, getJob, createJob, updateJob, deleteJob, getMyJobs, syncExternalJobs };