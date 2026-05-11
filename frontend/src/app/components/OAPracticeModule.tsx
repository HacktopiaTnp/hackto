import React, { useState, useEffect } from 'react';
import { Play, CheckCircle, Clock, AlertCircle, BarChart3, Award, BookOpen, Code, Target, Edit, Trash2, Plus, Save, X, Loader, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { api } from '@/services/api';

interface OATest {
  id: string;
  title: string;
  company: string;
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number; // in minutes
  totalQuestions: number;
  passingScore: number;
  categories: string[];
  description: string;
  attempts: number;
  bestScore: number;
  status: 'not-started' | 'in-progress' | 'completed';
  completedDate?: string;
  questions: Question[];
  user_id?: string;
  tenant_id?: string;
  isPublished?: boolean;
  userAnswers?: (string | number)[];
  correctAnswersCount?: number;
}

interface Question {
  id: string;
  type: 'mcq' | 'coding' | 'true-false' | 'numerical';
  question: string;
  difficulty: string;
  timeLimit: number;
  options?: string[];
  correctAnswer?: string | number;
  userAnswer?: string | number;
  isCorrect?: boolean;
  explanation?: string;
  category?: string;
}

interface StudentProgress {
  testId: string;
  completed: number;
  score: number;
  timeTaken: number;
  accuracy: number;
}

export default function OAPracticeModule() {
  // State Management
  const [tests, setTests] = useState<OATest[]>([]);
  const [currentTest, setCurrentTest] = useState<OATest | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [userAnswers, setUserAnswers] = useState<(string | number)[]>([]);
  const [testResults, setTestResults] = useState<any>(null);
  
  // Loading and Error States
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form States
  const [formData, setFormData] = useState<Partial<OATest>>({
    title: '',
    company: '',
    difficulty: 'medium',
    duration: 60,
    totalQuestions: 25,
    passingScore: 60,
  });

  // Fetch tests from API on component mount
  useEffect(() => {
    const fetchTests = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get user ID from localStorage or auth context
        const userId = localStorage.getItem('userId') || 'default-user';
        const tenantId = localStorage.getItem('tenantId') || 'default-tenant';
        
        // Fetch all published tests
        const response = await api.get('/api/v1/oa-tests/list', {
          headers: {
            'x-tenant-id': tenantId,
            'x-user-id': userId,
          },
        });
        
        if (response.data && response.data.tests) {
          setTests(response.data.tests);
        }
      } catch (err: any) {
        console.error('Error fetching tests:', err);
        setError('Failed to load tests. Please try again.');
        // Keep tests empty if API fails
      } finally {
        setIsLoading(false);
      }
    };

    fetchTests();
  }, []);

  // Handler: Start Test
  const handleStartTest = async (test: OATest) => {
    try {
      setError(null);
      setIsLoading(true);
      
      const userId = localStorage.getItem('userId') || 'default-user';
      const tenantId = localStorage.getItem('tenantId') || 'default-tenant';
      
      // Call Start Test API
      const response = await api.post(
        `/api/v1/oa-tests/${test.id}/start`,
        {},
        {
          headers: {
            'x-tenant-id': tenantId,
            'x-user-id': userId,
          },
        }
      );

      if (response.data && response.data.questions && response.data.questions.length > 0) {
        setCurrentTest(response.data);
        setCurrentQuestionIndex(0);
        setUserAnswers(new Array(response.data.questions.length).fill(null));
        setShowResults(false);
        setTestResults(null);
      } else {
        setError('Test has no questions. Please contact support.');
      }
    } catch (err: any) {
      console.error('Error starting test:', err);
      setError(err.response?.data?.message || 'Failed to start test. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handler: Answer Question
  const handleAnswerQuestion = (answer: string | number) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = answer;
    setUserAnswers(newAnswers);
  };

  // Handler: Next Question
  const handleNextQuestion = () => {
    if (currentTest && currentQuestionIndex < currentTest.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (currentTest && currentQuestionIndex === currentTest.questions.length - 1) {
      // Ready to submit
      setShowResults(true);
    }
  };

  // Handler: Previous Question
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Handler: Submit Test
  const handleSubmitTest = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      const userId = localStorage.getItem('userId') || 'default-user';
      const tenantId = localStorage.getItem('tenantId') || 'default-tenant';
      
      if (!currentTest) {
        throw new Error('No test is currently active');
      }

      // Submit test with answers
      const response = await api.post(
        `/api/v1/oa-tests/${currentTest.id}/submit`,
        { userAnswers },
        {
          headers: {
            'x-tenant-id': tenantId,
            'x-user-id': userId,
          },
        }
      );

      if (response.data) {
        setTestResults({
          score: response.data.score,
          passed: response.data.score >= (currentTest.passingScore || 60),
          correctAnswers: response.data.test.correctAnswersCount,
          totalQuestions: currentTest.totalQuestions,
          test: response.data.test,
        });

        // Update tests list to reflect new status
        setTests(tests.map(t =>
          t.id === currentTest.id
            ? { ...t, status: 'completed', bestScore: response.data.score }
            : t
        ));
      }
    } catch (err: any) {
      console.error('Error submitting test:', err);
      setError(err.response?.data?.message || 'Failed to submit test. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler: Exit Test
  const handleExitTest = () => {
    setCurrentTest(null);
    setShowResults(false);
    setUserAnswers([]);
    setTestResults(null);
    setCurrentQuestionIndex(0);
  };

  // Calculate student statistics from fetched tests
  const completedTests = tests.filter(t => t.status === 'completed');
  const averageScore = completedTests.length > 0
    ? Math.round(completedTests.reduce((sum, t) => sum + (t.bestScore || 0), 0) / completedTests.length)
    : 0;

  const studentStats = {
    testsCompleted: completedTests.length,
    averageScore,
    totalPracticeHours: completedTests.length * (tests.reduce((sum, t) => sum + t.duration, 0) / Math.max(tests.length, 1)) / 60,
    strongAreas: tests.filter(t => (t.bestScore || 0) >= 80).flatMap(t => t.categories),
    weakAreas: tests.filter(t => (t.bestScore || 0) < 70).flatMap(t => t.categories),
  };

  // Show Test Results
  if (currentTest && showResults && testResults) {
    const { score, passed, correctAnswers, totalQuestions } = testResults;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          {/* Results Header */}
          <Card className="mb-6 border-2" style={{ borderColor: passed ? '#10b981' : '#ef4444' }}>
            <CardContent className="p-8 text-center">
              <div className="mb-4">
                {passed ? (
                  <Award className="w-16 h-16 text-green-600 mx-auto" />
                ) : (
                  <AlertCircle className="w-16 h-16 text-red-600 mx-auto" />
                )}
              </div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                {passed ? '🎉 Congratulations!' : 'Test Completed'}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                {passed ? `You passed with ${score}% score!` : `Your score is ${score}%. Keep practicing!`}
              </p>

              {/* Score Circle */}
              <div className="flex justify-center mb-6">
                <div className="relative w-40 h-40">
                  <svg className="transform -rotate-90" width="160" height="160">
                    <circle
                      cx="80"
                      cy="80"
                      r="75"
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="8"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="75"
                      fill="none"
                      stroke={passed ? '#10b981' : '#ef4444'}
                      strokeWidth="8"
                      strokeDasharray={`${(score / 100) * 471} 471`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-4xl font-bold text-slate-900 dark:text-white">{score}%</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Score</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <p className="text-sm text-slate-600 dark:text-slate-400">Correct</p>
                  <p className="text-2xl font-bold text-blue-600">{correctAnswers}/{totalQuestions}</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <p className="text-sm text-slate-600 dark:text-slate-400">Accuracy</p>
                  <p className="text-2xl font-bold text-purple-600">{Math.round((correctAnswers / totalQuestions) * 100)}%</p>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                  <p className="text-sm text-slate-600 dark:text-slate-400">Pass Score</p>
                  <p className="text-2xl font-bold text-orange-600">{currentTest.passingScore}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleExitTest}
              className="flex-1"
            >
              Back to Tests
            </Button>
            <Button
              onClick={() => handleStartTest(currentTest)}
              className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Retry Test
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show Test Questions
  if (currentTest && !showResults) {
    const question = currentTest.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / currentTest.questions.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Test Header */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{currentTest.title}</h1>
                  <p className="text-slate-600 dark:text-slate-400">{currentTest.company}</p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleExitTest}
                >
                  <X className="w-4 h-4 mr-2" />
                  Exit Test
                </Button>
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Question {currentQuestionIndex + 1} of {currentTest.totalQuestions}
                  </span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {Math.round(progress)}% Complete
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Question */}
          <Card className="mb-6">
            <CardContent className="p-8">
              <div className="flex items-start justify-between mb-6">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white flex-1">
                  {question.question}
                </h2>
                <Badge className="ml-4">
                  <Clock className="w-3 h-3 mr-1" />
                  {question.timeLimit}s
                </Badge>
              </div>

              {/* Options */}
              {question.type === 'mcq' && question.options && (
                <div className="space-y-3">
                  {question.options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswerQuestion(idx)}
                      className={`w-full p-4 border rounded-lg text-left transition-all ${
                        question.userAnswer === idx
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-slate-300 dark:border-slate-600 hover:border-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            question.userAnswer === idx
                              ? 'border-blue-600 bg-blue-600'
                              : 'border-slate-400'
                          }`}
                        >
                          {question.userAnswer === idx && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                        <span className="text-slate-700 dark:text-slate-300">{option}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </Button>
            <div className="flex-1" />
            {currentQuestionIndex === currentTest.questions.length - 1 ? (
              <Button
                onClick={handleSubmitTest}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 flex items-center gap-2"
              >
                {isSubmitting && <Loader className="w-4 h-4 animate-spin" />}
                {isSubmitting ? 'Submitting...' : 'Submit Test'}
              </Button>
            ) : (
              <Button
                onClick={handleNextQuestion}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              >
                Next Question
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
              <Code className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">OA Practice Hub</h1>
              <p className="text-slate-600 dark:text-slate-400">Practice coding & aptitude tests</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-blue-600">{studentStats.testsCompleted}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Tests Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-green-600">{Math.round(studentStats.averageScore)}%</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Average Score</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-purple-600">{studentStats.totalPracticeHours}h</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Practice Hours</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-lg font-bold text-orange-600">{tests.length}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Tests Available</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-lg font-bold text-pink-600">{tests.filter(t => t.status === 'not-started').length}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">To Do</p>
            </CardContent>
          </Card>
        </div>

        {/* Error Alert */}
        {error && (
          <Card className="mb-6 border-red-300 bg-red-50 dark:bg-red-900/20">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-800 dark:text-red-300">{error}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setError(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="available" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="available">Available Tests</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="skills">Skills Analysis</TabsTrigger>
          </TabsList>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
                <p className="text-slate-600 dark:text-slate-400">Loading tests...</p>
              </div>
            </div>
          )}

          {/* Available Tests */}
          <TabsContent value="available">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tests.filter(t => t.status !== 'completed').map((test) => (
                <Card key={test.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 dark:text-white">{test.title}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{test.company}</p>
                      </div>
                      <Badge
                        className={
                          test.difficulty === 'easy'
                            ? 'bg-green-100 text-green-800'
                            : test.difficulty === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                        }
                      >
                        {test.difficulty}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400">{test.description}</p>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span className="text-slate-600 dark:text-slate-400">{test.duration} mins</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-blue-600" />
                        <span className="text-slate-600 dark:text-slate-400">{test.totalQuestions} Q</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-blue-600" />
                        <span className="text-slate-600 dark:text-slate-400">Pass: {test.passingScore}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-blue-600" />
                        <span className="text-slate-600 dark:text-slate-400">{test.attempts} attempts</span>
                      </div>
                    </div>

                    {/* Categories */}
                    <div className="flex flex-wrap gap-2">
                      {test.categories.map((cat) => (
                        <Badge key={cat} variant="outline" className="text-xs">
                          {cat}
                        </Badge>
                      ))}
                    </div>

                    {/* Action Button */}
                    <Button
                      onClick={() => handleStartTest(test)}
                      disabled={isLoading || isSubmitting}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          Start Test
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
              {!isLoading && tests.filter(t => t.status !== 'completed').length === 0 && (
                <div className="col-span-full flex items-center justify-center py-12">
                  <div className="text-center">
                    <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400 text-lg">No tests available</p>
                    <p className="text-slate-500 dark:text-slate-500 text-sm mt-1">Check back later for new tests</p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Completed Tests */}
          <TabsContent value="completed">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tests.filter(t => t.status === 'completed').map((test) => (
                <Card key={test.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 dark:text-white">{test.title}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          Completed on {test.completedDate}
                        </p>
                      </div>
                      <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Done
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-slate-600 dark:text-slate-400">Best Score</p>
                      <p className="text-3xl font-bold text-blue-600">{test.bestScore}%</p>
                    </div>
                    <Button variant="outline" className="w-full">
                      View Results
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Skills Analysis */}
          <TabsContent value="skills">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Strong Areas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {studentStats.strongAreas.map((area) => (
                    <div key={area} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-slate-700 dark:text-slate-300">{area}</span>
                      <Progress value={85} className="flex-1 h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Areas to Improve</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {studentStats.weakAreas.map((area) => (
                    <div key={area} className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-orange-600" />
                      <span className="text-slate-700 dark:text-slate-300">{area}</span>
                      <Progress value={45} className="flex-1 h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
