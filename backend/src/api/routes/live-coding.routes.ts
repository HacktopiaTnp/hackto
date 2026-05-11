import { Router, Request, Response, NextFunction } from 'express';
import { logger } from '@core/logger/logger';

// Optional auth middleware for development
const optionalAuth = (req: Request, _res: Response, next: NextFunction) => {
  // Extract token if present, but don't fail if missing
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) {
    (req as any).token = token;
  }
  next();
};

// Comprehensive problem database
const CODING_PROBLEMS = [
  {
    id: 1,
    title: 'Two Sum',
    difficulty: 'EASY',
    category: 'Array',
    description: 'Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target.\n\nYou may assume that each input has exactly one solution, and you may not use the same element twice.',
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]', explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].' },
    ],
    starterCode: {
      python: 'def twoSum(nums, target):\n    # Write your solution here\n    pass',
      javascript: 'function twoSum(nums, target) {\n    // Write your solution here\n}',
      cpp: '#include <vector>\nusing namespace std;\nvector<int> twoSum(vector<int>& nums, int target) {\n    // Write your solution here\n}',
    },
    testCases: [
      { input: '[2,7,11,15]\n9', expected: '[0,1]' },
      { input: '[3,2,4]\n6', expected: '[1,2]' },
      { input: '[3,3]\n6', expected: '[0,1]' },
    ],
  },
  {
    id: 2,
    title: 'Reverse String',
    difficulty: 'EASY',
    category: 'String',
    description: 'Write a function that reverses a string. The input string is given as an array of characters s.\n\nYou must do this by modifying the input array in-place with O(1) extra space.',
    examples: [
      { input: 's = ["h","e","l","l","o"]', output: '["o","l","l","e","h"]' },
      { input: 's = ["H","a","n","n","a","h"]', output: '["h","a","n","n","a","H"]' },
    ],
    starterCode: {
      python: 'def reverseString(s):\n    # Reverse the list in place\n    pass',
      javascript: 'function reverseString(s) {\n    // Reverse the array in place\n}',
      cpp: '#include <vector>\nusing namespace std;\nvoid reverseString(vector<char>& s) {\n    // Reverse in place\n}',
    },
    testCases: [
      { input: 'hello', expected: 'olleh' },
      { input: 'Hannah', expected: 'hannaH' },
    ],
  },
  {
    id: 3,
    title: 'Palindrome Number',
    difficulty: 'EASY',
    category: 'Math',
    description: 'Given an integer x, return true if x is a palindromic integer.\n\nAn integer is a palindrome when it reads the same backward as forward.',
    examples: [
      { input: 'x = 121', output: 'true', explanation: '121 reads as 121 from left to right and from right to left.' },
      { input: 'x = -121', output: 'false', explanation: 'From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome.' },
    ],
    starterCode: {
      python: 'def isPalindrome(x):\n    # Return True if x is palindrome\n    pass',
      javascript: 'function isPalindrome(x) {\n    // Return true if x is palindrome\n}',
      cpp: '#include <string>\nusing namespace std;\nbool isPalindrome(int x) {\n    // Check if palindrome\n}',
    },
    testCases: [
      { input: '121', expected: 'true' },
      { input: '-121', expected: 'false' },
      { input: '10', expected: 'false' },
    ],
  },
  {
    id: 4,
    title: 'Valid Parentheses',
    difficulty: 'MEDIUM',
    category: 'Stack',
    description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.',
    examples: [
      { input: 's = "()"', output: 'true' },
      { input: 's = "()[]{}"', output: 'true' },
      { input: 's = "(]"', output: 'false' },
    ],
    starterCode: {
      python: 'def isValid(s):\n    # Check if parentheses are valid\n    pass',
      javascript: 'function isValid(s) {\n    // Check if parentheses are valid\n}',
      cpp: '#include <string>\nusing namespace std;\nbool isValid(string s) {\n    // Check if parentheses are valid\n}',
    },
    testCases: [
      { input: '()', expected: 'true' },
      { input: '()[]{};', expected: 'false' },
      { input: '([{}])', expected: 'true' },
    ],
  },
  {
    id: 5,
    title: 'Merge Sorted Array',
    difficulty: 'MEDIUM',
    category: 'Array',
    description: 'You are given two integer arrays nums1 and nums2, sorted in non-decreasing order, and two integers m and n, representing the number of valid elements in nums1 and nums2 respectively.\n\nMerge nums2 into nums1 as one sorted array.',
    examples: [
      { input: 'nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3', output: '[1,2,2,3,5,6]' },
      { input: 'nums1 = [1], m = 1, nums2 = [], n = 0', output: '[1]' },
    ],
    starterCode: {
      python: 'def merge(nums1, m, nums2, n):\n    # Merge nums2 into nums1\n    pass',
      javascript: 'function merge(nums1, m, nums2, n) {\n    // Merge nums2 into nums1\n}',
      cpp: '#include <vector>\nusing namespace std;\nvoid merge(vector<int>& nums1, int m, vector<int>& nums2, int n) {\n    // Merge nums2 into nums1\n}',
    },
    testCases: [
      { input: '[1,2,3,0,0,0]\n[2,5,6]', expected: '[1,2,2,3,5,6]' },
    ],
  },
];

// ============================================
// PROBLEMS ROUTES
// ============================================
const problemsRouter = Router();

problemsRouter.get('/', async (_req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: CODING_PROBLEMS.map(p => ({
        id: p.id,
        title: p.title,
        difficulty: p.difficulty,
        category: p.category,
        acceptance: Math.floor(Math.random() * 40 + 30) + '%',
      })),
    });
  } catch (error) {
    logger.error('Error fetching problems:', error);
    res.status(500).json({ error: 'Failed to fetch problems' });
  }
});

problemsRouter.get('/categories', async (_req: Request, _res: Response) => {
  _res.json({
    success: true,
    data: Array.from(new Set(CODING_PROBLEMS.map(p => p.category))),
  });
});

problemsRouter.get('/:problemId', async (req: Request, res: Response) => {
  try {
    const problemId = parseInt(req.params.problemId);
    const problem = CODING_PROBLEMS.find(p => p.id === problemId);
    
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    res.json({
      success: true,
      data: problem,
    });
  } catch (error) {
    logger.error('Error fetching problem:', error);
    res.status(500).json({ error: 'Failed to fetch problem' });
  }
});

// ============================================
// ROOMS ROUTES
// ============================================
const roomsRouter = Router();

roomsRouter.post('/', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { problemId } = req.body;
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const problem = CODING_PROBLEMS.find(p => p.id === problemId) || CODING_PROBLEMS[0];
    
    res.json({
      success: true,
      data: {
        id: `room-${Date.now()}`,
        code: roomCode,
        status: 'ACTIVE',
        problemId: problem.id,
        problem: problem,
        participants: [
          {
            userId: 'user-1',
            userName: 'Interviewer',
            role: 'interviewer',
            joinedAt: new Date(),
            isActive: true,
          }
        ],
        createdAt: new Date(),
        timeLimit: 60, // 60 minutes
        elapsedTime: 0,
      },
    });
  } catch (error) {
    logger.error('Error creating room:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

roomsRouter.post('/join', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { roomCode, problemId } = req.body;
    const problem = CODING_PROBLEMS.find(p => p.id === problemId) || CODING_PROBLEMS[0];
    
    res.json({
      success: true,
      data: {
        id: `room-${roomCode}`,
        roomId: `room-${roomCode}`,
        code: roomCode,
        status: 'ACTIVE',
        problemId: problem.id,
        problem: {
          id: problem.id,
          title: problem.title,
          difficulty: problem.difficulty,
          category: problem.category,
          description: problem.description,
          examples: problem.examples,
          starterCode: problem.starterCode,
          testCases: problem.testCases,
        },
        participants: [
          {
            userId: 'user-1',
            userName: 'Interviewer',
            role: 'interviewer',
            joinedAt: new Date(),
            isActive: true,
          },
          {
            userId: 'user-2',
            userName: 'Candidate',
            role: 'candidate',
            joinedAt: new Date(),
            isActive: true,
          }
        ],
        timeLimit: 60,
        elapsedTime: 0,
        createdAt: new Date(),
      },
    });
  } catch (error) {
    logger.error('Error joining room:', error);
    res.status(500).json({ error: 'Failed to join room' });
  }
});

roomsRouter.get('/:roomId', optionalAuth, async (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      id: req.params.roomId,
      status: 'ACTIVE',
      participants: [
        { userId: 'user-1', userName: 'Interviewer', role: 'interviewer', isActive: true },
        { userId: 'user-2', userName: 'Candidate', role: 'candidate', isActive: true }
      ],
      timeLimit: 60,
      elapsedTime: Math.floor(Math.random() * 30),
    },
  });
});

roomsRouter.post('/:roomId/messages', optionalAuth, async (_req: Request, res: Response) => {
  res.json({ success: true, data: { id: `msg-${Date.now()}` } });
});

roomsRouter.post('/:roomId/end', optionalAuth, async (_req: Request, res: Response) => {
  res.json({ success: true, data: { status: 'ENDED' } });
});

// ============================================
// SUBMISSIONS ROUTES
// ============================================
const submissionsRouter = Router();

submissionsRouter.post('/run', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { code, language, input } = req.body;
    const startTime = Date.now();

    // For demo mode - return mock response
    const executionTime = Math.floor(Math.random() * 200) + 50; // 50-250ms
    return res.json({
      success: true,
      data: {
        id: `sub-${Date.now()}`,
        status: 'Accepted',
        statusId: 3,
        output: 'Code executed successfully\n',
        expectedOutput: 'Code executed successfully\n',
        runtime: executionTime,
        memory: Math.floor(Math.random() * 10) + 5,
        passed: true,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    logger.error('Error running code:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to run code',
      data: {
        status: 'Error',
        error: 'Code execution failed',
        timestamp: new Date(),
      }
    });
  }
});

submissionsRouter.post('/submit', optionalAuth, async (req: Request, res: Response) => {
  try {
    const startTime = Date.now();

    res.json({
      success: true,
      data: {
        id: `sub-${Date.now()}`,
        status: 'SUBMITTED',
        passed: Math.random() > 0.5,
        testCasesPassed: Math.floor(Math.random() * 10) + 1,
        totalTestCases: 15,
        runtime: Math.floor(Math.random() * 300) + 100,
        submittedAt: new Date(),
        executionTime: Date.now() - startTime,
      },
    });
  } catch (error) {
    logger.error('Error submitting code:', error);
    res.status(500).json({ error: 'Failed to submit code' });
  }
});

// ============================================
// SCORECARDS ROUTES
// ============================================
const scorecardsRouter = Router();

scorecardsRouter.post('/', optionalAuth, async (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      id: `sc-${Date.now()}`,
      status: 'COMPLETED',
    },
  });
});

scorecardsRouter.get('/:scorecardId', optionalAuth, async (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      id: req.params.scorecardId,
      score: 85,
      feedback: 'Great solution!',
    },
  });
});

// Export all routers
export { problemsRouter, roomsRouter, submissionsRouter, scorecardsRouter };
export default problemsRouter; // Default export for backward compatibility
