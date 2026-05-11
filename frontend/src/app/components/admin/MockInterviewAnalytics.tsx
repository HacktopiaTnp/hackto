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
  const [loading, setLoading] = useState(true);
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchInterviews();
  }, [filterType, filterRecommendation]);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterType !== 'all') params.append('type', filterType);
      if (filterRecommendation !== 'all') params.append('recommendation', filterRecommendation);

      const response = await fetch(`${apiBaseUrl}/api/v1/mock-interview?${params}`);
      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        setInterviews(data.data);
      }
    } catch (error) {
      console.error('Error fetching interviews:', error);
    } finally {
      setLoading(false);
    }
  };

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
    averageScore: interviews.length ? Math.round(interviews.reduce((acc, i) => acc + i.overallScore, 0) / interviews.length) : 0,
    excellentCount: interviews.filter(i => i.recommendation === 'excellent').length,
    needsImprovementCount: interviews.filter(i => i.recommendation === 'needs-improvement').length,
    avgTechnical: interviews.filter(i => i.technicalScore > 0).length ? Math.round(interviews.filter(i => i.technicalScore > 0).reduce((acc, i) => acc + i.technicalScore, 0) / interviews.filter(i => i.technicalScore > 0).length) : 0,
    avgCommunication: interviews.length ? Math.round(interviews.reduce((acc, i) => acc + i.communicationScore, 0) / interviews.length) : 0
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
    <div className="p-2 sm:p-3 md:p-4 lg:p-6 space-y-3 sm:space-y-4 md:space-y-6 max-w-7xl mx-auto">
      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-xl md:text-2xl font-bold">{stats.totalInterviews}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground">Avg Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-lg sm:text-xl md:text-2xl font-bold ${getScoreColor(stats.averageScore)}`}>
              {stats.averageScore}%
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] sm:text-xs md:text-sm font-medium text-green-700">Excellent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">{stats.excellentCount}</div>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] sm:text-xs md:text-sm font-medium text-red-700">Needs Work</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-red-600">{stats.needsImprovementCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground">Avg Tech</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-lg sm:text-xl md:text-2xl font-bold ${getScoreColor(stats.avgTechnical)}`}>
              {stats.avgTechnical}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground">Avg Comm</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-lg sm:text-xl md:text-2xl font-bold ${getScoreColor(stats.avgCommunication)}`}>
              {stats.avgCommunication}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader className="p-3 sm:p-4 md:p-6">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base md:text-lg font-semibold">
            <Video className="w-4 h-4 sm:w-5 sm:h-5" />
            Mock Interview Performance
          </CardTitle>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 md:gap-4 mt-3 sm:mt-4">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground shrink-0" />
              <Input 
                placeholder="Search..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="pl-8 sm:pl-9 h-8 sm:h-9 md:h-10 text-xs sm:text-sm"
              />
            </div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 shrink-0">
              <Filter className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
              <select 
                aria-label="Filter by interview type" 
                className="flex h-8 sm:h-9 md:h-10 rounded-md border border-input bg-transparent px-2 sm:px-3 py-1 text-[10px] sm:text-xs md:text-sm" 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value as any)}
              >
                <option value="all">All Types</option>
                <option value="technical">Technical</option>
                <option value="hr">HR</option>
                <option value="case-study">Case Study</option>
                <option value="behavioral">Behavioral</option>
              </select>
              <select 
                aria-label="Filter by recommendation" 
                className="flex h-8 sm:h-9 md:h-10 rounded-md border border-input bg-transparent px-2 sm:px-3 py-1 text-[10px] sm:text-xs md:text-sm" 
                value={filterRecommendation} 
                onChange={(e) => setFilterRecommendation(e.target.value as any)}
              >
                <option value="all">All Ratings</option>
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="average">Average</option>
                <option value="needs-improvement">Needs Improvement</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 md:p-6">
          <div className="space-y-3 sm:space-y-4">
            {filteredInterviews.map((interview) => (
              <Card key={interview.id} className="border-l-4 border-l-purple-500">
                <CardContent className="pt-3 sm:pt-4 md:pt-6 p-3 sm:p-4 md:p-6">
                  <div className="space-y-3 sm:space-y-4">
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-2">
                          <h3 className="text-xs sm:text-sm md:text-base font-semibold truncate">{interview.studentName}</h3>
                          <Badge variant="outline" className="text-[8px] sm:text-xs md:text-sm py-0 px-1.5">{interview.studentRoll}</Badge>
                          <Badge className={`${getTypeColor(interview.interviewType)} text-[8px] sm:text-xs md:text-sm py-0 px-1.5`}>
                            {interview.interviewType.toUpperCase()}
                          </Badge>
                          {interview.recordingAvailable && (
                            <Badge variant="outline" className="text-blue-600 text-[8px] sm:text-xs md:text-sm py-0 px-1.5">
                              <Video className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5" />Rec
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 md:gap-4 text-[10px] sm:text-xs md:text-sm text-muted-foreground">
                          <span className="flex items-center gap-0.5 sm:gap-1 whitespace-nowrap">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                            {new Date(interview.interviewDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                          <span className="flex items-center gap-0.5 sm:gap-1 truncate">
                            <User className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                            {interview.interviewer}
                          </span>
                          <span className="whitespace-nowrap">{interview.duration}m</span>
                        </div>
                      </div>
                      <div className="text-right space-y-1.5 sm:space-y-2 shrink-0">
                        <div className={`text-xl sm:text-2xl md:text-3xl font-bold ${getScoreColor(interview.overallScore)}`}>
                          {interview.overallScore}%
                        </div>
                        <Badge className={`${getRecommendationColor(interview.recommendation)} text-[8px] sm:text-xs md:text-sm py-0.5 px-2`}>
                          {interview.recommendation === 'excellent' && <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5" />}
                          {interview.recommendation.toUpperCase().replace('-', ' ')}
                        </Badge>
                      </div>
                    </div>

                    {/* Scores Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                      {interview.technicalScore > 0 && (
                        <div className="space-y-1.5 sm:space-y-2">
                          <div className="flex items-center justify-between text-[10px] sm:text-xs md:text-sm">
                            <span>Technical</span>
                            <span className={`font-semibold ml-1 ${getScoreColor(interview.technicalScore)}`}>
                              {interview.technicalScore}%
                            </span>
                          </div>
                          <Progress value={interview.technicalScore} className="h-1.5 sm:h-2" />
                        </div>
                      )}
                      <div className="space-y-1.5 sm:space-y-2">
                        <div className="flex items-center justify-between text-[10px] sm:text-xs md:text-sm">
                          <span className="truncate">Comms</span>
                          <span className={`font-semibold ml-1 ${getScoreColor(interview.communicationScore)}`}>
                            {interview.communicationScore}%
                          </span>
                        </div>
                        <Progress value={interview.communicationScore} className="h-1.5 sm:h-2" />
                      </div>
                      <div className="space-y-1.5 sm:space-y-2">
                        <div className="flex items-center justify-between text-[10px] sm:text-xs md:text-sm">
                          <span className="truncate">PS</span>
                          <span className={`font-semibold ml-1 ${getScoreColor(interview.problemSolvingScore)}`}>
                            {interview.problemSolvingScore}%
                          </span>
                        </div>
                        <Progress value={interview.problemSolvingScore} className="h-1.5 sm:h-2" />
                      </div>
                      <div className="space-y-1.5 sm:space-y-2">
                        <div className="flex items-center justify-between text-[10px] sm:text-xs md:text-sm">
                          <span>Confidence</span>
                          <span className={`font-semibold ml-1 ${getScoreColor(interview.confidenceScore)}`}>
                            {interview.confidenceScore}%
                          </span>
                        </div>
                        <Progress value={interview.confidenceScore} className="h-1.5 sm:h-2" />
                      </div>
                    </div>

                    {/* Feedback */}
                    <div className="space-y-1.5 sm:space-y-2">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 shrink-0" />
                        <span className="text-[10px] sm:text-xs md:text-sm font-medium">Feedback:</span>
                      </div>
                      <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground bg-blue-50 p-2 sm:p-3 rounded border border-blue-200 line-clamp-2 sm:line-clamp-none">
                        {interview.feedback}
                      </p>
                    </div>

                    {/* Strengths & Improvements */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                      <div>
                        <span className="text-[10px] sm:text-xs md:text-sm font-medium block mb-1.5">Strengths:</span>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          {interview.strengths.map((strength, idx) => (
                            <Badge key={idx} variant="outline" className="text-green-600 border-green-600 text-[8px] sm:text-xs md:text-sm py-0.5 px-2">{strength}</Badge>
                          ))}
                        </div>
                      </div>
                      {interview.improvements.length > 0 && (
                        <div>
                          <span className="text-[10px] sm:text-xs md:text-sm font-medium block mb-1.5">Improvements:</span>
                          <div className="flex flex-wrap gap-1.5 sm:gap-2">
                            {interview.improvements.map((improvement, idx) => (
                              <Badge key={idx} variant="outline" className="text-orange-600 border-orange-600 text-[8px] sm:text-xs md:text-sm py-0.5 px-2">{improvement}</Badge>
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
              <div className="text-center py-8 sm:py-12 text-[10px] sm:text-xs md:text-sm text-muted-foreground">No interviews found.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
