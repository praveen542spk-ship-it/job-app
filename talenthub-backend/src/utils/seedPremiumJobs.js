// seedPremiumJobs.js
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'talenthub-backend', '.env') });
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://talenthub:spk2007@talenthub.nzkagjv.mongodb.net/?appName=talenthub";

// Schemas & Models
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String,
  company: String,
  avatar: String,
});
const User = mongoose.models.User || mongoose.model('User', userSchema);

const jobSchema = new mongoose.Schema({
  title: String,
  company: String,
  logo: String,
  employer: mongoose.Schema.Types.ObjectId,
  description: String,
  requirements: [String],
  benefits: [String],
  skills: [String],
  location: String,
  remote: String,
  type: String,
  category: String,
  salary: String,
  applyEmail: String,
  status: String,
  featured: Boolean,
  createdAt: Date,
});
const Job = mongoose.models.Job || mongoose.model('Job', jobSchema);

const PREMIUM_MOCK_JOBS = [
  // ── Engineering ──
  {
    title: "Senior Full-Stack Developer",
    company: "OpenAI",
    logo: "🤖",
    description: "OpenAI is looking for a Senior Full-Stack Developer to build user interfaces, robust APIs, and developer platforms that enable access to our cutting-edge AI systems. You will collaborate directly with model researchers and product leaders to design next-gen AI environments.",
    requirements: ["5+ years React, Node.js, and TypeScript experience", "Experience with scalable cloud architecture (AWS/GCP)", "Passion for generative AI and low-latency API design"],
    benefits: ["Equity packages in OpenAI", "Generous health, dental, and vision insurance", "Annual learning & remote office equipment stipends"],
    skills: ["React", "Node", "TypeScript", "AI", "APIs"],
    location: "San Francisco / Remote",
    remote: "Fully Remote",
    type: "Full-time",
    category: "Engineering",
    salary: "$165k - $215k",
    featured: true,
  },
  {
    title: "Frontend Engineer (React/Vite)",
    company: "Spotify",
    logo: "🎵",
    description: "Spotify is seeking a talented Frontend Engineer to craft the next generation of our Web Player interfaces. You will work on optimizing browser rendering, creating flawless transitions, and implementing premium collaborative listening playlists.",
    requirements: ["Deep expertise in React, Vite, and modern state management", "Expertise in CSS/SVG micro-animations and rich audio integrations", "Experience with modular micro-frontends"],
    benefits: ["Fully flexible 'Work From Anywhere' policy", "Uncapped PTO", "Spotify Premium subscription & home gym subsidy"],
    skills: ["React", "Vite", "CSS", "Micro-frontends"],
    location: "Stockholm / Remote",
    remote: "Fully Remote",
    type: "Full-time",
    category: "Engineering",
    salary: "$130k - $165k",
    featured: true,
  },
  {
    title: "Lead AI Researcher (Deep Learning)",
    company: "Google DeepMind",
    logo: "🧠",
    description: "Join the DeepMind team in building the next frontier of intelligence. You will conduct original research in deep reinforcement learning, large multimodal foundation models, and novel transformer architectures to solve high-impact scientific and real-world challenges.",
    requirements: ["PhD in Computer Science, Machine Learning, or Mathematics", "Extensive publication history at NeurIPS, ICML, or CVPR", "Proficiency in JAX or PyTorch and distributed training scales"],
    benefits: ["World-class compute resources and clusters", "Top-tier health and retirement match plans", "Global relocation support & hybrid office perks"],
    skills: ["JAX", "PyTorch", "Reinforcement Learning", "Transformers"],
    location: "London / Hybrid",
    remote: "Hybrid",
    type: "Full-time",
    category: "Engineering",
    salary: "$195k - $260k",
    featured: true,
  },
  // ── Design ──
  {
    title: "Lead Product Designer",
    company: "Figma",
    logo: "🎨",
    description: "Figma is looking for a Lead Product Designer to shape the future of design tooling. You will lead design strategies for our prototyping engine, developer mode, and AI co-pilot tools, helping millions of creators build products together.",
    requirements: ["6+ years designing complex SaaS products or developer systems", "Obsession with detailed visual design, micro-interactions, and usability", "Strong portfolio demonstrating complete design cycles from research to high-fidelity layouts"],
    benefits: ["Competitive equity & performance bonuses", "Comprehensive family healthcare packages", "Annual health and wellness stipends"],
    skills: ["Figma", "UI/UX", "Prototyping", "SaaS Design"],
    location: "New York / Remote OK",
    remote: "Remote OK",
    type: "Full-time",
    category: "Design",
    salary: "$145k - $185k",
    featured: true,
  },
  {
    title: "Senior UI/UX Specialist",
    company: "Airbnb",
    logo: "🏡",
    description: "Join our core product team at Airbnb to design frictionless, visually stunning guest and host discovery journeys. You will craft responsive interfaces that elevate search credibility and help travelers find custom accommodations.",
    requirements: ["4+ years UX/UI design experience in e-commerce or booking travel apps", "Deep expertise with complex design systems and user journey flows", "Exceptional storytelling and interactive presentation abilities"],
    benefits: ["Annual $2,000 Airbnb travel credits", "Comprehensive dental and health coverage", "Flexible working arrangements"],
    skills: ["UX Design", "UI Design", "Figma", "User Journeys"],
    location: "San Francisco / Remote",
    remote: "Fully Remote",
    type: "Full-time",
    category: "Design",
    salary: "$125k - $160k",
    featured: false,
  },
  // ── Marketing ──
  {
    title: "Growth Marketing Manager",
    company: "Duolingo",
    logo: "🦉",
    description: "Duolingo is seeking a high-energy Growth Marketing Manager. You will formulate, test, and scale aggressive performance marketing campaigns to acquire language learners globally via TikTok, Instagram, and programmatic display ads.",
    requirements: ["3+ years in growth marketing or paid acquisition channels", "Highly data-driven mindset with advanced analytics and cohort analysis skills", "Experience budgeting and scaling ad budgets exceeding $100k/month"],
    benefits: ["Daily catered meals in offices or remote food stipends", "100% employer-covered health plan", "Free language learning mentorship"],
    skills: ["Paid Ads", "Analytics", "Growth", "TikTok Ads"],
    location: "Pittsburgh / Remote",
    remote: "Fully Remote",
    type: "Full-time",
    category: "Marketing",
    salary: "$95k - $125k",
    featured: true,
  },
  {
    title: "Lead Content Strategist",
    company: "Netflix",
    logo: "🍿",
    description: "As the Lead Content Strategist, you will design the editorial voice and promotional strategies for Netflix's upcoming slate of global blockbuster original series and feature films. You will lead social media copywriters, designers, and video editors to create viral, premium campaigns.",
    requirements: ["5+ years directing social copy or digital content strategy for major entertainment brands", "A proven record of launching viral organic social media campaigns", "Deep understanding of pop culture and media trends"],
    benefits: ["Unlimited holiday allowance", "Full streaming subscriptions bundle", "Free catered events & remote home office package"],
    skills: ["Social Copy", "Entertainment Marketing", "Strategy"],
    location: "Los Angeles / Hybrid",
    remote: "Hybrid",
    type: "Full-time",
    category: "Marketing",
    salary: "$110k - $145k",
    featured: false,
  },
  // ── Finance ──
  {
    title: "Global Financial Controller",
    company: "Revolut",
    logo: "💳",
    description: "Revolut is seeking a Global Financial Controller to lead international treasury management, compliance reports, and tax declarations. You will direct multi-currency accounting teams and ensure strong internal audit controls during global expansions.",
    requirements: ["CPA or ACCA qualification with 6+ years post-qualification experience", "Deep knowledge of multi-currency transaction accounting and regional banking regulations", "Advanced SQL or data-querying experience is a strong plus"],
    benefits: ["Competitive equity package in top fintech", "Private health insurance & dental plans", "Annual professional development budget"],
    skills: ["Treasury", "Accounting", "Compliance", "SQL"],
    location: "London / Remote",
    remote: "Fully Remote",
    type: "Full-time",
    category: "Finance",
    salary: "$125k - $160k",
    featured: true,
  },
  {
    title: "Fintech Product Manager (Payments)",
    company: "Wise",
    logo: "🌍",
    description: "Wise is on a mission to build money without borders. We are looking for a Product Manager to lead our Core Payments team, optimizing real-time transfer gateways, minimizing routing fees, and launching instant settlement options across Asia-Pacific corridors.",
    requirements: ["3+ years product management experience in payments, banking, or processing gateways", "Strong technical understanding of APIs, SWIFT networks, and database transactions", "Obsession with customer feedback and frictionless payment journeys"],
    benefits: ["Paid 6-week sabbatical after every 4 years", "Wise equity stock options", "Work from any international location for up to 90 days a year"],
    skills: ["Payments", "APIs", "SWIFT", "Product Management"],
    location: "Singapore / Hybrid",
    remote: "Hybrid",
    type: "Full-time",
    category: "Finance",
    salary: "$115k - $150k",
    featured: false,
  },
  // ── Healthcare ──
  {
    title: "Healthcare IT System Lead",
    company: "Oscar Health",
    logo: "🏥",
    description: "Oscar Health is looking for a Healthcare IT System Lead to oversee telehealth infrastructures and electronic medical record (EMR) system synchronization. You will secure HIPAA-compliant communications and assure top-grade network security across care delivery networks.",
    requirements: ["5+ years IT systems or database administration experience in healthcare", "Expert knowledge of HIPAA regulations, HL7 standards, and FHIR APIs", "Familiarity with cloud security compliance models"],
    benefits: ["100% paid primary healthcare membership", "Flexible remote environment with technical setup budget", "Generous parental leave policies"],
    skills: ["HL7", "FHIR", "HIPAA", "Network Security"],
    location: "Dallas / Remote OK",
    remote: "Remote OK",
    type: "Full-time",
    category: "Healthcare",
    salary: "$130k - $165k",
    featured: true,
  },
  {
    title: "Medical Data Analyst",
    company: "Moderna",
    logo: "🧪",
    description: "Join Moderna's clinical bioinformatics team to analyze massive clinical trial datasets for upcoming mRNA drug pipelines. You will design reports, run cohort studies, and generate data validations for regulatory submissions.",
    requirements: ["Master's degree in Biostatistics, Health Informatics, or related science field", "Expertise in R or Python programming for statistical data models", "Understanding of clinical trial data standards (CDISC ADaM/SDTM)"],
    benefits: ["Stock match purchase plan", "Top-tier health and dental packages", "Workplace fitness subsidies"],
    skills: ["R", "Python", "CDISC", "Biostatistics"],
    location: "Boston / Remote",
    remote: "Fully Remote",
    type: "Full-time",
    category: "Healthcare",
    salary: "$110k - $145k",
    featured: false,
  },
  // ── Education ──
  {
    title: "E-Learning UX Specialist",
    company: "Duolingo",
    logo: "🦉",
    description: "Duolingo is seeking an E-Learning UX Specialist to research, map, and refine user engagement hooks across our math and music learning systems. You will optimize educational gaming loops that turn complex study patterns into daily habits.",
    requirements: ["3+ years UX design or user research experience inside educational apps", "Strong understanding of human-computer interaction and game design mechanics", "Ability to iterate designs based on quantitative A/B testing data"],
    benefits: ["Fully equipped home office setup", "Comprehensive family healthcare packages", "Free catered lunch coupons daily"],
    skills: ["UX Research", "Game Design", "HCI", "A/B Testing"],
    location: "Seattle / Remote",
    remote: "Fully Remote",
    type: "Full-time",
    category: "Education",
    salary: "$85k - $110k",
    featured: true,
  },
  {
    title: "Lead Technical Instructor (AI & ML)",
    company: "Udacity",
    logo: "🎓",
    description: "Udacity is looking for a Lead Technical Instructor to craft and present our upcoming Artificial Intelligence and Machine Learning Nanodegree programs. You will record instructional videos, design student project guides, and build code graders.",
    requirements: ["Deep technical experience in PyTorch, TensorFlow, and transformer architectures", "Prior experience as a developer, educator, or technical speaker", "Excellent verbal articulation and ability to explain complex theories simply"],
    benefits: ["Professional filming equipment shipped to your home", "Flexible working schedule", "Competitive compensation + course performance bonuses"],
    skills: ["PyTorch", "TensorFlow", "Teaching", "Machine Learning"],
    location: "Global / Remote",
    remote: "Fully Remote",
    type: "Contract",
    category: "Education",
    salary: "$100k - $135k",
    featured: false,
  },
  // ── Legal ──
  {
    title: "Senior Legal Counsel (Product)",
    company: "Uber",
    logo: "🚗",
    description: "Uber is looking for a Senior Legal Counsel to guide our global delivery and autonomous vehicle product teams through complex regulatory environments. You will advise on consumer protection, privacy policies, and intellectual property licensing agreements.",
    requirements: ["JD from an accredited law school and active bar association membership", "5+ years of technology transactions or product counsel experience", "Strong commercial drafting and collaborative negotiation skills"],
    benefits: ["Uber ride & UberEats monthly credits", "High-value equity grants", "Premium life and medical insurance coverages"],
    skills: ["Product Counsel", "Privacy", "IP Licensing", "Technology Law"],
    location: "San Francisco / Hybrid",
    remote: "Hybrid",
    type: "Full-time",
    category: "Legal",
    salary: "$165k - $205k",
    featured: true,
  },
  {
    title: "Corporate Legal Specialist",
    company: "Coinbase",
    logo: "🪙",
    description: "Coinbase is looking for a Corporate Legal Specialist to support global expansions, token listings compliance, and regulatory reporting in a high-growth crypto economy. You will handle NDA drafts, compile regulatory files, and coordinate local outside counsel teams.",
    requirements: ["4+ years corporate paralegal or regulatory associate experience", "Strong understanding of fintech, blockchain, or securities regulation models", "Impeccable attention to detail and file management skills"],
    benefits: ["100% remote working stipend", "Crypto-investment matches", "Uncapped mental health sessions support"],
    skills: ["Crypto Regulation", "Securities Law", "NDA Drafting"],
    location: "Remote (US)",
    remote: "Fully Remote",
    type: "Full-time",
    category: "Legal",
    salary: "$140k - $175k",
    featured: false,
  },
  // ── Science ──
  {
    title: "Bioinformatics Scientist",
    company: "Grail",
    logo: "🧬",
    description: "Grail is looking for a Bioinformatics Scientist to join our team in detecting cancer early. You will build highly scalable computational models to analyze high-throughput Next-Generation Sequencing (NGS) cancer genomics data, supporting early diagnosis workflows.",
    requirements: ["PhD in Bioinformatics, Computational Biology, Genomics, or Biostatistics", "Strong development skills in Python, R, and pipeline tools like Nextflow", "Deep experience with genomic variant analysis and tumor biology"],
    benefits: ["High-impact mission with competitive salary", "Top-quality medical plans and retirement matches", "Annual learning & scientific conference stipends"],
    skills: ["NGS", "Bioinformatics", "Python", "Nextflow", "Genomics"],
    location: "Menlo Park / Remote",
    remote: "Fully Remote",
    type: "Full-time",
    category: "Science",
    salary: "$135k - $170k",
    featured: true,
  },
  {
    title: "AI Research Scientist (Science & Physics)",
    company: "Meta AI",
    logo: "🤖",
    description: "Join Meta AI Research in applying deep neural architectures to physical sciences. You will train generative models to discover novel materials, forecast complex weather events, or accelerate biological protein design structures.",
    requirements: ["PhD in Physics, Computational Chemistry, or ML/Deep Learning", "Proven record of publishing in scientific journals like Nature, Science, or top ML venues", "Expertise building large-scale deep learning pipelines in PyTorch"],
    benefits: ["Access to massive compute infrastructure", "Elite corporate healthcare and life plans", "Flexible remote work schedules"],
    skills: ["PyTorch", "Generative Models", "Scientific Computing"],
    location: "New York / Remote",
    remote: "Fully Remote",
    type: "Full-time",
    category: "Science",
    salary: "$180k - $240k",
    featured: true,
  }
];

async function seed() {
  try {
    console.log(`🔌 Connecting to MongoDB: ${MONGO_URI.substring(0, 30)}...`);
    await mongoose.connect(MONGO_URI);
    console.log("✅ Database Connected.");

    // 1. Get or create system employer
    let systemEmployer = await User.findOne({ email: 'praveen542spk@gmail.com', role: 'employer' });
    if (!systemEmployer) {
      systemEmployer = await User.findOne({ email: 'system-employer@talenthub.com' });
    }

    if (!systemEmployer) {
      console.log("👤 Creating default System Recruiter profile...");
      systemEmployer = await User.create({
        name: 'System Recruiter',
        email: 'system-employer@talenthub.com',
        role: 'employer',
        company: 'Remotive Remote Jobs',
        avatar: '🤖',
      });
    }
    console.log(`👤 Using System Employer ID: ${systemEmployer._id}`);

    // 2. Insert Premium Mock Jobs (findOneAndUpdate to avoid duplicates)
    let added = 0;
    for (const pj of PREMIUM_MOCK_JOBS) {
      const existing = await Job.findOne({ title: pj.title, company: pj.company });
      if (!existing) {
        await Job.create({
          ...pj,
          employer: systemEmployer._id,
          applyEmail: 'system-employer@talenthub.com',
          status: 'active',
          createdAt: new Date(),
        });
        added++;
        console.log(`✨ Seeded new premium job: "${pj.title}" at ${pj.company}`);
      } else {
        console.log(`ℹ️ Job already exists, skipped: "${pj.title}" at ${pj.company}`);
      }
    }

    console.log(`🏁 Seeding finished! Seeded ${added} new premium jobs.`);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB.");
  }
}

seed();
