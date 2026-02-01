const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Sample job data
const jobs = [
  {
    id: 1,
    company: 'Google',
    website: 'https://careers.google.com',
    role: 'Software Engineering Intern',
    title: 'Software Engineering Intern',
    location: 'Bangalore, India',
    type: 'Internship',
    job_type: 'Internship',
    ctc: '₹8-10 LPA',
    salary: '₹8-10 LPA',
    experience: '0-1 years',
    experience_required: '0-1 years',
    skills: ['React', 'TypeScript', 'Node.js', 'System Design'],
    required_skills: ['React', 'TypeScript', 'Node.js', 'System Design'],
    description: 'Join Google as a Software Engineering Intern and work on cutting-edge technologies that impact billions of users worldwide.',
    job_description: 'Join Google as a Software Engineering Intern and work on cutting-edge technologies that impact billions of users worldwide.',
    requirements: ['Strong problem-solving skills', 'Proficiency in data structures', 'Team collaboration', 'Passion for technology'],
    qualifications: ['Strong problem-solving skills', 'Proficiency in data structures', 'Team collaboration', 'Passion for technology'],
    deadline: '2026-03-15',
    application_deadline: '2026-03-15',
    postedDate: '2026-01-20',
    posted_date: '2026-01-20',
    created_at: '2026-01-20',
    match: 95,
    match_percentage: 95,
    status: 'new',
    eligibility: {
      minCGPA: 8.0,
      branches: ['CSE', 'IT', 'ECE'],
      passoutYear: '2026'
    },
    min_cgpa: 8.0,
    eligible_branches: ['CSE', 'IT', 'ECE'],
    passout_year: '2026',
    benefits: ['Health Insurance', 'Free Meals', 'Learning Budget', 'Gym Membership'],
    perks: ['Health Insurance', 'Free Meals', 'Learning Budget', 'Gym Membership']
  },
  {
    id: 2,
    company: 'Microsoft',
    website: 'https://careers.microsoft.com',
    role: 'Full Stack Developer',
    title: 'Full Stack Developer',
    location: 'Hyderabad, India',
    type: 'Full-time',
    job_type: 'Full-time',
    ctc: '₹18-22 LPA',
    salary: '₹18-22 LPA',
    experience: '0-2 years',
    experience_required: '0-2 years',
    skills: ['Angular', 'C#', '.NET', 'Azure', 'SQL'],
    required_skills: ['Angular', 'C#', '.NET', 'Azure', 'SQL'],
    description: 'Build innovative solutions for enterprise clients using Microsoft\'s cloud technologies and frameworks.',
    job_description: 'Build innovative solutions for enterprise clients using Microsoft\'s cloud technologies and frameworks.',
    requirements: ['Bachelor\'s degree in CS', 'Full-stack development experience', 'Cloud platform knowledge', 'Agile methodology'],
    qualifications: ['Bachelor\'s degree in CS', 'Full-stack development experience', 'Cloud platform knowledge', 'Agile methodology'],
    deadline: '2026-02-28',
    application_deadline: '2026-02-28',
    postedDate: '2026-01-18',
    posted_date: '2026-01-18',
    created_at: '2026-01-18',
    match: 88,
    match_percentage: 88,
    status: 'new',
    eligibility: {
      minCGPA: 7.5,
      branches: ['CSE', 'IT'],
      passoutYear: '2026'
    },
    min_cgpa: 7.5,
    eligible_branches: ['CSE', 'IT'],
    passout_year: '2026',
    benefits: ['Stock Options', 'Work from Home', 'Professional Development', 'Parental Leave'],
    perks: ['Stock Options', 'Work from Home', 'Professional Development', 'Parental Leave']
  },
  {
    id: 3,
    company: 'Amazon',
    website: 'https://amazon.jobs',
    role: 'Backend Engineer',
    title: 'Backend Engineer',
    location: 'Mumbai, India',
    type: 'Full-time',
    job_type: 'Full-time',
    ctc: '₹20-28 LPA',
    salary: '₹20-28 LPA',
    experience: '1-3 years',
    experience_required: '1-3 years',
    skills: ['Java', 'Python', 'AWS', 'Docker', 'Microservices'],
    required_skills: ['Java', 'Python', 'AWS', 'Docker', 'Microservices'],
    description: 'Design and develop scalable backend systems that power Amazon\'s e-commerce platform.',
    job_description: 'Design and develop scalable backend systems that power Amazon\'s e-commerce platform.',
    requirements: ['Strong CS fundamentals', 'Distributed systems experience', 'API design', 'Performance optimization'],
    qualifications: ['Strong CS fundamentals', 'Distributed systems experience', 'API design', 'Performance optimization'],
    deadline: '2026-03-01',
    application_deadline: '2026-03-01',
    postedDate: '2026-01-15',
    posted_date: '2026-01-15',
    created_at: '2026-01-15',
    match: 82,
    match_percentage: 82,
    status: 'saved',
    eligibility: {
      minCGPA: 7.0,
      branches: ['CSE', 'IT', 'ECE'],
      passoutYear: '2025-2026'
    },
    min_cgpa: 7.0,
    eligible_branches: ['CSE', 'IT', 'ECE'],
    passout_year: '2025-2026',
    benefits: ['Relocation Assistance', 'Employee Discounts', 'Career Growth', 'International Opportunities'],
    perks: ['Relocation Assistance', 'Employee Discounts', 'Career Growth', 'International Opportunities']
  },
  {
    id: 4,
    company: 'Flipkart',
    website: 'https://www.flipkartcareers.com',
    role: 'Product Manager Intern',
    title: 'Product Manager Intern',
    location: 'Bangalore, India',
    type: 'Internship',
    job_type: 'Internship',
    ctc: '₹6-8 LPA',
    salary: '₹6-8 LPA',
    experience: '0 years',
    experience_required: '0 years',
    skills: ['Product Strategy', 'Market Research', 'Analytics', 'Communication'],
    required_skills: ['Product Strategy', 'Market Research', 'Analytics', 'Communication'],
    description: 'Work with cross-functional teams to define product roadmaps and drive feature development for India\'s leading e-commerce platform.',
    job_description: 'Work with cross-functional teams to define product roadmaps and drive feature development for India\'s leading e-commerce platform.',
    requirements: ['Strong analytical skills', 'Understanding of e-commerce', 'Data-driven decision making', 'Leadership potential'],
    qualifications: ['Strong analytical skills', 'Understanding of e-commerce', 'Data-driven decision making', 'Leadership potential'],
    deadline: '2026-02-20',
    application_deadline: '2026-02-20',
    postedDate: '2026-01-25',
    posted_date: '2026-01-25',
    created_at: '2026-01-25',
    match: 78,
    match_percentage: 78,
    status: 'new',
    eligibility: {
      minCGPA: 7.5,
      branches: ['CSE', 'IT', 'MBA'],
      passoutYear: '2026'
    },
    min_cgpa: 7.5,
    eligible_branches: ['CSE', 'IT', 'MBA'],
    passout_year: '2026',
    benefits: ['Mentorship Program', 'Networking Events', 'Employee Discounts', 'Flexible Hours'],
    perks: ['Mentorship Program', 'Networking Events', 'Employee Discounts', 'Flexible Hours']
  },
  {
    id: 5,
    company: 'Infosys',
    website: 'https://www.infosys.com/careers',
    role: 'Systems Engineer',
    title: 'Systems Engineer',
    location: 'Pune, India',
    type: 'Full-time',
    job_type: 'Full-time',
    ctc: '₹3.6-4.5 LPA',
    salary: '₹3.6-4.5 LPA',
    experience: '0 years',
    experience_required: '0 years',
    skills: ['Java', 'SQL', 'Problem Solving', 'Communication'],
    required_skills: ['Java', 'SQL', 'Problem Solving', 'Communication'],
    description: 'Join Infosys as a Systems Engineer and work on diverse projects across various industries and technologies.',
    job_description: 'Join Infosys as a Systems Engineer and work on diverse projects across various industries and technologies.',
    requirements: ['B.Tech/B.E. in any stream', 'Good communication skills', 'Willingness to learn', 'Team player'],
    qualifications: ['B.Tech/B.E. in any stream', 'Good communication skills', 'Willingness to learn', 'Team player'],
    deadline: '2026-03-10',
    application_deadline: '2026-03-10',
    postedDate: '2026-01-22',
    posted_date: '2026-01-22',
    created_at: '2026-01-22',
    match: 85,
    match_percentage: 85,
    status: 'new',
    eligibility: {
      minCGPA: 6.5,
      branches: ['CSE', 'IT', 'ECE', 'EEE', 'Mechanical'],
      passoutYear: '2026'
    },
    min_cgpa: 6.5,
    eligible_branches: ['CSE', 'IT', 'ECE', 'EEE', 'Mechanical'],
    passout_year: '2026',
    benefits: ['Training & Certification', 'Health Insurance', 'Transportation', 'Career Development'],
    perks: ['Training & Certification', 'Health Insurance', 'Transportation', 'Career Development']
  },
  {
    id: 6,
    company: 'TCS',
    website: 'https://www.tcs.com/careers',
    role: 'Digital Software Developer',
    title: 'Digital Software Developer',
    location: 'Chennai, India',
    type: 'Full-time',
    job_type: 'Full-time',
    ctc: '₹3.36-7 LPA',
    salary: '₹3.36-7 LPA',
    experience: '0 years',
    experience_required: '0 years',
    skills: ['Python', 'JavaScript', 'React', 'Node.js', 'MongoDB'],
    required_skills: ['Python', 'JavaScript', 'React', 'Node.js', 'MongoDB'],
    description: 'Be part of TCS Digital team working on modern web technologies and digital transformation projects.',
    job_description: 'Be part of TCS Digital team working on modern web technologies and digital transformation projects.',
    requirements: ['B.E./B.Tech/M.E./M.Tech', 'Strong coding skills', 'Full-stack development knowledge', 'Passion for digital technologies'],
    qualifications: ['B.E./B.Tech/M.E./M.Tech', 'Strong coding skills', 'Full-stack development knowledge', 'Passion for digital technologies'],
    deadline: '2026-02-25',
    application_deadline: '2026-02-25',
    postedDate: '2026-01-19',
    posted_date: '2026-01-19',
    created_at: '2026-01-19',
    match: 90,
    match_percentage: 90,
    status: 'new',
    eligibility: {
      minCGPA: 6.0,
      branches: ['CSE', 'IT', 'ECE'],
      passoutYear: '2026'
    },
    min_cgpa: 6.0,
    eligible_branches: ['CSE', 'IT', 'ECE'],
    passout_year: '2026',
    benefits: ['Global Opportunities', 'Learning Platform', 'Insurance', 'Work-Life Balance'],
    perks: ['Global Opportunities', 'Learning Platform', 'Insurance', 'Work-Life Balance']
  }
];

// Sample companies data
const companies = [
  {
    _id: 'comp-1',
    name: 'Google',
    industry: 'Technology',
    location: 'Bangalore, India',
    website: 'https://careers.google.com',
    contactPerson: 'Rajesh Kumar',
    email: 'recruiting@google.com',
    phone: '+91-80-67218000',
    description: 'Leading technology company focused on search, cloud computing, and AI.'
  },
  {
    _id: 'comp-2',
    name: 'Microsoft',
    industry: 'Technology',
    location: 'Hyderabad, India',
    website: 'https://careers.microsoft.com',
    contactPerson: 'Priya Sharma',
    email: 'careers@microsoft.com',
    phone: '+91-40-40115555',
    description: 'Global leader in software, services, devices and solutions.'
  },
  {
    _id: 'comp-3',
    name: 'Amazon',
    industry: 'E-commerce & Cloud',
    location: 'Mumbai, India',
    website: 'https://amazon.jobs',
    contactPerson: 'Amit Patel',
    email: 'recruiting-india@amazon.com',
    phone: '+91-22-67251111',
    description: 'World\'s largest online retailer and cloud computing provider.'
  },
  {
    _id: 'comp-4',
    name: 'Flipkart',
    industry: 'E-commerce',
    location: 'Bangalore, India',
    website: 'https://www.flipkartcareers.com',
    contactPerson: 'Sneha Reddy',
    email: 'careers@flipkart.com',
    phone: '+91-80-45614561',
    description: 'India\'s leading e-commerce marketplace.'
  },
  {
    _id: 'comp-5',
    name: 'Infosys',
    industry: 'IT Services',
    location: 'Pune, India',
    website: 'https://www.infosys.com/careers',
    contactPerson: 'Vikram Singh',
    email: 'recruitment@infosys.com',
    phone: '+91-20-66015000',
    description: 'Global leader in next-generation digital services and consulting.'
  },
  {
    _id: 'comp-6',
    name: 'TCS',
    industry: 'IT Services',
    location: 'Chennai, India',
    website: 'https://www.tcs.com/careers',
    contactPerson: 'Lakshmi Iyer',
    email: 'campus.recruitment@tcs.com',
    phone: '+91-44-22541234',
    description: 'India\'s largest IT services, consulting and business solutions organization.'
  },
  {
    _id: 'comp-7',
    name: 'Wipro',
    industry: 'IT Services',
    location: 'Bangalore, India',
    website: 'https://careers.wipro.com',
    contactPerson: 'Arjun Mehta',
    email: 'campus@wipro.com',
    phone: '+91-80-28440011',
    description: 'Leading global information technology, consulting and business process services company.'
  },
  {
    _id: 'comp-8',
    name: 'Cognizant',
    industry: 'IT Services',
    location: 'Hyderabad, India',
    website: 'https://careers.cognizant.com',
    contactPerson: 'Meera Nair',
    email: 'india.recruitment@cognizant.com',
    phone: '+91-40-67251000',
    description: 'Professional services company focused on digital, technology and operations.'
  }
];

// Sample recruiters data
const recruiters = [
  { _id: 'rec-1', companyId: 'comp-1', name: 'Rajesh Kumar', company: 'Google', email: 'rajesh.kumar@google.com', phone: '+91-9876543210', position: 'Senior Technical Recruiter' },
  { _id: 'rec-2', companyId: 'comp-1', name: 'Anita Desai', company: 'Google', email: 'anita.desai@google.com', phone: '+91-9876543211', position: 'Campus Recruiter' },
  { _id: 'rec-3', companyId: 'comp-2', name: 'Priya Sharma', company: 'Microsoft', email: 'priya.sharma@microsoft.com', phone: '+91-9876543212', position: 'Talent Acquisition Lead' },
  { _id: 'rec-4', companyId: 'comp-2', name: 'Karan Kapoor', company: 'Microsoft', email: 'karan.kapoor@microsoft.com', phone: '+91-9876543213', position: 'University Recruiter' },
  { _id: 'rec-5', companyId: 'comp-3', name: 'Amit Patel', company: 'Amazon', email: 'amit.patel@amazon.com', phone: '+91-9876543214', position: 'Technical Recruiter' },
  { _id: 'rec-6', companyId: 'comp-3', name: 'Divya Menon', company: 'Amazon', email: 'divya.menon@amazon.com', phone: '+91-9876543215', position: 'Campus Hiring Manager' },
  { _id: 'rec-7', companyId: 'comp-4', name: 'Sneha Reddy', company: 'Flipkart', email: 'sneha.reddy@flipkart.com', phone: '+91-9876543216', position: 'Recruitment Manager' },
  { _id: 'rec-8', companyId: 'comp-5', name: 'Vikram Singh', company: 'Infosys', email: 'vikram.singh@infosys.com', phone: '+91-9876543217', position: 'Campus Recruitment Lead' },
  { _id: 'rec-9', companyId: 'comp-5', name: 'Kavita Joshi', company: 'Infosys', email: 'kavita.joshi@infosys.com', phone: '+91-9876543218', position: 'HR Manager' },
  { _id: 'rec-10', companyId: 'comp-6', name: 'Lakshmi Iyer', company: 'TCS', email: 'lakshmi.iyer@tcs.com', phone: '+91-9876543219', position: 'Talent Acquisition Specialist' },
  { _id: 'rec-11', companyId: 'comp-7', name: 'Arjun Mehta', company: 'Wipro', email: 'arjun.mehta@wipro.com', phone: '+91-9876543220', position: 'University Relations Manager' },
  { _id: 'rec-12', companyId: 'comp-8', name: 'Meera Nair', company: 'Cognizant', email: 'meera.nair@cognizant.com', phone: '+91-9876543221', position: 'Campus Hiring Lead' }
];

// API Routes
app.get('/api/jobs/enriched', (req, res) => {
  res.json(jobs);
});

app.get('/api/jobs/:id', (req, res) => {
  const job = jobs.find(j => j.id === parseInt(req.params.id));
  if (job) {
    res.json(job);
  } else {
    res.status(404).json({ error: 'Job not found' });
  }
});

// Companies API
app.get('/api/companies', (req, res) => {
  console.log('📋 GET /api/companies - Fetching all companies');
  console.log('Total companies:', companies.length);
  res.json({ success: true, companies });
});

app.get('/api/companies/:id', (req, res) => {
  console.log('📋 GET /api/companies/:id - Fetching company:', req.params.id);
  const company = companies.find(c => c._id === req.params.id);
  if (company) {
    res.json({ success: true, company });
  } else {
    res.status(404).json({ success: false, error: 'Company not found' });
  }
});

// Recruiters API
app.get('/api/recruiters', (req, res) => {
  const { companyId } = req.query;
  console.log('👥 GET /api/recruiters - Query:', req.query);
  
  if (companyId) {
    const companyRecruiters = recruiters.filter(r => r.companyId === companyId);
    console.log(`Found ${companyRecruiters.length} recruiters for company ${companyId}`);
    res.json({ success: true, recruiters: companyRecruiters });
  } else {
    console.log(`Returning all ${recruiters.length} recruiters`);
    res.json({ success: true, recruiters });
  }
});

app.get('/api/recruiters/:id', (req, res) => {
  const recruiter = recruiters.find(r => r._id === req.params.id);
  if (recruiter) {
    res.json({ success: true, recruiter });
  } else {
    res.status(404).json({ success: false, error: 'Recruiter not found' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📊 Jobs API available at http://localhost:${PORT}/api/jobs/enriched`);
  console.log(`🏢 Companies API available at http://localhost:${PORT}/api/companies`);
  console.log(`👥 Recruiters API available at http://localhost:${PORT}/api/recruiters`);
  console.log(`✅ Health check at http://localhost:${PORT}/api/health`);
});
