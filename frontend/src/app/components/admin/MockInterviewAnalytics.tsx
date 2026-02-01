import { useState, useEffect } from 'react';
import { Video, Calendar, User, MessageSquare, Search, Filter, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';

interface MockInterview {
  id: string;
  studentName: string;
  studentRoll: string;
  interviewDate: string;
  interviewType: 'technical' | 'hr' | 'case-study' | 'behavioral';
  interviewer: string;
  duration: number;
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
  problemSolvingScore: number;
  confidenceScore: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  recommendation: 'excellent' | 'good' | 'average' | 'needs-improvement';
  recordingAvailable: boolean;
}

export default function MockInterviewAnalytics() {
  const [interviews, setInterviews] = useState<MockInterview[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'technical' | 'hr' | 'case-study' | 'behavioral'>('all');
  const [filterRecommendation, setFilterRecommendation] = useState<'all' | 'excellent' | 'good' | 'average' | 'needs-improvement'>('all');

  useEffect(() => {
    const saved = localStorage.getItem('mockInterviews');
    if (saved) {
      setInterviews(JSON.parse(saved));
    } else {
      const sampleInterviews: MockInterview[] = [
        {
          id: '1',
          studentName: 'Rahul Verma',
          studentRoll: 'CS21001',
          interviewDate: '2026-01-28',
          interviewType: 'technical',
          interviewer: 'Dr. Amit Kumar',
          duration: 45,
          overallScore: 88,
          technicalScore: 90,
          communicationScore: 85,
          problemSolvingScore: 92,
          confidenceScore: 85,
          feedback: 'Excellent problem-solving approach. Strong DSA knowledge. Communication clear.',
          strengths: ['Problem Solving', 'DSA Knowledge', 'Code Quality'],
          improvements: ['System Design', 'Time Complexity Analysis'],
          recommendation: 'excellent',
          recordingAvailable: true
        },
        {
          id: '2',
          studentName: 'Ananya Singh',
          studentRoll: 'CS21002',
          interviewDate: '2026-01-30',
          interviewType: 'hr',
          interviewer: 'Ms. Priya Sharma',
          duration: 30,
          overallScore: 95,
          technicalScore: 0,
          communicationScore: 98,
          problemSolvingScore: 92,
          confidenceScore: 95,
          feedback: 'Outstanding communication. Very confident. Handled behavioral questions excellently.',
          strengths: ['Communication', 'Confidence', 'Professionalism', 'Body Language'],
          improvements: [],
          recommendation: 'excellent',
          recordingAvailable: true
        },
        {
          id: '3',
          studentName: 'Vikram Mehta',
          studentRoll: 'EC21015',
          interviewDate: '2026-01-25',
          interviewType: 'technical',
          interviewer: 'Prof. Rajesh Patel',
          duration: 40,
          overallScore: 65,
          technicalScore: 68,
          communicationScore: 60,
          problemSolvingScore: 65,
          confidenceScore: 68,
          feedback: 'Good basics but struggled with advanced concepts. Needs more practice.',
          strengths: ['Basic Programming', 'Enthusiasm'],
          improvements: ['Advanced Algorithms', 'Communication', 'Code Optimization'],
          recommendation: 'average',
          recordingAvailable: false
        },
        {
          id: '4',
          studentName: 'Kavya Reddy',
          studentRoll: 'IT21023',
          interviewDate: '2026-01-20',
          interviewType: 'behavioral',
          interviewer: 'Dr. Sneha Gupta',
          duration: 25,
          overallScore: 72,
          technicalScore: 0,
          communicationScore: 75,
          problemSolvingScore: 70,
          confidenceScore: 70,
          feedback: 'Good behavioral responses. Work on being more concise.',
          strengths: ['Situational Awareness', 'Team Spirit'],
          improvements: ['Conciseness', 'Confidence', 'Eye Contact'],
          recommendation: 'good',
          recordingAvailable: true
        },
        {
          id: '5',
          studentName: 'Arjun Kapoor',
          studentRoll: 'CS21045',
          interviewDate: '2026-01-27',
          interviewType: 'case-study',
          interviewer: 'Mr. Anil Sharma',
          duration: 50,
          overallScore: 80,
          technicalScore: 82,
          communicationScore: 78,
          problemSolvingScore: 85,
          confidenceScore: 75,
          feedback: 'Strong analytical skills in case study. Good problem breakdown. Presentation needs work.',
          strengths: ['Analytical Thinking', 'Structured Approach', 'Business Acumen'],
          improvements: ['Presentation Skills', 'Confidence'],
          recommendation: 'good',
          recordingAvailable: true
        }
      ];
      setInterviews(sampleInterviews);
      localStorage.setItem('mockInterviews', JSON.stringify(sampleInterviews));
    }
  }, []);

  const filteredInterviews = interviews.filter(interview => {
    const matchesSearch = 
      interview.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      interview.studentRoll.toLowerCase().includes(searchQuery.toLowerCase()) ||
      interview.interviewer.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === 'all' || interview.interviewType === filterType;
    const matchesRecommendation = filterRecommendation === 'all' || interview.recommendation === filterRecommendation;
    
    return matchesSearch && matchesType && matchesRecommendation;
  });

  const stats = {
    totalInterviews: interviews.length,
    averageScore: Math.round(interviews.reduce((acc, i) => acc + i.overallScore, 0) / interviews.length),
    excellentCount: interviews.filter(i => i.recommendation === 'excellent').length,
    needsImprovementCount: interviews.filter(i => i.recommendation === 'needs-improvement').length,
    avgTechnical: Math.round(interviews.filter(i => i.technicalScore > 0).reduce((acc, i) => acc + i.technicalScore, 0) / interviews.filter(i => i.technicalScore > 0).length),
    avgCommunication: Math.round(interviews.reduce((acc, i) => acc + i.communicationScore, 0) / interviews.length)
  };

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'excellent': return 'bg-green-100 text-green-700 border-green-300';
      case 'good': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'average': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'needs-improvement': return 'bg-red-100 text-red-700 border-red-300';
      default: return '';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'technical': return 'bg-purple-100 text-purple-700';
      case 'hr': return 'bg-pink-100 text-pink-700';
      case 'case-study': return 'bg-orange-100 text-orange-700';
      case 'behavioral': return 'bg-cyan-100 text-cyan-700';
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
            <div className="text-2xl font-bold">{stats.totalInterviews}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(stats.averageScore)}`}>
              {stats.averageScore}%
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Excellent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.excellentCount}</div>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Needs Work</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.needsImprovementCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Tech</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(stats.avgTechnical)}`}>
              {stats.avgTechnical}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Comm</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(stats.avgCommunication)}`}>
              {stats.avgCommunication}%
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Mock Interview Performance
          </CardTitle>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mt-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select aria-label="Filter by interview type" className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm" value={filterType} onChange={(e) => setFilterType(e.target.value as any)}>
                <option value="all">All Types</option>
                <option value="technical">Technical</option>
                <option value="hr">HR</option>
                <option value="case-study">Case Study</option>
                <option value="behavioral">Behavioral</option>
              </select>
              <select aria-label="Filter by recommendation" className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm" value={filterRecommendation} onChange={(e) => setFilterRecommendation(e.target.value as any)}>
                <option value="all">All Ratings</option>
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="average">Average</option>
                <option value="needs-improvement">Needs Improvement</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredInterviews.map((interview) => (
              <Card key={interview.id} className="border-l-4 border-l-purple-500">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold">{interview.studentName}</h3>
                          <Badge variant="outline">{interview.studentRoll}</Badge>
                          <Badge className={getTypeColor(interview.interviewType)}>
                            {interview.interviewType.toUpperCase()}
                          </Badge>
                          {interview.recordingAvailable && (
                            <Badge variant="outline" className="text-blue-600">
                              <Video className="h-3 w-3 mr-1" />Recording
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(interview.interviewDate).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {interview.interviewer}
                          </span>
                          <span>{interview.duration} mins</span>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div className={`text-3xl font-bold ${getScoreColor(interview.overallScore)}`}>
                          {interview.overallScore}%
                        </div>
                        <Badge className={getRecommendationColor(interview.recommendation)}>
                          {interview.recommendation === 'excellent' && <Star className="h-3 w-3 mr-1" />}
                          {interview.recommendation.toUpperCase().replace('-', ' ')}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {interview.technicalScore > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Technical</span>
                            <span className={`font-semibold ${getScoreColor(interview.technicalScore)}`}>
                              {interview.technicalScore}%
                            </span>
                          </div>
                          <Progress value={interview.technicalScore} className="h-2" />
                        </div>
                      )}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Communication</span>
                          <span className={`font-semibold ${getScoreColor(interview.communicationScore)}`}>
                            {interview.communicationScore}%
                          </span>
                        </div>
                        <Progress value={interview.communicationScore} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Problem Solving</span>
                          <span className={`font-semibold ${getScoreColor(interview.problemSolvingScore)}`}>
                            {interview.problemSolvingScore}%
                          </span>
                        </div>
                        <Progress value={interview.problemSolvingScore} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Confidence</span>
                          <span className={`font-semibold ${getScoreColor(interview.confidenceScore)}`}>
                            {interview.confidenceScore}%
                          </span>
                        </div>
                        <Progress value={interview.confidenceScore} className="h-2" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">Feedback:</span>
                      </div>
                      <p className="text-sm text-muted-foreground bg-blue-50 p-3 rounded border border-blue-200">
                        {interview.feedback}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium">Strengths:</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {interview.strengths.map((strength, idx) => (
                            <Badge key={idx} variant="outline" className="text-green-600 border-green-600">{strength}</Badge>
                          ))}
                        </div>
                      </div>
                      {interview.improvements.length > 0 && (
                        <div>
                          <span className="text-sm font-medium">Areas for Improvement:</span>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {interview.improvements.map((improvement, idx) => (
                              <Badge key={idx} variant="outline" className="text-orange-600 border-orange-600">{improvement}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredInterviews.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">No interviews found.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
