// src/controllers/chatController.js
const Job = require('../models/Job');

/**
 * Handle AI Career Chatbot Query
 * Contextually responds based on active database job listings
 */
exports.handleChatQuery = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, message: "Please provide a valid query message." });
    }

    const msg = message.toLowerCase().trim();
    let reply = "";

    // A. CHECK FOR BASIC GREETINGS (Conversational Response)
    if (msg === 'hi' || msg === 'hello' || msg === 'hey' || msg === 'yo' || msg.includes('good morning') || msg.includes('good afternoon') || msg.includes('greetings') || msg === 'hello bot' || msg === 'hi bot') {
      reply = `👋 **Hello! Warm welcome to the TalentHub AI Career Assistant.**\n\nI'm absolutely thrilled to help you discover outstanding remote opportunities and improve your applications today!\n\n💡 Try asking me:\n* 🔍 *"Recommend engineering / design / healthcare jobs"*\n* 💰 *"Show me the highest paying roles"*\n* 🏢 *"Are there jobs at OpenAI or Spotify?"*\n* 💡 *"Give me resume writing tips"*\n\nOr click one of the suggested query chips below to get started instantly!`;

    // B. CHECK FOR IDENTITY / CREATOR
    } else if (msg.includes('who are you') || msg.includes('your name') || msg.includes('what is your name') || msg.includes('who built you') || msg.includes('who made you')) {
      reply = `🤖 **I am the TalentHub AI Career Assistant!**\n\nI am a premium, database-integrated AI companion built exclusively for the **TalentHub** platform to help modern professionals discover remote listings, analyze salary trends, and build outstanding MERN resumes.\n\nI was crafted with ❤️ by the TalentHub engineering team!`;

    // C. CHECK FOR THANKS / APPRECIATION
    } else if (msg === 'thanks' || msg === 'thank you' || msg.includes('thank you') || msg === 'perfect' || msg === 'awesome' || msg === 'great' || msg === 'good' || msg === 'ok' || msg === 'okay') {
      reply = `🌟 **You are very welcome!**\n\nHelping you accelerate your career search is my number one priority. Let me know if there's anything else you need, like specific company roles, high-paying vacancies, or resume summaries!`;

    // D. CHECK FOR HOW TO APPLY
    } else if (msg.includes('how to apply') || msg.includes('how do i apply') || msg.includes('apply') || msg.includes('application')) {
      reply = `🚀 **Applying for jobs on TalentHub is incredibly simple:**\n\n1. Navigate to our **Browse Jobs** page.\n2. Click on any job card that interests you to open its full details.\n3. Click the **'Apply Now'** button.\n4. Fill in the brief form (ensure your phone matches \`+1234567890\` and provide a valid LinkedIn URL).\n5. Upload your resume and click **Submit Application**!\n\nEmployers will receive your profile and clickable resume immediately on their real-time Recruiter Dashboard!`;

    // E. CHECK FOR SYNC / IMPORT JOBS
    } else if (msg.includes('sync') || msg.includes('load jobs') || msg.includes('import') || msg.includes('fetch')) {
      reply = `📡 **To synchronize latest remote vacancies from the external Remotive API:**\n\n1. If you are logged in as an **Employer/Recruiter**, navigate to your Recruiter Dashboard.\n2. Click the **'Sync Remote Jobs'** button.\n3. Alternatively, on the Home page, if there are no active listings, click the **'🚀 Load Remote Jobs from API'** button.\n\nThis automatically pulls their entire feed, skips duplicates, and saves up to 100 fresh listings in our database!`;

    // 1. CHECK FOR SALARY QUERY ("highest paying", "salary", "rich", "high pay")
    } else if (msg.includes('salary') || msg.includes('paying') || msg.includes('pay') || msg.includes('highest')) {
      const activeJobs = await Job.find({ status: 'active' });
      
      // Helper function to extract numerical upper bound from salary strings
      const parseUpperSalary = (salaryStr) => {
        if (!salaryStr) return 0;
        let s = salaryStr.toLowerCase().replace(/[–—]/g, "-").replace(/,/g, "");
        if (s.includes("-")) {
          const parts = s.split("-");
          s = parts[1] || parts[0];
        }
        let val = parseFloat(s.replace(/[^0-9.]/g, "")) || 0;
        if (s.includes("k")) {
          val = val * 1000;
        }
        return val;
      };

      // Sort by parsed salary value descending
      const sortedJobs = [...activeJobs].sort((a, b) => parseUpperSalary(b.salary) - parseUpperSalary(a.salary));
      const topJobs = sortedJobs.slice(0, 3);

      if (topJobs.length > 0) {
        reply = `💰 **Here are the top highest-paying opportunities currently active on TalentHub:**\n\n`;
        topJobs.forEach((job, idx) => {
          reply += `${idx + 1}. **${job.title}** at *${job.company}*\n`;
          reply += `   * **Salary:** \`${job.salary}\` | **Location:** \`${job.location}\` (${job.remote})\n`;
          reply += `   * *Key Skills:* ${job.skills.slice(0, 3).map(s => `\`${s}\``).join(', ') || 'General'}\n\n`;
        });
        reply += `👉 Click on **Browse Jobs** and sort by **Highest Salary** to explore all of them and submit your application!`;
      } else {
        reply = "I couldn't find any active job listings with listed salaries in our database right now. Please check back later!";
      }

    // 2. CHECK FOR RESUME / CAREER WRITING ADVICE
    } else if (msg.includes('resume') || msg.includes('cv') || msg.includes('career') || msg.includes('interview') || msg.includes('tips') || msg.includes('write')) {
      reply = `💡 **Here are 5 premium career and resume writing tips to land a modern tech role:**\n\n`;
      reply += `1. **Customize Your Focus:** Tailor your resume summary for each job description. Make sure the keywords in your skills match the recruiter's exact tags.\n`;
      reply += `2. **Focus on Outcomes:** Don't just list tasks. Use the Star method: *"Implemented React Vite caching which reduced dashboard load time by 35%"* instead of *"Created dashboard interfaces"*.\n`;
      reply += `3. **Link Your Work:** Recruiters love proof. Include clean, direct links to your GitHub repositories, LinkedIn profile, or active web portfolios.\n`;
      reply += `4. **Polish Your LinkedIn:** Keep your LinkedIn URL format clean. Ensure your experience listed matches your resume precisely.\n`;
      reply += `5. **Keep It One-Page:** For mid-level roles, keep your resume layout compact, elegant, and limited to a single page.\n\n`;
      reply += `🚀 **Pro-Tip:** When applying on TalentHub, make sure your phone number matches the format \`+1234567890\` and provide a valid LinkedIn URL to pass our recruiting verification instantly!`;

    // 3. CHECK FOR SPECIFIC COMPANIES (e.g. OpenAI, Spotify, Google, Figma, Airbnb, Duolingo, Netflix)
    } else if (msg.includes('openai') || msg.includes('spotify') || msg.includes('google') || msg.includes('figma') || msg.includes('airbnb') || msg.includes('netflix') || msg.includes('uber') || msg.includes('coinbase') || msg.includes('stripe') || msg.includes('duolingo') || msg.includes('wise') || msg.includes('moderna') || msg.includes('pfizer')) {
      // Find matching company name
      let searchCompany = "";
      const companies = ['OpenAI', 'Spotify', 'Google', 'Figma', 'Airbnb', 'Duolingo', 'Netflix', 'Revolut', 'Wise', 'Oscar Health', 'Moderna', 'Udacity', 'Uber', 'Coinbase', 'Grail', 'Meta AI', 'Pfizer', 'Stripe'];
      for (const comp of companies) {
        if (msg.includes(comp.toLowerCase())) {
          searchCompany = comp;
          break;
        }
      }

      if (searchCompany) {
        const matches = await Job.find({ company: new RegExp(searchCompany, 'i'), status: 'active' }).limit(3);
        if (matches.length > 0) {
          reply = `🏢 **I found the following active roles at ${searchCompany} in our database:**\n\n`;
          matches.forEach((job) => {
            reply += `* **${job.title}** (${job.type})\n`;
            reply += `  * **Salary:** \`${job.salary}\` | **Location:** \`${job.location}\` (${job.remote})\n`;
            reply += `  * **Description:** *${job.description.substring(0, 150)}...*\n\n`;
          });
          reply += `👉 Click on **Browse Jobs** and search for **"${searchCompany}"** to view the full descriptions and apply!`;
        } else {
          reply = `I see you are interested in **${searchCompany}**! We don't have any active job listings for them at this exact second, but check back soon as our API syncs new remote jobs daily!`;
        }
      }

    // 4. CHECK FOR JOB CATEGORIES (e.g. Engineering, Design, Marketing, Finance, Healthcare, Education, Legal, Science)
    } else {
      let matchedCategory = "";
      const catMapping = {
        engineering: 'Engineering', dev: 'Engineering', software: 'Engineering', coding: 'Engineering', react: 'Engineering', programmer: 'Engineering', tech: 'Engineering',
        design: 'Design', creative: 'Design', ui: 'Design', ux: 'Design', graphics: 'Design',
        marketing: 'Marketing', sales: 'Marketing', writing: 'Marketing', growth: 'Marketing', seo: 'Marketing',
        finance: 'Finance', accounting: 'Finance', bank: 'Finance', treasury: 'Finance', investment: 'Finance',
        healthcare: 'Healthcare', medical: 'Healthcare', nurse: 'Healthcare', doctor: 'Healthcare', clinic: 'Healthcare',
        education: 'Education', curriculum: 'Education', teach: 'Education', instructor: 'Education', mentor: 'Education',
        legal: 'Legal', law: 'Legal', counsel: 'Legal', lawyer: 'Legal', contract: 'Legal',
        science: 'Science', bio: 'Science', research: 'Science', lab: 'Science', genomic: 'Science', physics: 'Science',
      };

      for (const keyword in catMapping) {
        if (msg.includes(keyword)) {
          matchedCategory = catMapping[keyword];
          break;
        }
      }

      if (matchedCategory) {
        const matches = await Job.find({ category: matchedCategory, status: 'active' }).sort({ createdAt: -1 }).limit(3);
        if (matches.length > 0) {
          reply = `💼 **Here are the top active ${matchedCategory} opportunities I found for you:**\n\n`;
          matches.forEach((job) => {
            reply += `* **${job.title}** at *${job.company}* (${job.type})\n`;
            reply += `  * **Salary:** \`${job.salary}\` | **Location:** \`${job.location}\` (${job.remote})\n`;
            reply += `  * **Skills:** ${job.skills.slice(0, 4).map(s => `\`${s}\``).join(', ')}\n\n`;
          });
          reply += `👉 Click on the **Category chip** for **"${matchedCategory}"** on our **Browse Jobs** page to view all available roles!`;
        } else {
          reply = `I found that you are looking for **${matchedCategory}** roles. We currently don't have any active vacancies in this category, but you can trigger our sync system to import more remote vacancies!`;
        }

      // 5. DEFAULT CONVERSATIONAL CAREER ASSISTANT FALLBACK
      } else {
        reply = `👋 **Hello! I am your TalentHub AI Career Assistant.**\n\n`;
        reply += `I am here to help you navigate our modern job board and accelerate your career search. Here is what you can ask me:\n\n`;
        reply += `* 🔍 *"Recommend some engineering / design / finance jobs"* to see real vacancies.\n`;
        reply += `* 💰 *"Show me the highest paying roles"* to discover top salaries.\n`;
        reply += `* 🏢 *"Are there jobs at OpenAI or Spotify?"* to check specific brands.\n`;
        reply += `* 💡 *"Give me resume writing tips"* to polish your applications.\n\n`;
        reply += `How can I assist you in finding your next great opportunity today?`;
      }
    }

    // Log chatbot activity in background
    const ActivityLog = require('../models/ActivityLog');
    ActivityLog.create({
      activityType: 'ai_chat',
      email: req.user?.email || 'anonymous@talenthub.com',
      name: req.user?.name || 'Anonymous User',
      role: req.user?.role || 'candidate',
      details: `Asked AI Career Assistant: "${message.substring(0, 80)}${message.length > 80 ? '...' : ''}"`
    }).catch(err => console.error("Activity log error:", err));

    return res.status(200).json({
      success: true,
      reply,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    next(err);
  }
};
