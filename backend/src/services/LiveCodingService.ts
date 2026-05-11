import { Server, Socket } from 'socket.io';
import { logger } from '@core/logger/logger';
import { Redis } from 'ioredis';

interface RoomState {
  roomId: string;
  code: string;
  language: string;
  participants: Map<string, ParticipantState>;
  lastSaved: Date;
  version: number;
}

interface ParticipantState {
  userId: string;
  userName: string;
  role: 'interviewer' | 'candidate';
  cursorLine: number;
  cursorColumn: number;
  isTyping: boolean;
  color: string;
  joinedAt: Date;
}

interface CodeChangeEvent {
  userId: string;
  change: {
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
    text: string;
    removedText: string;
  };
  timestamp: number;
  version: number;
}

export class LiveCodingService {
  private io: Server;
  private redis: Redis;
  private rooms: Map<string, RoomState> = new Map();
  private userSockets: Map<string, Set<string>> = new Map(); // userId -> socketIds

  constructor(io: Server, redis: Redis) {
    this.io = io;
    this.redis = redis;
    this.setupEventHandlers();
  }

  /**
   * Setup Socket.IO event handlers
   */
  private setupEventHandlers() {
    this.io.on('connection', (socket: Socket) => {
      logger.info(`Socket connected: ${socket.id}`);

      socket.on('join-room', (data) => this.handleJoinRoom(socket, data));
      socket.on('code-change', (data) => this.handleCodeChange(socket, data));
      socket.on('cursor-update', (data) => this.handleCursorUpdate(socket, data));
      socket.on('typing-start', (data) => this.handleTypingStart(socket, data));
      socket.on('typing-end', (data) => this.handleTypingEnd(socket, data));
      socket.on('run-code', (data) => this.handleRunCode(socket, data));
      socket.on('submit-code', (data) => this.handleSubmitCode(socket, data));
      socket.on('send-message', (data) => this.handleSendMessage(socket, data));
      socket.on('problem-switch', (data) => this.handleProblemSwitch(socket, data));
      socket.on('disconnect', () => this.handleDisconnect(socket));
    });
  }

  /**
   * Handle user joining interview room
   */
  async handleJoinRoom(socket: Socket, data: any) {
    try {
      const { roomId, userId, userName, role, problemId } = data;

      // Add socket to socket.io room
      socket.join(roomId);

      // Track user sockets
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(socket.id);

      // Attach user data to socket
      (socket as any).userId = userId;
      (socket as any).roomId = roomId;
      (socket as any).role = role;

      // Load or create room state
      let roomState = this.rooms.get(roomId);
      if (!roomState) {
        const cachedCode = await this.redis.get(`room:${roomId}:code`);
        roomState = {
          roomId,
          code: cachedCode || '',
          language: 'python',
          participants: new Map(),
          lastSaved: new Date(),
          version: 1,
        };
        this.rooms.set(roomId, roomState);
      }

      // Add participant
      roomState.participants.set(userId, {
        userId,
        userName,
        role,
        cursorLine: 0,
        cursorColumn: 0,
        isTyping: false,
        color: this.generateUserColor(),
        joinedAt: new Date(),
      });

      // Send current state to joining user
      socket.emit('room-state', {
        code: roomState.code,
        language: roomState.language,
        participants: Array.from(roomState.participants.values()),
        version: roomState.version,
      });

      // Notify others of new participant
      socket.to(roomId).emit('participant-joined', {
        userId,
        userName,
        role,
        color: roomState.participants.get(userId)!.color,
      });

      logger.info(`User ${userId} joined room ${roomId}`);
    } catch (error) {
      logger.error('Join Room Error', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  }

  /**
   * Handle code changes with operational transformation
   */
  async handleCodeChange(socket: Socket, data: CodeChangeEvent) {
    try {
      const userId = (socket as any).userId;
      const roomId = (socket as any).roomId;

      if (!roomId || !userId) return;

      const roomState = this.rooms.get(roomId);
      if (!roomState) return;

      // Apply change locally
      roomState.code = this.applyTextChange(roomState.code, data.change);
      roomState.version++;

      // Save to Redis
      await this.redis.set(`room:${roomId}:code`, roomState.code);
      await this.redis.set(`room:${roomId}:version`, roomState.version);

      // Broadcast to all clients in room
      this.io.to(roomId).emit('code-changed', {
        userId,
        change: data.change,
        version: roomState.version,
        timestamp: Date.now(),
      });
    } catch (error) {
      logger.error('Code Change Error', error);
    }
  }

  /**
   * Handle cursor position updates
   */
  async handleCursorUpdate(socket: Socket, data: any) {
    try {
      const userId = (socket as any).userId;
      const roomId = (socket as any).roomId;

      if (!roomId || !userId) return;

      const roomState = this.rooms.get(roomId);
      if (!roomState) return;

      // Update participant cursor
      const participant = roomState.participants.get(userId);
      if (participant) {
        participant.cursorLine = data.line;
        participant.cursorColumn = data.column;
      }

      // Broadcast cursor update
      socket.to(roomId).emit('cursor-updated', {
        userId,
        line: data.line,
        column: data.column,
      });
    } catch (error) {
      logger.error('Cursor Update Error', error);
    }
  }

  /**
   * Handle typing indicator
   */
  async handleTypingStart(socket: Socket, data: any) {
    try {
      const userId = (socket as any).userId;
      const roomId = (socket as any).roomId;

      if (!roomId) return;

      socket.to(roomId).emit('typing-started', { userId });
    } catch (error) {
      logger.error('Typing Start Error', error);
    }
  }

  /**
   * Handle typing end
   */
  async handleTypingEnd(socket: Socket, data: any) {
    try {
      const userId = (socket as any).userId;
      const roomId = (socket as any).roomId;

      if (!roomId) return;

      socket.to(roomId).emit('typing-ended', { userId });
    } catch (error) {
      logger.error('Typing End Error', error);
    }
  }

  /**
   * Handle code execution request
   */
  async handleRunCode(socket: Socket, data: any) {
    try {
      const roomId = (socket as any).roomId;
      const { code, language, input } = data;

      // This will be handled by the backend API endpoint
      socket.emit('run-code-processing', {
        message: 'Executing code...',
      });
    } catch (error) {
      logger.error('Run Code Error', error);
      socket.emit('run-code-error', { message: 'Code execution failed' });
    }
  }

  /**
   * Handle code submission
   */
  async handleSubmitCode(socket: Socket, data: any) {
    try {
      const roomId = (socket as any).roomId;
      const { code, language, problemId } = data;

      // This will be handled by the backend API endpoint
      socket.emit('submit-code-processing', {
        message: 'Evaluating code...',
      });
    } catch (error) {
      logger.error('Submit Code Error', error);
      socket.emit('submit-code-error', { message: 'Code submission failed' });
    }
  }

  /**
   * Handle chat messages
   */
  async handleSendMessage(socket: Socket, data: any) {
    try {
      const userId = (socket as any).userId;
      const roomId = (socket as any).roomId;

      if (!roomId) return;

      const { message } = data;

      this.io.to(roomId).emit('message-received', {
        userId,
        message,
        timestamp: Date.now(),
      });

      // Persist message to database
      // This will be handled by the API layer
    } catch (error) {
      logger.error('Send Message Error', error);
    }
  }

  /**
   * Handle problem switch
   */
  async handleProblemSwitch(socket: Socket, data: any) {
    try {
      const roomId = (socket as any).roomId;
      const { newProblemId } = data;

      // Notify all participants
      socket.to(roomId).emit('problem-switched', {
        problemId: newProblemId,
        timestamp: Date.now(),
      });
    } catch (error) {
      logger.error('Problem Switch Error', error);
    }
  }

  /**
   * Handle user disconnect
   */
  async handleDisconnect(socket: Socket) {
    try {
      const userId = (socket as any).userId;
      const roomId = (socket as any).roomId;

      if (roomId && userId) {
        // Remove participant from room state
        const roomState = this.rooms.get(roomId);
        if (roomState) {
          roomState.participants.delete(userId);

          // Notify others
          socket.to(roomId).emit('participant-left', { userId });
        }

        // Clean up room if empty
        if (roomState && roomState.participants.size === 0) {
          this.rooms.delete(roomId);
          await this.redis.del(`room:${roomId}:code`);
        }
      }

      // Remove socket from user tracking
      if (userId) {
        const userSockets = this.userSockets.get(userId);
        if (userSockets) {
          userSockets.delete(socket.id);
          if (userSockets.size === 0) {
            this.userSockets.delete(userId);
          }
        }
      }

      logger.info(`Socket disconnected: ${socket.id}`);
    } catch (error) {
      logger.error('Disconnect Error', error);
    }
  }

  /**
   * Apply text change to code
   */
  private applyTextChange(
    code: string,
    change: any
  ): string {
    const lines = code.split('\n');

    // Convert to flat index
    let startIndex = 0;
    for (let i = 0; i < change.startLine; i++) {
      startIndex += (lines[i]?.length || 0) + 1;
    }
    startIndex += change.startColumn;

    let endIndex = startIndex;
    if (change.endLine > change.startLine) {
      for (let i = change.startLine; i < change.endLine; i++) {
        endIndex += (lines[i]?.length || 0) + 1;
      }
      endIndex += change.endColumn;
    } else {
      endIndex += change.endColumn - change.startColumn;
    }

    // Apply change
    return code.substring(0, startIndex) + change.text + code.substring(endIndex);
  }

  /**
   * Generate color for user cursors
   */
  private generateUserColor(): string {
    const colors = [
      '#FF6B6B',
      '#4ECDC4',
      '#45B7D1',
      '#FFA07A',
      '#98D8C8',
      '#F7DC6F',
      '#BB8FCE',
      '#85C1E2',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  /**
   * Broadcast code execution result
   */
  broadcastExecutionResult(roomId: string, result: any) {
    this.io.to(roomId).emit('code-executed', result);
  }

  /**
   * Broadcast submission result
   */
  broadcastSubmissionResult(roomId: string, result: any) {
    this.io.to(roomId).emit('submission-result', result);
  }

  /**
   * Get room state
   */
  getRoomState(roomId: string): RoomState | undefined {
    return this.rooms.get(roomId);
  }
}

export default LiveCodingService;
