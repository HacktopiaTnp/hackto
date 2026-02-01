import { useState, useEffect } from 'react';
import { Video, Play, StopCircle, Brain, Star, TrendingUp, MessageSquare, FileText, Award, CheckCircle, AlertCircle, Clock, Mic, Camera, Volume2, Sparkles, Search } from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Textarea } from '@/app/components/ui/textarea';
import { Input } from '@/app/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';

interface MockInterviewProps {
  userRole: 'student' | 'coordinator' | 'admin';
  searchQuery?: string;
  setView?: (view: 'dashboard' | 'opportunities' | 'recruiters' | 'interview' | 'analytics') => void;
}

interface InterviewSession {
  id: number;
  type: 'Technical' | 'HR' | 'Behavioral' | 'Case Study';
  role: string;
  date: string;
  duration: string;
  score: number;
  status: 'completed' | 'in-progress' | 'scheduled';
  feedback: {
    communication: number;
    technical: number;
    problemSolving: number;
    confidence: number;
    overall: number;
  };
  strengths: string[];
  improvements: string[];
  questions: {
    question: string;
    answer: string;
    score: number;
    feedback: string;
  }[];
}

export default function MockInterview({ userRole, searchQuery: globalSearchQuery = '', setView }: MockInterviewProps) {
  const [interviewType, setInterviewType] = useState('Technical');
  const [interviewRole, setInterviewRole] = useState('Software Engineer');
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedSession, setSelectedSession] = useState<InterviewSession | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [microphoneReady, setMicrophoneReady] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const [permissionError, setPermissionError] = useState('');
  const [isCheckingPermissions, setIsCheckingPermissions] = useState(true);
  
  // Use global search if provided, otherwise use local search
  const activeSearchQuery = globalSearchQuery || searchQuery;

  // Check permissions on component mount
  useEffect(() => {
    checkPermissionsOnLoad();
  }, []);

  const interviewQuestions = {
    Technical: [
      "Can you explain the difference between var, let, and const in JavaScript?",
      "What are the key principles of Object-Oriented Programming?",
      "Explain the concept of REST APIs and how they work.",
      "What is the difference between SQL and NoSQL databases?",
      "Describe your approach to debugging a complex issue in production.",
    ],
    HR: [
      "Tell me about yourself and your background.",
      "Why do you want to work for our company?",
      "What are your greatest strengths and weaknesses?",
      "Describe a challenging situation you faced and how you overcame it.",
      "Where do you see yourself in 5 years?",
    ],
    Behavioral: [
      "Tell me about a time when you worked on a team project.",
      "Describe a situation where you had to meet a tight deadline.",
      "How do you handle conflicts with team members?",
      "Give an example of when you showed leadership.",
      "Tell me about a mistake you made and what you learned from it.",
    ],
    'Case Study': [
      "How would you design a parking lot management system?",
      "Estimate the number of smartphones sold in India annually.",
      "How would you improve user engagement for a mobile app?",
      "Design a recommendation system for an e-commerce platform.",
      "What metrics would you track for a food delivery service?",
    ],
  };

  const previousSessions: InterviewSession[] = [
    {
      id: 1,
      type: 'Technical',
      role: 'Software Engineer',
      date: '2026-01-28',
      duration: '45 min',
      score: 85,
      status: 'completed',
      feedback: {
        communication: 80,
        technical: 90,
        problemSolving: 85,
        confidence: 85,
        overall: 85,
      },
      strengths: [
        'Strong understanding of data structures and algorithms',
        'Clear communication of technical concepts',
        'Good problem-solving approach',
      ],
      improvements: [
        'Could improve on system design questions',
        'Need to practice more behavioral questions',
        'Work on reducing filler words',
      ],
      questions: [
        {
          question: "Explain the difference between var, let, and const in JavaScript?",
          answer: "var is function-scoped, let and const are block-scoped. const is for constants...",
          score: 90,
          feedback: "Excellent explanation! You covered the key differences clearly.",
        },
        {
          question: "What are the key principles of Object-Oriented Programming?",
          answer: "The four main principles are Encapsulation, Inheritance, Polymorphism, and Abstraction...",
          score: 85,
          feedback: "Good answer. Could add more practical examples.",
        },
      ],
    },
    {
      id: 2,
      type: 'HR',
      role: 'Product Manager',
      date: '2026-01-25',
      duration: '30 min',
      score: 78,
      status: 'completed',
      feedback: {
        communication: 85,
        technical: 70,
        problemSolving: 75,
        confidence: 80,
        overall: 78,
      },
      strengths: [
        'Confident communication style',
        'Good storytelling ability',
        'Professional demeanor',
      ],
      improvements: [
        'Provide more specific examples',
        'Better structure for STAR method answers',
        'Reduce nervousness in initial responses',
      ],
      questions: [],
    },
    {
      id: 3,
      type: 'Behavioral',
      role: 'Data Analyst',
      date: '2026-01-20',
      duration: '35 min',
      score: 72,
      status: 'completed',
      feedback: {
        communication: 75,
        technical: 65,
        problemSolving: 70,
        confidence: 75,
        overall: 72,
      },
      strengths: [
        'Honest and authentic responses',
        'Good self-awareness',
      ],
      improvements: [
        'Use more concrete examples from experience',
        'Practice STAR method more',
        'Show more enthusiasm',
      ],
      questions: [],
    },
  ];

  const stats = [
    { label: 'Total Interviews', value: previousSessions.length, icon: Video, color: 'bg-blue-50', textColor: 'text-blue-600' },
    { label: 'Average Score', value: '78%', icon: Star, color: 'bg-green-50', textColor: 'text-green-600' },
    { label: 'Hours Practiced', value: '3.5', icon: Clock, color: 'bg-purple-50', textColor: 'text-purple-600' },
    { label: 'Improvement', value: '+12%', icon: TrendingUp, color: 'bg-orange-50', textColor: 'text-orange-600' },
  ];

  const startInterview = () => {
    // Verify all permissions are granted before starting
    if (cameraReady && microphoneReady && audioReady) {
      setIsInterviewActive(true);
      setCurrentQuestion(0);
      setUserAnswer('');
      setShowSetupDialog(false);
    } else {
      setPermissionError('Please allow all permissions (Camera, Microphone, and Audio) to start the interview.');
    }
  };

  const checkPermissionsOnLoad = async () => {
    setIsCheckingPermissions(true);
    setPermissionError('');
    
    try {
      // Check if media devices are available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setPermissionError('Media devices not supported in this browser.');
        setIsCheckingPermissions(false);
        return;
      }

      // Check camera permission
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setCameraReady(true);
        videoStream.getTracks().forEach(track => track.stop());
      } catch (error: any) {
        setCameraReady(false);
        console.error('Camera check failed:', error.name);
      }

      // Check microphone permission
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicrophoneReady(true);
        setAudioReady(true);
        audioStream.getTracks().forEach(track => track.stop());
      } catch (error: any) {
        setMicrophoneReady(false);
        setAudioReady(false);
        console.error('Microphone check failed:', error.name);
      }

      // Set error message if any permission failed
      if (!cameraReady && !microphoneReady) {
        setPermissionError('Camera or microphone access denied. Please allow permissions in your browser settings.');
      } else if (!cameraReady) {
        setPermissionError('Camera access denied. Please allow camera permissions.');
      } else if (!microphoneReady) {
        setPermissionError('Microphone access denied. Please allow microphone permissions.');
      }
    } catch (error: any) {
      console.error('Permission check error:', error);
      setPermissionError('Error checking permissions. Please refresh and try again.');
    } finally {
      setIsCheckingPermissions(false);
    }
  };

  const checkPermissions = async (): Promise<boolean> => {
    setPermissionError('');
    setIsCheckingPermissions(true);

    let cameraGranted = false;
    let microphoneGranted = false;
    let audioGranted = false;
    let errorMessages: string[] = [];

    try {
      // Check if media devices are available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setPermissionError('Media devices not supported in this browser.');
        setIsCheckingPermissions(false);
        setCameraReady(false);
        setMicrophoneReady(false);
        setAudioReady(false);
        return false;
      }

      // Request camera permission
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
        cameraGranted = true;
        setCameraReady(true);
        videoStream.getTracks().forEach(track => track.stop());
      } catch (error: any) {
        console.error('Camera permission error:', error);
        setCameraReady(false);
        if (error.name === 'NotAllowedError') {
          errorMessages.push('Camera access was denied.');
        } else if (error.name === 'NotFoundError') {
          errorMessages.push('Camera not found.');
        } else {
          errorMessages.push('Camera error occurred.');
        }
      }

      // Request microphone permission
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        microphoneGranted = true;
        audioGranted = true;
        setMicrophoneReady(true);
        setAudioReady(true);
        audioStream.getTracks().forEach(track => track.stop());
      } catch (error: any) {
        console.error('Microphone permission error:', error);
        setMicrophoneReady(false);
        setAudioReady(false);
        if (error.name === 'NotAllowedError') {
          errorMessages.push('Microphone access was denied.');
        } else if (error.name === 'NotFoundError') {
          errorMessages.push('Microphone not found.');
        } else {
          errorMessages.push('Microphone error occurred.');
        }
      }

      // Set error message based on results
      if (errorMessages.length > 0) {
        setPermissionError(errorMessages.join(' ') + ' Please allow permissions in your browser settings and try again.');
      }

      setIsCheckingPermissions(false);
      return cameraGranted && microphoneGranted && audioGranted;
    } catch (error: any) {
      console.error('Permission check error:', error);
      setPermissionError('Error accessing camera/microphone. Please check your browser settings and try again.');
      setIsCheckingPermissions(false);
      setCameraReady(false);
      setMicrophoneReady(false);
      setAudioReady(false);
      return false;
    }
  };

  const handleStartMockInterview = async () => {
    // Request all permissions first
    const permissionsGranted = await checkPermissions();
    
    // Only open dialog if all permissions are granted
    if (permissionsGranted) {
      setShowSetupDialog(true);
    } else {
      // Show dialog anyway to display the error message and permission status
      setShowSetupDialog(true);
    }
  };

  const stopInterview = () => {
    setIsInterviewActive(false);
    setShowResults(true);
  };

  const submitAnswer = () => {
    if (currentQuestion < interviewQuestions[interviewType as keyof typeof interviewQuestions].length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setUserAnswer('');
    } else {
      stopInterview();
    }
  };

  const mockAIFeedback = (answer: string): string => {
    if (answer.length < 50) {
      return "Your answer could be more detailed. Try to provide more comprehensive explanations with examples.";
    } else if (answer.length < 150) {
      return "Good answer! You covered the main points. Consider adding more specific examples to strengthen your response.";
    } else {
      return "Excellent detailed answer! You demonstrated strong understanding and communication skills.";
    }
  };

  // Filter previous sessions based on search query
  const filteredSessions = previousSessions.filter(session =>
    session.type.toLowerCase().includes(activeSearchQuery.toLowerCase()) ||
    session.role.toLowerCase().includes(activeSearchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 mb-2">Mock Interview Platform</h1>
        <p className="text-base md:text-lg text-slate-600">
          Practice with AI-powered interviews and get personalized feedback
        </p>
      </div>

      {!isInterviewActive && !showResults && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="p-4 md:p-5 border-2 hover:shadow-lg transition-all hover:-translate-y-1">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className={`${stat.color} p-2 md:p-3 rounded-xl`}>
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Start New Interview */}
            <Card className="lg:col-span-2 p-8 border-2 shadow-lg bg-gradient-to-br from-blue-50 to-purple-50">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg">
                  <Sparkles className="size-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Start New Interview</h2>
                  <p className="text-slate-600">Configure your AI-powered mock interview session</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3">
                      Interview Type
                    </label>
                    <Select value={interviewType} onValueChange={setInterviewType}>
                      <SelectTrigger className="h-12 border-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Technical">Technical Interview</SelectItem>
                        <SelectItem value="HR">HR Interview</SelectItem>
                        <SelectItem value="Behavioral">Behavioral Interview</SelectItem>
                        <SelectItem value="Case Study">Case Study Interview</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3">
                      Target Role
                    </label>
                    <Select value={interviewRole} onValueChange={setInterviewRole}>
                      <SelectTrigger className="h-12 border-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Software Engineer">Software Engineer</SelectItem>
                        <SelectItem value="Data Analyst">Data Analyst</SelectItem>
                        <SelectItem value="Product Manager">Product Manager</SelectItem>
                        <SelectItem value="Business Analyst">Business Analyst</SelectItem>
                        <SelectItem value="DevOps Engineer">DevOps Engineer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="bg-white border-2 border-blue-300 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Brain className="size-5 text-blue-600" />
                    <h4 className="font-bold text-blue-900">What to expect:</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { icon: MessageSquare, text: '5 AI-generated questions tailored to your role' },
                      { icon: Clock, text: 'Real-time feedback on your responses' },
                      { icon: Star, text: 'Detailed scoring on multiple parameters' },
                      { icon: Award, text: 'Personalized improvement recommendations' },
                    ].map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <div key={index} className="flex items-start gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg shrink-0">
                            <Icon className="size-4 text-blue-600" />
                          </div>
                          <span className="text-sm text-slate-700">{item.text}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <Button className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg font-semibold shadow-lg" size="lg" onClick={handleStartMockInterview}>
                  <Play className="size-6 mr-2" />
                  Start Mock Interview
                </Button>
              </div>
            </Card>

            {/* Interview Tips & Setup */}
            <div className="space-y-6">
              <Card className="p-6 border-2 shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="size-5 text-yellow-600" />
                  <h3 className="font-bold text-slate-900">Interview Tips</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { color: 'from-blue-500 to-blue-600', title: 'Be Structured', desc: 'Use frameworks like STAR for behavioral questions' },
                    { color: 'from-green-500 to-green-600', title: 'Think Aloud', desc: 'Share your thought process while solving problems' },
                    { color: 'from-purple-500 to-purple-600', title: 'Ask Questions', desc: "Don't hesitate to clarify requirements" },
                  ].map((tip, index) => (
                    <div key={index} className={`p-4 bg-gradient-to-r ${tip.color} rounded-xl text-white`}>
                      <p className="font-bold mb-1">{tip.title}</p>
                      <p className="text-sm opacity-90">{tip.desc}</p>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6 border-2 shadow-lg bg-gradient-to-br from-slate-50 to-purple-50">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Camera className="size-5 text-purple-600" />
                  Setup Check
                </h3>
                
                {permissionError && (
                  <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="size-4 text-red-600 mt-0.5 shrink-0" />
                      <p className="text-xs text-red-700">{permissionError}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <div className={`flex items-center justify-between p-3 bg-white border-2 rounded-xl transition-colors ${
                    cameraReady ? 'border-green-200' : permissionError ? 'border-red-200' : 'border-slate-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${
                        cameraReady ? 'bg-green-100' : 'bg-slate-100'
                      }`}>
                        <Camera className={`size-4 ${
                          cameraReady ? 'text-green-600' : 'text-slate-400'
                        }`} />
                      </div>
                      <span className="text-sm font-medium">Camera</span>
                    </div>
                    <Badge className={`${
                      isCheckingPermissions ? 'bg-slate-300 text-slate-600' :
                      cameraReady ? 'bg-green-600' : 'bg-red-500'
                    }`}>
                      {isCheckingPermissions ? 'Checking...' : cameraReady ? 'Ready' : 'Denied'}
                    </Badge>
                  </div>
                  <div className={`flex items-center justify-between p-3 bg-white border-2 rounded-xl transition-colors ${
                    microphoneReady ? 'border-green-200' : permissionError ? 'border-red-200' : 'border-slate-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${
                        microphoneReady ? 'bg-green-100' : 'bg-slate-100'
                      }`}>
                        <Mic className={`size-4 ${
                          microphoneReady ? 'text-green-600' : 'text-slate-400'
                        }`} />
                      </div>
                      <span className="text-sm font-medium">Microphone</span>
                    </div>
                    <Badge className={`${
                      isCheckingPermissions ? 'bg-slate-300 text-slate-600' :
                      microphoneReady ? 'bg-green-600' : 'bg-red-500'
                    }`}>
                      {isCheckingPermissions ? 'Checking...' : microphoneReady ? 'Ready' : 'Denied'}
                    </Badge>
                  </div>
                  <div className={`flex items-center justify-between p-3 bg-white border-2 rounded-xl transition-colors ${
                    audioReady ? 'border-green-200' : permissionError ? 'border-red-200' : 'border-slate-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${
                        audioReady ? 'bg-green-100' : 'bg-slate-100'
                      }`}>
                        <Volume2 className={`size-4 ${
                          audioReady ? 'text-green-600' : 'text-slate-400'
                        }`} />
                      </div>
                      <span className="text-sm font-medium">Audio</span>
                    </div>
                    <Badge className={`${
                      isCheckingPermissions ? 'bg-slate-300 text-slate-600' :
                      audioReady ? 'bg-green-600' : 'bg-red-500'
                    }`}>
                      {isCheckingPermissions ? 'Checking...' : audioReady ? 'Ready' : 'Denied'}
                    </Badge>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Search for Previous Sessions */}
          <Card className="p-4 md:p-6 mb-6 border-2 shadow-md">
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 md:size-5 text-slate-400" />
                <Input
                  placeholder="Search previous interviews by type or role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 md:pl-10 h-10 md:h-11 text-sm md:text-base border-2 border-slate-300 focus:border-blue-500"
                />
              </div>
            </div>
          </Card>

          {/* Previous Sessions */}
          <Card className="p-4 md:p-6 mt-8 border-2 shadow-lg">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-6">Previous Interview Sessions</h2>
            <Tabs defaultValue="all">
              <TabsList className="bg-white border-2 border-slate-200 p-1.5 flex-wrap h-auto">
                <TabsTrigger value="all" className="text-xs md:text-sm">All Sessions</TabsTrigger>
                <TabsTrigger value="technical" className="text-xs md:text-sm">Technical</TabsTrigger>
                <TabsTrigger value="hr" className="text-xs md:text-sm">HR</TabsTrigger>
                <TabsTrigger value="behavioral" className="text-xs md:text-sm">Behavioral</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4 mt-6">
                {filteredSessions.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-slate-500 text-lg">No interviews found matching your search.</p>
                  </div>
                ) : (
                  filteredSessions.map((session) => (
                  <Card key={session.id} className="p-4 md:p-6 border-2 hover:shadow-lg hover:border-blue-400 transition-all cursor-pointer" onClick={() => setSelectedSession(session)}>
                    <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                      <div className="flex items-start gap-3 md:gap-5 flex-1 w-full">
                        <div className={`p-3 md:p-4 rounded-2xl border-2 ${
                          session.type === 'Technical' ? 'bg-blue-100 border-blue-300' :
                          session.type === 'HR' ? 'bg-green-100 border-green-300' :
                          session.type === 'Behavioral' ? 'bg-purple-100 border-purple-300' :
                          'bg-orange-100 border-orange-300'
                        }`}>
                          <Video className={`size-5 md:size-7 ${
                            session.type === 'Technical' ? 'text-blue-600' :
                            session.type === 'HR' ? 'text-green-600' :
                            session.type === 'Behavioral' ? 'text-purple-600' :
                            'text-orange-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                            <h3 className="text-lg md:text-xl font-bold text-slate-900">{session.type} Interview</h3>
                            <Badge className="bg-slate-600 w-fit">{session.role}</Badge>
                          </div>
                          <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm text-slate-600 mb-4">
                            <span className="flex items-center gap-1">
                              <Clock className="size-3 md:size-4" />
                              {session.date}
                            </span>
                            <span>•</span>
                            <span>{session.duration}</span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 md:gap-3">
                            {Object.entries(session.feedback).filter(([key]) => key !== 'overall').map(([key, value]) => (
                              <div key={key} className="text-center">
                                <div className="text-[10px] md:text-xs text-slate-600 mb-1.5 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                                <Progress value={value} className="h-1.5 md:h-2 mb-1" />
                                <div className="text-xs font-bold text-slate-900">{value}%</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="text-center w-full md:w-auto md:ml-6">
                        <div className={`text-3xl md:text-4xl font-bold mb-1 ${
                          session.score >= 80 ? 'text-green-600' :
                          session.score >= 60 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {session.score}%
                        </div>
                        <p className="text-xs md:text-sm text-slate-600 font-medium">Overall Score</p>
                      </div>
                    </div>
                  </Card>
                ))
                )}
              </TabsContent>

              <TabsContent value="technical" className="mt-6">
                <p className="text-center text-slate-600 py-8">Filter technical interviews</p>
              </TabsContent>
              <TabsContent value="hr" className="mt-6">
                <p className="text-center text-slate-600 py-8">Filter HR interviews</p>
              </TabsContent>
              <TabsContent value="behavioral" className="mt-6">
                <p className="text-center text-slate-600 py-8">Filter behavioral interviews</p>
              </TabsContent>
            </Tabs>
          </Card>
        </>
      )}

      {/* Active Interview */}
      {isInterviewActive && (
        <Card className="p-8 max-w-5xl mx-auto border-2 shadow-2xl">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
                  <Video className="size-7 text-white" />
                </div>
                <div>
                  <Badge className="bg-blue-600 mb-2">{interviewType} Interview</Badge>
                  <h2 className="text-2xl font-bold text-slate-900">{interviewRole}</h2>
                </div>
              </div>
              <Button variant="outline" onClick={stopInterview} className="border-2 border-red-300 text-red-600 hover:bg-red-50">
                <StopCircle className="size-4 mr-2" />
                End Interview
              </Button>
            </div>
            <Progress value={((currentQuestion + 1) / interviewQuestions[interviewType as keyof typeof interviewQuestions].length) * 100} className="h-3 mb-2" />
            <p className="text-sm text-slate-600 font-medium">
              Question {currentQuestion + 1} of {interviewQuestions[interviewType as keyof typeof interviewQuestions].length}
            </p>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300 rounded-2xl p-8 mb-8">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-600 rounded-xl shrink-0">
                <MessageSquare className="size-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-blue-600 font-bold mb-3">AI Interviewer:</p>
                <p className="text-xl text-slate-900 leading-relaxed font-medium">
                  {interviewQuestions[interviewType as keyof typeof interviewQuestions][currentQuestion]}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-bold text-slate-700 mb-3">
              Your Answer:
            </label>
            <Textarea
              placeholder="Type your answer here... (The AI will analyze your response)"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              rows={10}
              className="resize-none border-2 text-base"
            />
            <div className="flex items-center justify-between mt-3">
              <p className="text-sm text-slate-600">
                {userAnswer.length} characters
              </p>
              <p className={`text-sm font-medium ${
                userAnswer.length < 50 ? 'text-orange-600' :
                userAnswer.length < 150 ? 'text-yellow-600' :
                'text-green-600'
              }`}>
                {mockAIFeedback(userAnswer)}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg font-semibold"
              size="lg"
              onClick={submitAnswer}
              disabled={!userAnswer.trim()}
            >
              {currentQuestion < interviewQuestions[interviewType as keyof typeof interviewQuestions].length - 1 ? 'Next Question →' : 'Finish Interview'}
            </Button>
            <Button variant="outline" size="lg" onClick={() => setUserAnswer('')} className="border-2 h-14">
              Clear Answer
            </Button>
          </div>
        </Card>
      )}

      {/* Results Screen */}
      {showResults && (
        <Card className="p-10 max-w-5xl mx-auto border-2 shadow-2xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center size-28 bg-gradient-to-br from-green-400 to-green-600 rounded-full mb-6 shadow-lg">
              <CheckCircle className="size-14 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-slate-900 mb-3">Interview Complete!</h2>
            <p className="text-lg text-slate-600">Here's your detailed performance analysis</p>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-10">
            <Card className="p-8 text-center border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
              <p className="text-sm text-slate-600 mb-3 font-medium">Overall Score</p>
              <p className="text-6xl font-bold text-green-600 mb-2">82%</p>
              <Badge className="bg-green-600">Excellent Performance</Badge>
            </Card>
            <Card className="p-8 text-center border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-sky-50">
              <p className="text-sm text-slate-600 mb-3 font-medium">Time Taken</p>
              <p className="text-6xl font-bold text-blue-600 mb-2">28m</p>
              <Badge className="bg-blue-600">Good Pace</Badge>
            </Card>
          </div>

          <div className="space-y-4 mb-10">
            <h3 className="text-2xl font-bold text-slate-900">Performance Breakdown</h3>
            <div className="space-y-4">
              {[
                { label: 'Communication', score: 85, color: 'bg-blue-600' },
                { label: 'Technical Knowledge', score: 88, color: 'bg-green-600' },
                { label: 'Problem Solving', score: 80, color: 'bg-purple-600' },
                { label: 'Confidence', score: 78, color: 'bg-orange-600' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-slate-700">{item.label}</span>
                    <span className="text-sm font-bold text-slate-900">{item.score}%</span>
                  </div>
                  <Progress value={item.score} className="h-4" />
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-10">
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <CheckCircle className="size-6 text-green-600" />
                Strengths
              </h3>
              <ul className="space-y-3">
                {[
                  'Clear and concise communication',
                  'Strong technical knowledge',
                  'Good problem-solving approach',
                  'Professional demeanor',
                ].map((strength, index) => (
                  <li key={index} className="flex items-start gap-3 p-3 bg-green-50 border-2 border-green-200 rounded-xl">
                    <span className="text-green-600 font-bold text-lg">✓</span>
                    <span className="text-slate-700 font-medium">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <AlertCircle className="size-6 text-orange-600" />
                Areas for Improvement
              </h3>
              <ul className="space-y-3">
                {[
                  'Reduce use of filler words',
                  'Provide more specific examples',
                  'Work on system design concepts',
                  'Practice more behavioral questions',
                ].map((improvement, index) => (
                  <li key={index} className="flex items-start gap-3 p-3 bg-orange-50 border-2 border-orange-200 rounded-xl">
                    <span className="text-orange-600 font-bold text-lg">→</span>
                    <span className="text-slate-700 font-medium">{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex gap-4">
            <Button className="flex-1 h-14 bg-blue-600 hover:bg-blue-700 text-lg font-semibold" onClick={() => { setShowResults(false); setIsInterviewActive(false); }}>
              Back to Dashboard
            </Button>
            <Button className="flex-1 h-14 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg font-semibold" onClick={startInterview}>
              <Play className="size-5 mr-2" />
              Start Another Interview
            </Button>
            <Button variant="outline" className="h-14 border-2">
              <FileText className="size-5 mr-2" />
              Download Report
            </Button>
          </div>
        </Card>
      )}

      {/* Session Details Dialog */}
      <Dialog open={!!selectedSession} onOpenChange={(open) => !open && setSelectedSession(null)}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          {selectedSession && (
            <>
              <DialogHeader>
                <DialogTitle className="text-3xl">Interview Session Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="flex items-start justify-between p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border-2 border-blue-200">
                  <div>
                    <Badge className="bg-blue-600 mb-2">{selectedSession.type}</Badge>
                    <h3 className="text-2xl font-bold text-slate-900 mb-1">{selectedSession.role}</h3>
                    <p className="text-sm text-slate-600">{selectedSession.date} • {selectedSession.duration}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-5xl font-bold text-green-600">{selectedSession.score}%</div>
                    <p className="text-sm text-slate-600 mt-1 font-medium">Overall Score</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-xl font-bold mb-4">Performance Breakdown</h4>
                  <div className="space-y-3">
                    {Object.entries(selectedSession.feedback).map(([key, value]) => (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <span className="text-sm font-bold">{value}%</span>
                        </div>
                        <Progress value={value} className="h-3" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold mb-3">Strengths</h4>
                    <ul className="space-y-2">
                      {selectedSession.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-slate-700 p-2 bg-green-50 rounded-lg">
                          <CheckCircle className="size-4 text-green-600 mt-0.5 shrink-0" />
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold mb-3">Areas for Improvement</h4>
                    <ul className="space-y-2">
                      {selectedSession.improvements.map((improvement, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-slate-700 p-2 bg-orange-50 rounded-lg">
                          <AlertCircle className="size-4 text-orange-600 mt-0.5 shrink-0" />
                          <span>{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {selectedSession.questions.length > 0 && (
                  <div>
                    <h4 className="text-xl font-bold mb-4">Question-wise Feedback</h4>
                    <div className="space-y-4">
                      {selectedSession.questions.map((q, index) => (
                        <Card key={index} className="p-5 border-2">
                          <div className="flex items-start justify-between mb-3">
                            <p className="font-bold text-slate-900">Q{index + 1}: {q.question}</p>
                            <Badge className={q.score >= 80 ? 'bg-green-600' : 'bg-yellow-600'}>
                              {q.score}%
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600 mb-3 italic">"{q.answer}"</p>
                          <p className="text-sm text-blue-600">
                            <span className="font-bold">Feedback:</span> {q.feedback}
                          </p>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-6 border-t-2">
                  <Button className="flex-1 h-12 bg-blue-600 hover:bg-blue-700">
                    <FileText className="size-4 mr-2" />
                    Download Report
                  </Button>
                  <Button variant="outline" className="flex-1 h-12 border-2">
                    Share Results
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Setup Check Dialog */}
      <Dialog open={showSetupDialog} onOpenChange={setShowSetupDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl md:text-3xl flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
                <Sparkles className="size-6 md:size-7 text-white" />
              </div>
              Start New Interview
            </DialogTitle>
            <p className="text-sm md:text-base text-slate-600 mt-2">
              Configure your AI-powered mock interview session
            </p>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Interview Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Interview Type
                </label>
                <Select value={interviewType} onValueChange={setInterviewType}>
                  <SelectTrigger className="h-12 border-2">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technical">Technical Interview</SelectItem>
                    <SelectItem value="HR">HR Interview</SelectItem>
                    <SelectItem value="Behavioral">Behavioral Interview</SelectItem>
                    <SelectItem value="Case Study">Case Study</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Target Role
                </label>
                <Select value={interviewRole} onValueChange={setInterviewRole}>
                  <SelectTrigger className="h-12 border-2">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Software Engineer">Software Engineer</SelectItem>
                    <SelectItem value="Data Scientist">Data Scientist</SelectItem>
                    <SelectItem value="Product Manager">Product Manager</SelectItem>
                    <SelectItem value="Business Analyst">Business Analyst</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* What to Expect */}
            <Card className="p-4 md:p-5 border-2 border-blue-200 bg-blue-50/50">
              <div className="flex items-start gap-2 mb-3">
                <Brain className="size-5 text-blue-600 mt-0.5" />
                <h4 className="font-bold text-slate-900">What to expect:</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-start gap-2">
                  <MessageSquare className="size-4 text-blue-600 mt-1 shrink-0" />
                  <span className="text-sm text-slate-700">5 AI-generated questions tailored to your role</span>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="size-4 text-blue-600 mt-1 shrink-0" />
                  <span className="text-sm text-slate-700">Real-time feedback on your responses</span>
                </div>
                <div className="flex items-start gap-2">
                  <Star className="size-4 text-blue-600 mt-1 shrink-0" />
                  <span className="text-sm text-slate-700">Detailed scoring on multiple parameters</span>
                </div>
                <div className="flex items-start gap-2">
                  <Award className="size-4 text-blue-600 mt-1 shrink-0" />
                  <span className="text-sm text-slate-700">Personalized improvement recommendations</span>
                </div>
              </div>
            </Card>

            {/* Setup Check */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Camera className="size-5 text-purple-600" />
                <h4 className="font-bold text-slate-900">Setup Check</h4>
              </div>

              {permissionError && (
                <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="size-5 text-red-600 mt-0.5 shrink-0" />
                    <p className="text-sm text-red-700">{permissionError}</p>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {/* Camera Check */}
                <Card className="p-4 border-2 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${cameraReady ? 'bg-green-100' : 'bg-slate-100'}`}>
                        <Camera className={`size-5 ${cameraReady ? 'text-green-600' : 'text-slate-400'}`} />
                      </div>
                      <span className="font-medium text-slate-900">Camera</span>
                    </div>
                    <Badge className={cameraReady ? 'bg-green-600' : 'bg-slate-300 text-slate-600'}>
                      {cameraReady ? 'Ready' : 'Checking...'}
                    </Badge>
                  </div>
                </Card>

                {/* Microphone Check */}
                <Card className="p-4 border-2 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${microphoneReady ? 'bg-green-100' : 'bg-slate-100'}`}>
                        <Mic className={`size-5 ${microphoneReady ? 'text-green-600' : 'text-slate-400'}`} />
                      </div>
                      <span className="font-medium text-slate-900">Microphone</span>
                    </div>
                    <Badge className={microphoneReady ? 'bg-green-600' : 'bg-slate-300 text-slate-600'}>
                      {microphoneReady ? 'Ready' : 'Checking...'}
                    </Badge>
                  </div>
                </Card>

                {/* Audio Check */}
                <Card className="p-4 border-2 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${audioReady ? 'bg-green-100' : 'bg-slate-100'}`}>
                        <Volume2 className={`size-5 ${audioReady ? 'text-green-600' : 'text-slate-400'}`} />
                      </div>
                      <span className="font-medium text-slate-900">Audio</span>
                    </div>
                    <Badge className={audioReady ? 'bg-green-600' : 'bg-slate-300 text-slate-600'}>
                      {audioReady ? 'Ready' : 'Checking...'}
                    </Badge>
                  </div>
                </Card>
              </div>
            </div>

            {/* Interview Tips */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Award className="size-5 text-yellow-600" />
                <h4 className="font-bold text-slate-900">Interview Tips</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
                  <h5 className="font-bold text-blue-900 mb-1">Be Structured</h5>
                  <p className="text-sm text-blue-700">Use frameworks like STAR for behavioral questions</p>
                </Card>
                <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200">
                  <h5 className="font-bold text-green-900 mb-1">Think Aloud</h5>
                  <p className="text-sm text-green-700">Share your thought process while solving problems</p>
                </Card>
                <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200">
                  <h5 className="font-bold text-purple-900 mb-1">Ask Questions</h5>
                  <p className="text-sm text-purple-700">Don't hesitate to clarify requirements</p>
                </Card>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t-2">
              <Button 
                className="flex-1 h-12 md:h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-base md:text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed" 
                size="lg" 
                onClick={startInterview}
                disabled={!cameraReady || !microphoneReady || !audioReady}
              >
                <Play className="size-5 md:size-6 mr-2" />
                Start Mock Interview
              </Button>
              <Button 
                variant="outline" 
                className="h-12 md:h-14 border-2 text-base md:text-lg px-6"
                onClick={() => setShowSetupDialog(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
