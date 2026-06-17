// src/utils/jobSyncer.js
const User = require('../models/User');
const Job = require('../models/Job');
const supabase = require('../config/supabase');

// HTML to Plain Text Cleaner
const cleanHtml = (html) => {
  if (!html) return '';
  return html
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

// Remotive Category mapping to talenthub category enum
const mapCategory = (rawCat) => {
  if (!rawCat) return 'Other';
  const cat = rawCat.toLowerCase();
  if (cat.includes('software') || cat.includes('dev') || cat.includes('data') || cat.includes('engineering') || cat.includes('qa')) return 'Engineering';
  if (cat.includes('design') || cat.includes('creative') || cat.includes('ux') || cat.includes('ui')) return 'Design';
  if (cat.includes('marketing') || cat.includes('writing') || cat.includes('content') || cat.includes('seo')) return 'Marketing';
  if (cat.includes('finance') || cat.includes('accounting') || cat.includes('business')) return 'Finance';
  if (cat.includes('health') || cat.includes('medical') || cat.includes('care')) return 'Healthcare';
  if (cat.includes('teach') || cat.includes('education')) return 'Education';
  if (cat.includes('legal')) return 'Legal';
  if (cat.includes('science') || cat.includes('lab') || cat.includes('biotech')) return 'Science';
  return 'Other';
};

// Remotive Job Type mapping to talenthub job type enum
const mapType = (rawType) => {
  if (!rawType) return 'Full-time';
  const type = rawType.toLowerCase().replace('_', '-').replace(' ', '-');
  if (type.includes('full-time') || type.includes('fulltime')) return 'Full-time';
  if (type.includes('part-time') || type.includes('parttime')) return 'Part-time';
  if (type.includes('contract') || type.includes('freelance')) return 'Contract';
  if (type.includes('internship') || type.includes('intern')) return 'Internship';
  return 'Full-time';
};

// Map company logo from Remotive or return standard emoji
const getCompanyLogoEmoji = (companyName) => {
  const emojis = ['🚀', '💻', '🎨', '💼', '⚡', '🤖', '🌐', '🛡️', '📊', '📈', '🏢', '🏗️', '🏥', '🔬', '🧠'];
  const index = Math.abs(companyName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % emojis.length;
  return emojis[index];
};

// Map company to its real-world official careers website URL
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

const MOCK_JOBS_BY_CATEGORY = {
  Finance: [
    {
      title: "Senior Financial Analyst",
      company: "Stripe",
      logo: "💳",
      location: "San Francisco, California, USA",
      type: "Full-time",
      salary: "$110k - $145k",
      description: "Stripe is looking for a Senior Financial Analyst to join our team. You will support Stripe's growth by delivering high-fidelity financial modeling, strategic analysis, and driving executive reporting across our payment processing streams.",
      requirements: ["5+ years of corporate finance or banking experience", "Exceptional Excel and financial modeling capabilities", "Familiarity with SQL and data visualization tools like Tableau"],
    },
    {
      title: "Remote Senior Accountant",
      company: "Wealthsimple",
      logo: "💰",
      location: "Toronto, Ontario, Canada (Remote)",
      type: "Full-time",
      salary: "$90k - $115k",
      description: "We are looking for a Senior Accountant to help manage corporate accounting, tax filings, and monthly close cycles in a fast-paced fintech environment.",
      requirements: ["CPA designation preferred", "Strong knowledge of GAAP/IFRS", "Experience in high-growth startup or finance environments"],
    }
  ],
  Healthcare: [
    {
      title: "Telehealth Nurse Practitioner",
      company: "CVS Health",
      logo: "🏥",
      location: "New York City, New York, USA",
      type: "Part-time",
      salary: "$120k - $150k",
      description: "CVS Health is seeking a part-time Telehealth Nurse Practitioner. You will deliver high-quality, compassionate virtual care to patients across the country, managing primary care consultations and chronic conditions via our secure platform.",
      requirements: ["Active Nurse Practitioner license in at least one state", "3+ years of clinical practice experience", "Comfortable using tele-medicine software and electronic health records"],
    },
    {
      title: "Clinical Research Specialist",
      company: "Teladoc Health",
      logo: "🩺",
      location: "Dallas, Texas, USA (Remote)",
      type: "Full-time",
      salary: "$95k - $130k",
      description: "Join our clinical operations team to review, analyze, and oversee remote clinical trials, ensuring compliance with global healthcare regulatory bodies.",
      requirements: ["Master's degree in Public Health or Life Sciences", "Proven track record in clinical trials coordination", "Strong understanding of FDA/EMA regulations"],
    }
  ],
  Education: [
    {
      title: "Remote Curriculum Designer",
      company: "Khan Academy",
      logo: "📚",
      location: "Mountain View, California, USA (Remote)",
      type: "Full-time",
      salary: "$90k - $120k",
      description: "Khan Academy is looking for a Curriculum Designer to create world-class, engaging online learning materials for mathematics and sciences. You will collaborate with educators and engineers to craft materials accessed by millions.",
      requirements: ["Degree in Education, Curriculum Design, or relevant field", "3+ years of experience designing online learning courses", "Strong pedagogical understanding of digital learning models"],
    },
    {
      title: "Online Course Instructor & Mentor",
      company: "Coursera",
      logo: "🏫",
      location: "London, England, UK (Remote)",
      type: "Contract",
      salary: "$65k - $90k",
      description: "Support learners worldwide in tech and business categories by grading assignments, answering forum posts, and hosting weekly office hours.",
      requirements: ["Strong background in Computer Science or Business Administration", "Excellent written communication and presentation skills", "Prior teaching or mentoring experience"],
    }
  ],
  Legal: [
    {
      title: "Remote Corporate Counsel",
      company: "LegalZoom",
      logo: "⚖️",
      location: "Austin, Texas, USA",
      type: "Full-time",
      salary: "$145k - $185k",
      description: "LegalZoom is seeking an experienced Corporate Counsel. You will manage commercial contracts, provide guidance on intellectual property, and ensure regulatory compliance across multiple product lines.",
      requirements: ["JD degree from an accredited law school and active bar membership", "4+ years of corporate law firm or in-house legal experience", "Excellent drafting and contract negotiation skills"],
    },
    {
      title: "Legal Operations Analyst",
      company: "Linklaters",
      logo: "📝",
      location: "London, England, UK (Remote)",
      type: "Full-time",
      salary: "$80k - $110k",
      description: "Analyze, optimize, and manage internal legal workflows, technological tools, and compliance reports to support our global legal network.",
      requirements: ["Bachelor's degree in Legal Studies, Business, or IT", "Experience implementing legal tech software", "Strong analytical and organizational skills"],
    }
  ],
  Science: [
    {
      title: "Remote Bioinformatician",
      company: "Pfizer",
      logo: "🔬",
      location: "New York City, New York, USA",
      type: "Full-time",
      salary: "$115k - $150k",
      description: "Pfizer is looking for a Remote Bioinformatician to analyze large-scale genomic datasets, develop computational pipelines, and support target discovery efforts within our oncology research team.",
      requirements: ["PhD in Bioinformatics, Computational Biology, or relevant field", "Proficiency in Python/R, bash scripting, and cloud computing (AWS)", "Experience with genomic sequencing and computational pipelines"],
    },
    {
      title: "Clinical Data Scientist",
      company: "IQVIA",
      logo: "🧪",
      location: "Durham, North Carolina, USA (Remote)",
      type: "Contract",
      salary: "$120k - $155k",
      description: "Apply machine learning and statistical modeling to historical clinical trial datasets to discover predictive biomarkers and optimize recruitment strategies.",
      requirements: ["Master's or PhD in Statistics, Data Science, or Biostatistics", "Strong programming in Python and SQL", "Experience working with healthcare or clinical trials data"],
    }
  ]
};

const syncExternalJobs = async () => {
  console.log('🔄 Starting Job Syncing from External API (Remotive)...');
  const results = {
    checked: 0,
    added: 0,
    skipped: 0,
    errors: [],
  };

  try {
    // 1. Ensure System Recruiter Employer Profile exists in MongoDB
    let systemEmployer = await User.findOne({ email: 'praveen542spk@gmail.com', role: 'employer' });
    if (!systemEmployer) {
      systemEmployer = await User.findOne({ email: 'system-employer@talenthub.com' });
    }

    if (!systemEmployer) {
      console.log('👤 Creating default System Recruiter profile...');
      systemEmployer = await User.create({
        name: 'System Recruiter',
        email: 'system-employer@talenthub.com',
        password: 'TalentHub_System_Password_2026!',
        role: 'employer',
        company: 'Remotive Remote Jobs',
        companyWebsite: 'https://remotive.com',
        companyDescription: 'Automated job syncer delivering fresh remote vacancies worldwide.',
        companySize: '500+',
        location: 'Remote, Worldwide',
        avatar: '🤖',
      });
      console.log('✅ System Recruiter created successfully.');
    }

    // 2. Fetch jobs from Remotive Public API (All active remote jobs)
    const response = await fetch('https://remotive.com/api/remote-jobs');
    if (!response.ok) {
      throw new Error(`Remotive API responded with status: ${response.status}`);
    }

    const data = await response.json();
    if (!data.jobs || !Array.isArray(data.jobs)) {
      throw new Error('Invalid API response format: "jobs" array not found.');
    }

    results.checked = data.jobs.length;
    console.log(`📡 Fetched ${data.jobs.length} jobs from Remotive API. Parsing...`);

    // 3. Process each job and save to MongoDB if not a duplicate
    let addedInThisRun = 0;
    for (const apiJob of data.jobs) {
      if (addedInThisRun >= 150) {
        console.log("🚀 Reached maximum import limit of 150 new jobs in this run. Stopping.");
        break;
      }
      try {
        const title = apiJob.title;
        const company = apiJob.company_name;

        // Check if job already exists in our database
        const existingJob = await Job.findOne({ title, company });

        if (existingJob) {
          results.skipped++;
          continue;
        }

        // Map categories and types safely
        const category = mapCategory(apiJob.category);
        const type = mapType(apiJob.job_type);
        const logo = getCompanyLogoEmoji(company); // using a premium emoji logo for variety

        // Parse and clean tags into skills
        const skills = Array.isArray(apiJob.tags) ? apiJob.tags : [];
        const requirements = Array.isArray(apiJob.tags) && apiJob.tags.length > 0 
          ? apiJob.tags.map(tag => `Strong familiarity with ${tag}`)
          : ['Proven experience in a similar role', 'Excellent communication and teamwork skills', 'Ability to work independently in a remote setting'];

        // Clean raw HTML description to beautiful plain text
        const description = cleanHtml(apiJob.description);

        const newJob = await Job.create({
          title: title.substring(0, 150),
          company,
          logo,
          employer: systemEmployer._id,
          description: description.substring(0, 9990),
          requirements,
          benefits: [
            'Fully Remote working arrangement',
            'Competitive compensation packages',
            'Flexible working hours & locations',
            'Professional growth and development support',
          ],
          skills,
          location: apiJob.candidate_required_location || 'Remote (Worldwide)',
          remote: 'Fully Remote',
          type,
          category,
          salary: apiJob.salary || 'Not specified',
          applyEmail: 'system-employer@talenthub.com',
          status: 'active',
          featured: Math.random() > 0.7, // 30% chance to feature the job for premium look
          createdAt: apiJob.publication_date ? new Date(apiJob.publication_date) : new Date(),
        });

        // ── Real-Time Broadcast using Supabase Realtime ────────────────────
        try {
          await supabase.channel('jobs').send({
            type: 'broadcast',
            event: 'job_created',
            payload: {
              _id: newJob._id,
              title: newJob.title,
              company: newJob.company,
              logo: newJob.logo,
              location: newJob.location,
              type: newJob.type,
              remote: newJob.remote,
              category: newJob.category,
              salary: newJob.salary,
              featured: newJob.featured,
              status: newJob.status,
              posted: 'Just now',
              isNew: true,
            },
          });
        } catch (broadcastErr) {
          console.error('⚠️ Supabase Realtime broadcast failed:', broadcastErr.message);
        }

        results.added++;
        addedInThisRun++;
      } catch (jobErr) {
        console.error(`❌ Error parsing job "${apiJob.title}":`, jobErr.message);
      }
    }


    // 4. Fallback Category Seeder: Ensure ALL categories have at least 2-3 jobs
    const categoriesToSeed = ['Finance', 'Healthcare', 'Education', 'Legal', 'Science'];
    for (const catName of categoriesToSeed) {
      const count = await Job.countDocuments({ category: catName, status: 'active' });
      if (count < 2) {
        console.log(`🌱 Seeding fallback jobs for under-populated category: ${catName}`);
        const mockList = MOCK_JOBS_BY_CATEGORY[catName] || [];
        for (const mockJob of mockList) {
          // Check if mock job already exists
          const existingMock = await Job.findOne({ title: mockJob.title, company: mockJob.company });
          if (!existingMock) {
            await Job.create({
              title: mockJob.title,
              company: mockJob.company,
              logo: mockJob.logo,
              employer: systemEmployer._id,
              description: mockJob.description,
              requirements: mockJob.requirements,
              benefits: [
                'Fully Remote working arrangement',
                'Comprehensive medical, dental, and vision insurance',
                'Flexible working hours & location support',
                'Annual learning & development stipend',
              ],
              skills: mockJob.requirements.map(r => r.split(' ').slice(-1)[0].replace(/[^a-zA-Z]/g, '')).filter(Boolean),
              location: mockJob.location,
              remote: 'Fully Remote',
              type: mockJob.type,
              category: catName,
              salary: mockJob.salary,
              applyEmail: 'system-employer@talenthub.com',
              status: 'active',
              featured: true,
              createdAt: new Date(),
            });
            results.added++;
          }
        }
      }
    }

    // 5. Fallback Job Type Seeder: Ensure we have high-quality remote Internships!
    const internshipCount = await Job.countDocuments({ type: 'Internship', status: 'active' });
    if (internshipCount < 4) {
      console.log('🌱 Seeding fallback Internship jobs...');
      const mockInternships = [
        {
          title: "Remote Software Engineering Intern",
          company: "Google",
          logo: "🌐",
          location: "Remote (US/Canada)",
          type: "Internship",
          category: "Engineering",
          salary: "$45 - $60 / hr",
          description: "Google is offering a remote software engineering internship. You will work on real-world projects, write production-level code, and collaborate with seasoned software engineers to build scalable tools.",
          requirements: ["Currently pursuing a BS, MS, or PhD in Computer Science or related fields", "Experience with Java, Python, C++, or Go", "Familiarity with data structures, algorithms, and software design"],
        },
        {
          title: "Remote AI & Deep Learning Intern",
          company: "Google DeepMind",
          logo: "🧠",
          location: "Remote (UK/Europe)",
          type: "Internship",
          category: "Science",
          salary: "$50 - $70 / hr",
          description: "Join Google DeepMind as an AI research intern. You will assist in developing state-of-the-art neural architectures, train large language models, and write clean, reproducible PyTorch research code.",
          requirements: ["Enrolled in a PhD program focusing on Machine Learning or Deep Learning", "Proficiency in Python and PyTorch/Jax", "Published work in NeurIPS, ICML, or CVPR is a huge plus"],
        },
        {
          title: "Remote Product Design Intern",
          company: "Figma",
          logo: "🎨",
          location: "Remote (Worldwide)",
          type: "Internship",
          category: "Design",
          salary: "$40 - $55 / hr",
          description: "Figma is seeking a Remote Product Design Intern. You will help craft interactive prototypes, conduct user research, and iterate on UI design systems to make Figma the best collaborative tool in the world.",
          requirements: ["Portfolio demonstrating strong visual and interaction design skills", "Proficiency in using Figma", "Currently enrolled in a design program or self-taught with solid projects"],
        },
        {
          title: "Remote Developer Relations Intern",
          company: "Spotify",
          logo: "🎧",
          location: "Remote (US/Europe)",
          type: "Internship",
          category: "Marketing",
          salary: "$35 - $48 / hr",
          description: "Spotify is looking for a DevRel Intern. You will write code samples, write beginner-friendly API documentation, and help developers globally build wonderful integrations on the Spotify Web API.",
          requirements: ["Basic programming skills in JavaScript or Python", "Excellent writing and communication skills", "Active participant in developer communities or hackathons"],
        }
      ];

      for (const mockJob of mockInternships) {
        const existingMock = await Job.findOne({ title: mockJob.title, company: mockJob.company });
        if (!existingMock) {
          await Job.create({
            title: mockJob.title,
            company: mockJob.company,
            logo: mockJob.logo,
            employer: systemEmployer._id,
            description: mockJob.description,
            requirements: mockJob.requirements,
            benefits: [
              '100% remote working hours',
              'Mentorship program with senior staff',
              'Subsidized home-office equipment allowance',
              'High chance of full-time conversion offer upon graduation',
            ],
            skills: mockJob.requirements.map(r => r.split(' ').slice(-1)[0].replace(/[^a-zA-Z]/g, '')).filter(Boolean),
            location: mockJob.location,
            remote: 'Fully Remote',
            type: 'Internship',
            category: mockJob.category,
            salary: mockJob.salary,
            applyEmail: 'system-employer@talenthub.com',
            status: 'active',
            featured: true,
            createdAt: new Date(),
          });
          results.added++;
        }
      }
    }

    // 6. Indian Tech Giants Seeder: Seeding premium roles from Zoho, TCS, and Infosys!
    console.log('🌱 Seeding fallback Indian Tech Giants (Zoho, TCS, Infosys) jobs...');
    const indianGiantsJobs = [
      {
        title: "Remote Associate Software Engineer",
        company: "Zoho",
        logo: "🚀",
        location: "Chennai, Tamil Nadu, India (Remote)",
        type: "Full-time",
        category: "Engineering",
        salary: "₹6L - ₹10L PA",
        description: "Zoho is seeking a Remote Associate Software Engineer to join our creator team. You will work on building scale-resilient cloud applications, optimize web services, and write clean, structured code in Java or Node.js.",
        requirements: ["Bachelor's degree in CS, IT, or equivalent practical experience", "Strong understanding of OOPs concepts and database fundamentals", "Familiarity with HTML, CSS, JavaScript, and Java/C++"],
      },
      {
        title: "Remote UI/UX Design Intern",
        company: "Zoho",
        logo: "🎨",
        location: "Chennai, Tamil Nadu, India (Remote)",
        type: "Internship",
        category: "Design",
        salary: "₹25,000 / month",
        description: "Join Zoho as a Remote UI/UX Design Intern! You will collaborate closely with product managers and engineers to craft high-fidelity wireframes, conduct user research, and build outstanding interfaces in Figma.",
        requirements: ["Strong portfolio showing creative product design thinking", "Excellent knowledge of Figma and design principles", "Good communication and collaborative spirit"],
      },
      {
        title: "Remote Cloud Infrastructure Engineer",
        company: "TCS",
        logo: "💼",
        location: "Mumbai, Maharashtra, India (Remote)",
        type: "Full-time",
        category: "Engineering",
        salary: "₹8L - ₹12L PA",
        description: "TCS is looking for a Remote Cloud Infrastructure Engineer. You will help manage our corporate AWS/Azure deployments, automate deployment pipelines using Jenkins and Terraform, and ensure 99.9% system uptime.",
        requirements: ["3+ years of experience in DevOps or Cloud Administration", "Certified in AWS SysOps or Azure Administrator", "Strong scripting knowledge in Bash or Python"],
      },
      {
        title: "Remote Business Analyst Intern",
        company: "TCS",
        logo: "📊",
        location: "Mumbai, Maharashtra, India (Remote)",
        type: "Internship",
        category: "Finance",
        salary: "₹20,000 / month",
        description: "TCS is seeking a Remote Business Analyst Intern. You will support our consulting arm by organizing project data, drafting status decks, and compiling business requirement documents (BRD).",
        requirements: ["Currently pursuing an MBA or B.Com/BBA", "Advanced knowledge of MS Excel and PowerPoint", "Analytical mind with exceptional problem-solving skills"],
      },
      {
        title: "Remote Full-Stack Web Developer",
        company: "Infosys",
        logo: "💻",
        location: "Bangalore, Karnataka, India (Remote)",
        type: "Full-time",
        category: "Engineering",
        salary: "₹7L - ₹11L PA",
        description: "Infosys is seeking a Remote Full-Stack Web Developer. You will be responsible for building responsive frontend layouts in React.js and robust backend REST APIs using Node.js/Express and MongoDB.",
        requirements: ["2+ years of software development experience", "Strong skills in MERN stack development", "Familiarity with git version control and Agile methodologies"],
      },
      {
        title: "Remote Digital Marketing Intern",
        company: "Infosys",
        logo: "⚡",
        location: "Bangalore, Karnataka, India (Remote)",
        type: "Internship",
        category: "Marketing",
        salary: "₹18,000 / month",
        description: "Infosys is offering a Remote Digital Marketing Internship. You will support our branding teams by drafting engaging social media content, tracking analytics, and planning online marketing campaigns.",
        requirements: ["Enrolled in or completed a degree in Marketing, Communications, or Business", "Basic knowledge of SEO, Google Analytics, and social media platforms", "Creative copywriter with excellent editing skills"],
      }
    ];

    for (const mockJob of indianGiantsJobs) {
      const existingMock = await Job.findOne({ title: mockJob.title, company: mockJob.company });
      if (!existingMock) {
        await Job.create({
          title: mockJob.title,
          company: mockJob.company,
          logo: mockJob.logo,
          employer: systemEmployer._id,
          description: mockJob.description,
          requirements: mockJob.requirements,
          benefits: [
            'Fully Remote working flexibility',
            'Corporate healthcare cover',
            'Structured training and mentorship programs',
            'Excellent career progression paths',
          ],
          skills: mockJob.requirements.map(r => r.split(' ').slice(-1)[0].replace(/[^a-zA-Z]/g, '')).filter(Boolean),
          location: mockJob.location,
          remote: 'Fully Remote',
          type: mockJob.type,
          category: mockJob.category,
          salary: mockJob.salary,
          applyEmail: 'system-employer@talenthub.com',
          status: 'active',
          featured: true,
          createdAt: new Date(),
        });
        results.added++;
      }
    }

    // 7. Indian Startups & Freshman Internships Seeder: Seeding Swiggy, Zomato, Flipkart, Paytm, Wipro, etc.
    console.log('🌱 Seeding fallback Indian Startups & Freshman Internships...');
    const indianStartupsJobs = [
      {
        title: "Remote Customer Support Intern (Ideal for 1st Year Students)",
        company: "Swiggy",
        logo: "🍔",
        location: "Bangalore, Karnataka, India (Remote)",
        type: "Internship",
        category: "Other",
        salary: "₹15,000 / month",
        description: "Swiggy is seeking Remote Customer Support Interns. This role is explicitly open for 1st-year college students! You will help resolve customer queries, coordinate with delivery partners, and maintain high service quality. No technical background or prior experience required. Flexible working hours that fit your college schedule!",
        requirements: ["Currently enrolled in the 1st or 2nd year of any college degree", "Good English communication and active listening skills", "Empathetic attitude and desire to learn corporate communications"],
      },
      {
        title: "Remote Content Writer Intern (Open to College Freshmen)",
        company: "Zomato",
        logo: "🍕",
        location: "Gurgaon, Haryana, India (Remote)",
        type: "Internship",
        category: "Marketing",
        salary: "₹18,000 / month",
        description: "Join Zomato as a Remote Content Writer Intern! Ideal for 1st-year students passionate about food, blogging, and creative writing. You will draft catchy restaurant bios, write engaging social media copy, and verify menu descriptions. A fantastic opportunity to build your creative writing portfolio!",
        requirements: ["1st year college students of any stream are highly encouraged to apply", "Excellent written English skills with a creative flair", "Basic familiarity with Google Docs and MS Office"],
      },
      {
        title: "Remote Graphic Design Intern (1st Year Students Welcome)",
        company: "Paytm",
        logo: "💸",
        location: "Noida, Uttar Pradesh, India (Remote)",
        type: "Internship",
        category: "Design",
        salary: "₹16,000 / month",
        description: "Paytm is seeking a Remote Graphic Design Intern. This position is open for creative 1st-year college students who want to build a career in design! You will create simple social media banners, promotional posters, and support the branding team. Learn and grow under seasoned art directors!",
        requirements: ["1st/2nd year students with a basic creative portfolio", "Familiarity with Canva, Adobe Photoshop, or Figma", "Eagerness to learn corporate graphic design standards"],
      },
      {
        title: "Remote Frontend Development Intern (College Freshman Friendly)",
        company: "Razorpay",
        logo: "💳",
        location: "Bangalore, Karnataka, India (Remote)",
        type: "Internship",
        category: "Engineering",
        salary: "₹22,000 / month",
        description: "Razorpay is seeking a Remote Frontend Intern. We highly welcome 1st and 2nd year engineering/science students who are learning web technologies! You will work on building simple, beautiful user interfaces, write clean HTML/CSS/JavaScript, and learn React.js alongside senior mentors.",
        requirements: ["1st or 2nd year college students learning web development", "Basic knowledge of HTML, CSS, and vanilla JavaScript", "Excitement for payment gateways and modern fintech software"],
      },
      {
        title: "Remote Catalog Quality Intern (Open for 1st Year Students)",
        company: "Flipkart",
        logo: "🛒",
        location: "Bangalore, Karnataka, India (Remote)",
        type: "Internship",
        category: "Other",
        salary: "₹14,000 / month",
        description: "Flipkart is hiring a Remote Catalog Quality Intern. This role is 100% open for 1st-year college students looking for part-time remote work. You will review product catalogs on our e-commerce site, verify image quality, and check product descriptions for accuracy. Work from the comfort of your home!",
        requirements: ["Currently a 1st year college student looking for remote corporate experience", "High attention to detail and organized nature", "Familiarity with browsing and buying on e-commerce platforms"],
      },
      {
        title: "Remote Technical Writing Intern (Freshman Friendly)",
        company: "Wipro",
        logo: "🌐",
        location: "Bangalore, Karnataka, India (Remote)",
        type: "Internship",
        category: "Marketing",
        salary: "₹17,000 / month",
        description: "Wipro is seeking a Remote Technical Writing Intern. This position is ideal for 1st-year college students from English, Communications, or Engineering streams who want to learn how to document software systems. You will assist in drafting user guides, documentation sheets, and FAQs.",
        requirements: ["1st/2nd year college students who write clearly and concisely", "Good reading comprehension and willingness to learn tech systems", "No coding skills required"],
      },
      {
        title: "Remote Operations Coordinator Intern",
        company: "Ola",
        logo: "🚗",
        location: "Bangalore, Karnataka, India (Remote)",
        type: "Internship",
        category: "Other",
        salary: "₹15,000 / month",
        description: "Ola is looking for a Remote Operations Coordinator Intern. This role is a great fit for 1st year students who want to understand high-speed operations. You will assist in tracking driver onboarding databases, monitoring daily ticket counts, and compiling Excel sheets.",
        requirements: ["1st year college students with basic knowledge of MS Excel", "Good problem-solving ability and quick responder", "Ability to dedicate 4-5 hours daily remotely"],
      },
      {
        title: "Remote IT Infrastructure Support Associate",
        company: "HCLTech",
        logo: "💻",
        location: "Noida, Uttar Pradesh, India",
        type: "Full-time",
        category: "Engineering",
        salary: "₹5.5L - ₹8.5L PA",
        description: "HCLTech is seeking an IT Infrastructure Support Associate to work remotely. You will assist corporate clients in configuring remote VPNs, troubleshooting software configurations, and resolving network connection tickets.",
        requirements: ["Bachelor's degree in CS, BCA, or equivalent tech diploma", "Good understanding of computer hardware, OS, and networking", "Excellent customer support and communication skills"],
      },
      {
        title: "Remote Associate Product Analyst",
        company: "Swiggy",
        logo: "📦",
        location: "Bangalore, Karnataka, India",
        type: "Full-time",
        category: "Engineering",
        salary: "₹9L - ₹13L PA",
        description: "Swiggy is looking for an Associate Product Analyst. You will analyze customer delivery funnels, map restaurant conversion rates, and use SQL/Tableau to help product managers design a more engaging Swiggy experience.",
        requirements: ["1+ years of analytics experience or fresh graduate with strong SQL skills", "Proficiency in Excel, SQL, and data visualization tools", "Strong logical and statistical reasoning"],
      },
      {
        title: "Remote Talent Acquisition Associate",
        company: "Cognizant",
        logo: "🏢",
        location: "Chennai, Tamil Nadu, India (Remote)",
        type: "Full-time",
        category: "Other",
        salary: "₹4L - ₹6.5L PA",
        description: "Cognizant is hiring a Remote Talent Acquisition Associate. You will be responsible for sourcing candidate resumes, scheduling virtual interviews, and coordinating onboarding documentation across engineering teams.",
        requirements: ["Graduate in any stream (MBA HR preferred but not mandatory)", "Excellent organizational and time management skills", "Strong communication and relationship-building abilities"],
      }
    ];

    for (const mockJob of indianStartupsJobs) {
      const existingMock = await Job.findOne({ title: mockJob.title, company: mockJob.company });
      if (!existingMock) {
        await Job.create({
          title: mockJob.title,
          company: mockJob.company,
          logo: mockJob.logo,
          employer: systemEmployer._id,
          description: mockJob.description,
          requirements: mockJob.requirements,
          benefits: [
            'Fully Remote working flexibility',
            'Mentorship from industry specialists',
            'Subsidized home-office or learning allowance',
            'High possibility of full-time PPO conversion based on merit',
          ],
          skills: mockJob.requirements.map(r => r.split(' ').slice(-1)[0].replace(/[^a-zA-Z]/g, '')).filter(Boolean),
          location: mockJob.location,
          remote: 'Fully Remote',
          type: mockJob.type,
          category: mockJob.category,
          salary: mockJob.salary,
          applyEmail: 'system-employer@talenthub.com',
          status: 'active',
          featured: true,
          createdAt: new Date(),
        });
        results.added++;
      }
    }

    // 8. Tamil Nadu & Chennai Engineering Jobs & Internships (1st-4th Year, Paid & Free)
    console.log('🌱 Seeding fallback Tamil Nadu & Chennai Engineering Jobs...');
    const tamilNaduJobs = [
      {
        title: "Remote Software Engineering Intern (3rd & 4th Year)",
        company: "Freshworks (Chennai)",
        logo: "🍀",
        location: "Chennai, Tamil Nadu",
        type: "Internship",
        category: "Engineering",
        salary: "₹30,000 / month",
        description: "Freshworks Chennai is seeking a Software Engineering Intern. This role is highly recommended for 3rd and 4th-year engineering students! You will work on writing production code in Ruby on Rails, React.js, or Java, participate in standups, and deploy features to our customer support cloud platforms.",
        requirements: ["3rd or 4th year B.E / B.Tech / MCA students", "Strong basics in data structures, algorithms, and web technologies", "Prior projects built in React, Node.js, or Python"],
      },
      {
        title: "Remote QA Testing Intern (Open to 1st - 4th Year)",
        company: "Chargebee (Chennai)",
        logo: "🐝",
        location: "Chennai, Tamil Nadu",
        type: "Internship",
        category: "Engineering",
        salary: "₹20,000 / month",
        description: "Join Chargebee as a Remote QA Testing Intern! This internship is open to all engineering students from 1st year to 4th year who want to learn software testing and quality assurance. You will draft test cases, conduct manual web testing, and write automated test scripts using Selenium and Java.",
        requirements: ["Enrolled in B.E/B.Tech (CS, IT, ECE) - open to all college years!", "Basic logical thinking and knowledge of manual testing concepts", "Willingness to learn automation tools and scripting"],
      },
      {
        title: "Remote Low-Code App Developer Intern (1st & 2nd Year)",
        company: "Kissflow (Chennai)",
        logo: "🌸",
        location: "Chennai, Tamil Nadu",
        type: "Internship",
        category: "Engineering",
        salary: "₹15,000 / month",
        description: "Kissflow is looking for a Remote Low-Code Developer Intern. Perfect for 1st-year and 2nd-year engineering students who want to build software without complex coding! You will design work-management pipelines, build drag-and-drop web interfaces, and help enterprise customers automate business flows.",
        requirements: ["1st or 2nd year B.E / B.Tech / BCA students", "Excitement for building software layouts and business flowcharts", "No advanced coding language prerequisites required!"],
      },
      {
        title: "Remote Embedded Systems Intern (3rd & 4th Year ECE/EEE)",
        company: "TVS Motor Company",
        logo: "🏍️",
        location: "Hosur, Tamil Nadu",
        type: "Internship",
        category: "Engineering",
        salary: "₹18,000 / month",
        description: "TVS Motor is seeking an Embedded Systems Intern. Ideal for 3rd and 4th-year ECE, EEE, or Mechatronics engineering students. You will assist in writing micro-controller firmwares, troubleshooting sensor communication, and designing IoT boards for our upcoming Electric Vehicle (EV) line.",
        requirements: ["3rd or 4th year engineering students in ECE, EEE, or relevant stream", "Basic knowledge of C programming and microcontrollers (Arduino, STM32)", "Familiarity with IoT protocols (MQTT, I2C, SPI)"],
      },
      {
        title: "Free Cloud Computing & AWS Intern (Training + Certificate - All Years)",
        company: "Freshworks (Chennai)",
        logo: "☁️",
        location: "Chennai, Tamil Nadu (Remote)",
        type: "Internship",
        category: "Engineering",
        salary: "Free (Certificate & Training)",
        description: "Freshworks is offering a Free Cloud Computing & AWS Training Internship. This unpaid, certified internship is open to all engineering students from 1st year to 4th year! You will undergo 8 weeks of hands-on cloud training, configure AWS databases, and receive a verified Internship Certificate upon completion to boost your resume credits.",
        requirements: ["Open to 1st, 2nd, 3rd, and 4th year college students of any engineering stream", "Access to a personal computer and internet connection", "Strong interest in AWS, Cloud Support, and DevOps"],
      },
      {
        title: "Free FinTech Java Developer Intern (Training + Certificate - All Years)",
        company: "Intellect Design Arena",
        logo: "🏛️",
        location: "Chennai, Tamil Nadu",
        type: "Internship",
        category: "Engineering",
        salary: "Free (Certificate & Training)",
        description: "Intellect Design Arena is seeking Java Developer Interns for a Free Training Internship. Open to all engineering streams from 1st to 4th year! This internship focuses on building fundamental Java, Spring Boot, and SQL skills inside real FinTech products. Includes dedicated mentorship and a verified corporate certificate.",
        requirements: ["Engineering students of any year looking for corporate training", "Basic conceptual understanding of Java programming and SQL database", "Ability to dedicate 3 hours daily remotely"],
      },
      {
        title: "Remote Junior Core Java Programmer",
        company: "Zoho",
        logo: "🚀",
        location: "Tenkasi, Tamil Nadu",
        type: "Full-time",
        category: "Engineering",
        salary: "₹8L - ₹12L PA",
        description: "Zoho is seeking a Remote Junior Core Java Programmer for our Tenkasi development center. You will work on writing high-performance multi-threaded server applications, optimize database indices, and design scalable SaaS backends in core Java.",
        requirements: ["Strong logic, problem-solving skills, and deep Java knowledge", "Good understanding of multi-threading, concurrency, and OOPs", "Any degree or self-taught developers are welcome"],
      },
      {
        title: "Remote Cyber Security Analyst Intern (2nd - 4th Year)",
        company: "Cognizant (Chennai)",
        logo: "🛡️",
        location: "Chennai, Tamil Nadu",
        type: "Internship",
        category: "Engineering",
        salary: "₹20,000 / month",
        description: "Cognizant Chennai is hiring a Remote Cyber Security Intern. Open to 2nd, 3rd, and 4th-year engineering students! You will learn how to monitor network logs, detect threat vectors, run vulnerability scans, and configure firewalls under the guidance of our security operations team.",
        requirements: ["2nd, 3rd, or 4th year B.E/B.Tech (CS, IT, CyberSecurity)", "Basic knowledge of TCP/IP, Linux command line, and security concepts", "Certification in CCNA or CompTIA Security+ is a plus"],
      },
      {
        title: "Free AutoCAD & Mechanical Design Intern (All Years)",
        company: "Ashok Leyland",
        logo: "🚛",
        location: "Chennai, Tamil Nadu",
        type: "Internship",
        category: "Design",
        salary: "Free (Certificate & Mentorship)",
        description: "Ashok Leyland is offering a Free AutoCAD & Mechanical Design Training Internship. Open to all mechanical, automobile, and production engineering students from 1st to 4th year! You will learn high-fidelity 2D/3D part design using AutoCAD, draft mechanical schematics, and get mentored by senior automotive design engineers.",
        requirements: ["Open to 1st, 2nd, 3rd, and 4th year students of Mechanical/Auto streams", "Basic knowledge of engineering graphics or AutoCAD", "Desire to build a strong mechanical design portfolio"]
      }
    ];

    for (const mockJob of tamilNaduJobs) {
      const existingMock = await Job.findOne({ title: mockJob.title, company: mockJob.company });
      if (!existingMock) {
        await Job.create({
          title: mockJob.title,
          company: mockJob.company,
          logo: mockJob.logo,
          employer: systemEmployer._id,
          description: mockJob.description,
          requirements: mockJob.requirements,
          benefits: [
            'Fully Remote working flexibility',
            'Dedicated corporate mentorship & review',
            'Verified corporate certificate upon completion',
            'PPO or full-time offer conversion potential',
          ],
          skills: mockJob.requirements.map(r => r.split(' ').slice(-1)[0].replace(/[^a-zA-Z]/g, '')).filter(Boolean),
          location: mockJob.location,
          remote: 'Fully Remote',
          type: mockJob.type,
          category: mockJob.category,
          salary: mockJob.salary,
          applyEmail: 'system-employer@talenthub.com',
          status: 'active',
          featured: true,
          createdAt: new Date(),
        });
        results.added++;
      }
    }

    // 9. Additional Global Premium Jobs Seeder: Seeding OpenAI, Netflix, Tesla, Airbnb, Amazon, Apple, Microsoft, etc.
    console.log('🌱 Seeding fallback Additional Global Premium Jobs...');
    const additionalGlobalPremiumJobs = [
      {
        title: "Remote AI Safety & Alignment Engineer",
        company: "OpenAI",
        logo: "🤖",
        location: "San Francisco, California, USA",
        type: "Full-time",
        category: "Engineering",
        salary: "$180k - $240k",
        description: "OpenAI is seeking an AI Safety and Alignment Engineer to join our safety team. You will design reinforcement learning from human feedback (RLHF) pipelines, build safety wrappers, and evaluate large-scale neural architectures for safety compliance.",
        requirements: ["Proficiency in Python and deep learning frameworks (PyTorch, JAX)", "Strong understanding of LLMs, RLHF, and transformer architectures", "Experience conducting alignment research or safety benchmarking"],
      },
      {
        title: "Remote Senior Product Designer",
        company: "Airbnb",
        logo: "🏡",
        location: "San Francisco, California, USA (Remote)",
        type: "Full-time",
        category: "Design",
        salary: "$140k - $185k",
        description: "Airbnb is looking for a Senior Product Designer. You will design seamless user journeys, craft highly collaborative guest/host features, and iterate on our award-winning design system to create magical travel experiences.",
        requirements: ["5+ years of shipping consumer-facing product designs", "Exceptional visual craft and interaction design skills in Figma", "Experience conducting user research and rapid prototyping"],
      },
      {
        title: "Remote Autopilot QA Automation Engineer",
        company: "Tesla",
        logo: "⚡",
        location: "Palo Alto, California, USA",
        type: "Full-time",
        category: "Engineering",
        salary: "$130k - $170k",
        description: "Tesla is seeking an Autopilot QA Automation Engineer. You will design, build, and maintain automation test suites for our autopilot hardware-in-the-loop (HIL) systems, analyzing telemetry datasets, and writing robust Python scripts.",
        requirements: ["3+ years of automation testing or software development in Python/C++", "Experience with Linux environments and git version control", "Familiarity with hardware/software integration and testing paradigms"],
      },
      {
        title: "Remote AWS Solutions Architect",
        company: "Amazon",
        logo: "📦",
        location: "Seattle, Washington, USA (Remote)",
        type: "Full-time",
        category: "Engineering",
        salary: "$150k - $195k",
        description: "Amazon Web Services (AWS) is looking for a Solutions Architect. You will help enterprise customers design highly scalable, fault-tolerant, and secure cloud infrastructures using the full suite of AWS services.",
        requirements: ["Certified AWS Solutions Architect - Associate or Professional", "3+ years of experience designing and deploying cloud systems", "Strong scripting and automation skills (Terraform, Python, Bash)"],
      },
      {
        title: "Remote Senior Frontend Engineer (React)",
        company: "Netflix",
        logo: "🍿",
        location: "Los Gatos, California, USA (Remote)",
        type: "Full-time",
        category: "Engineering",
        salary: "$160k - $210k",
        description: "Netflix is seeking a Senior Frontend Engineer to join our streaming experience team. You will write high-performance, modular React.js code, optimize rendering speeds, and build interactive user layouts accessed by 200M+ users globally.",
        requirements: ["5+ years of experience in modern frontend development", "Expertise in React, Redux, and modern JavaScript/CSS frameworks", "Deep understanding of browser performance and asset optimization"],
      },
      {
        title: "Remote Cybersecurity Consultant",
        company: "Microsoft",
        logo: "💻",
        location: "Redmond, Washington, USA (Remote)",
        type: "Full-time",
        category: "Engineering",
        salary: "$140k - $180k",
        description: "Microsoft is looking for a Remote Cybersecurity Consultant. You will assist corporate clients in designing threat-protection architectures, auditing Azure Active Directory systems, and configuring Sentinel SIEM platforms.",
        requirements: ["3+ years in cybersecurity engineering or consulting", "Certified in Microsoft SC-100 or CISSP", "Strong scripting skills for log analysis and automation"],
      },
      {
        title: "Remote iOS Developer",
        company: "Apple",
        logo: "🍏",
        location: "Cupertino, California, USA (Remote)",
        type: "Full-time",
        category: "Engineering",
        salary: "$150k - $190k",
        description: "Apple is seeking a remote iOS Developer. You will design, build, and optimize applications for the Apple Ecosystem, writing clean, structured Swift code, and collaborating with designers to implement human interface guidelines.",
        requirements: ["3+ years of experience in native iOS development using Swift", "Strong portfolio of published apps on the App Store", "Familiarity with CoreData, SwiftUI, and REST API integration"],
      },
      {
        title: "Remote Data Analyst",
        company: "Uber",
        logo: "🚗",
        location: "San Francisco, California, USA",
        type: "Full-time",
        category: "Engineering",
        salary: "$110k - $145k",
        description: "Uber is looking for a Data Analyst to join our marketplace operations. You will analyze ride-matching efficiency, map driver-supply conversion rates, and use SQL/Tableau to help product managers design a more engaging Uber experience.",
        requirements: ["2+ years of experience in data analytics or business intelligence", "Advanced proficiency in SQL and Excel", "Experience with R or Python for statistical analysis"],
      },
      {
        title: "Remote Customer Success Specialist",
        company: "Slack",
        logo: "💬",
        location: "San Francisco, California, USA (Remote)",
        type: "Full-time",
        category: "Marketing",
        salary: "$85k - $115k",
        description: "Slack is hiring a Customer Success Specialist. You will guide corporate clients in configuring Slack channels, integrating productivity apps, and ensuring maximum collaboration efficiency across their global teams.",
        requirements: ["2+ years of experience in SaaS customer success or support", "Exceptional communication and relationship-building skills", "Familiarity with enterprise software deployment workflows"],
      },
      {
        title: "Remote Creator Partnerships Specialist",
        company: "TikTok",
        logo: "🎵",
        location: "Los Angeles, California, USA (Remote)",
        type: "Full-time",
        category: "Marketing",
        salary: "$90k - $125k",
        description: "TikTok is seeking a Creator Partnerships Specialist. You will scout top-tier creators, negotiate branding contracts, and guide creators on how to leverage TikTok's organic tools to build high-growth campaigns.",
        requirements: ["2+ years of experience in influencer marketing or talent management", "Deep understanding of social media trends and creator ecosystem", "Strong negotiation and communication skills"],
      }
    ];
    for (const mockJob of additionalGlobalPremiumJobs) {
      const existingMock = await Job.findOne({ title: mockJob.title, company: mockJob.company });
      if (!existingMock) {
        await Job.create({
          title: mockJob.title,
          company: mockJob.company,
          logo: mockJob.logo,
          employer: systemEmployer._id,
          description: mockJob.description,
          requirements: mockJob.requirements,
          benefits: [
            'Fully Remote working flexibility',
            'Comprehensive corporate health coverage',
            'Home-office equipment and learning allowance',
            'Competitive equity and stock options schemes',
          ],
          skills: mockJob.requirements.map(r => r.split(' ').slice(-1)[0].replace(/[^a-zA-Z]/g, '')).filter(Boolean),
          location: mockJob.location,
          remote: 'Fully Remote',
          type: mockJob.type,
          category: mockJob.category,
          salary: mockJob.salary,
          applyEmail: 'system-employer@talenthub.com',
          status: 'active',
          featured: true,
          createdAt: new Date(),
        });
        results.added++;
      }
    }


    // 10. Curated Seeder: 52 premium Indian and Global tech jobs to guarantee 100+ total active listings
    console.log('🌱 Seeding 52 additional premium curated Indian & Global jobs...');
    const extraPremiumJobs = [
      {
        title: "Remote Operations Intern (1st-4th Year)",
        company: "Zepto",
        logo: "⚡",
        location: "Bangalore, Karnataka, India",
        type: "Internship",
        category: "Other",
        salary: "₹15,000 / month",
        description: "Zepto is hiring Remote Operations Interns. Open to all college years, especially 1st and 2nd-year students looking for fast-paced operational experience. You will coordinate with delivery hubs, track rider allocations, and help resolve dispatch delays.",
        requirements: ["Open to 1st, 2nd, 3rd, and 4th-year college students", "Basic knowledge of MS Excel and good problem-solving skills", "Fast learner and clear communicator in Tanglish or English"],
      },
      {
        title: "Remote Delivery Management Coordinator",
        company: "Blinkit",
        logo: "🛒",
        location: "Gurgaon, Haryana, India",
        type: "Internship",
        category: "Other",
        salary: "₹18,000 / month",
        description: "Join Blinkit as a Remote Delivery Coordinator! You will monitor our quick-commerce delivery timelines, compile daily fulfillment reports, and help customer support teams track order status in real time.",
        requirements: ["Completed or currently pursuing any degree", "Excellent organization and high attention to detail", "Strong familiarity with online grocery and quick-commerce delivery"],
      },
      {
        title: "Remote React.js Developer",
        company: "PhonePe",
        logo: "📱",
        location: "Bangalore, Karnataka, India (Remote)",
        type: "Full-time",
        category: "Engineering",
        salary: "₹8L - ₹13L PA",
        description: "PhonePe is looking for a React.js Developer. You will build and optimize user-facing transaction pages, integrate unified payments APIs, and write clean, modular React code for our web applications.",
        requirements: ["1+ years of experience in React.js and modern frontend workflows", "Deep understanding of state management tools like Redux or Context API", "Experience in building responsive, high-fidelity mobile-first layouts"],
      },
      {
        title: "Remote QA Automation Intern (All Years)",
        company: "PhonePe",
        logo: "🛡️",
        location: "Bangalore, Karnataka, India",
        type: "Internship",
        category: "Engineering",
        salary: "₹25,000 / month",
        description: "PhonePe is seeking a QA Automation Intern. You will write automated end-to-end integration tests using Cypress and Selenium, verify API endpoints, and collaborate closely with developers to ensure top-tier payment security.",
        requirements: ["B.E / B.Tech / MCA students of any year", "Basic knowledge of Java or JavaScript and Selenium concepts", "Analytical mind with high attention to detail"],
      },
      {
        title: "Remote Content Curator Intern (1st Year Friendly)",
        company: "Meesho",
        logo: "🛍️",
        location: "Bangalore, Karnataka, India",
        type: "Internship",
        category: "Marketing",
        salary: "₹14,000 / month",
        description: "Meesho is offering a Remote Content Curator Internship. This role is exceptionally open for 1st-year college students! You will catalog e-commerce listings, write engaging product titles, and assist in reviewing supplier product images.",
        requirements: ["Currently enrolled in the 1st or 2nd year of any college degree", "Good English copywriting and reading skills", "Access to a personal computer and internet connection"],
      },
      {
        title: "Remote Frontend Intern (1st-4th Year)",
        company: "Meesho",
        logo: "💻",
        location: "Bangalore, Karnataka, India",
        type: "Internship",
        category: "Engineering",
        salary: "₹20,000 / month",
        description: "Join Meesho's engineering team as a Remote Frontend Intern. You will work on writing clean, modular HTML, CSS, and React components, helping build high-scale reseller features.",
        requirements: ["Pursuing B.E / B.Tech in CS/IT or equivalent web certifications", "Strong familiarity with HTML5, CSS3, ES6 JavaScript, and React.js", "Self-starter with passion for e-commerce UX"],
      },
      {
        title: "Remote Financial Operations Associate",
        company: "Groww",
        logo: "📈",
        location: "Bangalore, Karnataka, India (Remote)",
        type: "Full-time",
        category: "Finance",
        salary: "₹6L - ₹9L PA",
        description: "Groww is looking for a Financial Operations Associate. You will oversee daily stock transactions, assist in mutual fund reconciliations, and coordinate with banks and payment gateway platforms to ensure seamless user cashouts.",
        requirements: ["Bachelor's degree in Finance, Commerce, or Economics", "Excellent mathematical and analytical capabilities", "Knowledge of stock market operations and mutual fund systems is a plus"],
      },
      {
        title: "Remote Business Development Intern",
        company: "Upstox",
        logo: "📊",
        location: "Mumbai, Maharashtra, India",
        type: "Internship",
        category: "Finance",
        salary: "₹16,000 / month",
        description: "Upstox is seeking a Business Development Intern. You will organize investor leads, support marketing campaigns, and help coordinate customer onboarding queries regarding trading accounts.",
        requirements: ["Enrolled in BBA, B.Com, or MBA - open to all college years!", "Outstanding verbal communication and persuasive presentation skills", "Eager to learn modern fintech marketing"],
      },
      {
        title: "Remote Merchant Support Specialist",
        company: "BharatPe",
        logo: "💸",
        location: "Noida, Uttar Pradesh, India",
        type: "Full-time",
        category: "Other",
        salary: "₹4.5L - ₹6.5L PA",
        description: "BharatPe is seeking a Merchant Support Specialist. You will handle merchant account setups, troubleshoot QR code transaction logs, and resolve settlement disputes remotely.",
        requirements: ["Completed graduation in any stream", "Good active listening and problem-solving skills", "Prior customer service or merchant onboarding experience is preferred"],
      },
      {
        title: "Remote Supply Chain Analyst Intern",
        company: "Licious",
        logo: "🍖",
        location: "Bangalore, Karnataka, India",
        type: "Internship",
        category: "Other",
        salary: "₹15,000 / month",
        description: "Licious is seeking a Supply Chain Intern. You will assist in tracking inventory databases, compiling cold-chain logistics logs, and optimizing daily delivery routes.",
        requirements: ["College students of any stream looking for operations experience", "Advanced knowledge of MS Excel and Google Sheets", "Highly organized with strong analytical mind"],
      },
      {
        title: "Remote Cloud Support Associate",
        company: "IBM",
        logo: "☁️",
        location: "Bangalore, Karnataka, India (Remote)",
        type: "Full-time",
        category: "Engineering",
        salary: "₹5.5L - ₹8.5L PA",
        description: "IBM is looking for a Cloud Support Associate. You will assist corporate clients in managing cloud container environments, troubleshooting Kubernetes clusters, and configuring secure storage pipelines.",
        requirements: ["B.E / B.Tech / MCA freshers with basic cloud certifications", "Familiarity with Linux OS, shell scripting, and basic networking", "Excellent verbal and written communication skills"],
      },
      {
        title: "Remote Python Developer Intern",
        company: "IBM",
        logo: "🐍",
        location: "Bangalore, Karnataka, India",
        type: "Internship",
        category: "Engineering",
        salary: "₹25,000 / month",
        description: "IBM is offering a Python Developer Internship. You will write robust backend scripts, automate server deployment pipelines, and help develop custom data analytics tools.",
        requirements: ["Engineering students of any year with strong programming basics", "Proficiency in Python and basic knowledge of SQL databases", "Familiarity with git version control"],
      },
      {
        title: "Remote Associate Software Engineer",
        company: "Accenture",
        logo: "🚀",
        location: "Bangalore, Karnataka, India (Remote)",
        type: "Full-time",
        category: "Engineering",
        salary: "₹5L - ₹8L PA",
        description: "Accenture is hiring an Associate Software Engineer. You will assist in building enterprise cloud portals, write custom backend microservices, and collaborate on software deployment pipelines.",
        requirements: ["Bachelor's degree in CS, IT, ECE or relevant streams", "Understanding of Java, Node.js, or C++ and OOPs concepts", "Good communication and logical reasoning skills"],
      },
      {
        title: "Remote Technical Content Specialist",
        company: "Accenture",
        logo: "📝",
        location: "Bangalore, Karnataka, India",
        type: "Full-time",
        category: "Marketing",
        salary: "₹4L - ₹6L PA",
        description: "Accenture is seeking a Technical Content Specialist. You will write beginner-friendly software documentation, edit blog templates, and create engaging developer FAQs.",
        requirements: ["Degree in English, Communications, or Computer Science", "Outstanding written English with absolute attention to detail", "Prior copywriting or technical blogging experience"],
      },
      {
        title: "Remote System Administrator",
        company: "Capgemini",
        logo: "💻",
        location: "Pune, Maharashtra, India (Remote)",
        type: "Full-time",
        category: "Engineering",
        salary: "₹5L - ₹7.5L PA",
        description: "Capgemini is looking for a System Administrator. You will configure client virtual machines, troubleshoot system logs, and ensure secure server setups across Azure cloud environments.",
        requirements: ["2+ years of IT support or system administration experience", "Certified in Azure fundamentals or CCNA is a plus", "Strong problem-solving attitude"],
      },
      {
        title: "Remote Data Entry Associate (1st Year Friendly)",
        company: "Capgemini",
        logo: "📊",
        location: "Pune, Maharashtra, India",
        type: "Internship",
        category: "Other",
        salary: "₹3.5L - ₹5L PA",
        description: "Capgemini is hiring Data Entry Associates. Open to 1st and 2nd-year college students looking for part-time remote work. You will manage customer support logs, enter database credentials, and draft daily metrics.",
        requirements: ["Currently enrolled in any college degree program", "Accurate typing speed and high attention to detail", "Familiarity with MS Office and Google Suite"],
      },
      {
        title: "Remote Database Analyst",
        company: "Oracle",
        logo: "🏛️",
        location: "Bangalore, Karnataka, India (Remote)",
        type: "Full-time",
        category: "Engineering",
        salary: "₹9L - ₹14L PA",
        description: "Oracle is seeking a Database Analyst. You will be responsible for optimizing complex SQL queries, index layouts, and ensuring top-tier backup and restore parameters for our cloud clients.",
        requirements: ["2+ years of database administrator (DBA) or SQL analyst experience", "Exceptional knowledge of SQL, PL/SQL, and Oracle database engines", "Strong scripting skills in Python or Bash for automation"],
      },
      {
        title: "Remote SQL Developer Intern (All Years)",
        company: "Oracle",
        logo: "💾",
        location: "Bangalore, Karnataka, India",
        type: "Internship",
        category: "Engineering",
        salary: "₹22,000 / month",
        description: "Join Oracle as an SQL Developer Intern! Ideal for engineering students learning relational databases. You will draft simple database schemas, write performance reports, and learn under senior database architects.",
        requirements: ["Enrolled in B.E / B.Tech / MCA of any year", "Strong understanding of SQL queries, joins, and indexing concepts", "Eager to learn PL/SQL and enterprise database management"],
      },
      {
        title: "Remote Solutions Engineer",
        company: "Salesforce",
        logo: "☁️",
        location: "Hyderabad, Telangana, India (Remote)",
        type: "Full-time",
        category: "Engineering",
        salary: "₹10L - ₹15L PA",
        description: "Salesforce is hiring an Associate Solutions Engineer. You will build highly customized CRM dashboard demonstrations, present technical solutions to enterprise clients, and configure API integrations.",
        requirements: ["1+ years of software or IT consulting experience", "Familiarity with cloud CRM models and APIs", "Outstanding presentation and customer-facing skills"],
      },
      {
        title: "Remote Customer Success Intern",
        company: "Salesforce",
        logo: "💬",
        location: "Hyderabad, Telangana, India",
        type: "Internship",
        category: "Other",
        salary: "₹20,000 / month",
        description: "Salesforce is offering a Customer Success Internship. You will assist client account managers, organize onboarding documentation, and answer basic client platform queries.",
        requirements: ["College students of any stream looking for corporate experience", "Excellent communication and relationship-building skills", "Quick learner with organized nature"],
      },
      {
        title: "Remote Product Marketing Manager",
        company: "Adobe",
        logo: "🎨",
        location: "Noida, Uttar Pradesh, India (Remote)",
        type: "Full-time",
        category: "Marketing",
        salary: "₹12L - ₹18L PA",
        description: "Adobe is looking for a Product Marketing Manager. You will formulate strategic launch plans, analyze consumer metrics, and coordinate campaigns to boost Creative Cloud user conversion.",
        requirements: ["3+ years of experience in product marketing or brand management", "Master's degree in Business or Marketing (MBA preferred)", "Analytical mind with exceptional copywriting skills"],
      },
      {
        title: "Remote UI Design Intern (1st-4th Year)",
        company: "Adobe",
        logo: "🌸",
        location: "Noida, Uttar Pradesh, India",
        type: "Internship",
        category: "Design",
        salary: "₹30,000 / month",
        description: "Adobe is seeking a UI Design Intern. Ideal for creative engineering or design students who want to build a career in design! You will create mobile app screens, mockups, and learn modern interface guidelines.",
        requirements: ["1st, 2nd, 3rd, or 4th-year students with a creative portfolio", "Proficiency in using Figma or Adobe XD", "Strong visual design skills and understanding of typography"],
      },
      {
        title: "Remote Network Engineering Intern",
        company: "Cisco",
        logo: "🌐",
        location: "Bangalore, Karnataka, India",
        type: "Internship",
        category: "Engineering",
        salary: "₹25,000 / month",
        description: "Cisco is seeking a Network Engineering Intern. Highly recommended for 3rd and 4th-year ECE/CSE students. You will help troubleshoot VPN connections, monitor local area network logs, and configure mock switches.",
        requirements: ["3rd or 4th-year B.E/B.Tech (ECE, CSE, IT) students", "Basic knowledge of TCP/IP, OSI model, and routing protocols", "CCNA training or certification is a huge advantage"],
      },
      {
        title: "Remote Hardware Design Intern (ECE/EEE)",
        company: "Intel",
        logo: "⚙️",
        location: "Bangalore, Karnataka, India",
        type: "Internship",
        category: "Engineering",
        salary: "₹28,000 / month",
        description: "Join Intel's hardware team as an Intern! Perfect for 3rd and 4th-year ECE or EEE engineering students. You will assist in analyzing microchip circuit layouts, troubleshooting sensor logs, and writing Verilog testbenches.",
        requirements: ["3rd or 4th-year engineering students in ECE or EEE", "Basic knowledge of digital systems and Verilog/VHDL", "Familiarity with circuit design software"],
      },
      {
        title: "Remote Deep Learning Intern (3rd & 4th Year)",
        company: "NVIDIA",
        logo: "🧠",
        location: "Bangalore, Karnataka, India",
        type: "Internship",
        category: "Science",
        salary: "₹35,000 / month",
        description: "NVIDIA is looking for a Deep Learning Intern. Highly recommended for 3rd and 4th-year CSE/AI students. You will assist in training neural network layouts, analyzing PyTorch datasets, and writing GPU-accelerated code.",
        requirements: ["3rd or 4th-year engineering students in CS or AI streams", "Proficiency in Python and basic deep learning in PyTorch/TensorFlow", "Good mathematical foundation in statistics and linear algebra"],
      },
      {
        title: "Remote Network Support Associate",
        company: "Reliance Jio",
        logo: "📶",
        location: "Mumbai, Maharashtra, India (Remote)",
        type: "Full-time",
        category: "Engineering",
        salary: "₹4.5L - ₹7L PA",
        description: "Reliance Jio is seeking a Network Support Associate. You will assist in monitoring local broadband setups, configuring routers remotely, and resolving consumer network tickets.",
        requirements: ["B.E / B.Tech (ECE/IT) or BCA freshers", "Good understanding of TCP/IP, DNS, and local networking", "Strong communication and client handling skills"],
      },
      {
        title: "Remote Web Development Intern (All Years)",
        company: "Reliance Jio",
        logo: "💻",
        location: "Mumbai, Maharashtra, India",
        type: "Internship",
        category: "Engineering",
        salary: "₹15,000 / month",
        description: "Jio is hiring Web Development Interns. Open to all engineering students! You will help update our internal portals, write clean HTML/CSS/JavaScript components, and learn under senior developers.",
        requirements: ["Currently pursuing B.E / B.Tech / BCA - open to all college years", "Basic knowledge of web development (HTML, CSS, JavaScript)", "Passionate about building responsive web pages"],
      },
      {
        title: "Remote Customer Operations Analyst",
        company: "Bharti Airtel",
        logo: "📞",
        location: "Gurgaon, Haryana, India (Remote)",
        type: "Full-time",
        category: "Other",
        salary: "₹5L - ₹7.5L PA",
        description: "Bharti Airtel is seeking a Customer Operations Analyst. You will monitor server metrics for customer accounts, manage billing databases, and compile daily service reports.",
        requirements: ["Bachelor's degree in any stream", "Excellent knowledge of MS Excel and data management tools", "Highly organized with strong verbal communication skills"],
      },
      {
        title: "Remote Cloud Security Intern",
        company: "Bharti Airtel",
        logo: "🛡️",
        location: "Gurgaon, Haryana, India",
        type: "Internship",
        category: "Engineering",
        salary: "₹20,000 / month",
        description: "Airtel is offering a Cloud Security Internship. Ideal for CSE/ECE students interested in cybersecurity. You will learn to audit cloud security configurations and monitor system logs.",
        requirements: ["Enrolled in B.E / B.Tech (CS, IT, ECE) - all college years welcome!", "Basic understanding of cybersecurity, SSL, and cloud concepts", "Highly motivated to learn cloud server security"],
      },
      {
        title: "Remote CAD Draftsman Intern (Mechanical/Auto)",
        company: "Tata Motors",
        logo: "🚗",
        location: "Pune, Maharashtra, India",
        type: "Internship",
        category: "Design",
        salary: "Free (Certificate & Mentorship)",
        description: "Tata Motors is offering a Free CAD Drafting Internship. Open to all mechanical and automotive engineering students from 1st to 4th year! You will draft 3D part designs in SolidWorks, learn automotive design principles, and receive a verified Internship Certificate.",
        requirements: ["Open to 1st, 2nd, 3rd, and 4th-year Mechanical/Auto engineering students", "Access to SolidWorks or AutoCAD software on a personal computer", "Eager to learn professional CAD draft standards"],
      },
      {
        title: "Remote Embedded Systems Intern",
        company: "Tata Motors",
        logo: "🔌",
        location: "Pune, Maharashtra, India",
        type: "Internship",
        category: "Engineering",
        salary: "₹18,000 / month",
        description: "Tata Motors is seeking an Embedded Systems Intern. Perfect for ECE/EEE students. You will write C scripts for microcontroller systems and assist in testing EV battery management boards.",
        requirements: ["3rd or 4th-year ECE/EEE/Mechatronics engineering students", "Strong basics in C programming and microcontrollers (Arduino/PIC)", "Knowledge of basic electronic circuits"],
      },
      {
        title: "Remote Product Design Intern (All Years)",
        company: "Mahindra & Mahindra",
        logo: "🚜",
        location: "Chennai, Tamil Nadu, India",
        type: "Internship",
        category: "Design",
        salary: "Free (Certificate & Mentorship)",
        description: "Mahindra & Mahindra is offering a Free Product Design Internship. Open to all mechanical, production, and automotive engineering students! You will learn how to design robust vehicle parts, perform simple load analyses, and get verified certificates to boost college credits.",
        requirements: ["Open to 1st, 2nd, 3rd, and 4th-year engineering students", "Basic knowledge of engineering design or drafting software", "Passion for automotive design and engineering"],
      },
      {
        title: "Remote Project Estimation Intern (Civil)",
        company: "L&T (Larsen & Toubro)",
        logo: "🏗️",
        location: "Chennai, Tamil Nadu, India",
        type: "Internship",
        category: "Engineering",
        salary: "Free (Certificate & Training)",
        description: "Larsen & Toubro is offering a Free Civil Project Estimation Internship. Open to all civil engineering students from 1st to 4th year! You will learn project planning, compile material quantity sheets, and receive professional training from senior L&T project engineers.",
        requirements: ["Open to all years of Civil Engineering students", "Access to Microsoft Excel and strong numerical skills", "Desire to build a strong professional portfolio in construction management"],
      },
      {
        title: "Remote Junior Civil Design Engineer",
        company: "L&T (Larsen & Toubro)",
        logo: "🏢",
        location: "Mumbai, Maharashtra, India (Remote)",
        type: "Full-time",
        category: "Engineering",
        salary: "₹6L - ₹9L PA",
        description: "L&T is seeking a Junior Civil Design Engineer. You will assist in drafting high-rise structural designs in AutoCAD and STAAD Pro, checking blueprints, and compiling estimation charts.",
        requirements: ["Bachelor's degree in Civil Engineering", "Strong knowledge of structural design concepts and STAAD Pro/AutoCAD", "Highly analytical with excellent organization"],
      },
      {
        title: "Remote IoT Solutions Intern (ECE/CSE)",
        company: "Bosch",
        logo: "🔌",
        location: "Bangalore, Karnataka, India",
        type: "Internship",
        category: "Engineering",
        salary: "₹20,000 / month",
        description: "Bosch is hiring an IoT Solutions Intern. Open to ECE, CSE, and EEE students. You will build simple IoT projects, write Python/C scripts for sensor modules, and connect devices to cloud databases.",
        requirements: ["Open to all engineering college years - 1st to 4th year welcome!", "Familiarity with Raspberry Pi or Arduino programming", "Basic understanding of internet protocols and cloud databases"],
      },
      {
        title: "Remote Automation Engineer",
        company: "Siemens",
        logo: "⚙️",
        location: "Bangalore, Karnataka, India (Remote)",
        type: "Full-time",
        category: "Engineering",
        salary: "₹7L - ₹11L PA",
        description: "Siemens is looking for an Automation Engineer. You will program PLC microcontrollers, optimize industrial automation scripts, and coordinate with remote deployment teams.",
        requirements: ["2+ years of experience in PLC programming and industrial automation", "Strong understanding of SCADA and electrical system layouts", "Bachelor's degree in EEE, ECE, or Instrumentation Engineering"],
      },
      {
        title: "Remote Electrical Design Intern (EEE)",
        company: "Siemens",
        logo: "⚡",
        location: "Bangalore, Karnataka, India",
        type: "Internship",
        category: "Engineering",
        salary: "Free (Certificate & Mentorship)",
        description: "Siemens is offering a Free Electrical Design Training Internship. Open to all electrical engineering students! You will learn how to design robust power grids, draft circuit boards, and receive a verified completion certificate.",
        requirements: ["Open to 1st, 2nd, 3rd, and 4th-year EEE students", "Basic knowledge of electrical circuit concepts", "Strong interest in industrial automation and power grid layouts"],
      },
      {
        title: "Remote Operations Analyst",
        company: "Godrej",
        logo: "🚪",
        location: "Mumbai, Maharashtra, India (Remote)",
        type: "Full-time",
        category: "Other",
        salary: "₹5.5L - ₹8L PA",
        description: "Godrej is seeking an Operations Analyst. You will assist in tracking raw material inventory, coordinate vendor schedules, and compile supply-chain metrics.",
        requirements: ["Completed BBA, B.Com, or equivalent graduation degree", "Advanced proficiency in Excel and data compilation tools", "Excellent communication and organizational skills"],
      },
      {
        title: "Remote Spatial Design Intern",
        company: "Godrej",
        logo: "🏡",
        location: "Mumbai, Maharashtra, India",
        type: "Internship",
        category: "Design",
        salary: "Free (Certificate & Mentorship)",
        description: "Godrej is offering a Free Spatial & Interior Design Internship. Perfect for creative architecture or design students. You will draft simple 3D room layouts in SketchUp and learn home furnishing principles.",
        requirements: ["Open to all years of design or architecture students", "Familiarity with SketchUp, AutoCAD, or Canva", "Creative portfolio of basic space planning is a plus"],
      },
      {
        title: "Remote Technical Support Associate",
        company: "Cognizant",
        logo: "🏢",
        location: "Chennai, Tamil Nadu, India (Remote)",
        type: "Full-time",
        category: "Engineering",
        salary: "₹4L - ₹6L PA",
        description: "Cognizant is hiring a Technical Support Associate. You will handle VPN configurations, troubleshoot email client setups, and resolve connection tickets for enterprise teams.",
        requirements: ["Graduate in any stream (degree in CS/IT or BCA is preferred)", "Basic conceptual knowledge of OS, networks, and computer hardware", "Good active listening and customer handling skills"],
      },
      {
        title: "Remote Systems Engineer",
        company: "Wipro",
        logo: "🌐",
        location: "Bangalore, Karnataka, India (Remote)",
        type: "Full-time",
        category: "Engineering",
        salary: "₹4.5L - ₹7.5L PA",
        description: "Wipro is seeking a Systems Engineer. You will manage remote cloud portals, assist in troubleshooting Linux system logs, and ensure secure configurations across Windows servers.",
        requirements: ["B.E / B.Tech / BCA freshers of CS, IT, ECE streams", "Familiarity with Linux commands, virtual machines, and basic shell scripting", "Excellent teamwork and organization skills"],
      },
      {
        title: "Remote Helpdesk Analyst",
        company: "HCLTech",
        logo: "💻",
        location: "Noida, Uttar Pradesh, India (Remote)",
        type: "Full-time",
        category: "Other",
        salary: "₹3.5L - ₹5.5L PA",
        description: "HCLTech is seeking a Helpdesk Analyst. You will resolve VPN connection queries, troubleshoot OS updates, and maintain high service-level SLA standards.",
        requirements: ["Completed B.Com, B.Sc, or equivalent degree", "Clear verbal and written communication in English", "Familiarity with Windows OS and MS Office"],
      },
      {
        title: "Remote Web Moderator (1st Year Friendly)",
        company: "TCS",
        logo: "💼",
        location: "Mumbai, Maharashtra, India",
        type: "Internship",
        category: "Other",
        salary: "₹3.6L - ₹5L PA",
        description: "TCS is hiring a Web Moderator. Highly open to 1st and 2nd-year college students looking for part-time remote work. You will review website content, verify customer comments against policies, and update records.",
        requirements: ["Currently pursuing any degree - 1st year college students welcome!", "Good reading comprehension and high attention to detail", "No technical or coding prerequisites required"],
      },
      {
        title: "Remote Junior Java Developer",
        company: "Infosys",
        logo: "💻",
        location: "Bangalore, Karnataka, India (Remote)",
        type: "Full-time",
        category: "Engineering",
        salary: "₹4.8L - ₹7.2L PA",
        description: "Infosys is seeking a Junior Java Developer. You will write clean, well-tested Java components, assist in database indexing, and help build REST APIs.",
        requirements: ["B.E / B.Tech / MCA freshers with good Java knowledge", "Basic understanding of SQL, JDBC, and OOPs concepts", "Eager to learn Spring Boot and modern cloud portals"],
      },
      {
        title: "Remote Social Media Coordinator",
        company: "Swiggy",
        logo: "🍔",
        location: "Bangalore, Karnataka, India",
        type: "Internship",
        category: "Marketing",
        salary: "₹15,000 / month",
        description: "Swiggy is seeking a Social Media Coordinator. Perfect for 1st and 2nd-year college students! You will coordinate creative campaigns, draft fun social copy, and track engagement trends.",
        requirements: ["Open to 1st and 2nd-year college students of any stream", "Creative visual flair and excellent conversational English", "Familiar with Instagram, Twitter, and Canva"],
      },
      {
        title: "Remote Delivery Operations Intern",
        company: "Zomato",
        logo: "🍕",
        location: "Gurgaon, Haryana, India",
        type: "Internship",
        category: "Other",
        salary: "₹16,000 / month",
        description: "Zomato is seeking a Delivery Operations Intern. You will monitor daily delivery timelines, help onboard delivery partners, and draft route optimization sheets.",
        requirements: ["College students of any stream looking for operations experience", "Basic knowledge of Google Sheets and MS Excel", "Good coordination skills"],
      },
      {
        title: "Remote Marketing Associate",
        company: "Paytm",
        logo: "💸",
        location: "Noida, Uttar Pradesh, India (Remote)",
        type: "Full-time",
        category: "Marketing",
        salary: "₹5L - ₹7.5L PA",
        description: "Paytm is hiring a Marketing Associate. You will assist in planning local merchant onboarding campaigns, coordinate branding designs, and draft engaging newsletters.",
        requirements: ["Completed BBA, MBA, or relevant degree", "Excellent copywriting and communication skills", "Strong digital marketing interest"],
      },
      {
        title: "Remote Operations Coordinator",
        company: "Razorpay",
        logo: "💳",
        location: "Bangalore, Karnataka, India (Remote)",
        type: "Full-time",
        category: "Other",
        salary: "₹4.8L - ₹7L PA",
        description: "Razorpay is seeking an Operations Coordinator. You will verify merchant KYC documents, troubleshoot QR payment account logs, and compile transaction reports.",
        requirements: ["Bachelor's degree in any stream", "High attention to detail and organized nature", "Familiarity with fintech tools or client support is a plus"],
      },
      {
        title: "Remote Supply Chain Intern",
        company: "Flipkart",
        logo: "🛒",
        location: "Bangalore, Karnataka, India",
        type: "Internship",
        category: "Other",
        salary: "₹14,000 / month",
        description: "Flipkart is seeking a Supply Chain Intern. You will assist in managing product catalogs, compiling delivery metrics, and coordinating supplier listings.",
        requirements: ["Open to all years of college students looking for e-commerce experience", "Basic knowledge of MS Excel", "Highly organized"],
      },
      {
        title: "Remote Fleet Coordinator",
        company: "Ola",
        logo: "🚗",
        location: "Bangalore, Karnataka, India (Remote)",
        type: "Full-time",
        category: "Other",
        salary: "₹4.5L - ₹6.5L PA",
        description: "Ola is looking for a Fleet Coordinator. You will track driver onboarding logs, monitor daily vehicle active rates, and resolve system registration issues.",
        requirements: ["Completed graduation in any stream", "Good active listening and problem-solving skills", "Prior operations or logistics coordination experience is preferred"],
      },
      {
        title: "Remote Business Development Rep",
        company: "Freshworks",
        logo: "🍀",
        location: "Chennai, Tamil Nadu, India (Remote)",
        type: "Full-time",
        category: "Marketing",
        salary: "₹6L - ₹9L PA",
        description: "Freshworks is seeking a Business Development Representative. You will manage customer leads, compile sales pipelines, and conduct technical demonstrations.",
        requirements: ["Completed graduation (BBA, B.Tech, or MBA)", "Excellent verbal communication and conversational English", "Strong goal-oriented mindset"],
      },
      {
        title: "Remote Product Analyst",
        company: "Chargebee",
        logo: "🐝",
        location: "Chennai, Tamil Nadu, India (Remote)",
        type: "Full-time",
        category: "Engineering",
        salary: "₹8L - ₹12L PA",
        description: "Chargebee is hiring a Product Analyst. You will monitor platform transaction logs, analyze subscription conversion rates, and map user flow optimization dashboards.",
        requirements: ["1+ years of SQL or analytics experience", "Proficiency in Excel, SQL, and data visualization tools", "Strong logical and statistical reasoning"],
      }
    ];

    for (const mockJob of extraPremiumJobs) {
      const existingMock = await Job.findOne({ title: mockJob.title, company: mockJob.company });
      if (!existingMock) {
        await Job.create({
          title: mockJob.title,
          company: mockJob.company,
          logo: mockJob.logo,
          employer: systemEmployer._id,
          description: mockJob.description,
          requirements: mockJob.requirements,
          benefits: [
            'Fully Remote working flexibility',
            'Dedicated corporate mentorship & review',
            'Verified corporate certificate upon completion',
            'Excellent career conversion potential',
          ],
          skills: mockJob.requirements.map(r => r.split(' ').slice(-1)[0].replace(/[^a-zA-Z]/g, '')).filter(Boolean),
          location: mockJob.location,
          remote: 'Fully Remote',
          type: mockJob.type,
          category: mockJob.category,
          salary: mockJob.salary,
          applyEmail: 'system-employer@talenthub.com',
          status: 'active',
          featured: true,
          createdAt: new Date(),
        });
        results.added++;
      }
    }


    console.log(`🏁 Sync completed! Mapped & Saved: ${results.added}, Skipped: ${results.skipped}, Errors: ${results.errors.length}`);
  } catch (err) {
    console.error('❌ Job Syncing failed altogether:', err.message);
    throw err;
  }

  return results;
};

module.exports = { syncExternalJobs };
