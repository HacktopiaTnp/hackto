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

  useEffect(() => {
    const saved = localStorage.getItem('studentReadiness');
    if (saved) {
      setStudents(JSON.parse(saved));
    } else {
      const sampleStudents: StudentReadiness[] = [
        {
          id: '1',
          name: 'Rahul Verma',
          rollNumber: 'CS21001',
          branch: 'Computer Science',
          cgpa: 8.5,
          backlogs: 0,
          resumeScore: 85,
          technicalSkills: 90,
          aptitudeScore: 88,
          communicationScore: 82,
          mockInterviewsAttended: 5,
          averageMockScore: 86,
          placementReadiness: 'high',
          areasOfImprovement: ['System Design'],
          lastAssessment: '2026-01-28',
          companiesApplied: 12,
          interviewsScheduled: 3
        },
        {
          id: '2',
          name: 'Ananya Singh',
          rollNumber: 'CS21002',
          branch: 'Computer Science',
          cgpa: 9.2,
          backlogs: 0,
          resumeScore: 92,
          technicalSkills: 95,
          aptitudeScore: 94,
          communicationScore: 90,
          mockInterviewsAttended: 7,
          averageMockScore: 93,
          placementReadiness: 'high',
          areasOfImprovement: [],
          lastAssessment: '2026-01-30',
          companiesApplied: 15,
          interviewsScheduled: 5
        },
        {
          id: '3',
          name: 'Vikram Mehta',
          rollNumber: 'EC21015',
          branch: 'Electronics',
          cgpa: 7.2,
          backlogs: 1,
          resumeScore: 65,
          technicalSkills: 70,
          aptitudeScore: 68,
          communicationScore: 60,
          mockInterviewsAttended: 2,
          averageMockScore: 64,
          placementReadiness: 'medium',
          areasOfImprovement: ['Resume Quality', 'Communication', 'Technical Depth'],
          lastAssessment: '2026-01-25',
          companiesApplied: 5,
          interviewsScheduled: 1
        },
        {
          id: '4',
          name: 'Kavya Reddy',
          rollNumber: 'IT21023',
          branch: 'IT',
          cgpa: 6.8,
          backlogs: 2,
          resumeScore: 55,
          technicalSkills: 58,
          aptitudeScore: 60,
          communicationScore: 65,
          mockInterviewsAttended: 1,
          averageMockScore: 58,
          placementReadiness: 'low',
          areasOfImprovement: ['Clear Backlogs', 'Technical Skills', 'Resume', 'Aptitude'],
          lastAssessment: '2026-01-20',
          companiesApplied: 2,
          interviewsScheduled: 0
        }
      ];
      setStudents(sampleStudents);
      localStorage.setItem('studentReadiness', JSON.stringify(sampleStudents));
    }
  }, []);

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.branch.toLowerCase().includes(searchQuery.toLowerCase());
    
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
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700">High</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.highReadiness}</div>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700">Medium</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.mediumReadiness}</div>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Low</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.lowReadiness}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Resume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(stats.averageResumeScore)}`}>
              {stats.averageResumeScore}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Tech</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(stats.averageTechnicalScore)}`}>
              {stats.averageTechnicalScore}%
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Student Placement Readiness
          </CardTitle>
          <div className="flex items-center gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search students..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select aria-label="Filter by readiness level" className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm" value={filterReadiness} onChange={(e) => setFilterReadiness(e.target.value as any)}>
                <option value="all">All Levels</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredStudents.map((student) => (
              <Card key={student.id} className={`border-l-4 ${getReadinessColor(student.placementReadiness)}`}>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold">{student.name}</h3>
                          <Badge variant="outline">{student.rollNumber}</Badge>
                          <Badge variant="secondary">{student.branch}</Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>CGPA: <span className="font-semibold">{student.cgpa}</span></span>
                          <span>Backlogs: <span className={`font-semibold ${student.backlogs > 0 ? 'text-red-600' : 'text-green-600'}`}>{student.backlogs}</span></span>
                          <span>Last: {new Date(student.lastAssessment).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Badge className={getReadinessColor(student.placementReadiness)}>
                        {student.placementReadiness === 'high' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {student.placementReadiness !== 'high' && <AlertCircle className="h-3 w-3 mr-1" />}
                        {student.placementReadiness.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />Resume
                          </span>
                          <span className={`font-semibold ${getScoreColor(student.resumeScore)}`}>
                            {student.resumeScore}%
                          </span>
                        </div>
                        <Progress value={student.resumeScore} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-1">
                            <Code className="h-4 w-4" />Technical
                          </span>
                          <span className={`font-semibold ${getScoreColor(student.technicalSkills)}`}>
                            {student.technicalSkills}%
                          </span>
                        </div>
                        <Progress value={student.technicalSkills} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-1">
                            <Award className="h-4 w-4" />Aptitude
                          </span>
                          <span className={`font-semibold ${getScoreColor(student.aptitudeScore)}`}>
                            {student.aptitudeScore}%
                          </span>
                        </div>
                        <Progress value={student.aptitudeScore} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />Communication
                          </span>
                          <span className={`font-semibold ${getScoreColor(student.communicationScore)}`}>
                            {student.communicationScore}%
                          </span>
                        </div>
                        <Progress value={student.communicationScore} className="h-2" />
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm">
                      <div><span className="text-muted-foreground">Mock Interviews:</span> <span className="font-semibold">{student.mockInterviewsAttended}</span></div>
                      <div><span className="text-muted-foreground">Avg Score:</span> <span className={`font-semibold ${getScoreColor(student.averageMockScore)}`}>{student.averageMockScore}%</span></div>
                      <div><span className="text-muted-foreground">Applied:</span> <span className="font-semibold">{student.companiesApplied}</span></div>
                      <div><span className="text-muted-foreground">Scheduled:</span> <span className="font-semibold text-blue-600">{student.interviewsScheduled}</span></div>
                    </div>

                    {student.areasOfImprovement.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="h-4 w-4 text-orange-600" />
                          <span className="text-sm font-medium">Areas of Improvement:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {student.areasOfImprovement.map((area, idx) => (
                            <Badge key={idx} variant="outline" className="text-orange-600 border-orange-600">{area}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredStudents.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">No students found.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
