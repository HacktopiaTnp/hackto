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
  Grid,
} from '@mui/material';
import {
  Search as SearchIcon,
  TrendingUp as TrendingIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  School as SchoolIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  TrendingDown as TrendingDownIcon,
  Lightbulb as LightbulbIcon,
  Target as TargetIcon,
  EmojiEvents as TrophyIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
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
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

interface StudentPerformance {
  eligibilityStatus: Array<{ company: string; eligible: boolean; reason?: string; cgpa?: number; branch?: string }>;
  weakAreas: Array<{ area: string; score: number; trend: 'up' | 'down'; recommendation: string }>;
  recommendedDrives: Array<{ company: string; role: string; match: number; deadline: string }>;
  readinessScores: Array<{ company: string; dsa: number; cs: number; hr: number; resume: number; probability: number }>;
  milestones: Array<{ title: string; completed: boolean; date: string; icon: string }>;
  resumeIssues: Array<{ issue: string; severity: 'high' | 'medium' | 'low'; suggestion: string }>;
  upcomingMocks: Array<{ type: string; company: string; date: string; importance: 'urgent' | 'high' | 'medium' }>;
  revisionPlan: Array<{ topic: string; priority: 'high' | 'medium' | 'low'; timeRequired: string }>;
}

const Analytics: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<'all' | number>(0);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

  // 1. Eligibility Alerts Data
  const eligibilityStatus: StudentPerformance['eligibilityStatus'] = [
    { company: 'Microsoft', eligible: true, reason: 'CGPA & Skills Match Perfect', cgpa: 8.2, branch: 'CSE' },
    { company: 'Google', eligible: true, reason: 'Exceeds Requirements', cgpa: 8.5, branch: 'CSE' },
    { company: 'Adobe', eligible: false, reason: 'CGPA Below 8.0', cgpa: 7.8, branch: 'CSE' },
    { company: 'Amazon', eligible: true, reason: 'DSA Score Strong', cgpa: 8.1, branch: 'IT' },
    { company: 'Goldman Sachs', eligible: false, reason: 'Branch Restriction (CSE/IT Only)', cgpa: 7.9, branch: 'ECE' },
  ];

  // 2. Recommended Drives Based on Skills
  const recommendedDrives: StudentPerformance['recommendedDrives'] = [
    { company: 'Amazon', role: 'SDE Intern', match: 92, deadline: '2026-04-18' },
    { company: 'Google', role: 'STEP Intern', match: 88, deadline: '2026-04-15' },
    { company: 'Microsoft', role: 'Explore Program', match: 85, deadline: '2026-04-20' },
    { company: 'Atlassian', role: 'Engineering Intern', match: 82, deadline: '2026-04-22' },
  ];

  // 3. Weak Area Alerts
  const weakAreas: StudentPerformance['weakAreas'] = [
    { area: 'System Design', score: 65, trend: 'down', recommendation: 'Focus on scalability patterns and CAP theorem' },
    { area: 'DBMS Concepts', score: 72, trend: 'up', recommendation: 'Need to master indexing and query optimization' },
    { area: 'OS Fundamentals', score: 68, trend: 'down', recommendation: 'Deadlock detection and resource allocation' },
    { area: 'HR Communication', score: 75, trend: 'up', recommendation: 'Practice STAR method for all questions' },
  ];

  // 4. Upcoming Mocks
  const upcomingMocks: StudentPerformance['upcomingMocks'] = [
    { type: 'OA Mock', company: 'Amazon', date: '2026-04-13, 8:00 PM', importance: 'urgent' },
    { type: 'Technical Round', company: 'Google', date: '2026-04-14, 2:00 PM', importance: 'high' },
    { type: 'System Design', company: 'Microsoft', date: '2026-04-15, 6:00 PM', importance: 'high' },
    { type: 'HR Mock', company: 'Adobe', date: '2026-04-16, 4:00 PM', importance: 'medium' },
  ];

  // 5. Progress Milestones
  const milestones: StudentPerformance['milestones'] = [
    { title: '30-Day Streak', completed: true, date: '2026-03-15', icon: '🔥' },
    { title: '100 DSA Problems', completed: true, date: '2026-03-20', icon: '💯' },
    { title: '10 Mock Interviews', completed: true, date: '2026-04-01', icon: '🎤' },
    { title: 'System Design 80%', completed: false, date: 'In progress', icon: '🏗️' },
    { title: 'All CS Fundamentals', completed: false, date: 'Pending', icon: '📚' },
  ];

  // 6. Resume Improvement Alerts
  const resumeIssues: StudentPerformance['resumeIssues'] = [
    { issue: 'ATS Score Low (72%)', severity: 'high', suggestion: 'Add more technical keywords like "API Design", "Microservices"' },
    { issue: 'Missing Action Verbs', severity: 'medium', suggestion: 'Replace "Worked on" with "Architected", "Optimized"' },
    { issue: 'No Impact Metrics', severity: 'high', suggestion: 'Add: "Improved response time by 40%", "Reduced memory by 50%"' },
    { issue: 'Projects Vague', severity: 'medium', suggestion: 'Add tech stack: "Built using React, Node.js, PostgreSQL"' },
  ];

  // 7. Company Readiness Scores
  const readinessScores: StudentPerformance['readinessScores'] = [
    { company: 'Google', dsa: 88, cs: 82, hr: 80, resume: 85, probability: 78 },
    { company: 'Amazon', dsa: 92, cs: 85, hr: 78, resume: 82, probability: 82 },
    { company: 'Microsoft', dsa: 85, cs: 80, hr: 82, resume: 80, probability: 75 },
    { company: 'Adobe', dsa: 78, cs: 75, hr: 85, resume: 72, probability: 68 },
    { company: 'Goldman Sachs', dsa: 82, cs: 88, hr: 80, resume: 78, probability: 72 },
  ];

  // 8. Personalized Revision Plan
  const revisionPlan: StudentPerformance['revisionPlan'] = [
    { topic: 'OS Deadlock + Scheduling', priority: 'high', timeRequired: '3 hours' },
    { topic: 'SQL Joins & Indexing', priority: 'high', timeRequired: '2.5 hours' },
    { topic: 'HR STAR Method Practice', priority: 'medium', timeRequired: '1.5 hours' },
    { topic: 'System Design Case Studies', priority: 'high', timeRequired: '4 hours' },
    { topic: 'Resume ATS Optimization', priority: 'medium', timeRequired: '1 hour' },
  ];

  const sections = [
    { id: 0, title: '🎯 Eligibility Alerts', icon: CheckCircleIcon, color: '#10b981' },
    { id: 1, title: '🚀 Recommended Drives', icon: TargetIcon, color: '#3b82f6' },
    { id: 2, title: '📈 Weak Area Alerts', icon: TrendingDownIcon, color: '#ef4444' },
    { id: 3, title: '🧪 Upcoming Mocks', icon: ScheduleIcon, color: '#f59e0b' },
    { id: 4, title: '🏆 Progress Milestones', icon: TrophyIcon, color: '#8b5cf6' },
    { id: 5, title: '📄 Resume Improvement', icon: EditIcon, color: '#06b6d4' },
    { id: 6, title: '🏢 Company Readiness', icon: SchoolIcon, color: '#ec4899' },
    { id: 7, title: '📚 Daily Revision', icon: LightbulbIcon, color: '#f97316' },
  ];

  return (
    <Box sx={{ width: '100%', bgcolor: 'background.default', minHeight: '100vh', p: { xs: 1, sm: 2, md: 3 } }}>
      {/* Header */}
      <Paper elevation={3} sx={{ p: { xs: 1.5, sm: 2, md: 3 }, mb: 3 }}>
        <Typography variant={isMobile ? 'h5' : isTablet ? 'h4' : 'h3'} fontWeight="bold" sx={{ mb: 1 }}>
          📊 Your Performance Analytics
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Personalized insights to boost your placement success • Last updated: Today 10:30 AM
        </Typography>

        {/* Overall Score */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 1.5 }}>
          <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: 'success.light', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">Interview Readiness</Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ color: 'success.main', mt: 0.5 }}>82%</Typography>
          </Box>
          <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: 'warning.light', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">Applications</Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ color: 'warning.main', mt: 0.5 }}>12/15</Typography>
          </Box>
          <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: 'info.light', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">Shortlisted</Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ color: 'info.main', mt: 0.5 }}>5</Typography>
          </Box>
          <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: 'error.light', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">Mock Score Avg</Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ color: 'error.main', mt: 0.5 }}>78%</Typography>
          </Box>
        </Box>
      </Paper>

      {/* Section Navigation */}
      <Box sx={{ mb: 3, display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 1.5, maxHeight: isMobile ? '300px' : 'auto', overflowY: isMobile ? 'auto' : 'visible' }}>
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Paper
              key={section.id}
              onClick={() => setSelectedSection(section.id)}
              sx={{
                p: 1.5,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: selectedSection === section.id ? '2px solid' : '1px solid',
                borderColor: selectedSection === section.id ? section.color : 'divider',
                bgcolor: selectedSection === section.id ? 'action.selected' : 'background.paper',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: 2 },
              }}
            >
              <Icon sx={{ fontSize: 24, color: section.color, mb: 0.5 }} />
              <Typography variant="caption" fontWeight="bold" display="block" sx={{ fontSize: '0.7rem' }}>
                {section.title.split(' ').slice(1).join(' ')}
              </Typography>
            </Paper>
          );
        })}
      </Box>

      {/* Content Sections */}
      {selectedSection === 0 && (
        <Box sx={{ display: 'grid', gap: 2 }}>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>✅ Eligibility Status for Companies</Typography>
          {eligibilityStatus.map((status, idx) => (
            <Card key={idx} sx={{ transition: 'all 0.3s', '&:hover': { boxShadow: 3 }, borderLeft: '5px solid', borderLeftColor: status.eligible ? 'success.main' : 'error.main' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">{status.company}</Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                      {status.eligible ? (
                        <Chip icon={<CheckCircleIcon />} label="✅ Eligible" color="success" size="small" />
                      ) : (
                        <Chip icon={<WarningIcon />} label="⚠️ Ineligible" color="error" size="small" />
                      )}
                      <Chip label={`CGPA: ${status.cgpa}`} size="small" variant="outlined" />
                      <Chip label={status.branch} size="small" variant="outlined" />
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ bgcolor: status.eligible ? 'success.light' : 'error.light', p: 1, borderRadius: 1, maxWidth: '200px' }}>
                    {status.reason}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {selectedSection === 1 && (
        <Box sx={{ display: 'grid', gap: 2 }}>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>🚀 Recommended Drives Based on Your Skills</Typography>
          {recommendedDrives.map((drive, idx) => (
            <Card key={idx} sx={{ transition: 'all 0.3s', '&:hover': { boxShadow: 3 } }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">{drive.company}</Typography>
                    <Typography variant="body2" color="text.secondary">{drive.role}</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Chip label={`${drive.match}% Match`} color={drive.match > 85 ? 'success' : 'warning'} size="small" />
                    <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>Deadline: {drive.deadline}</Typography>
                  </Box>
                </Box>
                <LinearProgress variant="determinate" value={drive.match} sx={{ mt: 1 }} />
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {selectedSection === 2 && (
        <Box sx={{ display: 'grid', gap: 2 }}>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>📈 Areas Needing Improvement</Typography>
          {weakAreas.map((area, idx) => (
            <Alert key={idx} severity={area.score < 70 ? 'error' : 'warning'} sx={{ mb: 1 }}>
              <AlertTitle>{area.area} - {area.score}%</AlertTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                <Typography variant="body2">{area.recommendation}</Typography>
                <Chip
                  icon={area.trend === 'up' ? <TrendingIcon /> : <TrendingDownIcon />}
                  label={area.trend === 'up' ? 'Improving' : 'Declining'}
                  color={area.trend === 'up' ? 'success' : 'error'}
                  size="small"
                />
              </Box>
              <LinearProgress variant="determinate" value={area.score} sx={{ mt: 1.5 }} />
            </Alert>
          ))}
        </Box>
      )}

      {selectedSection === 3 && (
        <Box sx={{ display: 'grid', gap: 2 }}>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>🧪 Upcoming Mock Interviews</Typography>
          {upcomingMocks.map((mock, idx) => {
            const severityColor = mock.importance === 'urgent' ? '#ef4444' : mock.importance === 'high' ? '#f59e0b' : '#06b6d4';
            return (
              <Card key={idx} sx={{ borderLeft: `5px solid ${severityColor}`, transition: 'all 0.3s', '&:hover': { boxShadow: 3 } }}>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">{mock.type} - {mock.company}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>📅 {mock.date}</Typography>
                    </Box>
                    <Chip
                      label={mock.importance.toUpperCase()}
                      color={mock.importance === 'urgent' ? 'error' : mock.importance === 'high' ? 'warning' : 'default'}
                      size="small"
                    />
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

      {selectedSection === 4 && (
        <Box sx={{ display: 'grid', gap: 2 }}>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>🏆 Your Progress Milestones</Typography>
          {milestones.map((milestone, idx) => (
            <Card key={idx} sx={{ transition: 'all 0.3s', '&:hover': { boxShadow: 3 } }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Typography variant="h5">{milestone.icon}</Typography>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">{milestone.title}</Typography>
                      <Typography variant="body2" color="text.secondary">{milestone.date}</Typography>
                    </Box>
                  </Box>
                  {milestone.completed ? (
                    <Chip icon={<CheckCircleIcon />} label="Completed" color="success" size="small" />
                  ) : (
                    <Chip label="In Progress" variant="outlined" size="small" />
                  )}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {selectedSection === 5 && (
        <Box sx={{ display: 'grid', gap: 2 }}>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>📄 Resume Improvement Alerts</Typography>
          {resumeIssues.map((issue, idx) => (
            <Alert key={idx} severity={issue.severity === 'high' ? 'error' : 'warning'}>
              <AlertTitle fontWeight="bold">{issue.issue}</AlertTitle>
              <Typography variant="body2">💡 {issue.suggestion}</Typography>
            </Alert>
          ))}
        </Box>
      )}

      {selectedSection === 6 && (
        <Box sx={{ display: 'grid', gap: 2 }}>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>🏢 Company-Wise Readiness Scores</Typography>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={readinessScores}>
              <PolarGrid />
              <PolarAngleAxis dataKey="company" />
              <PolarRadiusAxis />
              <Radar name="DSA" dataKey="dsa" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
              <Radar name="CS" dataKey="cs" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
              <Radar name="HR" dataKey="hr" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
              <Legend />
              <ChartTooltip />
            </RadarChart>
          </ResponsiveContainer>
          <Box sx={{ mt: 2, display: 'grid', gap: 1 }}>
            {readinessScores.map((score, idx) => (
              <Card key={idx} sx={{ p: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle2" fontWeight="bold">{score.company}</Typography>
                  <Chip label={`${score.probability}% Likely`} color={score.probability > 75 ? 'success' : 'warning'} size="small" />
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, mt: 1 }}>
                  <Box><Typography variant="caption">DSA: {score.dsa}%</Typography><LinearProgress value={score.dsa} variant="determinate" sx={{ mt: 0.5 }} /></Box>
                  <Box><Typography variant="caption">CS: {score.cs}%</Typography><LinearProgress value={score.cs} variant="determinate" sx={{ mt: 0.5 }} /></Box>
                  <Box><Typography variant="caption">HR: {score.hr}%</Typography><LinearProgress value={score.hr} variant="determinate" sx={{ mt: 0.5 }} /></Box>
                  <Box><Typography variant="caption">Resume: {score.resume}%</Typography><LinearProgress value={score.resume} variant="determinate" sx={{ mt: 0.5 }} /></Box>
                </Box>
              </Card>
            ))}
          </Box>
        </Box>
      )}

      {selectedSection === 7 && (
        <Box sx={{ display: 'grid', gap: 2 }}>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>📚 Today's Personalized Revision Plan</Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            <AlertTitle>🎯 Focus Areas</AlertTitle>
            Recommended revision based on your weak areas and upcoming mock schedule
          </Alert>
          {revisionPlan.map((plan, idx) => {
            const priorityColor = plan.priority === 'high' ? '#ef4444' : plan.priority === 'medium' ? '#f59e0b' : '#3b82f6';
            return (
              <Card key={idx} sx={{ borderLeft: `5px solid ${priorityColor}`, transition: 'all 0.3s', '&:hover': { boxShadow: 3 } }}>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">{plan.topic}</Typography>
                      <Typography variant="body2" color="text.secondary">⏱️ {plan.timeRequired}</Typography>
                    </Box>
                    <Chip
                      label={plan.priority.toUpperCase()}
                      color={plan.priority === 'high' ? 'error' : plan.priority === 'medium' ? 'warning' : 'default'}
                      size="small"
                    />
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default Analytics;
