import { useState } from 'react';
import { Users, Briefcase, Building2, TrendingUp, Award, Target, Calendar, CheckCircle, Search, Zap, LayoutDashboard, Video } from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { Button } from '@/app/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Input } from '@/app/components/ui/input';
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
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface AnalyticsProps {
  userRole: 'student' | 'coordinator' | 'admin';
  searchQuery?: string;
  setView?: (view: 'dashboard' | 'opportunities' | 'recruiters' | 'interview' | 'analytics') => void;
}

export default function Analytics({ userRole, searchQuery: globalSearchQuery = '', setView }: AnalyticsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Use global search if provided, otherwise use local search
  const activeSearchQuery = globalSearchQuery || searchQuery;
  
  // Student Analytics Data
  const studentSkillData = [
    { skill: 'DSA', score: 85 },
    { skill: 'Web Dev', score: 78 },
    { skill: 'Database', score: 82 },
    { skill: 'System Design', score: 65 },
    { skill: 'Cloud', score: 70 },
  ];

  const studentInterviewProgress = [
    { month: 'Sep', sessions: 2, avgScore: 65 },
    { month: 'Oct', sessions: 3, avgScore: 70 },
    { month: 'Nov', sessions: 4, avgScore: 72 },
    { month: 'Dec', sessions: 3, avgScore: 75 },
    { month: 'Jan', sessions: 5, avgScore: 78 },
  ];

  const studentApplicationStatus = [
    { name: 'Applied', value: 12, color: '#3b82f6' },
    { name: 'In Progress', value: 8, color: '#f59e0b' },
    { name: 'Shortlisted', value: 5, color: '#10b981' },
    { name: 'Rejected', value: 4, color: '#ef4444' },
  ];

  // Coordinator Analytics Data
  const placementStats = [
    { month: 'Aug', placed: 15, interviewed: 45 },
    { month: 'Sep', placed: 25, interviewed: 68 },
    { month: 'Oct', placed: 42, interviewed: 95 },
    { month: 'Nov', placed: 58, interviewed: 120 },
    { month: 'Dec', placed: 78, interviewed: 145 },
    { month: 'Jan', placed: 105, interviewed: 180 },
  ];

  const companyWisePlacements = [
    { company: 'TCS', students: 45 },
    { company: 'Infosys', students: 38 },
    { company: 'Wipro', students: 32 },
    { company: 'Cognizant', students: 28 },
    { company: 'Accenture', students: 25 },
    { company: 'Others', students: 48 },
  ];

  const branchWisePlacements = [
    { name: 'CSE', value: 85, color: '#3b82f6' },
    { name: 'IT', value: 72, color: '#10b981' },
    { name: 'ECE', value: 45, color: '#f59e0b' },
    { name: 'EEE', value: 28, color: '#8b5cf6' },
    { name: 'MECH', value: 12, color: '#ef4444' },
  ];

  const packageDistribution = [
    { range: '0-5 LPA', count: 45 },
    { range: '5-10 LPA', count: 82 },
    { range: '10-15 LPA', count: 65 },
    { range: '15-20 LPA', count: 38 },
    { range: '20+ LPA', count: 26 },
  ];

  const coordinatorStats = [
    { label: 'Total Students', value: '450', icon: Users, color: 'bg-blue-500', change: '+12%' },
    { label: 'Placed Students', value: '256', icon: CheckCircle, color: 'bg-green-500', change: '+18%' },
    { label: 'Active Recruiters', value: '28', icon: Building2, color: 'bg-purple-500', change: '+4' },
    { label: 'Avg Package', value: '₹12.5L', icon: TrendingUp, color: 'bg-orange-500', change: '+8%' },
  ];

  const studentStats = [
    { label: 'Applications', value: '12', icon: Briefcase, color: 'bg-blue-500' },
    { label: 'Shortlisted', value: '5', icon: Target, color: 'bg-green-500' },
    { label: 'Mock Interviews', value: '17', icon: Award, color: 'bg-purple-500' },
    { label: 'Avg Score', value: '78%', icon: TrendingUp, color: 'bg-orange-500' },
  ];

  const topPerformers = [
    { name: 'Rahul Sharma', branch: 'CSE', cgpa: 9.2, offers: 3, package: '₹25 LPA' },
    { name: 'Priya Patel', branch: 'IT', cgpa: 9.0, offers: 3, package: '₹22 LPA' },
    { name: 'Amit Kumar', branch: 'CSE', cgpa: 8.8, offers: 2, package: '₹20 LPA' },
    { name: 'Sneha Reddy', branch: 'ECE', cgpa: 8.9, offers: 2, package: '₹18 LPA' },
    { name: 'Vikram Singh', branch: 'IT', cgpa: 8.7, offers: 2, package: '₹18 LPA' },
  ];

  const skillGapAnalysis = [
    { skill: 'Data Structures', proficient: 65, learning: 25, needs_work: 10 },
    { skill: 'Web Development', proficient: 58, learning: 30, needs_work: 12 },
    { skill: 'System Design', proficient: 35, learning: 40, needs_work: 25 },
    { skill: 'Cloud Computing', proficient: 42, learning: 38, needs_work: 20 },
    { skill: 'Database', proficient: 55, learning: 32, needs_work: 13 },
  ];

  const upcomingDrives = [
    { company: 'Google', date: '2026-02-15', roles: 'SDE Intern', registrations: 85, eligible: 120 },
    { company: 'Microsoft', date: '2026-02-20', roles: 'Full Stack Dev', registrations: 92, eligible: 110 },
    { company: 'Amazon', date: '2026-02-25', roles: 'Backend Engineer', registrations: 78, eligible: 95 },
    { company: 'Flipkart', date: '2026-03-01', roles: 'Product Manager', registrations: 45, eligible: 60 },
  ];

  // Filter top performers based on search
  const filteredPerformers = topPerformers.filter(performer =>
    performer.name.toLowerCase().includes(activeSearchQuery.toLowerCase()) ||
    performer.branch.toLowerCase().includes(activeSearchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
          {userRole === 'coordinator' ? 'Placement Analytics Dashboard' : 'Your Performance Analytics'}
        </h1>
        <p className="text-slate-600 mt-2">
          {userRole === 'coordinator' 
            ? 'Comprehensive insights into placement statistics and student performance'
            : 'Track your progress, skills, and interview performance'}
        </p>
      </div>

      {userRole === 'coordinator' ? (
        <>
          {/* Coordinator Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
            {coordinatorStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`${stat.color} p-3 rounded-lg`}>
                      <Icon className="size-6 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                      <p className="text-sm text-slate-600">{stat.label}</p>
                      <p className="text-sm text-green-600 mt-1">{stat.change}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Quick Actions for Coordinator */}
          {setView && (
            <Card className="p-4 md:p-6 mb-6 md:mb-8 bg-gradient-to-br from-blue-50 to-purple-50 border-2">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Zap className="size-5 text-orange-600" />
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                <Button onClick={() => setView('dashboard')} variant="outline" className="w-full">
                  <LayoutDashboard className="size-4 mr-2" />
                  Dashboard
                </Button>
                <Button onClick={() => setView('opportunities')} variant="outline" className="w-full">
                  <Briefcase className="size-4 mr-2" />
                  Opportunities
                </Button>
                <Button onClick={() => setView('recruiters')} variant="outline" className="w-full">
                  <Building2 className="size-4 mr-2" />
                  Recruiters
                </Button>
                <Button onClick={() => setView('interview')} variant="outline" className="w-full">
                  <Video className="size-4 mr-2" />
                  Interviews
                </Button>
              </div>
            </Card>
          )}

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="students">Student Performance</TabsTrigger>
              <TabsTrigger value="companies">Company Insights</TabsTrigger>
              <TabsTrigger value="skills">Skill Gap Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Placement Trend */}
                <Card className="p-6">
                  <h3 className="font-bold text-slate-900 mb-4">Placement Trend</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={placementStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="placed" stroke="#10b981" strokeWidth={2} name="Students Placed" />
                      <Line type="monotone" dataKey="interviewed" stroke="#3b82f6" strokeWidth={2} name="Students Interviewed" />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>

                {/* Branch-wise Distribution */}
                <Card className="p-6">
                  <h3 className="font-bold text-slate-900 mb-4">Branch-wise Placements</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={branchWisePlacements}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {branchWisePlacements.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>

                {/* Package Distribution */}
                <Card className="p-6">
                  <h3 className="font-bold text-slate-900 mb-4">Package Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={packageDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8b5cf6" name="Students" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>

                {/* Company-wise Placements */}
                <Card className="p-6">
                  <h3 className="font-bold text-slate-900 mb-4">Top Recruiting Companies</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={companyWisePlacements} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="company" type="category" />
                      <Tooltip />
                      <Bar dataKey="students" fill="#3b82f6" name="Students Placed" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </div>

              {/* Upcoming Drives */}
              <Card className="p-6">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Calendar className="size-5 text-blue-600" />
                  Upcoming Campus Drives
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Company</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Date</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Roles</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">Registrations</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">Eligible</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">Fill Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {upcomingDrives.map((drive, index) => (
                        <tr key={index} className="border-b hover:bg-slate-50">
                          <td className="py-3 px-4 font-medium text-slate-900">{drive.company}</td>
                          <td className="py-3 px-4 text-slate-600">{drive.date}</td>
                          <td className="py-3 px-4 text-slate-600">{drive.roles}</td>
                          <td className="py-3 px-4 text-center font-semibold text-blue-600">{drive.registrations}</td>
                          <td className="py-3 px-4 text-center text-slate-600">{drive.eligible}</td>
                          <td className="py-3 px-4 text-center">
                            <Badge variant="outline" className={
                              (drive.registrations / drive.eligible) > 0.8 ? 'bg-green-50 text-green-700' :
                              (drive.registrations / drive.eligible) > 0.5 ? 'bg-yellow-50 text-yellow-700' :
                              'bg-red-50 text-red-700'
                            }>
                              {Math.round((drive.registrations / drive.eligible) * 100)}%
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="students" className="space-y-6">
              {/* Search Bar for Top Performers */}
              <Card className="p-4 md:p-6 border-2 shadow-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 md:size-5 text-slate-400" />
                  <Input
                    placeholder="Search students by name or branch..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 md:pl-10 h-10 md:h-11 text-sm md:text-base border-2 border-slate-300 focus:border-blue-500"
                  />
                </div>
              </Card>

              {/* Top Performers */}
              <Card className="p-4 md:p-6">
                <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Award className="size-4 md:size-5 text-yellow-600" />
                  Top Performing Students
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2 md:px-4 text-xs md:text-sm font-semibold text-slate-700">Rank</th>
                        <th className="text-left py-3 px-2 md:px-4 text-xs md:text-sm font-semibold text-slate-700">Name</th>
                        <th className="text-left py-3 px-2 md:px-4 text-xs md:text-sm font-semibold text-slate-700">Branch</th>
                        <th className="text-center py-3 px-2 md:px-4 text-xs md:text-sm font-semibold text-slate-700">CGPA</th>
                        <th className="text-center py-3 px-2 md:px-4 text-xs md:text-sm font-semibold text-slate-700">Offers</th>
                        <th className="text-left py-3 px-2 md:px-4 text-xs md:text-sm font-semibold text-slate-700">Best Package</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPerformers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-slate-500">
                            No students found matching your search.
                          </td>
                        </tr>
                      ) : (
                        filteredPerformers.map((student, index) => (
                          <tr key={index} className="border-b hover:bg-slate-50">
                            <td className="py-3 px-2 md:px-4">
                              <div className={`size-6 md:size-8 rounded-full flex items-center justify-center text-xs md:text-sm font-bold ${
                                index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                index === 1 ? 'bg-slate-200 text-slate-700' :
                                index === 2 ? 'bg-orange-100 text-orange-700' :
                                'bg-slate-100 text-slate-600'
                              }`}>
                                {index + 1}
                              </div>
                            </td>
                            <td className="py-3 px-2 md:px-4 text-xs md:text-sm font-medium text-slate-900">{student.name}</td>
                            <td className="py-3 px-2 md:px-4">
                              <Badge variant="secondary" className="text-xs md:text-sm">{student.branch}</Badge>
                            </td>
                            <td className="py-3 px-2 md:px-4 text-center text-xs md:text-sm font-semibold text-slate-900">{student.cgpa}</td>
                            <td className="py-3 px-2 md:px-4 text-center">
                              <Badge className="bg-green-600 text-xs md:text-sm">{student.offers} offers</Badge>
                            </td>
                            <td className="py-3 px-2 md:px-4 text-xs md:text-sm font-semibold text-green-600">{student.package}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Student Readiness */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-6">
                  <h4 className="font-semibold text-slate-900 mb-2">Interview Ready</h4>
                  <p className="text-4xl font-bold text-green-600 mb-2">285</p>
                  <p className="text-sm text-slate-600">63% of total students</p>
                  <Progress value={63} className="mt-3" />
                </Card>
                <Card className="p-6">
                  <h4 className="font-semibold text-slate-900 mb-2">In Preparation</h4>
                  <p className="text-4xl font-bold text-yellow-600 mb-2">120</p>
                  <p className="text-sm text-slate-600">27% of total students</p>
                  <Progress value={27} className="mt-3" />
                </Card>
                <Card className="p-6">
                  <h4 className="font-semibold text-slate-900 mb-2">Need Support</h4>
                  <p className="text-4xl font-bold text-red-600 mb-2">45</p>
                  <p className="text-sm text-slate-600">10% of total students</p>
                  <Progress value={10} className="mt-3" />
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="companies" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="font-bold text-slate-900 mb-4">Company-wise Placement Stats</h3>
                  <div className="space-y-4">
                    {companyWisePlacements.map((company, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-slate-900">{company.company}</span>
                          <span className="font-bold text-blue-600">{company.students} students</span>
                        </div>
                        <Progress value={(company.students / 216) * 100} className="h-2" />
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="font-bold text-slate-900 mb-4">Recruiter Engagement Metrics</h3>
                  <div className="space-y-4">
                    {[
                      { metric: 'Total Recruiters Contacted', value: '45', color: 'bg-blue-500' },
                      { metric: 'Active Partnerships', value: '28', color: 'bg-green-500' },
                      { metric: 'Campus Drives Conducted', value: '12', color: 'bg-purple-500' },
                      { metric: 'Average Response Time', value: '2.5 days', color: 'bg-orange-500' },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className={`${item.color} size-3 rounded-full`} />
                        <span className="flex-1 text-sm text-slate-600">{item.metric}</span>
                        <span className="font-bold text-slate-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="skills" className="space-y-6">
              <Card className="p-6">
                <h3 className="font-bold text-slate-900 mb-4">Student Skill Gap Analysis</h3>
                <p className="text-sm text-slate-600 mb-6">
                  Based on mock interview performance and self-assessments
                </p>
                <div className="space-y-6">
                  {skillGapAnalysis.map((skill, index) => (
                    <div key={index}>
                      <h4 className="font-semibold text-slate-900 mb-3">{skill.skill}</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-slate-600">Proficient</span>
                            <span className="text-sm font-bold text-green-600">{skill.proficient}%</span>
                          </div>
                          <Progress value={skill.proficient} className="h-2 bg-green-100" />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-slate-600">Learning</span>
                            <span className="text-sm font-bold text-yellow-600">{skill.learning}%</span>
                          </div>
                          <Progress value={skill.learning} className="h-2 bg-yellow-100" />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-slate-600">Needs Work</span>
                            <span className="text-sm font-bold text-red-600">{skill.needs_work}%</span>
                          </div>
                          <Progress value={skill.needs_work} className="h-2 bg-red-100" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-bold text-slate-900 mb-4">Recommended Actions</h3>
                <div className="space-y-3">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="font-semibold text-red-900 mb-1">⚠️ Critical: System Design Skills</p>
                    <p className="text-sm text-red-800">Only 35% students are proficient. Recommend organizing workshops.</p>
                  </div>
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="font-semibold text-yellow-900 mb-1">⚡ Focus Area: Cloud Computing</p>
                    <p className="text-sm text-yellow-800">42% proficiency. Consider AWS/Azure certification programs.</p>
                  </div>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="font-semibold text-green-900 mb-1">✓ Strong: Data Structures</p>
                    <p className="text-sm text-green-800">65% proficiency. Maintain momentum with regular contests.</p>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <>
          {/* Student Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {studentStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`${stat.color} p-3 rounded-lg`}>
                      <Icon className="size-6 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                      <p className="text-sm text-slate-600">{stat.label}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Quick Actions for Student */}
          {setView && (
            <Card className="p-4 md:p-6 mb-6 md:mb-8 bg-gradient-to-br from-blue-50 to-purple-50 border-2">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Zap className="size-5 text-orange-600" />
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                <Button onClick={() => setView('dashboard')} variant="outline" className="w-full">
                  <LayoutDashboard className="size-4 mr-2" />
                  Dashboard
                </Button>
                <Button onClick={() => setView('opportunities')} variant="outline" className="w-full">
                  <Briefcase className="size-4 mr-2" />
                  Find Jobs
                </Button>
                <Button onClick={() => setView('interview')} variant="outline" className="w-full">
                  <Video className="size-4 mr-2" />
                  Practice
                </Button>
                <Button onClick={() => setView('dashboard')} variant="outline" className="w-full">
                  <Target className="size-4 mr-2" />
                  Goals
                </Button>
              </div>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Skill Assessment */}
            <Card className="p-6">
              <h3 className="font-bold text-slate-900 mb-4">Your Skill Assessment</h3>
              <div className="space-y-4">
                {studentSkillData.map((skill, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">{skill.skill}</span>
                      <span className="text-sm font-bold text-slate-900">{skill.score}%</span>
                    </div>
                    <Progress value={skill.score} className="h-2" />
                  </div>
                ))}
              </div>
            </Card>

            {/* Application Status */}
            <Card className="p-6">
              <h3 className="font-bold text-slate-900 mb-4">Application Status</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={studentApplicationStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {studentApplicationStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            {/* Interview Progress */}
            <Card className="p-6 lg:col-span-2">
              <h3 className="font-bold text-slate-900 mb-4">Mock Interview Progress</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={studentInterviewProgress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="sessions" stroke="#3b82f6" strokeWidth={2} name="Interview Sessions" />
                  <Line yAxisId="right" type="monotone" dataKey="avgScore" stroke="#10b981" strokeWidth={2} name="Average Score (%)" />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Recommendations */}
          <Card className="p-6 mt-6">
            <h3 className="font-bold text-slate-900 mb-4">Personalized Recommendations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="font-semibold text-blue-900 mb-2">🎯 Focus on System Design</p>
                <p className="text-sm text-blue-800">Your System Design score is 65%. Practice more to improve your chances with top companies.</p>
              </div>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="font-semibold text-green-900 mb-2">✨ Great Progress!</p>
                <p className="text-sm text-green-800">Your interview scores have improved by 20% over the last 3 months. Keep it up!</p>
              </div>
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="font-semibold text-purple-900 mb-2">📚 Recommended Courses</p>
                <p className="text-sm text-purple-800">Cloud Computing certification could boost your profile for 8 matching opportunities.</p>
              </div>
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="font-semibold text-orange-900 mb-2">🎤 Practice More Interviews</p>
                <p className="text-sm text-orange-800">Students who complete 20+ mock interviews have 40% higher placement rates.</p>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
