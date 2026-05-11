const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const PORT = 5000;
let WS_PORT = 8080;

// Middleware
app.use(cors());
app.use(express.json());

// ===== WebSocket Setup for Real-Time Updates =====
let wss = null;
let wsReady = false;
let wsAttempts = 0;
const maxWSAttempts = 10;

// Function to start WebSocket server
function initWebSocket() {
  try {
    wss = new WebSocket.Server({ port: WS_PORT });

    wss.on('connection', (ws) => {
      const clientId = Date.now().toString();
      console.log(`✅ WebSocket client connected: ${clientId} (Total: ${wss.clients.size})`);

      // Handle different client types
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data);

          switch (message.type) {
            case 'register_student':
              studentClients.set(clientId, { ws, studentId: message.studentId });
              ws.send(JSON.stringify({ type: 'registration_success', message: 'Student registered' }));
              break;

            case 'register_recruiter':
              recruiterClients.set(clientId, { ws, recruiterId: message.recruiterId, companyId: message.companyId });
              ws.send(JSON.stringify({ type: 'registration_success', message: 'Recruiter registered' }));
              break;

            case 'job_application':
              handleJobApplication(message, recruiterClients, ws);
              break;

            case 'placement_update':
              handlePlacementUpdate(message, recruiterClients);
              break;

            case 'test_result':
              handleTestResult(message, studentClients, recruiterClients);
              break;

            case 'send_message':
              handleMessage(message, studentClients, recruiterClients);
              break;

            case 'shortlist_update':
              handleShortlistUpdate(message, studentClients, recruiterClients);
              break;

            case 'ping':
              ws.send(JSON.stringify({ type: 'pong' }));
              break;

            default:
              console.log('Unknown message type:', message.type);
          }
        } catch (err) {
          console.error('WebSocket message error:', err);
          ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
        }
      });

      ws.on('error', (error) => {
        console.error(`WebSocket error for client ${clientId}:`, error.message);
      });

      ws.on('close', () => {
        console.log(`❌ WebSocket client disconnected: ${clientId} (Total: ${wss.clients.size})`);
        studentClients.delete(clientId);
        recruiterClients.delete(clientId);
        clients.delete(clientId);
      });
    });

    wss.on('listening', () => {
      console.log(`✅ WebSocket server listening on ws://localhost:${WS_PORT}`);
      wsReady = true;
      wsAttempts = 0; // Reset on success
    });

    wss.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        wsAttempts++;
        if (wsAttempts < maxWSAttempts) {
          console.log(`⚠️  WebSocket port ${WS_PORT} is in use. Trying port ${WS_PORT + 1}...`);
          WS_PORT++;
          // Try alternate port
          initWebSocket();
        } else {
          console.error(`❌ Could not find available WebSocket port after ${maxWSAttempts} attempts (8080-${WS_PORT})`);
          // Continue with app startup anyway, ws will be unavailable
        }
      } else {
        console.error('WebSocket server error:', err);
      }
    });

  } catch (err) {
    console.error('Error creating WebSocket server:', err);
  }
}

// Store active WebSocket connections
const clients = new Map();
const studentClients = new Map();
const recruiterClients = new Map();

// Real-time data store
const realtimeData = {
  applications: [],
  placements: [],
  testResults: [],
  messages: [],
  shortlists: [],
};

// Initialize WebSocket server
initWebSocket();

// ===== WebSocket Event Handlers =====

function handleJobApplication(message, recruiterClients, ws) {
  const application = {
    id: Date.now().toString(),
    jobId: message.jobId,
    studentId: message.studentId,
    studentName: message.studentName,
    timestamp: new Date().toISOString(),
    status: 'received',
  };

  realtimeData.applications.push(application);

  // Notify all recruiters about new application
  recruiterClients.forEach((client) => {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify({
        type: 'new_application',
        data: application,
        totalApplications: realtimeData.applications.length,
      }));
    }
  });

  ws.send(JSON.stringify({ type: 'application_submitted', data: { success: true, applicationId: application.id } }));
}

function handlePlacementUpdate(message, recruiterClients) {
  const placement = {
    id: Date.now().toString(),
    studentId: message.studentId,
    studentName: message.studentName,
    ctc: message.ctc,
    position: message.position,
    company: message.company,
    timestamp: new Date().toISOString(),
  };

  realtimeData.placements.push(placement);

  // Notify all connected clients
  recruiterClients.forEach((client) => {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify({
        type: 'placement_notification',
        data: placement,
        totalPlacements: realtimeData.placements.length,
      }));
    }
  });
}

function handleTestResult(message, studentClients, recruiterClients) {
  const result = {
    id: Date.now().toString(),
    studentId: message.studentId,
    studentName: message.studentName,
    testName: message.testName,
    score: message.score,
    passed: message.score >= message.passPercentage,
    timestamp: new Date().toISOString(),
  };

  realtimeData.testResults.push(result);

  // Notify specific student
  studentClients.forEach((client) => {
    if (client.studentId === message.studentId && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify({
        type: 'test_result_notification',
        data: result,
      }));
    }
  });

  // Notify recruiters
  recruiterClients.forEach((client) => {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify({
        type: 'test_result_update',
        data: result,
      }));
    }
  });
}

function handleMessage(message, studentClients, recruiterClients) {
  const chatMessage = {
    id: Date.now().toString(),
    from: message.from,
    to: message.to,
    content: message.content,
    timestamp: new Date().toISOString(),
    type: 'message',
  };

  realtimeData.messages.push(chatMessage);

  // Notify recipient
  const allClients = new Map([...studentClients, ...recruiterClients]);
  allClients.forEach((client) => {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify({
        type: 'new_message',
        data: chatMessage,
      }));
    }
  });
}

function handleShortlistUpdate(message, studentClients, recruiterClients) {
  const shortlist = {
    id: Date.now().toString(),
    studentId: message.studentId,
    studentName: message.studentName,
    round: message.round,
    result: message.result,
    score: message.score,
    timestamp: new Date().toISOString(),
  };

  realtimeData.shortlists.push(shortlist);

  // Notify specific student
  studentClients.forEach((client) => {
    if (client.studentId === message.studentId && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify({
        type: 'shortlist_result',
        data: shortlist,
      }));
    }
  });

  // Notify recruiters
  recruiterClients.forEach((client) => {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify({
        type: 'shortlist_update',
        data: shortlist,
      }));
    }
  });
}

// Broadcast function for general updates
function broadcastUpdate(type, data) {
  const payload = JSON.stringify({ type, data, timestamp: new Date().toISOString() });
  
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

// ===== Periodic Updates (Simulate real-time data) =====
setInterval(() => {
  // Send placement statistics every 10 seconds
  const stats = {
    totalApplications: realtimeData.applications.length,
    totalPlacements: realtimeData.placements.length,
    avgCTC: realtimeData.placements.length > 0 
      ? (realtimeData.placements.reduce((sum, p) => sum + p.ctc, 0) / realtimeData.placements.length).toFixed(1)
      : 0,
    timestamp: new Date().toISOString(),
  };
  
  broadcastUpdate('statistics_update', stats);
}, 10000);

// Send connection status every 30 seconds
setInterval(() => {
  const status = {
    websocketConnections: wss.clients.size,
    studentConnections: studentClients.size,
    recruiterConnections: recruiterClients.size,
  };
  
  broadcastUpdate('connection_status', status);
}, 30000);


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

// ============================================
// 🎯 MOCK INTERVIEW APIs
// ============================================

// 1️⃣ Interview Types
app.get('/api/mock-interview/types', (req, res) => {
  const types = [
    { id: 'dsa', name: 'DSA / Coding Interview', icon: '🎯', description: 'Data Structures & Algorithms', icon_name: 'Code', color: 'from-blue-500 to-blue-600' },
    { id: 'system-design', name: 'System Design', icon: '🏗️', description: 'Large-scale systems', icon_name: 'Target', color: 'from-purple-500 to-purple-600' },
    { id: 'behavioral', name: 'Behavioral / HR', icon: '🎙️', description: 'HR & soft skills', icon_name: 'MessageSquare', color: 'from-green-500 to-green-600' },
    { id: 'cs-fundamentals', name: 'CS Fundamentals', icon: '📚', description: 'Core CS concepts', icon_name: 'BookOpen', color: 'from-yellow-500 to-yellow-600' },
    { id: 'oop-lld', name: 'OOP / LLD', icon: '🔧', description: 'Design patterns', icon_name: 'Zap', color: 'from-orange-500 to-orange-600' },
    { id: 'resume', name: 'Resume Based', icon: '📄', description: 'Project-based', icon_name: 'FileText', color: 'from-red-500 to-red-600' },
  ];
  res.json({ success: true, data: types });
});

// 2️⃣ Question Bank with Categories
app.get('/api/mock-interview/questions', (req, res) => {
  const { category, difficulty, page = 1 } = req.query;
  const categories = [
    { name: 'Arrays', problems: 145, easy: 32, medium: 78, hard: 35, id: 'arrays' },
    { name: 'Strings', problems: 98, easy: 24, medium: 52, hard: 22, id: 'strings' },
    { name: 'Dynamic Programming', problems: 112, easy: 18, medium: 65, hard: 29, id: 'dp' },
    { name: 'Graphs', problems: 134, easy: 28, medium: 78, hard: 28, id: 'graphs' },
    { name: 'Trees', problems: 156, easy: 38, medium: 82, hard: 36, id: 'trees' },
    { name: 'Heap', problems: 72, easy: 18, medium: 38, hard: 16, id: 'heap' },
    { name: 'Operating Systems', problems: 85, easy: 22, medium: 48, hard: 15, id: 'os' },
    { name: 'DBMS', problems: 76, easy: 20, medium: 42, hard: 14, id: 'dbms' },
    { name: 'Computer Networks', problems: 64, easy: 18, medium: 32, hard: 14, id: 'cn' },
    { name: 'LLD', problems: 52, easy: 8, medium: 28, hard: 16, id: 'lld' },
    { name: 'HLD', problems: 48, easy: 6, medium: 24, hard: 18, id: 'hld' },
  ];

  let filtered = categories;
  if (category) {
    filtered = filtered.filter(c => c.id === category);
  }

  res.json({ success: true, data: filtered, total: filtered.length });
});

// 3️⃣ Companies with Interview Rounds
app.get('/api/mock-interview/companies', (req, res) => {
  const companies = [
    { id: 1, name: 'Google', icon: '🔍', rounds: ['Phone Screen', 'DSA Round 1', 'DSA Round 2', 'System Design', 'Behavioral'], description: 'Google SWE Interviews' },
    { id: 2, name: 'Amazon', icon: '📦', rounds: ['OA', 'DSA Round 1', 'DSA Round 2', 'System Design', 'LP + Behavioral'], description: 'Amazon SDE Interviews' },
    { id: 3, name: 'Microsoft', icon: '💻', rounds: ['Online Assessment', 'DSA', 'System Design', 'LLD', 'Behavioral'], description: 'Microsoft SDE Interviews' },
    { id: 4, name: 'Uber', icon: '🚗', rounds: ['Coding', 'System Design', 'LLD', 'Product Design', 'Behavioral'], description: 'Uber Interview Process' },
    { id: 5, name: 'Atlassian', icon: '⚙️', rounds: ['Machine Coding', 'System Design', 'Behavioral'], description: 'Atlassian Interview Process' },
  ];
  res.json({ success: true, data: companies });
});

// 4️⃣ Start Interview Session
app.post('/api/mock-interview/sessions', (req, res) => {
  const { userId, interviewType, companyId } = req.body;
  const sessionId = 'sess_' + Date.now();
  
  const session = {
    id: sessionId,
    userId,
    interviewType,
    companyId,
    startTime: new Date(),
    status: 'in-progress',
    questions: [],
    responses: [],
    score: null,
  };
  
  res.json({ success: true, data: session });
});

// 5️⃣ Get Interview Questions (dynamic based on type)
app.get('/api/mock-interview/sessions/:sessionId/questions', (req, res) => {
  const { sessionId } = req.params;
  const { type } = req.query;
  
  const questionSamples = {
    dsa: [
      { id: 1, question: 'Two Sum: Find two numbers that add up to target', difficulty: 'easy', company: 'Google' },
      { id: 2, question: 'LRU Cache Implementation', difficulty: 'hard', company: 'Amazon' },
      { id: 3, question: 'Merge K Sorted Lists', difficulty: 'hard', company: 'Microsoft' },
    ],
    behavioral: [
      { id: 1, question: 'Tell me about yourself', difficulty: 'easy', company: 'Any' },
      { id: 2, question: 'Describe a challenge you overcame', difficulty: 'medium', company: 'Any' },
    ],
    'system-design': [
      { id: 1, question: 'Design a URL Shortening Service', difficulty: 'hard', company: 'Google' },
      { id: 2, question: 'Design Twitter', difficulty: 'hard', company: 'Facebook' },
    ],
  };
  
  const questions = questionSamples[type] || questionSamples.dsa;
  res.json({ success: true, data: questions });
});

// 6️⃣ Submit Interview Response
app.post('/api/mock-interview/sessions/:sessionId/response', (req, res) => {
  const { sessionId } = req.params;
  const { questionId, answer, timeSpent } = req.body;
  
  // Simulate AI evaluation
  const score = Math.floor(Math.random() * 100);
  const feedback = score > 80 ? 'Excellent!' : score > 60 ? 'Good work!' : 'Needs improvement';
  
  res.json({ 
    success: true, 
    data: { questionId, score, feedback, timeSpent }
  });
});

// 7️⃣ Submit Interview & Get Feedback
app.post('/api/mock-interview/sessions/:sessionId/submit', (req, res) => {
  const { sessionId } = req.params;
  
  const feedback = {
    communicationScore: 78,
    problemSolvingScore: 85,
    optimalityScore: 72,
    confidenceScore: 80,
    timeManagementScore: 76,
    technicalDepthScore: 82,
    fillerWords: { um: 12, like: 8, uh: 5 },
    edgeCasesMissed: ['Empty arrays', 'Negative numbers', 'Duplicates'],
    strengths: ['Clear thinking', 'Good communication', 'Problem understanding'],
    improvements: ['Optimize solution', 'Practice edge cases', 'Reduce filler words'],
    overallScore: 78,
  };
  
  res.json({ success: true, data: feedback });
});

// 8️⃣ User Progress & Stats
app.get('/api/mock-interview/user/:userId/progress', (req, res) => {
  const { userId } = req.params;
  
  const progress = {
    userId,
    dailyStreak: 7,
    interviewsTaken: 24,
    averageScore: 78.5,
    topicsMastered: 8,
    companiesSolved: ['Google', 'Amazon', 'Microsoft'],
    weakTopics: ['Dynamic Programming', 'System Design'],
    scoreHistory: [65, 72, 78, 75, 80, 82, 78],
    weeklyStats: {
      interviewsThisWeek: 5,
      hoursSpent: 12.5,
      averageWeeklyScore: 79,
    },
  };
  
  res.json({ success: true, data: progress });
});

// 9️⃣ Subscription Plans
app.get('/api/mock-interview/plans', (req, res) => {
  const plans = [
    { 
      id: 'free', 
      name: 'Free', 
      price: 0, 
      description: 'Get started for free',
      features: ['3 mocks/week', 'Basic feedback', 'DSA only', 'Limited questions'],
      limits: { mocksPerWeek: 3, questionAccess: 'limited' }
    },
    { 
      id: 'pro', 
      name: 'Pro', 
      price: 9.99, 
      period: 'month',
      description: 'Everything you need to ace interviews',
      features: ['Unlimited mocks', 'AI voice', 'Company rounds', 'Resume mocks', 'Full analytics', 'Peer mocks'],
      limits: { mocksPerWeek: 999, questionAccess: 'unlimited' }
    },
    { 
      id: 'premium', 
      name: 'Premium', 
      price: 19.99,  
      period: 'month',
      description: 'All-in-one interview preparation',
      features: ['Everything in Pro', 'Mentor sessions', '1-on-1 guidance', 'Interview recordings', 'Priority support'],
      limits: { mocksPerWeek: 999, questionAccess: 'unlimited', mentorSessions: 10 }
    },
  ];
  
  res.json({ success: true, data: plans });
});

// 🔟 Peer Matching
app.get('/api/mock-interview/peers', (req, res) => {
  const peers = [
    { id: 1, name: 'Priya Sharma', title: 'Software Engineer', experience: '3 years', specialization: 'DSA & System Design', rating: 4.8, available: true },
    { id: 2, name: 'Amit Patel', title: 'Product Manager', experience: '5 years', specialization: 'Behavioral & PM Rounds', rating: 4.9, available: true },
    { id: 3, name: 'Neha Singh', title: 'Software Engineer', experience: '2 years', specialization: 'Frontend & React', rating: 4.7, available: false },
  ];
  
  res.json({ success: true, data: peers });
});

// 1️⃣1️⃣ Resume Upload & Extract
app.post('/api/mock-interview/resume/upload', (req, res) => {
  const { userId, resumeData } = req.body;
  
  const extracted = {
    projects: ['E-commerce Platform', 'ML Recommendation System', 'Real-time Chat App'],
    skills: ['React', 'Node.js', 'Python', 'AWS'],
    experience: ['2 years at TechCorp', '1 year intern at StartupXYZ'],
    suggestedQuestions: [
      'Tell us about your E-commerce Platform project',
      'How did you handle scalability in your chat application?',
    ],
  };
  
  res.json({ success: true, data: extracted });
});


// ===== TNP Portal Real-Time APIs =====

// Get real-time applications
app.get('/api/tnp/applications', (req, res) => {
  res.json({ success: true, data: realtimeData.applications, count: realtimeData.applications.length });
});

// Get real-time placements
app.get('/api/tnp/placements', (req, res) => {
  res.json({ success: true, data: realtimeData.placements, count: realtimeData.placements.length });
});

// Get test results
app.get('/api/tnp/test-results', (req, res) => {
  res.json({ success: true, data: realtimeData.testResults, count: realtimeData.testResults.length });
});

// Get shortlist updates
app.get('/api/tnp/shortlists', (req, res) => {
  res.json({ success: true, data: realtimeData.shortlists, count: realtimeData.shortlists.length });
});

// Get messages
app.get('/api/tnp/messages', (req, res) => {
  const { from, to } = req.query;
  let filtered = realtimeData.messages;
  
  if (from && to) {
    filtered = filtered.filter(m => (m.from === from && m.to === to) || (m.from === to && m.to === from));
  }
  
  res.json({ success: true, data: filtered, count: filtered.length });
});

// Submit job application via REST
app.post('/api/tnp/apply', (req, res) => {
  const { jobId, studentId, studentName } = req.body;
  
  const application = {
    id: Date.now().toString(),
    jobId,
    studentId,
    studentName,
    timestamp: new Date().toISOString(),
    status: 'received',
  };
  
  realtimeData.applications.push(application);
  
  // Broadcast to all connected WebSocket clients
  broadcastUpdate('new_application', application);
  
  res.json({ success: true, data: application });
});

// Record placement via REST
app.post('/api/tnp/placement', (req, res) => {
  const { studentId, studentName, ctc, position, company } = req.body;
  
  const placement = {
    id: Date.now().toString(),
    studentId,
    studentName,
    ctc,
    position,
    company,
    timestamp: new Date().toISOString(),
  };
  
  realtimeData.placements.push(placement);
  
  // Broadcast to all connected WebSocket clients
  broadcastUpdate('placement_notification', placement);
  
  res.json({ success: true, data: placement });
});

// Submit test result via REST
app.post('/api/tnp/test-result', (req, res) => {
  const { studentId, studentName, testName, score, passPercentage } = req.body;
  
  const result = {
    id: Date.now().toString(),
    studentId,
    studentName,
    testName,
    score,
    passed: score >= passPercentage,
    timestamp: new Date().toISOString(),
  };
  
  realtimeData.testResults.push(result);
  
  // Broadcast to WebSocket clients
  broadcastUpdate('test_result_update', result);
  
  res.json({ success: true, data: result });
});

// Update shortlist via REST
app.post('/api/tnp/shortlist', (req, res) => {
  const { studentId, studentName, round, result, score } = req.body;
  
  const shortlist = {
    id: Date.now().toString(),
    studentId,
    studentName,
    round,
    result,
    score,
    timestamp: new Date().toISOString(),
  };
  
  realtimeData.shortlists.push(shortlist);
  
  // Broadcast to WebSocket clients
  broadcastUpdate('shortlist_update', shortlist);
  
  res.json({ success: true, data: shortlist });
});

// Send message via REST
app.post('/api/tnp/message', (req, res) => {
  const { from, to, content } = req.body;
  
  const message = {
    id: Date.now().toString(),
    from,
    to,
    content,
    timestamp: new Date().toISOString(),
    type: 'message',
  };
  
  realtimeData.messages.push(message);
  
  // Broadcast to WebSocket clients
  broadcastUpdate('new_message', message);
  
  res.json({ success: true, data: message });
});

// Get real-time statistics
app.get('/api/tnp/stats', (req, res) => {
  const stats = {
    totalApplications: realtimeData.applications.length,
    totalPlacements: realtimeData.placements.length,
    avgCTC: realtimeData.placements.length > 0 
      ? (realtimeData.placements.reduce((sum, p) => sum + p.ctc, 0) / realtimeData.placements.length).toFixed(1)
      : 0,
    placementRate: realtimeData.applications.length > 0
      ? ((realtimeData.placements.length / realtimeData.applications.length) * 100).toFixed(1)
      : 0,
    testsPassed: realtimeData.testResults.filter(t => t.passed).length,
    testsTaken: realtimeData.testResults.length,
    websocketConnections: wss.clients.size,
    timestamp: new Date().toISOString(),
  };
  
  res.json({ success: true, data: stats });
});

// Get WebSocket connection status
app.get('/api/tnp/ws-status', (req, res) => {
  const status = {
    websocketPort: WS_PORT,
    totalConnections: wss.clients.size,
    studentConnections: studentClients.size,
    recruiterConnections: recruiterClients.size,
    isRunning: true,
    dataStore: {
      applications: realtimeData.applications.length,
      placements: realtimeData.placements.length,
      testResults: realtimeData.testResults.length,
      messages: realtimeData.messages.length,
      shortlists: realtimeData.shortlists.length,
    },
    timestamp: new Date().toISOString(),
  };
  
  res.json({ success: true, data: status });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend server is running' });
});

// Start server with port fallback
let currentPort = PORT;
const maxPortAttempts = 10;
let portAttempt = 0;

function startServer() {
  const server = app.listen(currentPort, () => {
    console.log(`🚀 Backend server running on http://localhost:${currentPort}`);
    console.log(`📊 Jobs API available at http://localhost:${currentPort}/api/jobs/enriched`);
    console.log(`🏢 Companies API available at http://localhost:${currentPort}/api/companies`);
    console.log(`👥 Recruiters API available at http://localhost:${currentPort}/api/recruiters`);
    console.log(`✅ Health check at http://localhost:${currentPort}/api/health`);
    console.log(`🔌 WebSocket server running on ws://localhost:${WS_PORT}`);
    console.log(`📡 Real-time updates: job applications, placements, test results, and messages`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      portAttempt++;
      if (portAttempt < maxPortAttempts) {
        currentPort++;
        console.log(`⚠️  Port ${currentPort - 1} is in use. Trying port ${currentPort}...`);
        startServer();
      } else {
        console.error(`❌ Could not find available port after ${maxPortAttempts} attempts (${PORT}-${currentPort}).`);
        process.exit(1);
      }
    } else {
      throw err;
    }
  });
}

startServer();
