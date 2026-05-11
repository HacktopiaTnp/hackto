import { Request, Response } from 'express';
import { logger } from '@core/logger/logger';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class InterviewRoomController {
  /**
   * Create new interview room
   */
  async createRoom(req: Request, res: Response): Promise<void> {
    try {
      const { interviewerId, candidateId, problemId } = req.body;

      if (!interviewerId || !candidateId || !problemId) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      // Generate unique room code
      const roomCode = this.generateRoomCode();

      // Verify problem exists
      const problem = await prisma.coding_problems.findUnique({
        where: { id: problemId },
      });

      if (!problem) {
        res.status(404).json({ error: 'Problem not found' });
        return;
      }

      // Create interview room
      const room = await prisma.interview_rooms.create({
        data: {
          room_code: roomCode,
          interviewer_id: interviewerId,
          candidate_id: candidateId,
          problem_id: problemId,
          status: 'scheduled',
          start_time: null,
          end_time: null,
          recording_url: null,
        },
        include: {
          coding_problems: {
            select: {
              id: true,
              title: true,
              description: true,
              difficulty: true,
            },
          },
        },
      });

      logger.info(`Interview room created: ${room.id} (${roomCode})`);

      res.status(201).json({
        success: true,
        data: room,
      });
    } catch (error) {
      logger.error('Create Room Error', error);
      res.status(500).json({ error: 'Failed to create interview room' });
    }
  }

  /**
   * Join interview room
   */
  async joinRoom(req: Request, res: Response): Promise<void> {
    try {
      const { roomCode, userId, role } = req.body;

      if (!roomCode || !userId || !role) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      // Find room by code
      const room = await prisma.interview_rooms.findUnique({
        where: { room_code: roomCode },
      });

      if (!room) {
        res.status(404).json({ error: 'Room not found' });
        return;
      }

      if (room.status === 'ended' || room.status === 'cancelled') {
        res.status(400).json({ error: 'Room is no longer active' });
        return;
      }

      // Verify user is authorized
      if (
        role === 'interviewer' &&
        room.interviewer_id !== userId &&
        room.candidate_id !== userId
      ) {
        res.status(403).json({ error: 'Unauthorized to join this room' });
        return;
      }

      // Check if participant already exists
      const existingParticipant = await prisma.room_participants.findUnique({
        where: {
          room_id_user_id: {
            room_id: room.id,
            user_id: userId,
          },
        },
      });

      if (existingParticipant) {
        // Update existing participant
        await prisma.room_participants.update({
          where: {
            room_id_user_id: {
              room_id: room.id,
              user_id: userId,
            },
          },
          data: {
            is_active: true,
            joined_at: new Date(),
          },
        });
      } else {
        // Create new participant
        await prisma.room_participants.create({
          data: {
            room_id: room.id,
            user_id: userId,
            role: role as 'interviewer' | 'candidate',
            joined_at: new Date(),
            cursor_position: 0,
            is_active: true,
          },
        });
      }

      // Update room status if not started
      if (room.status === 'scheduled') {
        await prisma.interview_rooms.update({
          where: { id: room.id },
          data: { status: 'in_progress', start_time: new Date() },
        });
      }

      logger.info(`User ${userId} joined room ${room.id}`);

      res.json({
        success: true,
        data: {
          roomId: room.id,
          roomCode: room.room_code,
          status: 'in_progress',
          problemId: room.problem_id,
        },
      });
    } catch (error) {
      logger.error('Join Room Error', error);
      res.status(500).json({ error: 'Failed to join room' });
    }
  }

  /**
   * Get room details
   */
  async getRoom(req: Request, res: Response): Promise<void> {
    try {
      const { roomId } = req.params;

      const room = await prisma.interview_rooms.findUnique({
        where: { id: roomId },
        include: {
          coding_problems: true,
          room_participants: {
            select: {
              user_id: true,
              role: true,
              joined_at: true,
              is_active: true,
            },
          },
        },
      });

      if (!room) {
        res.status(404).json({ error: 'Room not found' });
        return;
      }

      res.json({
        success: true,
        data: room,
      });
    } catch (error) {
      logger.error('Get Room Error', error);
      res.status(500).json({ error: 'Failed to fetch room' });
    }
  }

  /**
   * Get active participants in room
   */
  async getRoomParticipants(req: Request, res: Response): Promise<void> {
    try {
      const { roomId } = req.params;

      const participants = await prisma.room_participants.findMany({
        where: {
          room_id: roomId,
          is_active: true,
        },
        include: {
          auth_users: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });

      res.json({
        success: true,
        data: participants,
      });
    } catch (error) {
      logger.error('Get Participants Error', error);
      res.status(500).json({ error: 'Failed to fetch participants' });
    }
  }

  /**
   * Get room messages (chat history)
   */
  async getRoomMessages(req: Request, res: Response): Promise<void> {
    try {
      const { roomId } = req.params;
      const { limit = 50, offset = 0 } = req.query;

      const messages = await prisma.room_messages.findMany({
        where: { room_id: roomId },
        include: {
          auth_users: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
        take: parseInt(limit as string),
        skip: parseInt(offset as string),
      });

      res.json({
        success: true,
        data: messages.reverse(),
      });
    } catch (error) {
      logger.error('Get Messages Error', error);
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  }

  /**
   * Send room message
   */
  async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const { roomId } = req.params;
      const { userId, message, messageType = 'text' } = req.body;

      if (!userId || !message) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      // Verify participant is in room
      const participant = await prisma.room_participants.findUnique({
        where: {
          room_id_user_id: {
            room_id: roomId,
            user_id: userId,
          },
        },
      });

      if (!participant) {
        res.status(403).json({ error: 'Not a participant in this room' });
        return;
      }

      const msg = await prisma.room_messages.create({
        data: {
          room_id: roomId,
          sender_id: userId,
          message_type: messageType as 'text' | 'code' | 'system',
          content: message,
          metadata: JSON.stringify({}),
        },
        include: {
          auth_users: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      res.json({
        success: true,
        data: msg,
      });
    } catch (error) {
      logger.error('Send Message Error', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  }

  /**
   * End interview room
   */
  async endRoom(req: Request, res: Response): Promise<void> {
    try {
      const { roomId } = req.params;
      const { userId } = req.body;

      // Fetch room
      const room = await prisma.interview_rooms.findUnique({
        where: { id: roomId },
      });

      if (!room) {
        res.status(404).json({ error: 'Room not found' });
        return;
      }

      // Only interviewer can end room
      if (room.interviewer_id !== userId) {
        res.status(403).json({ error: 'Only interviewer can end the room' });
        return;
      }

      // Update room status
      const updatedRoom = await prisma.interview_rooms.update({
        where: { id: roomId },
        data: {
          status: 'ended',
          end_time: new Date(),
        },
      });

      // Mark all participants as inactive
      await prisma.room_participants.updateMany({
        where: { room_id: roomId },
        data: { is_active: false },
      });

      logger.info(`Interview room ended: ${roomId}`);

      res.json({
        success: true,
        data: updatedRoom,
      });
    } catch (error) {
      logger.error('End Room Error', error);
      res.status(500).json({ error: 'Failed to end room' });
    }
  }

  /**
   * Cancel interview room
   */
  async cancelRoom(req: Request, res: Response): Promise<void> {
    try {
      const { roomId } = req.params;
      const { userId } = req.body;

      const room = await prisma.interview_rooms.findUnique({
        where: { id: roomId },
      });

      if (!room) {
        res.status(404).json({ error: 'Room not found' });
        return;
      }

      // Both interviewer and candidate can cancel if room is scheduled
      if (
        room.status !== 'scheduled' ||
        (room.interviewer_id !== userId && room.candidate_id !== userId)
      ) {
        res.status(403).json({ error: 'Cannot cancel this room' });
        return;
      }

      const updatedRoom = await prisma.interview_rooms.update({
        where: { id: roomId },
        data: { status: 'cancelled' },
      });

      logger.info(`Interview room cancelled: ${roomId}`);

      res.json({
        success: true,
        data: updatedRoom,
      });
    } catch (error) {
      logger.error('Cancel Room Error', error);
      res.status(500).json({ error: 'Failed to cancel room' });
    }
  }

  /**
   * Get interview history for user
   */
  async getUserInterviews(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { role = 'all', limit = 20, offset = 0 } = req.query;

      let where: any = {
        OR: [
          { interviewer_id: userId },
          { candidate_id: userId },
        ],
      };

      const interviews = await prisma.interview_rooms.findMany({
        where,
        include: {
          coding_problems: {
            select: {
              id: true,
              title: true,
              difficulty: true,
            },
          },
          room_participants: {
            select: {
              user_id: true,
              role: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
        take: parseInt(limit as string),
        skip: parseInt(offset as string),
      });

      res.json({
        success: true,
        data: interviews,
      });
    } catch (error) {
      logger.error('Get User Interviews Error', error);
      res.status(500).json({ error: 'Failed to fetch interviews' });
    }
  }

  /**
   * Generate unique room code
   */
  private generateRoomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}

export default new InterviewRoomController();
