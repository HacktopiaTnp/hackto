import React, { useEffect, useRef, useState, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';
import { logger } from '../../utils/logger';

interface CodeEditorProps {
  roomId: string;
  userId: string;
  userName: string;
  role: 'interviewer' | 'candidate';
  problemId: string;
  language?: string;
  onCodeChange?: (code: string) => void;
  onSubmit?: (code: string, language: string) => void;
  onRun?: (code: string, language: string, input: string) => void;
}

interface Participant {
  userId: string;
  userName: string;
  role: 'interviewer' | 'candidate';
  cursorLine: number;
  cursorColumn: number;
  color: string;
}

interface ExecutionResult {
  status: string;
  stdout: string;
  stderr: string;
  time?: number;
  memory?: number;
}

export const LiveCodingEditor: React.FC<CodeEditorProps> = ({
  roomId,
  userId,
  userName,
  role,
  problemId,
  language = 'python',
  onCodeChange,
  onSubmit,
  onRun,
}) => {
  const socketRef = useRef<Socket | null>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const [code, setCode] = useState<string>('');
  const [currentLanguage, setCurrentLanguage] = useState<string>(language);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [userInput, setUserInput] = useState<string>('');
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const codeVersionRef = useRef<number>(1);

  // Initialize Socket.IO connection
  useEffect(() => {
    const socket = io(window.location.origin, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    // Connect and join room
    socket.on('connect', () => {
      logger.info('Socket connected');
      socket.emit('join-room', {
        roomId,
        userId,
        userName,
        role,
        problemId,
      });
    });

    // Receive room state on join
    socket.on('room-state', (data) => {
      setCode(data.code);
      setCurrentLanguage(data.language);
      setParticipants(data.participants);
      codeVersionRef.current = data.version;
      logger.info('Received room state');
    });

    // Participant joined
    socket.on('participant-joined', (data) => {
      logger.info(`${data.userName} joined the room`);
      setParticipants((prev) => [...prev, data]);
    });

    // Participant left
    socket.on('participant-left', (data) => {
      setParticipants((prev) =>
        prev.filter((p) => p.userId !== data.userId)
      );
      logger.info(`${data.userId} left the room`);
    });

    // Handle code changes from other users
    socket.on('code-changed', (data) => {
      if (data.userId !== userId) {
        // Apply change to code
        const newCode = applyTextChange(code, data.change);
        setCode(newCode);
        codeVersionRef.current = data.version;
        onCodeChange?.(newCode);
      }
    });

    // Handle cursor updates
    socket.on('cursor-updated', (data) => {
      setParticipants((prev) =>
        prev.map((p) =>
          p.userId === data.userId
            ? { ...p, cursorLine: data.line, cursorColumn: data.column }
            : p
        )
      );
    });

    // Handle typing indicators
    socket.on('typing-started', (data) => {
      if (data.userId !== userId) {
        logger.info(`${data.userId} is typing...`);
      }
    });

    socket.on('typing-ended', (data) => {
      if (data.userId !== userId) {
        logger.info(`${data.userId} stopped typing`);
      }
    });

    // Handle code execution results
    socket.on('code-executed', (result) => {
      setExecutionResult(result);
      setIsRunning(false);
      logger.info('Code execution result:', result);
    });

    // Handle submission results
    socket.on('submission-result', (result) => {
      setExecutionResult(result);
      setIsSubmitting(false);
      logger.info('Submission result:', result);
    });

    // Handle chat messages
    socket.on('message-received', (data) => {
      logger.info(`${data.userId}: ${data.message}`);
    });

    // Handle errors
    socket.on('error', (error) => {
      logger.error('Socket error:', error);
    });

    socket.on('disconnect', () => {
      logger.info('Socket disconnected');
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId, userId, userName, role, problemId]);

  // Handle code changes
  const handleCodeChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newCode = e.target.value;
      setCode(newCode);
      onCodeChange?.(newCode);

      // Emit code change to other users
      if (socketRef.current) {
        socketRef.current.emit('code-change', {
          userId,
          change: {
            startLine: 0,
            startColumn: 0,
            endLine: newCode.split('\n').length - 1,
            endColumn: newCode.length,
            text: newCode,
            removedText: code,
          },
          timestamp: Date.now(),
          version: codeVersionRef.current,
        });
      }

      // Emit typing indicator
      setIsTyping(true);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      if (socketRef.current) {
        socketRef.current.emit('typing-start', {});
      }

      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        if (socketRef.current) {
          socketRef.current.emit('typing-end', {});
        }
      }, 1000);
    },
    [code, userId, onCodeChange]
  );

  // Handle cursor movement
  const handleCursorMove = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (!editorRef.current) return;

      const textarea = editorRef.current;
      const start = textarea.selectionStart;
      const lines = code.substring(0, start).split('\n');
      const line = lines.length - 1;
      const column = lines[line].length;

      if (socketRef.current) {
        socketRef.current.emit('cursor-update', { line, column });
      }
    },
    [code]
  );

  // Run code
  const handleRunCode = async () => {
    setIsRunning(true);
    setExecutionResult(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/submissions/run`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            code,
            language: currentLanguage,
            input: userInput,
            roomId,
            userId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        setExecutionResult(result.data);

        // Broadcast to room
        if (socketRef.current) {
          socketRef.current.emit('run-code', {
            code,
            language: currentLanguage,
            input: userInput,
          });
        }

        onRun?.(code, currentLanguage, userInput);
      }
    } catch (error) {
      logger.error('Error running code:', error);
      setExecutionResult({
        status: 'Error',
        stdout: '',
        stderr: 'Failed to execute code',
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Submit code
  const handleSubmitCode = async () => {
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/submissions/submit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            code,
            language: currentLanguage,
            problemId,
            roomId,
            userId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        setExecutionResult(result.data);
        onSubmit?.(code, currentLanguage);

        // Broadcast to room
        if (socketRef.current) {
          socketRef.current.emit('submit-code', {
            code,
            language: currentLanguage,
            problemId,
          });
        }
      }
    } catch (error) {
      logger.error('Error submitting code:', error);
      setExecutionResult({
        status: 'Error',
        stdout: '',
        stderr: 'Failed to submit code',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-gray-100">
      {/* Header */}
      <div className="bg-gray-800 p-4 border-b border-gray-700">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">Live Code Editor</h2>
            <p className="text-sm text-gray-400">
              {participants.length} participant(s) in room
            </p>
          </div>

          <div className="flex gap-2">
            <select
              value={currentLanguage}
              onChange={(e) => setCurrentLanguage(e.target.value)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              disabled={role === 'interviewer' && participants.length > 1}
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="c">C</option>
              <option value="csharp">C#</option>
              <option value="ruby">Ruby</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
            </select>

            <button
              onClick={handleRunCode}
              disabled={isRunning || isSubmitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded text-white font-medium transition"
            >
              {isRunning ? 'Running...' : 'Run'}
            </button>

            {role === 'candidate' && (
              <button
                onClick={handleSubmitCode}
                disabled={isSubmitting || isRunning}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded text-white font-medium transition"
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 gap-4 p-4">
        {/* Editor */}
        <div className="flex-1 flex flex-col">
          <label className="text-sm font-medium text-gray-400 mb-2">
            Code
          </label>
          <textarea
            ref={editorRef}
            value={code}
            onChange={handleCodeChange}
            onKeyUp={handleCursorMove}
            className="flex-1 p-4 bg-gray-800 border border-gray-700 rounded font-mono text-sm text-gray-100 resize-none focus:outline-none focus:border-blue-500"
            spellCheck="false"
            placeholder="Write your code here..."
          />
        </div>

        {/* Right Panel */}
        <div className="w-96 flex flex-col gap-4">
          {/* Input/Output */}
          <div className="flex-1 flex flex-col bg-gray-800 rounded border border-gray-700">
            <div className="p-3 border-b border-gray-700">
              <h3 className="font-medium text-sm">Input</h3>
            </div>
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className="flex-1 p-3 bg-gray-800 font-mono text-sm resize-none focus:outline-none focus:border-blue-500 text-gray-100"
              placeholder="Enter input for code execution..."
            />
          </div>

          {/* Output */}
          <div className="flex-1 flex flex-col bg-gray-800 rounded border border-gray-700">
            <div className="p-3 border-b border-gray-700">
              <h3 className="font-medium text-sm">Output</h3>
            </div>
            <div className="flex-1 p-3 overflow-y-auto font-mono text-sm">
              {executionResult ? (
                <div>
                  <div
                    className={`mb-2 font-semibold ${
                      executionResult.status === 'Accepted'
                        ? 'text-green-400'
                        : 'text-red-400'
                    }`}
                  >
                    Status: {executionResult.status}
                  </div>

                  {executionResult.stdout && (
                    <div className="mb-2">
                      <div className="text-gray-400">Output:</div>
                      <div className="text-green-400 break-words">
                        {executionResult.stdout}
                      </div>
                    </div>
                  )}

                  {executionResult.stderr && (
                    <div className="mb-2">
                      <div className="text-gray-400">Error:</div>
                      <div className="text-red-400 break-words">
                        {executionResult.stderr}
                      </div>
                    </div>
                  )}

                  {executionResult.time && (
                    <div className="text-gray-400">
                      Time: {executionResult.time}s | Memory:{' '}
                      {executionResult.memory}MB
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-gray-500">Output will appear here...</div>
              )}
            </div>
          </div>

          {/* Participants */}
          <div className="flex-shrink-0 bg-gray-800 rounded border border-gray-700 p-3">
            <h3 className="font-medium text-sm mb-2">Participants</h3>
            <div className="space-y-1">
              {participants.map((participant) => (
                <div
                  key={participant.userId}
                  className="flex items-center gap-2 text-xs"
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: participant.color }}
                  />
                  <span>{participant.userName}</span>
                  <span className="text-gray-500">({participant.role})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Helper: Apply text changes
 */
function applyTextChange(
  code: string,
  change: {
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
    text: string;
  }
): string {
  const lines = code.split('\n');
  const newLines = [...lines];

  // Calculate absolute positions
  let startPos = 0;
  for (let i = 0; i < change.startLine; i++) {
    startPos += (lines[i]?.length || 0) + 1;
  }
  startPos += change.startColumn;

  let endPos = startPos;
  if (change.endLine > change.startLine) {
    for (let i = change.startLine; i < change.endLine; i++) {
      endPos += (lines[i]?.length || 0) + 1;
    }
    endPos += change.endColumn;
  } else {
    endPos += change.endColumn - change.startColumn;
  }

  // Apply change
  const result =
    code.substring(0, startPos) + change.text + code.substring(endPos);

  return result;
}

export default LiveCodingEditor;
