import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Avatar,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Rating,
  Alert,
  useMediaQuery,
  useTheme,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  FormLabel,
} from '@mui/material';
import {
  Search as SearchIcon,
  ThumbUp as LikeIcon,
  ThumbUpOutlined as ThumbUpOutlinedIcon,
  Comment as CommentIcon,
  Code as CodeIcon,
  DescriptionOutlined as FileIcon,
  Create as CreateIcon,
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
  Timeline as TimelineIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Add as AddIcon,
} from '@mui/icons-material';


interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index } = props;
  return (
    <Box sx={{ display: value !== index ? 'none' : 'block', width: '100%' }}>
      <Box sx={{ p: 2 }}>{children}</Box>
    </Box>
  );
}

interface Experience {
  id: string;
  studentName: string;
  avatar: string;
  company: string;
  role: string;
  package: string;
  offerType: 'Off-campus' | 'On-campus';
  branch: string;
  date: string;
  roundFlow: string;
  timeline: { day: number; event: string; date: string }[];
  roundDifficulty: { [key: string]: number };
  oaQuestions: string[];
  technicalQuestions: string[];
  hrQuestions: string[];
  lldQuestions: string[];
  aptitudeQuestions: string[];
  resume: { fileName: string; atsScore: number; keywordMatches: string[] };
  prepStrategy: {
    whatToStudy: string[];
    importantTopics: string[];
    timeSpent: string;
    mistakesDone: string[];
    revisionSheet: string;
    lastDayPrep: string[];
  };
  likes: number;
  comments: number;
}

interface Comment {
  id: string;
  author: string;
  authorAvatar: string;
  text: string;
  date: string;
  likes: number;
}


const Blogs: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);
  const [experienceDialogOpen, setExperienceDialogOpen] = useState(false);
  const [addExperienceOpen, setAddExperienceOpen] = useState(false);
  const [dialogTabValue, setDialogTabValue] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [newComments, setNewComments] = useState<{ [key: string]: Comment[] }>({});
  const [likedExperiences, setLikedExperiences] = useState<Set<string>>(new Set());
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>(() => {
    const defaultExperiences: Experience[] = [
      {
        id: '1',
        studentName: 'Rahul Kumar',
        avatar: 'RK',
        company: 'Amazon',
        role: 'SDE',
        package: '18 LPA',
        offerType: 'Off-campus',
        branch: 'CSE-B',
        date: '15 Jan 2026',
        roundFlow: 'OA → DSA Round → LLD → HR',
        timeline: [
          { day: 1, event: 'Online Assessment - 90min', date: '2026-01-10' },
          { day: 3, event: 'Technical Round 1 - DSA Focus', date: '2026-01-12' },
          { day: 4, event: 'Technical Round 2 - LLD + Design', date: '2026-01-13' },
          { day: 5, event: 'HR Round - Culture Fit', date: '2026-01-14' },
          { day: 6, event: 'Offer Released - 18 LPA', date: '2026-01-15' },
        ],
        roundDifficulty: { 'Online Assessment': 3, 'Technical Round 1': 4, 'Technical Round 2': 4, 'HR Round': 2 },
        oaQuestions: ['Two-Sum', 'Longest Substring Without Repeating', 'Sliding Window Maximum', 'LRU Cache Design'],
        technicalQuestions: ['Design Twitter Feed System', 'Design Game Multiplayer Server', 'Database Query Optimization'],
        hrQuestions: ['Tell about your final year project', 'Why do you want to join Amazon?', 'Describe a challenging situation', 'What are your career goals?'],
        lldQuestions: ['Design Parking Lot System', 'Design E-Commerce Platform', 'Design Task Scheduler'],
        aptitudeQuestions: ['OS - Deadlock Detection', 'DBMS - Joins & Normalization', 'Networks - OSI Model'],
        resume: { fileName: 'Rahul_Kumar_Resume.pdf', atsScore: 87, keywordMatches: ['Python', 'DSA', 'System Design', 'AWS', 'Java', 'Microservices', 'PostgreSQL'] },
        prepStrategy: {
          whatToStudy: ['Sliding Window + 2 Pointers', 'Binary Search Trees', 'Dynamic Programming', 'Graphs & BFS/DFS', 'Microservices Architecture'],
          importantTopics: ['Arrays & Strings', 'Binary Trees', 'Graphs', 'System Design', 'OOPS'],
          timeSpent: '120 hours over 3 months',
          mistakesDone: ['Not reading problem statement carefully', 'Not optimizing time complexity first', 'Rushing through mock interviews'],
          revisionSheet: 'GitHub Gist - 50 Most Common Patterns',
          lastDayPrep: ['Revised 20 important DSA problems', 'System Design 2-hour session', 'AWS services quick review', '8 hours quality sleep'],
        },
        likes: 342,
        comments: 87,
      },
      {
        id: '2',
        studentName: 'Priya Sharma',
        avatar: 'PS',
        company: 'Microsoft',
        role: 'SDE',
        package: '22 LPA',
        offerType: 'Off-campus',
        branch: 'IT-A',
        date: '10 Jan 2026',
        roundFlow: 'OA → Coding 1 → Coding 2 → Design → HR',
        timeline: [
          { day: 1, event: 'OA - Moderate to Hard DSA', date: '2026-01-05' },
          { day: 3, event: 'Coding Round 1 - LeetCode Style', date: '2026-01-07' },
          { day: 4, event: 'Coding Round 2 - Advanced DSA', date: '2026-01-08' },
          { day: 5, event: 'System Design - Architecture Focus', date: '2026-01-09' },
          { day: 6, event: 'HR Round - Team Fit Assessment', date: '2026-01-10' },
        ],
        roundDifficulty: { 'Online Assessment': 3, 'Coding Round 1': 3, 'Coding Round 2': 4, 'System Design': 4, 'HR Round': 2 },
        oaQuestions: ['Median of Two Sorted Arrays', 'Word Ladder II', 'Trapping Rain Water II'],
        technicalQuestions: ['Design URL Shortening Service', 'Design Distributed Cache', 'Design Content Delivery Network'],
        hrQuestions: ['Tell me about yourself', 'Why Microsoft?', 'Describe your greatest achievement'],
        lldQuestions: ['Design Chess Game', 'Design Elevator System', 'Design Vending Machine'],
        aptitudeQuestions: ['Database Indexing Strategies', 'ACID Properties', 'Concurrency Control'],
        resume: { fileName: 'Priya_Sharma_Resume.pdf', atsScore: 91, keywordMatches: ['C++', 'Algorithms', 'Azure', 'Distributed Systems', 'REST APIs', 'Docker', 'Kubernetes'] },
        prepStrategy: {
          whatToStudy: ['Advanced DSA Patterns', 'System Design Fundamentals', 'Database Design', 'Networking Protocols'],
          importantTopics: ['Complex Graphs', 'DP Optimization', 'Scalability Patterns', 'API Design'],
          timeSpent: '180 hours over 4.5 months',
          mistakesDone: ['Overcomplicating simple solutions', 'Not discussing approach with interviewer first'],
          revisionSheet: 'Notion Database - 100+ Problems with Solutions',
          lastDayPrep: ['Mock interview with senior engineer', 'System Design full walkthrough', 'Meditation & light exercise'],
        },
        likes: 456,
        comments: 112,
      },
      {
        id: '3',
        studentName: 'Amit Patel',
        avatar: 'AP',
        company: 'Google',
        role: 'Data Analyst',
        package: '15 LPA',
        offerType: 'Off-campus',
        branch: 'ECE-C',
        date: '05 Jan 2026',
        roundFlow: 'OA → SQL → Analytics Case Study → HR',
        timeline: [
          { day: 1, event: 'Online Assessment - SQL & Logic', date: '2026-01-01' },
          { day: 2, event: 'SQL Round - Complex Queries', date: '2026-01-02' },
          { day: 4, event: 'Analytics - Case Study Analysis', date: '2026-01-04' },
          { day: 5, event: 'HR Round - Culture & Impact', date: '2026-01-05' },
        ],
        roundDifficulty: { 'Online Assessment': 2, 'SQL Round': 3, 'Analytics Round': 3, 'HR Round': 2 },
        oaQuestions: ['Complex Multi-Table SQL Joins', 'Window Functions Usage', 'Data Aggregation Queries'],
        technicalQuestions: ['Analyze User Retention Metrics', 'Design A/B Testing Framework', 'Build Data Pipeline Architecture'],
        hrQuestions: ['Why do you want to work in data analytics?', 'Example of data-driven decision', 'How do you handle ambiguous requirements?'],
        lldQuestions: [],
        aptitudeQuestions: ['Statistics & Probability', 'A/B Testing Fundamentals', 'Data Visualization Best Practices'],
        resume: { fileName: 'Amit_Patel_Resume.pdf', atsScore: 85, keywordMatches: ['SQL', 'Tableau', 'Python', 'Google Analytics', 'BigQuery', 'Excel', 'Statistics'] },
        prepStrategy: {
          whatToStudy: ['Advanced SQL Query Optimization', 'Data Visualization Principles', 'Statistical Analysis', 'Python for Data Analysis'],
          importantTopics: ['Complex JOINs', 'Window Functions', 'Statistics', 'A/B Testing'],
          timeSpent: '100 hours over 2.5 months',
          mistakesDone: ['Not optimizing SQL queries', 'Missing business context in analysis'],
          revisionSheet: 'LeetCode SQL - Premium Exercises',
          lastDayPrep: ['Practiced 10 complex SQL queries', 'Reviewed 5 case study examples', 'Business analytics articles'],
        },
        likes: 234,
        comments: 56,
      },
      {
        id: '4',
        studentName: 'Neha Gupta',
        avatar: 'NG',
        company: 'Amazon',
        role: 'SDE',
        package: '16 LPA',
        offerType: 'On-campus',
        branch: 'CSE-C',
        date: '20 Jan 2026',
        roundFlow: 'Online Test → Tech Round 1 → Tech Round 2 → HR',
        timeline: [
          { day: 1, event: 'Online Assessment - 2 hours', date: '2026-01-15' },
          { day: 3, event: 'Technical Round 1 - Problem Solving', date: '2026-01-17' },
          { day: 4, event: 'Technical Round 2 - Data Structures', date: '2026-01-18' },
          { day: 5, event: 'HR + Manager Round', date: '2026-01-19' },
          { day: 6, event: 'Offer - 16 LPA', date: '2026-01-20' },
        ],
        roundDifficulty: { 'Online Assessment': 2, 'Technical Round 1': 3, 'Technical Round 2': 3, 'HR Round': 2 },
        oaQuestions: ['Reverse String', 'Maximum Subarray', 'Valid Parentheses', 'Merge Intervals'],
        technicalQuestions: ['Product of Array Except Self', 'Kth Largest Element', 'Serialize and Deserialize Binary Tree'],
        hrQuestions: ['What are your strengths?', 'Any leadership experience?', 'Handle team conflict?', 'Why Amazon?'],
        lldQuestions: ['Design ATM Machine', 'Design Snake Game'],
        aptitudeQuestions: ['Memory Management in OS', 'B-Trees vs Hash Tables', 'TCP vs UDP'],
        resume: { fileName: 'Neha_Gupta_Resume.pdf', atsScore: 82, keywordMatches: ['Java', 'Python', 'DSA', 'Algorithms', 'Linux', 'Git', 'MySQL'] },
        prepStrategy: {
          whatToStudy: ['Arrays & Strings', 'Linked Lists', 'Stacks & Queues', 'Trees & Graphs'],
          importantTopics: ['Sorting Algorithms', 'Binary Search', 'Hash Maps', 'Recursion'],
          timeSpent: '90 hours over 2.5 months',
          mistakesDone: ['Syntax errors during interviews', 'Not tracking time complexity'],
          revisionSheet: 'Excel Sheet - All Patterns Covered',
          lastDayPrep: ['Solved 15 problems', 'Reviewed key concepts', 'Got 8 hours sleep'],
        },
        likes: 289,
        comments: 73,
      },
      {
        id: '5',
        studentName: 'Rohan Verma',
        avatar: 'RV',
        company: 'Amazon',
        role: 'SDE',
        package: '17 LPA',
        offerType: 'Off-campus',
        branch: 'IT-B',
        date: '22 Jan 2026',
        roundFlow: 'OA → Coding 1 → Coding 2 → Design → HR',
        timeline: [
          { day: 1, event: 'Online Test - Algorithm Focus', date: '2026-01-18' },
          { day: 2, event: 'Coding Round 1 - Medium Problems', date: '2026-01-19' },
          { day: 3, event: 'Coding Round 2 - Hard Problems', date: '2026-01-20' },
          { day: 4, event: 'System Design Round', date: '2026-01-21' },
          { day: 5, event: 'HR + Final Discussion', date: '2026-01-22' },
        ],
        roundDifficulty: { 'Online Assessment': 3, 'Coding 1': 3, 'Coding 2': 4, 'System Design': 3, 'HR': 2 },
        oaQuestions: ['Letter Combinations of Phone', 'Remove Duplicates Sorted', 'Rotate Array'],
        technicalQuestions: ['Implement Trie', 'Word Search II', 'Number of Islands'],
        hrQuestions: ['Career aspirations?', 'Team work experience?', 'Failure story?'],
        lldQuestions: ['Design Library System', 'Design Hotel Booking'],
        aptitudeQuestions: ['Operating Systems Basics', 'Database Concepts', 'Networking Fundamentals'],
        resume: { fileName: 'Rohan_Verma_Resume.pdf', atsScore: 84, keywordMatches: ['C++', 'DSA', 'Problem Solving', 'Git', 'Linux', 'REST APIs'] },
        prepStrategy: {
          whatToStudy: ['Backtracking', 'Dynamic Programming', 'Graph Algorithms', 'String Algorithms'],
          importantTopics: ['BFS/DFS', 'LCA', 'Topological Sort', 'DP Patterns'],
          timeSpent: '130 hours over 3 months',
          mistakesDone: ['Edge case handling', 'Off-by-one errors'],
          revisionSheet: 'Notion - Categorized Problems',
          lastDayPrep: ['Practiced mock interviews', 'Reviewed tricky edge cases'],
        },
        likes: 312,
        comments: 89,
      },
      {
        id: '6',
        studentName: 'Anjali Desai',
        avatar: 'AD',
        company: 'Microsoft',
        role: 'SDE',
        package: '20 LPA',
        offerType: 'Off-campus',
        branch: 'CSE-A',
        date: '08 Jan 2026',
        roundFlow: 'Screening → Coding 1 → Coding 2 → Design → HR',
        timeline: [
          { day: 1, event: 'Initial Screening Call', date: '2026-01-03' },
          { day: 3, event: 'Coding Round 1', date: '2026-01-05' },
          { day: 4, event: 'Coding Round 2', date: '2026-01-06' },
          { day: 5, event: 'Design Round', date: '2026-01-07' },
          { day: 6, event: 'HR Round + Offer', date: '2026-01-08' },
        ],
        roundDifficulty: { 'Screening': 1, 'Coding 1': 3, 'Coding 2': 4, 'Design': 4, 'HR': 2 },
        oaQuestions: ['Longest Increasing Subsequence', 'Minimum Window Substring', 'Wildcard Matching'],
        technicalQuestions: ['Design File Sharing System', 'Design Real-time Chat', 'Design E-commerce Recommendation Engine'],
        hrQuestions: ['Background & experience?', 'Collaboration examples?', 'Cross-team coordination?'],
        lldQuestions: ['Design Parking Garage', 'Design Restaurant Reservation System'],
        aptitudeQuestions: ['Advanced OS Concepts', 'RDBMS Advanced', 'Network Protocols Deep Dive'],
        resume: { fileName: 'Anjali_Desai_Resume.pdf', atsScore: 89, keywordMatches: ['Python', 'JavaScript', 'Azure Services', 'Microservices', 'System Design', 'AWS', 'Docker'] },
        prepStrategy: {
          whatToStudy: ['Advanced DP', 'Graph Theory', 'Distributed Systems', 'Database Optimization'],
          importantTopics: ['BFS/DFS Variations', 'DP Optimization Techniques', 'Scalability Patterns'],
          timeSpent: '150 hours over 4 months',
          mistakesDone: ['Not asking clarifying questions', 'Premature optimization'],
          revisionSheet: 'Private GitHub Repo - Solutions Explained',
          lastDayPrep: ['Two mock interviews', 'System design deep dive', 'Review feedback'],
        },
        likes: 398,
        comments: 104,
      },
      {
        id: '7',
        studentName: 'Vikram Singh',
        avatar: 'VS',
        company: 'Microsoft',
        role: 'SDE',
        package: '19 LPA',
        offerType: 'On-campus',
        branch: 'CSE-B',
        date: '12 Jan 2026',
        roundFlow: 'OA → Round 1 → Round 2 → Round 3 → HR',
        timeline: [
          { day: 1, event: 'Online Assessment', date: '2026-01-08' },
          { day: 2, event: 'Technical Round 1', date: '2026-01-09' },
          { day: 3, event: 'Technical Round 2', date: '2026-01-10' },
          { day: 4, event: 'Senior Engineer Discussion', date: '2026-01-11' },
          { day: 5, event: 'HR Interview + Offer', date: '2026-01-12' },
        ],
        roundDifficulty: { 'OA': 3, 'Round 1': 3, 'Round 2': 4, 'Round 3': 4, 'HR': 2 },
        oaQuestions: ['Container With Most Water', 'Three Sum', 'Permutation Sequence'],
        technicalQuestions: ['Design Stock Trading Platform', 'Build Message Queue System', 'Design Recommendation Engine'],
        hrQuestions: ['Tell about yourself', 'Why Microsoft?', 'Conflict resolution?'],
        lldQuestions: ['Design Booking System', 'Design Notification Service'],
        aptitudeQuestions: ['Concurrency & Synchronization', 'Virtual Memory', 'Load Balancing'],
        resume: { fileName: 'Vikram_Singh_Resume.pdf', atsScore: 86, keywordMatches: ['C#', 'ASP.NET', 'Azure', 'Async Programming', 'Microservices', 'SQL Server'] },
        prepStrategy: {
          whatToStudy: ['Advanced Algorithms', 'System Design Patterns', 'Database Theory', 'Distributed Computing'],
          importantTopics: ['Complex Problem Solving', 'Architecture Design', 'Scalability Solutions'],
          timeSpent: '140 hours over 3.5 months',
          mistakesDone: ['Over engineering solutions', 'Missing requirements'],
          revisionSheet: 'Google Docs - Shared Notes',
          lastDayPrep: ['Reviewed previous rounds', 'Mock scenario practice'],
        },
        likes: 345,
        comments: 91,
      },
      {
        id: '8',
        studentName: 'Divya Malhotra',
        avatar: 'DM',
        company: 'Google',
        role: 'Data Analyst',
        package: '16 LPA',
        offerType: 'Off-campus',
        branch: 'CSE-B',
        date: '08 Jan 2026',
        roundFlow: 'Problem Solving → SQL Round → Case Study → HR',
        timeline: [
          { day: 1, event: 'Initial Problem Solving Test', date: '2026-01-04' },
          { day: 3, event: 'SQL Proficiency Round', date: '2026-01-06' },
          { day: 4, event: 'Analytics & Business Case Study', date: '2026-01-07' },
          { day: 5, event: 'HR + Team Lead Discussion', date: '2026-01-08' },
        ],
        roundDifficulty: { 'Problem Solving': 2, 'SQL Round': 3, 'Case Study': 3, 'HR': 2 },
        oaQuestions: ['Join Tables Analysis', 'Aggregate Functions', 'Date Manipulation in SQL'],
        technicalQuestions: ['User Engagement Analysis Framework', 'Revenue Impact Dashboard Design', 'Metric Definition & Tracking'],
        hrQuestions: ['Analytics journey?', 'Stakeholder management?', 'Data insights impact?'],
        lldQuestions: [],
        aptitudeQuestions: ['Probability & Statistics Refresher', 'Hypothesis Testing', 'Data Visualization Principles'],
        resume: { fileName: 'Divya_Malhotra_Resume.pdf', atsScore: 83, keywordMatches: ['SQL', 'BigQuery', 'Google Sheets', 'Data Visualization', 'Python', 'Analytics'] },
        prepStrategy: {
          whatToStudy: ['Window Functions', 'CTEs', 'Query Optimization', 'Statistical Analysis'],
          importantTopics: ['Complex JOINs', 'Aggregations', 'Time Series Analysis', 'Cohort Analysis'],
          timeSpent: '85 hours over 2 months',
          mistakesDone: ['Inefficient queries', 'Missing business context'],
          revisionSheet: 'LeetCode Database + Case Studies',
          lastDayPrep: ['Practiced 5 case studies', 'SQL optimization review'],
        },
        likes: 267,
        comments: 68,
      },
      {
        id: '9',
        studentName: 'Karan Nair',
        avatar: 'KN',
        company: 'Google',
        role: 'Data Analyst',
        package: '14 LPA',
        offerType: 'On-campus',
        branch: 'IT-C',
        date: '03 Jan 2026',
        roundFlow: 'Assessment → SQL Interview → Case Study → HR',
        timeline: [
          { day: 1, event: 'Online Data Analysis Assessment', date: '2025-12-29' },
          { day: 2, event: 'SQL Technical Interview', date: '2025-12-30' },
          { day: 3, event: 'Business Case Study Analysis', date: '2025-12-31' },
          { day: 4, event: 'HR + Offer Discussion', date: '2026-01-03' },
        ],
        roundDifficulty: { 'Assessment': 2, 'SQL': 2, 'Case Study': 3, 'HR': 2 },
        oaQuestions: ['Basic SQL Joins', 'GROUP BY with HAVING', 'Subquery Practice'],
        technicalQuestions: ['Conversion Rate Analysis', 'Retention Cohort Analysis', 'Funnel Analysis'],
        hrQuestions: ['Why data analytics?', 'Problem solving example?', 'Growth mindset?'],
        lldQuestions: [],
        aptitudeQuestions: ['Descriptive Statistics', 'Correlation vs Causation', 'Data Quality'],
        resume: { fileName: 'Karan_Nair_Resume.pdf', atsScore: 79, keywordMatches: ['SQL', 'Tableau', 'Google Workspace', 'Analytics', 'Excel', 'Statistics'] },
        prepStrategy: {
          whatToStudy: ['SQL Intermediate Concepts', 'Business Metrics Design', 'Python for Analytics'],
          importantTopics: ['JOINs & Subqueries', 'Aggregation Techniques', 'User Behavior Analysis'],
          timeSpent: '70 hours over 2 months',
          mistakesDone: ['Not asking clarifying questions for use case'],
          revisionSheet: 'Simple Spreadsheet Reference',
          lastDayPrep: ['Reviewed case study examples', 'SQL query practice'],
        },
        likes: 198,
        comments: 45,
      },
      {
        id: '10',
        studentName: 'Shreya Agarwal',
        avatar: 'SA',
        company: 'Apple',
        role: 'SDE',
        package: '21 LPA',
        offerType: 'Off-campus',
        branch: 'CSE-A',
        date: '25 Jan 2026',
        roundFlow: 'Phone Screen → Coding 1 → Coding 2 → System Design → HR',
        timeline: [
          { day: 1, event: 'Phone Screening', date: '2026-01-20' },
          { day: 3, event: 'Coding Round 1', date: '2026-01-22' },
          { day: 4, event: 'Coding Round 2', date: '2026-01-23' },
          { day: 5, event: 'System Design Interview', date: '2026-01-24' },
          { day: 6, event: 'HR + Final Round', date: '2026-01-25' },
        ],
        roundDifficulty: { 'Phone Screen': 2, 'Coding 1': 3, 'Coding 2': 4, 'System Design': 4, 'HR': 2 },
        oaQuestions: ['Jump Game', 'Gas Station', 'Candy Distribution'],
        technicalQuestions: ['Design Apple Music System', 'Build Real-time Notification Service', 'Design Calendar Sync System'],
        hrQuestions: ['Leadership examples?', 'Innovation mindset?', 'Why Apple?'],
        lldQuestions: ['Design Photo Library App', 'Design Camera App Filter System'],
        aptitudeQuestions: ['Concurrent Programming', 'Memory Safety in Swift', 'iOS Architecture'],
        resume: { fileName: 'Shreya_Agarwal_Resume.pdf', atsScore: 90, keywordMatches: ['Swift', 'Objective-C', 'iOS Development', 'System Design', 'Algorithms', 'Performance Optimization'] },
        prepStrategy: {
          whatToStudy: ['Advanced DSA with iOS context', 'System Design Fundamentals', 'Mobile Performance Optimization'],
          importantTopics: ['iOS-specific Algorithms', 'Memory Management', 'Concurrency in Swift'],
          timeSpent: '160 hours over 4 months',
          mistakesDone: ['Not considering iOS-specific constraints', 'Memory leaks discussion gaps'],
          revisionSheet: 'Private Notion Database',
          lastDayPrep: ['Mock with iOS expert', 'Performance tuning review'],
        },
        likes: 423,
        comments: 118,
      },
      {
        id: '11',
        studentName: 'Akshay Gupta',
        avatar: 'AG',
        company: 'TCS',
        role: 'Systems Engineer',
        package: '3.6 LPA',
        offerType: 'On-campus',
        branch: 'ECE-B',
        date: '28 Feb 2026',
        roundFlow: 'Online Exam → Technical Interview → HR',
        timeline: [
          { day: 1, event: 'TCS Online Exam - 60 min', date: '2026-02-25' },
          { day: 3, event: 'Technical Interview', date: '2026-02-27' },
          { day: 4, event: 'HR Round + Managerial', date: '2026-02-28' },
        ],
        roundDifficulty: { 'Online Exam': 2, 'Technical': 2, 'HR': 1 },
        oaQuestions: ['MCQ on Data Structures', 'Basic Programming Logic', 'Aptitude & Reasoning'],
        technicalQuestions: ['Explain OOPS Concepts', 'Database Fundamentals', 'Networking Basics'],
        hrQuestions: ['About yourself?', 'Why TCS?', 'Career goals?'],
        lldQuestions: [],
        aptitudeQuestions: ['Problem Solving', 'Logical Reasoning', 'Verbal English'],
        resume: { fileName: 'Akshay_Gupta_Resume.pdf', atsScore: 75, keywordMatches: ['Java', 'Basic Networking', 'OOPS', 'SQL Basics', 'Linux Commands'] },
        prepStrategy: {
          whatToStudy: ['Core Data Structures', 'OOPS Basics', 'Database Fundamentals'],
          importantTopics: ['Arrays & Pointers', 'Inheritance & Polymorphism', 'Joins in Databases'],
          timeSpent: '60 hours over 2 months',
          mistakesDone: ['Rushing through basic concepts'],
          revisionSheet: 'Simple PDF Notes',
          lastDayPrep: ['Reviewed key concepts', 'Practiced common questions'],
        },
        likes: 156,
        comments: 32,
      },
      {
        id: '12',
        studentName: 'Isha Verma',
        avatar: 'IV',
        company: 'Infosys',
        role: 'Systems Engineer',
        package: '3.5 LPA',
        offerType: 'On-campus',
        branch: 'IT-A',
        date: '15 Mar 2026',
        roundFlow: 'Aptitude Test → Technical Round → HR',
        timeline: [
          { day: 1, event: 'Aptitude & Reasoning Exam', date: '2026-03-12' },
          { day: 2, event: 'Technical Discussion', date: '2026-03-13' },
          { day: 3, event: 'HR + Final Discussion', date: '2026-03-15' },
        ],
        roundDifficulty: { 'Aptitude': 2, 'Technical': 2, 'HR': 1 },
        oaQuestions: ['Data Structure Concepts', 'Programming Fundamentals', 'Logical Puzzles'],
        technicalQuestions: ['RDBMS Concepts', 'Object Oriented Programming', 'Development Life Cycle'],
        hrQuestions: ['Tell about yourself', 'Why Infosys?', 'Willingness to relocate?'],
        lldQuestions: [],
        aptitudeQuestions: ['Quantitative Aptitude', 'English Comprehension', 'Logical Reasoning'],
        resume: { fileName: 'Isha_Verma_Resume.pdf', atsScore: 78, keywordMatches: ['Java', 'SQL', 'Data Structures', 'Web Development Basics', 'Problem Solving'] },
        prepStrategy: {
          whatToStudy: ['Basic Java & C++', 'SQL Queries', 'SDLC Concepts'],
          importantTopics: ['OOPS Fundamentals', 'Database Basics', 'Aptitude Shortcuts'],
          timeSpent: '75 hours over 2 months',
          mistakesDone: ['Overthinking simple questions'],
          revisionSheet: 'Infosys Prep Guide Notes',
          lastDayPrep: ['Aptitude practice', 'Mock technical interview'],
        },
        likes: 142,
        comments: 28,
      },
    ];
    return defaultExperiences;
  });

  const companies = ['Amazon', 'Microsoft', 'TCS', 'Infosys', 'Atlassian', 'Google', 'Adobe', 'Goldman Sachs'];
  const roles = ['SDE', 'Data Analyst', 'Product', 'ML Engineer', 'Core CS', 'DevOps', 'Internship', 'Full-time'];

  const successStories = [
    { id: '1', name: 'Raju Kumar', company: 'Microsoft', package: '21 LPA', branch: 'CSE', tips: 'Consistent 2hrs daily practice', roadmap: 'DSA + System Design', avatar: 'RK' },
    { id: '2', name: 'Sneha Gupta', company: 'Google', package: '18 LPA', branch: 'IT', tips: 'Deep understanding > Memorization', roadmap: 'Analytics + SQL Optimization', avatar: 'SG' },
    { id: '3', name: 'Vikas Singh', company: 'Amazon', package: '20 LPA', branch: 'CSE', tips: 'Mock interviews > Tutorials', roadmap: 'DSA + LLD Patterns', avatar: 'VS' },
  ];

  const announcements = [
    { id: '1', title: 'Amazon Drive 2026', type: 'Upcoming', date: '2026-01-20', roles: ['SDE', 'Data Analyst'], deadline: '2026-01-18', importance: 'high' },
    { id: '2', title: 'Google Shortlist Released', type: 'Shortlist', date: '2026-01-15', shortlistedCount: 45, importance: 'high' },
    { id: '3', title: 'Microsoft Document Verification', type: 'Document', date: '2026-01-16', deadline: '2026-01-18', importance: 'medium' },
  ];

  const filteredExperiences = useMemo(() => {
    return experiences.filter((exp) => {
      const matchesSearch = 
        exp.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        exp.company.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCompany = selectedCompany === null || exp.company === selectedCompany;
      const matchesRole = selectedRole === null || exp.role === selectedRole;
      return matchesSearch && matchesCompany && matchesRole;
    });
  }, [searchQuery, selectedCompany, selectedRole, experiences]);

  const handleExperienceClick = useCallback((exp: Experience) => {
    setSelectedExperience(exp);
    setExperienceDialogOpen(true);
    setDialogTabValue(0);
  }, []);

  const handleLike = useCallback((expId: string) => {
    const newLiked = new Set(likedExperiences);
    if (newLiked.has(expId)) {
      newLiked.delete(expId);
    } else {
      newLiked.add(expId);
    }
    setLikedExperiences(newLiked);
    
    // Update likes count in experiences
    setExperiences(prev => prev.map(exp => 
      exp.id === expId ? { ...exp, likes: exp.likes + (newLiked.has(expId) ? 1 : -1) } : exp
    ));
  }, [likedExperiences]);

  const handleAddComment = (expId: string) => {
    if (commentText.trim() && selectedExperience) {
      const newComment: Comment = {
        id: Date.now().toString(),
        author: 'You',
        authorAvatar: 'U',
        text: commentText,
        date: new Date().toLocaleDateString(),
        likes: 0,
      };
      
      setNewComments(prev => ({
        ...prev,
        [expId]: [...(prev[expId] || []), newComment]
      }));
      
      setExperiences(prev => prev.map(exp =>
        exp.id === expId ? { ...exp, comments: exp.comments + 1 } : exp
      ));
      
      setCommentText('');
    }
  };

  const handleDeleteExperience = (expId: string) => {
    setExperiences(prev => prev.filter(exp => exp.id !== expId));
  };

  const handleEditExperience = (exp: Experience) => {
    setEditingExperience({ ...exp });
    setAddExperienceOpen(true);
  };

  const handleSaveExperience = () => {
    if (editingExperience) {
      if (editingExperience.id && experiences.find(e => e.id === editingExperience.id)) {
        // Update existing
        setExperiences(prev => prev.map(exp => exp.id === editingExperience.id ? editingExperience : exp));
      } else {
        // Add new
        setExperiences(prev => [...prev, { ...editingExperience, id: Date.now().toString() }]);
      }
      setAddExperienceOpen(false);
      setEditingExperience(null);
    }
  };

  return (
    <Box sx={{ width: '100%', bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Header */}
      <Paper elevation={3} sx={{ p: { xs: 1.5, sm: 2, md: 3 }, mb: 2, borderRadius: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 1, flexWrap: 'wrap' }}>
          <Typography variant={isMobile ? 'h6' : isTablet ? 'h5' : 'h4'} fontWeight="bold" sx={{ flex: 1 }}>
            🎓 TNP Placement Experiences
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            size={isMobile ? 'small' : 'medium'}
            onClick={() => {
              setEditingExperience({} as Experience);
              setAddExperienceOpen(true);
            }}
          >
            {isMobile ? 'Add' : 'Add Experience'}
          </Button>
        </Box>

        {/* Filters */}
        {!isMobile && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>🏢 Company</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', overflowX: isMobile ? 'auto' : 'visible' }}>
              <Chip label="All" onClick={() => setSelectedCompany(null)} color={selectedCompany === null ? 'primary' : 'default'} variant={selectedCompany === null ? 'filled' : 'outlined'} size={isMobile ? 'small' : 'medium'} />
              {companies.map((company) => (
                <Chip key={company} label={company} onClick={() => setSelectedCompany(company)} color={selectedCompany === company ? 'primary' : 'default'} variant={selectedCompany === company ? 'filled' : 'outlined'} size={isMobile ? 'small' : 'medium'} />
              ))}
            </Box>
          </Box>
        )}

        {!isMobile && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>🎯 Role</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', overflowX: isMobile ? 'auto' : 'visible' }}>
              <Chip label="All" onClick={() => setSelectedRole(null)} color={selectedRole === null ? 'primary' : 'default'} variant={selectedRole === null ? 'filled' : 'outlined'} size={isMobile ? 'small' : 'medium'} />
              {roles.slice(0, 4).map((role) => (
                <Chip key={role} label={role} onClick={() => setSelectedRole(role)} color={selectedRole === role ? 'primary' : 'default'} variant={selectedRole === role ? 'filled' : 'outlined'} size={isMobile ? 'small' : 'medium'} />
              ))}
            </Box>
          </Box>
        )}

        {/* Search */}
        <TextField fullWidth placeholder="Search by name or company..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }} size={isMobile ? 'small' : 'medium'} sx={{ mt: 1 }} />
      </Paper>

      <Box sx={{ px: { xs: 1, sm: 2, md: 3 }, pb: 3 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 320px' }, gap: 2 }}>
          {/* Main Content */}
          <Box>
            {filteredExperiences.length > 0 ? (
              filteredExperiences.map((exp) => (
                <Card
                  key={exp.id}
                  sx={{
                    mb: 2,
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: isMobile ? 'none' : 'translateY(-4px)',
                      boxShadow: 6,
                    },
                  }}
                  onClick={() => handleExperienceClick(exp)}
                >
                  <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 0 }}>
                        <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main', fontSize: '0.9rem' }}>{exp.avatar}</Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="subtitle2" fontWeight="bold" noWrap>{exp.studentName}</Typography>
                          <Typography variant="caption" color="text.secondary">{exp.date}</Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        <Chip label={exp.company} size="small" color="primary" />
                        <Chip label={exp.role} size="small" />
                      </Box>
                    </Box>

                    {/* Details Grid */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' }, gap: 1.5, mb: 2, p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block" fontWeight="bold">💰 Package</Typography>
                        <Typography variant="body2" fontWeight="bold" sx={{ color: 'success.main' }}>{exp.package}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block" fontWeight="bold">📍 Type</Typography>
                        <Typography variant="body2">{exp.offerType}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block" fontWeight="bold">🎓 Branch</Typography>
                        <Typography variant="body2">{exp.branch}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block" fontWeight="bold">🔄 Rounds</Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>{exp.roundFlow}</Typography>
                      </Box>
                    </Box>

                    {/* Difficulty Ratings */}
                    <Box sx={{ mb: 2, p: 1, bgcolor: 'warning.light', borderRadius: 1 }}>
                      <Typography variant="caption" fontWeight="bold" display="block" sx={{ mb: 0.5 }}>⭐ Difficulty</Typography>
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' }, gap: 1 }}>
                        {Object.entries(exp.roundDifficulty).slice(0, 4).map(([round, diff]) => (
                          <Box key={round}>
                            <Typography variant="caption" sx={{ fontSize: '0.65rem' }} display="block" fontWeight="bold">{round}</Typography>
                            <Rating value={diff} readOnly size="small" />
                          </Box>
                        ))}
                      </Box>
                    </Box>

                    <Divider sx={{ my: 1 }} />

                    {/* Actions */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title={likedExperiences.has(exp.id) ? 'Unlike' : 'Like'}>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLike(exp.id);
                            }}
                            color={likedExperiences.has(exp.id) ? 'error' : 'default'}
                          >
                            {likedExperiences.has(exp.id) ? <LikeIcon fontSize="small" /> : <ThumbUpOutlinedIcon fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                        <Typography variant="caption">{exp.likes}</Typography>

                        <Tooltip title="Comments">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <IconButton size="small"><CommentIcon fontSize="small" /></IconButton>
                            <Typography variant="caption">{exp.comments}</Typography>
                          </Box>
                        </Tooltip>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditExperience(exp);
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteExperience(exp.id);
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Alert severity="info">No experiences found. Try adjusting your filters.</Alert>
            )}
          </Box>

          {/* Sidebar */}
          <Box>
            {/* Success Stories */}
            <Paper elevation={2} sx={{ p: { xs: 1.5, sm: 2 }, mb: 2 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 1.5, fontSize: { xs: '0.95rem', sm: '1.1rem' } }}>🏆 Success Stories</Typography>
              <Box sx={{ display: 'grid', gap: 1 }}>
                {successStories.map((story) => (
                  <Card key={story.id} sx={{ p: 1, cursor: 'pointer', transition: 'all 0.2s', '&:hover': { boxShadow: 3 } }}>
                    <Box sx={{ display: 'flex', gap: 0.75 }}>
                      <Avatar sx={{ width: 28, height: 28, bgcolor: 'secondary.main', fontSize: '0.7rem' }}>{story.avatar}</Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="caption" fontWeight="bold" noWrap display="block">{story.name}</Typography>
                        <Typography variant="caption" color="text.secondary" noWrap display="block">{story.company}</Typography>
                        <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 'bold' }} display="block">{story.package}</Typography>
                      </Box>
                    </Box>
                  </Card>
                ))}
              </Box>
            </Paper>

            {/* Announcements */}
            <Paper elevation={2} sx={{ p: { xs: 1.5, sm: 2 } }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 1.5, fontSize: { xs: '0.95rem', sm: '1.1rem' } }}>📢 Announcements</Typography>
              <Box sx={{ display: 'grid', gap: 1 }}>
                {announcements.map((ann) => (
                  <Alert key={ann.id} severity={ann.importance === 'high' ? 'warning' : 'info'} sx={{ py: 0.75, fontSize: '0.85rem' }} icon={<NotificationsIcon fontSize="small" />}>
                    <Typography variant="caption" fontWeight="bold" display="block">{ann.title}</Typography>
                  </Alert>
                ))}
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>

      {/* Experience Detail Dialog */}
      <Dialog open={experienceDialogOpen} onClose={() => setExperienceDialogOpen(false)} maxWidth="sm" fullWidth sx={{ '& .MuiDialog-paper': { m: { xs: 1, sm: 2 } } }}>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="h6" fontWeight="bold">{selectedExperience?.studentName}</Typography>
              <Typography variant="caption" color="text.secondary">{selectedExperience?.company} • {selectedExperience?.role}</Typography>
            </Box>
            <IconButton size="small" onClick={() => setExperienceDialogOpen(false)}><CloseIcon fontSize="small" /></IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          <Tabs value={dialogTabValue} onChange={(_, v) => setDialogTabValue(v)} variant="scrollable" scrollButtons="auto" sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Tab label="📅 Timeline" icon={<TimelineIcon />} iconPosition="start" />
            <Tab label="💻 Questions" icon={<CodeIcon />} iconPosition="start" />
            <Tab label="📊 Resume" icon={<FileIcon />} iconPosition="start" />
            <Tab label="🧠 Prep" icon={<CreateIcon />} iconPosition="start" />
          </Tabs>

          {/* Timeline Tab */}
          <TabPanel value={dialogTabValue} index={0}>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1.5 }}>Recruitment Flow</Typography>
            <Box sx={{ display: 'grid', gap: 1 }}>
              {selectedExperience?.timeline.map((t, idx) => (
                <Paper key={idx} sx={{ p: 1.5, display: 'flex', gap: 1.5, bgcolor: 'action.hover' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '50%', bgcolor: 'primary.main', color: 'white', fontSize: '0.8rem', fontWeight: 'bold', flexShrink: 0 }}>
                    {t.day}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" fontWeight="bold">{t.event}</Typography>
                    <Typography variant="caption" color="text.secondary">{t.date}</Typography>
                  </Box>
                </Paper>
              ))}
            </Box>
          </TabPanel>

          {/* Questions Tab */}
          <TabPanel value={dialogTabValue} index={1}>
            <Box sx={{ display: 'grid', gap: 1.5 }}>
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 0.75 }}>💻 OA Questions</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selectedExperience?.oaQuestions.map((q, i) => (<Chip key={i} label={q} size="small" variant="outlined" color="primary" />))}
                </Box>
              </Box>
              <Divider />
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 0.75 }}>🎙️ Technical</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selectedExperience?.technicalQuestions.map((q, i) => (<Chip key={i} label={q} size="small" variant="outlined" />))}
                </Box>
              </Box>
              <Divider />
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 0.75 }}>💬 HR Questions</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selectedExperience?.hrQuestions.map((q, i) => (<Chip key={i} label={q} size="small" variant="outlined" color="secondary" />))}
                </Box>
              </Box>
            </Box>
          </TabPanel>

          {/* Resume Tab */}
          <TabPanel value={dialogTabValue} index={2}>
            <Box sx={{ display: 'grid', gap: 1.5 }}>
              <Paper sx={{ p: 1.5, bgcolor: 'info.light' }}>
                <Typography variant="caption" display="block" fontSize="0.85rem"><strong>📄 Resume:</strong> {selectedExperience?.resume.fileName}</Typography>
              </Paper>
              <Box>
                <Typography variant="subtitle2" fontWeight="bold">ATS Score: {selectedExperience?.resume.atsScore}%</Typography>
                <Box sx={{ height: 6, bgcolor: 'action.hover', borderRadius: 1, overflow: 'hidden', mt: 0.75 }}>
                  <Box sx={{ height: '100%', width: `${selectedExperience?.resume.atsScore}%`, bgcolor: 'success.main' }} />
                </Box>
              </Box>
              <Box>
                <Typography variant="caption" fontWeight="bold" display="block" sx={{ mb: 0.75 }}>Keywords Matched:</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selectedExperience?.resume.keywordMatches.map((kw, i) => (<Chip key={i} label={kw} size="small" color="success" variant="outlined" />))}
                </Box>
              </Box>
            </Box>
          </TabPanel>

          {/* Prep Tab */}
          <TabPanel value={dialogTabValue} index={3}>
            <Box sx={{ display: 'grid', gap: 1 }}>
              <Box>
                <Typography variant="caption" fontWeight="bold" display="block">📚 What to Study:</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                  {selectedExperience?.prepStrategy.whatToStudy.map((t, i) => (<Chip key={i} label={t} size="small" icon={<CheckCircleIcon />} color="primary" variant="outlined" />))}
                </Box>
              </Box>
              <Box>
                <Typography variant="caption" fontWeight="bold" display="block">⭐ Important Topics:</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                  {selectedExperience?.prepStrategy.importantTopics.map((t, i) => (<Chip key={i} label={t} size="small" color="success" />))}
                </Box>
              </Box>
              <Paper sx={{ p: 1, bgcolor: 'action.hover' }}>
                <Typography variant="caption" display="block" fontSize="0.8rem"><strong>⏱️ Time:</strong> {selectedExperience?.prepStrategy.timeSpent}</Typography>
                <Typography variant="caption" display="block" fontSize="0.8rem" sx={{ mt: 0.25 }}><strong>📝 Sheet:</strong> {selectedExperience?.prepStrategy.revisionSheet}</Typography>
              </Paper>
            </Box>
          </TabPanel>
        </DialogContent>

        {/* Comments Section */}
        <Divider />
        <Box sx={{ p: 1.5 }}>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>💬 Comments</Typography>
          <Box sx={{ mb: 1.5 }}>
            <TextField
              fullWidth
              size="small"
              multiline
              rows={2}
              placeholder="Share your thoughts..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <Button
              size="small"
              variant="contained"
              sx={{ mt: 0.75 }}
              onClick={() => handleAddComment(selectedExperience?.id || '')}
              disabled={!commentText.trim()}
            >
              Post
            </Button>
          </Box>
          <Box sx={{ maxHeight: 150, overflowY: 'auto' }}>
            {(newComments[selectedExperience?.id || ''] || []).map((comment) => (
              <Box key={comment.id} sx={{ mb: 1, p: 0.75, bgcolor: 'action.hover', borderRadius: 1 }}>
                <Typography variant="caption" fontWeight="bold">{comment.author}</Typography>
                <Typography variant="caption" display="block">{comment.text}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Dialog>

      {/* Add/Edit Experience Dialog */}
      <Dialog open={addExperienceOpen} onClose={() => setAddExperienceOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">{editingExperience?.id ? 'Edit' : 'Add'} Experience</Typography>
            <IconButton size="small" onClick={() => setAddExperienceOpen(false)}><CloseIcon /></IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'grid', gap: 1.5 }}>
            <TextField
              fullWidth
              size="small"
              label="Student Name"
              value={editingExperience?.studentName || ''}
              onChange={(e) => setEditingExperience(prev => prev ? { ...prev, studentName: e.target.value } : {} as Experience)}
            />
            <FormControl fullWidth size="small">
              <FormLabel>Company</FormLabel>
              <Select
                value={editingExperience?.company || ''}
                onChange={(e) => setEditingExperience(prev => prev ? { ...prev, company: e.target.value } : {} as Experience)}
              >
                {companies.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <FormLabel>Role</FormLabel>
              <Select
                value={editingExperience?.role || ''}
                onChange={(e) => setEditingExperience(prev => prev ? { ...prev, role: e.target.value } : {} as Experience)}
              >
                {roles.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField fullWidth size="small" label="Package" value={editingExperience?.package || ''} onChange={(e) => setEditingExperience(prev => prev ? { ...prev, package: e.target.value } : {} as Experience)} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddExperienceOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveExperience}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Blogs;
