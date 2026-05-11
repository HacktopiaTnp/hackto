import React, { useEffect, useRef, useState, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';
import { logger } from '../../utils/logger';
import './ProfessionalLiveEditor.css';

interface Problem {
  id: number;
  title: string;
  difficulty: string;
  category: string;
  description: string;
  examples: Array<{ input: string; output: string; explanation?: string }>;
  starterCode: { [key: string]: string };
  testCases: Array<{ input: string; expected: string }>;
}

interface ExecutionResult {
  status: string;
  output: string;
  error: string;
  runtime: number;
  memory: number;
  passed: boolean;
}

interface Participant {
  userId: string;
  userName: string;
  role: 'interviewer' | 'candidate';
  isActive: boolean;
  joinedAt: string;
}

export const ProfessionalLiveEditor: React.FC = () => {
  const socketRef = useRef<Socket | null>(null);
  const [code, setCode] = useState<string>('');
  const [problem, setProblem] = useState<Problem | null>(null);
  const [language, setLanguage] = useState<string>('python');
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [roomCode, setRoomCode] = useState<string>('');
  const [selectedTab, setSelectedTab] = useState<'description' | 'solutions' | 'submissions'>('description');
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [timeLimit] = useState<number>(3600); // 60 minutes
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedTime(prev => {
        if (prev < timeLimit) return prev + 1;
        return prev;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLimit]);

  // Format time
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Fetch problem
  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/problems/1`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch problem');

        const result = await response.json();
        if (result.success && result.data) {
          setProblem(result.data);
          setCode(result.data.starterCode[language] || '');
        }
      } catch (error) {
        logger.error('Error fetching problem:', error);
      }
    };

    fetchProblem();
  }, [language]);

  // Initialize Socket.IO
  useEffect(() => {
    const generateRoomCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();
    const code = roomCode || generateRoomCode();
    setRoomCode(code);

    const socket = io(window.location.origin, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      logger.info('Socket connected');
      socket.emit('join-room', {
        roomId: code,
        userId: 'user-' + Math.random().toString(36).substring(7),
        userName: 'Candidate',
        role: 'candidate',
      });
    });

    socket.on('code-change', (data) => {
      if (data.userId !== socketRef.current?.id) {
        setCode(data.code);
      }
    });

    socket.on('participant-joined', (participant) => {
      setParticipants(prev => [...prev, participant]);
    });

    socket.on('participant-left', (data) => {
      setParticipants(prev => prev.filter(p => p.userId !== data.userId));
    });

    socket.on('disconnect', () => {
      logger.info('Socket disconnected');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Run code
  const handleRunCode = async () => {
    if (!code.trim()) {
      alert('Please write some code first');
      return;
    }

    setIsRunning(true);
    setOutput('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/submissions/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          code,
          language,
          input: input || '',
        }),
      });

      const result = await response.json();

      if (result.success) {
        const data = result.data;
        setExecutionResult(data);
        setOutput(data.output || data.error || 'No output');

        // Broadcast to room
        if (socketRef.current) {
          socketRef.current.emit('code-executed', {
            userId: socketRef.current.id,
            code,
            language,
            result: data,
          });
        }
      } else {
        setOutput('Error executing code');
      }
    } catch (error) {
      logger.error('Error running code:', error);
      setOutput('Failed to execute code');
    } finally {
      setIsRunning(false);
    }
  };

  // Submit solution
  const handleSubmit = async () => {
    if (!code.trim()) {
      alert('Please write some code first');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/submissions/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          code,
          language,
          problemId: problem?.id,
        }),
      });

      const result = await response.json();

      if (result.success) {
        const data = result.data;
        setExecutionResult({
          status: data.testCasesPassed === data.totalTestCases ? 'Accepted' : 'Wrong Answer',
          output: `${data.testCasesPassed}/${data.totalTestCases} test cases passed`,
          error: '',
          runtime: data.runtime,
          memory: 0,
          passed: data.passed,
        });
      }
    } catch (error) {
      logger.error('Error submitting code:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const difficultyColor: { [key: string]: string } = {
    EASY: 'text-green-500',
    MEDIUM: 'text-yellow-500',
    HARD: 'text-red-500',
  };

  const statusColor = executionResult?.passed
    ? 'bg-green-100 text-green-800'
    : executionResult
    ? 'bg-red-100 text-red-800'
    : '';

  return (
    <div className="professional-editor-container">
      {/* Header */}
      <div className="editor-header">
        <div className="header-left">
          <h1 className="problem-title">{problem?.title || 'Loading...'}</h1>
          <span className={`difficulty-badge ${difficultyColor[problem?.difficulty || 'EASY'] || ''}`}>
            {problem?.difficulty}
          </span>
          <span className="category-badge">{problem?.category}</span>
        </div>
        <div className="header-right">
          <div className="timer">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{formatTime(elapsedTime)} / {formatTime(timeLimit)}</span>
          </div>
          <div className="participants-info">
            <div className="participant-count">{participants.length} participants</div>
            <div className="participants-list">
              {participants.map(p => (
                <div key={p.userId} className="participant-badge" title={p.userName}>
                  <span className={`status-dot ${p.isActive ? 'active' : 'inactive'}`}></span>
                  {p.userName}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="editor-main">
        {/* Left panel - Problem description */}
        <div className="editor-panel problem-panel">
          <div className="panel-tabs">
            <button
              className={`tab ${selectedTab === 'description' ? 'active' : ''}`}
              onClick={() => setSelectedTab('description')}
            >
              Description
            </button>
            <button className={`tab ${selectedTab === 'solutions' ? 'active' : ''}`} onClick={() => setSelectedTab('solutions')}>
              Solutions
            </button>
            <button className={`tab ${selectedTab === 'submissions' ? 'active' : ''}`} onClick={() => setSelectedTab('submissions')}>
              Submissions
            </button>
          </div>

          <div className="panel-content">
            {selectedTab === 'description' && problem && (
              <div className="description-content">
                <div className="problem-description">{problem.description}</div>

                {problem.examples.length > 0 && (
                  <div className="examples-section">
                    <h3>Examples</h3>
                    {problem.examples.map((example, idx) => (
                      <div key={idx} className="example-item">
                        <div className="example-header">Example {idx + 1}</div>
                        <div className="example-detail">
                          <strong>Input:</strong>
                          <pre>{example.input}</pre>
                        </div>
                        <div className="example-detail">
                          <strong>Output:</strong>
                          <pre>{example.output}</pre>
                        </div>
                        {example.explanation && (
                          <div className="example-detail">
                            <strong>Explanation:</strong>
                            <p>{example.explanation}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {selectedTab === 'solutions' && (
              <div className="solutions-placeholder">
                <p>Solutions will appear here after submission</p>
              </div>
            )}

            {selectedTab === 'submissions' && (
              <div className="submissions-placeholder">
                <p>Your submissions will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* Right panel - Code editor */}
        <div className="editor-panel code-panel">
          <div className="code-header">
            <div className="language-select">
              <label>Language:</label>
              <select value={language} onChange={e => setLanguage(e.target.value)}>
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="cpp">C++</option>
                <option value="java">Java</option>
              </select>
            </div>
          </div>

          <textarea
            className="code-editor"
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder="Write your code here..."
            spellCheck="false"
          />

          <div className="code-footer">
            <div className="input-section">
              <label>Input:</label>
              <textarea
                className="input-editor"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Optional input for testing..."
              />
            </div>

            <div className="button-group">
              <button className="btn btn-run" onClick={handleRunCode} disabled={isRunning}>
                {isRunning ? 'Running...' : 'Run Code'}
              </button>
              <button className="btn btn-submit" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Output section */}
      {output && (
        <div className="output-section">
          <div className="output-header">
            <h3>Output</h3>
            {executionResult && (
              <span className={`status-badge ${statusColor}`}>
                {executionResult.status} - {executionResult.runtime}ms
              </span>
            )}
          </div>
          <pre className="output-content">{output}</pre>
        </div>
      )}
    </div>
  );
};
