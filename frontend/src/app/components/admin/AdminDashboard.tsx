import { useState, useEffect } from 'react';
import { Users, Briefcase, Building2, TrendingUp, Award, Calendar, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';

interface Company {
  _id: string;
  name: string;
  industry?: string;
  location?: string;
  website?: string;
}

export default function AdminDashboard() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoadingCompanies(true);
      const response = await fetch('http://localhost:5000/api/companies');
      const data = await response.json();
      
      if (data.success && Array.isArray(data.companies)) {
        setCompanies(data.companies.slice(0, 8)); // Show top 8 companies
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoadingCompanies(false);
    }
  };
  const stats = [
    { label: 'Total Students', value: '450', change: '+12', icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { label: 'Active Companies', value: loadingCompanies ? '...' : companies.length.toString(), change: '+4', icon: Building2, color: 'text-green-600', bgColor: 'bg-green-50' },
    { label: 'Placements (2026)', value: '156', change: '+23', icon: Award, color: 'text-purple-600', bgColor: 'bg-purple-50' },
    { label: 'Avg Package', value: '₹8.2L', change: '+15%', icon: TrendingUp, color: 'text-orange-600', bgColor: 'bg-orange-50' },
  ];

  const recentActivities = [
    { type: 'placement', student: 'Rahul Kumar', company: companies[0]?.name || 'Google', companyId: companies[0]?._id, package: '₹18 LPA', time: '2 hours ago' },
    { type: 'company', company: companies[1]?.name || 'Microsoft', companyId: companies[1]?._id, action: 'Posted new opening', role: 'SDE-1', time: '4 hours ago' },
    { type: 'document', student: 'Priya Sharma', action: 'Submitted documents', status: 'Verified', time: '5 hours ago' },
    { type: 'interview', student: 'Amit Patel', company: companies[2]?.name || 'Amazon', companyId: companies[2]?._id, round: 'Technical Round', time: '1 day ago' },
  ];

  const upcomingDrives = [
    { company: companies[5]?.name || 'TCS', companyId: companies[5]?._id, date: '2026-02-10', roles: 'Multiple', eligible: 145, registered: 89 },
    { company: companies[4]?.name || 'Infosys', companyId: companies[4]?._id, date: '2026-02-15', roles: 'SE, SSE', eligible: 120, registered: 67 },
    { company: companies[6]?.name || 'Wipro', companyId: companies[6]?._id, date: '2026-02-20', roles: 'Developer', eligible: 98, registered: 52 },
  ];

  const placementProgress = {
    target: 400,
    achieved: 156,
    percentage: 39
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <h1 className="text-lg md:text-xl font-semibold text-gray-900">Dashboard Overview</h1>
        <p className="text-xs md:text-sm text-gray-500 mt-1">Welcome back! Here's what's happening with placements.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-4 md:p-5 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-4 h-4 md:w-5 md:h-5 ${stat.color}`} />
                </div>
                <Badge variant="secondary" className="text-xs bg-green-50 text-green-700 border-0">
                  {stat.change}
                </Badge>
              </div>
              <div className="text-xl md:text-2xl font-semibold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </Card>
          );
        })}
      </div>

      {/* Placement Progress */}
      <Card className="p-4 md:p-6 border border-gray-200 mb-4 md:mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Placement Target Progress</h3>
            <p className="text-xs text-gray-500 mt-1">Academic Year 2025-2026</p>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-xl md:text-2xl font-semibold text-blue-600">{placementProgress.percentage}%</div>
            <div className="text-xs text-gray-500">{placementProgress.achieved} of {placementProgress.target}</div>
          </div>
        </div>
        <Progress value={placementProgress.percentage} className="h-2" />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Recent Activities */}
        <Card className="p-4 md:p-6 border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Recent Activities</h3>
          <div className="space-y-3 md:space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start gap-2 md:gap-3 pb-3 md:pb-4 border-b border-gray-100 last:border-0">
                <div className={`p-1.5 md:p-2 rounded-full flex-shrink-0 ${
                  activity.type === 'placement' ? 'bg-green-100' :
                  activity.type === 'company' ? 'bg-blue-100' :
                  activity.type === 'document' ? 'bg-orange-100' :
                  'bg-purple-100'
                }`}>
                  {activity.type === 'placement' && <Award className="w-3 h-3 md:w-4 md:h-4 text-green-600" />}
                  {activity.type === 'company' && <Building2 className="w-3 h-3 md:w-4 md:h-4 text-blue-600" />}
                  {activity.type === 'document' && <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-orange-600" />}
                  {activity.type === 'interview' && <Calendar className="w-3 h-3 md:w-4 md:h-4 text-purple-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs md:text-sm text-gray-900">
                    {activity.type === 'placement' && (
                      <>
                        <strong>{activity.student}</strong> placed at{' '}
                        {activity.companyId ? (
                          <a 
                            href={`#company-${activity.companyId}`} 
                            className="font-semibold text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1"
                            onClick={(e) => {
                              e.preventDefault();
                              // Navigate to Companies Directory with this company selected
                              console.log('Navigate to company:', activity.company);
                            }}
                          >
                            {activity.company}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <strong>{activity.company}</strong>
                        )}
                        {' '}- {activity.package}
                      </>
                    )}
                    {activity.type === 'company' && (
                      <>
                        {activity.companyId ? (
                          <a 
                            href={`#company-${activity.companyId}`} 
                            className="font-semibold text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1"
                            onClick={(e) => {
                              e.preventDefault();
                              console.log('Navigate to company:', activity.company);
                            }}
                          >
                            {activity.company}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <strong>{activity.company}</strong>
                        )}
                        {' '}{activity.action} - {activity.role}
                      </>
                    )}
                    {activity.type === 'document' && (
                      <><strong>{activity.student}</strong> {activity.action} - {activity.status}</>
                    )}
                    {activity.type === 'interview' && (
                      <>
                        <strong>{activity.student}</strong> -{' '}
                        {activity.companyId ? (
                          <a 
                            href={`#company-${activity.companyId}`} 
                            className="font-semibold text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1"
                            onClick={(e) => {
                              e.preventDefault();
                              console.log('Navigate to company:', activity.company);
                            }}
                          >
                            {activity.company}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <strong>{activity.company}</strong>
                        )}
                        {' '}{activity.round}
                      </>
                    )}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Upcoming Drives */}
        <Card className="p-4 md:p-6 border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Upcoming Campus Drives</h3>
          <div className="space-y-3 md:space-y-4">
            {upcomingDrives.map((drive, index) => (
              <div key={index} className="p-3 md:p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all">
                <div className="flex flex-col sm:flex-row items-start justify-between mb-3 gap-2">
                  <div className="flex-1">
                    {drive.companyId ? (
                      <a 
                        href={`#company-${drive.companyId}`} 
                        className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1"
                        onClick={(e) => {
                          e.preventDefault();
                          console.log('Navigate to company:', drive.company);
                        }}
                      >
                        {drive.company}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <h4 className="text-sm font-semibold text-gray-900">{drive.company}</h4>
                    )}
                    <p className="text-xs text-gray-500 mt-1">{drive.roles}</p>
                  </div>
                  <Badge variant="outline" className="text-xs flex-shrink-0">
                    {new Date(drive.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-xs text-gray-500">Eligible</div>
                    <div className="text-xs md:text-sm font-semibold text-gray-900">{drive.eligible} students</div>
                  </div>
                  <div className="bg-blue-50 p-2 rounded">
                    <div className="text-xs text-gray-500">Registered</div>
                    <div className="text-xs md:text-sm font-semibold text-blue-600">{drive.registered} students</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
