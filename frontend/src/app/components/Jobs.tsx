import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  IconButton,
  Divider,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Close as CloseIcon,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material';
import {
  Search as SearchIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  CheckCircle as AppliedIcon,
  Cancel as RejectedIcon,
  Star as OfferedIcon,
  Work as WorkIcon,
  Close,
  CheckCircle,
} from '@mui/icons-material';
import { detectBackendPort } from '@/utils/portDetection';

interface Job {
  id: string;
  company: string;
  role: string;
  type: 'Summer Intern' | 'Regular Intern' | 'Full Time' | 'Intern + Full Time' | 'Intern Leads to Full Time';
  ctc: string;
  location: string;
  postedDate: string;
  deadline: string;
  status: 'eligible' | 'applied' | 'rejected' | 'offered' | 'not-eligible' | 'eligible-not-applied';
  description: string;
  detailedDescription?: string;
  responsibilities?: string[];
  requirements?: string[];
  benefits?: string[];
  eligibility: {
    cgpa: number;
    branches: string[];
    batch: string;
  };
  companyWebsite?: string;
  contactEmail?: string;
}

const Jobs: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState<string>('All');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);
  const [selectedResume, setSelectedResume] = useState<string>('');
  const [coverLetter, setCoverLetter] = useState<string>('');
  const [applySuccess, setApplySuccess] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  // Fetch jobs from backend API
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const backendUrl = await detectBackendPort();
        const response = await fetch(`${backendUrl}/api/v1/jobs/list`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch jobs');
        }
        
        const data = await response.json();
        
        // Safely extract array from API response - backend returns { success: true, data: [...] }
        let jobsArray: any[] = [];
        if (Array.isArray(data)) {
          jobsArray = data;
        } else if (data && typeof data === 'object' && Array.isArray(data.data)) {
          jobsArray = data.data;
        } else {
          console.warn('Unexpected API response format:', data);
          jobsArray = [];
        }
        
        // Transform API response to match component interface
        const transformedJobs: Job[] = jobsArray.map((job: any, index: number) => ({
          id: job.id || (index + 1).toString(),
          company: job.company || job.companyId || 'Company',
          role: job.role || job.title || job.roleTitle || 'Role',
          type: job.type || 'Full Time',
          ctc: job.ctc || '0 LPA',
          location: job.location || 'Location',
          postedDate: new Date(job.posted).toLocaleDateString() || 'N/A',
          deadline: job.deadline || 'N/A',
          status: 'applied', // Default status from API
          description: job.description || 'Job description not available',
          eligibility: {
            cgpa: 7.0,
            branches: ['CSE', 'IT'],
            batch: '2026'
          }
        }));
        
        setJobs(transformedJobs);
        setError(null);
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError('Failed to load jobs. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobs();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  // Handle opening job details modal
  const handleViewDetails = async (job: Job) => {
    setSelectedJob(job);
    setDetailsOpen(true);
    
    // Optionally fetch more detailed information from backend
    if (job.id) {
      try {
        setDetailsLoading(true);
        const backendUrl = await detectBackendPort();
        const response = await fetch(`${backendUrl}/api/v1/jobs/${job.id}`);
        
        if (response.ok) {
          const detailedData = await response.json();
          // Merge detailed data with existing job
          setSelectedJob((prevJob) => ({
            ...prevJob,
            ...detailedData.data,
          } as Job));
        }
      } catch (err) {
        console.error('Error fetching job details:', err);
      } finally {
        setDetailsLoading(false);
      }
    }
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedJob(null);
  };

  // Handle opening apply dialog
  const handleOpenApplyDialog = (job: Job) => {
    setSelectedJob(job);
    setApplyDialogOpen(true);
    setApplyError(null);
    setApplySuccess(false);
    setSelectedResume('');
    setCoverLetter('');
  };

  const handleCloseApplyDialog = () => {
    setApplyDialogOpen(false);
    setSelectedResume('');
    setCoverLetter('');
    setApplyError(null);
    setApplySuccess(false);
  };

  // Handle job application submission
  const handleApplySubmit = async () => {
    if (!selectedJob) return;
    
    if (!selectedResume) {
      setApplyError('Please select a resume');
      return;
    }

    try {
      setApplyLoading(true);
      setApplyError(null);
      const backendUrl = await detectBackendPort();
      
      const response = await fetch(`${backendUrl}/api/v1/jobs/${selectedJob.id}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'user-123', // Replace with actual user ID from auth
          resumeId: selectedResume,
          coverLetter: coverLetter || '',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit application');
      }

      const data = await response.json();
      setApplySuccess(true);
      
      // Update job status locally
      setJobs(jobs.map(job => 
        job.id === selectedJob.id 
          ? { ...job, status: 'applied' }
          : job
      ));

      // Close dialog after 2 seconds
      setTimeout(() => {
        handleCloseApplyDialog();
        setDetailsOpen(false);
      }, 2000);
    } catch (err) {
      console.error('Error applying to job:', err);
      setApplyError(err instanceof Error ? err.message : 'Failed to apply for job');
    } finally {
      setApplyLoading(false);
    }
  };

  const getFilteredJobs = () => {
    let filtered = jobs;

    // Filter by tab
    switch (currentTab) {
      case 1: // Eligible Jobs
        filtered = filtered.filter(job => job.status === 'eligible' || job.status === 'eligible-not-applied');
        break;
      case 2: // Applied Jobs
        filtered = filtered.filter(job => job.status === 'applied');
        break;
      case 3: // Eligible But Not Applied
        filtered = filtered.filter(job => job.status === 'eligible-not-applied');
        break;
      case 4: // Not Eligible Jobs
        filtered = filtered.filter(job => job.status === 'not-eligible');
        break;
      case 5: // Rejected Jobs
        filtered = filtered.filter(job => job.status === 'rejected');
        break;
      case 6: // Offered Jobs
        filtered = filtered.filter(job => job.status === 'offered');
        break;
      default: // Jobs For You (All)
        break;
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(job =>
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by job type
    if (jobTypeFilter !== 'All') {
      filtered = filtered.filter(job => job.type === jobTypeFilter);
    }

    return filtered;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'offered': return 'success';
      case 'applied': return 'info';
      case 'rejected': return 'error';
      case 'eligible': return 'primary';
      case 'eligible-not-applied': return 'warning';
      case 'not-eligible': return 'default';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'offered': return 'Offered';
      case 'applied': return 'Applied';
      case 'rejected': return 'Rejected';
      case 'eligible': return 'Eligible';
      case 'eligible-not-applied': return 'Not Applied';
      case 'not-eligible': return 'Not Eligible';
      default: return status;
    }
  };

  const filteredJobs = getFilteredJobs();

  if (loading) {
    return (
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ width: '100%', p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', bgcolor: 'background.default', minHeight: '100vh', p: { xs: 1.5, sm: 2, md: 3 } }}>
      {/* Header */}
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
          Job Opportunities
        </Typography>
        
        {/* Search and Filter */}
        <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <TextField
            placeholder="Search jobs, companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ flexGrow: 1, minWidth: { xs: '100%', sm: '300px' } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          
          <FormControl sx={{ minWidth: { xs: '100%', sm: 200 } }}>
            <InputLabel>Job Type</InputLabel>
            <Select
              value={jobTypeFilter}
              onChange={(e) => setJobTypeFilter(e.target.value)}
              label="Job Type"
            >
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Summer Intern">Summer Intern</MenuItem>
              <MenuItem value="Regular Intern">Regular Intern</MenuItem>
              <MenuItem value="Full Time">Full Time</MenuItem>
              <MenuItem value="Intern + Full Time">Intern + Full Time</MenuItem>
              <MenuItem value="Intern Leads to Full Time">Intern Leads to Full Time</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Tabs */}
      <Paper elevation={3}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            '& .MuiTab-root': {
              fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' }
            }
          }}
        >
          <Tab label={`Jobs (${jobs.length})`} />
          <Tab label={`Eligible (${jobs.filter(j => j.status === 'eligible' || j.status === 'eligible-not-applied').length})`} />
          <Tab label={`Applied (${jobs.filter(j => j.status === 'applied').length})`} />
          <Tab label={`Not Applied (${jobs.filter(j => j.status === 'eligible-not-applied').length})`} />
          <Tab label={`Not Eligible (${jobs.filter(j => j.status === 'not-eligible').length})`} />
          <Tab label={`Rejected (${jobs.filter(j => j.status === 'rejected').length})`} />
          <Tab label={`Offered (${jobs.filter(j => j.status === 'offered').length})`} />
        </Tabs>

        {/* Job Listings */}
        <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
          {filteredJobs.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: { xs: 4, sm: 6, md: 8 } }}>
              <WorkIcon sx={{ fontSize: { xs: 48, sm: 64 }, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No jobs found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your filters or check back later for new opportunities
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {filteredJobs.map((job) => (
                <Grid item xs={12} key={job.id}>
                  <Card
                    elevation={2}
                    sx={{
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 6,
                      },
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, flexWrap: 'wrap' }}>
                            <BusinessIcon color="primary" />
                            <Typography variant="h5" fontWeight="bold" sx={{ wordBreak: 'break-word' }}>
                              {job.company}
                            </Typography>
                            <Chip
                              label={getStatusLabel(job.status)}
                              color={getStatusColor(job.status)}
                              size="small"
                            />
                          </Box>
                          <Typography variant="h6" color="text.secondary" gutterBottom>
                            {job.role}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: { xs: 'left', sm: 'right' }, minWidth: 'auto' }}>
                          <Typography variant="h5" fontWeight="bold" color="primary">
                            {job.ctc}
                          </Typography>
                          <Chip label={job.type} size="small" variant="outlined" sx={{ mt: 1 }} />
                        </Box>
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={12} sm={6} md={3}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LocationIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              {job.location}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Posted:</strong> {job.postedDate}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Deadline:</strong> {job.deadline}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Min CGPA:</strong> {job.eligibility.cgpa}
                          </Typography>
                        </Grid>
                      </Grid>

                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {job.description}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Eligible Branches:</strong>
                        </Typography>
                        {job.eligibility.branches.map((branch) => (
                          <Chip key={branch} label={branch} size="small" variant="outlined" />
                        ))}
                      </Box>

                      <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
                        {job.status === 'eligible' || job.status === 'eligible-not-applied' ? (
                          <Button 
                            variant="contained" 
                            color="primary"
                            onClick={() => handleOpenApplyDialog(job)}
                          >
                            Apply Now
                          </Button>
                        ) : job.status === 'applied' ? (
                          <Button 
                            variant="contained" 
                            color="success"
                            disabled
                          >
                            ✓ Applied
                          </Button>
                        ) : null}
                        <Button 
                          variant="outlined"
                          onClick={() => handleViewDetails(job)}
                        >
                          View Details
                        </Button>
                        {job.status === 'offered' && (
                          <Button variant="contained" color="success">
                            View Offer Letter
                          </Button>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Paper>

      {/* Job Details Modal */}
      <Dialog 
        open={detailsOpen} 
        onClose={handleCloseDetails}
        maxWidth="sm"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            maxHeight: '90vh',
            borderRadius: 2,
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight="bold">
            Job Details
          </Typography>
          <IconButton onClick={handleCloseDetails} size="small">
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ maxHeight: 'calc(90vh - 130px)', overflowY: 'auto' }}>
          {detailsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : selectedJob ? (
            <Box sx={{ width: '100%' }}>
              {/* Company and Role */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <BusinessIcon color="primary" sx={{ fontSize: 28 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight="bold">
                      {selectedJob.company}
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                      {selectedJob.role}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip 
                    label={getStatusLabel(selectedJob.status)} 
                    color={getStatusColor(selectedJob.status) as any}
                  />
                  <Chip label={selectedJob.type} variant="outlined" />
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Key Information */}
              <TableContainer sx={{ mb: 3 }}>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', width: '40%' }}>CTC/Salary:</TableCell>
                      <TableCell sx={{ color: 'primary.main', fontWeight: 'bold' }}>{selectedJob.ctc}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Location:</TableCell>
                      <TableCell>{selectedJob.location}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Posted:</TableCell>
                      <TableCell>{selectedJob.postedDate}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Deadline:</TableCell>
                      <TableCell>{selectedJob.deadline}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Min CGPA:</TableCell>
                      <TableCell>{selectedJob.eligibility.cgpa}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Description */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                  About the Job
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {selectedJob.detailedDescription || selectedJob.description}
                </Typography>
              </Box>

              {/* Responsibilities */}
              {selectedJob.responsibilities && selectedJob.responsibilities.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                    Key Responsibilities
                  </Typography>
                  <Box sx={{ pl: 2 }}>
                    {selectedJob.responsibilities.map((resp, idx) => (
                      <Typography key={idx} variant="body2" sx={{ mb: 0.5, display: 'flex', gap: 1 }}>
                        <span>•</span>
                        <span>{resp}</span>
                      </Typography>
                    ))}
                  </Box>
                </Box>
              )}

              {/* Requirements */}
              {selectedJob.requirements && selectedJob.requirements.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                    Requirements
                  </Typography>
                  <Box sx={{ pl: 2 }}>
                    {selectedJob.requirements.map((req, idx) => (
                      <Typography key={idx} variant="body2" sx={{ mb: 0.5, display: 'flex', gap: 1 }}>
                        <span>•</span>
                        <span>{req}</span>
                      </Typography>
                    ))}
                  </Box>
                </Box>
              )}

              {/* Benefits */}
              {selectedJob.benefits && selectedJob.benefits.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                    Benefits
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {selectedJob.benefits.map((benefit, idx) => (
                      <Chip key={idx} label={benefit} variant="outlined" />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Eligibility */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                  Eligibility Criteria
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="body2">
                    <strong>Minimum CGPA:</strong> {selectedJob.eligibility.cgpa}
                  </Typography>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                      Eligible Branches:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {selectedJob.eligibility.branches.map((branch) => (
                        <Chip key={branch} label={branch} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </Box>
                  <Typography variant="body2">
                    <strong>Batch:</strong> {selectedJob.eligibility.batch}
                  </Typography>
                </Box>
              </Box>

              {/* Contact Information */}
              {(selectedJob.companyWebsite || selectedJob.contactEmail) && (
                <Box sx={{ mb: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                  <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                    Contact Information
                  </Typography>
                  {selectedJob.companyWebsite && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Website:</strong>{' '}
                      <a href={selectedJob.companyWebsite} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>
                        {selectedJob.companyWebsite}
                      </a>
                    </Typography>
                  )}
                  {selectedJob.contactEmail && (
                    <Typography variant="body2">
                      <strong>Email:</strong> {selectedJob.contactEmail}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          ) : (
            <Typography>No job selected</Typography>
          )}
        </DialogContent>

        <DialogActions sx={{ gap: 1, p: 2 }}>
          <Button onClick={handleCloseDetails} variant="outlined">
            Close
          </Button>
          {selectedJob && (selectedJob.status === 'eligible' || selectedJob.status === 'eligible-not-applied') && (
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => {
                handleCloseDetails();
                handleOpenApplyDialog(selectedJob);
              }}
            >
              Apply Now
            </Button>
          )}
          {selectedJob?.status === 'applied' && (
            <Button variant="contained" color="success" disabled>
              ✓ Already Applied
            </Button>
          )}
          {selectedJob?.status === 'offered' && (
            <Button variant="contained" color="success">
              View Offer Letter
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Apply Job Dialog */}
      <Dialog 
        open={applyDialogOpen} 
        onClose={handleCloseApplyDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight="bold">
            Apply to {selectedJob?.company}
          </Typography>
          <IconButton onClick={handleCloseApplyDialog} size="small">
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {applySuccess ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" color="success.main" gutterBottom>
                Application Submitted Successfully!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                You have successfully applied to {selectedJob?.role} at {selectedJob?.company}. 
                We will notify you about your application status.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {applyError && (
                <Alert severity="error">{applyError}</Alert>
              )}

              {/* Job Info Summary */}
              <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                  Position Details
                </Typography>
                <Typography variant="body2">
                  <strong>Role:</strong> {selectedJob?.role}
                </Typography>
                <Typography variant="body2">
                  <strong>Company:</strong> {selectedJob?.company}
                </Typography>
                <Typography variant="body2">
                  <strong>Salary:</strong> {selectedJob?.ctc}
                </Typography>
              </Box>

              {/* Resume Selection */}
              <FormControl fullWidth error={!selectedResume && applyLoading}>
                <InputLabel>Select Resume *</InputLabel>
                <Select
                  value={selectedResume}
                  onChange={(e) => setSelectedResume(e.target.value)}
                  label="Select Resume *"
                  disabled={applyLoading}
                >
                  <MenuItem value="">-- Choose a Resume --</MenuItem>
                  <MenuItem value="resume-1">Default Resume</MenuItem>
                  <MenuItem value="resume-2">Developer Focus Resume</MenuItem>
                  <MenuItem value="resume-3">Leadership Resume</MenuItem>
                </Select>
              </FormControl>

              {/* Cover Letter */}
              <TextField
                label="Cover Letter (Optional)"
                placeholder="Tell us why you're interested in this position..."
                multiline
                rows={4}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                fullWidth
                disabled={applyLoading}
                variant="outlined"
              />

              {/* Additional Info */}
              <Typography variant="caption" color="text.secondary">
                By clicking Apply, you agree to share your resume and information with {selectedJob?.company}.
              </Typography>
            </Box>
          )}
        </DialogContent>

        {!applySuccess && (
          <DialogActions sx={{ gap: 1, p: 2 }}>
            <Button 
              onClick={handleCloseApplyDialog} 
              variant="outlined"
              disabled={applyLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleApplySubmit}
              variant="contained" 
              color="primary"
              disabled={!selectedResume || applyLoading}
            >
              {applyLoading ? 'Submitting...' : 'Submit Application'}
            </Button>
          </DialogActions>
        )}
      </Dialog>
    </Box>
  );
};

export default Jobs;
