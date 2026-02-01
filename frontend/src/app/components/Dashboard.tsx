import { useState } from 'react';
import { Briefcase, Building2, Video, TrendingUp, Calendar, CheckCircle, AlertCircle, Star, Clock, ArrowRight, Zap, Search } from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { Input } from '@/app/components/ui/input';

interface DashboardProps {
  setView: (view: 'dashboard' | 'opportunities' | 'recruiters' | 'interview' | 'analytics') => void;
  userRole: 'student' | 'coordinator' | 'admin';
  userName: string;
  searchQuery?: string;
}

export default function Dashboard({ setView, userRole, userName, searchQuery: globalSearchQuery = '' }: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Use global search if provided, otherwise use local search
  const activeSearchQuery = globalSearchQuery || searchQuery;
  
  const studentStats = [
    { label: 'New Opportunities', value: '24', icon: Briefcase, color: 'from-blue-500 to-blue-600', change: '+12%', bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
    { label: 'Matched Jobs', value: '18', icon: CheckCircle, color: 'from-green-500 to-green-600', change: '+8%', bgColor: 'bg-green-50', textColor: 'text-green-600' },
    { label: 'Applications Sent', value: '12', icon: TrendingUp, color: 'from-purple-500 to-purple-600', change: '+5%', bgColor: 'bg-purple-50', textColor: 'text-purple-600' },
    { label: 'Mock Interviews', value: '6', icon: Video, color: 'from-orange-500 to-orange-600', change: '+2', bgColor: 'bg-orange-50', textColor: 'text-orange-600' },
  ];

  const coordinatorStats = [
    { label: 'Total Students', value: '450', icon: Briefcase, color: 'from-blue-500 to-blue-600', change: '+15', bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
    { label: 'Active Recruiters', value: '28', icon: Building2, color: 'from-green-500 to-green-600', change: '+4', bgColor: 'bg-green-50', textColor: 'text-green-600' },
    { label: 'Placement Offers', value: '156', icon: CheckCircle, color: 'from-purple-500 to-purple-600', change: '+23%', bgColor: 'bg-purple-50', textColor: 'text-purple-600' },
    { label: 'Upcoming Drives', value: '8', icon: Calendar, color: 'from-orange-500 to-orange-600', change: '+2', bgColor: 'bg-orange-50', textColor: 'text-orange-600' },
  ];

  const stats = userRole === 'student' ? studentStats : coordinatorStats;

  const recentOpportunities = [
    {
      id: 1,
      company: 'Google',
      role: 'Software Engineer Intern',
      location: 'Bangalore',
      ctc: '₹12-15 LPA',
      match: 95,
      deadline: '2026-02-15',
      type: 'Internship',
    },
    {
      id: 2,
      company: 'Microsoft',
      role: 'Full Stack Developer',
      location: 'Hyderabad',
      ctc: '₹18-22 LPA',
      match: 92,
      deadline: '2026-02-20',
      type: 'Full-time',
    },
    {
      id: 3,
      company: 'Amazon',
      role: 'Backend Engineer',
      location: 'Bangalore',
      ctc: '₹20-25 LPA',
      match: 88,
      deadline: '2026-02-18',
      type: 'Full-time',
    },
  ];

  const upcomingInterviews = [
    { company: 'Wipro', date: '2026-02-05', time: '10:00 AM', type: 'Technical Round' },
    { company: 'Infosys', date: '2026-02-08', time: '2:00 PM', type: 'HR Round' },
  ];

  const recentActivity = [
    { action: 'Applied to Software Engineer role at TCS', time: '2 hours ago', type: 'application' },
    { action: 'Completed mock interview for Technical role', time: '5 hours ago', type: 'interview' },
    { action: 'New matching opportunity from Cognizant', time: '1 day ago', type: 'match' },
    { action: 'Resume viewed by HCL Technologies', time: '2 days ago', type: 'view' },
  ];

  // Filter opportunities based on search
  const filteredOpportunities = recentOpportunities.filter(opp =>
    opp.company.toLowerCase().includes(activeSearchQuery.toLowerCase()) ||
    opp.role.toLowerCase().includes(activeSearchQuery.toLowerCase()) ||
    opp.location.toLowerCase().includes(activeSearchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl md:text-2xl">👋</span>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900">
            Welcome back, {userName.split(' ')[0]}!
          </h1>
        </div>
        <p className="text-base md:text-lg text-slate-600">
          {userRole === 'student' 
            ? "Here's your personalized placement dashboard with AI-powered recommendations."
            : "Here's an overview of the current placement season and student progress."}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6 mb-6 md:mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-6 border-2 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="flex items-start justify-between mb-4">
                <div className={`${stat.bgColor} p-3 rounded-xl`}>
                  <Icon className={`size-6 ${stat.textColor}`} />
                </div>
                <Badge className="bg-green-100 text-green-700 border-0">{stat.change}</Badge>
              </div>
              <p className="text-sm text-slate-600 mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
            </Card>
          );
        })}
      </div>

      {/* Search Bar */}
      <Card className="p-4 md:p-6 mb-6 border-2 shadow-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 md:size-5 text-slate-400" />
          <Input
            placeholder="Search opportunities by company, role, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 md:pl-10 h-10 md:h-11 text-sm md:text-base border-2 border-slate-300 focus:border-blue-500"
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Top Matched Opportunities */}
        <Card className="lg:col-span-2 p-4 md:p-6 border-2 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Briefcase className="size-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                {userRole === 'student' ? 'Top Matched Opportunities' : 'Recent Job Postings'}
              </h2>
            </div>
            <Button variant="outline" size="sm" onClick={() => setView('opportunities')} className="gap-1">
              View All
              <ArrowRight className="size-4" />
            </Button>
          </div>
          <div className="space-y-4">
            {filteredOpportunities.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-500">No opportunities found matching your search.</p>
              </div>
            ) : (
              filteredOpportunities.map((opp) => (
              <div key={opp.id} className="group p-5 border-2 border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer" onClick={() => setView('opportunities')}>
                <div className="flex items-start gap-4">
                  <div className="size-14 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center font-bold text-slate-700 text-xl border-2 border-slate-200">
                    {opp.company.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">{opp.role}</h3>
                        <p className="text-sm text-slate-600 mt-1">{opp.company} • {opp.location}</p>
                      </div>
                      {userRole === 'student' && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 rounded-full">
                          <Star className="size-4 text-green-600 fill-green-600" />
                          <span className="font-bold text-green-700">{opp.match}%</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-3">
                      <Badge variant="secondary" className="font-medium">{opp.type}</Badge>
                      <span className="text-sm font-bold text-green-600">{opp.ctc}</span>
                      <span className="text-sm text-slate-500">• Deadline: {opp.deadline}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
            )}
          </div>
        </Card>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Interviews */}
          <Card className="p-6 border-2 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="size-5 text-purple-600" />
              </div>
              <h3 className="font-bold text-slate-900">Upcoming Interviews</h3>
            </div>
            <div className="space-y-3">
              {upcomingInterviews.map((interview, index) => (
                <div key={index} className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border-2 border-purple-200">
                  <p className="font-bold text-slate-900 mb-1">{interview.company}</p>
                  <p className="text-xs text-purple-700 font-medium mb-2">{interview.type}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Calendar className="size-3" />
                    <span>{interview.date} at {interview.time}</span>
                  </div>
                </div>
              ))}
            </div>
            <Button className="w-full mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700" onClick={() => setView('interview')}>
              <Video className="size-4 mr-2" />
              Practice Mock Interview
            </Button>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6 border-2 shadow-lg bg-gradient-to-br from-slate-50 to-blue-50">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="size-5 text-orange-600" />
              <h3 className="font-bold text-slate-900">Quick Actions</h3>
            </div>
            <div className="space-y-2">
              <Button className="w-full justify-start bg-white hover:bg-blue-50 text-slate-900 border-2 border-slate-200 hover:border-blue-300" onClick={() => setView('opportunities')}>
                <Briefcase className="size-4 mr-2" />
                Browse Jobs
              </Button>
              <Button className="w-full justify-start bg-white hover:bg-purple-50 text-slate-900 border-2 border-slate-200 hover:border-purple-300" onClick={() => setView('interview')}>
                <Video className="size-4 mr-2" />
                Start Mock Interview
              </Button>
              {userRole === 'coordinator' && (
                <Button className="w-full justify-start bg-white hover:bg-green-50 text-slate-900 border-2 border-slate-200 hover:border-green-300" onClick={() => setView('recruiters')}>
                  <Building2 className="size-4 mr-2" />
                  Contact Recruiters
                </Button>
              )}
            </div>
          </Card>

          {/* Progress Card */}
          <Card className="p-6 border-2 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
            <h3 className="font-bold text-slate-900 mb-4">Placement Readiness</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-700 font-medium">Profile Completion</span>
                  <span className="text-sm font-bold text-green-600">85%</span>
                </div>
                <Progress value={85} className="h-2.5" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-700 font-medium">Skill Assessment</span>
                  <span className="text-sm font-bold text-green-600">78%</span>
                </div>
                <Progress value={78} className="h-2.5" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-700 font-medium">Interview Practice</span>
                  <span className="text-sm font-bold text-yellow-600">65%</span>
                </div>
                <Progress value={65} className="h-2.5" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}