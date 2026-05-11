import { Request, Response } from 'express';
import { logger } from '@core/logger/logger';
import { PrismaClient } from '@prisma/client';
import Judge0Service from '@services/Judge0Service';

const prisma = new PrismaClient();

export class SubmissionController {
  /**
   * Run code with custom input (RUN button)
   */
  async runCode(req: Request, res: Response): Promise<void> {
    try {
      const { code, language, input, roomId, userId } = req.body;

      if (!code || !language) {
        res.status(400).json({ error: 'Missing code or language' });
        return;
      }

      // Execute code on Judge0
      const result = await Judge0Service.runWithInput(code, language, input || '');

      // Return result immediately
      res.json({
        success: true,
        data: {
          status: result.status,
          stdout: result.stdout,
          stderr: result.stderr,
          compile_output: result.compile_output,
          time: result.time,
          memory: result.memory,
          exitCode: result.exit_code,
        },
      });
    } catch (error) {
      logger.error('Run Code Error', error);
      res.status(500).json({
        error: 'Code execution failed',
        message: (error as any).message,
      });
    }
  }

  /**
   * Submit code for evaluation
   */
  async submitCode(req: Request, res: Response): Promise<void> {
    try {
      const { code, language, problemId, roomId, userId } = req.body;

      if (!code || !language || !problemId || !userId) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      // Get problem details and test cases
      const problem = await prisma.coding_problems.findUnique({
        where: { id: problemId },
        include: {
          problem_test_cases: true,
        },
      });

      if (!problem) {
        res.status(404).json({ error: 'Problem not found' });
        return;
      }

      // Get only visible test cases (hidden ones only for scoring)
      const visibleTestCases = problem.problem_test_cases.filter(
        (tc) => !tc.is_hidden
      );

      // Execute code against test cases
      const testResults = await Judge0Service.testCodeAgainstCases(
        code,
        language,
        visibleTestCases.map((tc) => ({
          input: tc.input_data,
          expectedOutput: tc.expected_output,
        }))
      );

      // Count passed test cases
      const passedTests = testResults.filter((tr) => tr.passed).length;
      const totalTests = testResults.length;
      const passPercentage = (passedTests / totalTests) * 100;

      // Get last execution for time and memory stats
      const lastResult = testResults[testResults.length - 1];
      const totalExecutionTime =
        testResults.reduce((sum, tr) => sum + tr.executionTime, 0) / 1000; // Convert to seconds
      const maxMemory = Math.max(...testResults.map((tr) => tr.memory || 0));

      // Determine submission status
      let submissionStatus: 'accepted' | 'wrong_answer' | 'time_limit_exceeded' | 'runtime_error' | 'compilation_error' =
        'wrong_answer';

      if (passedTests === totalTests) {
        submissionStatus = 'accepted';
      } else if (testResults.some((tr) => tr.status === 'Time Limit Exceeded')) {
        submissionStatus = 'time_limit_exceeded';
      } else if (
        testResults.some((tr) => tr.status === 'Runtime Error') ||
        testResults.some((tr) => tr.status === undefined)
      ) {
        submissionStatus = 'runtime_error';
      } else if (
        testResults.some(
          (tr) =>
            tr.status === 'Compilation Error' ||
            tr.status === 'Compile Error'
        )
      ) {
        submissionStatus = 'compilation_error';
      }

      // Save submission to database
      const submission = await prisma.submissions.create({
        data: {
          user_id: userId,
          problem_id: problemId,
          code_content: code,
          language,
          status: submissionStatus,
          runtime_ms: totalExecutionTime * 1000,
          memory_mb: maxMemory,
          passed_test_cases: passedTests,
          total_test_cases: totalTests,
          score: passPercentage,
          error_message:
            testResults.find((tr) => tr.stderr)?.stderr || null,
        },
      });

      // Create view details for first failure (if any)
      if (submissionStatus !== 'accepted') {
        const failedTest = testResults.find((tr) => !tr.passed);
        if (failedTest) {
          logger.info(`Submission failed: ${JSON.stringify(failedTest)}`);
        }
      }

      logger.info(`Code submitted: ${submission.id}, Status: ${submissionStatus}`);

      res.json({
        success: true,
        data: {
          submissionId: submission.id,
          status: submissionStatus,
          passedTests,
          totalTests,
          passPercentage,
          runtime: totalExecutionTime,
          memory: maxMemory,
          testResults: testResults.map((tr) => ({
            passed: tr.passed,
            status: tr.status,
            input: tr.input,
            expectedOutput: tr.expectedOutput,
            actualOutput: tr.output,
            executionTime: tr.executionTime,
            memory: tr.memory,
          })),
        },
      });

      // If room provided, broadcast result to all participants
      if (roomId && (global as any).io) {
        (global as any).io.to(roomId).emit('submission-result', {
          userId,
          status: submissionStatus,
          passedTests,
          totalTests,
          passPercentage,
          timestamp: new Date(),
        });
      }
    } catch (error) {
      logger.error('Submit Code Error', error);
      res.status(500).json({
        error: 'Code submission failed',
        message: (error as any).message,
      });
    }
  }

  /**
   * Get submission details
   */
  async getSubmission(req: Request, res: Response): Promise<void> {
    try {
      const { submissionId } = req.params;

      const submission = await prisma.submissions.findUnique({
        where: { id: submissionId },
        include: {
          auth_users: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          coding_problems: {
            select: {
              id: true,
              title: true,
              difficulty: true,
            },
          },
        },
      });

      if (!submission) {
        res.status(404).json({ error: 'Submission not found' });
        return;
      }

      res.json({
        success: true,
        data: submission,
      });
    } catch (error) {
      logger.error('Get Submission Error', error);
      res.status(500).json({ error: 'Failed to fetch submission' });
    }
  }

  /**
   * Get all submissions for a problem by user
   */
  async getUserProblemSubmissions(req: Request, res: Response): Promise<void> {
    try {
      const { userId, problemId } = req.params;
      const { limit = 20, offset = 0 } = req.query;

      const submissions = await prisma.submissions.findMany({
        where: {
          user_id: userId,
          problem_id: problemId,
        },
        orderBy: { created_at: 'desc' },
        take: parseInt(limit as string),
        skip: parseInt(offset as string),
      });

      // Get summary stats
      const accepted = submissions.filter(
        (s) => s.status === 'accepted'
      ).length;
      const bestRuntime = Math.min(
        ...submissions.map((s) => s.runtime_ms || Infinity)
      );
      const bestMemory = Math.min(
        ...submissions.map((s) => s.memory_mb || Infinity)
      );

      res.json({
        success: true,
        data: {
          submissions,
          stats: {
            total: submissions.length,
            accepted,
            attempts: submissions.length,
            bestRuntime: bestRuntime === Infinity ? null : bestRuntime,
            bestMemory: bestMemory === Infinity ? null : bestMemory,
          },
        },
      });
    } catch (error) {
      logger.error('Get User Submissions Error', error);
      res.status(500).json({ error: 'Failed to fetch submissions' });
    }
  }

  /**
   * Get all submissions in a room
   */
  async getRoomSubmissions(req: Request, res: Response): Promise<void> {
    try {
      const { roomId } = req.params;

      // Get room and problem
      const room = await prisma.interview_rooms.findUnique({
        where: { id: roomId },
        include: {
          room_participants: {
            select: { user_id: true },
          },
        },
      });

      if (!room) {
        res.status(404).json({ error: 'Room not found' });
        return;
      }

      const participantIds = room.room_participants.map((p) => p.user_id);

      // Get submissions from all participants
      const submissions = await prisma.submissions.findMany({
        where: {
          problem_id: room.problem_id,
          user_id: {
            in: participantIds,
          },
        },
        include: {
          auth_users: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
      });

      res.json({
        success: true,
        data: submissions,
      });
    } catch (error) {
      logger.error('Get Room Submissions Error', error);
      res.status(500).json({ error: 'Failed to fetch submissions' });
    }
  }

  /**
   * Get user's submission statistics
   */
  async getUserStatistics(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      // Total submissions
      const totalSubmissions = await prisma.submissions.count({
        where: { user_id: userId },
      });

      // Accepted submissions
      const acceptedSubmissions = await prisma.submissions.count({
        where: {
          user_id: userId,
          status: 'accepted',
        },
      });

      // Unique problems solved
      const solvedProblems = await prisma.submissions.findMany({
        where: {
          user_id: userId,
          status: 'accepted',
        },
        distinct: ['problem_id'],
        select: {
          problem_id: true,
        },
      });

      // Stats by difficulty
      const byDifficulty = await prisma.$queryRaw`
        SELECT 
          cp.difficulty,
          COUNT(DISTINCT CASE WHEN s.status = 'accepted' THEN s.problem_id END) as solved,
          COUNT(DISTINCT s.problem_id) as attempted
        FROM submissions s
        JOIN coding_problems cp ON s.problem_id = cp.id
        WHERE s.user_id = ${userId}
        GROUP BY cp.difficulty
      `;

      // Best performance
      const bestSubmission = await prisma.submissions.findFirst({
        where: { user_id: userId },
        orderBy: [
          { score: 'desc' },
          { runtime_ms: 'asc' },
          { memory_mb: 'asc' },
        ],
        include: {
          coding_problems: {
            select: {
              title: true,
              difficulty: true,
            },
          },
        },
      });

      res.json({
        success: true,
        data: {
          totalSubmissions,
          acceptedSubmissions,
          solvedProblems: solvedProblems.length,
          acceptanceRate: totalSubmissions > 0
            ? ((acceptedSubmissions / totalSubmissions) * 100).toFixed(2)
            : 0,
          byDifficulty,
          bestSubmission,
        },
      });
    } catch (error) {
      logger.error('Get User Statistics Error', error);
      res.status(500).json({ error: 'Failed to fetch statistics' });
    }
  }
}

export default new SubmissionController();
