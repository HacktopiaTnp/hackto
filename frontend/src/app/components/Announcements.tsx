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
  IconButton,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  useMediaQuery,
  useTheme,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  FormLabel,
} from '@mui/material';
import {
  Search as SearchIcon,
  Campaign as AnnouncementIcon,
  Info as InfoIcon,
  Schedule as ScheduleIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Business as CompanyIcon,
} from '@mui/icons-material';

type AnnouncementType = 
  | 'drive' 
  | 'shortlist' 
  | 'schedule' 
  | 'document' 
  | 'result' 
  | 'ppt' 
  | 'deadline' 
  | 'resource' 
  | 'policy' 
  | 'stats';

interface Announcement {
  id: string;
  type: AnnouncementType;
  title: string;
  description: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  date: string;
  author: string;
  read: boolean;
  
  // Drive specific
  company?: string;
  role?: string;
  package?: string;
  cgpa?: string;
  deadline?: string;
  applyLink?: string;
  
  // Shortlist specific
  shortlistedCount?: number;
  branch?: string;
  round?: string;
  nextRoundTime?: string;
  
  // Schedule specific
  oaTime?: string;
  technicalTime?: string;
  hrTime?: string;
  meetingLink?: string;
  venue?: string;
  
  // Document specific
  uploadDeadline?: string;
  requiredDocs?: string[];
  
  // Result specific
  selectedCount?: number;
  joiningDate?: string;
  
  // PPT specific
  pptDate?: string;
  speaker?: string;
  mandatory?: boolean;
  
  // Deadline specific
  remainingHours?: number;
  
  // Additional
  stats?: { students?: number; highest?: string; average?: string };
}

const Announcements: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<AnnouncementType | 'all'>('all');
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    // 🏢 New Company Drive Announcements
    {
      id: '1',
      type: 'drive',
      title: '🚀 Microsoft SDE Internship Drive - OPEN NOW',
      description: 'Premier internship opportunity for summer 2026',
      priority: 'urgent',
      date: '12 Apr 2026',
      author: 'Placement Cell',
      read: false,
      company: 'Microsoft',
      role: 'Software Development Engineer',
      package: '2.5 LPA (Stipend)',
      cgpa: '7.5+',
      deadline: '12 Apr 2026, 11:59 PM',
      applyLink: '#apply',
    },
    {
      id: '2',
      type: 'drive',
      title: '💼 Goldman Sachs Full-Time SDE Drive',
      description: 'FTE opening for final year CSE and IT students',
      priority: 'urgent',
      date: '11 Apr 2026',
      author: 'T&P Office',
      read: false,
      company: 'Goldman Sachs',
      role: 'Software Engineer',
      package: '32 LPA',
      cgpa: '8.0+',
      deadline: '15 Apr 2026',
      applyLink: '#apply',
    },
    {
      id: '3',
      type: 'drive',
      title: '🔥 Uber Data Analyst Internship',
      description: 'Analytics role with compensation',
      priority: 'high',
      date: '10 Apr 2026',
      author: 'Placement Cell',
      read: false,
      company: 'Uber',
      role: 'Data Analyst',
      package: '1.8 LPA',
      cgpa: '7.0+',
      deadline: '14 Apr 2026',
      applyLink: '#apply',
    },

    // 🎯 Eligible Students List / Shortlist
    {
      id: '4',
      type: 'shortlist',
      title: '✅ Amazon OA Shortlist Released',
      description: 'Check your dashboard for round details',
      priority: 'urgent',
      date: '12 Apr 2026',
      author: 'Hiring Team',
      read: false,
      company: 'Amazon',
      shortlistedCount: 127,
      branch: 'CSE/IT',
      round: 'Technical Interview Round 1',
      nextRoundTime: '15 Apr 2026, 10:00 AM',
    },
    {
      id: '5',
      type: 'shortlist',
      title: '🎯 Google DSA Shortlist - 89 Students',
      description: 'Congratulations on making it to the next round!',
      priority: 'high',
      date: '10 Apr 2026',
      author: 'Google HR',
      read: true,
      company: 'Google',
      shortlistedCount: 89,
      branch: 'All',
      round: 'System Design Round',
      nextRoundTime: '12 Apr 2026, 2:00 PM',
    },

    // 🗓️ Interview / Schedule Updates
    {
      id: '6',
      type: 'schedule',
      title: '⏰ Goldman Sachs Technical Round Schedule',
      description: 'Your interview slot has been assigned',
      priority: 'urgent',
      date: '12 Apr 2026',
      author: 'Goldman Sachs',
      read: false,
      company: 'Goldman Sachs',
      technicalTime: '13 Apr 2026, 3:00 PM - 4:00 PM',
      meetingLink: 'zoom.us/meeting/goldman-sach',
      venue: 'Online (Zoom)',
    },
    {
      id: '7',
      type: 'schedule',
      title: '📍 Microsoft HR Round - Hall 3, Block A',
      description: 'Final round schedule and venue details',
      priority: 'high',
      date: '11 Apr 2026',
      author: 'Microsoft HR',
      read: false,
      company: 'Microsoft',
      hrTime: '14 Apr 2026, 11:00 AM',
      venue: 'Hall 3, Block A',
      meetingLink: 'Physical Interview',
    },

    // 📄 Resume / Document Verification
    {
      id: '8',
      type: 'document',
      title: '⚠️ Last Chance: Resume Verification Deadline Today',
      description: 'Critical: Upload missing documents to stay eligible',
      priority: 'urgent',
      date: '12 Apr 2026',
      author: 'T&P Office',
      read: false,
      uploadDeadline: '12 Apr 2026, 5:00 PM',
      requiredDocs: ['10th Marksheet', '12th Marksheet', 'Latest Semester Marksheet', 'ATS Score Report', 'PAN/Aadhaar Proof'],
    },
    {
      id: '9',
      type: 'document',
      title: '📋 No Dues Certificate - Action Required',
      description: 'Generate and upload your no-dues certificate',
      priority: 'high',
      date: '10 Apr 2026',
      author: 'Accounts Office',
      read: true,
      uploadDeadline: '20 Apr 2026',
      requiredDocs: ['No Dues Certificate', 'Library Clearance', 'Hostel Clearance'],
    },

    // 🏆 Results / Selected Students
    {
      id: '10',
      type: 'result',
      title: '🎉 Congratulations! 45 Students Selected in Adobe',
      description: 'Check your position in the selected list',
      priority: 'high',
      date: '11 Apr 2026',
      author: 'Adobe HR',
      read: false,
      company: 'Adobe',
      selectedCount: 45,
      package: '22 LPA',
      joiningDate: '01 July 2026',
    },
    {
      id: '11',
      type: 'result',
      title: '✨ Final Results: Microsoft - 32 Selected',
      description: 'Final placement offers released',
      priority: 'high',
      date: '09 Apr 2026',
      author: 'Microsoft',
      read: true,
      company: 'Microsoft',
      selectedCount: 32,
      package: '28 LPA',
      joiningDate: '15 July 2026',
    },

    // 🎙️ Pre-Placement Talk
    {
      id: '12',
      type: 'ppt',
      title: '🎤 Apple PPT Today at 6:00 PM - Mandatory',
      description: 'Join the pre-placement talk to learn about roles',
      priority: 'urgent',
      date: '12 Apr 2026',
      author: 'Placement Cell',
      read: false,
      company: 'Apple',
      pptDate: '12 Apr 2026, 6:00 PM',
      speaker: 'Sarah Johnson (Director, HR)',
      mandatory: true,
      meetingLink: 'https://teams.microsoft.com/apple-ppt',
    },
    {
      id: '13',
      type: 'ppt',
      title: '🎙️ Morgan Stanley Investor Talk - 5:00 PM',
      description: 'Learn about investment division opportunities',
      priority: 'medium',
      date: '11 Apr 2026',
      author: 'Career Team',
      read: false,
      company: 'Morgan Stanley',
      pptDate: '12 Apr 2026, 5:00 PM',
      speaker: 'James Mitchell (VP, Morgan Stanley)',
      mandatory: false,
      meetingLink: 'https://zoom.com/morgan-stanley',
    },

    // 🚨 Deadline Reminders
    {
      id: '14',
      type: 'deadline',
      title: '⏰ URGENT: Adobe Application Deadline - 3 HOURS LEFT',
      description: 'Submit your application immediately!',
      priority: 'urgent',
      date: '12 Apr 2026',
      author: 'Alerts System',
      read: false,
      company: 'Adobe',
      deadline: '12 Apr 2026, 6:00 PM',
      remainingHours: 3,
    },
    {
      id: '15',
      type: 'deadline',
      title: '⚠️ Offer Acceptance Deadline - 2 Days Remaining',
      description: 'Accept or reject your offer before deadline',
      priority: 'high',
      date: '10 Apr 2026',
      author: 'HR Coordinator',
      read: false,
      company: 'Google',
      deadline: '14 Apr 2026, 11:59 PM',
      remainingHours: 48,
    },

    // 📚 Preparation Resources
    {
      id: '16',
      type: 'resource',
      title: '📖 Microsoft Previous Year OA Sheet - Download Now',
      description: '50+ questions with detailed solutions',
      priority: 'medium',
      date: '09 Apr 2026',
      author: 'Senior Batch',
      read: true,
      company: 'Microsoft',
    },
    {
      id: '17',
      type: 'resource',
      title: '💡 Goldman Sachs Interview Blog - System Design Focus',
      description: 'Experience shared by alumni who cracked the role',
      priority: 'medium',
      date: '08 Apr 2026',
      author: 'Alumni Network',
      read: true,
      company: 'Goldman Sachs',
    },

    // 🏢 Policy / TNP Rules
    {
      id: '18',
      type: 'policy',
      title: '🏛️ Updated: One Offer Policy Rules 2026',
      description: 'Mandatory read - New changes effective',
      priority: 'high',
      date: '05 Apr 2026',
      author: 'T&P Office',
      read: false,
    },
    {
      id: '19',
      type: 'policy',
      title: '⚖️ Dream Company Policy - Eligibility Criteria',
      description: 'GPA requirements updated, check details',
      priority: 'high',
      date: '04 Apr 2026',
      author: 'Head, Placement',
      read: true,
    },

    // 📈 Placement Stats & Milestones
    {
      id: '20',
      type: 'stats',
      title: '🎯 Placement Drive Stats - 80% CSE Batch Placed!',
      description: 'Major milestone achieved in record time',
      priority: 'medium',
      date: '12 Apr 2026',
      author: 'Statistics System',
      read: false,
      stats: {
        students: 235,
        highest: '54 LPA (HFT Fund)',
        average: '18.5 LPA',
      },
    },
  ]);

  const announcementTypes: { type: AnnouncementType; label: string; color: 'error' | 'success' | 'info' | 'warning' }[] = [
    { type: 'drive', label: '🏢 New Drives', color: 'error' },
    { type: 'shortlist', label: '✅ Shortlists', color: 'success' },
    { type: 'schedule', label: '🗓️ Schedules', color: 'info' },
    { type: 'document', label: '📄 Documents', color: 'warning' },
    { type: 'result', label: '🏆 Results', color: 'success' },
    { type: 'ppt', label: '🎙️ PPT', color: 'info' },
    { type: 'deadline', label: '⏰ Deadlines', color: 'error' },
    { type: 'resource', label: '📚 Resources', color: 'info' },
    { type: 'policy', label: '⚖️ Policies', color: 'warning' },
    { type: 'stats', label: '📈 Stats', color: 'success' },
  ];

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((a) => {
      const matchesSearch =
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedType === 'all' || a.type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [searchQuery, selectedType, announcements]);

  const unreadCount = announcements.filter((a) => !a.read).length;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return '#d32f2f';
      case 'high':
        return '#f57c00';
      case 'medium':
        return '#1976d2';
      case 'low':
        return '#388e3c';
      default:
        return '#757575';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return '🔴 URGENT';
      case 'high':
        return '🟠 HIGH';
      case 'medium':
        return '🔵 MEDIUM';
      case 'low':
        return '🟢 LOW';
      default:
        return priority;
    }
  };

  const handleViewDetails = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setDetailDialogOpen(true);
  };

  const handleEditOpen = (announcement: Announcement) => {
    setEditingAnnouncement({ ...announcement });
    setEditDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setAnnouncements(announcements.filter((a) => a.id !== id));
  };

  const handleMarkAsRead = (id: string) => {
    setAnnouncements(
      announcements.map((a) => (a.id === id ? { ...a, read: true } : a))
    );
  };

  const handleSaveEdit = () => {
    if (editingAnnouncement) {
      setAnnouncements(
        announcements.map((a) =>
          a.id === editingAnnouncement.id ? editingAnnouncement : a
        )
      );
      setEditDialogOpen(false);
    }
  };

  return (
    <Box sx={{ width: '100%', bgcolor: 'background.default', minHeight: '100vh', p: { xs: 1, sm: 2, md: 3 } }}>
      {/* Header */}
      <Paper elevation={3} sx={{ p: { xs: 1.5, sm: 2, md: 3 }, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 1, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Badge badgeContent={unreadCount} color="error">
              <AnnouncementIcon sx={{ fontSize: { xs: 28, sm: 32, md: 40 } }} color="primary" />
            </Badge>
            <Box>
              <Typography variant={isMobile ? 'h6' : isTablet ? 'h5' : 'h4'} fontWeight="bold">
                📢 TNP Announcements
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {unreadCount} unread • {announcements.length} total
              </Typography>
            </Box>
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} size={isMobile ? 'small' : 'medium'}>
            Add Announcement
          </Button>
        </Box>

        {/* Search */}
        <TextField
          fullWidth
          size={isMobile ? 'small' : 'medium'}
          placeholder="Search announcements..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        {/* Type Filter Chips */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', overflowX: 'auto', pb: 1 }}>
          <Chip
            label="All"
            onClick={() => setSelectedType('all')}
            color={selectedType === 'all' ? 'primary' : 'default'}
            variant={selectedType === 'all' ? 'filled' : 'outlined'}
            size={isMobile ? 'small' : 'medium'}
          />
          {announcementTypes.map((t) => (
            <Chip
              key={t.type}
              label={t.label}
              onClick={() => setSelectedType(t.type)}
              color={selectedType === t.type ? t.color : 'default'}
              variant={selectedType === t.type ? 'filled' : 'outlined'}
              size={isMobile ? 'small' : 'medium'}
            />
          ))}
        </Box>
      </Paper>

      {/* Announcements List */}
      <Box sx={{ display: 'grid', gap: 2 }}>
        {filteredAnnouncements.length === 0 ? (
          <Paper sx={{ p: { xs: 4, md: 8 }, textAlign: 'center' }}>
            <AnnouncementIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No announcements found
            </Typography>
          </Paper>
        ) : (
          filteredAnnouncements.map((announcement) => (
            <Card
              key={announcement.id}
              sx={{
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                borderLeft: `5px solid ${getPriorityColor(announcement.priority)}`,
                bgcolor: announcement.read ? 'background.paper' : 'action.hover',
                '&:hover': {
                  transform: 'translateX(4px)',
                  boxShadow: 4,
                },
              }}
              onClick={() => handleViewDetails(announcement)}
            >
              <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                      {!announcement.read && <Badge variant="dot" color="primary" sx={{ mr: 0.5 }} />}
                      <Typography
                        variant={isMobile ? 'subtitle2' : 'h6'}
                        fontWeight={announcement.read ? 'normal' : 'bold'}
                        noWrap
                      >
                        {announcement.title}
                      </Typography>
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                      {announcement.description}
                    </Typography>

                    {/* Announcement Details */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 1, mb: 1.5 }}>
                      {announcement.company && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <CompanyIcon sx={{ fontSize: 16 }} />
                          <Typography variant="caption" fontWeight="bold">{announcement.company}</Typography>
                        </Box>
                      )}
                      {announcement.deadline && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <ScheduleIcon sx={{ fontSize: 16 }} />
                          <Typography variant="caption" sx={{ color: announcement.priority === 'urgent' ? 'error.main' : 'inherit' }} fontWeight="bold">
                            {announcement.deadline}
                          </Typography>
                        </Box>
                      )}
                      {announcement.package && (
                        <Box>
                          <Typography variant="caption" display="block" fontWeight="bold">💰 {announcement.package}</Typography>
                        </Box>
                      )}
                      {announcement.shortlistedCount && (
                        <Box>
                          <Typography variant="caption" display="block" fontWeight="bold">✅ {announcement.shortlistedCount} Students Shortlisted</Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Chips */}
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', alignItems: 'center' }}>
                      <Chip
                        label={getPriorityLabel(announcement.priority)}
                        size="small"
                        sx={{ bgcolor: getPriorityColor(announcement.priority), color: 'white' }}
                      />
                      <Chip
                        label={announcementTypes.find((t) => t.type === announcement.type)?.label || announcement.type}
                        size="small"
                        variant="outlined"
                      />
                      <Typography variant="caption" color="text.secondary">
                        {announcement.author} • {announcement.date}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Actions */}
                  <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(announcement);
                        }}
                      >
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditOpen(announcement);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(announcement.id);
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))
        )}
      </Box>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" fontWeight="bold">{selectedAnnouncement?.title}</Typography>
            <Chip
              label={getPriorityLabel(selectedAnnouncement?.priority || 'low')}
              size="small"
              sx={{ mt: 1, bgcolor: getPriorityColor(selectedAnnouncement?.priority || 'low'), color: 'white' }}
            />
          </Box>
          <IconButton size="small" onClick={() => setDetailDialogOpen(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {selectedAnnouncement?.author} • {selectedAnnouncement?.date}
          </Typography>
          <Typography variant="body1" paragraph>{selectedAnnouncement?.description}</Typography>

          {/* Details Grid */}
          <Box sx={{ display: 'grid', gap: 1.5, my: 2 }}>
            {selectedAnnouncement?.company && <Typography><strong>🏢 Company:</strong> {selectedAnnouncement.company}</Typography>}
            {selectedAnnouncement?.role && <Typography><strong>💼 Role:</strong> {selectedAnnouncement.role}</Typography>}
            {selectedAnnouncement?.package && <Typography><strong>💰 Package:</strong> {selectedAnnouncement.package}</Typography>}
            {selectedAnnouncement?.deadline && <Typography><strong>📅 Deadline:</strong> {selectedAnnouncement.deadline}</Typography>}
            {selectedAnnouncement?.shortlistedCount && <Typography><strong>✅ Shortlisted:</strong> {selectedAnnouncement.shortlistedCount} students</Typography>}
            {selectedAnnouncement?.selectedCount && <Typography><strong>🎉 Selected:</strong> {selectedAnnouncement.selectedCount} students</Typography>}
            {selectedAnnouncement?.pptDate && <Typography><strong>🎤 Date:</strong> {selectedAnnouncement.pptDate}</Typography>}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
          {!selectedAnnouncement?.read && (
            <Button
              variant="contained"
              onClick={() => {
                handleMarkAsRead(selectedAnnouncement?.id || '');
                setDetailDialogOpen(false);
              }}
            >
              Mark as Read
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Announcement</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'grid', gap: 1.5 }}>
            <TextField
              fullWidth
              size="small"
              label="Title"
              value={editingAnnouncement?.title || ''}
              onChange={(e) => setEditingAnnouncement(prev => prev ? { ...prev, title: e.target.value } : null)}
            />
            <TextField
              fullWidth
              size="small"
              label="Description"
              multiline
              rows={3}
              value={editingAnnouncement?.description || ''}
              onChange={(e) => setEditingAnnouncement(prev => prev ? { ...prev, description: e.target.value } : null)}
            />
            <FormControl fullWidth size="small">
              <FormLabel>Priority</FormLabel>
              <Select
                value={editingAnnouncement?.priority || 'medium'}
                onChange={(e) => setEditingAnnouncement(prev => prev ? { ...prev, priority: e.target.value as any } : null)}
              >
                <MenuItem value="urgent">🔴 Urgent</MenuItem>
                <MenuItem value="high">🟠 High</MenuItem>
                <MenuItem value="medium">🔵 Medium</MenuItem>
                <MenuItem value="low">🟢 Low</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveEdit}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Announcements;
