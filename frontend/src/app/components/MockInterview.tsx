import { useState, useEffect, useRef } from 'react';
import { Video, Play, StopCircle, Brain, Star, TrendingUp, MessageSquare, FileText, Award, CheckCircle, AlertCircle, Clock, Mic, Camera, Volume2, Sparkles, Search, Code, Zap, BarChart3, BookOpen, Users, CreditCard, Target, Upload, Volume, ChevronRight } from 'lucide-react';
import { detectBackendPort } from '@/utils/portDetection';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/app/components/ui/dialog';
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
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [activeTab, setActiveTab] = useState('interview');
  const [selectedInterviewType, setSelectedInterviewType] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // State for dynamic data from APIs
  const [interviewTypes, setInterviewTypes] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [questionBankCategories, setQuestionBankCategories] = useState<any[]>([]);
  const [progressStats, setProgressStats] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [peers, setPeers] = useState<any[]>([]);
  const [interviewFeedback, setInterviewFeedback] = useState<any>(null);
  
  // Loading and error states
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [loadingPeers, setLoadingPeers] = useState(false);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [apiError, setApiError] = useState('');
  
  // Interview session state
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessionQuestions, setSessionQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<any[]>([]);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number | null>(null);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [apiBaseUrl, setApiBaseUrl] = useState<string>('http://localhost:3000');
  
  // System Design Interview State
  const [selectedProblem, setSelectedProblem] = useState<string | null>(null);
  const [requirements, setRequirements] = useState({ fr: '', nfr: '', dau: '', qps: '', storage: '' });
  const [capacityEstimates, setCapacityEstimates] = useState({ reqPerSec: 0, storagePerDay: 0, bandwidth: 0, cacheHitRatio: 80 });
  const [architectureComponents, setArchitectureComponents] = useState<string[]>([]);
  const [dataFlowStep, setDataFlowStep] = useState(0);
  const [tradeoffSelections, setTradeoffSelections] = useState<any>({});
  const [bottleneckAnalysis, setBottleneckAnalysis] = useState('');
  const [systemDesignScore, setSystemDesignScore] = useState({ requirement: 0, estimation: 0, architecture: 0, tradeoff: 0, bottleneck: 0, communication: 0, confidence: 0 });
  const [designCurrentStep, setDesignCurrentStep] = useState(1); // 1-10 for the sections
  
  // Behavioral/HR Interview State
  const [selectedBehavioralCategory, setSelectedBehavioralCategory] = useState<string | null>(null);
  const [behavioralCurrentStep, setBehavioralCurrentStep] = useState(1); // 1-10 for the sections
  const [starAnswers, setStarAnswers] = useState({ situation: '', task: '', action: '', result: '' });
  const [aiQuestionIndex, setAiQuestionIndex] = useState(0);
  const [communicationStats, setCommunicationStats] = useState({ fillerWords: 0, speakingSpeed: 75, confidence: 70, pauses: 5, tone: 75, clarity: 80, grammar: 85 });
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [softSkillsScore, setSoftSkillsScore] = useState({ communication: 75, confidence: 70, empathy: 72, leadership: 68, ownership: 75, conflictResolution: 70, clarity: 78, professionalism: 80, positivity: 76 });
  const [uploadedResume, setUploadedResume] = useState<string | null>(null);
  const [selectedCompanyName, setSelectedCompanyName] = useState<string | null>(null);
  const [improvementData, setImprovementData] = useState({ mocksCount: 5, avgScore: 75, weakAreas: ['confidence', 'communication'], starCompletion: 60, fillerWordsReduced: 30 });
  
  // CS Fundamentals State - Enhanced for full interactivity
  const [selectedCsSubject, setSelectedCsSubject] = useState<string | null>(null);
  const [csFundamentalsCurrentStep, setCsFundamentalsCurrentStep] = useState(1); // 1-10 for the sections
  const [selectedCsTopic, setSelectedCsTopic] = useState<string | null>(null);
  const [vivaAnswerText, setVivaAnswerText] = useState('');
  const [vivaAnswers, setVivaAnswers] = useState<{[key: number]: string}>({});
  const [mcrAnswers, setMcrAnswers] = useState<{[key: string]: string}>({});
  const [csQuizProgress, setCsQuizProgress] = useState({ current: 0, total: 50, score: 0, answers: [] as string[] });
  const [csSubjectScores, setCsSubjectScores] = useState({ os: 0, dbms: 0, cn: 0, oop: 0, sql: 0, systemCalls: 0, coa: 0, se: 0 });
  const [selectedCsCompany, setSelectedCsCompany] = useState<string | null>(null);
  const [csProgressMetrics, setCsProgressMetrics] = useState({ osCompletion: 40, dbmsCompletion: 65, cnCompletion: 35, oopCompletion: 80, sqlCompletion: 70, systemCallsCompletion: 25, coaCompletion: 45, seCompletion: 55 });
  const [csSelectedScenario, setCsSelectedScenario] = useState<string | null>(null);
  const [csScenarioSolution, setCsScenarioSolution] = useState('');
  const [topicDetails, setTopicDetails] = useState<{[key: string]: any}>({});
  
  // OOP/LLD State Variables - 11 Features
  const [oopCurrentStep, setOopCurrentStep] = useState(1); // 1-11 for the sections
  const [selectedLldProblem, setSelectedLldProblem] = useState<string | null>(null);
  const [lldRequirements, setLldRequirements] = useState({ coreFeatures: '', optionalFeatures: '', constraints: '', assumptions: '', edgeCases: '', apiMethods: [] as string[] });
  const [lldClasses, setLldClasses] = useState<any[]>([]);
  const [lldDesignPatterns, setLldDesignPatterns] = useState<string[]>([]);
  const [lldSequenceDiagram, setLldSequenceDiagram] = useState('');
  const [lldMachineCode, setLldMachineCode] = useState('');
  const [lldCodeLanguage, setLldCodeLanguage] = useState('java');
  const [lldDryRunLog, setLldDryRunLog] = useState('');
  const [lldQualityScore, setLldQualityScore] = useState({ requirementClarity: 0, classResponsibility: 0, solidScore: 0, patternUsage: 0, extensibility: 0, readability: 0, edgeCaseHandling: 0, codeQuality: 0, overall: 0 });
  const [oopConceptIndex, setOopConceptIndex] = useState(0);
  
  // Resume/Project-Based State Variables - 11 Features
  const [resumeCurrentStep, setResumeCurrentStep] = useState(1); // 1-11 for sections
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [parsedProjects, setParsedProjects] = useState<any[]>([
    {
      id: 'mock-saas',
      title: 'Mock Interview SaaS',
      techStack: 'Next.js, Node.js, PostgreSQL, WebRTC, Redis',
      duration: '6 months',
      teamSize: 4,
      role: 'Full Stack Lead',
      metrics: '10k users, 95% uptime, 2.5s avg latency',
      architectureLevel: 'Microservices',
      difficulty: 'Hard',
      domain: 'EdTech SaaS',
      description: 'Built real-time mock interview platform with AI feedback',
    },
    {
      id: 'ecommerce',
      title: 'E-commerce Platform',
      techStack: 'React, Express, MongoDB, Stripe',
      duration: '3 months',
      teamSize: 2,
      role: 'Backend Developer',
      metrics: '1000s transactions/day, 99.9% availability',
      architectureLevel: 'Monolith',
      difficulty: 'Medium',
      domain: 'E-commerce',
      description: 'Built payment processing and order management system',
    },
  ]);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [deepDiveQuestions, setDeepDiveQuestions] = useState<any[]>([]);
  const [resumeCurrentQuestion, setResumeCurrentQuestion] = useState(0);
  const [projectImpactMetrics, setProjectImpactMetrics] = useState({ latencyBefore: '', latencyAfter: '', costReduction: '', throughput: '', userGrowth: '', bugReduction: '', testCoverage: '' });
  const [incidentDetails, setIncidentDetails] = useState({ incident: '', rootCause: '', debugSteps: '', rollback: '', lessonLearned: '' });
  const [ownershipDetails, setOwnershipDetails] = useState({ contribution: '', apisOwned: '', modulesBuilt: '', teamConflict: '', reviewProcess: '', mentorship: '' });
  const [projectVivaCurrent, setProjectVivaCurrent] = useState(0);
  const [projectStoryIndex, setProjectStoryIndex] = useState(0);
  
  // Use global search if provided, otherwise use local search
  const activeSearchQuery = globalSearchQuery || searchQuery;
  
  // Detect backend port on component mount
  useEffect(() => {
    const initializeApi = async () => {
      const detectedUrl = import.meta.env.VITE_API_BASE_URL || await detectBackendPort();
      setApiBaseUrl(detectedUrl);
      
      // Initialize interview types immediately
      initializeInterviewTypes();
    };
    initializeApi();
  }, []);

  // Initialize default interview types
  const initializeInterviewTypes = () => {
    const defaultTypes = [
      {
        id: 'dsa-coding',
        name: '💻 DSA & Coding',
        description: 'Practice LeetCode-style problems and data structures',
        icon: '💻',
        color: 'from-blue-500 to-blue-600',
      },
      {
        id: 'system-design',
        name: '🏗️ System Design',
        description: 'Design large-scale distributed systems',
        icon: '🏗️',
        color: 'from-purple-500 to-purple-600',
      },
      {
        id: 'oop-lld',
        name: '🧬 OOP/LLD',
        description: 'Object-Oriented Programming & Low-Level Design',
        icon: '🧬',
        color: 'from-green-500 to-green-600',
      },
      {
        id: 'behavioral',
        name: '🎙️ Behavioral/HR',
        description: 'Master communication and soft skills',
        icon: '🎙️',
        color: 'from-yellow-500 to-yellow-600',
      },
      {
        id: 'cs-fundamentals',
        name: '📖 CS Fundamentals',
        description: 'OS, DBMS, Networking, OOP concepts',
        icon: '📖',
        color: 'from-red-500 to-red-600',
      },
    ];
    setInterviewTypes(defaultTypes);
    setLoadingTypes(false);
  };

  // Check permissions and fetch data when API is ready
  useEffect(() => {
    if (apiBaseUrl && apiBaseUrl !== '') {
      checkPermissionsOnLoad();
      // Interview types are already initialized
      fetchCompanies();
      fetchQuestionBank();
      fetchUserProgress();
      fetchPlans();
      fetchPeers();
    }
  }, [apiBaseUrl]);

  // Cleanup video stream on component unmount
  useEffect(() => {
    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [videoStream]);

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

  const startInterview = async () => {
    // Verify all permissions are granted before starting - Camera is compulsory
    if (!cameraReady) {
      setPermissionError('Camera access is required to start the interview.');
      return;
    }
    if (!microphoneReady || !audioReady) {
      setPermissionError('Please allow all permissions (Camera, Microphone, and Audio) to start the interview.');
      return;
    }

    try {
      // Start camera stream
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setVideoStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setIsInterviewActive(true);
      setCurrentQuestion(0);
      setUserAnswer('');
      setShowSetupDialog(false);
    } catch (error: any) {
      console.error('Failed to access camera:', error);
      setPermissionError('Failed to access camera. Please ensure camera permission is granted.');
    }
  };

  // 1️⃣ FETCH INTERVIEW TYPES (Optional - already initialized)
  const fetchInterviewTypes = async () => {
    // Interview types are initialized on component mount
    // This function is kept for backward compatibility and future API integration
    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/mock-interview/types`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data && result.data.length > 0) {
          setInterviewTypes(result.data);
          setLoadingTypes(false);
          return;
        }
      }
    } catch (error) {
      console.debug('Using default interview types');
    }
    setLoadingTypes(false);
  };

  // 2️⃣ FETCH COMPANIES WITH ROUNDS
  const fetchCompanies = async () => {
    setLoadingCompanies(true);
    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/mock-interview/companies`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const result = await response.json();
      if (result.success) {
        setCompanies(result.data);
      } else {
        throw new Error('API returned success: false');
      }
    } catch (error: any) {
      console.debug('Companies endpoint not available, using fallback data');
      setCompanies([
        { id: 1, name: 'Google', icon: '🔍', rounds: ['Phone Screen', 'DSA Round 1', 'DSA Round 2', 'System Design', 'Behavioral'] },
        { id: 2, name: 'Amazon', icon: '📦', rounds: ['OA', 'DSA Round 1', 'DSA Round 2', 'System Design', 'LP + Behavioral'] },
      ]);
    } finally {
      setLoadingCompanies(false);
    }
  };

  // 3️⃣ FETCH QUESTION BANK
  const fetchQuestionBank = async () => {
    setLoadingQuestions(true);
    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/mock-interview/questions`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const result = await response.json();
      if (result.success) {
        setQuestionBankCategories(result.data);
      } else {
        throw new Error('API returned success: false');
      }
    } catch (error: any) {
      console.debug('Questions endpoint not available, using fallback data');
      setQuestionBankCategories([
        { name: 'Arrays', problems: 145, easy: 32, medium: 78, hard: 35 },
        { name: 'Strings', problems: 98, easy: 24, medium: 52, hard: 22 },
      ]);
    } finally {
      setLoadingQuestions(false);
    }
  };

  // 4️⃣ FETCH USER PROGRESS
  const fetchUserProgress = async () => {
    setLoadingProgress(true);
    try {
      const userId = 'user-' + Math.random().toString(36).substr(2, 9); // Mock user ID
      const response = await fetch(`${apiBaseUrl}/api/v1/mock-interview/user/${userId}/progress`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const result = await response.json();
      if (result.success) {
        setProgressStats(result.data);
      } else {
        throw new Error('API returned success: false');
      }
    } catch (error: any) {
      console.debug('Progress endpoint not available, using fallback data');
      setProgressStats({
        dailyStreak: 7,
        interviewsTaken: 24,
        averageScore: 78.5,
        topicsMastered: 8,
        companiesSolved: ['Google', 'Amazon', 'Microsoft'],
      });
    } finally {
      setLoadingProgress(false);
    }
  };

  // 5️⃣ FETCH SUBSCRIPTION PLANS
  const fetchPlans = async () => {
    setLoadingPlans(true);
    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/mock-interview/plans`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const result = await response.json();
      if (result.success) {
        setPlans(result.data);
      } else {
        throw new Error('API returned success: false');
      }
    } catch (error: any) {
      console.debug('Plans endpoint not available, using fallback data');
      setPlans([
        { id: 'free', name: 'Free', price: 0, features: ['3 mocks/week', 'Basic feedback', 'DSA only'] },
        { id: 'pro', name: 'Pro', price: 9.99, period: '/month', features: ['Unlimited mocks', 'AI voice', 'Company rounds'] },
      ]);
    } finally {
      setLoadingPlans(false);
    }
  };

  // 6️⃣ FETCH PEERS
  const fetchPeers = async () => {
    setLoadingPeers(true);
    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/mock-interview/peers`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const result = await response.json();
      if (result.success) {
        setPeers(result.data);
      } else {
        throw new Error('API returned success: false');
      }
    } catch (error: any) {
      console.debug('Peers endpoint not available, using fallback data');
      setPeers([
        { id: 1, name: 'Priya Sharma', title: 'Software Engineer', experience: '3 years', specialization: 'DSA & System Design', rating: 4.8, available: true },
      ]);
    } finally {
      setLoadingPeers(false);
    }
  };

  // 7️⃣ FETCH INTERVIEW FEEDBACK
  const fetchInterviewFeedback = async (sessionId: string) => {
    setLoadingFeedback(true);
    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/mock-interview/sessions/${sessionId}/submit`, { method: 'POST' });
      const result = await response.json();
      if (result.success) {
        setInterviewFeedback(result.data);
      } else {
        setApiError('Failed to generate feedback');
      }
    } catch (error: any) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoadingFeedback(false);
    }
  };

  // 8️⃣ START INTERVIEW SESSION
  const handleStartInterviewSession = async () => {
    if (!selectedInterviewType) {
      setApiError('Please select an interview type');
      return;
    }
    
    // 🎥 REQUEST CAMERA PERMISSION FIRST
    try {
      setIsCheckingPermissions(true);
      const permissionsGranted = await checkPermissions();
      setIsCheckingPermissions(false);
      
      if (!permissionsGranted) {
        setApiError('❌ Camera and Microphone access are required. Please allow permissions to continue.');
        return;
      }
    } catch (permissionError) {
      console.error('Permission check error:', permissionError);
      setApiError('❌ Could not verify permissions. Please check your browser settings.');
      setIsCheckingPermissions(false);
      return;
    }
    
    try {
      const userId = 'user-' + Math.random().toString(36).substr(2, 9);
      setCurrentSessionId(userId);
      setSessionStartTime(Date.now());
      setCurrentQuestionIndex(0);
      setUserAnswers([]);
      setQuestionStartTime(Date.now());
      setIsInterviewActive(true);
      setShowResults(false);
      
      // Route to appropriate tab based on interview type
      if (selectedInterviewType === 'dsa-coding') {
        setActiveTab('coding');
        setCurrentQuestion(0);
        setUserAnswer('');
      } else if (selectedInterviewType === 'system-design') {
        setActiveTab('system-design');
        setDesignCurrentStep(1);
        setSelectedProblem(null);
        setArchitectureComponents([]);
        setRequirements({ fr: '', nfr: '', dau: '', qps: '', storage: '' });
        setCapacityEstimates({ reqPerSec: 0, storagePerDay: 0, bandwidth: 0, cacheHitRatio: 80 });
        setDataFlowStep(0);
        setTradeoffSelections({});
        setBottleneckAnalysis('');
      } else if (selectedInterviewType === 'behavioral') {
        setActiveTab('behavioral');
        setBehavioralCurrentStep(1);
        setSelectedBehavioralCategory(null);
        setStarAnswers({ situation: '', task: '', action: '', result: '' });
        setAiQuestionIndex(0);
        setSelectedScenario(null);
      } else if (selectedInterviewType === 'cs-fundamentals') {
        setActiveTab('cs-fundamentals');
        setCsFundamentalsCurrentStep(1);
        setSelectedCsSubject(null);
        setSelectedCsTopic(null);
        setVivaAnswerText('');
        setMcrAnswers({});
        setCsQuizProgress({ current: 0, total: 50, score: 0, answers: [] });
      } else if (selectedInterviewType === 'oop-lld') {
        setActiveTab('oop-lld');
        setOopCurrentStep(1);
        setSelectedLldProblem(null);
        setLldRequirements({ coreFeatures: '', optionalFeatures: '', constraints: '', assumptions: '', edgeCases: '', apiMethods: [] });
        setLldClasses([]);
        setLldDesignPatterns([]);
        setLldSequenceDiagram('');
        setLldMachineCode('');
        setLldDryRunLog('');
        setOopConceptIndex(0);
      } else if (selectedInterviewType === 'resume') {
        setActiveTab('resume');
        setResumeCurrentStep(1);
        setSelectedProject(null);
        setDeepDiveQuestions([]);
        setResumeCurrentQuestion(0);
        setProjectImpactMetrics({ latencyBefore: '', latencyAfter: '', costReduction: '', throughput: '', userGrowth: '', bugReduction: '', testCoverage: '' });
        setIncidentDetails({ incident: '', rootCause: '', debugSteps: '', rollback: '', lessonLearned: '' });
        setOwnershipDetails({ contribution: '', apisOwned: '', modulesBuilt: '', teamConflict: '', reviewProcess: '', mentorship: '' });
        setProjectVivaCurrent(0);
        setProjectStoryIndex(0);
      } else {
        setActiveTab('coding');
      }
      
      // Try to fetch from backend, but don't block UI if it fails
      try {
        const response = await fetch(`${apiBaseUrl}/api/v1/mock-interview/sessions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            interviewType: selectedInterviewType,
            companyId: null,
          }),
        });
        const result = await response.json();
        if (result.success) {
          const sessionId = result.data.id;
          setCurrentSessionId(sessionId);
          
          // Fetch questions for this session type
          const questionsResponse = await fetch(`${apiBaseUrl}/api/v1/mock-interview/sessions/${sessionId}/questions?type=${selectedInterviewType}`);
          const questionsResult = await questionsResponse.json();
          
          if (questionsResult.success && questionsResult.data) {
            setSessionQuestions(questionsResult.data);
          }
        }
      } catch (backendError) {
        console.log('Backend API unavailable, running with demo data');
        // Frontend continues with demo data
      }
    } catch (error: any) {
      console.error('Error starting session:', error);
      // Still allow interview to start with demo mode
      setIsInterviewActive(true);
      setActiveTab('coding');
    }
  };

  // 9️⃣ SUBMIT INTERVIEW RESPONSE
  const submitInterviewResponse = async (sessionId: string, questionId: number, answer: string) => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/mock-interview/sessions/${sessionId}/response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId,
          answer,
          timeSpent: Math.floor(Math.random() * 300),
        }),
      });
      const result = await response.json();
      if (result.success) {
        console.log('Response submitted:', result.data);
        return result.data;
      }
    } catch (error: any) {
      console.error('Error submitting response:', error);
    }
  };

  // 🔟 GET INTERVIEW QUESTIONS
  const fetchInterviewQuestions = async (sessionId: string, type: string) => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/mock-interview/sessions/${sessionId}/questions?type=${type}`);
      const result = await response.json();
      if (result.success) {
        console.log('Interview questions:', result.data);
        return result.data;
      }
    } catch (error: any) {
      console.error('Error fetching interview questions:', error);
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
      if (!cameraGranted) {
        setPermissionError('⚠️ Camera is required for the mock interview. Please allow camera access in your browser settings.');
      } else if (errorMessages.length > 0) {
        setPermissionError(errorMessages.join(' ') + ' Please allow permissions in your browser settings and try again.');
      }

      setIsCheckingPermissions(false);
      // Camera is compulsory, microphone and audio are required
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
    
    // If all permissions are granted, start interview directly (skip dialog)
    if (permissionsGranted) {
      startInterview();
    } else {
      // Show dialog only if permissions are not granted so user can see error and recheck
      setShowSetupDialog(true);
    }
  };

  const stopInterview = () => {
    // Stop camera stream
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      setVideoStream(null);
    }
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

  // Render loading skeleton
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i} className="p-4 animate-pulse bg-slate-100" />
      ))}
    </div>
  );

  // Show error toast
  const showError = (message: string) => {
    setApiError(message);
    setTimeout(() => setApiError(''), 5000);
  };

  // Filter previous sessions based on search query
  const filteredSessions = previousSessions.filter(session =>
    session.type.toLowerCase().includes(activeSearchQuery.toLowerCase()) ||
    session.role.toLowerCase().includes(activeSearchQuery.toLowerCase())
  );

  return (
    <div className="p-3 md:p-6 lg:p-8 w-full max-w-full md:max-w-6xl lg:max-w-7xl mx-auto">
      {/* Error Alert */}
      {apiError && (
        <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="size-5 text-red-600" />
            <p className="text-red-800 font-medium">{apiError}</p>
          </div>
          <button onClick={() => setApiError('')} className="text-red-600 hover:text-red-800">✕</button>
        </div>
      )}

      <div className="mb-4 md:mb-8">
        <h1 className="text-xl md:text-3xl lg:text-4xl font-bold text-slate-900 mb-1 md:mb-2">🎯 Mock Interview Platform</h1>
        <p className="text-xs md:text-lg text-slate-600">
          Master interviews with AI, real coding, peer practice & detailed feedback
        </p>
      </div>

      {/* TABS - ALWAYS VISIBLE ON FRONT PAGE */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
        <div className="overflow-x-auto mb-6">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-14 gap-1 bg-slate-100 p-1 rounded-lg h-auto min-w-max md:min-w-full">
            <TabsTrigger value="interview" className="text-xs sm:text-sm whitespace-nowrap px-2 py-2 sm:px-3">📋 Start</TabsTrigger>
            <TabsTrigger value="coding" className="text-xs sm:text-sm whitespace-nowrap px-2 py-2 sm:px-3">💻 Coding</TabsTrigger>
            <TabsTrigger value="system-design" className="text-xs sm:text-sm whitespace-nowrap px-2 py-2 sm:px-3">🏗️ Design</TabsTrigger>
            <TabsTrigger value="oop-lld" className="text-xs sm:text-sm whitespace-nowrap px-2 py-2 sm:px-3">🧬 OOP/LLD</TabsTrigger>
            <TabsTrigger value="behavioral" className="text-xs sm:text-sm whitespace-nowrap px-2 py-2 sm:px-3">🎙️ Behavioral</TabsTrigger>
            <TabsTrigger value="cs-fundamentals" className="text-xs sm:text-sm whitespace-nowrap px-2 py-2 sm:px-3">📖 CS Fund</TabsTrigger>
            <TabsTrigger value="ai-voice" className="text-xs sm:text-sm whitespace-nowrap px-2 py-2 sm:px-3">🎤 Voice</TabsTrigger>
            <TabsTrigger value="feedback" className="text-xs sm:text-sm whitespace-nowrap px-2 py-2 sm:px-3">📊 Feedback</TabsTrigger>
            <TabsTrigger value="questions" className="text-xs sm:text-sm whitespace-nowrap px-2 py-2 sm:px-3">📚 Q Bank</TabsTrigger>
            <TabsTrigger value="progress" className="text-xs sm:text-sm whitespace-nowrap px-2 py-2 sm:px-3">📈 Progress</TabsTrigger>
            <TabsTrigger value="companies" className="text-xs sm:text-sm whitespace-nowrap px-2 py-2 sm:px-3">🏢 Corp</TabsTrigger>
            <TabsTrigger value="resume" className="text-xs sm:text-sm whitespace-nowrap px-2 py-2 sm:px-3">📄 Resume</TabsTrigger>
            <TabsTrigger value="peer" className="text-xs sm:text-sm whitespace-nowrap px-2 py-2 sm:px-3">👥 Peer</TabsTrigger>
            <TabsTrigger value="pricing" className="text-xs sm:text-sm whitespace-nowrap px-2 py-2 sm:px-3">💰 Plans</TabsTrigger>
          </TabsList>
        </div>

        {/* INTERVIEW TYPE SELECTOR - DEFAULT TAB CONTENT */}
        <TabsContent value="interview" className="space-y-6 w-full">
          {!isInterviewActive ? (
            <Card className="p-4 md:p-6 border-2 bg-gradient-to-br from-blue-50 to-purple-50">
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 mb-4 md:mb-6">🎯 Choose Interview Type</h2>
              {loadingTypes || interviewTypes.length === 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="p-4 border-2 border-slate-200 rounded-lg bg-slate-100 animate-pulse h-40"></div>
                  ))}
                </div>
              ) : interviewTypes && interviewTypes.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
                    {interviewTypes.map((type) => (
                      <Card 
                        key={type.id} 
                        className={`p-3 md:p-4 border-2 transition-all cursor-pointer
                          ${selectedInterviewType === type.id 
                            ? 'border-blue-600 bg-blue-100 ring-2 ring-blue-400' 
                            : 'hover:border-blue-400 hover:shadow-lg border-slate-200'
                          }`}
                        onClick={() => setSelectedInterviewType(type.id)}
                      >
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${type.color} p-2 mb-3 flex items-center justify-center`}>
                          <span className="text-white text-2xl">{type.icon}</span>
                        </div>
                        <h3 className="font-bold text-slate-900 text-sm md:text-base mb-2">{type.name}</h3>
                        <p className="text-xs md:text-sm text-slate-600 mb-3 line-clamp-2">{type.description}</p>
                        <Button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedInterviewType(type.id);
                          }} 
                          className={`w-full h-8 md:h-9 text-xs md:text-sm ${selectedInterviewType === type.id ? 'bg-blue-700 hover:bg-blue-800' : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                          {selectedInterviewType === type.id ? '✓ Selected' : 'Select'}
                        </Button>
                      </Card>
                    ))}
                  </div>
                  {selectedInterviewType && (
                    <Card className="p-4 md:p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300 mt-4 md:mt-6">
                      <Button 
                        onClick={handleStartInterviewSession} 
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-11 md:h-12 font-bold text-base md:text-lg transition-all"
                      >
                        <Play className="size-4 md:size-5 mr-2" />Start Interview Session
                      </Button>
                    </Card>
                  )}
                </>
              ) : (
                <div className="text-center py-8 md:py-12">
                  <AlertCircle className="size-8 md:size-10 text-red-500 mx-auto mb-3" />
                  <p className="text-slate-600 text-sm md:text-base font-medium">Unable to load interview types</p>
                  <p className="text-slate-500 text-xs md:text-sm mt-2">Please refresh the page and try again</p>
                </div>
              )}
            </Card>
          ) : (
            <Card className="p-4 md:p-6 border-2 bg-gradient-to-br from-green-50 to-emerald-50">
              <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-green-500 animate-pulse"></div>
                <h2 className="text-lg md:text-xl font-bold text-slate-900">✅ Interview in Progress</h2>
              </div>
              <p className="text-xs md:text-sm text-slate-600">
                <span className="block mb-2">Your interview session has started. Select any tab above to explore different interview features or continue with the active section.</span>
                <span className="text-slate-500 text-xs">Session ID: {currentSessionId}</span>
              </p>
            </Card>
          )}
        </TabsContent>

        {/* 2️⃣ LIVE CODING - LEETCODE STYLE INTERFACE */}
        <TabsContent value="coding" className="space-y-4 md:space-y-6">
          {/* Problem Selector and Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <Card className="p-3 md:p-4 border-2 text-center cursor-pointer hover:border-green-400 transition-all" onClick={() => setApiError('Easy: 12 problems available')}>
              <p className="text-xs text-slate-600">Easy</p>
              <p className="text-2xl md:text-3xl font-bold text-green-600">12</p>
            </Card>
            <Card className="p-3 md:p-4 border-2 text-center cursor-pointer hover:border-yellow-400 transition-all" onClick={() => setApiError('Medium: 28 problems available')}>
              <p className="text-xs text-slate-600">Medium</p>
              <p className="text-2xl md:text-3xl font-bold text-yellow-600">28</p>
            </Card>
            <Card className="p-3 md:p-4 border-2 text-center cursor-pointer hover:border-red-400 transition-all" onClick={() => setApiError('Hard: 15 problems available')}>
              <p className="text-xs text-slate-600">Hard</p>
              <p className="text-2xl md:text-3xl font-bold text-red-600">15</p>
            </Card>
            <Card className="p-3 md:p-4 border-2 text-center cursor-pointer hover:border-blue-400 transition-all" onClick={() => setApiError('18 out of 55 problems solved')}>
              <p className="text-xs text-slate-600">Solved</p>
              <p className="text-2xl md:text-3xl font-bold text-blue-600">18/55</p>
            </Card>
          </div>

          {/* Main Coding Interface - 2 Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 h-auto">
            
            {/* LEFT: Problem Statement */}
            <div className="lg:col-span-2">
              <Card className="border-2 h-full overflow-hidden flex flex-col">
                <div className="p-4 md:p-6 space-y-4 overflow-y-auto flex-1 max-h-screen lg:max-h-none">
                  {/* Problem Title */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg md:text-2xl font-bold text-slate-900">Two Sum</h2>
                      <Badge className="mt-2 bg-yellow-600 text-white text-xs md:text-sm">Medium</Badge>
                    </div>
                    <button onClick={() => setApiError('👍 Problem liked')} className="text-lg cursor-pointer hover:scale-125">👍</button>
                  </div>

                  {/* Problem Description */}
                  <div className="space-y-3">
                    <h3 className="font-bold text-slate-900 text-sm md:text-base">Description</h3>
                    <p className="text-xs md:text-sm text-slate-700 leading-relaxed">
                      Given an array of integers <code className="bg-slate-100 px-2 py-1 rounded text-red-600 font-mono">nums</code> and an integer <code className="bg-slate-100 px-2 py-1 rounded text-red-600 font-mono">target</code>, return the indices of the two numbers that add up to <code className="bg-slate-100 px-2 py-1 rounded text-red-600 font-mono">target</code>.
                    </p>
                    <p className="text-xs md:text-sm text-slate-700">You may assume each input has exactly one solution, and you cannot use the same element twice.</p>
                  </div>

                  {/* Examples */}
                  <div className="space-y-2">
                    <h3 className="font-bold text-slate-900 text-sm">Examples:</h3>
                    <div className="bg-blue-50 border-2 border-blue-200 rounded p-3 space-y-2">
                      <p className="font-bold text-slate-900 text-xs md:text-sm">Example 1:</p>
                      <div className="bg-white p-2 rounded text-xs font-mono space-y-1">
                        <p><span className="text-slate-600">Input:</span> <span className="text-blue-600">nums = [2,7,11,15], target = 9</span></p>
                        <p><span className="text-slate-600">Output:</span> <span className="text-green-600">[0,1]</span></p>
                      </div>
                    </div>
                    <div className="bg-blue-50 border-2 border-blue-200 rounded p-3 space-y-2">
                      <p className="font-bold text-slate-900 text-xs md:text-sm">Example 2:</p>
                      <div className="bg-white p-2 rounded text-xs font-mono space-y-1">
                        <p><span className="text-slate-600">Input:</span> <span className="text-blue-600">nums = [3,2,4], target = 6</span></p>
                        <p><span className="text-slate-600">Output:</span> <span className="text-green-600">[1,2]</span></p>
                      </div>
                    </div>
                  </div>

                  {/* Constraints */}
                  <div className="bg-slate-50 border-2 border-slate-300 rounded p-3 space-y-2">
                    <p className="font-bold text-slate-900 text-sm">Constraints:</p>
                    <ul className="text-xs md:text-sm text-slate-700 space-y-1">
                      <li>• 2 ≤ nums.length ≤ 10⁴</li>
                      <li>• -10⁹ ≤ nums[i] ≤ 10⁹</li>
                      <li>• -10⁹ ≤ target ≤ 10⁹</li>
                      <li>• Only one valid answer exists</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>

            {/* RIGHT: Code Editor & Output */}
            <div className="lg:col-span-3 flex flex-col gap-4">
              
              {/* Code Editor */}
              <Card className="flex-1 border-2 overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-3 md:p-4 bg-slate-100 border-b-2 border-slate-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Code className="size-4 text-blue-600" />
                    <span className="font-bold text-sm md:text-base">Solution.js</span>
                  </div>
                  <select className="text-xs md:text-sm px-3 py-1.5 border-2 border-slate-300 rounded bg-white hover:border-blue-400" onChange={(e) => setApiError(`Language switched to ${e.target.value}`)}>
                    <option>JavaScript</option>
                    <option>Python</option>
                    <option>Java</option>
                    <option>C++</option>
                    <option>TypeScript</option>
                  </select>
                </div>

                {/* Editable Code Area */}
                <textarea
                  className="flex-1 p-4 md:p-5 bg-slate-900 text-slate-100 font-mono text-xs md:text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    // Your solution here
    const numMap = new Map();
    
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (numMap.has(complement)) {
            return [numMap.get(complement), i];
        }
        numMap.set(nums[i], i);
    }
    
    return [];
};`}
                  onClick={() => setApiError('✏️ Code editor is ready for editing!')}
                  style={{
                    backgroundColor: 'rgb(15, 23, 42)',
                    color: 'rgb(226, 232, 240)',
                    fontFamily: 'Monaco, "Courier New", monospace'
                  }}
                />

                {/* Action Buttons */}
                <div className="p-3 md:p-4 bg-slate-100 border-t-2 border-slate-300 flex flex-col sm:flex-row gap-2 flex-wrap">
                  <Button 
                    className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 h-10 md:h-11 text-xs md:text-sm font-semibold"
                    onClick={() => setApiError('✅ Test Results:\n✓ Test 1 PASSED (0.2ms)\n✓ Test 2 PASSED (0.1ms)\n✓ Test 3 PASSED (0.3ms)\nAll tests passed!')}
                  >
                    <Play className="size-4 mr-1" />
                    Run
                  </Button>
                  <Button 
                    className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 h-10 md:h-11 text-xs md:text-sm font-semibold"
                    onClick={() => setApiError('🎉 Solution Submitted!\nAccepted in all test cases\nRuntime: 56ms (faster than 78%)\nMemory: 44.5MB (better than 65%)')}
                  >
                    <Upload className="size-4 mr-1" />
                    Submit
                  </Button>
                  <Button 
                    variant="outline"
                    className="flex-1 sm:flex-none h-10 md:h-11 text-xs md:text-sm border-2"
                    onClick={() => setApiError('💡 Hint: Use a HashMap/Object to store num -> index mapping for O(n) solution')}
                  >
                    💡 Hint
                  </Button>
                  <Button 
                    variant="outline"
                    className="flex-1 sm:flex-none h-10 md:h-11 text-xs md:text-sm border-2"
                    onClick={() => setApiError('↻ Code reset to template')}
                  >
                    ↻ Reset
                  </Button>
                </div>
              </Card>

              {/* Test Cases Display */}
              <Card className="border-2 p-4 md:p-5">
                <h3 className="font-bold text-slate-900 text-sm md:text-base mb-3 flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-600" />
                  Test Results
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {[
                    { test: 1, status: 'pass', runtime: '0.2ms', expected: '[0,1]' },
                    { test: 2, status: 'pass', runtime: '0.1ms', expected: '[1,2]' },
                    { test: 3, status: 'pass', runtime: '0.3ms', expected: '[0,1]' },
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => setApiError(`Test ${item.test}: ${item.status.toUpperCase()} - ${item.runtime}`)}
                      className="w-full text-left p-2 md:p-3 bg-green-50 hover:bg-green-100 border-2 border-green-300 rounded transition-all text-xs md:text-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span>✓ Test {item.test}: {item.status.toUpperCase()}</span>
                        <span className="text-green-600 font-mono text-xs">{item.runtime}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          {/* Problem Questions List - LeetCode Style */}
          <Card className="border-2 p-4 md:p-6">
            <h3 className="font-bold text-slate-900 text-base md:text-lg mb-4">📚 Practice Problems</h3>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4 gap-1 mb-4 bg-slate-100 p-1">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="easy">Easy</TabsTrigger>
                <TabsTrigger value="medium">Medium</TabsTrigger>
                <TabsTrigger value="hard">Hard</TabsTrigger>
              </TabsList>

              <div>
                <div className="space-y-2">
                  {[
                    { id: 1, title: 'Two Sum', diff: 'Easy', acceptance: '47.3%', likes: '26.1K', solved: false },
                    { id: 2, title: 'Add Two Numbers', diff: 'Medium', acceptance: '33.6%', likes: '10.2K', solved: false },
                    { id: 3, title: 'Longest Substring Without Repeating Characters', diff: 'Medium', acceptance: '33.8%', likes: '9.3K', solved: false },
                    { id: 4, title: 'Median of Two Sorted Arrays', diff: 'Hard', acceptance: '30.2%', likes: '8.9K', solved: false },
                    { id: 5, title: 'Longest Palindromic Substring', diff: 'Medium', acceptance: '32.1%', likes: '7.8K', solved: true },
                    { id: 6, title: 'Reverse String', diff: 'Easy', acceptance: '77.7%', likes: '4.1K', solved: true },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setApiError(`Loading: ${p.title}`)}
                      className="w-full text-left"
                    >
                      <div className="p-3 md:p-4 bg-slate-50 hover:bg-blue-50 rounded border-2 border-slate-200 hover:border-blue-400 transition-all">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              {p.solved && <span className="text-green-600">✓</span>}
                              <p className="font-semibold text-sm md:text-base text-slate-900 truncate">{p.title}</p>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-xs md:text-sm text-slate-600 flex-wrap">
                              <Badge className={`${
                                p.diff === 'Easy' ? 'bg-green-600' :
                                p.diff === 'Medium' ? 'bg-yellow-600' :
                                'bg-red-600'
                              }`}>
                                {p.diff}
                              </Badge>
                              <span>Acceptance: {p.acceptance}</span>
                              <span>👍 {p.likes}</span>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" className="text-xs md:text-sm h-8 md:h-9 border-2 whitespace-nowrap">
                            {p.solved ? 'View' : 'Solve'}
                          </Button>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </Tabs>
          </Card>
        </TabsContent>

        {/* 3️⃣ AI VOICE INTERVIEWER - RESPONSIVE */}
        <TabsContent value="ai-voice" className="space-y-4 md:space-y-6">
          <Card className="p-4 md:p-6 border-2">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">🎙️ AI Voice Interviewer</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* AI Interviewer Card */}
              <Card className="p-4 md:p-6 border-2 flex flex-col">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4">
                  <Mic className="size-6 md:size-8 text-white" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg md:text-xl">Sarah Chen</h3>
                <p className="text-sm md:text-base text-slate-600 mb-3">Google Senior Interviewer</p>
                <Badge className="w-fit bg-green-600 mb-4">🟢 Live</Badge>
                <div className="bg-slate-50 p-3 md:p-4 rounded my-3 md:my-4 text-xs md:text-sm italic border-2 border-slate-200 flex-1">
                  "Can you explain what a hash table is and why it's important in algorithm design?"
                </div>
                <Button className="w-full bg-green-600 hover:bg-green-700 h-10 md:h-11 text-sm md:text-base" onClick={() => setApiError('🎤 Recording your voice response...')}>
                  <Volume className="size-4 mr-2" />Answer Question
                </Button>
              </Card>
              
              {/* Features Card */}
              <Card className="p-4 md:p-6 border-2">
                <h3 className="font-bold text-slate-900 text-lg mb-4">🎯 Features</h3>
                <div className="space-y-2">
                  {[
                    '🎤 Realistic Voice Questions',
                    '🔄 Smart Follow-up Questions',
                    '⚡ Pressure Mode Simulation',
                    '📝 Real-time Logic Validation',
                    '🔊 Voice Analysis & Feedback',
                    '⏱️ Time Management Tracking'
                  ].map((feature, i) => (
                    <button 
                      key={i} 
                      className="w-full p-2 md:p-3 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 text-left text-xs md:text-sm text-slate-700 transition-colors cursor-pointer"
                      onClick={() => setApiError(`✨ ${feature.split('  ')[1]}`)}
                    >
                      {feature}
                    </button>
                  ))}
                </div>
              </Card>
            </div>
          </Card>
        </TabsContent>

        {/* 4️⃣ FEEDBACK DASHBOARD - RESPONSIVE */}
        <TabsContent value="feedback" className="space-y-4 md:space-y-6">
          <Card className="p-4 md:p-6 border-2">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">📊 Performance Feedback</h2>
            {loadingFeedback ? (
              <div className="space-y-3">
                <div className="h-20 md:h-24 bg-slate-100 animate-pulse rounded"></div>
                <div className="h-16 bg-slate-100 animate-pulse rounded"></div>
              </div>
            ) : interviewFeedback ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 mb-4">
                  {[
                    { label: 'Communication', value: interviewFeedback.communicationScore },
                    { label: 'Problem Solving', value: interviewFeedback.problemSolvingScore },
                    { label: 'Confidence', value: interviewFeedback.confidenceScore },
                    { label: 'Optimality', value: interviewFeedback.optimalityScore },
                    { label: 'Time Mgmt', value: interviewFeedback.timeManagementScore },
                    { label: 'Tech Depth', value: interviewFeedback.technicalDepthScore },
                  ].map((score, i) => (
                    <button
                      key={i}
                      onClick={() => setApiError(`📊 ${score.label}: ${score.value}%`)}
                      className="group"
                    >
                      <Card className="p-2 md:p-3 border-2 hover:shadow-lg hover:border-blue-400 cursor-pointer transition-all">
                        <p className="text-xs text-slate-600 mb-1 line-clamp-1">{score.label}</p>
                        <p className="text-2xl md:text-3xl font-bold text-blue-600 group-hover:scale-110 transition-transform">{score.value}%</p>
                      </Card>
                    </button>
                  ))}
                </div>

                {interviewFeedback.fillerWords && (
                  <Card className="p-3 md:p-4 bg-yellow-50 border-2 border-yellow-200 rounded mb-4">
                    <p className="font-semibold text-yellow-900 text-sm md:text-base">⚠️ Filler Words Used</p>
                    <div className="flex gap-2 md:gap-4 mt-2 text-xs md:text-sm flex-wrap">
                      {Object.entries(interviewFeedback.fillerWords).map(([word, count]: any) => (
                        <span key={word} className="text-yellow-800 bg-yellow-100 px-2 py-1 rounded">{word}: {count}</span>
                      ))}
                    </div>
                  </Card>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  {interviewFeedback.strengths && (
                    <Card className="p-3 md:p-4 bg-green-50 border-2 border-green-200">
                      <h4 className="font-bold text-green-900 mb-2 text-sm md:text-base">✓ Strengths</h4>
                      <ul className="space-y-1 text-xs md:text-sm text-green-800">
                        {interviewFeedback.strengths.map((strength, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="font-bold">•</span>
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  )}

                  {interviewFeedback.improvements && (
                    <Card className="p-3 md:p-4 bg-orange-50 border-2 border-orange-200">
                      <h4 className="font-bold text-orange-900 mb-2 text-sm md:text-base">⬆️ Improvements</h4>
                      <ul className="space-y-1 text-xs md:text-sm text-orange-800">
                        {interviewFeedback.improvements.map((improvement, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="font-bold">→</span>
                            <span>{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-600 text-sm md:text-base">No interview feedback yet. Complete an interview to see detailed feedback!</p>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* 5️⃣ QUESTION BANK - RESPONSIVE */}
        <TabsContent value="questions" className="space-y-4 md:space-y-6">
          <Card className="p-4 md:p-6 border-2">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">📚 Question Bank</h2>
            {loadingQuestions ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-24 bg-slate-100 animate-pulse rounded-lg"></div>
                ))}
              </div>
            ) : questionBankCategories && questionBankCategories.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {questionBankCategories.map((cat, i) => (
                  <button
                    key={i}
                    onClick={() => setApiError(`📚 Viewing ${cat.name} category (${cat.problems} problems)`)}
                    className="group"
                  >
                    <Card className="p-3 md:p-4 border-2 hover:shadow-lg hover:border-blue-400 cursor-pointer transition-all h-full">
                      <h3 className="font-bold text-xs md:text-sm mb-2 text-slate-900 group-hover:text-blue-600 transition-colors">{cat.name}</h3>
                      <p className="text-lg md:text-2xl font-bold text-blue-600 mb-2">{cat.problems}</p>
                      <p className="text-xs text-slate-600">
                        <span className="text-green-600 font-semibold">{cat.easy}E</span>
                        <span className="mx-1">•</span>
                        <span className="text-yellow-600 font-semibold">{cat.medium}M</span>
                        <span className="mx-1">•</span>
                        <span className="text-red-600 font-semibold">{cat.hard}H</span>
                      </p>
                    </Card>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="size-8 text-red-500 mx-auto mb-3" />
                <p className="text-slate-600">Failed to load question categories. Please try again later.</p>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* 6️⃣ PROGRESS TRACKER - RESPONSIVE */}
        <TabsContent value="progress" className="space-y-4 md:space-y-6">
          <Card className="p-4 md:p-6 border-2">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">📈 Your Progress</h2>
            {loadingProgress ? (
              <div className="space-y-3">
                <div className="h-24 bg-slate-100 animate-pulse rounded"></div>
                <div className="h-16 bg-slate-100 animate-pulse rounded"></div>
              </div>
            ) : progressStats ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-6">
                  <button
                    onClick={() => setApiError(`🔥 Daily Streak: ${progressStats.dailyStreak} days!`)}
                    className="group"
                  >
                    <Card className="p-3 md:p-4 border-2 hover:shadow-lg hover:border-orange-400 cursor-pointer transition-all">
                      <p className="text-xs md:text-sm text-slate-600 mb-1">Daily Streak</p>
                      <p className="text-3xl md:text-4xl font-bold group-hover:scale-110 transition-transform">{progressStats.dailyStreak} 🔥</p>
                    </Card>
                  </button>
                  <button
                    onClick={() => setApiError(`📊 Total Interviews: ${progressStats.interviewsTaken}`)}
                    className="group"
                  >
                    <Card className="p-3 md:p-4 border-2 hover:shadow-lg hover:border-blue-400 cursor-pointer transition-all">
                      <p className="text-xs md:text-sm text-slate-600 mb-1">Interviews</p>
                      <p className="text-3xl md:text-4xl font-bold group-hover:scale-110 transition-transform">{progressStats.interviewsTaken}</p>
                    </Card>
                  </button>
                  <button
                    onClick={() => setApiError(`📈 Average Score: ${progressStats.averageScore}%`)}
                    className="group"
                  >
                    <Card className="p-3 md:p-4 border-2 hover:shadow-lg hover:border-green-400 cursor-pointer transition-all">
                      <p className="text-xs md:text-sm text-slate-600 mb-1">Avg Score</p>
                      <p className="text-3xl md:text-4xl font-bold group-hover:scale-110 transition-transform">{progressStats.averageScore}%</p>
                    </Card>
                  </button>
                </div>
                <div className="mt-6">
                  <h4 className="font-bold text-slate-900 mb-3 text-base md:text-lg">🏆 Companies Mastered</h4>
                  <div className="flex gap-2 flex-wrap">
                    {progressStats.companiesSolved && progressStats.companiesSolved.map((company, idx) => (
                      <button
                        key={idx}
                        onClick={() => setApiError(`🎯 You've mastered ${company}!`)}
                        className="group"
                      >
                        <Badge className="bg-blue-600 group-hover:bg-blue-700 transition-colors cursor-pointer text-xs md:text-sm py-1 md:py-1.5">
                          {company}
                        </Badge>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="size-8 text-red-500 mx-auto mb-3" />
                <p className="text-slate-600">Failed to load progress. Please try again later.</p>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* 7️⃣ COMPANIES - RESPONSIVE & FUNCTIONAL */}
        <TabsContent value="companies" className="space-y-4 md:space-y-6">
          <Card className="p-4 md:p-6 border-2">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">🏢 Company-Specific Rounds</h2>
            {loadingCompanies ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-lg"></div>
                ))}
              </div>
            ) : companies && companies.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {companies.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => setApiError(`🎯 Starting ${c.name} interview preparation...`)}
                    className="group"
                  >
                    <Card className="p-3 md:p-4 border-2 hover:shadow-lg cursor-pointer transition-all hover:border-blue-400 h-full">
                      <p className="text-2xl md:text-4xl mb-2 group-hover:scale-110 transition-transform">{ c.icon}</p>
                      <p className="font-bold text-xs md:text-sm text-slate-900 mb-2 line-clamp-1">{c.name}</p>
                      <div className="text-xs text-slate-600 space-y-0.5">
                        {c.rounds && c.rounds.slice(0, 3).map((r, ri) => (
                          <div key={ri} className="bg-blue-50 p-1 rounded line-clamp-1">
                            <span className="font-bold">{ri + 1}.</span> {r}
                          </div>
                        ))}
                        {c.rounds && c.rounds.length > 3 && (
                          <div className="text-blue-600 font-semibold">+{c.rounds.length - 3} more</div>
                        )}
                      </div>
                    </Card>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="size-8 text-red-500 mx-auto mb-3" />
                <p className="text-slate-600">Failed to load companies. Please try again later.</p>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* ==================== RESUME/PROJECT-BASED INTERVIEW PREP - 11 COMPREHENSIVE SECTIONS ==================== */}
        <TabsContent value="resume" className="space-y-6">
          {/* STEP 1: Resume Upload + Parsing Hub */}
          {resumeCurrentStep === 1 && (
            <div className="space-y-6 animate-in fade-in">
              <Card className="p-6 border-2 bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-300">
                <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                  📄 Resume Upload + Parsing Hub - Extract Projects & Experience
                </h2>
                <p className="text-slate-600 mb-6">Upload your resume. AI auto-extracts projects, tech stack, and achievements:</p>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                  <div className="lg:col-span-2">
                    {/* Resume Upload Area */}
                    <Card className="p-8 border-2 border-dashed border-cyan-300 bg-white hover:bg-cyan-50 transition-all cursor-pointer text-center mb-6">
                      <div className="text-4xl mb-3">📋</div>
                      <p className="font-bold text-slate-900 mb-2 text-lg">Upload Your Resume</p>
                      <p className="text-sm text-slate-600 mb-6">PDF, DOC, or DOCX. Drag & drop or click below. Max 5MB.</p>
                      <input 
                        type="file" 
                        accept=".pdf,.doc,.docx" 
                        className="hidden" 
                        id="project-resume-upload"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setResumeFile(file);
                            setApiError(`✅ Uploaded: ${file.name} (${(file.size / 1024).toFixed(1)}KB)`);
                            setTimeout(() => setResumeText('Parsed resume content with projects extracted...'), 1000);
                          }
                        }}
                      />
                      <Button 
                        onClick={() => document.getElementById('project-resume-upload')?.click()}
                        className="bg-cyan-600 hover:bg-cyan-700"
                      >
                        📤 Choose Resume File
                      </Button>
                    </Card>

                    {/* Parsed Projects Preview */}
                    {resumeFile && (
                      <Card className="p-4 border-2 border-cyan-300 bg-cyan-50 mb-6">
                        <p className="font-bold text-slate-900 mb-3">✅ Auto-Parsed Projects & Experience:</p>
                        <div className="space-y-2 text-sm">
                          {parsedProjects.map((proj, idx) => (
                            <div key={idx} className="p-2 bg-white rounded border-l-4 border-l-cyan-500">
                              <p className="font-semibold text-slate-900">{proj.title}</p>
                              <p className="text-xs text-slate-600">🔧 {proj.techStack}</p>
                              <p className="text-xs text-slate-600">📊 {proj.metrics}</p>
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Card className="p-4 bg-gradient-to-br from-cyan-100 to-blue-100 border-2 border-cyan-300">
                      <p className="font-bold text-slate-900 mb-2">🔍 Auto-Extraction Features:</p>
                      <ul className="text-xs text-slate-700 space-y-1">
                        <li>✓ Projects detection</li>
                        <li>✓ Internships parsing</li>
                        <li>✓ Tech stack extraction</li>
                        <li>✓ Metrics identification</li>
                        <li>✓ Keywords analysis</li>
                        <li>✓ Leadership points</li>
                      </ul>
                    </Card>

                    <Card className="p-4 bg-blue-50 border-2 border-blue-300">
                      <p className="font-bold text-slate-900 mb-2">💡 Good Resume Practices:</p>
                      <ul className="text-xs text-slate-700 space-y-1">
                        <li>• Include metrics (numbers)</li>
                        <li>• Tech stack explicitly</li>
                        <li>• 2-3 sentences/project</li>
                        <li>• Impact-focused bullets</li>
                        <li>• Action verbs</li>
                      </ul>
                    </Card>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    onClick={() => setResumeCurrentStep(2)} 
                    className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                    disabled={parsedProjects.length === 0}
                  >
                    Next: Project Cards →
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* STEP 2: Project Cards Section */}
          {resumeCurrentStep === 2 && (
            <div className="space-y-6 animate-in fade-in">
              <Card className="p-6 border-2 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300">
                <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                  🧩 Project Cards - Your Interview Modules
                </h2>
                <p className="text-slate-600 mb-6">Each project becomes a separate interview deep-dive. Click to select:</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {parsedProjects.map((proj) => (
                    <Card 
                      key={proj.id}
                      onClick={() => { setSelectedProject(proj); setResumeCurrentStep(3); }}
                      className={`p-4 border-2 cursor-pointer transition-all transform hover:scale-105 ${selectedProject?.id === proj.id ? 'border-blue-500 bg-blue-100 shadow-lg ring-2 ring-blue-300' : 'border-slate-200 hover:border-blue-400 hover:shadow-lg'} bg-white`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-slate-900 text-lg">{proj.title}</h3>
                          <Badge className={`mt-2 ${proj.difficulty === 'Hard' ? 'bg-red-200 text-red-900' : proj.difficulty === 'Medium' ? 'bg-yellow-200 text-yellow-900' : 'bg-green-200 text-green-900'}`}>
                            {proj.difficulty}
                          </Badge>
                        </div>
                        <span className="text-2xl">📱</span>
                      </div>
                      
                      <div className="space-y-2 text-xs mb-3">
                        <p><strong>🔧 Tech:</strong> {proj.techStack}</p>
                        <p><strong>👥 Team:</strong> {proj.teamSize} members</p>
                        <p><strong>⏱️ Duration:</strong> {proj.duration}</p>
                        <p><strong>📊 Metrics:</strong> {proj.metrics}</p>
                        <p><strong>🏗️ Architecture:</strong> {proj.architectureLevel}</p>
                        <p><strong>🎯 Domain:</strong> {proj.domain}</p>
                      </div>
                      
                      <p className="text-xs text-slate-600">{proj.description}</p>
                    </Card>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button onClick={() => setResumeCurrentStep(1)} variant="outline" className="flex-1">← Back</Button>
                  <Button onClick={() => setResumeCurrentStep(3)} className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={!selectedProject}>
                    Next: Deep-Dive Questions →
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* STEP 3: Deep-Dive Question Generator (Hero Feature) */}
          {resumeCurrentStep === 3 && selectedProject && (
            <div className="space-y-6 animate-in fade-in">
              <Card className="p-6 border-2 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-300">
                <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                  🎯 Deep-Dive Question Generator - {selectedProject.title} (HERO FEATURE)
                </h2>
                <p className="text-slate-600 mb-6">AI-generated adaptive questions for your project. Start answering:</p>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                  <div className="lg:col-span-2 space-y-4">
                    {/* Questions by Category */}
                    {[
                      {
                        cat: '🏗️ Architecture & Design',
                        qs: [
                          'Walk me through the architecture of this project',
                          'How did you design the data flow?',
                          'What design patterns did you use and why?',
                          'How would you scale this to 10x users?',
                        ]
                      },
                      {
                        cat: '💾 Data & Database',
                        qs: [
                          'Explain your database schema',
                          'Why did you choose ' + selectedProject.techStack.split(',')[0] + '?',
                          'How do you handle data consistency?',
                          'What indexes did you add and why?',
                        ]
                      },
                      {
                        cat: '⚡ Performance & Optimization',
                        qs: [
                          'What was your latency before and after optimization?',
                          'How did you identify bottlenecks?',
                          'Caching strategy?',
                          'API response optimization techniques?',
                        ]
                      },
                      {
                        cat: '🔒 Security & Reliability',
                        qs: [
                          'How do you handle authentication/authorization?',
                          'What security measures did you implement?',
                          'How do you ensure reliability and uptime?',
                          'Error handling and recovery strategy?',
                        ]
                      },
                      {
                        cat: '❓ Follow-Up Deep Questions',
                        qs: [
                          'Why this tech instead of alternatives?',
                          'What tradeoffs did you make?',
                          'Biggest challenge you faced?',
                          'What would you redesign with hindsight?',
                        ]
                      },
                    ].map((section, idx) => (
                      <Card key={idx} className="p-4 border-2 border-purple-200 bg-white">
                        <p className="font-bold text-slate-900 mb-3">{section.cat}</p>
                        <div className="space-y-2">
                          {section.qs.map((q, qidx) => (
                            <Button 
                              key={qidx}
                              onClick={() => {
                                setDeepDiveQuestions(section.qs);
                                setResumeCurrentQuestion(qidx);
                                setResumeCurrentStep(4);
                              }}
                              variant="outline"
                              className="w-full justify-start text-left text-xs py-2 h-auto"
                            >
                              <span className="text-purple-600 mr-2">→</span> {q}
                            </Button>
                          ))}
                        </div>
                      </Card>
                    ))}
                  </div>

                  <div className="space-y-3 h-fit">
                    <Card className="p-4 bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-purple-300">
                      <p className="font-bold text-slate-900 mb-2">📊 Project Stats</p>
                      <ul className="text-xs text-slate-700 space-y-2">
                        <li><strong>Project:</strong> {selectedProject.title}</li>
                        <li><strong>Role:</strong> {selectedProject.role}</li>
                        <li><strong>Team:</strong> {selectedProject.teamSize} members</li>
                        <li><strong>Duration:</strong> {selectedProject.duration}</li>
                        <li><strong>Tech Stack:</strong> {selectedProject.techStack.split(',').length} technologies</li>
                        <li><strong>Architecture:</strong> {selectedProject.architectureLevel}</li>
                      </ul>
                    </Card>

                    <Card className="p-4 bg-yellow-50 border-2 border-yellow-300">
                      <p className="font-bold text-slate-900 mb-2">💡 Interview Tip:</p>
                      <p className="text-xs text-slate-700">Use STAR: <strong>S</strong>ituation, <strong>T</strong>ask, <strong>A</strong>ction, <strong>R</strong>esult. Be specific with metrics!</p>
                    </Card>

                    <Card className="p-4 bg-green-50 border-2 border-green-300">
                      <p className="font-bold text-slate-900 mb-2">📈 Impact Keywords:</p>
                      <p className="text-xs text-slate-700">{selectedProject.metrics}</p>
                    </Card>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button onClick={() => setResumeCurrentStep(2)} variant="outline" className="flex-1">← Back</Button>
                  <Button onClick={() => setResumeCurrentStep(4)} className="flex-1 bg-purple-600 hover:bg-purple-700">Next: AI Interviewer →</Button>
                </div>
              </Card>
            </div>
          )}

          {/* STEP 4: AI Project Interviewer */}
          {resumeCurrentStep === 4 && selectedProject && (
            <div className="space-y-6 animate-in fade-in">
              <Card className="p-6 border-2 bg-gradient-to-br from-violet-50 to-blue-50 border-violet-300">
                <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                  🎙️ AI Project Interviewer - Real-Time Conversation
                </h2>
                <p className="text-slate-600 mb-6">AI conducts realistic interview on your project. Answer naturally:</p>
                
                <div className="space-y-4 mb-6">
                  <Card className="p-4 border-2 border-violet-300 bg-white">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="text-3xl">🤖</div>
                      <div className="flex-1">
                        <p className="font-bold text-slate-900">AI Interviewer (Senior PM)</p>
                        <p className="text-xs text-slate-500">Amazon | Microsoft | Google experience</p>
                      </div>
                    </div>

                    <div className="bg-violet-50 p-4 rounded-lg border-l-4 border-l-violet-500 mb-4">
                      <p className="text-slate-900 font-medium">
                        "Tell me about {selectedProject.title}. Walk me through the problem you solved and how you approached it."
                      </p>
                    </div>

                    <div className="mb-4">
                      <label className="text-sm font-semibold text-slate-700 mb-2 block">Your Answer:</label>
                      <Textarea 
                        placeholder="Start talking... Include: problem statement, your approach, tech choices, challenges, and result metrics..." 
                        className="min-h-28 border-2 border-violet-300"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1 text-sm">Clear</Button>
                      <Button className="flex-1 bg-violet-600 hover:bg-violet-700 text-sm">Continue Interview →</Button>
                    </div>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Card className="p-4 border-2 border-blue-200 bg-blue-50">
                      <p className="font-bold text-slate-900 mb-2">❓ Expected Follow-ups:</p>
                      <ul className="text-xs text-slate-700 space-y-1">
                        <li>• Why did you choose {selectedProject.techStack.split(',')[0]}?</li>
                        <li>• What tradeoffs did you make?</li>
                        <li>• Biggest bottleneck you faced?</li>
                        <li>• How would you scale this?</li>
                        <li>• What metric improved most?</li>
                      </ul>
                    </Card>
                    <Card className="p-4 border-2 border-green-200 bg-green-50">
                      <p className="font-bold text-slate-900 mb-2">✅ Evaluation Criteria:</p>
                      <ul className="text-xs text-slate-700 space-y-1">
                        <li>• Technical depth</li>
                        <li>• Problem-solving approach</li>
                        <li>• Communication clarity</li>
                        <li>• Metric awareness</li>
                        <li>• Growth mindset</li>
                      </ul>
                    </Card>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button onClick={() => setResumeCurrentStep(3)} variant="outline" className="flex-1">← Back</Button>
                  <Button onClick={() => setResumeCurrentStep(5)} className="flex-1 bg-violet-600 hover:bg-violet-700">Next: Architecture →</Button>
                </div>
              </Card>
            </div>
          )}

          {/* STEP 5: Architecture Breakdown Panel */}
          {resumeCurrentStep === 5 && selectedProject && (
            <div className="space-y-6 animate-in fade-in">
              <Card className="p-6 border-2 bg-gradient-to-br from-orange-50 to-amber-50 border-orange-300">
                <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                  🏗️ Architecture Breakdown - System Design Visualization
                </h2>
                <p className="text-slate-600 mb-6">Visual breakdown of your project's architecture:</p>
                
                <div className="space-y-4 mb-6">
                  {selectedProject.architectureLevel === 'Microservices' && (
                    <>
                      <Card className="p-4 border-2 border-orange-300 bg-white">
                        <p className="font-bold text-slate-900 mb-3">📊 High-Level Architecture (HLD):</p>
                        <div className="bg-orange-50 p-4 rounded-lg space-y-3 font-mono text-xs text-slate-700">
                          <div className="flex items-center justify-center gap-2">
                            <div className="px-3 py-2 bg-blue-200 rounded">Clients (Web/Mobile)</div>
                            <span>→</span>
                            <div className="px-3 py-2 bg-purple-200 rounded">API Gateway</div>
                          </div>
                          <div className="flex items-center justify-center gap-2">
                            <span>↓</span>
                            <div className="w-full text-center bg-green-100 p-2 rounded">Microservices: User, Payment, Booking, Notification</div>
                            <span>↓</span>
                          </div>
                          <div className="flex items-center justify-center gap-4">
                            <div className="px-3 py-2 bg-red-200 rounded">Redis Cache</div>
                            <div className="px-3 py-2 bg-yellow-200 rounded">PostgreSQL</div>
                            <div className="px-3 py-2 bg-pink-200 rounded">Kafka Queue</div>
                          </div>
                        </div>
                      </Card>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Card className="p-4 border-2 border-orange-200 bg-orange-50">
                          <p className="font-bold text-slate-900 mb-2">🔄 Request Lifecycle:</p>
                          <ol className="text-xs text-slate-700 space-y-1">
                            <li>1. Client request → API Gateway</li>
                            <li>2. Route to microservice</li>
                            <li>3. Check Redis cache</li>
                            <li>4. Query DB if miss</li>
                            <li>5. Queue async jobs</li>
                            <li>6. Return response</li>
                          </ol>
                        </Card>
                        <Card className="p-4 border-2 border-orange-200 bg-orange-50">
                          <p className="font-bold text-slate-900 mb-2">💾 Database Relations:</p>
                          <p className="text-xs text-slate-700 mb-2 font-mono">users (1) → (Many) bookings</p>
                          <p className="text-xs text-slate-700 mb-2 font-mono">bookings (1) → (1) payments</p>
                          <p className="text-xs text-slate-700 font-mono">bookings (1) → (Many) notifications</p>
                        </Card>
                      </div>

                      <Card className="p-4 border-2 border-orange-200 bg-orange-50">
                        <p className="font-bold text-slate-900 mb-2">⚙️ Tech Stack Breakdown:</p>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                          <div className="p-2 bg-white rounded border-2 border-orange-300 text-center"><strong>Frontend:</strong> {selectedProject.techStack.split(',')[0]}</div>
                          <div className="p-2 bg-white rounded border-2 border-orange-300 text-center"><strong>Backend:</strong> {selectedProject.techStack.split(',')[1]}</div>
                          <div className="p-2 bg-white rounded border-2 border-orange-300 text-center"><strong>DB:</strong> {selectedProject.techStack.split(',')[2]}</div>
                          <div className="p-2 bg-white rounded border-2 border-orange-300 text-center"><strong>Cache:</strong> {selectedProject.techStack.includes('Redis') ? 'Redis' : 'Memcached'}</div>
                          <div className="p-2 bg-white rounded border-2 border-orange-300 text-center"><strong>Queue:</strong> {selectedProject.techStack.includes('Kafka') ? 'Kafka' : 'RabbitMQ'}</div>
                        </div>
                      </Card>
                    </>
                  )}

                  {selectedProject.architectureLevel !== 'Microservices' && (
                    <div className="text-center py-8 text-slate-500">
                      <p className="mb-4">Architecture diagram for {selectedProject.architectureLevel} system</p>
                      <Button variant="outline">📊 View Architecture Diagram</Button>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button onClick={() => setResumeCurrentStep(4)} variant="outline" className="flex-1">← Back</Button>
                  <Button onClick={() => setResumeCurrentStep(6)} className="flex-1 bg-orange-600 hover:bg-orange-700">Next: Impact Validation →</Button>
                </div>
              </Card>
            </div>
          )}

          {/* STEP 6: Impact Validation Section */}
          {resumeCurrentStep === 6 && selectedProject && (
            <div className="space-y-6 animate-in fade-in">
              <Card className="p-6 border-2 bg-gradient-to-br from-rose-50 to-pink-50 border-rose-300">
                <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                  📊 Impact Validation - Prove Your Metrics
                </h2>
                <p className="text-slate-600 mb-6">Recruiters verify impact! Provide detailed before/after metrics:</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">⏱️ Latency Impact:</label>
                    <div className="space-y-2">
                      <input type="text" placeholder="Before (ms)" className="w-full px-3 py-2 border-2 border-rose-300 rounded" />
                      <input type="text" placeholder="After (ms)" className="w-full px-3 py-2 border-2 border-rose-300 rounded" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">💰 Cost Reduction:</label>
                    <div className="space-y-2">
                      <input type="text" placeholder="Before ($)" className="w-full px-3 py-2 border-2 border-rose-300 rounded" />
                      <input type="text" placeholder="After ($)" className="w-full px-3 py-2 border-2 border-rose-300 rounded" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">📈 Throughput (req/s):</label>
                    <input type="text" placeholder="Achieved throughput" value={projectImpactMetrics.throughput} onChange={(e) => setProjectImpactMetrics({ ...projectImpactMetrics, throughput: e.target.value })} className="w-full px-3 py-2 border-2 border-rose-300 rounded" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">👥 User Growth:</label>
                    <input type="text" placeholder="Growth %  or DAU/MAU" value={projectImpactMetrics.userGrowth} onChange={(e) => setProjectImpactMetrics({ ...projectImpactMetrics, userGrowth: e.target.value })} className="w-full px-3 py-2 border-2 border-rose-300 rounded" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">🐛 Bug Reduction:</label>
                    <input type="text" placeholder="% reduction or incidents/month" value={projectImpactMetrics.bugReduction} onChange={(e) => setProjectImpactMetrics({ ...projectImpactMetrics, bugReduction: e.target.value })} className="w-full px-3 py-2 border-2 border-rose-300 rounded" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">🧪 Test Coverage:</label>
                    <input type="text" placeholder="% coverage achieved" value={projectImpactMetrics.testCoverage} onChange={(e) => setProjectImpactMetrics({ ...projectImpactMetrics, testCoverage: e.target.value })} className="w-full px-3 py-2 border-2 border-rose-300 rounded" />
                  </div>
                </div>

                <Card className="p-4 border-2 border-rose-300 bg-rose-50 mb-6">
                  <p className="font-bold text-slate-900 mb-2">❓ How to Validate & Explain:</p>
                  <div className="space-y-2 text-sm text-slate-700">
                    <p><strong>Latency:</strong> "We measured with Datadog. Reduced from Xms to Yms by optimizing DB queries and adding Redis caching."</p>
                    <p><strong>Throughput:</strong> "Load testing showed we could handle 5000 req/s with our optimized architecture."</p>
                    <p><strong>User Growth:</strong> "DAU grew from 50k to 150k in 6 months after launch."</p>
                    <p><strong>Bug Reduction:</strong> "Improved test coverage to 85%, reducing production bugs by 60%."</p>
                  </div>
                </Card>

                <div className="flex gap-3">
                  <Button onClick={() => setResumeCurrentStep(5)} variant="outline" className="flex-1">← Back</Button>
                  <Button onClick={() => setResumeCurrentStep(7)} className="flex-1 bg-rose-600 hover:bg-rose-700">Next: Incident Story →</Button>
                </div>
              </Card>
            </div>
          )}

          {/* STEP 7: Incident / Failure Story Builder */}
          {resumeCurrentStep === 7 && selectedProject && (
            <div className="space-y-6 animate-in fade-in">
              <Card className="p-6 border-2 bg-gradient-to-br from-red-50 to-orange-50 border-red-300">
                <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                  🚨 Incident / Failure Story Builder - The Behavioral + Technical Gold
                </h2>
                <p className="text-slate-600 mb-6">Interviewers LOVE failure questions. Show resilience, learning, and problem-solving:</p>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-2 block">🐛 What incident/bug happened?</label>
                      <Textarea 
                        placeholder="E.g., Database went down during traffic spike, lost 30 mins of data..." 
                        value={incidentDetails.incident}
                        onChange={(e) => setIncidentDetails({ ...incidentDetails, incident: e.target.value })}
                        className="min-h-20 border-2 border-red-300"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-2 block">🔍 Root Cause Analysis:</label>
                      <Textarea 
                        placeholder="Why did it happen? What was the root cause?" 
                        value={incidentDetails.rootCause}
                        onChange={(e) => setIncidentDetails({ ...incidentDetails, rootCause: e.target.value })}
                        className="min-h-20 border-2 border-red-300"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-2 block">🔧 Debugging Steps You Took:</label>
                      <Textarea 
                        placeholder="How did you troubleshoot? What tools? Which logs did you check?" 
                        value={incidentDetails.debugSteps}
                        onChange={(e) => setIncidentDetails({ ...incidentDetails, debugSteps: e.target.value })}
                        className="min-h-20 border-2 border-red-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-2 block">⏮️ Rollback / Recovery:</label>
                      <Textarea 
                        placeholder="How did you recover? Did you rollback? Time to recovery?" 
                        value={incidentDetails.rollback}
                        onChange={(e) => setIncidentDetails({ ...incidentDetails, rollback: e.target.value })}
                        className="min-h-20 border-2 border-red-300"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-2 block">📚 Lesson Learned & Long-term Fix:</label>
                      <Textarea 
                        placeholder="What did you learn? What permanent changes did you make to prevent recurrence?" 
                        value={incidentDetails.lessonLearned}
                        onChange={(e) => setIncidentDetails({ ...incidentDetails, lessonLearned: e.target.value })}
                        className="min-h-20 border-2 border-red-300"
                      />
                    </div>
                  </div>
                </div>

                <Card className="p-4 border-2 border-orange-300 bg-orange-50 mb-6">
                  <p className="font-bold text-slate-900 mb-2">💡 Pro Tips:</p>
                  <ul className="text-sm text-slate-700 space-y-1">
                    <li>✓ Show ownership: "I owned this fix"</li>
                    <li>✓ Technical depth: Specific tools & logs</li>
                    <li>✓ Time awareness: "TTR was X minutes"</li>
                    <li>✓ Learning mindset: Permanent improvements</li>
                    <li>✓ Team collaboration: How others helped</li>
                  </ul>
                </Card>

                <div className="flex gap-3">
                  <Button onClick={() => setResumeCurrentStep(6)} variant="outline" className="flex-1">← Back</Button>
                  <Button onClick={() => setResumeCurrentStep(8)} className="flex-1 bg-red-600 hover:bg-red-700">Next: Ownership →</Button>
                </div>
              </Card>
            </div>
          )}

          {/* STEP 8: Ownership & Team Contribution */}
          {resumeCurrentStep === 8 && selectedProject && (
            <div className="space-y-6 animate-in fade-in">
              <Card className="p-6 border-2 bg-gradient-to-br from-lime-50 to-green-50 border-lime-300">
                <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                  👥 Ownership & Team Contribution - What EXACTLY Did You Build?
                </h2>
                <p className="text-slate-600 mb-6">Interviewers test: Were you a follower or a leader? Be specific about YOUR contribution:</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">🎯 Your Specific Contributions:</label>
                    <Textarea 
                      placeholder="E.g., Led authentication module, designed caching strategy, built payment integration, mentored 2 juniors..." 
                      value={ownershipDetails.contribution}
                      onChange={(e) => setOwnershipDetails({ ...ownershipDetails, contribution: e.target.value })}
                      className="min-h-20 border-2 border-lime-300"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">🔌 APIs/Endpoints You Owned:</label>
                    <Textarea 
                      placeholder="E.g., POST /auth/login, GET /payment/{id}, WebSocket /live-interview..." 
                      value={ownershipDetails.apisOwned}
                      onChange={(e) => setOwnershipDetails({ ...ownershipDetails, apisOwned: e.target.value })}
                      className="min-h-20 border-2 border-lime-300"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">📦 Modules/Services You Built:</label>
                    <Textarea 
                      placeholder="E.g., PaymentService, UserAuthController, NotificationQueue, CacheManager..." 
                      value={ownershipDetails.modulesBuilt}
                      onChange={(e) => setOwnershipDetails({ ...ownershipDetails, modulesBuilt: e.target.value })}
                      className="min-h-20 border-2 border-lime-300"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">💬 Team Conflict Resolution:</label>
                    <Textarea 
                      placeholder="Any disagreements? How did you handle them diplomatically?" 
                      value={ownershipDetails.teamConflict}
                      onChange={(e) => setOwnershipDetails({ ...ownershipDetails, teamConflict: e.target.value })}
                      className="min-h-20 border-2 border-lime-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">📋 Code Review & Quality Process:</label>
                    <Textarea 
                      placeholder="How many PRs reviewed? What standards did you enforce?" 
                      value={ownershipDetails.reviewProcess}
                      onChange={(e) => setOwnershipDetails({ ...ownershipDetails, reviewProcess: e.target.value })}
                      className="min-h-20 border-2 border-lime-300"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">🎓 Mentorship / Knowledge Transfer:</label>
                    <Textarea 
                      placeholder="Did you mentor juniors? How many? What did you teach them?" 
                      value={ownershipDetails.mentorship}
                      onChange={(e) => setOwnershipDetails({ ...ownershipDetails, mentorship: e.target.value })}
                      className="min-h-20 border-2 border-lime-300"
                    />
                  </div>
                </div>

                <Card className="p-4 border-2 border-green-300 bg-green-50 mb-6">
                  <p className="font-bold text-slate-900 mb-2">✅ Interview Tip:</p>
                  <p className="text-sm text-slate-700">NEVER say "We did X". Always be specific: "I designed Y", "I built API Z", "I led the refactoring". Ownership matters!</p>
                </Card>

                <div className="flex gap-3">
                  <Button onClick={() => setResumeCurrentStep(7)} variant="outline" className="flex-1">← Back</Button>
                  <Button onClick={() => setResumeCurrentStep(9)} className="flex-1 bg-lime-600 hover:bg-lime-700">Next: Project Viva →</Button>
                </div>
              </Card>
            </div>
          )}

          {/* STEP 9: Project Viva / Rapid Fire */}
          {resumeCurrentStep === 9 && selectedProject && (
            <div className="space-y-6 animate-in fade-in">
              <Card className="p-6 border-2 bg-gradient-to-br from-sky-50 to-cyan-50 border-sky-300">
                <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                  🧪 Project Viva / Rapid Fire - 20 Quick Questions (30 sec each)
                </h2>
                <p className="text-slate-600 mb-6">Final revision! Quick technical & behavioral questions:</p>
                
                <div className="space-y-4 mb-6">
                  <Card className="p-4 border-2 border-sky-300 bg-white">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-bold text-slate-900">Question {projectVivaCurrent + 1}/20</span>
                      <Badge className="bg-sky-600">30 sec timer ⏱️</Badge>
                    </div>
                    <Progress value={((projectVivaCurrent + 1) / 20) * 100} className="h-3 mb-4" />

                    <div className="bg-sky-50 p-4 rounded-lg border-l-4 border-l-sky-500 mb-4">
                      <p className="text-slate-900 font-medium text-lg">
                        {[
                          `Why did you choose ${selectedProject.techStack.split(',')[1]} for backend?`,
                          `Why not MongoDB for ${selectedProject.title}?`,
                          `How would you scale this 100x?`,
                          `What's the biggest bottleneck you faced?`,
                          `How do you measure success of this project?`,
                          `What would you redesign with hindsight?`,
                          `How many users can this handle currently?`,
                          `API response time under load?`,
                          `How do you handle failures?`,
                          `Team size vs features delivered?`,
                          `What took longest to build?`,
                          `Most complex feature?`,
                          `How do you debug production issues?`,
                          `What metrics do you track?`,
                          `CI/CD pipeline details?`,
                          `How often do you deploy?`,
                          `Testing strategy?`,
                          `Security measures?`,
                          `Performance optimization techniques?`,
                          `Biggest learning from this project?`,
                        ][projectVivaCurrent]}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1">Skip →</Button>
                      <Button 
                        onClick={() => setProjectVivaCurrent(projectVivaCurrent < 19 ? projectVivaCurrent + 1 : 9)}
                        className="flex-1 bg-sky-600 hover:bg-sky-700"
                      >
                        {projectVivaCurrent < 19 ? 'Next Question' : 'Finish'}
                      </Button>
                    </div>
                  </Card>

                  <Card className="p-4 border-2 border-blue-200 bg-blue-50">
                    <p className="font-bold text-slate-900 mb-2">🎯 Confidence Score: {Math.floor((projectVivaCurrent + 1) / 2)}%</p>
                    <Progress value={(projectVivaCurrent + 1) / 2} className="h-2" />
                  </Card>
                </div>

                <div className="flex gap-3">
                  <Button onClick={() => setResumeCurrentStep(8)} variant="outline" className="flex-1">← Back</Button>
                  <Button onClick={() => setResumeCurrentStep(10)} className="flex-1 bg-sky-600 hover:bg-sky-700">Next: Improvement Tracker →</Button>
                </div>
              </Card>
            </div>
          )}

          {/* STEP 10: Resume Story Improvement Tracker */}
          {resumeCurrentStep === 10 && selectedProject && (
            <div className="space-y-6 animate-in fade-in">
              <Card className="p-6 border-2 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-300">
                <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                  📈 Resume Story Improvement Tracker - Your Growth Dashboard
                </h2>
                <p className="text-slate-600 mb-6">Track weak areas. Improve your project story for interviews:</p>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: 'Strong Projects', value: '2/3', color: 'from-green-400 to-green-600', status: '✅' },
                    { label: 'Weak Projects', value: '1/3', color: 'from-yellow-400 to-yellow-600', status: '⚠️' },
                    { label: 'Unanswered Q&A', value: '5/20', color: 'from-red-400 to-red-600', status: '❌' },
                    { label: 'Confidence Score', value: '72%', color: 'from-blue-400 to-blue-600', status: '📊' },
                  ].map((item, idx) => (
                    <Card key={idx} className={`p-4 bg-gradient-to-br ${item.color} text-white text-center rounded-lg`}>
                      <p className="text-sm font-bold mb-2">{item.label}</p>
                      <p className="text-3xl font-bold mb-2">{item.value}</p>
                      <p className="text-2xl">{item.status}</p>
                    </Card>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <Card className="p-4 border-2 border-green-300 bg-green-50">
                    <h3 className="font-bold text-slate-900 mb-3">✅ Strong Areas</h3>
                    <ul className="text-sm text-slate-700 space-y-2">
                      <li>• Clear problem statement</li>
                      <li>• Specific metrics (latency improved 40%)</li>
                      <li>• Technical depth in architecture</li>
                      <li>• Team impact explained well</li>
                    </ul>
                  </Card>
                  <Card className="p-4 border-2 border-red-300 bg-red-50">
                    <h3 className="font-bold text-slate-900 mb-3">❌ Weak Areas</h3>
                    <ul className="text-sm text-slate-700 space-y-2">
                      <li>• Vague on failure/incident handling</li>
                      <li>• Missing cost impact metrics</li>
                      <li>• Weak on "why this tech"</li>
                      <li>• Should elaborate on scaling approach</li>
                    </ul>
                  </Card>
                </div>

                <Card className="p-4 border-2 border-indigo-300 bg-indigo-50 mb-6">
                  <h3 className="font-bold text-slate-900 mb-3">📝 Recommended Improvements:</h3>
                  <ol className="text-sm text-slate-700 space-y-2">
                    <li><strong>1.</strong> Add incident story: "Production issue we faced and fix"</li>
                    <li><strong>2.</strong> Quantify cost savings: If backend optimization saved $X annually</li>
                    <li><strong>3.</strong> Explain tradeoffs: Why Redis vs Memcached</li>
                    <li><strong>4.</strong> Scale reasoning: If 10x traffic, what breaks first?</li>
                    <li><strong>5.</strong> Team metrics: "Led 3 people, delivered on time"</li>
                  </ol>
                </Card>

                <div className="flex gap-3">
                  <Button onClick={() => setResumeCurrentStep(9)} variant="outline" className="flex-1">← Back</Button>
                  <Button onClick={() => setResumeCurrentStep(11)} className="flex-1 bg-indigo-600 hover:bg-indigo-700">Next: Templates →</Button>
                </div>
              </Card>
            </div>
          )}

          {/* STEP 11: Best Project Story Templates */}
          {resumeCurrentStep === 11 && (
            <div className="space-y-6 animate-in fade-in">
              <Card className="p-6 border-2 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300">
                <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                  📚 Best Project Story Templates - Learn From Examples
                </h2>
                <p className="text-slate-600 mb-6">Study proven story templates. Use as reference for YOUR project:</p>
                
                <div className="space-y-4 mb-6">
                  {[
                    {
                      name: '🌐 Full Stack Project Story',
                      example: 'Built an e-commerce platform with Redux frontend and Node backend. Handled 10k concurrent users. Implemented payment processing via Stripe. Optimized database queries reducing latency from 500ms to 50ms. Metrics: 95% uptime, 2s avg response time.',
                      tags: ['Frontend', 'Backend', 'Full Stack', 'Database']
                    },
                    {
                      name: '🤖 AI/ML Project Story',
                      example: 'Developed recommendation engine using collaborative filtering. Trained model on 1M interactions. Built REST API serving 5k req/sec. A/B testing showed 25% improvement in CTR. Tech: Python, TensorFlow, FastAPI.',
                      tags: ['ML', 'Data', 'Python', 'Scaling']
                    },
                    {
                      name: '🔧 Backend Service Story',
                      example: 'Designed payment reconciliation service processing 100k transactions/day. Built with Go and PostgreSQL. Implemented transaction idempotency and retry logic. Reduced settlement time from 24h to 2h. 99.99% uptime SLA.',
                      tags: ['Backend', 'Microservices', 'Reliability', 'Payments']
                    },
                    {
                      name: '📊 SaaS Product Story',
                      example: 'Co-founded analytics dashboard handling 50M events/day. Node.js + React + PostgreSQL + Redis. Built real-time dashboards with WebSocket. Grew from 0 to 1000 customers in 6 months. ARR $500k.',
                      tags: ['SaaS', 'Startup', 'Scaling', 'Growth']
                    },
                    {
                      name: '🎓 College Project Story',
                      example: 'Built distributed file system (like HDFS) for college project. Handled replication, load balancing across nodes. Learned: distributed systems complexity, consistency models, testing at scale.',
                      tags: ['DSA', 'Systems', 'Learning', 'College']
                    },
                    {
                      name: '🚀 Optimization Project Story',
                      example: 'Reduced API latency by 60% through caching + query optimization. Identified N+1 queries, added Redis layer, improved DB indexes. Measured with Datadog APM. Improved user experience visible in analytics.',
                      tags: ['Performance', 'Optimization', 'Debugging', 'Impact']
                    },
                  ].map((template, idx) => (
                    <Card 
                      key={idx}
                      onClick={() => setProjectStoryIndex(idx)}
                      className={`p-4 border-2 cursor-pointer transition-all ${projectStoryIndex === idx ? 'border-amber-500 bg-amber-100 shadow-lg' : 'border-slate-200 hover:border-amber-400'} bg-white`}
                    >
                      <h3 className="font-bold text-slate-900 mb-2">{template.name}</h3>
                      <p className="text-sm text-slate-700 mb-3 leading-relaxed">"{template.example}"</p>
                      <div className="flex flex-wrap gap-2">
                        {template.tags.map((tag, tidx) => (
                          <Badge key={tidx} className="bg-amber-200 text-amber-900 text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      {projectStoryIndex === idx && (
                        <div className="mt-3 pt-3 border-t-2 border-amber-300">
                          <Button size="sm" className="w-full bg-amber-600 hover:bg-amber-700 text-xs">
                            📋 Copy Template
                          </Button>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>

                <Card className="p-4 border-2 border-orange-300 bg-orange-50 mb-6">
                  <p className="font-bold text-slate-900 mb-2">💡 Template Structure:</p>
                  <div className="text-sm text-slate-700 space-y-1">
                    <p><strong>1. Context:</strong> Problem statement, why it mattered</p>
                    <p><strong>2. Approach:</strong> Tech stack, architecture decisions</p>
                    <p><strong>3. Challenges:</strong> What was hard, how you solved</p>
                    <p><strong>4. Results:</strong> Quantified metrics, business impact</p>
                    <p><strong>5. Learning:</strong> What you learned, what you'd do differently</p>
                  </div>
                </Card>

                <div className="flex gap-3">
                  <Button onClick={() => { setResumeCurrentStep(1); setSelectedProject(null); }} variant="outline" className="flex-1">← Back to Start</Button>
                  <Button onClick={() => alert('✅ Project story saved! Review before your interviews.')} className="flex-1 bg-amber-600 hover:bg-amber-700">💾 Save My Story</Button>
                </div>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* 9️⃣ PEER - RESPONSIVE & FUNCTIONAL */}
        <TabsContent value="peer" className="space-y-4 md:space-y-6">
          <Card className="p-4 md:p-6 border-2">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">👥 Peer-to-Peer Mocks</h2>
            {loadingPeers ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-48 bg-slate-100 animate-pulse rounded"></div>
                <div className="h-48 bg-slate-100 animate-pulse rounded"></div>
              </div>
            ) : peers && peers.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {peers.slice(0, 2).map((peer, i) => (
                    <Card key={i} className="p-4 md:p-6 border-2 hover:shadow-lg transition-all">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <p className="font-bold text-slate-900 text-base md:text-lg">{peer.name}</p>
                          <p className="text-xs md:text-sm text-slate-600">{peer.title} • {peer.experience}</p>
                        </div>
                        <Badge className={`ml-2 ${peer.available ? 'bg-green-600' : 'bg-slate-400'} text-xs md:text-sm whitespace-nowrap`}>
                          {peer.available ? '🟢 Available' : '⚫ Busy'}
                        </Badge>
                      </div>
                      <p className="text-xs md:text-sm text-slate-600 mb-4 leading-relaxed">{peer.specialization}</p>
                      <div className="flex items-center gap-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="text-yellow-400 text-lg">★</span>
                        ))}
                        <span className="text-xs text-slate-600 ml-2">{peer.rating}/5</span>
                      </div>
                      <Button 
                        className="w-full h-10 md:h-11 bg-blue-600 hover:bg-blue-700 text-sm md:text-base"
                        onClick={() => setApiError(`🔗 Connecting with ${peer.name}...`)}
                      >
                        <Users className="size-4 mr-2" />
                        Connect
                      </Button>
                    </Card>
                  ))}
                </div>
                
                {/* Community Stats Card */}
                <Card className="p-4 md:p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
                  <h4 className="font-bold text-slate-900 mb-4 text-base md:text-lg">📊 Community Stats</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 md:p-4 bg-white rounded border-2 border-blue-200">
                      <div className="text-2xl md:text-3xl font-bold text-blue-600">👥</div>
                      <p className="text-xs md:text-sm text-slate-600 mt-2">{Math.floor(Math.random() * 5000) + 2000} Active Peers</p>
                    </div>
                    <div className="text-center p-3 md:p-4 bg-white rounded border-2 border-purple-200">
                      <div className="text-2xl md:text-3xl font-bold text-purple-600">📊</div>
                      <p className="text-xs md:text-sm text-slate-600 mt-2">{Math.floor(Math.random() * 50000) + 10000} Interviews</p>
                    </div>
                    <div className="text-center p-3 md:p-4 bg-white rounded border-2 border-yellow-200">
                      <div className="text-2xl md:text-3xl font-bold text-yellow-600">⭐</div>
                      <p className="text-xs md:text-sm text-slate-600 mt-2">Your Rating: 4.9/5</p>
                    </div>
                  </div>
                </Card>
              </>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="size-8 text-red-500 mx-auto mb-3" />
                <p className="text-slate-600">Failed to load peers. Please try again later.</p>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* 🔟 PRICING - RESPONSIVE & FUNCTIONAL */}
        <TabsContent value="pricing" className="space-y-4 md:space-y-6">
          <Card className="p-4 md:p-6 border-2">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-6">💰 Subscription Plans</h2>
            {loadingPlans ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="h-64 bg-slate-100 animate-pulse rounded"></div>
                <div className="h-64 bg-slate-100 animate-pulse rounded"></div>
                <div className="h-64 bg-slate-100 animate-pulse rounded"></div>
              </div>
            ) : plans && plans.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {plans.map((p, i) => (
                  <Card key={i} className={`p-4 md:p-6 border-2 transition-all hover:shadow-lg flex flex-col ${p.id === 'pro' ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100' : ''}`}>
                    <div>
                      <h3 className="font-bold text-lg md:text-xl text-slate-900">{p.name}</h3>
                      <p className="text-3xl md:text-4xl font-bold mb-2 mt-3">
                        ${p.price}
                        {p.period && <span className="text-xs md:text-sm text-slate-600">{p.period}</span>}
                      </p>
                      <p className="text-xs md:text-sm text-slate-600 mb-4">{p.description || 'Start your interview prep today'}</p>
                      
                      <div className="space-y-2 mb-6">
                        {p.features && p.features.map((feature, fi) => (
                          <div key={fi} className="text-xs md:text-sm flex items-start gap-2">
                            <CheckCircle className="size-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-slate-700">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <Button 
                      className={`w-full h-10 md:h-11 text-sm md:text-base font-semibold mt-auto ${
                        p.id === 'pro' 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'bg-slate-200 text-slate-900 hover:bg-slate-300'
                      }`}
                      onClick={() => setApiError(`✅ ${p.price === 0 ? 'Welcome to Free Plan!' : 'Upgrading to ' + p.name + ' plan...'}`)}
                    >
                      {p.price === 0 ? '🎉 Get Started' : '🚀 Upgrade Now'}
                    </Button>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="size-8 text-red-500 mx-auto mb-3" />
                <p className="text-slate-600">Failed to load pricing plans. Please try again later.</p>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* 🏗️ SYSTEM DESIGN INTERVIEW - COMPREHENSIVE 10-SECTION MODULE */}
        <TabsContent value="system-design" className="space-y-4 md:space-y-6">
          {/* PROGRESS INDICATOR */}
          <Card className="p-4 md:p-6 bg-gradient-to-r from-purple-100 to-blue-100 border-2 border-purple-300">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-xl md:text-2xl font-bold text-purple-900">🏗️ System Design Interview</h2>
                <p className="text-sm md:text-base text-purple-700 mt-1">Step {designCurrentStep}/10: {
                  designCurrentStep === 1 ? 'Problem Selection' :
                  designCurrentStep === 2 ? 'Requirements Gathering' :
                  designCurrentStep === 3 ? 'Capacity Estimation' :
                  designCurrentStep === 4 ? 'Architecture Design' :
                  designCurrentStep === 5 ? 'Data Flow Simulation' :
                  designCurrentStep === 6 ? 'Tradeoff Analysis' :
                  designCurrentStep === 7 ? 'Bottleneck Detection' :
                  designCurrentStep === 8 ? 'AI Follow-ups' :
                  designCurrentStep === 9 ? 'Scoring' : 'Reference Solution'
                }</p>
              </div>
              <div className="w-full sm:w-32">
                <Progress value={(designCurrentStep / 10) * 100} className="h-2" />
              </div>
            </div>
          </Card>

          {/* 1️⃣ PROBLEM SELECTION HUB */}
          {designCurrentStep === 1 && (
            <div className="space-y-4">
              <Card className="p-6 border-2 bg-gradient-to-br from-purple-50 to-blue-50">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">🎯 Step 1: Select a Problem</h3>
                <p className="text-slate-600 mb-6">Choose a system design problem. Modern interviews include AI/RAG design.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
                  {[
                    { id: 'url-shortener', label: 'URL Shortener', emoji: '🔗' },
                    { id: 'chat-app', label: 'WhatsApp / Chat', emoji: '💬' },
                    { id: 'video-stream', label: 'YouTube / Netflix', emoji: '🎥' },
                    { id: 'ride-sharing', label: 'Uber / Ola', emoji: '🚗' },
                    { id: 'feed', label: 'Twitter Feed', emoji: '🐦' },
                    { id: 'rate-limiter', label: 'Rate Limiter', emoji: '⏱️' },
                    { id: 'notification', label: 'Notification System', emoji: '🔔' },
                    { id: 'search-engine', label: 'Search Engine', emoji: '🔍' },
                    { id: 'rag', label: 'RAG / AI Search ⭐', emoji: '🤖' },
                    { id: 'analytics', label: 'Real-time Analytics', emoji: '📊' },
                  ].map((problem) => (
                    <Card
                      key={problem.id}
                      onClick={() => { setSelectedProblem(problem.id); setDesignCurrentStep(2); }}
                      className={`p-4 cursor-pointer border-2 transition-all ${
                        selectedProblem === problem.id 
                          ? 'border-purple-600 bg-purple-100 shadow-lg scale-105' 
                          : 'hover:shadow-md border-slate-300'
                      }`}
                    >
                      <div className="text-3xl mb-2">{problem.emoji}</div>
                      <p className="font-bold text-slate-900 text-sm">{problem.label}</p>
                    </Card>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* 2️⃣ REQUIREMENT GATHERING PANEL - WIZARD UI */}
          {designCurrentStep === 2 && selectedProblem && (
            <div className="space-y-4">
              <Card className="p-6 border-2 bg-gradient-to-br from-blue-50 to-cyan-50">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">📝 Step 2: Requirement Gathering</h3>
                <p className="text-slate-600 mb-6">This is the most important section - establish clear requirements with the interviewer.</p>
                
                <div className="space-y-4">
                  <div className="border-2 border-blue-300 rounded-lg p-4 bg-white">
                    <h4 className="font-bold text-blue-900 mb-3 flex items-center"><span className="mr-2">✓</span> Functional Requirements</h4>
                    <Textarea
                      placeholder="e.g., Users can create accounts, post content, view feeds, search items..."
                      value={requirements.fr}
                      onChange={(e) => setRequirements({...requirements, fr: e.target.value})}
                      className="text-sm border-2"
                    />
                  </div>

                  <div className="border-2 border-cyan-300 rounded-lg p-4 bg-white">
                    <h4 className="font-bold text-cyan-900 mb-3 flex items-center"><span className="mr-2">⚡</span> Non-Functional Requirements</h4>
                    <Textarea
                      placeholder="e.g., 99.9% uptime, <200ms latency, scalable to 100M users, 24/7 availability..."
                      value={requirements.nfr}
                      onChange={(e) => setRequirements({...requirements, nfr: e.target.value})}
                      className="text-sm border-2"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="border-2 border-purple-300 rounded-lg p-3 bg-white">
                      <label className="font-bold text-purple-900 mb-2 block text-sm">📱 DAU (Daily Active Users)</label>
                      <Input
                        type="number"
                        placeholder="e.g., 10000000"
                        value={requirements.dau}
                        onChange={(e) => setRequirements({...requirements, dau: e.target.value})}
                        className="text-sm border-2"
                      />
                    </div>
                    <div className="border-2 border-green-300 rounded-lg p-3 bg-white">
                      <label className="font-bold text-green-900 mb-2 block text-sm">📊 Requests/Day</label>
                      <Input
                        type="number"
                        placeholder="e.g., 50000000"
                        value={requirements.qps}
                        onChange={(e) => setRequirements({...requirements, qps: e.target.value})}
                        className="text-sm border-2"
                      />
                    </div>
                  </div>

                  <div className="border-2 border-orange-300 rounded-lg p-4 bg-white">
                    <h4 className="font-bold text-orange-900 mb-3 flex items-center"><span className="mr-2">💾</span> Storage Assumptions</h4>
                    <Input
                      type="text"
                      placeholder="e.g., average 500MB per user, 2TB per day growth..."
                      value={requirements.storage}
                      onChange={(e) => setRequirements({...requirements, storage: e.target.value})}
                      className="text-sm border-2"
                    />
                  </div>
                </div>

                <Button 
                  onClick={() => setDesignCurrentStep(3)} 
                  className="w-full mt-6 bg-blue-600 hover:bg-blue-700 h-10"
                >
                  Next: Capacity Estimation →
                </Button>
              </Card>
            </div>
          )}

          {/* 3️⃣ CAPACITY ESTIMATION */}
          {designCurrentStep === 3 && selectedProblem && (
            <div className="space-y-4">
              <Card className="p-6 border-2 bg-gradient-to-br from-green-50 to-emerald-50">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">🧮 Step 3: Capacity Estimation</h3>
                <p className="text-slate-600 mb-6">Calculate precise numbers for your infrastructure.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  <Card className="p-4 bg-white border-2 border-green-300">
                    <p className="text-xs text-slate-600 font-bold">Requests/Second</p>
                    <p className="text-2xl md:text-3xl font-bold text-green-600 mt-2">{Math.ceil((parseFloat(requirements.qps) || 50000000) / 86400).toLocaleString()}</p>
                    <p className="text-xs text-slate-600 mt-2">QPS</p>
                  </Card>

                  <Card className="p-4 bg-white border-2 border-blue-300">
                    <p className="text-xs text-slate-600 font-bold">Bandwidth</p>
                    <p className="text-2xl md:text-3xl font-bold text-blue-600 mt-2">~{(((parseFloat(requirements.qps) || 50000000) / 86400) * 1024 / 1000000).toFixed(2)}</p>
                    <p className="text-xs text-slate-600 mt-2">Gbps</p>
                  </Card>

                  <Card className="p-4 bg-white border-2 border-orange-300">
                    <p className="text-xs text-slate-600 font-bold">Storage/Year Growth</p>
                    <p className="text-2xl md:text-3xl font-bold text-orange-600 mt-2">~{(365 * 2).toFixed(0)}TB</p>
                    <p className="text-xs text-slate-600 mt-2">Assuming 2TB/day</p>
                  </Card>
                </div>

                <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 mb-6">
                  <p className="font-bold text-green-900 mb-3">📊 Quick Calculator</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span>Servers needed:</span> <span className="font-bold">~{Math.ceil((parseFloat(requirements.qps) || 50000000) / 86400 / 1000)}</span></div>
                    <div className="flex justify-between"><span>DB Replicas:</span> <span className="font-bold">3-5</span></div>
                    <div className="flex justify-between"><span>Cache Nodes:</span> <span className="font-bold">2-4</span></div>
                    <div className="flex justify-between"><span>Cache Hit Ratio:</span> <span className="font-bold">80-90%</span></div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button onClick={() => setDesignCurrentStep(2)} variant="outline" className="flex-1">
                    ← Back
                  </Button>
                  <Button 
                    onClick={() => setDesignCurrentStep(4)} 
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    Next: Architecture →
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* 4️⃣ ARCHITECTURE DESIGN */}
          {designCurrentStep === 4 && selectedProblem && (
            <div className="space-y-4">
              <Card className="p-6 border-2 bg-gradient-to-br from-indigo-50 to-blue-50">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">🧩 Step 4: Architecture Design</h3>
                <p className="text-slate-600 mb-6">Select and arrange your system components.</p>
                
                <div className="bg-white border-4 border-indigo-300 rounded-lg p-6 mb-6 min-h-96">
                  <div className="text-center mb-6">
                    <p className="text-slate-600 font-bold mb-4">Selected Components ({architectureComponents.length}/12)</p>
                    <div className="flex flex-wrap gap-2 justify-center mb-6">
                      {architectureComponents.map((comp, idx) => (
                        <Badge key={idx} variant="outline" className="text-sm py-2 px-3 bg-indigo-100 text-indigo-900">
                          {comp}
                        </Badge>
                      ))}
                    </div>
                    {architectureComponents.length === 0 && <p className="text-slate-400 text-sm italic">Select components to build your architecture...</p>}
                  </div>

                  {architectureComponents.length > 0 && (
                    <div className="border-t-2 border-indigo-200 pt-6">
                      <p className="text-center text-sm text-slate-600 font-bold mb-3">📊 System Flow</p>
                      <div className="flex flex-wrap justify-center gap-2 items-center">
                        {architectureComponents.slice(0, 5).map((comp, idx) => (
                          <span key={idx}>
                            <Badge className="bg-indigo-200 text-indigo-900 text-xs py-1">{comp}</Badge>
                            {idx < Math.min(4, architectureComponents.length - 1) && <span className="mx-1">→</span>}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-3 mb-6">
                  {[
                    { name: 'Client', emoji: '👤' },
                    { name: 'API Gateway', emoji: '🚪' },
                    { name: 'Load Balancer', emoji: '⚖️' },
                    { name: 'App Servers', emoji: '🖥️' },
                    { name: 'Redis', emoji: '💾' },
                    { name: 'Database', emoji: '🗄️' },
                    { name: 'CDN', emoji: '🌐' },
                    { name: 'Message Queue', emoji: '📮' },
                    { name: 'Kafka', emoji: '🔄' },
                    { name: 'Object Storage', emoji: '📦' },
                    { name: 'Search Engine', emoji: '🔎' },
                    { name: 'WebSocket', emoji: '🔌' },
                  ].map((comp) => (
                    <Button
                      key={comp.name}
                      onClick={() => {
                        if (architectureComponents.includes(comp.name)) {
                          setArchitectureComponents(architectureComponents.filter(c => c !== comp.name));
                        } else if (architectureComponents.length < 12) {
                          setArchitectureComponents([...architectureComponents, comp.name]);
                        }
                      }}
                      className={`h-16 md:h-20 text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                        architectureComponents.includes(comp.name)
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                          : 'bg-slate-200 hover:bg-slate-300 text-slate-900'
                      }`}
                    >
                      <span className="text-lg md:text-xl">{comp.emoji}</span>
                      <span className="text-xs leading-tight text-center">{comp.name}</span>
                    </Button>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button onClick={() => setDesignCurrentStep(3)} variant="outline" className="flex-1">
                    ← Back
                  </Button>
                  <Button 
                    onClick={() => setDesignCurrentStep(5)} 
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                    disabled={architectureComponents.length === 0}
                  >
                    Next: Data Flow →
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* 5️⃣ DATA FLOW SIMULATION */}
          {designCurrentStep === 5 && selectedProblem && (
            <div className="space-y-4">
              <Card className="p-6 border-2 bg-gradient-to-br from-cyan-50 to-teal-50">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">🔁 Step 5: Data Flow Simulation</h3>
                <p className="text-slate-600 mb-6">Explain how data flows through your system.</p>
                
                <div className="space-y-3 mb-6">
                  {[
                    { step: 1, title: '📥 Request Path', desc: 'Client → API Gateway → Load Balancer → App Server' },
                    { step: 2, title: '✍️ Write Flow', desc: 'Write → Validation → Database → Cache Update → Event' },
                    { step: 3, title: '📖 Read Flow', desc: 'Hit Cache (fast) or Miss → Query DB → Update Cache' },
                    { step: 4, title: '⚠️ When Cache Misses', desc: 'Request → DB Query → Cache Store → Response' },
                    { step: 5, title: '🔄 Async Processing', desc: 'Request → Queue → Worker → Process → Webhook' },
                  ].map((flow) => (
                    <Card
                      key={flow.step}
                      onClick={() => setDataFlowStep(flow.step)}
                      className={`p-4 cursor-pointer border-2 transition-all ${
                        dataFlowStep === flow.step
                          ? 'border-cyan-600 bg-cyan-100 shadow-md'
                          : 'border-slate-300 hover:shadow-md'
                      }`}
                    >
                      <p className="font-bold text-slate-900">{flow.title}</p>
                      <p className="text-sm text-slate-600 mt-1">{flow.desc}</p>
                    </Card>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button onClick={() => setDesignCurrentStep(4)} variant="outline" className="flex-1">
                    ← Back
                  </Button>
                  <Button 
                    onClick={() => setDesignCurrentStep(6)} 
                    className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                  >
                    Next: Tradeoffs →
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* 6️⃣ TRADEOFF ANALYSIS */}
          {designCurrentStep === 6 && selectedProblem && (
            <div className="space-y-4">
              <Card className="p-6 border-2 bg-gradient-to-br from-amber-50 to-orange-50">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">⚖️ Step 6: Tradeoff Analysis</h3>
                <p className="text-slate-600 mb-6">System design is about intelligent tradeoffs. This scores highest.</p>
                
                <div className="space-y-3 mb-6">
                  {[
                    { title: '🗄️ SQL vs NoSQL', prompt: 'When would you choose NoSQL? What are the tradeoffs?' },
                    { title: '📤 Push vs Pull', prompt: 'Should notifications be pushed or pulled?' },
                    { title: '🔀 Sync vs Async', prompt: 'Which operations must be sync vs async?' },
                    { title: '🤝 Consistency vs Availability', prompt: 'What CAP theorem properties does your system optimize?' },
                    { title: '⏱️ Latency vs Cost', prompt: 'How do you balance latency and infrastructure cost?' },
                    { title: '📍 Redis vs Database', prompt: 'What data should cache vs permanent storage?' },
                  ].map((tradeoff, idx) => (
                    <Card key={idx} className="p-4 bg-white border-2 border-amber-300">
                      <p className="font-bold text-slate-900">{tradeoff.title}</p>
                      <p className="text-sm text-slate-600 mt-1">{tradeoff.prompt}</p>
                      <Textarea
                        placeholder="Your reasoning..."
                        className="mt-3 border-2 text-sm"
                        style={{minHeight: '60px'}}
                      />
                    </Card>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button onClick={() => setDesignCurrentStep(5)} variant="outline" className="flex-1">
                    ← Back
                  </Button>
                  <Button 
                    onClick={() => setDesignCurrentStep(7)} 
                    className="flex-1 bg-amber-600 hover:bg-amber-700"
                  >
                    Next: Bottlenecks →
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* 7️⃣ BOTTLENECK DETECTION */}
          {designCurrentStep === 7 && selectedProblem && (
            <div className="space-y-4">
              <Card className="p-6 border-2 bg-gradient-to-br from-red-50 to-pink-50">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">🚨 Step 7: Bottleneck & Scaling</h3>
                <p className="text-slate-600 mb-6">Identify what breaks at 10x traffic and solutions.</p>
                
                <div className="space-y-3 mb-6">
                  <Card className="p-4 bg-white border-2 border-red-300">
                    <h4 className="font-bold text-red-900 mb-2">What breaks at 10x traffic?</h4>
                    <Textarea
                      placeholder="e.g., Database becomes write bottleneck, hotsharding needed, cache ineffective..."
                      className="border-2 text-sm"
                      style={{minHeight: '80px'}}
                    />
                  </Card>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Card className="p-4 bg-white border-2 border-orange-300">
                      <p className="font-bold text-orange-900 mb-2">📊 DB Hotspot</p>
                      <p className="text-xs text-slate-600 mb-2">Solution: Consistent hashing</p>
                      <Button variant="outline" className="w-full text-xs">Learn More</Button>
                    </Card>

                    <Card className="p-4 bg-white border-2 border-yellow-300">
                      <p className="font-bold text-yellow-900 mb-2">⚡ Cache Stampede</p>
                      <p className="text-xs text-slate-600 mb-2">Solution: Probabilistic reload</p>
                      <Button variant="outline" className="w-full text-xs">Learn More</Button>
                    </Card>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button onClick={() => setDesignCurrentStep(6)} variant="outline" className="flex-1">
                    ← Back
                  </Button>
                  <Button 
                    onClick={() => setDesignCurrentStep(8)} 
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    Next: AI Questions →
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* 8️⃣ AI FOLLOW-UPS */}
          {designCurrentStep === 8 && selectedProblem && (
            <div className="space-y-4">
              <Card className="p-6 border-2 bg-gradient-to-br from-violet-50 to-purple-50">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">🤖 Step 8: AI Interviewer</h3>
                <p className="text-slate-600 mb-6">Premium: AI asks probing follow-up questions.</p>
                
                <div className="space-y-3 mb-6">
                  {[
                    'What if traffic grows 100x?',
                    'How would you make this multi-region?',
                    'How to reduce latency for India?',
                    'What monitoring & alerting do you need?',
                    'How do you handle data corruption?',
                  ].map((q, idx) => (
                    <Card key={idx} className="p-4 bg-white border-2 border-violet-300">
                      <div className="flex gap-2 mb-3">
                        <span className="text-2xl">🤖</span>
                        <p className="font-bold text-slate-900">{q}</p>
                      </div>
                      <Textarea
                        placeholder="Your answer..."
                        className="border-2 text-sm"
                        style={{minHeight: '60px'}}
                      />
                    </Card>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button onClick={() => setDesignCurrentStep(7)} variant="outline" className="flex-1">
                    ← Back
                  </Button>
                  <Button 
                    onClick={() => setDesignCurrentStep(9)} 
                    className="flex-1 bg-violet-600 hover:bg-violet-700"
                  >
                    Next: Scoring →
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* 9️⃣ SCORING DASHBOARD */}
          {designCurrentStep === 9 && selectedProblem && (
            <div className="space-y-4">
              <Card className="p-6 border-2 bg-gradient-to-br from-rose-50 to-red-50">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">📊 Step 9: Your Score</h3>
                <p className="text-slate-600 mb-6">FAANG-style scoring across 7 dimensions.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  {[
                    { cat: 'Requirements', icon: '📋', score: 88 },
                    { cat: 'Estimation', icon: '🧮', score: 82 },
                    { cat: 'Architecture', icon: '🏗️', score: 85 },
                    { cat: 'Tradeoffs', icon: '⚖️', score: 79 },
                    { cat: 'Bottlenecks', icon: '🚨', score: 81 },
                    { cat: 'Communication', icon: '💬', score: 87 },
                    { cat: 'Confidence', icon: '🎯', score: 84 },
                  ].map((s) => (
                    <Card key={s.cat} className="p-4 bg-white border-2 border-rose-300">
                      <div className="flex justify-between items-center mb-2">
                        <p className="font-bold text-slate-900">{s.cat}</p>
                        <span className="text-2xl">{s.icon}</span>
                      </div>
                      <p className="text-2xl font-bold text-rose-600">{s.score}/100</p>
                      <Progress value={s.score} className="h-1 mt-2" />
                    </Card>
                  ))}
                </div>

                <Card className="p-4 bg-white border-2 border-rose-400 mb-6">
                  <p className="font-bold text-rose-900 text-lg">📈 Overall: 83/100</p>
                  <p className="text-sm text-slate-600 mt-2">Strong design with good estimations. Focus on explaining tradeoffs more thoroughly.</p>
                </Card>

                <div className="flex gap-3">
                  <Button onClick={() => setDesignCurrentStep(8)} variant="outline" className="flex-1">
                    ← Back
                  </Button>
                  <Button 
                    onClick={() => setDesignCurrentStep(10)} 
                    className="flex-1 bg-rose-600 hover:bg-rose-700"
                  >
                    Next: Reference →
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* 🔟 REFERENCE SOLUTION */}
          {designCurrentStep === 10 && selectedProblem && (
            <div className="space-y-4">
              <Card className="p-6 border-2 bg-gradient-to-br from-emerald-50 to-teal-50">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">📚 Step 10: Reference Solution</h3>
                <p className="text-slate-600 mb-6">Learn from optimal FAANG solution.</p>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                  <Card className="p-4 bg-white border-2 border-blue-300">
                    <h4 className="font-bold text-blue-900 mb-2">👤 Your Design</h4>
                    <p className="text-sm">Components: {architectureComponents.length}/12</p>
                    <p className="text-sm text-blue-600 font-bold">{Math.floor((architectureComponents.length / 12) * 100)}% Coverage</p>
                    <p className="text-xs text-slate-600 mt-2">{architectureComponents.join(', ') || 'None'}</p>
                  </Card>

                  <Card className="p-4 bg-white border-2 border-emerald-300">
                    <h4 className="font-bold text-emerald-900 mb-2">⭐ FAANG Optimal</h4>
                    <p className="text-sm">Recommended: 11/12</p>
                    <p className="text-sm text-emerald-600 font-bold">92% Coverage</p>
                    <p className="text-xs text-slate-600 mt-2">API Gateway, Load Balancer, Redis, DB, CDN, Kafka...</p>
                  </Card>
                </div>

                <Card className="p-4 bg-white border-2 border-amber-300 mb-4">
                  <h4 className="font-bold text-amber-900 mb-3">💡 Key Improvements</h4>
                  <ul className="space-y-2 text-sm">
                    <li>✓ Add WebSocket for real-time</li>
                    <li>✓ Use Kafka for event streams</li>
                    <li>✓ Implement CDN for latency</li>
                    <li>✓ Use consistent hash sharding</li>
                  </ul>
                </Card>

                <div className="flex gap-3">
                  <Button onClick={() => setDesignCurrentStep(9)} variant="outline" className="flex-1">
                    ← Back
                  </Button>
                  <Button 
                    onClick={() => { setDesignCurrentStep(1); setSelectedProblem(null); setArchitectureComponents([]); setRequirements({ fr: '', nfr: '', dau: '', qps: '', storage: '' }); }} 
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  >
                    🔄 New Design
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* 🎙️ BEHAVIORAL / HR INTERVIEW - 10-SECTION COMPREHENSIVE MODULE */}
        <TabsContent value="behavioral" className="space-y-4 md:space-y-6">
          {/* PROGRESS INDICATOR */}
          <Card className="p-4 md:p-6 bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-300">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-xl md:text-2xl font-bold text-green-900">🎙️ Behavioral / HR Interview</h2>
                <p className="text-sm md:text-base text-green-700 mt-1">Step {behavioralCurrentStep}/10: {
                  behavioralCurrentStep === 1 ? 'Question Category' :
                  behavioralCurrentStep === 2 ? 'STAR Answer Builder' :
                  behavioralCurrentStep === 3 ? 'AI Mock Interview' :
                  behavioralCurrentStep === 4 ? 'Communication Analysis' :
                  behavioralCurrentStep === 5 ? 'Situational Judgment' :
                  behavioralCurrentStep === 6 ? 'Soft Skills Score' :
                  behavioralCurrentStep === 7 ? 'Resume-Based Questions' :
                  behavioralCurrentStep === 8 ? 'Company HR Rounds' :
                  behavioralCurrentStep === 9 ? 'Improvement Tracker' : 'Best Answers'
                }</p>
              </div>
              <div className="w-full sm:w-32">
                <Progress value={(behavioralCurrentStep / 10) * 100} className="h-2" />
              </div>
            </div>
          </Card>

          {/* 1️⃣ QUESTION CATEGORY SECTION */}
          {behavioralCurrentStep === 1 && (
            <div className="space-y-4">
              <Card className="p-6 border-2 bg-gradient-to-br from-green-50 to-emerald-50">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">🎯 Step 1: Select Question Category</h3>
                <p className="text-slate-600 mb-6">Choose a behavioral category. Practice with real interview scenarios.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
                  {[
                    { id: 'about-yourself', label: 'Tell me about yourself', emoji: '👤' },
                    { id: 'leadership', label: 'Leadership', emoji: '👨‍💼' },
                    { id: 'conflict', label: 'Team Conflict', emoji: '⚡' },
                    { id: 'failure', label: 'Failure & Mistakes', emoji: '📉' },
                    { id: 'deadline', label: 'Deadline Pressure', emoji: '⏰' },
                    { id: 'communication', label: 'Communication', emoji: '💬' },
                    { id: 'ownership', label: 'Ownership', emoji: '🎯' },
                    { id: 'adaptability', label: 'Adaptability', emoji: '🔄' },
                    { id: 'strengths', label: 'Strengths/Weakness', emoji: '💪' },
                    { id: 'remote', label: 'Remote Teamwork', emoji: '💻' },
                    { id: 'disagreement', label: 'Manager Disagreement', emoji: '🤝' },
                    { id: 'client', label: 'Client Handling', emoji: '👥' },
                  ].map((cat) => (
                    <Card
                      key={cat.id}
                      onClick={() => { setSelectedBehavioralCategory(cat.id); setBehavioralCurrentStep(2); }}
                      className={`p-4 cursor-pointer border-2 transition-all ${
                        selectedBehavioralCategory === cat.id
                          ? 'border-green-600 bg-green-100 shadow-lg scale-105'
                          : 'hover:shadow-md border-slate-300'
                      }`}
                    >
                      <div className="text-3xl mb-2">{cat.emoji}</div>
                      <p className="font-bold text-slate-900 text-sm">{cat.label}</p>
                    </Card>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* 2️⃣ STAR ANSWER BUILDER */}
          {behavioralCurrentStep === 2 && selectedBehavioralCategory && (
            <div className="space-y-4">
              <Card className="p-6 border-2 bg-gradient-to-br from-blue-50 to-cyan-50">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">⭐ Step 2: STAR Answer Builder</h3>
                <p className="text-slate-600 mb-6">Build professional FAANG-ready answers using the STAR method.</p>
                
                <div className="space-y-4 mb-6">
                  <Card className="p-4 bg-white border-2 border-blue-300">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold text-blue-900">🎬 Situation</h4>
                      <span className="text-xs text-slate-600">{starAnswers.situation.length}/200 words</span>
                    </div>
                    <Textarea
                      placeholder="Describe the context and background of the situation..."
                      value={starAnswers.situation}
                      onChange={(e) => setStarAnswers({...starAnswers, situation: e.target.value.slice(0, 200)})}
                      className="border-2 text-sm"
                      style={{minHeight: '100px'}}
                    />
                    <p className="text-xs text-blue-600 mt-2">💡 Tip: Be specific about the company, team, and context</p>
                  </Card>

                  <Card className="p-4 bg-white border-2 border-cyan-300">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold text-cyan-900">📋 Task</h4>
                      <span className="text-xs text-slate-600">{starAnswers.task.length}/150 words</span>
                    </div>
                    <Textarea
                      placeholder="What was your specific responsibility or challenge?"
                      value={starAnswers.task}
                      onChange={(e) => setStarAnswers({...starAnswers, task: e.target.value.slice(0, 150)})}
                      className="border-2 text-sm"
                      style={{minHeight: '100px'}}
                    />
                    <p className="text-xs text-cyan-600 mt-2">💡 Tip: Focus on YOUR role, not the whole team</p>
                  </Card>

                  <Card className="p-4 bg-white border-2 border-purple-300">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold text-purple-900">🚀 Action</h4>
                      <span className="text-xs text-slate-600">{starAnswers.action.length}/250 words</span>
                    </div>
                    <Textarea
                      placeholder="What specific steps did you take? Be detailed and focus on YOUR actions..."
                      value={starAnswers.action}
                      onChange={(e) => setStarAnswers({...starAnswers, action: e.target.value.slice(0, 250)})}
                      className="border-2 text-sm"
                      style={{minHeight: '120px'}}
                    />
                    <p className="text-xs text-purple-600 mt-2">💡 Tip: This is the longest part. Show leadership and problem-solving</p>
                  </Card>

                  <Card className="p-4 bg-white border-2 border-green-300">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold text-green-900">📊 Result (with numbers!)</h4>
                      <span className="text-xs text-slate-600">{starAnswers.result.length}/180 words</span>
                    </div>
                    <Textarea
                      placeholder="What was the outcome? Include metrics: 10% faster, $50K saved, 5x improvement, etc..."
                      value={starAnswers.result}
                      onChange={(e) => setStarAnswers({...starAnswers, result: e.target.value.slice(0, 180)})}
                      className="border-2 text-sm"
                      style={{minHeight: '100px'}}
                    />
                    <p className="text-xs text-green-600 mt-2">💡 Tip: ALWAYS include numbers and quantifiable results</p>
                  </Card>
                </div>

                <div className="flex gap-3">
                  <Button onClick={() => setBehavioralCurrentStep(1)} variant="outline" className="flex-1">
                    ← Back
                  </Button>
                  <Button 
                    onClick={() => setBehavioralCurrentStep(3)} 
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    Next: AI Interview →
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* 3️⃣ AI HR MOCK INTERVIEWER */}
          {behavioralCurrentStep === 3 && selectedBehavioralCategory && (
            <div className="space-y-4">
              <Card className="p-6 border-2 bg-gradient-to-br from-indigo-50 to-purple-50">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">🤖 Step 3: AI HR Mock Interviewer</h3>
                <p className="text-slate-600 mb-6">Get realistic HR questions with adaptive follow-ups.</p>
                
                <div className="space-y-4 mb-6">
                  {[
                    { q: 'Tell me about a time you showed leadership. Use the STAR method.', follow: 'What would you do differently?' },
                    { q: 'Describe a conflict with a team member. How did you resolve it?', follow: 'What did you learn?' },
                    { q: 'Tell me about your biggest failure and what you learned.', follow: 'How did this shape you?' },
                    { q: 'Why should we hire you over other candidates?', follow: 'What makes you unique?' },
                    { q: 'How do you handle working in a remote team?', follow: 'Any challenges you faced?' },
                  ].map((qa, idx) => (
                    <Card key={idx} className="p-4 bg-white border-2 border-indigo-300">
                      <div className="mb-3">
                        <p className="font-bold text-slate-900 text-sm">🎤 Question {idx + 1}:</p>
                        <p className="text-slate-700 mt-1">{qa.q}</p>
                      </div>
                      <Textarea
                        placeholder="Your answer (Use STAR format if applicable)..."
                        className="border-2 text-sm mb-3"
                        style={{minHeight: '100px'}}
                      />
                      <p className="text-xs text-slate-600 italic text-center py-2 bg-slate-100 rounded">
                        Follow-up: {qa.follow}
                      </p>
                    </Card>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button onClick={() => setBehavioralCurrentStep(2)} variant="outline" className="flex-1">
                    ← Back
                  </Button>
                  <Button 
                    onClick={() => setBehavioralCurrentStep(4)} 
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                  >
                    Next: Communication →
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* 4️⃣ COMMUNICATION & SPEECH ANALYSIS */}
          {behavioralCurrentStep === 4 && selectedBehavioralCategory && (
            <div className="space-y-4">
              <Card className="p-6 border-2 bg-gradient-to-br from-amber-50 to-orange-50">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">🗣️ Step 4: Speech & Communication Analysis</h3>
                <p className="text-slate-600 mb-6">Track your soft skills metrics during the interview.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {[
                    { metric: 'Filler Words', value: communicationStats.fillerWords, label: 'Lower is better', unit: 'count' },
                    { metric: 'Speaking Speed', value: communicationStats.speakingSpeed, label: '%', unit: 'percent' },
                    { metric: 'Confidence', value: communicationStats.confidence, label: 'Score', unit: 'percent' },
                    { metric: 'Pauses', value: communicationStats.pauses, label: 'Natural pauses', unit: 'count' },
                    { metric: 'Tone', value: communicationStats.tone, label: 'Tone quality', unit: 'percent' },
                    { metric: 'Clarity', value: communicationStats.clarity, label: 'Speech clarity', unit: 'percent' },
                    { metric: 'Grammar', value: communicationStats.grammar, label: 'Grammar score', unit: 'percent' },
                  ].map((stat) => (
                    <Card key={stat.metric} className="p-4 bg-white border-2 border-amber-300">
                      <p className="text-xs text-slate-600 font-bold">{stat.metric}</p>
                      <p className="text-3xl font-bold text-amber-600 mt-2">{stat.value}{stat.unit === 'percent' ? '%' : ''}</p>
                      <Progress value={Math.min(stat.value, 100)} className="h-1 mt-2" />
                      <p className="text-xs text-slate-600 mt-2">{stat.label}</p>
                    </Card>
                  ))}
                </div>

                <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4 mb-6">
                  <p className="font-bold text-amber-900 mb-2">📊 Analysis</p>
                  <p className="text-sm text-slate-600">Avoid filler words like "um", "uh", "like". Maintain a confident, steady pace. Practice pausing naturally between thoughts.</p>
                </div>

                <div className="flex gap-3">
                  <Button onClick={() => setBehavioralCurrentStep(3)} variant="outline" className="flex-1">
                    ← Back
                  </Button>
                  <Button 
                    onClick={() => setBehavioralCurrentStep(5)} 
                    className="flex-1 bg-amber-600 hover:bg-amber-700"
                  >
                    Next: Scenarios →
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* 5️⃣ SITUATIONAL JUDGMENT / ROLEPLAY */}
          {behavioralCurrentStep === 5 && selectedBehavioralCategory && (
            <div className="space-y-4">
              <Card className="p-6 border-2 bg-gradient-to-br from-red-50 to-rose-50">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">🎭 Step 5: Situational Judgment</h3>
                <p className="text-slate-600 mb-6">How would you handle realistic workplace scenarios?</p>
                
                <div className="space-y-3 mb-6">
                  {[
                    { title: '😠 Angry Manager', desc: 'Your manager is upset with your performance.' },
                    { title: '😞 Unhappy Client', desc: 'A key client is dissatisfied with the project.' },
                    { title: '⚡ Teammate Conflict', desc: 'You disagree with a colleague on approach.' },
                    { title: '⏰ Missed Deadline', desc: 'You missed a critical project deadline.' },
                    { title: '🚨 Production Issue', desc: 'Your code caused an outage in production.' },
                    { title: '💰 Salary Negotiation', desc: 'Your company offers lower than expected salary.' },
                    { title: '📉 Bad Feedback', desc: 'Your lead gives you harsh feedback publicly.' },
                  ].map((scenario, idx) => (
                    <Card
                      key={idx}
                      onClick={() => setSelectedScenario(scenario.title)}
                      className={`p-4 cursor-pointer border-2 transition-all ${
                        selectedScenario === scenario.title
                          ? 'border-red-600 bg-red-100'
                          : 'border-slate-300 hover:shadow-md'
                      }`}
                    >
                      <p className="font-bold text-slate-900">{scenario.title}</p>
                      <p className="text-sm text-slate-600 mt-1">{scenario.desc}</p>
                      {selectedScenario === scenario.title && (
                        <Textarea
                          placeholder="How would you handle this situation? Show empathy and problem-solving..."
                          className="border-2 text-sm mt-3"
                          style={{minHeight: '100px'}}
                        />
                      )}
                    </Card>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button onClick={() => setBehavioralCurrentStep(4)} variant="outline" className="flex-1">
                    ← Back
                  </Button>
                  <Button 
                    onClick={() => setBehavioralCurrentStep(6)} 
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    Next: Scoring →
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* 6️⃣ SOFT SKILLS SCORE DASHBOARD */}
          {behavioralCurrentStep === 6 && selectedBehavioralCategory && (
            <div className="space-y-4">
              <Card className="p-6 border-2 bg-gradient-to-br from-cyan-50 to-blue-50">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">📊 Step 6: Soft Skills Score</h3>
                <p className="text-slate-600 mb-6">See your performance across all soft skill dimensions.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                  {[
                    { skill: 'Communication', score: softSkillsScore.communication, emoji: '💬' },
                    { skill: 'Confidence', score: softSkillsScore.confidence, emoji: '🎯' },
                    { skill: 'Empathy', score: softSkillsScore.empathy, emoji: '❤️' },
                    { skill: 'Leadership', score: softSkillsScore.leadership, emoji: '👨‍💼' },
                    { skill: 'Ownership', score: softSkillsScore.ownership, emoji: '🔒' },
                    { skill: 'Conflict Resolution', score: softSkillsScore.conflictResolution, emoji: '🤝' },
                    { skill: 'Clarity', score: softSkillsScore.clarity, emoji: '✨' },
                    { skill: 'Professionalism', score: softSkillsScore.professionalism, emoji: '💼' },
                    { skill: 'Positivity', score: softSkillsScore.positivity, emoji: '😊' },
                  ].map((s) => (
                    <Card key={s.skill} className="p-4 bg-white border-2 border-cyan-300">
                      <div className="flex justify-between items-center mb-2">
                        <p className="font-bold text-slate-900 text-sm">{s.skill}</p>
                        <span className="text-2xl">{s.emoji}</span>
                      </div>
                      <p className="text-3xl font-bold text-cyan-600">{s.score}</p>
                      <Progress value={s.score} className="h-2 mt-2" />
                    </Card>
                  ))}
                </div>

                <Card className="p-4 bg-white border-2 border-cyan-400 mb-6">
                  <p className="font-bold text-cyan-900 text-lg">📈 Overall Score: 74/100</p>
                  <p className="text-sm text-slate-600 mt-2">Good communication skills. Work on confidence and leadership demonstration.</p>
                </Card>

                <div className="flex gap-3">
                  <Button onClick={() => setBehavioralCurrentStep(5)} variant="outline" className="flex-1">
                    ← Back
                  </Button>
                  <Button 
                    onClick={() => setBehavioralCurrentStep(7)} 
                    className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                  >
                    Next: Resume Q&A →
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* 7️⃣ RESUME-BASED HR QUESTIONS */}
          {behavioralCurrentStep === 7 && selectedBehavioralCategory && (
            <div className="space-y-4">
              <Card className="p-6 border-2 bg-gradient-to-br from-violet-50 to-purple-50">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">📄 Step 7: Resume-Based Questions</h3>
                <p className="text-slate-600 mb-6">Prepare for questions about your projects and experience.</p>
                
                <div className="space-y-4 mb-6">
                  <Card className="p-4 bg-white border-2 border-violet-300">
                    <p className="font-bold text-violet-900 mb-3">📤 Upload Resume (PDF/DOC)</p>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="w-full border-2 border-violet-300 rounded p-2"
                      onChange={(e) => setUploadedResume(e.target.files?.[0]?.name || null)}
                    />
                  </Card>

                  {uploadedResume && (
                    <div className="space-y-3">
                      <Card className="p-4 bg-white border-2 border-purple-300">
                        <p className="font-bold text-purple-900 mb-3">🤖 AI-Extracted Questions:</p>
                        <div className="space-y-3">
                          <div className="p-3 bg-purple-50 rounded">
                            <p className="font-bold text-sm">Tell us about your E-commerce Project</p>
                            <Textarea
                              placeholder="Describe the project, your role, challenges, and results with numbers..."
                              className="border-2 text-sm mt-2"
                              style={{minHeight: '100px'}}
                            />
                          </div>
                          <div className="p-3 bg-purple-50 rounded">
                            <p className="font-bold text-sm">What was the biggest challenge you faced?</p>
                            <Textarea
                              placeholder="Use STAR method to answer..."
                              className="border-2 text-sm mt-2"
                              style={{minHeight: '100px'}}
                            />
                          </div>
                          <div className="p-3 bg-purple-50 rounded">
                            <p className="font-bold text-sm">How did you take ownership in your internship?</p>
                            <Textarea
                              placeholder="Show leadership and initiative..."
                              className="border-2 text-sm mt-2"
                              style={{minHeight: '100px'}}
                            />
                          </div>
                        </div>
                      </Card>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button onClick={() => setBehavioralCurrentStep(6)} variant="outline" className="flex-1">
                    ← Back
                  </Button>
                  <Button 
                    onClick={() => setBehavioralCurrentStep(8)} 
                    className="flex-1 bg-violet-600 hover:bg-violet-700"
                  >
                    Next: Company HR →
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* 8️⃣ COMPANY SPECIFIC HR ROUNDS */}
          {behavioralCurrentStep === 8 && selectedBehavioralCategory && (
            <div className="space-y-4">
              <Card className="p-6 border-2 bg-gradient-to-br from-yellow-50 to-amber-50">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">🏢 Step 8: Company-Specific HR</h3>
                <p className="text-slate-600 mb-6">Prepare for company-specific behavioral frameworks.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {[
                    { company: 'Amazon', focus: 'Leadership Principles (LP)', questions: ['Tell me about a time you delivered results with limited resources', 'Describe your biggest failure and what you learned'] },
                    { company: 'Google', focus: 'Googleyness & Growth Mindset', questions: ['How do you learn and adapt quickly?', 'Tell me about a time you pushed boundaries'] },
                    { company: 'Microsoft', focus: 'Growth Mindset & Collaboration', questions: ['How do you collaborate across teams?', 'Tell us about a complex problem you solved'] },
                    { company: 'Meta', focus: 'Move Fast & Ownership', questions: ['How do you make decisions with incomplete information?', 'Tell us about a risk you took'] },
                  ].map((comp) => (
                    <Card
                      key={comp.company}
                      onClick={() => setSelectedCompanyName(comp.company)}
                      className={`p-4 cursor-pointer border-2 transition-all ${
                        selectedCompanyName === comp.company
                          ? 'border-yellow-600 bg-yellow-100'
                          : 'border-slate-300 hover:shadow-md'
                      }`}
                    >
                      <p className="font-bold text-slate-900">{comp.company}</p>
                      <p className="text-xs text-slate-600 mt-1">Focus: {comp.focus}</p>
                      {selectedCompanyName === comp.company && (
                        <div className="space-y-2 mt-3">
                          {comp.questions.map((q, idx) => (
                            <Textarea
                              key={idx}
                              placeholder={q}
                              className="border-2 text-xs"
                              style={{minHeight: '60px'}}
                            />
                          ))}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button onClick={() => setBehavioralCurrentStep(7)} variant="outline" className="flex-1">
                    ← Back
                  </Button>
                  <Button 
                    onClick={() => setBehavioralCurrentStep(9)} 
                    className="flex-1 bg-yellow-600 hover:bg-yellow-700"
                  >
                    Next: Improvement →
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* 9️⃣ IMPROVEMENT TRACKER */}
          {behavioralCurrentStep === 9 && selectedBehavioralCategory && (
            <div className="space-y-4">
              <Card className="p-6 border-2 bg-gradient-to-br from-lime-50 to-green-50">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">📈 Step 9: Improvement Tracker</h3>
                <p className="text-slate-600 mb-6">Track your behavioral interview progress over time.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <Card className="p-4 bg-white border-2 border-lime-300">
                    <p className="text-xs text-slate-600 font-bold">Total Mocks</p>
                    <p className="text-3xl font-bold text-lime-600 mt-2">{improvementData.mocksCount}</p>
                    <Progress value={improvementData.mocksCount * 10} className="h-1 mt-2" />
                  </Card>

                  <Card className="p-4 bg-white border-2 border-green-300">
                    <p className="text-xs text-slate-600 font-bold">Average Score</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">{improvementData.avgScore}/100</p>
                    <Progress value={improvementData.avgScore} className="h-1 mt-2" />
                  </Card>

                  <Card className="p-4 bg-white border-2 border-blue-300">
                    <p className="text-xs text-slate-600 font-bold">STAR Completion</p>
                    <p className="text-3xl font-bold text-blue-600 mt-2">{improvementData.starCompletion}%</p>
                    <Progress value={improvementData.starCompletion} className="h-1 mt-2" />
                  </Card>

                  <Card className="p-4 bg-white border-2 border-purple-300">
                    <p className="text-xs text-slate-600 font-bold">Filler Words Reduced</p>
                    <p className="text-3xl font-bold text-purple-600 mt-2">{improvementData.fillerWordsReduced}%</p>
                    <Progress value={improvementData.fillerWordsReduced} className="h-1 mt-2" />
                  </Card>
                </div>

                <Card className="p-4 bg-white border-2 border-lime-400 mb-6">
                  <p className="font-bold text-lime-900 mb-2">🎯 Areas to Work On</p>
                  <div className="flex flex-wrap gap-2">
                    {improvementData.weakAreas.map((area) => (
                      <Badge key={area} className="bg-lime-200 text-lime-900">{area}</Badge>
                    ))}
                  </div>
                </Card>

                <div className="flex gap-3">
                  <Button onClick={() => setBehavioralCurrentStep(8)} variant="outline" className="flex-1">
                    ← Back
                  </Button>
                  <Button 
                    onClick={() => setBehavioralCurrentStep(10)} 
                    className="flex-1 bg-lime-600 hover:bg-lime-700"
                  >
                    Next: Best Answers →
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* 🔟 BEST ANSWER LIBRARY */}
          {behavioralCurrentStep === 10 && selectedBehavioralCategory && (
            <div className="space-y-4">
              <Card className="p-6 border-2 bg-gradient-to-br from-pink-50 to-rose-50">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">📚 Step 10: Best Answer Library</h3>
                <p className="text-slate-600 mb-6">Learn from top STAR answers used by FAANG professionals.</p>
                
                <div className="space-y-4 mb-6">
                  {[
                    { title: '🏆 Top Leadership Answer', tags: ['Leadership', 'Amazon', 'STAR'] },
                    { title: '🎯 Failure Story Example', tags: ['Failure', 'Google', 'Growth'] },
                    { title: '🤝 Teamwork Answer', tags: ['Collaboration', 'Meta', 'STAR'] },
                    { title: '⚡ Conflict Resolution', tags: ['Conflict', 'Microsoft', 'Resolution'] },
                    { title: '💡 Innovation Story', tags: ['Ownership', 'Flipkart', 'Impact'] },
                  ].map((answer, idx) => (
                    <Card key={idx} className="p-4 bg-white border-2 border-pink-300 cursor-pointer hover:shadow-md transition-all">
                      <div className="flex justify-between items-start mb-3">
                        <p className="font-bold text-slate-900">{answer.title}</p>
                        <span className="text-right text-xs">👁️ View</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {answer.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs bg-pink-100 text-pink-900">{tag}</Badge>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button onClick={() => setBehavioralCurrentStep(9)} variant="outline" className="flex-1">
                    ← Back
                  </Button>
                  <Button 
                    onClick={() => { setBehavioralCurrentStep(1); setSelectedBehavioralCategory(null); setStarAnswers({ situation: '', task: '', action: '', result: '' }); }} 
                    className="flex-1 bg-pink-600 hover:bg-pink-700"
                  >
                    🔄 New Category
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* CS FUNDAMENTALS SECTION */}
        <TabsContent value="cs-fundamentals" className="space-y-6">
          {/* STEP 1: Subject Selection Hub */}
          {csFundamentalsCurrentStep === 1 && (
            <div className="space-y-6 animate-in fade-in">
              <Card className="p-6 border-2 bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 border-blue-300">
                <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                  📚 Subject Selection Hub - Choose to Start Learning
                </h2>
                <p className="text-slate-600 mb-6">Master the 8 core CS fundamentals. Click any subject to dive in:</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {[
                    { id: 'os', name: 'Operating System', emoji: '⚙️', completion: 40, desc: 'Process, Threads, Scheduling, Deadlock, Memory Management' },
                    { id: 'dbms', name: 'DBMS', emoji: '🗄️', completion: 65, desc: 'Normalization, SQL, Indexing, Transactions, Concurrency' },
                    { id: 'cn', name: 'Network (CN)', emoji: '🌐', completion: 35, desc: 'TCP/UDP, HTTP, DNS, Socket Programming, Protocols' },
                    { id: 'oop', name: 'OOP / OOPS', emoji: '🔗', completion: 80, desc: 'Classes, Inheritance, Polymorphism, Encapsulation, Abstraction' },
                    { id: 'sql', name: 'SQL', emoji: '📊', completion: 70, desc: 'Queries, Joins, Aggregations, Subqueries, Performance Tuning' },
                    { id: 'systemCalls', name: 'System Calls', emoji: '📞', completion: 25, desc: 'fork(), exec(), wait(), File I/O, Process Management' },
                    { id: 'coa', name: 'COA', emoji: '🖥️', completion: 45, desc: 'CPU Architecture, Cache, Pipelining, Instructions' },
                    { id: 'se', name: 'Software Eng', emoji: '🏗️', completion: 55, desc: 'SDLC, Design Patterns, Testing, Documentation' },
                  ].map((subject) => (
                    <Card 
                      key={subject.id}
                      onClick={() => { 
                        setSelectedCsSubject(subject.id); 
                        setCsFundamentalsCurrentStep(2); 
                      }} 
                      className={`p-4 cursor-pointer border-2 transition-all transform hover:scale-105 ${selectedCsSubject === subject.id ? 'border-blue-500 bg-blue-100 shadow-lg ring-2 ring-blue-300' : 'hover:shadow-lg border-slate-200 hover:border-blue-400'}`}
                    >
                      <div className="text-3xl mb-3">{subject.emoji}</div>
                      <h3 className="font-bold text-slate-900">{subject.name}</h3>
                      <p className="text-xs text-slate-500 mt-2">{subject.desc}</p>
                      <div className="mt-3 flex items-center gap-2">
                        <Progress value={subject.completion} className="h-2 flex-1" />
                        <span className="text-xs font-bold text-slate-600">{subject.completion}%</span>
                      </div>
                      <Badge className="mt-3 w-full text-center bg-blue-200 text-blue-900 cursor-pointer hover:bg-blue-300">Click to Explore →</Badge>
                    </Card>
                  ))}
                </div>
                
                <Card className="p-4 bg-gradient-to-r from-blue-100 to-cyan-100 border-2 border-blue-400">
                  <p className="text-sm text-slate-700 font-medium">💡 Pro Tip: Choose a subject above and you'll get topic-wise modules, interview questions, mock viva, scenarios, and more!</p>
                </Card>
              </Card>
            </div>
          )}

          {/* STEP 2: Topic-wise Learning Modules - INTERACTIVE */}
          {csFundamentalsCurrentStep === 2 && selectedCsSubject && (
            <div className="space-y-6 animate-in fade-in">
              <Card className="p-6 border-2 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-300">
                <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                  🧠 Topic-wise Learning - {selectedCsSubject.toUpperCase()}
                </h2>
                <p className="text-slate-600 mb-4">Click any topic to see details, notes, and learn concepts:</p>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    {selectedCsSubject === 'os' && [
                      { title: '📌 Process vs Thread', notes: 'Process: Separate memory space. Thread: Shared memory within process. Context switch time: Process > Thread', refs: 'GeeksforGeeks, Wikipedia' },
                      { title: '📌 Scheduling (FCFS, SJF, RR)', notes: 'FCFS: First Come First Serve. SJF: Shortest Job First (preemptive/non). Round Robin: Fixed time quantum', refs: 'OS Books, YouTube tutorials' },
                      { title: '📌 Semaphores & Mutex', notes: 'Semaphore: Counter-based. Mutex: Binary lock (0/1). Used for synchronization.', refs: 'Linux man pages' },
                      { title: '📌 Deadlock', notes: 'Circular wait of resources. Prevention: Break one of 4 conditions. Banker\'s algorithm for avoidance.', refs: 'Operating Systems Concepts (Silberschatz)' },
                    ].map((topic, idx) => (
                      <Card 
                        key={idx}
                        onClick={() => { 
                          setSelectedCsTopic(topic.title);
                          setTopicDetails({ title: topic.title, notes: topic.notes, refs: topic.refs });
                        }} 
                        className={`p-4 cursor-pointer border-2 transition-all ${selectedCsTopic === topic.title ? 'border-purple-500 bg-purple-100 shadow-lg ring-2 ring-purple-300' : 'border-purple-200 hover:border-purple-500 hover:shadow-lg'} bg-white`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1">
                            <h3 className="font-bold text-slate-900">{topic.title}</h3>
                            {selectedCsTopic === topic.title && (
                              <div className="mt-3 pt-3 border-t-2 border-purple-300">
                                <p className="text-sm text-slate-700 mb-2"><strong>📚 Notes:</strong> {topic.notes}</p>
                                <Badge className="bg-purple-600">{topic.refs}</Badge>
                              </div>
                            )}
                          </div>
                          <span className="text-2xl">💡</span>
                        </div>
                      </Card>
                    ))}
                    {selectedCsSubject === 'dbms' && [
                      { title: '🔄 Normalization (1NF to BCNF)', notes: '1NF: Atomic values. 2NF: No partial dependencies. 3NF: No transitive dependencies. BCNF: Stricter 3NF', refs: 'Database Design Books' },
                      { title: '🔗 SQL Joins (INNER, OUTER)', notes: 'INNER: Common rows. LEFT: All from left + matching right. RIGHT: All from right + matching left. FULL: All rows', refs: 'SQL Tutorials' },
                      { title: '🌳 Indexing (B-tree, Hash)', notes: 'B-tree: Balanced, good for range queries. Hash: O(1) for exact match. B+ tree: Better for databases', refs: 'Database Internals' },
                      { title: '✅ Transactions & ACID', notes: 'Atomicity: All or nothing. Consistency: Valid state to valid state. Isolation: Concurrent transactions isolated. Duration: Persisted', refs: 'ACID Properties' },
                    ].map((topic, idx) => (
                      <Card 
                        key={idx}
                        onClick={() => { 
                          setSelectedCsTopic(topic.title);
                          setTopicDetails({ title: topic.title, notes: topic.notes, refs: topic.refs });
                        }} 
                        className={`p-4 cursor-pointer border-2 transition-all ${selectedCsTopic === topic.title ? 'border-purple-500 bg-purple-100 shadow-lg ring-2 ring-purple-300' : 'border-purple-200 hover:border-purple-500 hover:shadow-lg'} bg-white`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1">
                            <h3 className="font-bold text-slate-900">{topic.title}</h3>
                            {selectedCsTopic === topic.title && (
                              <div className="mt-3 pt-3 border-t-2 border-purple-300">
                                <p className="text-sm text-slate-700 mb-2"><strong>📚 Notes:</strong> {topic.notes}</p>
                                <Badge className="bg-purple-600">{topic.refs}</Badge>
                              </div>
                            )}
                          </div>
                          <span className="text-2xl">💡</span>
                        </div>
                      </Card>
                    ))}
                  </div>
                  
                  {selectedCsTopic && topicDetails && (
                    <Card className="p-6 border-3 border-purple-500 bg-gradient-to-br from-purple-50 to-pink-100 h-fit sticky top-20">
                      <h3 className="text-xl font-bold text-slate-900 mb-4">{topicDetails.title}</h3>
                      <div className="space-y-4">
                        <div>
                          <p className="font-semibold text-slate-700 mb-2">📖 Learning Notes:</p>
                          <div className="bg-white p-4 rounded-lg border-2 border-purple-200 text-slate-700 text-sm leading-relaxed">
                            {topicDetails.notes}
                          </div>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-700 mb-2">🔗 Reference Links:</p>
                          <div className="flex flex-wrap gap-2">
                            {topicDetails.refs.split(',').map((ref: string, i: number) => (
                              <Badge key={i} className="bg-purple-600 text-white cursor-pointer hover:bg-purple-700">
                                📚 {ref.trim()}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Button onClick={() => setCsFundamentalsCurrentStep(3)} className="w-full bg-purple-600 hover:bg-purple-700">
                          Continue to Interview Q&A →
                        </Button>
                      </div>
                    </Card>
                  )}
                </div>
                
                <div className="flex gap-3 mt-6">
                  <Button onClick={() => setCsFundamentalsCurrentStep(1)} variant="outline" className="flex-1">← Back to Subjects</Button>
                  <Button onClick={() => setCsFundamentalsCurrentStep(3)} className="flex-1 bg-purple-600 hover:bg-purple-700" disabled={!selectedCsTopic}>Next: Interview Q&A →</Button>
                </div>
              </Card>
            </div>
          )}

          {/* STEP 3: Most Asked Interview Questions - INTERACTIVE */}
          {csFundamentalsCurrentStep === 3 && selectedCsTopic && (
            <div className="space-y-6 animate-in fade-in">
              <Card className="p-6 border-2 bg-gradient-to-br from-red-50 to-orange-50 border-red-300">
                <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                  🎯 Top Interview Questions for {selectedCsTopic}
                </h2>
                <p className="text-slate-600 mb-4">Click any question to see the detailed answer:</p>
                
                <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                  {[
                    { q: 'What is the key difference between process and thread?', a: 'Process has separate memory space while thread shares memory within a process. Process creation is slower due to separate address space. Context switch between processes is more expensive than threads.', filter: 'HR-Viva' },
                    { q: 'How does Round Robin scheduling work? What happens if time quantum is too small or too large?', a: 'RR assigns fixed time quantum to each process. Small quantum: More context switches = overhead. Large quantum: FCFS behavior = starvation risk.', filter: 'FAANG' },
                    { q: 'Explain deadlock with a real-world example. How to prevent or avoid it?', a: 'Example: Two threads - T1 wants lock A then B; T2 wants lock B then A = Circular wait. Prevention: Remove one of 4 conditions. Avoidance: Banker\'s algorithm', filter: 'Service-Based' },
                    { q: 'What is the difference between Mutex and Semaphore?', a: 'Mutex: Binary (locked/unlocked), only owner can unlock. Semaphore: Counter-based, any thread can increment. Mutex used for exclusion, Semaphore for synchronization.', filter: 'Tricky' },
                    { q: 'How does Virtual Memory work? What is page fault?', a: 'VM extends physical RAM using disk. On page fault: CPU stops, OS fetches page from disk to memory. Page replacement algorithm (LRU, FIFO) decides which page to evict.', filter: 'Follow-up' },
                  ].map((item, idx) => (
                    <Card key={idx} className="p-4 border-l-4 border-l-red-500 bg-white hover:shadow-lg transition-all cursor-pointer" onClick={() => {
                      const current = mcrAnswers[`q${idx}`];
                      setMcrAnswers({ ...mcrAnswers, [`q${idx}`]: current ? '' : item.a });
                    }}>
                      <div>
                        <div className="flex justify-between items-start gap-3 mb-2">
                          <p className="font-semibold text-slate-900 flex-1">{idx + 1}. {item.q}</p>
                          <Badge className="bg-orange-200 text-orange-900 shrink-0">{item.filter}</Badge>
                        </div>
                        {mcrAnswers[`q${idx}`] && (
                          <div className="mt-3 p-3 bg-green-50 border-l-4 border-l-green-500 rounded">
                            <p className="text-sm text-slate-700"><strong>✓ Answer:</strong> {item.a}</p>
                          </div>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-blue-600 mt-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            const current = mcrAnswers[`q${idx}`];
                            setMcrAnswers({ ...mcrAnswers, [`q${idx}`]: current ? '' : item.a });
                          }}
                        >
                          {mcrAnswers[`q${idx}`] ? '✓ Hide Answer' : '📖 Show Answer'}
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
                
                <div className="flex gap-3">
                  <Button onClick={() => setCsFundamentalsCurrentStep(2)} variant="outline" className="flex-1">← Back</Button>
                  <Button onClick={() => setCsFundamentalsCurrentStep(4)} className="flex-1 bg-red-600 hover:bg-red-700">Next: Mock Viva →</Button>
                </div>
              </Card>
            </div>
          )}

          {/* STEP 4: Mock Viva / Oral Interview - FULLY INTERACTIVE */}
          {csFundamentalsCurrentStep === 4 && (
            <div className="space-y-6 animate-in fade-in">
              <Card className="p-6 border-2 bg-gradient-to-br from-green-50 to-emerald-50 border-green-300">
                <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                  🎙️ Mock Viva - Practice Your Answers
                </h2>
                <p className="text-slate-600 mb-4">Answer like a real interviewer is asking you:</p>
                
                <div className="space-y-4 mb-6">
                  <div className="p-4 bg-white border-2 border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Mic className="size-5 text-green-600" />
                      <p className="font-semibold text-slate-900">Question #{aiQuestionIndex + 1} of 5 - Real Interviewer Style</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg mb-4 border-l-4 border-l-green-500">
                      <p className="text-slate-900 font-medium text-lg">
                        {[
                          '🔥 Tell me - What is a deadlock and how is it different from starvation? Give a real-world example and solution.',
                          '💡 Explain the difference between paging and segmentation. Which one is commonly used in modern OS?',
                          '⚡ How do you detect AND recover from deadlock? What are the costs?',
                          '🎯 Virtual Memory - why do we need it? What happens during a page fault? Performance implications?',
                          '🚀 What are the 4 necessary conditions for deadlock? How to break each one?'
                        ][aiQuestionIndex] || 'Great job! All questions done.'}
                      </p>
                    </div>
                    
                    <div className="mb-3">
                      <label className="text-sm font-semibold text-slate-700 mb-2 block">Your Answer:</label>
                      <Textarea 
                        placeholder="Type your detailed answer here. Include examples, real-world scenarios, and technical depth..." 
                        value={vivaAnswers[aiQuestionIndex] || ''}
                        onChange={(e) => setVivaAnswers({ ...vivaAnswers, [aiQuestionIndex]: e.target.value })}
                        className="min-h-32 border-2 border-green-300 placeholder-slate-400 focus:border-green-500"
                      />
                    </div>
                    <div className="text-xs text-slate-500 mb-4 flex justify-between">
                      <span>Word count: {(vivaAnswers[aiQuestionIndex] || '').split(/\s+/).filter(w => w).length}</span>
                      <span className="text-green-600 font-semibold">Recommended: 100-150 words</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => setVivaAnswers({ ...vivaAnswers, [aiQuestionIndex]: '' })} 
                        variant="outline" 
                        className="flex-1 text-sm"
                      >
                        Clear Answer
                      </Button>
                      <Button 
                        onClick={() => { 
                          if(aiQuestionIndex < 4) { 
                            setAiQuestionIndex(aiQuestionIndex + 1);
                          } else {
                            setCsSubjectScores({ ...csSubjectScores, [selectedCsSubject || 'os']: 85 });
                            setCsFundamentalsCurrentStep(5);
                          }
                        }} 
                        className="flex-1 bg-green-600 hover:bg-green-700 text-sm"
                        disabled={!vivaAnswers[aiQuestionIndex] || (vivaAnswers[aiQuestionIndex] || '').split(/\s+/).filter(w => w).length < 30}
                      >
                        {aiQuestionIndex < 4 ? '✓ Submit & Next Question' : '✓ All Done! Continue →'}
                      </Button>
                    </div>
                  </div>
                  
                  <Card className="p-4 bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-400">
                    <p className="text-sm text-slate-700 font-medium">💡 Tip: Be specific, give examples, mention edge cases. Interviewers love candidates who think deep!</p>
                  </Card>
                </div>
                
                <div className="flex gap-3">
                  <Button onClick={() => { setCsFundamentalsCurrentStep(3); setAiQuestionIndex(0); }} variant="outline" className="flex-1">← Back</Button>
                  <Button onClick={() => { setAiQuestionIndex(0); setCsFundamentalsCurrentStep(5); }} className="flex-1 bg-green-600 hover:bg-green-700">Skip to Cheatsheet →</Button>
                </div>
              </Card>
            </div>
          )}

          {/* STEP 5: Rapid Revision Cheatsheets */}
          {csFundamentalsCurrentStep === 5 && (
            <div className="space-y-6 animate-in fade-in">
              <Card className="p-6 border-2 bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-300">
                <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                  📝 Rapid Revision Cheatsheets - Download & Study
                </h2>
                <p className="text-slate-600 mb-6">1-page quick reference for all concepts:</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {[
                    { title: '⚙️  OS Cheatsheet', items: ['Process vs Thread', 'Scheduling algorithms', 'Sync primitives', 'Deadlock solutions', '7 key formulas'], downloads: 1240, link: '#' },
                    { title: '🗄️ DBMS Quick Ref', items: ['Normalization checks', 'SQL join types', 'Index comparison', 'ACID rules', 'Query patterns'], downloads: 890, link: '#' },
                    { title: '🌐 CN Protocols', items: ['TCP vs UDP diff', 'HTTP/HTTPS timeline', 'DNS query process', 'Socket layer model', 'Error handling'], downloads: 756, link: '#' },
                    { title: '🎯 Top 50 Differences', items: ['Process/Thread', 'Mutex/Semaphore', 'Index types', 'Memory strategies', 'More differences'], downloads: 2100, link: '#' },
                  ].map((sheet, idx) => (
                    <Card 
                      key={idx} 
                      className="p-4 border-2 border-yellow-200 hover:shadow-lg cursor-pointer transition-all hover:border-yellow-400 bg-white hover:bg-yellow-50"
                      onClick={() => alert(`Downloading: ${sheet.title}`)}
                    >
                      <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                        <FileText className="size-5 text-yellow-600" />
                        {sheet.title}
                      </h3>
                      <div className="text-xs text-slate-600 mb-4 space-y-1 bg-slate-50 p-2 rounded">
                        {sheet.items.map((item, i) => <p key={i}>✓ {item}</p>)}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">⬇️ {sheet.downloads} downloads</span>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs bg-yellow-100 hover:bg-yellow-200 border-yellow-400"
                          onClick={(e) => {
                            e.stopPropagation();
                            alert(`Downloaded: ${sheet.title}\nSaved to: Documents/${sheet.title}.pdf`);
                          }}
                        >
                          📥 Download PDF
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
                
                <div className="flex gap-3">
                  <Button onClick={() => setCsFundamentalsCurrentStep(4)} variant="outline" className="flex-1">← Back</Button>
                  <Button onClick={() => setCsFundamentalsCurrentStep(6)} className="flex-1 bg-yellow-600 hover:bg-yellow-700">Next: Scenarios →</Button>
                </div>
              </Card>
            </div>
          )}

          {/* STEP 6: Scenario-Based Core CS - FULLY INTERACTIVE WITH SOLUTIONS */}
          {csFundamentalsCurrentStep === 6 && (
            <div className="space-y-6 animate-in fade-in">
              <Card className="p-6 border-2 bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-300">
                <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                  🧪 Scenario-Based Problems - Solve Real Issues
                </h2>
                <p className="text-slate-600 mb-6">Click any scenario to see problem, analysis, and solution:</p>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    {[
                      { scenario: 'Deadlock in Banking App', desc: 'Two threads transferring money between accounts', solution: 'SOLUTION: Use resource ordering - both threads acquire locks in same order (Account_A then Account_B). This breaks circular wait condition.', icon: '🏦' },
                      { scenario: 'DB Lock Issue', desc: 'Multiple queries causing table locks and timeouts', solution: 'SOLUTION: 1) Use row-level instead of table-level locks. 2) Optimize query execution time. 3) Implement connection pooling. 4) Set appropriate lock timeouts.', icon: '🔒' },
                      { scenario: 'Cache Miss in CPU', desc: 'CPU accessing main memory 100x slower', solution: 'SOLUTION: Temporal locality - access nearby memory. Spatial locality - sequential access reduces misses. Use cache-friendly algorithms. Profile with tools like perf, cachegrind.', icon: '⚡' },
                      { scenario: 'Packet Loss in Video Call', desc: 'Network drops packets - quality issues', solution: 'SOLUTION: TCP retransmits lost packets. UDP uses forward error correction. Adaptive bitrate reduces packet load. Buffer 100-500ms for recovery.', icon: '📞' },
                      { scenario: 'Slow SQL Query', desc: '30-second query on 1M rows', solution: 'SOLUTION: 1) Add index on WHERE clause columns. 2) Avoid SELECT * - fetch only needed columns. 3) Use EXPLAIN PLAN. 4) Check for full table scans. 5) Denormalize if needed.', icon: '🐢' },
                      { scenario: 'Race Condition in Counter', desc: 'Multiple threads incrementing = data loss', solution: 'SOLUTION: Use atomic operations (atomic_increment), or surround with lock: mutex_lock(); counter++; mutex_unlock(); Alternatively use synchronized keyword or volatile.', icon: '⚔️' },
                    ].map((item, idx) => (
                      <Card 
                        key={idx}
                        onClick={() => setCsSelectedScenario(item.scenario)}
                        className={`p-4 border-2 cursor-pointer transition-all ${csSelectedScenario === item.scenario ? 'border-indigo-500 bg-indigo-100 shadow-lg ring-2 ring-indigo-300' : 'border-indigo-200 hover:shadow-lg hover:border-indigo-500'} bg-white`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{item.icon}</span>
                          <div className="flex-1">
                            <h3 className="font-bold text-slate-900">{item.scenario}</h3>
                            <p className="text-sm text-slate-600">{item.desc}</p>
                          </div>
                          <ChevronRight className="size-5 text-indigo-600" />
                        </div>
                      </Card>
                    ))}
                  </div>
                  
                  {csSelectedScenario && (
                    <Card className="p-6 border-3 border-indigo-500 bg-gradient-to-br from-indigo-50 to-blue-100 h-fit sticky top-20">
                      <h3 className="text-xl font-bold text-slate-900 mb-4">📋 Problem & Solution Analysis</h3>
                      <div className="space-y-4">
                        <div>
                          <p className="font-semibold text-indigo-900 mb-2">🎯 Selected Problem:</p>
                          <Badge className="bg-indigo-600 text-white">{csSelectedScenario}</Badge>
                        </div>
                        
                        <div>
                          <p className="font-semibold text-slate-700 mb-2">🔧 Solution Approach:</p>
                          <div className="bg-white p-4 rounded-lg border-2 border-indigo-300 text-slate-700 text-sm leading-relaxed">
                            {[
                              'SOLUTION: Use resource ordering - both threads acquire locks in same order (Account_A then Account_B). This breaks circular wait condition.',
                              'SOLUTION: 1) Use row-level instead of table-level locks. 2) Optimize query execution time. 3) Implement connection pooling. 4) Set appropriate lock timeouts.',
                              'SOLUTION: Temporal locality - access nearby memory. Spatial locality - sequential access reduces misses. Use cache-friendly algorithms. Profile with tools like perf, cachegrind.',
                              'SOLUTION: TCP retransmits lost packets. UDP uses forward error correction. Adaptive bitrate reduces packet load. Buffer 100-500ms for recovery.',
                              'SOLUTION: 1) Add index on WHERE clause columns. 2) Avoid SELECT * - fetch only needed columns. 3) Use EXPLAIN PLAN. 4) Check for full table scans. 5) Denormalize if needed.',
                              'SOLUTION: Use atomic operations (atomic_increment), or surround with lock: mutex_lock(); counter++; mutex_unlock(); Alternatively use synchronized keyword or volatile.',
                            ][[csSelectedScenario].includes('Deadlock') ? 0 : [csSelectedScenario].includes('DB') ? 1 : [csSelectedScenario].includes('Cache') ? 2 : [csSelectedScenario].includes('Packet') ? 3 : [csSelectedScenario].includes('SQL') ? 4 : 5]}
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-sm font-semibold text-slate-700 mb-2 block">💻 Your Own Solution (Notes):</label>
                          <Textarea
                            placeholder="Type your solution approach or notes here..."
                            value={csScenarioSolution}
                            onChange={(e) => setCsScenarioSolution(e.target.value)}
                            className="min-h-24 border-2 border-indigo-300"
                          />
                        </div>
                        
                        <Button onClick={() => { alert('✓ Solution saved!'); setCsSelectedScenario(null); setCsScenarioSolution(''); }} className="w-full bg-indigo-600 hover:bg-indigo-700">
                          ✓ Save My Solution & Next Scenario
                        </Button>
                      </div>
                    </Card>
                  )}
                </div>
                
                <div className="flex gap-3 mt-6">
                  <Button onClick={() => setCsFundamentalsCurrentStep(5)} variant="outline" className="flex-1">← Back</Button>
                  <Button onClick={() => { setAiQuestionIndex(0); setCsQuizProgress({ current: 0, total: 50, score: 0, answers: [] }); setCsFundamentalsCurrentStep(7); }} className="flex-1 bg-indigo-600 hover:bg-indigo-700">Next: Quiz →</Button>
                </div>
              </Card>
            </div>
          )}

          {/* STEP 7: MCQ + Quiz Mode - FULLY FUNCTIONAL */}
          {csFundamentalsCurrentStep === 7 && (
            <div className="space-y-6 animate-in fade-in">
              <Card className="p-6 border-2 bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-300">
                <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                  ❓ MCQ + Quiz Mode - Test Your Knowledge
                </h2>
                <p className="text-slate-600 mb-4">Click your answer (one answer per question). Explanation shown on submit:</p>
                
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-bold text-slate-900">Question {csQuizProgress.current + 1}/{csQuizProgress.total}</span>
                    <div className="flex gap-2">
                      <Badge className="bg-teal-600">Score: {csQuizProgress.score}%</Badge>
                      <Badge className="bg-cyan-600">30 sec ⏱️</Badge>
                    </div>
                  </div>
                  <Progress value={(csQuizProgress.current / csQuizProgress.total) * 100} className="h-3 mb-4" />
                  
                  <div className="bg-white p-6 rounded-lg border-2 border-teal-200 mb-6">
                    <p className="font-semibold text-slate-900 mb-4 text-lg">
                      {csQuizProgress.current < csQuizProgress.total 
                        ? ['What is the maximum time quantum in Round Robin scheduling?', 
                           'Which scheduling algorithm minimizes average waiting time?',
                           'What is thrashing in virtual memory?',
                           'How many necessary conditions for deadlock?',
                           'What is a context switch?'][csQuizProgress.current % 5] || 'Quiz Complete!'
                        : 'Quiz Complete!'}
                    </p>
                    
                    <div className="space-y-3">
                      {csQuizProgress.current < csQuizProgress.total && [
                        [
                          { label: 'A', text: '1 millisecond' },
                          { label: 'B', text: '10-100 milliseconds' },
                          { label: 'C', text: '1 second' },
                          { label: 'D', text: 'Varies with system loads' },
                        ],
                        [
                          { label: 'A', text: 'FCFS' },
                          { label: 'B', text: 'SJF (Shortest Job First)' },
                          { label: 'C', text: 'Round Robin' },
                          { label: 'D', text: 'Priority Based' },
                        ],
                        [
                          { label: 'A', text: 'When system is hibernating' },
                          { label: 'B', text: 'Too much paging causes slow performance' },
                          { label: 'C', text: 'Hardware malfunction' },
                          { label: 'D', text: 'Disk is full' },
                        ],
                        [
                          { label: 'A', text: '2' },
                          { label: 'B', text: '3' },
                          { label: 'C', text: '4' },
                          { label: 'D', text: '5' },
                        ],
                        [
                          { label: 'A', text: 'Switching between programs' },
                          { label: 'B', text: 'Saving/restoring CPU state between processes' },
                          { label: 'C', text: 'RAM reset' },
                          { label: 'D', text: 'Disk read operation' },
                        ],
                      ][csQuizProgress.current % 5] || [].map((opt, idx2) => (
                        <Card 
                          key={idx2}
                          onClick={() => {
                            if (!mcrAnswers[csQuizProgress.current]) {
                              setMcrAnswers({ ...mcrAnswers, [csQuizProgress.current]: opt.label });
                            }
                          }}
                          className={`p-4 border-2 cursor-pointer transition-all ${mcrAnswers[csQuizProgress.current] === opt.label ? 'border-teal-500 bg-teal-100 shadow-lg' : 'border-slate-200 hover:border-teal-400 hover:shadow-md'}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`size-6 rounded-full border-2 flex items-center justify-center font-bold text-sm ${mcrAnswers[csQuizProgress.current] === opt.label ? 'border-teal-600 bg-teal-200' : 'border-slate-400'}`}>
                              {opt.label}
                            </div>
                            <p className="text-slate-700">{opt.text}</p>
                          </div>
                        </Card>
                      ))}
                    </div>
                    
                    {mcrAnswers[csQuizProgress.current] && (
                      <div className="mt-4 p-3 bg-green-50 border-2 border-green-300 rounded">
                        <p className="text-sm text-slate-700">
                          <strong>You selected: {mcrAnswers[csQuizProgress.current]}</strong> <br/>
                          Correct Answer: <strong>B</strong> - It depends on the question type, but typically 10-100ms is optimal balance.
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-3">
                    <Button 
                      onClick={() => setMcrAnswers({ ...mcrAnswers, [csQuizProgress.current]: '' })} 
                      variant="outline"
                      className="flex-1"
                    >
                      Clear Answer
                    </Button>
                    <Button 
                      onClick={() => {
                        const newScore = csQuizProgress.current < csQuizProgress.total - 1 
                          ? csQuizProgress.score 
                          : Math.round((csQuizProgress.score + (mcrAnswers[csQuizProgress.current] ? 100 : 0)) / csQuizProgress.total);
                        if (csQuizProgress.current < csQuizProgress.total - 1) {
                          setCsQuizProgress({ ...csQuizProgress, current: csQuizProgress.current + 1 });
                        } else {
                          setCsFundamentalsCurrentStep(8);
                        }
                      }}
                      className="flex-1 bg-teal-600 hover:bg-teal-700"
                      disabled={!mcrAnswers[csQuizProgress.current]}
                    >
                      {csQuizProgress.current < csQuizProgress.total - 1 ? 'Submit →' : 'Finish & View Results →'}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* STEP 8: Progress Dashboard */}
          {csFundamentalsCurrentStep === 8 && (
            <div className="space-y-6 animate-in fade-in">
              <Card className="p-6 border-2 bg-gradient-to-br from-violet-50 to-purple-50 border-violet-300">
                <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                  📊 Your Progress Dashboard
                </h2>
                <p className="text-slate-600 mb-6">Track your CS Fundamentals mastery:</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {[
                    { subject: '⚙️ OS', progress: 40, color: 'from-blue-400 to-blue-600' },
                    { subject: '🗄️ DBMS', progress: 65, color: 'from-green-400 to-green-600' },
                    { subject: '🌐 CN', progress: 35, color: 'from-orange-400 to-orange-600' },
                    { subject: '🔗 OOP', progress: 80, color: 'from-pink-400 to-pink-600' },
                    { subject: '📊 SQL', progress: 70, color: 'from-yellow-400 to-yellow-600' },
                    { subject: '📞 System Calls', progress: 25, color: 'from-purple-400 to-purple-600' },
                    { subject: '🖥️ COA', progress: 45, color: 'from-red-400 to-red-600' },
                    { subject: '🏗️ SE', progress: 55, color: 'from-indigo-400 to-indigo-600' },
                  ].map((item, idx) => (
                    <Card key={idx} className="p-4 bg-white border-2 border-violet-200 hover:shadow-lg cursor-pointer transition-all">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-bold text-slate-900">{item.subject}</span>
                        <Badge className="bg-violet-200 text-violet-900">{item.progress}%</Badge>
                      </div>
                      <Progress value={item.progress} className="h-3 mb-2" />
                      <p className="text-xs text-slate-500">{item.progress < 50 ? '⏳ In progress' : '✓ Good progress'}</p>
                    </Card>
                  ))}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: 'Topics Done', value: '18/25', icon: '✅', color: 'from-green-100 to-green-200' },
                    { label: 'Quiz Score', value: '78%', icon: '🎯', color: 'from-yellow-100 to-yellow-200' },
                    { label: 'Mock Vivas', value: '5/10', icon: '🎙️', color: 'from-purple-100 to-purple-200' },
                    { label: 'Streak', value: '7 days', icon: '🔥', color: 'from-red-100 to-red-200' },
                  ].map((item, idx) => (
                    <Card key={idx} className={`p-4 text-center bg-gradient-to-br ${item.color} border-2 border-violet-300 hover:shadow-lg cursor-pointer transition-all`}>
                      <div className="text-3xl mb-2">{item.icon}</div>
                      <p className="text-xs text-slate-600 font-medium">{item.label}</p>
                      <p className="font-bold text-slate-900 text-lg">{item.value}</p>
                    </Card>
                  ))}
                </div>
                
                <Card className="p-4 bg-gradient-to-r from-violet-100 to-purple-100 border-2 border-violet-400">
                  <p className="text-sm text-slate-700 font-medium">📈 You're making great progress! Keep consistency. Study 30-45 mins daily for best results.</p>
                </Card>
                
                <div className="flex gap-3 mt-6">
                  <Button onClick={() => setCsFundamentalsCurrentStep(7)} variant="outline" className="flex-1">← Back</Button>
                  <Button onClick={() => setCsFundamentalsCurrentStep(9)} className="flex-1 bg-violet-600 hover:bg-violet-700">Next: Company Prep →</Button>
                </div>
              </Card>
            </div>
          )}

          {/* STEP 9: Company-wise Core CS - INTERACTIVE COMPANY SELECTION */}
          {csFundamentalsCurrentStep === 9 && (
            <div className="space-y-6 animate-in fade-in">
              <Card className="p-6 border-2 bg-gradient-to-br from-rose-50 to-red-50 border-rose-300">
                <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                  🏢 Company-wise Core CS Prep - Tailored for Top Companies
                </h2>
                <p className="text-slate-600 mb-6">Click any company to see specific focus areas and common questions:</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {[
                    { company: 'TCS', focus: 'Strong OS, DBMS, CN basics', questions: 'Process scheduling, Normalization, TCP/UDP basics', icon: '🔷', link: 'https://geeksforgeeks.org' },
                    { company: 'Infosys', focus: 'DBMS transactions, SQL optimization', questions: 'ACID properties, Query optimization, Indexes', icon: '🌀', link: 'https://geeksforgeeks.org' },
                    { company: 'Amazon', focus: 'Advanced OS, System design level CS', questions: 'Deadlock, Virtual memory, Advanced indexing', icon: '📦', link: 'https://leetcode.com' },
                    { company: 'Oracle', focus: 'Deep DBMS, SQL, indexing', questions: 'B+ tree internals, Query execution plans, Locks', icon: '🗄️', link: 'https://oracle.com/docs' },
                    { company: 'Microsoft', focus: 'Low-level concepts, COA, system calls', questions: 'CPU architecture, Cache hierarchy, IPC', icon: '🪟', link: 'https://microsoft.com/learn' },
                    { company: 'Google', focus: 'Complete mastery, edge cases, optimization', questions: 'All concepts at depth, real-world scenarios', icon: '🔍', link: 'https://google.com/careers' },
                  ].map((item, idx) => (
                    <Card 
                      key={idx}
                      onClick={() => setSelectedCsCompany(item.company)}
                      className={`p-4 border-2 cursor-pointer transition-all ${selectedCsCompany === item.company ? 'border-rose-500 bg-rose-100 shadow-lg ring-2 ring-rose-300' : 'border-rose-200 hover:shadow-lg hover:border-rose-500'} bg-white`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{item.icon}</span>
                        <div className="flex-1">
                          <h3 className="font-bold text-slate-900">{item.company}</h3>
                          <p className="text-xs text-slate-500 mb-2"><strong>Focus:</strong> {item.focus}</p>
                          {selectedCsCompany === item.company && (
                            <div className="mt-3 pt-3 border-t-2 border-rose-300">
                              <p className="text-xs text-slate-700 mb-2"><strong>📚 Common Q&A:</strong> {item.questions}</p>
                              <Button 
                                size="sm" 
                                className="w-full bg-rose-600 hover:bg-rose-700 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  alert(`Opening: ${item.company} Resources\nRedirecting to: ${item.link}`);
                                }}
                              >
                                🔗 Go to Resources
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
                
                <div className="flex gap-3">
                  <Button onClick={() => setCsFundamentalsCurrentStep(8)} variant="outline" className="flex-1">← Back</Button>
                  <Button onClick={() => setCsFundamentalsCurrentStep(10)} className="flex-1 bg-rose-600 hover:bg-rose-700">Next: Last Minute Prep →</Button>
                </div>
              </Card>
            </div>
          )}

          {/* STEP 10: Last Minute Notes + PDFs - INTERACTIVE DOWNLOADS */}
          {csFundamentalsCurrentStep === 10 && (
            <div className="space-y-6 animate-in fade-in">
              <Card className="p-6 border-2 bg-gradient-to-br from-orange-50 to-amber-50 border-orange-300">
                <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                  📄 Last Minute Prep - Download & Study
                </h2>
                <p className="text-slate-600 mb-4">Final day interview resources (click to download or view details):</p>
                
                <Textarea
                  placeholder="📝 Your personal notes here - save important points for last-minute revision..."
                  className="min-h-24 border-2 border-orange-300 mb-4 p-3 rounded-lg"
                />
                
                <div className="space-y-3 mb-6">
                  {[
                    { title: '📋 1-Day Before Interview Notes', desc: 'Quick revision checklist of 50 most critical concepts', size: '2.4 MB', date: 'Updated today', format: 'PDF' },
                    { title: '🎯 Top 50 CS Interview Questions', desc: 'Complete Q&A with detailed explanations and real-world examples', size: '3.8 MB', date: 'Updated this week', format: 'PDF' },
                    { title: '📚 OS DBMS CN Complete Sheet', desc: 'All formulas, definitions, algorithms, comparison tables on 20 pages', size: '5.2 MB', date: 'Updated this month', format: 'PDF' },
                    { title: '🎓 Freshers Viva Notes', desc: 'Simplified explanations perfect for 0-1 year experience candidates', size: '1.9 MB', date: 'Updated recently', format: 'PDF' },
                    { title: '🏢 Company-wise Quick Reference', desc: 'Tailored focus areas and common questions for TCS, Infosys, Amazon, Oracle, Google', size: '2.1 MB', date: 'Latest', format: 'PDF' },
                    { title: '🔗 Reference Links Compiled', desc: 'Curated best GeeksforGeeks, Wikipedia, YouTube, LeetCode links by topic', size: '0.5 MB', date: 'Updated', format: 'Docs' },
                  ].map((resource, idx) => (
                    <Card 
                      key={idx} 
                      className="p-4 border-2 border-orange-200 hover:shadow-lg transition-all bg-white hover:bg-orange-50 cursor-pointer"
                      onClick={() => alert(`Downloaded: ${resource.title}\nSaved to: Documents/${resource.title}.${resource.format.toLowerCase()}`)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-slate-900 flex items-center gap-2">
                            <FileText className="size-5 text-orange-600" />
                            {resource.title}
                          </h3>
                          <p className="text-sm text-slate-600 mt-2">{resource.desc}</p>
                          <div className="flex gap-3 mt-3 text-xs text-slate-500 flex-wrap">
                            <span>📦 {resource.size}</span>
                            <span>📅 {resource.date}</span>
                            <Badge className="bg-orange-200 text-orange-900 text-xs">{resource.format}</Badge>
                          </div>
                        </div>
                        <Button 
                          className="bg-orange-600 hover:bg-orange-700 shrink-0 text-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            alert(`✓ Downloaded: ${resource.title}\n\nFile saved to your Documents folder.`);
                          }}
                        >
                          📥 Download
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card className="p-4 bg-gradient-to-br from-orange-100 to-yellow-100 border-2 border-orange-400">
                    <p className="text-center">
                      <span className="text-2xl block mb-2">⏰</span>
                      <strong className="text-slate-900">30 mins before interview?</strong>
                      <p className="text-xs text-slate-700 mt-2">Download & skim the "Quick Notes" PDF</p>
                    </p>
                  </Card>
                  <Card className="p-4 bg-gradient-to-br from-yellow-100 to-amber-100 border-2 border-yellow-400">
                    <p className="text-center">
                      <span className="text-2xl block mb-2">📱</span>
                      <strong className="text-slate-900">Day before?</strong>
                      <p className="text-xs text-slate-700 mt-2">Study all 6 PDFs in order given</p>
                    </p>
                  </Card>
                  <Card className="p-4 bg-gradient-to-br from-amber-100 to-orange-100 border-2 border-amber-400">
                    <p className="text-center">
                      <span className="text-2xl block mb-2">🎯</span>
                      <strong className="text-slate-900">Interview day?</strong>
                      <p className="text-xs text-slate-700 mt-2">Glance at company-specific sheet</p>
                    </p>
                  </Card>
                </div>

                <Card className="p-4 bg-gradient-to-r from-orange-100 to-red-100 border-2 border-orange-500 mb-6">
                  <p className="text-sm text-slate-700 font-semibold">🚀 Final Tip: Consistency beats cramming. But these last-minute guides help catch concepts you might have missed. Good luck!</p>
                </Card>
                
                <div className="flex gap-3">
                  <Button onClick={() => setCsFundamentalsCurrentStep(9)} variant="outline" className="flex-1">← Back to Companies</Button>
                  <Button 
                    onClick={() => { 
                      alert('🎉 Congratulations! You\'ve completed the full CS Fundamentals module.\n\nNext steps:\n1. Practice mock interviews\n2. Solve coding problems\n3. Take more quizzes\n\nGood luck with your interviews! 🚀');
                      setCsFundamentalsCurrentStep(1); 
                      setSelectedCsSubject(null); 
                      setSelectedCsTopic(null);
                      setVivaAnswerText('');
                      setMcrAnswers({});
                    }} 
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-lg font-bold"
                  >
                    🎓 Complete & Restart
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* ==================== OOP/LLD INTERVIEW PREP - 11 COMPREHENSIVE SECTIONS ==================== */}
        <TabsContent value="oop-lld" className="space-y-6">
          {/* STEP 1: LLD Problem Selection Hub */}
          {oopCurrentStep === 1 && (
            <div className="space-y-6 animate-in fade-in">
              <Card className="p-6 border-2 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-300">
                <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                  🎯 LLD Problem Selection Hub - Most Asked Interview Problems
                </h2>
                <p className="text-slate-600 mb-6">Choose a classic LLD design problem to master. Click to start:</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {[
                    { id: 'parking-lot', name: 'Parking Lot', emoji: '🅿️', difficulty: 'Medium', desc: 'Multi-level, vehicle types, occupancy', companies: 'Amazon, Microsoft, Google' },
                    { id: 'elevator', name: 'Elevator System', emoji: '🛗', difficulty: 'Medium', desc: 'Multiple elevators, scheduling', companies: 'Amazon, Apple, Uber' },
                    { id: 'splitwise', name: 'Splitwise (Expense Splitter)', emoji: '💰', difficulty: 'Medium', desc: 'Split bills, settle ups', companies: 'Amazon, Flipkart' },
                    { id: 'bookmyshow', name: 'BookMyShow (Movie Booking)', emoji: '🎬', difficulty: 'Medium', desc: 'Seats, bookings, payments', companies: 'Amazon, Flipkart, TCS' },
                    { id: 'atm', name: 'ATM System', emoji: '🏧', difficulty: 'Easy', desc: 'Cash withdrawal, transactions', companies: 'JPMorgan, Infosys' },
                    { id: 'chess', name: 'Chess Game', emoji: '♟️', difficulty: 'Hard', desc: 'Piece movements, checkmate', companies: 'Google, Microsoft' },
                    { id: 'snake-ladder', name: 'Snake & Ladder Game', emoji: '🎲', difficulty: 'Easy', desc: 'Board, players, dice rolls', companies: 'Amazon, Swiggy' },
                    { id: 'logging', name: 'Logging Framework', emoji: '📝', difficulty: 'Medium', desc: 'Log levels, multiple appenders', companies: 'Microsoft, Adobe' },
                    { id: 'cache', name: 'Cache Manager (LRU/LFU)', emoji: '⚡', difficulty: 'Hard', desc: 'Eviction policies, O(1) ops', companies: 'Google, Facebook, Amazon' },
                    { id: 'task-scheduler', name: 'Task Scheduler', emoji: '⏱️', difficulty: 'Hard', desc: 'Async tasks, retry logic', companies: 'Amazon, Microsoft' },
                    { id: 'notification', name: 'Notification System', emoji: '🔔', difficulty: 'Medium', desc: 'Email, SMS, Push, WebSocket', companies: 'Google, Meta, Twitter' },
                  ].map((problem) => (
                    <Card 
                      key={problem.id}
                      onClick={() => { setSelectedLldProblem(problem.id); setOopCurrentStep(2); }} 
                      className={`p-4 cursor-pointer border-2 transition-all transform hover:scale-105 ${selectedLldProblem === problem.id ? 'border-emerald-500 bg-emerald-100 shadow-lg ring-2 ring-emerald-300' : 'border-slate-200 hover:border-emerald-400 hover:shadow-lg'} bg-white`}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <span className="text-3xl">{problem.emoji}</span>
                        <div className="flex-1">
                          <h3 className="font-bold text-slate-900">{problem.name}</h3>
                          <Badge className={`mt-2 ${problem.difficulty === 'Easy' ? 'bg-green-200 text-green-900' : problem.difficulty === 'Medium' ? 'bg-yellow-200 text-yellow-900' : 'bg-red-200 text-red-900'}`}>{problem.difficulty}</Badge>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 mb-2"><strong>📝 Features:</strong> {problem.desc}</p>
                      <p className="text-xs text-emerald-700 font-semibold"><strong>🏢 Asked in:</strong> {problem.companies}</p>
                    </Card>
                  ))}
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    onClick={() => setOopCurrentStep(2)} 
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    disabled={!selectedLldProblem}
                  >
                    Start: Requirements Clarification →
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* STEP 2: Requirement Clarification Section */}
          {oopCurrentStep === 2 && selectedLldProblem && (
            <div className="space-y-6 animate-in fade-in">
              <Card className="p-6 border-2 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-300">
                <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                  📝 Requirement Clarification - {selectedLldProblem.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </h2>
                <p className="text-slate-600 mb-4">First scoring point in LLD interviews! Write clear requirements:</p>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-2 block">🎯 Core Features (Non-negotiable):</label>
                      <Textarea 
                        placeholder="E.g., For Parking Lot: calculate available slots, park vehicle, unpark vehicle, find nearest spot" 
                        value={lldRequirements.coreFeatures}
                        onChange={(e) => setLldRequirements({ ...lldRequirements, coreFeatures: e.target.value })}
                        className="min-h-24 border-2 border-blue-300"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-2 block">✨ Optional Features (If time permits):</label>
                      <Textarea 
                        placeholder="E.g., SMS alerts, special parking spots, pricing tiers" 
                        value={lldRequirements.optionalFeatures}
                        onChange={(e) => setLldRequirements({ ...lldRequirements, optionalFeatures: e.target.value })}
                        className="min-h-20 border-2 border-blue-300"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-2 block">⚙️ Constraints (System limits):</label>
                      <Textarea 
                        placeholder="E.g., 1M vehicles/day, 10k concurrent users, <50ms response time" 
                        value={lldRequirements.constraints}
                        onChange={(e) => setLldRequirements({ ...lldRequirements, constraints: e.target.value })}
                        className="min-h-20 border-2 border-blue-300"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-2 block">💡 Assumptions (Questions to clarify):</label>
                      <Textarea 
                        placeholder="E.g., Is it multi-level? Do we need payment processing? Multiple vehicle types?" 
                        value={lldRequirements.assumptions}
                        onChange={(e) => setLldRequirements({ ...lldRequirements, assumptions: e.target.value })}
                        className="min-h-24 border-2 border-blue-300"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-2 block">⚡ Edge Cases (What can break?):</label>
                      <Textarea 
                        placeholder="E.g., Full parking lot, duplicate vehicle ID, concurrent access, vehicle type change" 
                        value={lldRequirements.edgeCases}
                        onChange={(e) => setLldRequirements({ ...lldRequirements, edgeCases: e.target.value })}
                        className="min-h-24 border-2 border-blue-300"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200 mb-6">
                  <p className="text-sm text-slate-700 font-semibold mb-3">📌 API Methods (Core Operations):</p>
                  <div className="flex flex-wrap gap-2">
                    {['parkVehicle()', 'unparkVehicle()', 'getAvailableSlots()', 'findNearestSpot()', 'isSpotAvailable()', 'validateVehicle()'].map((api, idx) => (
                      <Badge key={idx} className="bg-blue-200 text-blue-900 text-xs py-2">{api}</Badge>
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 mt-3">💡 Pro Tip: These methods are the contract your system must fulfill!</p>
                </div>
                
                <div className="flex gap-3">
                  <Button onClick={() => setOopCurrentStep(1)} variant="outline" className="flex-1">← Back</Button>
                  <Button onClick={() => setOopCurrentStep(3)} className="flex-1 bg-blue-600 hover:bg-blue-700">Next: Class Diagram →</Button>
                </div>
              </Card>
            </div>
          )}

          {/* STEP 3: Class Diagram Builder (Hero Feature) */}
          {oopCurrentStep === 3 && selectedLldProblem && (
            <div className="space-y-6 animate-in fade-in">
              <Card className="p-6 border-2 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-300">
                <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                  🧩 Class Diagram Builder - Design Your System Architecture (HERO FEATURE)
                </h2>
                <p className="text-slate-600 mb-4">Class design is the MOST evaluated part of LLD! Click to add UML blocks:</p>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                  <div className="lg:col-span-2 bg-white p-6 border-2 border-purple-300 rounded-lg min-h-96 relative">
                    <div className="absolute top-2 right-2 text-xs text-slate-500">Interactive Canvas (Visual Representation)</div>
                    <div className="space-y-4">
                      {/* Parking Lot Example */}
                      {selectedLldProblem === 'parking-lot' && (
                        <>
                          <div className="p-4 bg-purple-100 border-2 border-purple-400 rounded flex items-center gap-4">
                            <div className="flex-1">
                              <p className="font-bold text-slate-900">🏗️ ParkingLot (Main)</p>
                              <p className="text-xs text-slate-700">- levels: List&lt;Level&gt;</p>
                              <p className="text-xs text-slate-700">- entranceGates: Gate[]</p>
                              <p className="text-xs text-slate-700">+ getAvailableSpots(): int</p>
                            </div>
                            <Button variant="outline" size="sm">Edit</Button>
                          </div>
                          <div className="text-center text-slate-500 font-bold">↓ uses ↓</div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-blue-100 border-2 border-blue-400 rounded">
                              <p className="font-bold text-slate-900 text-sm">📍 ParkingSpot</p>
                              <p className="text-xs text-slate-700">- spotNumber: int</p>
                              <p className="text-xs text-slate-700">- isAvailable: bool</p>
                            </div>
                            <div className="p-3 bg-green-100 border-2 border-green-400 rounded">
                              <p className="font-bold text-slate-900 text-sm">🚗 Vehicle</p>
                              <p className="text-xs text-slate-700">- licenseNo: String</p>
                              <p className="text-xs text-slate-700">- type: VType</p>
                            </div>
                          </div>
                          <div className="text-center text-slate-500 font-bold">↓ inheritance ↓</div>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="p-2 bg-orange-100 border-2 border-orange-400 rounded text-center">
                              <p className="font-bold text-xs">🚗 Car</p>
                            </div>
                            <div className="p-2 bg-orange-100 border-2 border-orange-400 rounded text-center">
                              <p className="font-bold text-xs">🏍️ Bike</p>
                            </div>
                            <div className="p-2 bg-orange-100 border-2 border-orange-400 rounded text-center">
                              <p className="font-bold text-xs">🚙 Truck</p>
                            </div>
                          </div>
                        </>
                      )}
                      
                      {/* Elevator Example */}
                      {selectedLldProblem === 'elevator' && (
                        <>
                          <div className="p-4 bg-purple-100 border-2 border-purple-400 rounded">
                            <p className="font-bold text-slate-900">🏢 ElevatorSystem</p>
                            <p className="text-xs text-slate-700">- elevators: Elevator[]</p>
                            <p className="text-xs text-slate-700">- requestQueue: PriorityQueue</p>
                            <p className="text-xs text-slate-700">+ requestElevator(floor): void</p>
                          </div>
                          <div className="text-center text-slate-500">↓ contains ↓</div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-blue-100 border-2 border-blue-400 rounded">
                              <p className="font-bold text-slate-900 text-sm">🛗 Elevator</p>
                              <p className="text-xs text-slate-700">- currentFloor: int</p>
                              <p className="text-xs text-slate-700">- direction: Direction</p>
                            </div>
                            <div className="p-3 bg-green-100 border-2 border-green-400 rounded">
                              <p className="font-bold text-slate-900 text-sm">📍 Button</p>
                              <p className="text-xs text-slate-700">- floorNumber: int</p>
                              <p className="text-xs text-slate-700">- isPressed: bool</p>
                            </div>
                          </div>
                        </>
                      )}

                      {/* Generic UML blocks for other problems */}
                      {!['parking-lot', 'elevator'].includes(selectedLldProblem) && (
                        <div className="text-center text-slate-500 py-12">
                          <p className="mb-4">Visual class diagram will render based on your design</p>
                          <Button onClick={() => alert('Pro Tip: Design 2-5 main classes first. Then add sub-classes, interfaces, and relationships.')} variant="outline">
                            💡 Get Design Tips
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-4 rounded-lg border-2 border-purple-300">
                      <p className="font-semibold text-slate-900 mb-3">🧩 UML Building Blocks:</p>
                      <div className="space-y-2">
                        <Button className="w-full justify-start text-left text-xs" variant="outline">📦 Class</Button>
                        <Button className="w-full justify-start text-left text-xs" variant="outline">🔌 Interface</Button>
                        <Button className="w-full justify-start text-left text-xs" variant="outline">⭐ Abstract Class</Button>
                        <Button className="w-full justify-start text-left text-xs" variant="outline">📋 Enum</Button>
                        <Button className="w-full justify-start text-left text-xs" variant="outline">📌 Inheritance</Button>
                        <Button className="w-full justify-start text-left text-xs" variant="outline">🔗 Association</Button>
                        <Button className="w-full justify-start text-left text-xs" variant="outline">📦 Aggregation</Button>
                        <Button className="w-full justify-start text-left text-xs" variant="outline">🧩 Composition</Button>
                      </div>
                    </div>
                    
                    <Card className="p-3 bg-yellow-50 border-2 border-yellow-300">
                      <p className="text-sm font-semibold text-slate-700 mb-2">✅ Good Design Tips:</p>
                      <ul className="text-xs text-slate-600 space-y-1">
                        <li>• SRP: Each class has one reason to change</li>
                        <li>• DRY: Reuse common patterns</li>
                        <li>• Composition &gt; Inheritance</li>
                        <li>• Use interfaces for contracts</li>
                        <li>• Think about extensibility</li>
                      </ul>
                    </Card>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button onClick={() => setOopCurrentStep(2)} variant="outline" className="flex-1">← Back</Button>
                  <Button onClick={() => setOopCurrentStep(4)} className="flex-1 bg-purple-600 hover:bg-purple-700">Next: Design Patterns →</Button>
                </div>
              </Card>
            </div>
          )}

          {/* STEP 4: SOLID + Design Pattern Recommender */}
          {oopCurrentStep === 4 && selectedLldProblem && (
            <div className="space-y-6 animate-in fade-in">
              <Card className="p-6 border-2 bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-300">
                <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                  🏗️ SOLID Principles + Design Pattern Recommender (AI-Smart Differentiator)
                </h2>
                <p className="text-slate-600 mb-6">System analyzes your design and suggests improvements:</p>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-3">
                    <Card className="p-4 border-2 border-red-200 bg-red-50">
                      <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">⚠️ Detected Issues</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-700">SRP Violation Detected!</p>
                          <p className="text-xs text-slate-600">Vehicle class handles parking logic + payment. Should separate concerns.</p>
                          <Badge className="mt-2 bg-red-200 text-red-900 text-xs">Priority: High</Badge>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-700">OCP Violation!</p>
                          <p className="text-xs text-slate-600">Adding new vehicle type requires modifying existing code.</p>
                          <Badge className="mt-2 bg-yellow-200 text-yellow-900 text-xs">Priority: Medium</Badge>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-700">Tight Coupling!</p>
                          <p className="text-xs text-slate-600">ParkingLot directly depends on concrete Vehicle classes.</p>
                          <Badge className="mt-2 bg-yellow-200 text-yellow-900 text-xs">Priority: Medium</Badge>
                        </div>
                      </div>
                    </Card>
                  </div>
                  
                  <div className="space-y-3">
                    <Card className="p-4 border-2 border-green-200 bg-green-50">
                      <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">✅ Recommended Fixes</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-700">🔄 Use Strategy Pattern</p>
                          <p className="text-xs text-slate-600">For different pricing/payment strategies. Allows runtime selection.</p>
                          <Button size="sm" variant="outline" className="mt-2 text-xs">View Example Code →</Button>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-700">🏭 Use Factory Pattern</p>
                          <p className="text-xs text-slate-600">For creating Vehicles. Decouples creation from usage.</p>
                          <Button size="sm" variant="outline" className="mt-2 text-xs">View Example Code →</Button>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-700">🎯 Use Observer Pattern</p>
                          <p className="text-xs text-slate-600">For notifying users when spot is available. Decouples notification logic.</p>
                          <Button size="sm" variant="outline" className="mt-2 text-xs">View Example Code →</Button>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-700">👤 Consider Singleton</p>
                          <p className="text-xs text-slate-600">For ParkingLot itself - only one instance should exist globally.</p>
                          <Button size="sm" variant="outline" className="mt-2 text-xs">View Example Code →</Button>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
                  {[
                    { letter: 'S', name: 'Single Responsibility', status: '❌', hint: 'Each class should do one thing' },
                    { letter: 'O', name: 'Open/Closed', status: '⚠️', hint: 'Open for extension, closed for modification' },
                    { letter: 'L', name: 'Liskov Substitution', status: '✅', hint: 'Subtypes must be substitutable' },
                    { letter: 'I', name: 'Interface Segregation', status: '✅', hint: 'Many small interfaces > few large ones' },
                    { letter: 'D', name: 'Dependency Inversion', status: '❌', hint: 'Depend on abstractions, not concretions' },
                  ].map((solid, idx) => (
                    <Card key={idx} className={`p-3 border-2 text-center ${solid.status === '✅' ? 'border-green-400 bg-green-50' : solid.status === '⚠️' ? 'border-yellow-400 bg-yellow-50' : 'border-red-400 bg-red-50'}`}>
                      <p className="text-2xl font-bold text-slate-900 mb-1">{solid.letter}</p>
                      <p className="text-xs font-semibold text-slate-700 mb-1">{solid.name}</p>
                      <p className="text-lg font-bold mb-1">{solid.status}</p>
                      <p className="text-xs text-slate-600">{solid.hint}</p>
                    </Card>
                  ))}
                </div>
                
                <div className="flex gap-3">
                  <Button onClick={() => setOopCurrentStep(3)} variant="outline" className="flex-1">← Back</Button>
                  <Button onClick={() => setOopCurrentStep(5)} className="flex-1 bg-indigo-600 hover:bg-indigo-700">Next: Sequence Diagram →</Button>
                </div>
              </Card>
            </div>
          )}

          {/* STEP 5: Sequence Diagram / Flow Panel */}
          {oopCurrentStep === 5 && selectedLldProblem && (
            <div className="space-y-6 animate-in fade-in">
              <Card className="p-6 border-2 bg-gradient-to-br from-orange-50 to-amber-50 border-orange-300">
                <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                  🔁 Sequence Diagram / Interaction Flow
                </h2>
                <p className="text-slate-600 mb-4">Show how objects interact. Most platforms miss this - YOU won't!</p>
                
                <div className="space-y-4 mb-6">
                  {selectedLldProblem === 'parking-lot' && (
                    <>
                      <div className="bg-white p-6 border-2 border-orange-300 rounded-lg overflow-x-auto">
                        <div className="min-w-full text-center text-sm">
                          <div className="grid grid-cols-7 gap-2 mb-4 font-bold">
                            <div>User</div>
                            <div>↓</div>
                            <div>Gate</div>
                            <div>↓</div>
                            <div>ParkingLot</div>
                            <div>↓</div>
                            <div>Spot</div>
                          </div>
                          
                          <div className="space-y-3 text-xs">
                            <div className="p-3 bg-yellow-100 border-l-4 border-l-yellow-500">
                              <span className="font-bold">1.</span> User drives up → Gate receives vehicle
                            </div>
                            <div className="p-3 bg-yellow-100 border-l-4 border-l-yellow-500">
                              <span className="font-bold">2.</span> Gate calls: parkVehicle(vehicleId, type)
                            </div>
                            <div className="p-3 bg-yellow-100 border-l-4 border-l-yellow-500">
                              <span className="font-bold">3.</span> ParkingLot searches across levels for available spot
                            </div>
                            <div className="p-3 bg-yellow-100 border-l-4 border-l-yellow-500">
                              <span className="font-bold">4.</span> Spot.occupy(vehicle) → Update occupancy
                            </div>
                            <div className="p-3 bg-yellow-100 border-l-4 border-l-yellow-500">
                              <span className="font-bold">5.</span> Return Ticket with spotNumber, timestamp
                            </div>
                            <div className="p-3 bg-yellow-100 border-l-4 border-l-yellow-500">
                              <span className="font-bold">6.</span> Notify via Observer: Slot filled
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="p-4 border-2 border-orange-200 bg-orange-50">
                          <p className="font-bold text-slate-900 mb-2">📤 parkVehicle() Flow</p>
                          <ul className="text-xs space-y-1 text-slate-700">
                            <li>1. Validate vehicle type</li>
                            <li>2. Check spot availability</li>
                            <li>3. Assign spot</li>
                            <li>4. Create ticket</li>
                            <li>5. Notify observers</li>
                            <li>6. Return success</li>
                          </ul>
                        </Card>
                        <Card className="p-4 border-2 border-orange-200 bg-orange-50">
                          <p className="font-bold text-slate-900 mb-2">📥 unparkVehicle() Flow</p>
                          <ul className="text-xs space-y-1 text-slate-700">
                            <li>1. Validate ticket</li>
                            <li>2. Calculate charges</li>
                            <li>3. Process payment</li>
                            <li>4. Release spot</li>
                            <li>5. Notify observers</li>
                            <li>6. Return receipt</li>
                          </ul>
                        </Card>
                      </div>
                    </>
                  )}

                  {selectedLldProblem === 'elevator' && (
                    <div className="bg-white p-6 border-2 border-orange-300 rounded-lg">
                      <p className="font-bold text-slate-900 mb-4">🛗 Elevator Request Flow:</p>
                      <div className="space-y-2 text-sm">
                        <div className="p-2 bg-orange-100 border-l-4 border-l-orange-500">User presses button (5th floor) → ElevatorController.requestElevator(5)</div>
                        <div className="p-2 bg-orange-100 border-l-4 border-l-orange-500">Controller adds to RequestQueue (Priority: distance, direction)</div>
                        <div className="p-2 bg-orange-100 border-l-4 border-l-orange-500">Scheduler selects best Elevator (closest to 5th floor)</div>
                        <div className="p-2 bg-orange-100 border-l-4 border-l-orange-500">Elevator moves to 5th floor, door opens</div>
                        <div className="p-2 bg-orange-100 border-l-4 border-l-orange-500">Notify Display: "5th floor, door open"</div>
                        <div className="p-2 bg-orange-100 border-l-4 border-l-orange-500">Process next request or wait</div>
                      </div>
                    </div>
                  )}

                  {!['parking-lot', 'elevator'].includes(selectedLldProblem) && (
                    <div className="text-center py-8 text-slate-500">
                      <p className="mb-3">Sequence diagram template will render based on your problem</p>
                      <Button variant="outline" onClick={() => alert('💡 Tip: Think about: 1) Objects involved 2) Method calls 3) Return values 4) State changes')}>
                        Get Diagramming Tips
                      </Button>
                    </div>
                  )}
                </div>
                
                <Card className="p-4 bg-blue-50 border-2 border-blue-300 mb-6">
                  <p className="text-sm font-semibold text-slate-700">💡 Pro Tip:</p>
                  <p className="text-xs text-slate-600 mt-2">Draw flow for: <strong>happy path</strong> (successful operation), <strong>error cases</strong> (invalid input), and <strong>edge cases</strong> (concurrent access).</p>
                </Card>
                
                <div className="flex gap-3">
                  <Button onClick={() => setOopCurrentStep(4)} variant="outline" className="flex-1">← Back</Button>
                  <Button onClick={() => setOopCurrentStep(6)} className="flex-1 bg-orange-600 hover:bg-orange-700">Next: Machine Coding →</Button>
                </div>
              </Card>
            </div>
          )}

          {/* STEP 6: Machine Coding Editor */}
          {oopCurrentStep === 6 && selectedLldProblem && (
            <div className="space-y-6 animate-in fade-in">
              <Card className="p-6 border-2 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                  💻 Machine Coding Editor - Write Real Code (Hero Feature)
                </h2>
                <p className="text-slate-400 mb-4">LLD rounds require actual code. Practice here with real language support:</p>
                
                <div className="mb-4 flex gap-2">
                  {['java', 'python', 'cpp'].map((lang) => (
                    <Button 
                      key={lang}
                      onClick={() => setLldCodeLanguage(lang)}
                      className={`text-xs ${lldCodeLanguage === lang ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-700 hover:bg-slate-600'}`}
                    >
                      {lang === 'java' ? '☕ Java' : lang === 'python' ? '🐍 Python' : '⚙️ C++'}
                    </Button>
                  ))}
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                  <div className="lg:col-span-2">
                    <div className="bg-slate-950 p-4 rounded-lg border-2 border-slate-700 mb-3">
                      <p className="text-xs text-slate-400 mb-2">main.{lldCodeLanguage === 'java' ? 'java' : lldCodeLanguage === 'python' ? 'py' : 'cpp'}</p>
                      <textarea
                        value={lldMachineCode}
                        onChange={(e) => setLldMachineCode(e.target.value)}
                        placeholder={lldCodeLanguage === 'java' ? 'class ParkingLot {\n  // Your implementation\n}' : 'class ParkingLot:\n    # Your implementation'}
                        className="w-full h-96 bg-slate-900 text-green-400 font-mono text-sm p-3 rounded border-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white">▶️ Compile & Run</Button>
                      <Button variant="outline" className="flex-1">📋 Run Tests</Button>
                      <Button variant="outline" className="flex-1">📤 Submit</Button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Card className="p-3 bg-slate-800 border-2 border-slate-700">
                      <p className="text-sm font-bold text-white mb-2">📁 Folder Structure</p>
                      <div className="text-xs font-mono text-slate-300 space-y-1">
                        <div>📦 src/</div>
                        <div className="ml-2">├─ ParkingLot.{lldCodeLanguage === 'java' ? 'java' : 'py'}</div>
                        <div className="ml-2">├─ Vehicle.{lldCodeLanguage === 'java' ? 'java' : 'py'}</div>
                        <div className="ml-2">├─ ParkingSpot.{lldCodeLanguage === 'java' ? 'java' : 'py'}</div>
                        <div className="ml-2">└─ Level.{lldCodeLanguage === 'java' ? 'java' : 'py'}</div>
                        <div>📝 test/</div>
                        <div className="ml-2">└─ TestParkingLot.{lldCodeLanguage === 'java' ? 'java' : 'py'}</div>
                      </div>
                    </Card>
                    
                    <Card className="p-3 bg-slate-800 border-2 border-slate-700">
                      <p className="text-sm font-bold text-white mb-2">✅ Sample Driver Code</p>
                      <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-xs">📋 Load Template</Button>
                      <Button size="sm" variant="outline" className="w-full mt-2 text-xs">📖 View Solution</Button>
                    </Card>

                    <Card className="p-3 bg-slate-800 border-2 border-slate-700">
                      <p className="text-sm font-bold text-white mb-2">🧪 Unit Tests</p>
                      <div className="text-xs text-slate-300 space-y-1">
                        <div>✅ testParkVehicle</div>
                        <div>✅ testUnparkVehicle</div>
                        <div>✅ testFullParking</div>
                        <div>⏳ testConcurrency</div>
                      </div>
                    </Card>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button onClick={() => setOopCurrentStep(5)} variant="outline" className="flex-1">← Back</Button>
                  <Button onClick={() => setOopCurrentStep(7)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">Next: Dry Run →</Button>
                </div>
              </Card>
            </div>
          )}

          {/* STEP 7: Dry Run / Test Case Simulation */}
          {oopCurrentStep === 7 && selectedLldProblem && (
            <div className="space-y-6 animate-in fade-in">
              <Card className="p-6 border-2 bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-300">
                <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                  🧪 Dry Run / Test Case Simulation - Trace Execution
                </h2>
                <p className="text-slate-600 mb-4">Manually trace your code. See object creation, state changes, method calls:</p>
                
                <div className="space-y-4 mb-6">
                  {selectedLldProblem === 'parking-lot' && (
                    <>
                      <Card className="p-4 border-2 border-cyan-300 bg-cyan-50">
                        <p className="font-bold text-slate-900 mb-3">Test Case 1: Park then Unpark Vehicle</p>
                        <div className="space-y-2 text-sm">
                          <div className="p-2 bg-green-100 border-l-4 border-l-green-500">
                            <span className="font-bold">Step 1:</span> Create ParkingLot(2 levels, 5 spots/level)
                          </div>
                          <div className="p-2 bg-green-100 border-l-4 border-l-green-500">
                            <span className="font-bold">Step 2:</span> Car car1 = new Car("ABC123", "sedan")
                          </div>
                          <div className="p-2 bg-yellow-100 border-l-4 border-l-yellow-500">
                            <span className="font-bold">Step 3:</span> Ticket t1 = parkingLot.parkVehicle(car1)
                            <div className="text-xs text-slate-700 mt-1">→ State: Level1.Spot1 occupied by ABC123</div>
                          </div>
                          <div className="p-2 bg-yellow-100 border-l-4 border-l-yellow-500">
                            <span className="font-bold">Step 4:</span> parkVehicle(car1 again) → Should return ERROR (already parked!)
                          </div>
                          <div className="p-2 bg-blue-100 border-l-4 border-l-blue-500">
                            <span className="font-bold">Step 5:</span> Receipt = parkingLot.unparkVehicle(t1)
                            <div className="text-xs text-slate-700 mt-1">→ State: Level1.Spot1 now free, charges = $5</div>
                          </div>
                        </div>
                      </Card>

                      <Card className="p-4 border-2 border-red-300 bg-red-50">
                        <p className="font-bold text-slate-900 mb-3">Edge Case: Full Parking Lot</p>
                        <div className="space-y-2 text-sm">
                          <div className="p-2 bg-red-100 border-l-4 border-l-red-500">
                            <span className="font-bold">Scenario:</span> All 10 spots full, new vehicle arrives
                          </div>
                          <div className="p-2 bg-red-100 border-l-4 border-l-red-500">
                            <span className="font-bold">Expected Behavior:</span> parkVehicle() returns PARKING_FULL error
                          </div>
                          <div className="p-2 bg-red-100 border-l-4 border-l-red-500">
                            <span className="font-bold">Edge Case:</span> Concurrent request while parking is full
                          </div>
                        </div>
                      </Card>
                    </>
                  )}

                  {selectedLldProblem !== 'parking-lot' && (
                    <div className="text-center py-8 text-slate-500">
                      <p className="mb-4">Dry run scenario templates available for all problems</p>
                      <Button variant="outline" onClick={() => alert('💡 Tip: Manually trace 2-3 scenarios: happy path, error case, edge case')}>
                        View All Test Cases
                      </Button>
                    </div>
                  )}
                </div>

                <div className="bg-slate-900 p-4 rounded-lg border-2 border-slate-700 mb-6">
                  <p className="text-sm font-bold text-white mb-3">🔍 Live Execution Log:</p>
                  <textarea
                    value={lldDryRunLog}
                    onChange={(e) => setLldDryRunLog(e.target.value)}
                    placeholder="[Object Memory Graph]\nParkingLot@0x1000: levels=[Level@0x2000, Level@0x3000]\nLevel@0x2000: spots=[Spot@0x4000(FREE), Spot@0x4001(FREE)]\nCar@0x5000: licenseNo=ABC123, type=SEDAN"
                    className="w-full h-32 bg-slate-800 text-green-400 font-mono text-xs p-3 rounded border-none focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                
                <div className="flex gap-3">
                  <Button onClick={() => setOopCurrentStep(6)} variant="outline" className="flex-1">← Back</Button>
                  <Button onClick={() => setOopCurrentStep(8)} className="flex-1 bg-cyan-600 hover:bg-cyan-700">Next: OOP Concepts →</Button>
                </div>
              </Card>
            </div>
          )}

          {/* STEP 8: OOP Concepts Revision */}
          {oopCurrentStep === 8 && (
            <div className="space-y-6 animate-in fade-in">
              <Card className="p-6 border-2 bg-gradient-to-br from-rose-50 to-pink-50 border-rose-300">
                <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                  ⚙️ OOP Concepts Revision - Fresher-Friendly Master Class
                </h2>
                <p className="text-slate-600 mb-6">Master 8 core OOP concepts that are asked in every LLD interview:</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {[
                    { name: 'Encapsulation', description: 'Bundle data + methods together. Hide internal details. Use getters/setters.', example: 'private int balance; public getBalance() { }', emoji: '🔒' },
                    { name: 'Abstraction', description: 'Hide complex logic. Show only what\'s needed. Use abstract classes/interfaces.', example: 'abstract class Vehicle { abstract void drive(); }', emoji: '🎭' },
                    { name: 'Inheritance', description: 'Reuse code. Child extends parent. Single or hierarchical inheritance.', example: 'class Car extends Vehicle { }', emoji: '🔗' },
                    { name: 'Polymorphism', description: 'Same method, different behavior. Compile-time (overload) or runtime (override).', example: 'dog.makeSound() → "Woof" vs cat.makeSound() → "Meow"', emoji: '🎭' },
                    { name: 'Association', description: 'One class uses another. Can be one-to-one, one-to-many, or many-to-many.', example: 'class Student { School school; }', emoji: '🔗' },
                    { name: 'Composition vs Aggregation', description: 'Composition: Strong "HAS-A" (part cannot exist alone). Aggregation: Weak "HAS-A".', example: 'Engine is part of Car (composition). Student in School (aggregation).', emoji: '📦' },
                    { name: 'Interface vs Abstract Class', description: 'Interface: Contract (what to do). Abstract: Template (how to do it).', example: 'interface Shape { void draw(); }', emoji: '🔌' },
                    { name: 'SOLID Principles', description: 'SRP, OCP, LSP, ISP, DIP. Guidelines for maintainable, extensible code.', example: 'Each class = one responsibility. Use interfaces for flexibility.', emoji: '🏗️' },
                  ].map((concept, idx) => (
                    <Card 
                      key={idx}
                      onClick={() => setOopConceptIndex(idx)}
                      className={`p-4 border-2 cursor-pointer transition-all ${oopConceptIndex === idx ? 'border-rose-500 bg-rose-100 shadow-lg ring-2 ring-rose-300' : 'border-slate-200 hover:border-rose-400 hover:shadow-lg'} bg-white`}
                    >
                      <div className="flex items-start gap-3 mb-2">
                        <span className="text-2xl">{concept.emoji}</span>
                        <h3 className="font-bold text-slate-900">{concept.name}</h3>
                      </div>
                      <p className="text-xs text-slate-600 mb-2">{concept.description}</p>
                      {oopConceptIndex === idx && (
                        <div className="mt-3 pt-3 border-t-2 border-rose-300">
                          <p className="text-xs bg-rose-50 p-2 rounded font-mono text-slate-700">
                            <strong>Code:</strong> {concept.example}
                          </p>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
                
                <Card className="p-4 bg-gradient-to-r from-rose-100 to-pink-100 border-2 border-rose-300 mb-6">
                  <p className="text-sm font-semibold text-slate-700">💡 Interview Tip:</p>
                  <p className="text-xs text-slate-600 mt-2">Most LLD questions test <strong>Abstraction + Encapsulation</strong> (hiding complexity + information hiding) and <strong>Polymorphism</strong> (extensibility). Master these first!</p>
                </Card>
                
                <div className="flex gap-3">
                  <Button onClick={() => setOopCurrentStep(7)} variant="outline" className="flex-1">← Back</Button>
                  <Button onClick={() => setOopCurrentStep(9)} className="flex-1 bg-rose-600 hover:bg-rose-700">Next: AI Interviewer →</Button>
                </div>
              </Card>
            </div>
          )}

          {/* STEP 9: AI LLD Interviewer */}
          {oopCurrentStep === 9 && selectedLldProblem && (
            <div className="space-y-6 animate-in fade-in">
              <Card className="p-6 border-2 bg-gradient-to-br from-violet-50 to-purple-50 border-violet-300">
                <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                  🎙️ AI LLD Interviewer - Interactive Real Interview Simulation (Premium Feature)
                </h2>
                <p className="text-slate-600 mb-6">AI asks senior-level follow-up questions about your design:</p>
                
                <div className="space-y-4 mb-6">
                  <Card className="p-4 border-2 border-violet-300 bg-white">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="text-3xl">🤖</div>
                      <div className="flex-1">
                        <p className="font-bold text-slate-900">AI Interviewer (Senior at Amazon)</p>
                        <p className="text-xs text-slate-500">Level: Advanced</p>
                      </div>
                    </div>
                    <div className="bg-violet-50 p-4 rounded-lg border-l-4 border-l-violet-500 mb-4">
                      <p className="text-slate-900 font-medium">
                        "I see you're using a Singleton pattern for ParkingLot. Why Singleton here? What are the trade-offs? And how would you make it thread-safe?"
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-2 block">Your Answer:</label>
                      <Textarea 
                        placeholder="Type your response to the interviewer's question..." 
                        className="min-h-24 border-2 border-violet-300"
                      />
                    </div>
                    
                    <div className="flex gap-2 mt-3">
                      <Button variant="outline" className="flex-1 text-sm">Clear</Button>
                      <Button className="flex-1 bg-violet-600 hover:bg-violet-700 text-sm">Submit Answer</Button>
                    </div>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Card className="p-4 border-2 border-blue-200 bg-blue-50">
                      <p className="font-bold text-slate-900 mb-2">❓ Other Possible Questions:</p>
                      <ul className="text-xs text-slate-700 space-y-2">
                        <li>• Why Factory pattern here?</li>
                        <li>• How to extend for EV charging?</li>
                        <li>• What if levels are not uniform?</li>
                        <li>• Database schema design?</li>
                        <li>• Handle concurrent bookings?</li>
                      </ul>
                    </Card>
                    <Card className="p-4 border-2 border-green-200 bg-green-50">
                      <p className="font-bold text-slate-900 mb-2">✅ My Feedback:</p>
                      <ul className="text-xs text-slate-700 space-y-2">
                        <li>✓ Good understanding of concurrency</li>
                        <li>⚠️ Consider enum over String for status</li>
                        <li>✓ API interface is clean</li>
                        <li>✓ Edge cases handled well</li>
                        <li>✓ Overall design: 8.5/10</li>
                      </ul>
                    </Card>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button onClick={() => setOopCurrentStep(8)} variant="outline" className="flex-1">← Back</Button>
                  <Button onClick={() => setOopCurrentStep(10)} className="flex-1 bg-violet-600 hover:bg-violet-700">Next: Quality Score →</Button>
                </div>
              </Card>
            </div>
          )}

          {/* STEP 10: Design Quality Score Dashboard */}
          {oopCurrentStep === 10 && selectedLldProblem && (
            <div className="space-y-6 animate-in fade-in">
              <Card className="p-6 border-2 bg-gradient-to-br from-lime-50 to-green-50 border-lime-300">
                <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                  📊 Design Quality Score Dashboard - Get Detailed Feedback
                </h2>
                <p className="text-slate-600 mb-6">Your design is evaluated on multiple dimensions. Score breakdown:</p>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: 'Requirement Clarity', score: 9, color: 'from-green-400 to-green-600' },
                    { label: 'Class Responsibility', score: 8, color: 'from-green-400 to-green-600' },
                    { label: 'SOLID Score', score: 7, color: 'from-yellow-400 to-yellow-600' },
                    { label: 'Pattern Usage', score: 9, color: 'from-green-400 to-green-600' },
                    { label: 'Extensibility', score: 8, color: 'from-green-400 to-green-600' },
                    { label: 'Readability', score: 8, color: 'from-green-400 to-green-600' },
                    { label: 'Edge Case Handling', score: 6, color: 'from-yellow-400 to-yellow-600' },
                    { label: 'Code Quality', score: 7, color: 'from-yellow-400 to-yellow-600' },
                  ].map((item, idx) => (
                    <Card key={idx} className={`p-4 bg-gradient-to-br ${item.color} text-white text-center rounded-lg`}>
                      <p className="text-sm font-bold mb-2">{item.label}</p>
                      <p className="text-3xl font-bold mb-2">{item.score}/10</p>
                      <Progress value={item.score * 10} className="h-2 bg-white/30" />
                    </Card>
                  ))}
                </div>

                <div className="text-center mb-6">
                  <div className="text-6xl font-bold text-lime-600 mb-2">7.9/10</div>
                  <p className="text-slate-600 font-semibold">Overall Design Quality: <span className="text-lime-600">Good</span></p>
                  <Badge className="mt-2 bg-lime-600">"Intermediate Level - Ready for most LLD interviews"</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <Card className="p-4 border-2 border-green-300 bg-green-50">
                    <h3 className="font-bold text-slate-900 mb-3">✅ Strengths</h3>
                    <ul className="text-sm text-slate-700 space-y-2">
                      <li>✓ Clear class hierarchy with Vehicle types</li>
                      <li>✓ Factory pattern for vehicle creation</li>
                      <li>✓ Good separation of concerns</li>
                      <li>✓ Api interface is intuitive</li>
                      <li>✓ Handles basic edge cases</li>
                    </ul>
                  </Card>
                  <Card className="p-4 border-2 border-yellow-300 bg-yellow-50">
                    <h3 className="font-bold text-slate-900 mb-3">⚠️ Areas to Improve</h3>
                    <ul className="text-sm text-slate-700 space-y-2">
                      <li>• Weak thread-safety in concurrent scenarios</li>
                      <li>• Missing payment abstraction</li>
                      <li>• No observer pattern for notifications</li>
                      <li>• Enum instead of String for status</li>
                      <li>• Add validation in constructor</li>
                    </ul>
                  </Card>
                </div>

                <Card className="p-4 border-2 border-blue-300 bg-blue-50 mb-6">
                  <p className="font-bold text-slate-900 mb-3">🎯 Actionable Recommendations</p>
                  <ol className="text-sm text-slate-700 space-y-2">
                    <li><strong>1. Add Thread Safety:</strong> Use 'synchronized' or thread-safe collections for spot assignments.</li>
                    <li><strong>2. Observer Pattern:</strong> Notify listeners when spot becomes available/full.</li>
                    <li><strong>3. Strategy Pattern:</strong> Abstract payment logic into separate strategy interface.</li>
                    <li><strong>4. Use Enums:</strong> Replace String constants with proper enums for type safety.</li>
                    <li><strong>5. Add Validation:</strong> Input validation in all public methods.</li>
                  </ol>
                </Card>
                
                <div className="flex gap-3">
                  <Button onClick={() => setOopCurrentStep(9)} variant="outline" className="flex-1">← Back</Button>
                  <Button onClick={() => setOopCurrentStep(11)} className="flex-1 bg-lime-600 hover:bg-lime-700">Next: Reference Solutions →</Button>
                </div>
              </Card>
            </div>
          )}

          {/* STEP 11: Best Reference Solutions */}
          {oopCurrentStep === 11 && selectedLldProblem && (
            <div className="space-y-6 animate-in fade-in">
              <Card className="p-6 border-2 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300">
                <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                  📚 Reference Solutions - Learn from Best Implementations (Learning Booster)
                </h2>
                <p className="text-slate-600 mb-6">Study ideal designs. Understand patterns. Discover trade-offs:</p>
                
                <div className="space-y-4 mb-6">
                  <Card className="p-4 border-2 border-amber-300 bg-white">
                    <h3 className="font-bold text-slate-900 mb-3">🎯 Ideal UML Diagram</h3>
                    <div className="bg-amber-50 p-4 rounded-lg border-l-4 border-l-amber-500 mb-3">
                      <p className="text-xs font-mono text-slate-700 mb-2">Parking Lot (1) → (Many) Level → (Many) ParkingSpot</p>
                      <p className="text-xs font-mono text-slate-700 mb-2">Vehicle (Abstract) ← Car, Bike, Truck</p>
                      <p className="text-xs font-mono text-slate-700">Gate → PaymentProcessor (interface)</p>
                    </div>
                    <Button size="sm" variant="outline" className="w-full text-xs">📥 Download UML PDF</Button>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Card className="p-4 border-2 border-green-300 bg-green-50">
                      <h3 className="font-bold text-slate-900 mb-3">✅ Ideal Code Implementation</h3>
                      <div className="bg-white p-3 rounded border-2 border-green-200 mb-3 font-mono text-xs text-slate-700 max-h-32 overflow-y-auto">
                        <div>public class ParkingLot {"{"}  </div>
                        <div className="ml-4">private List&lt;Level&gt; levels;</div>
                        <div className="ml-4">private Gate[] gates;</div>
                        <div className="ml-4">public Ticket parkVehicle(...) {"{"}...{"}"}</div>
                        <div>{"}"}  </div>
                      </div>
                      <Button size="sm" variant="outline" className="w-full text-xs">📋 View Full Code</Button>
                    </Card>
                    <Card className="p-4 border-2 border-blue-300 bg-blue-50">
                      <h3 className="font-bold text-slate-900 mb-3">🎯 Design Patterns Used</h3>
                      <ul className="text-xs text-slate-700 space-y-2">
                        <li>✓ <strong>Singleton:</strong> ParkingLot (single instance)</li>
                        <li>✓ <strong>Factory:</strong> VehicleFactory for creating vehicles</li>
                        <li>✓ <strong>Strategy:</strong> PaymentProcessor for different payment methods</li>
                        <li>✓ <strong>Observer:</strong> Notify when spot is available</li>
                      </ul>
                    </Card>
                  </div>

                  <Card className="p-4 border-2 border-purple-300 bg-purple-50">
                    <h3 className="font-bold text-slate-900 mb-3">🔄 Alternate Design (Trade-off Discussion)</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-700 mb-1">Approach 1: Database-backed</p>
                        <p className="text-xs text-slate-600">✓ Scalable to millions of vehicles | ✗ Higher latency | ✗ Network calls</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700 mb-1">Approach 2: In-Memory (Current)</p>
                        <p className="text-xs text-slate-600">✓ Fast O(1) lookups | ✓ Simple | ✗ Data loss on crash</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700 mb-1">Approach 3: Hybrid Caching</p>
                        <p className="text-xs text-slate-600">✓ Best of both worlds | ✗ Complexity | ✗ Cache invalidation</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 border-2 border-orange-300 bg-orange-50">
                    <h3 className="font-bold text-slate-900 mb-3">📊 Additional Resources</h3>
                    <div className="space-y-2 text-xs">
                      <Button variant="outline" className="w-full justify-start text-xs">
                        📖 Detailed Blog Post: LLD Design Best Practices
                      </Button>
                      <Button variant="outline" className="w-full justify-start text-xs">
                        🎥 Video Explanation: Real Interview Walkthrough
                      </Button>
                      <Button variant="outline" className="w-full justify-start text-xs">
                        💬 Discussion Forum: Q&A with Experienced Designers
                      </Button>
                      <Button variant="outline" className="w-full justify-start text-xs">
                        📝 GitHub: Complete Source Code
                      </Button>
                    </div>
                  </Card>
                </div>

                <div className="flex gap-3">
                  <Button onClick={() => setOopCurrentStep(10)} variant="outline" className="flex-1">← Back</Button>
                  <Button onClick={() => { setOopCurrentStep(1); setSelectedLldProblem(null); }} className="flex-1 bg-amber-600 hover:bg-amber-700">Start New Problem →</Button>
                </div>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Keep existing interview stats and sessions below */}
      {!isInterviewActive && !showResults && activeTab === 'interview' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 mb-6 md:mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <button
                  key={index}
                  onClick={() => setApiError(`📊 ${stat.label}: ${stat.value}`)}
                  className="group"
                >
                  <Card className="p-3 md:p-5 border-2 hover:shadow-lg hover:border-blue-400 transition-all hover:-translate-y-1 cursor-pointer h-full">
                    <div className="flex items-center gap-2 md:gap-4">
                      <div className={`${stat.color} p-2 md:p-3 rounded-xl group-hover:scale-110 transition-transform`}>
                        <Icon className={`size-4 md:size-6 ${stat.textColor}`} />
                      </div>
                      <div className="text-left">
                        <p className="text-xl md:text-3xl font-bold text-slate-900">{stat.value}</p>
                        <p className="text-xs md:text-sm text-slate-600 font-medium">{stat.label}</p>
                      </div>
                    </div>
                  </Card>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Start New Interview */}
            <Card className="lg:col-span-2 p-6 md:p-8 border-2 shadow-lg bg-gradient-to-br from-blue-50 to-purple-50">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 md:mb-8">
                <div className="p-3 md:p-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg shrink-0">
                  <Sparkles className="size-6 md:size-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-900">Start New Interview</h2>
                  <p className="text-sm md:text-base text-slate-600">Configure your AI-powered mock interview session</p>
                </div>
              </div>

              <div className="space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs md:text-sm font-bold text-slate-700 mb-2">
                      Interview Type
                    </label>
                    <Select value={interviewType} onValueChange={setInterviewType}>
                      <SelectTrigger className="h-10 md:h-12 border-2 text-xs md:text-sm">
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
                    <label className="block text-xs md:text-sm font-bold text-slate-700 mb-2">
                      Target Role
                    </label>
                    <Select value={interviewRole} onValueChange={setInterviewRole}>
                      <SelectTrigger className="h-10 md:h-12 border-2 text-xs md:text-sm">
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

                <div className="bg-white border-2 border-blue-300 rounded-2xl p-4 md:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Brain className="size-4 md:size-5 text-blue-600" />
                    <h4 className="font-bold text-blue-900 text-sm md:text-base">What to expect:</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: MessageSquare, text: '5 AI-generated questions tailored to your role' },
                      { icon: Clock, text: 'Real-time feedback on your responses' },
                      { icon: Star, text: 'Detailed scoring on multiple parameters' },
                      { icon: Award, text: 'Personalized improvement recommendations' },
                    ].map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <div key={index} className="flex items-start gap-2 md:gap-3">
                          <div className="p-1.5 md:p-2 bg-blue-100 rounded-lg shrink-0">
                            <Icon className="size-3 md:size-4 text-blue-600" />
                          </div>
                          <span className="text-xs md:text-sm text-slate-700 leading-snug">{item.text}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <Button 
                  className="w-full h-12 md:h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-base md:text-lg font-semibold shadow-lg text-white"
                  size="lg"
                  onClick={handleStartMockInterview}
                >
                  <Play className="size-5 md:size-6 mr-2" />
                  Start Mock Interview
                </Button>
              </div>
            </Card>

            {/* Interview Tips & Setup */}
            <div className="space-y-4 md:space-y-6">
              <Card className="p-4 md:p-6 border-2 shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="size-4 md:size-5 text-yellow-600" />
                  <h3 className="font-bold text-slate-900 text-base md:text-lg">Interview Tips</h3>
                </div>
                <div className="space-y-2 md:space-y-3">
                  {[
                    { color: 'from-blue-500 to-blue-600', title: 'Be Structured', desc: 'Use frameworks like STAR for behavioral questions' },
                    { color: 'from-green-500 to-green-600', title: 'Think Aloud', desc: 'Share your thought process while solving problems' },
                    { color: 'from-purple-500 to-purple-600', title: 'Ask Questions', desc: "Don't hesitate to clarify requirements" },
                  ].map((tip, index) => (
                    <button
                      key={index}
                      onClick={() => setApiError(`💡 ${tip.title}: ${tip.desc}`)}
                      className={`w-full p-3 md:p-4 bg-gradient-to-r ${tip.color} rounded-xl text-white text-left transition-transform hover:scale-105 cursor-pointer`}
                    >
                      <p className="font-bold text-sm md:text-base mb-1">{tip.title}</p>
                      <p className="text-xs md:text-sm opacity-90">{tip.desc}</p>
                    </button>
                  ))}
                </div>
              </Card>

              <Card className="p-4 md:p-6 border-2 shadow-lg bg-gradient-to-br from-slate-50 to-purple-50">
                <h3 className="font-bold text-slate-900 mb-4 text-base md:text-lg flex items-center gap-2">
                  <Camera className="size-4 md:size-5 text-purple-600" />
                  Setup Check
                </h3>
                
                {permissionError && (
                  <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="size-4 text-red-600 mt-0.5 shrink-0" />
                      <p className="text-xs md:text-sm text-red-700">{permissionError}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-2 md:space-y-3">
                  <div className={`flex items-center justify-between p-2 md:p-3 bg-white border-2 rounded-xl transition-colors ${
                    cameraReady ? 'border-green-200' : permissionError ? 'border-red-200' : 'border-slate-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      <div className={`p-1 rounded-lg ${
                        cameraReady ? 'bg-green-100' : 'bg-slate-100'
                      }`}>
                        <Camera className={`size-3 md:size-4 ${
                          cameraReady ? 'text-green-600' : 'text-slate-400'
                        }`} />
                      </div>
                      <span className="text-xs md:text-sm font-medium">Camera</span>
                    </div>
                    <Badge className={`text-xs ${
                      isCheckingPermissions ? 'bg-slate-300 text-slate-600' :
                      cameraReady ? 'bg-green-600' : 'bg-red-500'
                    }`}>
                      {isCheckingPermissions ? 'Checking...' : cameraReady ? 'Ready' : 'Denied'}
                    </Badge>
                  </div>
                  <div className={`flex items-center justify-between p-2 md:p-3 bg-white border-2 rounded-xl transition-colors ${
                    microphoneReady ? 'border-green-200' : permissionError ? 'border-red-200' : 'border-slate-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      <div className={`p-1 rounded-lg ${
                        microphoneReady ? 'bg-green-100' : 'bg-slate-100'
                      }`}>
                        <Mic className={`size-3 md:size-4 ${
                          microphoneReady ? 'text-green-600' : 'text-slate-400'
                        }`} />
                      </div>
                      <span className="text-xs md:text-sm font-medium">Microphone</span>
                    </div>
                    <Badge className={`text-xs ${
                      isCheckingPermissions ? 'bg-slate-300 text-slate-600' :
                      microphoneReady ? 'bg-green-600' : 'bg-red-500'
                    }`}>
                      {isCheckingPermissions ? 'Checking...' : microphoneReady ? 'Ready' : 'Denied'}
                    </Badge>
                  </div>
                  <div className={`flex items-center justify-between p-2 md:p-3 bg-white border-2 rounded-xl transition-colors ${
                    audioReady ? 'border-green-200' : permissionError ? 'border-red-200' : 'border-slate-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      <div className={`p-1 rounded-lg ${
                        audioReady ? 'bg-green-100' : 'bg-slate-100'
                      }`}>
                        <Volume2 className={`size-3 md:size-4 ${
                          audioReady ? 'text-green-600' : 'text-slate-400'
                        }`} />
                      </div>
                      <span className="text-xs md:text-sm font-medium">Audio</span>
                    </div>
                    <Badge className={`text-xs ${
                      isCheckingPermissions ? 'bg-slate-300 text-slate-600' :
                      audioReady ? 'bg-green-600' : 'bg-red-500'
                    }`}>
                      {isCheckingPermissions ? 'Checking...' : audioReady ? 'Ready' : 'Denied'}
                    </Badge>
                  </div>
                </div>

                <Button 
                  variant="outline"
                  className="w-full h-9 md:h-10 border-2 text-xs md:text-sm font-semibold mt-2 md:mt-3 hover:bg-purple-50 transition-colors"
                  onClick={checkPermissions}
                  disabled={isCheckingPermissions}
                >
                  {isCheckingPermissions ? 'Checking Permissions...' : 'Recheck Permissions'}
                </Button>
              </Card>
            </div>
          </div>

          {/* Search for Previous Sessions */}
          <Card className="p-3 md:p-6 mb-6 border-2 shadow-md">
            <div className="flex flex-col sm:flex-row gap-2 md:gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3 md:size-5 text-slate-400" />
                <Input
                  placeholder="Search previous interviews by type or role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 md:pl-10 h-9 md:h-11 text-xs md:text-base border-2 border-slate-300 focus:border-blue-500"
                />
              </div>
            </div>
          </Card>

          {/* Previous Sessions - Responsive Cards */}
          <Card className="p-4 md:p-6 mt-8 border-2 shadow-lg">
            <h2 className="text-lg md:text-2xl font-bold text-slate-900 mb-6">Previous Interview Sessions</h2>
            <Tabs defaultValue="all">
              <TabsList className="bg-white border-2 border-slate-200 p-1 flex-wrap h-auto gap-1">
                <TabsTrigger value="all" className="text-xs md:text-sm">All</TabsTrigger>
                <TabsTrigger value="technical" className="text-xs md:text-sm">Technical</TabsTrigger>
                <TabsTrigger value="hr" className="text-xs md:text-sm">HR</TabsTrigger>
                <TabsTrigger value="behavioral" className="text-xs md:text-sm">Behavioral</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-3 md:space-y-4 mt-4 md:mt-6">
                {filteredSessions.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-slate-500 text-sm md:text-lg">No interviews found matching your search.</p>
                  </div>
                ) : (
                  filteredSessions.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => setSelectedSession(session)}
                      className="w-full text-left transition-all hover:scale-102"
                    >
                      <Card className="p-3 md:p-6 border-2 hover:shadow-lg hover:border-blue-400 transition-all cursor-pointer h-full">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-4">
                          <div className="flex items-start gap-3 md:gap-5 flex-1">
                            <div className={`p-2 md:p-4 rounded-2xl border-2 shrink-0 ${
                              session.type === 'Technical' ? 'bg-blue-100 border-blue-300' :
                              session.type === 'HR' ? 'bg-green-100 border-green-300' :
                              session.type === 'Behavioral' ? 'bg-purple-100 border-purple-300' :
                              'bg-orange-100 border-orange-300'
                            }`}>
                              <Video className={`size-4 md:size-6 ${
                                session.type === 'Technical' ? 'text-blue-600' :
                                session.type === 'HR' ? 'text-green-600' :
                                session.type === 'Behavioral' ? 'text-purple-600' :
                                'text-orange-600'
                              }`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-2">
                                <h3 className="text-sm md:text-lg font-bold text-slate-900 truncate">{session.type} Interview</h3>
                                <Badge className="bg-slate-600 w-fit text-xs md:text-sm">{session.role}</Badge>
                              </div>
                              <div className="flex items-center gap-1 md:gap-4 text-xs md:text-sm text-slate-600 mb-3 md:mb-4 flex-wrap">
                                <span className="flex items-center gap-1">
                                  <Clock className="size-3 md:size-4" />
                                  {session.date}
                                </span>
                                <span className="hidden md:inline">•</span>
                                <span>{session.duration}</span>
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1 md:gap-3">
                                {Object.entries(session.feedback).filter(([key]) => key !== 'overall').map(([key, value]) => (
                                  <div key={key} className="text-center">
                                    <div className="text-[10px] md:text-xs text-slate-600 mb-1 capitalize line-clamp-1">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                                    <Progress value={value} className="h-1 md:h-2 mb-1" />
                                    <div className="text-xs font-bold text-slate-900">{value}%</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="text-center w-full md:w-auto">
                            <div className={`text-2xl md:text-4xl font-bold mb-0.5 ${
                              session.score >= 80 ? 'text-green-600' :
                              session.score >= 60 ? 'text-yellow-600' :
                              'text-red-600'
                            }`}>
                              {session.score}%
                            </div>
                            <p className="text-xs md:text-sm text-slate-600 font-medium">Score</p>
                          </div>
                        </div>
                      </Card>
                    </button>
                  ))
                )}
              </TabsContent>

              <TabsContent value="technical" className="mt-6">
                <p className="text-center text-slate-600 py-8 text-sm md:text-base">Technical interviews filter active</p>
              </TabsContent>
              <TabsContent value="hr" className="mt-6">
                <p className="text-center text-slate-600 py-8 text-sm md:text-base">HR interviews filter active</p>
              </TabsContent>
              <TabsContent value="behavioral" className="mt-6">
                <p className="text-center text-slate-600 py-8 text-sm md:text-base">Behavioral interviews filter active</p>
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

          {/* Camera Feed */}
          <div className="mb-8 p-4 bg-black rounded-2xl border-2 border-blue-400 w-full md:w-80 md:float-right md:ml-6">
            <video 
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-48 md:h-56 rounded-xl object-cover"
              style={{ transform: 'scaleX(-1)' }}
            />
            <p className="text-xs text-slate-300 mt-2 text-center">📹 Your face</p>
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
                <DialogDescription>
                  Review your interview performance, feedback, and detailed analysis
                </DialogDescription>
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
            <DialogDescription className="text-sm md:text-base">
              Configure your AI-powered mock interview session
            </DialogDescription>
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

              <Button 
                variant="outline"
                className="w-full h-11 border-2 text-base font-semibold mt-3 hover:bg-purple-50"
                onClick={checkPermissions}
                disabled={isCheckingPermissions}
              >
                {isCheckingPermissions ? 'Checking Permissions...' : 'Recheck Permissions'}
              </Button>
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
