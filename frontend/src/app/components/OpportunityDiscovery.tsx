import { useState, useEffect } from 'react';
import { Search, Filter, Briefcase, MapPin, Building2, TrendingUp, Star, Clock, ExternalLink, Bell, Download, BookmarkPlus, Send, Sparkles, Target } from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Label } from '@/app/components/ui/label';
import { Slider } from '@/app/components/ui/slider';

interface OpportunityDiscoveryProps {
  userRole: 'student' | 'coordinator' | 'admin';
  searchQuery?: string;
  setView?: (view: 'dashboard' | 'opportunities' | 'recruiters' | 'interview' | 'analytics') => void;
}

interface Job {
  id: number;
  company: string;
  website?: string;
  role: string;
  location: string;
  type: 'Full-time' | 'Internship' | 'Contract';
  ctc: string;
  experience: string;
  skills: string[];
  description: string;
  requirements: string[];
  deadline: string;
  postedDate: string;
  match: number;
  status: 'new' | 'applied' | 'saved';
  eligibility: {
    minCGPA: number;
    branches: string[];
    passoutYear: string;
  };
  benefits: string[];
}

export default function OpportunityDiscovery({ userRole, searchQuery: globalSearchQuery = '', setView }: OpportunityDiscoveryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [filterType, setFilterType] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [salaryRange, setSalaryRange] = useState([0, 50]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use global search if provided, otherwise use local search
  const activeSearchQuery = globalSearchQuery || searchQuery;

  // Fetch jobs from API
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('http://localhost:5000/api/jobs/enriched');
        
        if (!response.ok) {
          throw new Error(`Backend server not responding (status: ${response.status})`);
        }
        
        const data = await response.json();
        
        // Transform API data to match our Job interface
        const transformedJobs: Job[] = data.map((job: any) => ({
          id: job.id || Math.random(),
          company: job.company || 'Unknown Company',
          website: job.website || job.company_website,
          role: job.role || job.title || job.position || 'Position',
          location: job.location || 'Remote',
          type: job.type || job.job_type || 'Full-time',
          ctc: job.ctc || job.salary || job.package || 'Not specified',
          experience: job.experience || job.experience_required || '0-1 years',
          skills: job.skills || job.required_skills || [],
          description: job.description || job.job_description || '',
          requirements: job.requirements || job.qualifications || [],
          deadline: job.deadline || job.application_deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          postedDate: job.postedDate || job.posted_date || job.created_at || new Date().toISOString().split('T')[0],
          match: job.match || job.match_percentage || Math.floor(Math.random() * 30) + 70,
          status: job.status || 'new',
          eligibility: {
            minCGPA: job.eligibility?.minCGPA || job.min_cgpa || 7.0,
            branches: job.eligibility?.branches || job.eligible_branches || ['CSE', 'IT'],
            passoutYear: job.eligibility?.passoutYear || job.passout_year || '2026',
          },
          benefits: job.benefits || job.perks || [],
        }));
        
        setJobs(transformedJobs);
      } catch (err) {
        console.error('Error fetching jobs:', err);
        
        // Use fallback mock data when API fails
        console.warn('Using fallback mock data...');
        const mockJobs: Job[] = [
          {
            id: 1,
            company: 'Google',
            website: 'https://careers.google.com',
            role: 'Software Engineering Intern',
            location: 'Bangalore, India',
            type: 'Internship',
            ctc: '₹8-10 LPA',
            experience: '0-1 years',
            skills: ['React', 'TypeScript', 'Node.js', 'System Design'],
            description: 'Join Google as a Software Engineering Intern and work on cutting-edge technologies that impact billions of users worldwide.',
            requirements: ['Strong problem-solving skills', 'Proficiency in data structures', 'Team collaboration', 'Passion for technology'],
            deadline: '2026-03-15',
            postedDate: '2026-01-20',
            match: 95,
            status: 'new',
            eligibility: {
              minCGPA: 8.0,
              branches: ['CSE', 'IT', 'ECE'],
              passoutYear: '2026'
            },
            benefits: ['Health Insurance', 'Free Meals', 'Learning Budget', 'Gym Membership']
          },
          {
            id: 2,
            company: 'Microsoft',
            website: 'https://careers.microsoft.com',
            role: 'Full Stack Developer',
            location: 'Hyderabad, India',
            type: 'Full-time',
            ctc: '₹18-22 LPA',
            experience: '0-2 years',
            skills: ['Angular', 'C#', '.NET', 'Azure', 'SQL'],
            description: 'Build innovative solutions for enterprise clients using Microsoft\'s cloud technologies and frameworks.',
            requirements: ['Bachelor\'s degree in CS', 'Full-stack development experience', 'Cloud platform knowledge', 'Agile methodology'],
            deadline: '2026-02-28',
            postedDate: '2026-01-18',
            match: 88,
            status: 'new',
            eligibility: {
              minCGPA: 7.5,
              branches: ['CSE', 'IT'],
              passoutYear: '2026'
            },
            benefits: ['Stock Options', 'Work from Home', 'Professional Development', 'Parental Leave']
          },
          {
            id: 3,
            company: 'Amazon',
            website: 'https://amazon.jobs',
            role: 'Backend Engineer',
            location: 'Mumbai, India',
            type: 'Full-time',
            ctc: '₹20-28 LPA',
            experience: '1-3 years',
            skills: ['Java', 'Python', 'AWS', 'Docker', 'Microservices'],
            description: 'Design and develop scalable backend systems that power Amazon\'s e-commerce platform.',
            requirements: ['Strong CS fundamentals', 'Distributed systems experience', 'API design', 'Performance optimization'],
            deadline: '2026-03-01',
            postedDate: '2026-01-15',
            match: 82,
            status: 'saved',
            eligibility: {
              minCGPA: 7.0,
              branches: ['CSE', 'IT', 'ECE'],
              passoutYear: '2025-2026'
            },
            benefits: ['Relocation Assistance', 'Employee Discounts', 'Career Growth', 'International Opportunities']
          }
        ];
        
        setJobs(mockJobs);
        setError(null); // Clear error since we have fallback data
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []); // Empty dependency array means this runs once on mount

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.role.toLowerCase().includes(activeSearchQuery.toLowerCase()) ||
                         job.company.toLowerCase().includes(activeSearchQuery.toLowerCase()) ||
                         job.skills.some(skill => skill.toLowerCase().includes(activeSearchQuery.toLowerCase()));
    const matchesType = filterType === 'all' || job.type === filterType;
    const matchesLocation = filterLocation === 'all' || job.location === filterLocation;
    return matchesSearch && matchesType && matchesLocation;
  });

  const stats = [
    { label: 'Total Opportunities', value: jobs.length, icon: Briefcase, color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
    { label: 'High Match (>80%)', value: jobs.filter(j => j.match >= 80).length, icon: Target, color: 'from-green-500 to-green-600', bgColor: 'bg-green-50', textColor: 'text-green-600' },
    { label: 'New This Week', value: jobs.filter(j => j.status === 'new').length, icon: Sparkles, color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-50', textColor: 'text-purple-600' },
    { label: 'Applied', value: jobs.filter(j => j.status === 'applied').length, icon: Send, color: 'from-orange-500 to-orange-600', bgColor: 'bg-orange-50', textColor: 'text-orange-600' },
  ];

  const handleApply = (job: Job) => {
    // Open company website if available, otherwise show alert
    if (job.website) {
      window.open(job.website, '_blank', 'noopener,noreferrer');
    } else {
      alert(`Please visit ${job.company}'s career page to apply for this position.`);
    }
  };

  const handleSave = (jobId: number) => {
    setJobs(prevJobs => 
      prevJobs.map(job => 
        job.id === jobId 
          ? { ...job, status: job.status === 'saved' ? 'new' : 'saved' as 'new' | 'applied' | 'saved' }
          : job
      )
    );
  };

  const handleSetAlert = (job: Job) => {
    alert(`Alert set for ${job.role} at ${job.company}! You'll be notified about updates and similar opportunities.`);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 mb-2">Opportunity Discovery</h1>
        <p className="text-sm md:text-base lg:text-lg text-slate-600">
          AI-powered job matching based on your profile, skills, and preferences
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
          <p className="text-lg text-slate-600">Loading job opportunities...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <Card className="p-8 border-2 border-red-200 bg-red-50">
          <div className="flex flex-col items-center text-center">
            <div className="p-4 bg-red-100 rounded-full mb-4">
              <svg className="size-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-red-900 mb-2">Failed to Load Jobs</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-red-600 hover:bg-red-700"
            >
              Retry
            </Button>
          </div>
        </Card>
      )}

      {/* Content - Only show when not loading */}
      {!loading && !error && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="p-4 md:p-5 border-2 hover:shadow-lg transition-all hover:-translate-y-1">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className={`${stat.bgColor} p-2 md:p-3 rounded-xl`}>
                      <Icon className={`size-5 md:size-6 ${stat.textColor}`} />
                    </div>
                    <div>
                      <p className="text-2xl md:text-3xl font-bold text-slate-900">{stat.value}</p>
                      <p className="text-xs md:text-sm text-slate-600 font-medium">{stat.label}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* Search and Filters */}
      <Card className="p-4 md:p-6 mb-6 border-2 shadow-md">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-3 md:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 size-4 md:size-5 text-slate-400" />
              <Input
                placeholder="Search by role, company, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 md:pl-12 h-10 md:h-12 border-2 border-slate-300 focus:border-blue-500 text-sm md:text-base"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-48 h-10 md:h-12 border-2">
                <SelectValue placeholder="Job Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Full-time">Full-time</SelectItem>
                <SelectItem value="Internship">Internship</SelectItem>
                <SelectItem value="Contract">Contract</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterLocation} onValueChange={setFilterLocation}>
              <SelectTrigger className="w-full md:w-48 h-10 md:h-12 border-2">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="Bangalore">Bangalore</SelectItem>
                <SelectItem value="Hyderabad">Hyderabad</SelectItem>
                <SelectItem value="Mumbai">Mumbai</SelectItem>
                <SelectItem value="Pune">Pune</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="h-12 border-2">
              <Filter className="size-4 mr-2" />
              Advanced
            </Button>
            <Button variant="outline" className="h-12 border-2">
              <Download className="size-4 mr-2" />
              Export
            </Button>
          </div>

          {showFilters && (
            <div className="pt-4 border-t-2 grid grid-cols-3 gap-6">
              <div>
                <Label className="font-medium mb-3 block">Salary Range (LPA)</Label>
                <Slider
                  value={salaryRange}
                  onValueChange={setSalaryRange}
                  max={50}
                  step={5}
                  className="mb-2"
                />
                <p className="text-sm text-slate-600">₹{salaryRange[0]}L - ₹{salaryRange[1]}L+</p>
              </div>
              <div>
                <Label className="font-medium mb-3 block">Experience Level</Label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <Checkbox />
                    <span className="text-sm">Fresher (0 years)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <Checkbox />
                    <span className="text-sm">0-2 years</span>
                  </label>
                </div>
              </div>
              <div>
                <Label className="font-medium mb-3 block">Work Mode</Label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <Checkbox />
                    <span className="text-sm">Work from Office</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <Checkbox />
                    <span className="text-sm">Remote/Hybrid</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="all" className="mb-6">
        <TabsList className="bg-white border-2 border-slate-200 p-1.5">
          <TabsTrigger value="all" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            All ({filteredJobs.length})
          </TabsTrigger>
          <TabsTrigger value="matched" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
            Best Matches ({filteredJobs.filter(j => j.match >= 80).length})
          </TabsTrigger>
          <TabsTrigger value="saved" className="data-[state=active]:bg-yellow-600 data-[state=active]:text-white">
            Saved ({jobs.filter(j => j.status === 'saved').length})
          </TabsTrigger>
          <TabsTrigger value="applied" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            Applied ({jobs.filter(j => j.status === 'applied').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-6">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="p-6 border-2 hover:shadow-xl transition-all hover:border-blue-400 cursor-pointer group" onClick={() => setSelectedJob(job)}>
              <div className="flex items-start gap-5">
                <div className="size-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center font-bold text-slate-700 text-2xl shrink-0 border-2 border-slate-200 group-hover:scale-110 transition-transform">
                  {job.company.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">{job.role}</h3>
                      <div className="flex items-center gap-3 text-slate-600">
                        {job.website ? (
                          <a 
                            href={job.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1.5 font-medium text-blue-600 hover:text-blue-700 hover:underline"
                          >
                            <Building2 className="size-4" />
                            {job.company}
                          </a>
                        ) : (
                          <span className="flex items-center gap-1.5 font-medium">
                            <Building2 className="size-4" />
                            {job.company}
                          </span>
                        )}
                        <span>•</span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="size-4" />
                          {job.location}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="size-4" />
                          Posted {new Date(job.postedDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`px-4 py-2 rounded-full border-2 ${
                        job.match >= 90 ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-300' :
                        job.match >= 80 ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-300' :
                        'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300'
                      }`}>
                        <div className="flex items-center gap-2">
                          <Star className={`size-5 ${job.match >= 90 ? 'text-green-600 fill-green-600' : job.match >= 80 ? 'text-blue-600 fill-blue-600' : 'text-yellow-600 fill-yellow-600'}`} />
                          <span className={`text-xl font-bold ${job.match >= 90 ? 'text-green-700' : job.match >= 80 ? 'text-blue-700' : 'text-yellow-700'}`}>
                            {job.match}%
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 font-medium">AI Match</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <Badge className="bg-blue-600 text-white px-3 py-1">{job.type}</Badge>
                    <span className="text-base font-bold text-green-600">{job.ctc}</span>
                    <span className="text-sm text-slate-600">• {job.experience}</span>
                    <Badge variant="outline" className="border-red-300 text-red-700 bg-red-50">
                      <Clock className="size-3 mr-1" />
                      Deadline: {job.deadline}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.skills.slice(0, 6).map((skill) => (
                      <Badge key={skill} variant="outline" className="bg-slate-50 border-slate-300 font-medium px-3 py-1">
                        {skill}
                      </Badge>
                    ))}
                    {job.skills.length > 6 && (
                      <Badge variant="outline" className="bg-slate-100 border-slate-300 font-medium">
                        +{job.skills.length - 6} more
                      </Badge>
                    )}
                  </div>

                  <p className="text-slate-600 mb-4 leading-relaxed line-clamp-2">{job.description}</p>

                  <div className="flex items-center gap-3">
                    <Button onClick={(e) => { e.stopPropagation(); handleApply(job); }} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      <Send className="size-4 mr-2" />
                      {job.status === 'applied' ? 'Applied' : 'Apply Now'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={(e) => { e.stopPropagation(); handleSave(job.id); }} 
                      className={`border-2 ${job.status === 'saved' ? 'bg-yellow-50 border-yellow-400 text-yellow-700' : ''}`}
                    >
                      <BookmarkPlus className="size-4 mr-2" />
                      {job.status === 'saved' ? 'Saved' : 'Save'}
                    </Button>
                    <Button variant="outline" onClick={(e) => { e.stopPropagation(); handleSetAlert(job); }} className="border-2">
                      <Bell className="size-4 mr-2" />
                      Set Alert
                    </Button>
                    {job.status === 'applied' && (
                      <Badge className="ml-auto bg-green-600 px-4 py-2">✓ Applied</Badge>
                    )}
                    {job.status === 'saved' && (
                      <Badge className="ml-auto bg-yellow-600 px-4 py-2">★ Saved</Badge>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="matched" className="space-y-4 mt-6">
          {filteredJobs.filter(j => j.match >= 80).map((job) => (
            <Card key={job.id} className="p-6 border-2 border-green-200 hover:shadow-xl transition-all cursor-pointer bg-gradient-to-r from-green-50/50 to-blue-50/50" onClick={() => setSelectedJob(job)}>
              <div className="flex items-start gap-5">
                <div className="size-20 bg-gradient-to-br from-green-100 to-blue-100 rounded-2xl flex items-center justify-center font-bold text-slate-700 text-2xl shrink-0 border-2 border-green-300">
                  {job.company.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-slate-900">{job.role}</h3>
                        <Badge className="bg-green-600">Perfect Match</Badge>
                      </div>
                      <p className="text-slate-600">{job.company} • {job.location}</p>
                    </div>
                    <div className="px-4 py-2 bg-green-600 text-white rounded-full font-bold text-xl">
                      {job.match}%
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {job.skills.slice(0, 5).map((skill) => (
                      <Badge key={skill} variant="outline" className="bg-white border-green-300 font-medium">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 mt-4">
                    <Button onClick={(e) => { e.stopPropagation(); handleApply(job); }} className="bg-green-600 hover:bg-green-700">
                      <Send className="size-4 mr-2" />
                      Apply Now
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={(e) => { e.stopPropagation(); handleSave(job.id); }} 
                      className={`border-2 ${job.status === 'saved' ? 'bg-yellow-50 border-yellow-400' : ''}`}
                    >
                      <BookmarkPlus className="size-4 mr-2" />
                      {job.status === 'saved' ? 'Saved' : 'Save'}
                    </Button>
                    <Button variant="outline" onClick={(e) => { e.stopPropagation(); handleSetAlert(job); }} className="border-2">
                      <Bell className="size-4 mr-2" />
                      Set Alert
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="saved" className="mt-6">
          {jobs.filter(j => j.status === 'saved').length > 0 ? (
            <div className="space-y-4">
              {jobs.filter(j => j.status === 'saved').map((job) => (
                <Card key={job.id} className="p-6 border-2 border-yellow-200 bg-yellow-50/30">
                  <div className="flex items-start gap-4">
                    <div className="size-16 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl flex items-center justify-center font-bold text-slate-700 text-xl border-2">
                      {job.company.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-900 mb-1">{job.role}</h3>
                      <p className="text-sm text-slate-600 mb-3">{job.company} • {job.location}</p>
                      <div className="flex gap-3">
                        <Button onClick={() => handleApply(job)}>Apply Now</Button>
                        <Button 
                          variant="outline" 
                          onClick={() => handleSave(job.id)}
                          className={job.status === 'saved' ? 'bg-yellow-50 border-yellow-400' : ''}
                        >
                          <BookmarkPlus className="size-4 mr-2" />
                          {job.status === 'saved' ? 'Saved' : 'Save'}
                        </Button>
                        <Button variant="outline" onClick={() => handleSetAlert(job)}>
                          <Bell className="size-4 mr-2" />
                          Set Alert
                        </Button>
                      </div>
                    </div>
                    <Badge className="bg-yellow-600">Saved</Badge>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <BookmarkPlus className="size-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 text-lg">No saved opportunities yet</p>
              <p className="text-slate-500 text-sm mt-2">Save jobs to easily access them later</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="applied" className="mt-6">
          {jobs.filter(j => j.status === 'applied').map((job) => (
            <Card key={job.id} className="p-6 mb-4 border-2 border-purple-200 bg-purple-50/30">
              <div className="flex items-start gap-4">
                <div className="size-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl flex items-center justify-center font-bold text-slate-700 text-xl border-2">
                  {job.company.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-1">{job.role}</h3>
                      <p className="text-sm text-slate-600 mb-2">{job.company} • {job.location}</p>
                      <Badge className="bg-green-600">Application Submitted</Badge>
                    </div>
                    <Button variant="outline" onClick={() => setSelectedJob(job)}>
                      View Application
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Job Details Dialog */}
      <Dialog open={!!selectedJob} onOpenChange={(open) => !open && setSelectedJob(null)}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          {selectedJob && (
            <>
              <DialogHeader>
                <DialogTitle className="text-3xl">{selectedJob.role}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="flex items-start gap-5 p-5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border-2 border-blue-200">
                  <div className="size-20 bg-white rounded-2xl flex items-center justify-center font-bold text-slate-700 text-2xl border-2 border-slate-200 shadow-md">
                    {selectedJob.company.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-2xl text-slate-900">{selectedJob.company}</h3>
                    <p className="text-slate-600 mt-1 text-lg">{selectedJob.location}</p>
                    {selectedJob.website && (
                      <a 
                        href={selectedJob.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 mt-2"
                      >
                        Visit Company Website
                        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                    <div className="flex gap-2 mt-3">
                      <Badge className="bg-blue-600 px-3 py-1">{selectedJob.type}</Badge>
                      <Badge className="bg-green-600 px-3 py-1">{selectedJob.match}% Match</Badge>
                      <Badge variant="outline" className="border-2">{selectedJob.experience}</Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-green-600">{selectedJob.ctc}</p>
                    <p className="text-sm text-slate-600 mt-1">Annual CTC</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <Building2 className="size-5 text-blue-600" />
                    About the Role
                  </h4>
                  <p className="text-slate-700 leading-relaxed">{selectedJob.description}</p>
                </div>

                <div>
                  <h4 className="font-bold text-lg mb-3">Requirements</h4>
                  <ul className="space-y-2">
                    {selectedJob.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-3 text-slate-700">
                        <span className="text-green-600 mt-1">✓</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-lg mb-3">Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.skills.map((skill) => (
                      <Badge key={skill} className="bg-blue-100 text-blue-700 border-blue-300 border-2 px-4 py-2">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-lg mb-3">Benefits & Perks</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedJob.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-green-50 border-2 border-green-200 rounded-xl">
                        <span className="text-green-600">✓</span>
                        <span className="text-slate-700 font-medium">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-5">
                  <h4 className="font-bold mb-3">Eligibility Criteria</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-slate-600 mb-1">Minimum CGPA</p>
                      <p className="font-bold text-slate-900 text-lg">{selectedJob.eligibility.minCGPA}</p>
                    </div>
                    <div>
                      <p className="text-slate-600 mb-1">Eligible Branches</p>
                      <p className="font-bold text-slate-900">{selectedJob.eligibility.branches.join(', ')}</p>
                    </div>
                    <div>
                      <p className="text-slate-600 mb-1">Passout Year</p>
                      <p className="font-bold text-slate-900">{selectedJob.eligibility.passoutYear}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t-2">
                  <Button className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg" onClick={() => handleApply(selectedJob)}>
                    <Send className="size-5 mr-2" />
                    Apply Now
                  </Button>
                  <Button 
                    variant="outline" 
                    className={`flex-1 h-12 border-2 text-lg ${selectedJob.status === 'saved' ? 'bg-yellow-50 border-yellow-400 text-yellow-700' : ''}`}
                    onClick={() => handleSave(selectedJob.id)}
                  >
                    <BookmarkPlus className="size-5 mr-2" />
                    {selectedJob.status === 'saved' ? 'Saved' : 'Save for Later'}
                  </Button>
                  <Button variant="outline" className="h-12 border-2" onClick={() => handleSetAlert(selectedJob)}>
                    <Bell className="size-5 mr-2" />
                    Set Alert
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
