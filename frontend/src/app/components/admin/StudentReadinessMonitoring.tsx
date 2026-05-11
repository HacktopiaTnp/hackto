import { useState, useEffect } from 'react';
import { ClipboardList, Search, AlertCircle, CheckCircle, FileText, Code, Users, Award, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';

interface StudentReadiness {
  id: string;
  name: string;
  rollNumber: string;
  branch: string;
  cgpa: number;
  backlogs: number;
  resumeScore: number;
  technicalSkills: number;
  aptitudeScore: number;
  communicationScore: number;
  mockInterviewsAttended: number;
  averageMockScore: number;
  placementReadiness: 'high' | 'medium' | 'low';
  areasOfImprovement: string[];
  lastAssessment: string;
  companiesApplied: number;
  interviewsScheduled: number;
}

export default function StudentReadinessMonitoring() {
  const [students, setStudents] = useState<StudentReadiness[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterReadiness, setFilterReadiness] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [loading, setLoading] = useState(true);
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterReadiness !== 'all') {
        params.append('readiness', filterReadiness);
      }

      const response = await fetch(`${apiBaseUrl}/api/v1/student-readiness?${params}`);
      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        setStudents(data.data);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterReadiness === 'all' || student.placementReadiness === filterReadiness;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    totalStudents: students.length,
    highReadiness: students.filter(s => s.placementReadiness === 'high').length,
    mediumReadiness: students.filter(s => s.placementReadiness === 'medium').length,
    lowReadiness: students.filter(s => s.placementReadiness === 'low').length,
    averageResumeScore: Math.round(students.reduce((acc, s) => acc + s.resumeScore, 0) / students.length),
    averageTechnicalScore: Math.round(students.reduce((acc, s) => acc + s.technicalSkills, 0) / students.length)
  };

  const getReadinessColor = (readiness: string) => {
    switch (readiness) {
      case 'high': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-red-600 bg-red-50 border-red-200';
      default: return '';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="p-2 sm:p-3 md:p-4 lg:p-6 space-y-3 sm:space-y-4 md:space-y-6 max-w-7xl mx-auto">
      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-xl md:text-2xl font-bold">{stats.totalStudents}</div>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] sm:text-xs md:text-sm font-medium text-green-700">High</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">{stats.highReadiness}</div>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] sm:text-xs md:text-sm font-medium text-yellow-700">Medium</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-yellow-600">{stats.mediumReadiness}</div>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] sm:text-xs md:text-sm font-medium text-red-700">Low</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-red-600">{stats.lowReadiness}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground">Avg Resume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-lg sm:text-xl md:text-2xl font-bold ${getScoreColor(stats.averageResumeScore)}`}>
              {stats.averageResumeScore}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground">Avg Tech</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-lg sm:text-xl md:text-2xl font-bold ${getScoreColor(stats.averageTechnicalScore)}`}>
              {stats.averageTechnicalScore}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader className="p-3 sm:p-4 md:p-6">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base md:text-lg font-semibold">
            <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5" />
            Student Placement Readiness
          </CardTitle>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 md:gap-4 mt-3 sm:mt-4">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground shrink-0" />
              <Input 
                placeholder="Search students..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="pl-8 sm:pl-9 h-8 sm:h-9 md:h-10 text-xs sm:text-sm"
              />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Filter className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
              <select 
                aria-label="Filter by readiness level" 
                className="flex h-8 sm:h-9 md:h-10 rounded-md border border-input bg-transparent px-2 sm:px-3 py-1 text-[10px] sm:text-xs md:text-sm" 
                value={filterReadiness} 
                onChange={(e) => setFilterReadiness(e.target.value as any)}
              >
                <option value="all">All Levels</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 md:p-6">
          <div className="space-y-3 sm:space-y-4">
            {filteredStudents.map((student) => (
              <Card key={student.id} className={`border-l-4 ${getReadinessColor(student.placementReadiness)}`}>
                <CardContent className="pt-3 sm:pt-4 md:pt-6 p-3 sm:p-4 md:p-6">
                  <div className="space-y-3 sm:space-y-4">
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-2">
                          <h3 className="text-xs sm:text-sm md:text-base font-semibold truncate">{student.name}</h3>
                          <Badge variant="outline" className="text-[8px] sm:text-xs md:text-sm py-0 px-1.5">{student.rollNumber}</Badge>
                          <Badge variant="secondary" className="text-[8px] sm:text-xs md:text-sm py-0 px-1.5">{student.branch}</Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 text-[10px] sm:text-xs md:text-sm text-muted-foreground">
                          <span>CGPA: <span className="font-semibold">{student.cgpa}</span></span>
                          <span>Backlogs: <span className={`font-semibold ${student.backlogs > 0 ? 'text-red-600' : 'text-green-600'}`}>{student.backlogs}</span></span>
                          <span>Last: {new Date(student.lastAssessment).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Badge className={`${getReadinessColor(student.placementReadiness)} shrink-0 text-[8px] sm:text-xs md:text-sm py-1 px-2`}>
                        {student.placementReadiness === 'high' && <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />}
                        {student.placementReadiness !== 'high' && <AlertCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />}
                        {student.placementReadiness.toUpperCase()}
                      </Badge>
                    </div>

                    {/* Scores Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                      <div className="space-y-1.5 sm:space-y-2">
                        <div className="flex items-center justify-between text-[10px] sm:text-xs md:text-sm">
                          <span className="flex items-center gap-0.5 sm:gap-1 truncate">
                            <FileText className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />Resume
                          </span>
                          <span className={`font-semibold ml-1 ${getScoreColor(student.resumeScore)}`}>
                            {student.resumeScore}%
                          </span>
                        </div>
                        <Progress value={student.resumeScore} className="h-1.5 sm:h-2" />
                      </div>
                      <div className="space-y-1.5 sm:space-y-2">
                        <div className="flex items-center justify-between text-[10px] sm:text-xs md:text-sm">
                          <span className="flex items-center gap-0.5 sm:gap-1 truncate">
                            <Code className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />Technical
                          </span>
                          <span className={`font-semibold ml-1 ${getScoreColor(student.technicalSkills)}`}>
                            {student.technicalSkills}%
                          </span>
                        </div>
                        <Progress value={student.technicalSkills} className="h-1.5 sm:h-2" />
                      </div>
                      <div className="space-y-1.5 sm:space-y-2">
                        <div className="flex items-center justify-between text-[10px] sm:text-xs md:text-sm">
                          <span className="flex items-center gap-0.5 sm:gap-1 truncate">
                            <Award className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />Aptitude
                          </span>
                          <span className={`font-semibold ml-1 ${getScoreColor(student.aptitudeScore)}`}>
                            {student.aptitudeScore}%
                          </span>
                        </div>
                        <Progress value={student.aptitudeScore} className="h-1.5 sm:h-2" />
                      </div>
                      <div className="space-y-1.5 sm:space-y-2">
                        <div className="flex items-center justify-between text-[10px] sm:text-xs md:text-sm">
                          <span className="flex items-center gap-0.5 sm:gap-1 truncate">
                            <Users className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />Communication
                          </span>
                          <span className={`font-semibold ml-1 ${getScoreColor(student.communicationScore)}`}>
                            {student.communicationScore}%
                          </span>
                        </div>
                        <Progress value={student.communicationScore} className="h-1.5 sm:h-2" />
                      </div>
                    </div>

                    {/* Stats Row */}
                    <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-6 text-[10px] sm:text-xs md:text-sm">
                      <div><span className="text-muted-foreground">Mock:</span> <span className="font-semibold">{student.mockInterviewsAttended}</span></div>
                      <div><span className="text-muted-foreground">Avg:</span> <span className={`font-semibold ${getScoreColor(student.averageMockScore)}`}>{student.averageMockScore}%</span></div>
                      <div><span className="text-muted-foreground">Applied:</span> <span className="font-semibold">{student.companiesApplied}</span></div>
                      <div><span className="text-muted-foreground">Scheduled:</span> <span className="font-semibold text-blue-600">{student.interviewsScheduled}</span></div>
                    </div>

                    {/* Areas of Improvement */}
                    {student.areasOfImprovement.length > 0 && (
                      <div>
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-2">
                          <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600 shrink-0" />
                          <span className="text-[10px] sm:text-xs md:text-sm font-medium">Areas of Improvement:</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          {student.areasOfImprovement.map((area, idx) => (
                            <Badge key={idx} variant="outline" className="text-orange-600 border-orange-600 text-[8px] sm:text-xs md:text-sm py-0.5 px-2">{area}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredStudents.length === 0 && (
              <div className="text-center py-8 sm:py-12 text-[10px] sm:text-xs md:text-sm text-muted-foreground">No students found.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
