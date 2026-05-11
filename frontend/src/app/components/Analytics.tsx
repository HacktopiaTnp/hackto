import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Grid,
  LinearProgress,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
  useTheme,
  Alert,
  AlertTitle,
  IconButton,
  Divider,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  School as SchoolIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  TrendingDown as TrendingDownIcon,
  Lightbulb as LightbulbIcon,
  Target as TargetIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Edit as EditActionIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip as RechartTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface AnalyticsProps {
  userRole?: 'student' | 'coordinator' | 'admin';
  searchQuery?: string;
  setView?: (view: string) => void;
}

interface StudentPerformance {
  eligibilityStatus: Array<{ company: string; eligible: boolean; reason: string; cgpa: number; branch: string }>;
  recommendedDrives: Array<{ company: string; role: string; match: number; deadline: string }>;
  weakAreas: Array<{ area: string; score: number; trend: string; recommendation: string }>;
  upcomingMocks: Array<{ type: string; company: string; date: string; importance: 'urgent' | 'high' | 'medium' }>;
  milestones: Array<{ title: string; completed: boolean; date: string; icon: string }>;
  resumeIssues: Array<{ issue: string; severity: 'high' | 'medium'; suggestion: string }>;
  readinessScores: Array<{ company: string; dsa: number; cs: number; hr: number; resume: number; probability: number }>;
  revisionPlan: Array<{ topic: string; priority: 'high' | 'medium'; timeRequired: number }>;
}

interface AnalyticsProps {
  userRole?: 'student' | 'coordinator' | 'admin';
  searchQuery?: string;
  setView?: (view: string) => void;
}

export default function Analytics({ userRole = 'student', searchQuery: globalSearchQuery = '', setView }: AnalyticsProps) {
  const [selectedSection, setSelectedSection] = useState<'all' | number>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const activeSearchQuery = globalSearchQuery || searchQuery;

  // Comprehensive Student Performance Data
  const studentPerformance: StudentPerformance = {
    // Section 0: Eligibility Alerts
    eligibilityStatus: [
      { company: 'Microsoft', eligible: true, reason: 'CGPA & Branch Match', cgpa: 8.5, branch: 'CSE' },
      { company: 'Amazon', eligible: true, reason: 'Excellent DSA Score', cgpa: 8.2, branch: 'CSE' },
      { company: 'Google', eligible: false, reason: 'CGPA < 9.0', cgpa: 8.5, branch: 'CSE' },
      { company: 'Adobe', eligible: false, reason: 'Branch - IT only', cgpa: 8.8, branch: 'ECE' },
      { company: 'Goldman Sachs', eligible: true, reason: 'Finance & Tech Focus', cgpa: 9.1, branch: 'CSE' },
    ],
    
    // Section 1: Recommended Drives
    recommendedDrives: [
      { company: 'Amazon', role: 'SDE Intern', match: 92, deadline: '2026-02-28' },
      { company: 'Microsoft', role: 'Software Engineer', match: 88, deadline: '2026-03-05' },
      { company: 'Goldman Sachs', role: 'Developer', match: 82, deadline: '2026-03-10' },
      { company: 'Flipkart', role: 'Backend Engineer', match: 78, deadline: '2026-03-15' },
    ],
    
    // Section 2: Weak Areas
    weakAreas: [
      { area: 'System Design', score: 65, trend: 'down', recommendation: 'Focus on scalability patterns & sharding' },
      { area: 'DBMS', score: 72, trend: 'up', recommendation: 'Study query optimization & indexing' },
      { area: 'OS', score: 68, trend: 'stable', recommendation: 'Review deadlock prevention & synchronization' },
      { area: 'HR Round', score: 75, trend: 'up', recommendation: 'Practice storytelling & behavioral questions' },
    ],
    
    // Section 3: Upcoming Mocks
    upcomingMocks: [
      { type: 'Amazon OA', company: 'Amazon', date: '2026-02-15 08:00 PM', importance: 'urgent' },
      { type: 'Google Technical', company: 'Google', date: '2026-02-17 09:00 AM', importance: 'high' },
      { type: 'Microsoft HR', company: 'Microsoft', date: '2026-02-20 02:00 PM', importance: 'high' },
      { type: 'Adobe System Design', company: 'Adobe', date: '2026-02-25 10:00 AM', importance: 'medium' },
    ],
    
    // Section 4: Milestones
    milestones: [
      { title: '30-Day Consistent Study Streak', completed: true, date: '2026-01-15', icon: '🔥' },
      { title: '100 DSA Problems Solved', completed: true, date: '2026-01-20', icon: '✅' },
      { title: '10 Mock Interviews Completed', completed: true, date: '2026-02-01', icon: '🎤' },
      { title: 'System Design 80%+ Score', completed: false, date: '2026-02-28', icon: '🏗️' },
      { title: 'CS Fundamentals Mastery', completed: false, date: '2026-03-15', icon: '📚' },
    ],
    
    // Section 5: Resume Issues
    resumeIssues: [
      { issue: 'ATS Score Low (72%)', severity: 'high', suggestion: 'Add industry keywords: Microservices, Docker, Kubernetes' },
      { issue: 'Missing Action Verbs', severity: 'medium', suggestion: 'Replace "worked on" with "architected", "developed", "optimized"' },
      { issue: 'Project Descriptions Weak', severity: 'high', suggestion: 'Include impact metrics: 40% response time improvement, 10K+ users' },
      { issue: 'Experience Gap (4 months)', severity: 'medium', suggestion: 'Add freelance/volunteer projects or open source contributions' },
    ],
    
    // Section 6: Company Readiness (with Radar data)
    readinessScores: [
      { company: 'Amazon', dsa: 88, cs: 82, hr: 80, resume: 85, probability: 78 },
      { company: 'Microsoft', dsa: 85, cs: 88, hr: 85, resume: 90, probability: 82 },
      { company: 'Google', dsa: 92, cs: 95, hr: 80, resume: 88, probability: 85 },
      { company: 'Goldman Sachs', dsa: 80, cs: 90, hr: 82, resume: 86, probability: 76 },
      { company: 'Adobe', dsa: 88, cs: 85, hr: 88, resume: 84, probability: 80 },
    ],
    
    // Section 7: Daily Revision Plan
    revisionPlan: [
      { topic: 'OS Deadlock Prevention', priority: 'high', timeRequired: 3 },
      { topic: 'SQL Joins & Optimization', priority: 'high', timeRequired: 2.5 },
      { topic: 'Heap & Priority Queue', priority: 'medium', timeRequired: 2 },
      { topic: 'HR Behavioral Questions', priority: 'medium', timeRequired: 1.5 },
      { topic: 'Graph Algorithms', priority: 'medium', timeRequired: 2.5 },
    ],
  };

  // Get filtered data based on search
  const filteredDrives = studentPerformance.recommendedDrives.filter((drive) =>
    drive.company.toLowerCase().includes(activeSearchQuery.toLowerCase()) ||
    drive.role.toLowerCase().includes(activeSearchQuery.toLowerCase())
  );

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
          📊 Your Performance Analytics
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Track progress, skills, and interview readiness
        </Typography>
      </Box>

      {/* Overall Summary Stats */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>Interview Readiness</Typography>
            <Typography variant="h4" sx={{ color: 'success.main', fontWeight: 'bold', my: 1 }}>82%</Typography>
            <LinearProgress variant="determinate" value={82} sx={{ mt: 1 }} />
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>Applications</Typography>
            <Typography variant="h4" sx={{ color: 'info.main', fontWeight: 'bold', my: 1 }}>12/15</Typography>
            <LinearProgress variant="determinate" value={80} sx={{ mt: 1 }} />
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>Shortlisted</Typography>
            <Typography variant="h4" sx={{ color: 'warning.main', fontWeight: 'bold', my: 1 }}>5</Typography>
            <LinearProgress variant="determinate" value={50} sx={{ mt: 1 }} />
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>Avg Mock Score</Typography>
            <Typography variant="h4" sx={{ color: 'error.main', fontWeight: 'bold', my: 1 }}>78%</Typography>
            <LinearProgress variant="determinate" value={78} sx={{ mt: 1 }} />
          </Card>
        </Grid>
      </Grid>

      {/* Section Navigation Cards */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Select Section:</Typography>
        <Grid container spacing={1}>
          {[
            { id: 'all', label: '📊 All Sections', icon: '📊' },
            { id: 0, label: '🎯 Eligibility', icon: '🎯' },
            { id: 1, label: '🚀 Drives', icon: '🚀' },
            { id: 2, label: '📈 Weak Areas', icon: '📈' },
            { id: 3, label: '🧪 Mocks', icon: '🧪' },
            { id: 4, label: '🏆 Milestones', icon: '🏆' },
            { id: 5, label: '📄 Resume', icon: '📄' },
            { id: 6, label: '🏢 Readiness', icon: '🏢' },
            { id: 7, label: '📚 Revision', icon: '📚' },
          ].map((section) => (
            <Grid item xs={6} sm={4} md={3} lg={1.5} key={section.id}>
              <Button
                fullWidth
                variant={selectedSection === section.id ? 'contained' : 'outlined'}
                onClick={() => setSelectedSection(section.id)}
                sx={{
                  py: 1.5,
                  fontSize: { xs: '0.7rem', sm: '0.85rem', md: '0.9rem' },
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {section.label}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Search Bar */}
      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          placeholder="Search companies, roles, topics..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Chip label="🔍" size="small" variant="outlined" />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />
      </Box>

      {/* Section 0: Eligibility Alerts */}
      {(selectedSection === 'all' || selectedSection === 0) && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>🎯 Eligibility Alerts</Typography>
          <Grid container spacing={2}>
            {studentPerformance.eligibilityStatus.map((item, idx) => (
              <Grid item xs={12} sm={6} md={4} key={idx}>
                <Card sx={{ p: 2, borderLeft: `4px solid ${item.eligible ? '#4caf50' : '#f44336'}` }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{item.company}</Typography>
                    <Chip label={item.eligible ? '✅ Eligible' : '❌ Not'} color={item.eligible ? 'success' : 'error'} size="small" />
                  </Box>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>CGPA: {item.cgpa}</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>Branch: {item.branch}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1 }}>Reason: {item.reason}</Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Section 1: Recommended Drives */}
      {(selectedSection === 'all' || selectedSection === 1) && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>🚀 Recommended Drives</Typography>
          <Grid container spacing={2}>
            {filteredDrives.map((drive, idx) => (
              <Grid item xs={12} sm={6} md={3} key={idx}>
                <Card sx={{ p: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{drive.company}</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>{drive.role}</Typography>
                  <Box sx={{ mb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption">Skills Match</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'success.main' }}>{drive.match}%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={drive.match} />
                  </Box>
                  <Typography variant="caption" sx={{ color: 'warning.main' }}>📅 Deadline: {drive.deadline}</Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Section 2: Weak Areas */}
      {(selectedSection === 'all' || selectedSection === 2) && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>📈 Weak Area Alerts</Typography>
          <Grid container spacing={2}>
            {studentPerformance.weakAreas.map((area, idx) => {
              const severity = area.score < 70 ? 'error' : area.score < 80 ? 'warning' : 'success';
              return (
                <Grid item xs={12} sm={6} key={idx}>
                  <Card sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{area.area}</Typography>
                      <Chip label={`${area.score}%`} color={severity} size="small" />
                    </Box>
                    <LinearProgress variant="determinate" value={area.score} sx={{ mb: 1 }} />
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Trend: {area.trend}</Typography>
                    <Alert severity={severity} sx={{ mt: 1 }}>
                      <Typography variant="caption">{area.recommendation}</Typography>
                    </Alert>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}

      {/* Section 3: Upcoming Mocks */}
      {(selectedSection === 'all' || selectedSection === 3) && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>🧪 Upcoming Mocks</Typography>
          <Grid container spacing={2}>
            {studentPerformance.upcomingMocks.map((mock, idx) => {
              const bgColor = mock.importance === 'urgent' ? '#ffcccc' : mock.importance === 'high' ? '#fff3cd' : '#d4edda';
              const borderColor = mock.importance === 'urgent' ? '#f44336' : mock.importance === 'high' ? '#ff9800' : '#4caf50';
              return (
                <Grid item xs={12} sm={6} md={3} key={idx}>
                  <Card sx={{ p: 2, bgcolor: bgColor, borderLeft: `4px solid ${borderColor}` }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{mock.type}</Typography>
                    <Typography variant="body2">{mock.company}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>📅 {mock.date}</Typography>
                    <Chip label={mock.importance.toUpperCase()} size="small" sx={{ mt: 1 }} color={mock.importance === 'urgent' ? 'error' : mock.importance === 'high' ? 'warning' : 'success'} />
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}

      {/* Section 4: Milestones */}
      {(selectedSection === 'all' || selectedSection === 4) && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>🏆 Progress Milestones</Typography>
          <Grid container spacing={2}>
            {studentPerformance.milestones.map((milestone, idx) => (
              <Grid item xs={12} sm={6} key={idx}>
                <Card sx={{ p: 2, bgcolor: milestone.completed ? '#e8f5e9' : '#f5f5f5' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" sx={{ mr: 1 }}>{milestone.icon}</Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', flex: 1 }}>{milestone.title}</Typography>
                    {milestone.completed && <Chip label="✓ Done" color="success" size="small" />}
                  </Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>Completed: {milestone.date}</Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Section 5: Resume Issues */}
      {(selectedSection === 'all' || selectedSection === 5) && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>📄 Resume Improvement</Typography>
          <Grid container spacing={2}>
            {studentPerformance.resumeIssues.map((issue, idx) => (
              <Grid item xs={12} key={idx}>
                <Alert severity={issue.severity === 'high' ? 'error' : 'warning'} sx={{ mb: 1 }}>
                  <AlertTitle sx={{ fontWeight: 'bold' }}>{issue.issue}</AlertTitle>
                  <Typography variant="body2">{issue.suggestion}</Typography>
                </Alert>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Section 6: Company Readiness with Radar Chart */}
      {(selectedSection === 'all' || selectedSection === 6) && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>🏢 Company Readiness</Typography>
          
          {/* Radar Chart */}
          <Card sx={{ p: 2, mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>Multi-Dimensional Readiness Comparison</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={studentPerformance.readinessScores}>
                <PolarGrid />
                <PolarAngleAxis dataKey="company" />
                <PolarRadiusAxis />
                <Radar name="DSA" dataKey="dsa" stroke="#8884d8" fill="#8884d8" fillOpacity={0.5} />
                <Radar name="CS Fundamentals" dataKey="cs" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.5} />
                <Radar name="HR Round" dataKey="hr" stroke="#ffc658" fill="#ffc658" fillOpacity={0.5} />
                <Radar name="Resume" dataKey="resume" stroke="#ff7c7c" fill="#ff7c7c" fillOpacity={0.5} />
                <Legend />
                <RechartTooltip />
              </RadarChart>
            </ResponsiveContainer>
          </Card>

          {/* Company Cards */}
          <Grid container spacing={2}>
            {studentPerformance.readinessScores.map((company, idx) => (
              <Grid item xs={12} sm={6} md={4} key={idx}>
                <Card sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{company.company}</Typography>
                    <Chip label={`${company.probability}% Likely`} color="primary" size="small" />
                  </Box>
                  <Box sx={{ space: 1 }}>
                    <Typography variant="caption">DSA: {company.dsa}%</Typography>
                    <LinearProgress variant="determinate" value={company.dsa} sx={{ mb: 1 }} />
                    <Typography variant="caption">CS: {company.cs}%</Typography>
                    <LinearProgress variant="determinate" value={company.cs} sx={{ mb: 1 }} />
                    <Typography variant="caption">HR: {company.hr}%</Typography>
                    <LinearProgress variant="determinate" value={company.hr} sx={{ mb: 1 }} />
                    <Typography variant="caption">Resume: {company.resume}%</Typography>
                    <LinearProgress variant="determinate" value={company.resume} />
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Section 7: Daily Revision Plan */}
      {(selectedSection === 'all' || selectedSection === 7) && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>📚 Daily Revision Plan</Typography>
          <Grid container spacing={2}>
            {studentPerformance.revisionPlan.map((revision, idx) => (
              <Grid item xs={12} sm={6} key={idx}>
                <Card sx={{ p: 2, borderLeft: `4px solid ${revision.priority === 'high' ? '#f44336' : '#ff9800'}` }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{revision.topic}</Typography>
                    <Chip label={revision.priority.toUpperCase()} color={revision.priority === 'high' ? 'error' : 'warning'} size="small" />
                  </Box>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>⏱️ Time: {revision.timeRequired} hours</Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
}
