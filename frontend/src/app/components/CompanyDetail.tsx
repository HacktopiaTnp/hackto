import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Box, Typography, Paper, Tabs, Tab, Card, CardContent, Chip, Button, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl,
  InputLabel, Select, MenuItem, Grid, Alert, Tooltip, LinearProgress, Container,
  Snackbar, Checkbox, FormControlLabel, Switch, Avatar, Rating, Accordion,
  AccordionSummary, AccordionDetails, Badge, Skeleton, FormGroup, CircularProgress
} from '@mui/material';
import {
  Edit as EditIcon, Delete as DeleteIcon, Download as DownloadIcon,
  Add as AddIcon, Close as CloseIcon, Save as SaveIcon, Email as EmailIcon,
  Call as CallIcon, GetApp as GetAppIcon, ExpandMore as ExpandMoreIcon,
  Download as FileDownloadIcon, Send as SendIcon, PhoneSmsOutlined as PhoneIcon,
  FileDownload, TrendingUp, People, School, Work, CalendarToday, LocationOn,
  Business, CloudDownload, Notifications, Check, History, Info, Warning,
  VerifiedUser, Star, CheckCircle, CancelOutlined, Schedule, Videocam
} from '@mui/icons-material';
import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, ScatterChart, Scatter
} from 'recharts';
import { detectBackendPort } from '@/utils/portDetection';

// ========== INTERFACES ==========
interface Company {
  id: string;
  name: string;
  logo: string;
  industry: string;
  description: string;
  website: string;
  headquarters: string;
  companySize: string;
  recruiterContact: string;
  recruiterPhone: string;
  recruiterEmail: string;
  hrManager: string;
  pastHiringStats: { year: number; hired: number; roles: number }[];
  rolesHistory: string[];
  yearsEstablished: number;
}

interface JobAnnouncement {
  id: string;
  roleTitle: string;
  type: 'Internship' | 'FTE' | 'Co-op' | 'Campus Ambassador';
  ctc: number;
  stipend?: number;
  location: string;
  description: string;
  skillsRequired: string[];
  branchesAllowed: string[];
  cgpaRequired: number;
  backlogs: number;
  passingYear: string[];
  selectionRounds: string[];
  bondDetails: string;
  deadlineDate: string;
  noOfPositions: number;
  applicants: number;
  shortlisted: number;
  selected: number;
}

interface Student {
  id: string;
  name: string;
  rollNo: string;
  branch: string;
  cgpa: number;
  board10: number;
  board12: number;
  backlogs: number;
  gender: 'M' | 'F' | 'Other';
  email: string;
  phone: string;
  skills: string[];
  projects: number;
  internships: number;
  codingScore: number;
  atsScore: number;
  resumeUrl: string;
  achievements: string[];
  previousPlaced: boolean;
  status: 'Eligible' | 'Applied' | 'Shortlisted' | 'Rejected' | 'Selected' | 'Placed';
}

interface RecruitmentRound {
  roundNo: number;
  name: string;
  date: string;
  time: string;
  venue: string;
  meetingLink?: string;
  type: 'PPT' | 'OA' | 'Coding' | 'GD' | 'Technical' | 'HR';
  totalParticipants: number;
  qualified: number;
  duration?: number;
}

// ========== MOCK DATA ==========
const MOCK_COMPANY: Company = {
  id: 'comp_001',
  name: 'TechVision Solutions',
  logo: '🚀',
  industry: 'Software & IT Services',
  description: 'Leading enterprise software company providing AI, cloud, and digital transformation solutions globally.',
  website: 'www.techvision.in',
  headquarters: 'Bangalore, Karnataka',
  companySize: '1000-5000 employees',
  recruiterContact: 'careers@techvision.in',
  recruiterPhone: '+91-9876543210',
  recruiterEmail: 'hr@techvision.in',
  hrManager: 'Mr. Rajesh Kumar',
  pastHiringStats: [
    { year: 2021, hired: 18, roles: 5 },
    { year: 2022, hired: 32, roles: 8 },
    { year: 2023, hired: 45, roles: 10 },
    { year: 2024, hired: 52, roles: 12 },
  ],
  rolesHistory: ['SDE', 'Data Engineer', 'DevOps', 'QA', 'PM'],
  yearsEstablished: 12,
};

const MOCK_JOBS: JobAnnouncement[] = [
  {
    id: 'job_001',
    roleTitle: 'Senior Software Engineer - Full Stack',
    type: 'FTE',
    ctc: 20,
    location: 'Bangalore',
    description: 'Build scalable microservices architecture using React, Node.js, and AWS.',
    skillsRequired: ['React', 'Node.js', 'Docker', 'AWS', 'PostgreSQL'],
    branchesAllowed: ['CSE', 'IT'],
    cgpaRequired: 7.0,
    backlogs: 0,
    passingYear: ['2024', '2025'],
    selectionRounds: ['PPT', 'Online OA', 'Tech Round 1', 'Tech Round 2', 'HR'],
    bondDetails: '1 year bond at location',
    deadlineDate: '2026-05-15',
    noOfPositions: 8,
    applicants: 145,
    shortlisted: 48,
    selected: 8,
  },
  {
    id: 'job_002',
    roleTitle: 'Data Engineer',
    type: 'FTE',
    ctc: 18,
    location: 'Bangalore',
    description: 'Work with big data, Spark, and cloud data warehousing solutions.',
    skillsRequired: ['Python', 'SQL', 'Spark', 'AWS', 'Data Engineering'],
    branchesAllowed: ['CSE', 'IT', 'ECE'],
    cgpaRequired: 6.8,
    backlogs: 1,
    passingYear: ['2024', '2025'],
    selectionRounds: ['PPT', 'Online OA', 'Tech Round', 'HR'],
    bondDetails: 'No bond',
    deadlineDate: '2026-05-20',
    noOfPositions: 5,
    applicants: 98,
    shortlisted: 32,
    selected: 5,
  },
];

const MOCK_STUDENTS: Student[] = [
  {
    id: 's_001',
    name: 'Rahul Kumar',
    rollNo: 'BCS2022001',
    branch: 'CSE',
    cgpa: 8.5,
    board10: 95,
    board12: 92,
    backlogs: 0,
    gender: 'M',
    email: 'rahul.kumar@college.edu',
    phone: '+91-9876543210',
    skills: ['React', 'Node.js', 'Python', 'AWS', 'Docker', 'PostgreSQL'],
    projects: 5,
    internships: 2,
    codingScore: 92,
    atsScore: 88,
    resumeUrl: 'resume_rahul.pdf',
    achievements: ['InternWise Winner 2024', 'Hackathon 2nd Prize', 'Tech Speaker'],
    previousPlaced: false,
    status: 'Eligible',
  },
  {
    id: 's_002',
    name: 'Priya Sharma',
    rollNo: 'BCS2022002',
    branch: 'CSE',
    cgpa: 9.1,
    board10: 98,
    board12: 96,
    backlogs: 0,
    gender: 'F',
    email: 'priya.sharma@college.edu',
    phone: '+91-8765432109',
    skills: ['Python', 'Machine Learning', 'SQL', 'AWS', 'Data Analysis'],
    projects: 7,
    internships: 3,
    codingScore: 95,
    atsScore: 92,
    resumeUrl: 'resume_priya.pdf',
    achievements: ['Best Paper Award', 'Research Publication', 'Toppers List'],
    previousPlaced: false,
    status: 'Eligible',
  },
  {
    id: 's_003',
    name: 'Amit Patel',
    rollNo: 'BIT2022045',
    branch: 'IT',
    cgpa: 7.8,
    board10: 88,
    board12: 90,
    backlogs: 0,
    gender: 'M',
    email: 'amit.patel@college.edu',
    phone: '+91-9123456789',
    skills: ['Java', 'Spring Boot', 'MongoDB', 'Angular', 'DevOps'],
    projects: 4,
    internships: 1,
    codingScore: 80,
    atsScore: 75,
    resumeUrl: 'resume_amit.pdf',
    achievements: ['Dean\s List', 'Coding Contest Winner'],
    previousPlaced: false,
    status: 'Eligible',
  },
];

const MOCK_ROUNDS: RecruitmentRound[] = [
  { roundNo: 1, name: 'Pre-Placement Talk (PPT)', date: '2026-04-10', time: '02:00 PM', venue: 'Auditorium', type: 'PPT', totalParticipants: 200, qualified: 200, duration: 60 },
  { roundNo: 2, name: 'Online Assessment (OA)', date: '2026-04-15', time: '10:00 AM', venue: 'Online', type: 'OA', totalParticipants: 150, qualified: 67, duration: 120, meetingLink: 'https://meet.example.com' },
  { roundNo: 3, name: 'DSA/Coding Round', date: '2026-04-22', time: '02:00 PM', venue: 'Office', type: 'Coding', totalParticipants: 67, qualified: 45, duration: 90 },
  { roundNo: 4, name: 'Technical Interview', date: '2026-04-28', time: '10:00 AM', venue: 'Office', type: 'Technical', totalParticipants: 45, qualified: 28, duration: 60 },
  { roundNo: 5, name: 'HR Round', date: '2026-05-05', time: '02:00 PM', venue: 'Office', type: 'HR', totalParticipants: 28, qualified: 20, duration: 30 },
];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index } = props;
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

// ========== SECTION 1: Company Profile ==========
const CompanyProfileSection: React.FC = () => {
  const [company, setCompany] = useState<Company>(MOCK_COMPANY);
  const [editMode, setEditMode] = useState(false);
  const [tempCompany, setTempCompany] = useState<Company>(MOCK_COMPANY);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const handleSave = () => {
    setCompany(tempCompany);
    setEditMode(false);
    setSnackbar({ open: true, message: '✅ Company profile updated successfully!' });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>🏭 Company Profile</Typography>
        <Button
          startIcon={editMode ? <SaveIcon /> : <EditIcon />}
          variant="contained"
          onClick={() => (editMode ? handleSave() : (setTempCompany(company), setEditMode(true)))}
          color={editMode ? 'success' : 'primary'}
          size="small"
        >
          {editMode ? 'Save Changes' : 'Edit Profile'}
        </Button>
      </Box>

      {editMode && <Alert severity="info" icon={<Info />}>Editing company information</Alert>}

      <Paper sx={{ p: { xs: 2, md: 3 }, backgroundColor: '#f8f9fa' }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Company Name" value={editMode ? tempCompany.name : company.name} onChange={(e) => editMode && setTempCompany({ ...tempCompany, name: e.target.value })} disabled={!editMode} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Website" value={editMode ? tempCompany.website : company.website} onChange={(e) => editMode && setTempCompany({ ...tempCompany, website: e.target.value })} disabled={!editMode} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Industry" value={editMode ? tempCompany.industry : company.industry} onChange={(e) => editMode && setTempCompany({ ...tempCompany, industry: e.target.value })} disabled={!editMode} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Headquarters" value={editMode ? tempCompany.headquarters : company.headquarters} onChange={(e) => editMode && setTempCompany({ ...tempCompany, headquarters: e.target.value })} disabled={!editMode} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="HR Manager" value={editMode ? tempCompany.hrManager : company.hrManager} onChange={(e) => editMode && setTempCompany({ ...tempCompany, hrManager: e.target.value })} disabled={!editMode} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Contact Email" value={editMode ? tempCompany.recruiterEmail : company.recruiterEmail} onChange={(e) => editMode && setTempCompany({ ...tempCompany, recruiterEmail: e.target.value })} disabled={!editMode} />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Description" multiline rows={3} value={editMode ? tempCompany.description : company.description} onChange={(e) => editMode && setTempCompany({ ...tempCompany, description: e.target.value })} disabled={!editMode} />
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={2}>
        {[
          { label: 'Employees', value: company.companySize, icon: '👥' },
          { label: 'Est. Year', value: company.yearsEstablished, icon: '📅' },
          { label: 'Past Hires', value: MOCK_COMPANY.pastHiringStats.reduce((a, b) => a + b.hired, 0), icon: '✅' },
          { label: 'Avg CTC', value: '₹18-22 LPA', icon: '💰' },
        ].map((stat, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Card sx={{ textAlign: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <CardContent>
                <Typography variant="h4">{stat.icon}</Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 1 }}>{stat.value}</Typography>
                <Typography variant="caption">{stat.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ open: false, message: '' })} message={snackbar.message} />
    </Box>
  );
};

// ========== SECTION 2: Job Announcements ==========
const JobAnnouncementSection: React.FC<{ companyId?: string }> = ({ companyId = 'google' }) => {
  const [jobs, setJobs] = useState<JobAnnouncement[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobAnnouncement | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newJob, setNewJob] = useState({
    roleTitle: '',
    type: 'FTE' as 'Internship' | 'FTE' | 'Co-op' | 'Campus Ambassador',
    ctc: '',
    location: '',
    description: '',
  });

  // Fetch jobs from backend API
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError(null);
        const backendUrl = await detectBackendPort();
        
        const response = await fetch(`${backendUrl}/api/v1/companies/${companyId}/jobs`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch company jobs');
        }
        
        const data = await response.json();
        
        // Extract array from API response
        let jobsArray: any[] = [];
        if (Array.isArray(data)) {
          jobsArray = data;
        } else if (data && typeof data === 'object' && Array.isArray(data.data)) {
          jobsArray = data.data;
        }
        
        // Transform API response to match JobAnnouncement interface
        const transformedJobs: JobAnnouncement[] = jobsArray.map((job: any, index: number) => ({
          id: job.id || `job_${index + 1}`,
          roleTitle: job.role || job.title || 'Position',
          type: job.type || 'FTE',
          ctc: job.ctc ? parseInt(job.ctc.toString()) : 15,
          location: job.location || 'Bangalore',
          description: job.description || 'Job description not available',
          skillsRequired: job.skills || ['React', 'Node.js', 'Python'],
          branchesAllowed: job.branches || ['CSE', 'IT'],
          cgpaRequired: job.cgpa || 7.0,
          backlogs: job.backlogs || 0,
          passingYear: job.passingYear || ['2026'],
          selectionRounds: job.selectionRounds || ['PPT', 'Technical', 'HR'],
          bondDetails: job.bondDetails || 'No bond',
          deadlineDate: job.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          noOfPositions: job.noOfPositions || 5,
          applicants: job.applicants || 0,
          shortlisted: job.shortlisted || 0,
          selected: job.selected || 0,
        }));
        
        setJobs(transformedJobs);
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError('Failed to load company jobs');
        // Fallback to mock data
        setJobs(MOCK_JOBS);
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobs();
  }, [companyId]);

  const handleAddJob = () => {
    setOpenAddDialog(true);
  };

  const handleSaveNewJob = async () => {
    if (!newJob.roleTitle || !newJob.ctc || !newJob.location) {
      setSnackbar({ open: true, message: '⚠️ Please fill all required fields' });
      return;
    }

    // Parse and validate CTC
    const parsedCTC = parseFloat(newJob.ctc);
    if (isNaN(parsedCTC) || parsedCTC <= 0) {
      setSnackbar({ open: true, message: '⚠️ Please enter a valid CTC value' });
      return;
    }

    const job: JobAnnouncement = {
      id: `job_${Date.now()}`,
      roleTitle: newJob.roleTitle,
      type: newJob.type,
      ctc: parsedCTC,
      location: newJob.location,
      description: newJob.description,
      skillsRequired: ['React', 'Node.js'],
      branchesAllowed: ['CSE', 'IT'],
      cgpaRequired: 7.0,
      backlogs: 0,
      passingYear: ['2026'],
      selectionRounds: ['PPT', 'Technical', 'HR'],
      bondDetails: 'No bond',
      deadlineDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      noOfPositions: 5,
      applicants: 0,
      shortlisted: 0,
      selected: 0,
    };

    try {
      // Post new job to backend
      const backendUrl = await detectBackendPort();
      const response = await fetch(`${backendUrl}/api/v1/companies/${companyId}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roleTitle: newJob.roleTitle,
          type: newJob.type,
          ctc: newJob.ctc,
          location: newJob.location,
          description: newJob.description,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create job on backend');
      }

      const backendResponse = await response.json();
      console.log('Job created on backend:', backendResponse);

      // Add to local state
      setJobs([...jobs, job]);
      setOpenAddDialog(false);
      setNewJob({ roleTitle: '', type: 'FTE', ctc: '', location: '', description: '' });
      setSnackbar({ open: true, message: '✅ New job added successfully!' });
    } catch (error) {
      console.error('Error creating job:', error);
      // Still add to local state as fallback
      setJobs([...jobs, job]);
      setOpenAddDialog(false);
      setNewJob({ roleTitle: '', type: 'FTE', ctc: '', location: '', description: '' });
      setSnackbar({ open: true, message: '✅ New job added successfully (local)!' });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>📋 Job Announcements ({jobs.length})</Typography>
        <Button startIcon={<AddIcon />} variant="contained" onClick={handleAddJob} size="small" color="success">
          Add Job
        </Button>
      </Box>

      {error && <Alert severity="warning">{error}</Alert>}

      {jobs.length === 0 ? (
        <Card sx={{ p: 3, textAlign: 'center', backgroundColor: '#f5f5f5' }}>
          <Typography color="textSecondary">No jobs posted yet</Typography>
          <Button startIcon={<AddIcon />} variant="outlined" sx={{ mt: 2 }} onClick={handleAddJob}>
            Post First Job
          </Button>
        </Card>
      ) : (
        <TableContainer component={Paper} sx={{ overflowX: { xs: 'auto', md: 'visible' } }}>
          <Table size="small">
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', fontSize: { xs: '0.75rem', md: '0.875rem' } }}>Role</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: { xs: '0.75rem', md: '0.875rem' } }}>Type</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: { xs: '0.75rem', md: '0.875rem' }, display: { xs: 'none', sm: 'table-cell' } }}>CTC</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: { xs: '0.75rem', md: '0.875rem' } }}>CGPA</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: { xs: '0.75rem', md: '0.875rem' }, display: { xs: 'none', md: 'table-cell' } }}>Applied</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: { xs: '0.75rem', md: '0.875rem' }, display: { xs: 'none', md: 'table-cell' } }}>Selected</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: { xs: '0.75rem', md: '0.875rem' } }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                  <TableCell sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' }, fontWeight: 'bold' }}>{job.roleTitle}</TableCell>
                  <TableCell align="center"><Chip label={job.type} size="small" color="primary" /></TableCell>
                  <TableCell align="right" sx={{ display: { xs: 'none', sm: 'table-cell' }, fontSize: { xs: '0.75rem', md: '0.875rem' } }}>₹{job.ctc} LPA</TableCell>
                  <TableCell align="center" sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>{job.cgpaRequired}</TableCell>
                  <TableCell align="center" sx={{ display: { xs: 'none', md: 'table-cell' }, fontSize: { xs: '0.75rem', md: '0.875rem' } }}>{job.applicants}</TableCell>
                  <TableCell align="center" sx={{ display: { xs: 'none', md: 'table-cell' }, fontSize: { xs: '0.75rem', md: '0.875rem' } }}><Chip label={job.selected} color="success" size="small" /></TableCell>
                  <TableCell align="center">
                    <IconButton onClick={() => { setSelectedJob(job); setOpenDialog(true); }} size="small" title="View Details">
                      <ExpandMoreIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add Job Dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Job Posting</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label="Role Title"
            fullWidth
            value={newJob.roleTitle}
            onChange={(e) => setNewJob({ ...newJob, roleTitle: e.target.value })}
            placeholder="e.g., Senior Software Engineer"
          />
          <FormControl fullWidth>
            <InputLabel>Job Type</InputLabel>
            <Select
              value={newJob.type}
              onChange={(e) => setNewJob({ ...newJob, type: e.target.value as any })}
              label="Job Type"
            >
              <MenuItem value="FTE">Full-Time (FTE)</MenuItem>
              <MenuItem value="Internship">Internship</MenuItem>
              <MenuItem value="Co-op">Co-op</MenuItem>
              <MenuItem value="Campus Ambassador">Campus Ambassador</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="CTC (in LPA)"
            fullWidth
            type="text"
            inputMode="numeric"
            value={newJob.ctc}
            onChange={(e) => {
              // Only allow valid numbers
              const val = e.target.value;
              if (val === '' || !isNaN(Number(val))) {
                setNewJob({ ...newJob, ctc: val });
              }
            }}
            placeholder="e.g., 20"
          />
          <TextField
            label="Location"
            fullWidth
            value={newJob.location}
            onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
            placeholder="e.g., Bangalore"
          />
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={newJob.description}
            onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
            placeholder="Job description"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveNewJob} variant="contained" color="success">
            Add Job
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Job Details Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedJob?.roleTitle} - Details</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2, maxHeight: '60vh', overflowY: 'auto' }}>
          {selectedJob && (
            <>
              <Box><strong>ID:</strong> {selectedJob.id}</Box>
              <Box><strong>Type:</strong> {selectedJob.type} | <strong>CTC:</strong> ₹{selectedJob.ctc} LPA</Box>
              <Box><strong>Location:</strong> {selectedJob.location}</Box>
              <Box><strong>Description:</strong><br />{selectedJob.description}</Box>
              <Box><strong>Skills Required:</strong><br />{selectedJob.skillsRequired.join(', ')}</Box>
              <Box><strong>Branches:</strong> {selectedJob.branchesAllowed.join(', ')}</Box>
              <Box><strong>CGPA Required:</strong> {selectedJob.cgpaRequired} | <strong>Backlogs:</strong> {selectedJob.backlogs}</Box>
              <Box><strong>Passing Years:</strong> {selectedJob.passingYear.join(', ')}</Box>
              <Box><strong>Selection Rounds:</strong><br />{selectedJob.selectionRounds.join(' → ')}</Box>
              <Box><strong>Bond Details:</strong> {selectedJob.bondDetails}</Box>
              <Box><strong>Deadline:</strong> {selectedJob.deadlineDate}</Box>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ open: false, message: '' })} message={snackbar.message} />
    </Box>
  );
};

// ========== SECTION 3: Eligibility Filter Engine ==========
const EligibilityFilterEngine: React.FC = () => {
  const [filters, setFilters] = useState({
    branches: ['CSE', 'IT'],
    minCGPA: 7.0,
    maxBacklogs: 0,
    genderDiversity: true,
    excludePreviouslyPlaced: false,
  });

  const filteredStudents = useMemo(() => {
    return MOCK_STUDENTS.filter(s =>
      filters.branches.includes(s.branch) &&
      s.cgpa >= filters.minCGPA &&
      s.backlogs <= filters.maxBacklogs &&
      (!filters.excludePreviouslyPlaced || !s.previousPlaced)
    );
  }, [filters]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Alert severity="success" icon={<CheckCircle />}>✅ {filteredStudents.length} eligible students found</Alert>

      <Paper sx={{ p: { xs: 1.5, md: 2.5 }, backgroundColor: '#f8f9fa' }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Branches</InputLabel>
              <Select multiple value={filters.branches} onChange={(e) => setFilters({ ...filters, branches: typeof e.target.value === 'string' ? [e.target.value] : e.target.value as string[] })}>
                <MenuItem value="CSE">CSE</MenuItem>
                <MenuItem value="IT">IT</MenuItem>
                <MenuItem value="ECE">ECE</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth type="number" label="Min CGPA" inputProps={{ step: 0.1, min: 5, max: 10 }} value={filters.minCGPA} onChange={(e) => setFilters({ ...filters, minCGPA: parseFloat(e.target.value) })} size="small" />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth type="number" label="Max Backlogs" inputProps={{ min: 0, max: 5 }} value={filters.maxBacklogs} onChange={(e) => setFilters({ ...filters, maxBacklogs: parseInt(e.target.value) })} size="small" />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel control={<Checkbox checked={filters.genderDiversity} onChange={(e) => setFilters({ ...filters, genderDiversity: e.target.checked })} />} label="Gender Diversity Hiring" />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel control={<Checkbox checked={filters.excludePreviouslyPlaced} onChange={(e) => setFilters({ ...filters, excludePreviouslyPlaced: e.target.checked })} />} label="Exclude Previously Placed" />
          </Grid>
        </Grid>
      </Paper>

      <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 2 }}>Eligible Students</Typography>
      <Grid container spacing={1.5}>
        {filteredStudents.map((student) => (
          <Grid item xs={12} sm={6} md={4} key={student.id}>
            <Card sx={{ cursor: 'pointer', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.02)', boxShadow: 3 } }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Avatar sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>{student.name.charAt(0)}</Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{student.name}</Typography>
                    <Typography variant="caption" color="textSecondary">{student.rollNo}</Typography>
                  </Box>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <Box>CGPA: <strong>{student.cgpa}</strong></Box>
                  <Box>{student.branch}</Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

// ========== SECTION 4: Eligible Students Dashboard ==========
const EligibleStudentsDashboard: React.FC = () => {
  const [students] = useState<Student[]>(MOCK_STUDENTS);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const handleAction = (action: string, student: Student) => {
    setSnackbar({ open: true, message: `${action} ${student.name} - Action triggered!` });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>👨‍🎓 Student Roster ({students.length} students)</Typography>

      <TableContainer component={Paper} sx={{ overflowX: { xs: 'auto', md: 'visible' } }}>
        <Table size="small">
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', fontSize: { xs: '0.75rem', md: '0.875rem' } }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: { xs: '0.75rem', md: '0.875rem' } }}>Roll</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: { xs: '0.75rem', md: '0.875rem' }, display: { xs: 'none', sm: 'table-cell' } }}>Branch</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: { xs: '0.75rem', md: '0.875rem' } }}>CGPA</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: { xs: '0.75rem', md: '0.875rem' }, display: { xs: 'none', md: 'table-cell' } }}>Coding</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: { xs: '0.75rem', md: '0.875rem' } }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((s) => (
              <TableRow key={s.id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                <TableCell sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' }, color: '#1976d2', cursor: 'pointer', fontWeight: '500' }} onClick={() => { setSelectedStudent(s); setOpenDialog(true); }}>{s.name}</TableCell>
                <TableCell sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>{s.rollNo}</TableCell>
                <TableCell align="center" sx={{ display: { xs: 'none', sm: 'table-cell' }, fontSize: { xs: '0.75rem', md: '0.875rem' } }}><Chip label={s.branch} size="small" /></TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: { xs: '0.75rem', md: '0.875rem' }, color: s.cgpa >= 8.5 ? '#388e3c' : '#ff9800' }}>{s.cgpa}</TableCell>
                <TableCell align="center" sx={{ display: { xs: 'none', md: 'table-cell' }, fontSize: { xs: '0.75rem', md: '0.875rem' } }}>{s.codingScore}%</TableCell>
                <TableCell align="center" sx={{ display: 'flex', gap: 0.25, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Tooltip title={`Call: ${s.phone}`}><IconButton size="small" color="primary" onClick={() => handleAction('📞', s)}><CallIcon fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title={`Email: ${s.email}`}><IconButton size="small" color="primary" onClick={() => handleAction('📧', s)}><EmailIcon fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Download Resume"><IconButton size="small" color="primary" onClick={() => handleAction('📥', s)}><FileDownloadIcon fontSize="small" /></IconButton></Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>👤 Student Profile - {selectedStudent?.name}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2, maxHeight: '70vh', overflowY: 'auto' }}>
          {selectedStudent && (
            <>
              <Grid container spacing={2}>
                <Grid item xs={6}><Typography variant="caption" color="textSecondary">Roll Number</Typography><Typography sx={{ fontWeight: 'bold' }}>{selectedStudent.rollNo}</Typography></Grid>
                <Grid item xs={6}><Typography variant="caption" color="textSecondary">Branch</Typography><Typography sx={{ fontWeight: 'bold' }}>{selectedStudent.branch}</Typography></Grid>
                <Grid item xs={6}><Typography variant="caption" color="textSecondary">CGPA</Typography><Typography sx={{ fontWeight: 'bold', color: '#388e3c' }}>{selectedStudent.cgpa}</Typography></Grid>
                <Grid item xs={6}><Typography variant="caption" color="textSecondary">Backlogs</Typography><Typography sx={{ fontWeight: 'bold' }}>{selectedStudent.backlogs}</Typography></Grid>
                <Grid item xs={6}><Typography variant="caption" color="textSecondary">Coding Score</Typography><LinearProgress variant="determinate" value={selectedStudent.codingScore} /></Grid>
                <Grid item xs={6}><Typography variant="caption" color="textSecondary">ATS Score</Typography><LinearProgress variant="determinate" value={selectedStudent.atsScore} /></Grid>
                <Grid item xs={12}><Typography variant="caption" color="textSecondary">Email</Typography><Typography>{selectedStudent.email}</Typography></Grid>
                <Grid item xs={12}><Typography variant="caption" color="textSecondary">Phone</Typography><Typography>{selectedStudent.phone}</Typography></Grid>
              </Grid>
              <Divider />
              <Box>
                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold' }}>Skills</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                  {selectedStudent.skills.map((skill, i) => <Chip key={i} label={skill} size="small" />)}
                </Box>
              </Box>
              <Box>
                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold' }}>Achievements</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                  {selectedStudent.achievements.map((a, i) => <Chip key={i} icon={<Star />} label={a} size="small" color="warning" />)}
                </Box>
              </Box>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ open: false, message: '' })} message={snackbar.message} />
    </Box>
  );
};

// ========== SECTION 5: Resume Book ==========
const ResumeBookSection: React.FC = () => {
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const downloadOptions = [
    { label: 'Complete Resume Book (All Students)', icon: '📚', size: '2.4 MB' },
    { label: 'CSE Department Only', icon: '💻', size: '1.2 MB' },
    { label: 'IT Department Only', icon: '⚙️', size: '0.9 MB' },
    { label: 'Top Performers (CGPA > 8.5)', icon: '⭐', size: '0.6 MB' },
    { label: 'Coding Ranks (Score > 85%)', icon: '🎯', size: '0.5 MB' },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Alert severity="info" icon={<Info />}>📄 Resume Book & Batch Profile</Alert>

      <Grid container spacing={2}>
        {downloadOptions.map((option, idx) => (
          <Grid item xs={12} md={6} key={idx}>
            <Card sx={{ cursor: 'pointer', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 } }} onClick={() => setSnackbar({ open: true, message: `📥 Downloading ${option.label} (${option.size})...` })}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{option.label}</Typography>
                  <Typography variant="caption" color="textSecondary">{option.size}</Typography>
                </Box>
                <Typography variant="h6">{option.icon}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 2, backgroundColor: '#f0f7ff', borderLeft: '4px solid #1976d2' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>📊 Resume Book Statistics</Typography>
        <Grid container spacing={1}>
          <Grid item xs={6} sm={3}><Typography variant="caption">Total Resumes</Typography><Typography sx={{ fontWeight: 'bold', color: '#1976d2' }}>{MOCK_STUDENTS.length}</Typography></Grid>
          <Grid item xs={6} sm={3}><Typography variant="caption">Avg CGPA</Typography><Typography sx={{ fontWeight: 'bold', color: '#388e3c' }}>{(MOCK_STUDENTS.reduce((a, b) => a + b.cgpa, 0) / MOCK_STUDENTS.length).toFixed(2)}</Typography></Grid>
          <Grid item xs={6} sm={3}><Typography variant="caption">Projects Avg</Typography><Typography sx={{ fontWeight: 'bold', color: '#ff9800' }}>{Math.round(MOCK_STUDENTS.reduce((a, b) => a + b.projects, 0) / MOCK_STUDENTS.length)}</Typography></Grid>
          <Grid item xs={6} sm={3}><Typography variant="caption">Last Updated</Typography><Typography sx={{ fontWeight: 'bold', color: '#9c27b0' }}>Today</Typography></Grid>
        </Grid>
      </Paper>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ open: false, message: '' })} message={snackbar.message} />
    </Box>
  );
};

// ========== SECTION 6: Recruitment Process Flow ==========
const RecruitmentProcessFlow: React.FC = () => {
  const [expandedRound, setExpandedRound] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Alert severity="info" icon={<Info />}>🗓️ Recruitment Timeline & Rounds</Alert>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {MOCK_ROUNDS.map((round, idx) => (
          <Card key={round.roundNo} sx={{ cursor: 'pointer', backgroundColor: expandedRound === idx ? '#e3f2fd' : 'white', transition: 'all 0.3s' }} onClick={() => setExpandedRound(expandedRound === idx ? null : idx)}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={3}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Round {round.roundNo}: {round.name}</Typography>
                  <Chip label={round.type} size="small" sx={{ mt: 0.5 }} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>📅 {round.date} | ⏰ {round.time}</Typography>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>📍 {round.venue}</Typography>
                </Grid>
                <Grid item xs={12} sm={5}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress variant="determinate" value={(round.qualified / round.totalParticipants) * 100} sx={{ flex: 1 }} />
                    <Typography variant="caption" sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>{round.qualified}/{round.totalParticipants}</Typography>
                  </Box>
                  <Typography variant="caption" color="textSecondary">Pass Rate: {Math.round((round.qualified / round.totalParticipants) * 100)}%</Typography>
                </Grid>
              </Grid>
              {expandedRound === idx && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Grid container spacing={1}>
                    {round.meetingLink && <Grid item xs={12}><Typography variant="caption"><strong>Meeting Link:</strong> <a href={round.meetingLink} target="_blank" rel="noreferrer">{round.meetingLink}</a></Typography></Grid>}
                    {round.duration && <Grid item xs={12}><Typography variant="caption"><strong>Duration:</strong> {round.duration} minutes</Typography></Grid>}
                    <Grid item xs={12}><Button variant="outlined" size="small" onClick={() => setSnackbar({ open: true, message: `📋 ${round.name} schedule updated!` })}>View Details</Button></Grid>
                  </Grid>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ open: false, message: '' })} message={snackbar.message} />
    </Box>
  );
};

// ========== SECTION 7: Online Tests ==========
const OnlineTestSection: React.FC = () => {
  const [selectedTest, setSelectedTest] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const tests = [
    { id: 1, name: 'Online Aptitude Test', duration: 90, questions: 80, passingScore: 50, date: '2026-04-15', time: '10:00 AM', totalRegistered: 150, completed: 148, averageScore: 62 },
    { id: 2, name: 'DSA/Coding Round', duration: 120, questions: 3, passingScore: 60, date: '2026-04-17', time: '02:00 PM', totalRegistered: 67, completed: 65, averageScore: 54 },
    { id: 3, name: 'SQL & Database Fundamentals', duration: 60, questions: 30, passingScore: 55, date: '2026-04-20', time: '10:00 AM', totalRegistered: 45, completed: 43, averageScore: 68 },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Alert severity="info" icon={<Info />}>🧪 Online Assessments & Tests</Alert>

      <Grid container spacing={2}>
        {tests.map((test) => (
          <Grid item xs={12} md={6} key={test.id}>
            <Card sx={{ cursor: 'pointer', backgroundColor: selectedTest === test.id ? '#f0f7ff' : 'white', transition: 'all 0.3s', border: selectedTest === test.id ? '2px solid #1976d2' : 'none' }} onClick={() => setSelectedTest(selectedTest === test.id ? null : test.id)}>
              <CardContent>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>📝 {test.name}</Typography>
                <Grid container spacing={1} sx={{ mb: 1 }}>
                  <Grid item xs={6}><Typography variant="caption"><strong>Duration:</strong> {test.duration} min</Typography></Grid>
                  <Grid item xs={6}><Typography variant="caption"><strong>Questions:</strong> {test.questions}</Typography></Grid>
                  <Grid item xs={6}><Typography variant="caption"><strong>Pass Score:</strong> {test.passingScore}%</Typography></Grid>
                  <Grid item xs={6}><Typography variant="caption"><strong>Date:</strong> {test.date}</Typography></Grid>
                </Grid>
                {selectedTest === test.id && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="caption" color="textSecondary"><strong>Completion:</strong> {test.completed}/{test.totalRegistered}</Typography>
                      <LinearProgress variant="determinate" value={(test.completed / test.totalRegistered) * 100} />
                    </Box>
                    <Typography variant="caption"><strong>Average Score:</strong> {test.averageScore}%</Typography>
                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                      <Button size="small" variant="contained">View Results</Button>
                      <Button size="small" variant="outlined" onClick={() => setSnackbar({ open: true, message: '🧪 Test registered successfully!' })}>Register</Button>
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ open: false, message: '' })} message={snackbar.message} />
    </Box>
  );
};

// ========== SECTION 8: Shortlist + Results ==========
const ShortlistResultsPanel: React.FC = () => {
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const results = [
    { name: 'Rahul Kumar', round: 'Online OA', score: 85, status: 'Pass', date: '2026-04-16', nextRound: 'DSA Round' },
    { name: 'Priya Sharma', round: 'Online OA', score: 92, status: 'Pass', date: '2026-04-16', nextRound: 'DSA Round' },
    { name: 'Amit Patel', round: 'Online OA', score: 78, status: 'Pass', date: '2026-04-16', nextRound: 'DSA Round' },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Alert severity="success" icon={<CheckCircle />} sx={{ flex: 1 }}>📊 {results.length} Students Qualified</Alert>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button variant="contained" startIcon={<GetAppIcon />} size="small" onClick={() => setSnackbar({ open: true, message: '📥 Exporting to Excel...' })}>Export</Button>
          <Button variant="contained" startIcon={<SendIcon />} size="small" onClick={() => setSnackbar({ open: true, message: '📧 Sending notifications...' })}>Notify</Button>
        </Box>
      </Box>

      <TableContainer component={Paper} sx={{ overflowX: { xs: 'auto', md: 'visible' } }}>
        <Table size="small">
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', fontSize: { xs: '0.75rem', md: '0.875rem' } }}>Student</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: { xs: '0.75rem', md: '0.875rem' }, display: { xs: 'none', sm: 'table-cell' } }}>Round</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: { xs: '0.75rem', md: '0.875rem' } }}>Score</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: { xs: '0.75rem', md: '0.875rem' } }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: { xs: '0.75rem', md: '0.875rem' }, display: { xs: 'none', md: 'table-cell' } }}>Next Round</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {results.map((r, i) => (
              <TableRow key={i} sx={{ '&:hover': { backgroundColor: '#f9f9f9' }, cursor: 'pointer' }} onClick={() => setSnackbar({ open: true, message: `📋 Viewing ${r.name}'s result...` })}>
                <TableCell sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' }, fontWeight: '500' }}>{r.name}</TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' }, fontSize: { xs: '0.75rem', md: '0.875rem' } }}>{r.round}</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: { xs: '0.75rem', md: '0.875rem' }, color: r.score >= 80 ? '#388e3c' : '#ff9800' }}>{r.score}%</TableCell>
                <TableCell align="center"><Chip label={r.status} color="success" size="small" /></TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' }, fontSize: { xs: '0.75rem', md: '0.875rem' } }}>{r.nextRound}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ open: false, message: '' })} message={snackbar.message} />
    </Box>
  );
};

// ========== SECTION 9: Analytics Dashboard ==========
const PlacementAnalyticsDashboard: React.FC = () => {
  const placementData = [
    { branch: 'CSE', applied: 95, shortlisted: 48, selected: 20, percentage: 21 },
    { branch: 'IT', applied: 67, shortlisted: 32, selected: 12, percentage: 18 },
  ];

  const ctcData = [
    { range: '15-17 LPA', students: 8, color: '#8884d8' },
    { range: '17-20 LPA', students: 18, color: '#82ca9d' },
    { range: '20-23 LPA', students: 10, color: '#ffc658' },
    { range: '23+ LPA', students: 6, color: '#ff7c7c' },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Alert severity="success" icon={<CheckCircle />}>📈 Placement Analytics & Insights</Alert>

      <Grid container spacing={2}>
        {[
          { label: 'Total Applied', value: MOCK_STUDENTS.length, icon: '📋', bg: '#667eea' },
          { label: 'Avg CGPA', value: (MOCK_STUDENTS.reduce((a, b) => a + b.cgpa, 0) / MOCK_STUDENTS.length).toFixed(2), icon: '📊', bg: '#4facfe' },
          { label: 'Avg Coding', value: Math.round(MOCK_STUDENTS.reduce((a, b) => a + b.codingScore, 0) / MOCK_STUDENTS.length) + '%', icon: '💻', bg: '#43e97b' },
          { label: 'Expected Select', value: '50%', icon: '✅', bg: '#f093fb' },
        ].map((stat, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Card sx={{ background: stat.bg, color: 'white' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4">{stat.icon}</Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 1 }}>{stat.value}</Typography>
                <Typography variant="caption">{stat.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>📊 Branch-wise Placement</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={placementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="branch" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="applied" fill="#8884d8" name="Applied" />
                <Bar dataKey="selected" fill="#82ca9d" name="Selected" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>💰 CTC Distribution</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={ctcData} dataKey="students" nameKey="range" cx="50%" cy="50%" outerRadius={80} label>
                  {ctcData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

// ========== SECTION 10: Communication Center ==========
const CommunicationCenter: React.FC = () => {
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const communications = [
    { date: '2026-04-10', type: 'Email', recipients: 'All Students (200)', subject: 'PPT Reminder', status: 'Sent', count: 200 },
    { date: '2026-04-14', type: 'WhatsApp', recipients: 'Shortlisted (48)', subject: 'OA Tomorrow', status: 'Sent', count: 48 },
    { date: '2026-04-16', type: 'Email', recipients: 'Qualified (45)', subject: 'Tech Round Details', status: 'Sent', count: 45 },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Alert severity="info" icon={<Notifications />}>📢 Bulk Communication Center</Alert>

      <Paper sx={{ p: { xs: 1.5, md: 2.5 }, backgroundColor: '#f8f9fa' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>📧 Send New Message</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select label="Type">
                <MenuItem value="Email">📧 Email</MenuItem>
                <MenuItem value="WhatsApp">💬 WhatsApp</MenuItem>
                <MenuItem value="SMS">📱 SMS</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Recipients</InputLabel>
              <Select label="Recipients">
                <MenuItem value="all">All Students</MenuItem>
                <MenuItem value="shortlisted">Shortlisted Only</MenuItem>
                <MenuItem value="qualified">Qualified Candidates</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Subject" placeholder="Enter subject" size="small" />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth multiline rows={3} label="Message" placeholder="Type your message here..." size="small" />
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" startIcon={<SendIcon />} onClick={() => setSnackbar({ open: true, message: '✅ Message sent to recipients!' })}>Send</Button>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper} sx={{ overflowX: { xs: 'auto', md: 'visible' } }}>
        <Table size="small">
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', fontSize: { xs: '0.75rem', md: '0.875rem' } }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: { xs: '0.75rem', md: '0.875rem' } }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: { xs: '0.75rem', md: '0.875rem' }, display: { xs: 'none', md: 'table-cell' } }}>Recipients</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: { xs: '0.75rem', md: '0.875rem' } }}>Count</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: { xs: '0.75rem', md: '0.875rem' } }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {communications.map((comm, i) => (
              <TableRow key={i}><TableCell sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>{comm.date}</TableCell><TableCell><Chip label={comm.type} size="small" /></TableCell><TableCell sx={{ display: { xs: 'none', md: 'table-cell' }, fontSize: { xs: '0.75rem', md: '0.875rem' } }}>{comm.recipients}</TableCell><TableCell><Chip label={comm.count} /></TableCell><TableCell align="center"><Chip label={comm.status} color="success" size="small" /></TableCell></TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ open: false, message: '' })} message={snackbar.message} />
    </Box>
  );
};

// ========== SECTION 11: Offer Letters ==========
const OfferLetterSection: React.FC = () => {
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const offers = [
    { name: 'Rahul Kumar', position: 'Senior Software Engineer', ctc: 20, status: 'Accepted', joiningDate: '2026-07-01' },
    { name: 'Priya Sharma', position: 'Data Engineer', ctc: 18, status: 'Pending', joiningDate: '2026-07-01' },
    { name: 'Amit Patel', position: 'Software Engineer', ctc: 16, status: 'Accepted', joiningDate: '2026-07-15' },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Alert severity="info" icon={<Info />}>📜 Offer Letters & Verification</Alert>

      <Paper sx={{ p: { xs: 1.5, md: 2.5 }, backgroundColor: '#f8f9fa' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>Generate New Offer Letter</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Select Student</InputLabel>
              <Select label="Select Student">
                <MenuItem value="s1">Rahul Kumar</MenuItem>
                <MenuItem value="s2">Priya Sharma</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Position" placeholder="e.g., SDE-1" size="small" />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="CTC (LPA)" type="number" placeholder="20" size="small" />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Joining Date" type="date" size="small" InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" startIcon={<FileDownloadIcon />} onClick={() => setSnackbar({ open: true, message: '📥 Generating offer letter...' })}>Generate Offer</Button>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper} sx={{ overflowX: { xs: 'auto', md: 'visible' } }}>
        <Table size="small">
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', fontSize: { xs: '0.75rem', md: '0.875rem' } }}>Student</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: { xs: '0.75rem', md: '0.875rem' }, display: { xs: 'none', md: 'table-cell' } }}>Position</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: { xs: '0.75rem', md: '0.875rem' } }}>CTC</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: { xs: '0.75rem', md: '0.875rem' } }}>Status</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: { xs: '0.75rem', md: '0.875rem' }, display: { xs: 'none', md: 'table-cell' } }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {offers.map((offer, i) => (
              <TableRow key={i} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                <TableCell sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' }, fontWeight: '500' }}>{offer.name}</TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' }, fontSize: { xs: '0.75rem', md: '0.875rem' } }}>{offer.position}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: { xs: '0.75rem', md: '0.875rem' } }}>₹{offer.ctc} LPA</TableCell>
                <TableCell align="center"><Chip label={offer.status} color={offer.status === 'Accepted' ? 'success' : 'warning'} size="small" /></TableCell>
                <TableCell align="center" sx={{ display: { xs: 'none', md: 'table-cell' }}}>
                  <Tooltip title="Download"><IconButton size="small" onClick={() => setSnackbar({ open: true, message: '📥 Downloading offer letter...' })}><FileDownloadIcon fontSize="small" /></IconButton></Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ open: false, message: '' })} message={snackbar.message} />
    </Box>
  );
};

// ========== SECTION 12: Recruiter CRM ==========
const RecruiterRelationshipCRM: React.FC = () => {
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Alert severity="info" icon={<Info />}>🤝 Recruiter Relationship Management</Alert>

      <Grid container spacing={2}>
        {[
          { label: 'Previous Visits', value: '4 times', icon: '📅' },
          { label: 'Conversion Rate', value: '92%', icon: '📈' },
          { label: 'Avg Package', value: '₹19 LPA', icon: '💰' },
          { label: 'Total Hired', value: '147 students', icon: '✅' },
        ].map((stat, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Card sx={{ cursor: 'pointer', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.05)' } }} onClick={() => setSnackbar({ open: true, message: `📊 ${stat.label}: ${stat.value}` })}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h5">{stat.icon}</Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 1 }}>{stat.value}</Typography>
                <Typography variant="caption">{stat.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: { xs: 1.5, md: 2.5 } }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>⭐ Feedback & Notes</Typography>
        <Alert severity="success" sx={{ mb: 2 }}>Excellent batch quality! Strong in coding fundamentals. Very satisfied with hires. Keen for next year collaboration.</Alert>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button variant="contained" onClick={() => setSnackbar({ open: true, message: '📅 Follow-up scheduled for next quarter!' })}>Schedule Follow-up</Button>
          <Button variant="outlined" onClick={() => setSnackbar({ open: true, message: '📋 CRM data exported successfully!' })}>Export Data</Button>
          <Button variant="outlined" onClick={() => setSnackbar({ open: true, message: '✉️ Feedback email sent to company!' })}>Send Feedback</Button>
        </Box>
      </Paper>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>📝 Interaction History</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="caption"><strong>2026-03-15:</strong> Initial inquiry about campus recruitment</Typography>
            <Typography variant="caption"><strong>2026-03-20:</strong> Job announcement submitted (2 roles)</Typography>
            <Typography variant="caption"><strong>2026-04-10:</strong> PPT conducted in auditorium</Typography>
            <Typography variant="caption"><strong>2026-04-16:</strong> Online assessment completed (150 students)</Typography>
          </Box>
        </AccordionDetails>
      </Accordion>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ open: false, message: '' })} message={snackbar.message} />
    </Box>
  );
};

// ========== MAIN COMPONENT ==========
const CompanyDetail: React.FC<{ companyId?: string }> = ({ companyId = 'google' }) => {
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const tabs = [
    { label: '🏭 Profile', icon: 'profile' },
    { label: '📋 Jobs', icon: 'jobs' },
    { label: '🎯 Filter', icon: 'filter' },
    { label: '👨‍🎓 Students', icon: 'students' },
    { label: '📄 Resume Book', icon: 'resume' },
    { label: '🗓️ Timeline', icon: 'timeline' },
    { label: '🧪 Tests', icon: 'tests' },
    { label: '📊 Results', icon: 'results' },
    { label: '📈 Analytics', icon: 'analytics' },
    { label: '📢 Communication', icon: 'comms' },
    { label: '📜 Offers', icon: 'offers' },
    { label: '🤝 CRM', icon: 'crm' }
  ];

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, backgroundColor: '#fafafa', minHeight: '100vh' }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>🏢 Training & Placement Portal</Typography>
          <Typography variant="body2" color="textSecondary">Comprehensive recruitment management system for companies and TNP cells</Typography>
        </Box>

        <Paper elevation={0} sx={{ mb: 3, border: '1px solid #e0e0e0' }}>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              borderBottom: 2,
              borderColor: '#e0e0e0',
              '& .MuiTab-root': {
                fontSize: { xs: '0.65rem', sm: '0.75rem', md: '0.875rem' },
                py: 2,
                px: { xs: 1, sm: 1.5, md: 2 },
                minHeight: { xs: '48px', md: '56px' },
              },
            }}
          >
            {tabs.map((tab, idx) => (
              <Tab key={idx} label={tab.label} />
            ))}
          </Tabs>
        </Paper>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TabPanel value={currentTab} index={0}><CompanyProfileSection /></TabPanel>
          <TabPanel value={currentTab} index={1}><JobAnnouncementSection companyId={companyId} /></TabPanel>
          <TabPanel value={currentTab} index={2}><EligibilityFilterEngine /></TabPanel>
          <TabPanel value={currentTab} index={3}><EligibleStudentsDashboard /></TabPanel>
          <TabPanel value={currentTab} index={4}><ResumeBookSection /></TabPanel>
          <TabPanel value={currentTab} index={5}><RecruitmentProcessFlow /></TabPanel>
          <TabPanel value={currentTab} index={6}><OnlineTestSection /></TabPanel>
          <TabPanel value={currentTab} index={7}><ShortlistResultsPanel /></TabPanel>
          <TabPanel value={currentTab} index={8}><PlacementAnalyticsDashboard /></TabPanel>
          <TabPanel value={currentTab} index={9}><CommunicationCenter /></TabPanel>
          <TabPanel value={currentTab} index={10}><OfferLetterSection /></TabPanel>
          <TabPanel value={currentTab} index={11}><RecruiterRelationshipCRM /></TabPanel>
        </Box>
      </Container>
    </Box>
  );
};

export default CompanyDetail;
