import { Queue } from 'bullmq';

/**
 * BullMQ Configuration
 * Event-driven job processing with Redis
 */

// Redis connection URL for BullMQ
// Use the full URL from environment, which supports Docker service names
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

console.error('[Bull] Connecting to Redis URL:', redisUrl);

// Resume parsing and analysis
export const resumeParsingQueue = new Queue('resume-parsing', {
  connection: { url: redisUrl },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

// ATS Scoring
export const atsScoringQueue = new Queue('ats-scoring', {
  connection: { url: redisUrl },
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: true,
  },
});

// Eligibility checking
export const eligibilityQueue = new Queue('eligibility-check', {
  connection: { url: redisUrl },
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: 'fixed', delay: 1000 },
    removeOnComplete: true,
  },
});

// Email notifications
export const notificationQueue = new Queue('notifications', {
  connection: { url: redisUrl },
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: true,
  },
});

// Interview recording and processing
export const interviewQueue = new Queue('interview-processing', {
  connection: { url: redisUrl },
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: false, // Keep for archive
  },
});

// Bulk operations and cleanup
export const bulkQueue = new Queue('bulk-operations', {
  connection: { url: redisUrl },
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: 'fixed', delay: 5000 },
  },
});

// Report generation
export const reportQueue = new Queue('report-generation', {
  connection: { url: redisUrl },
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: 'exponential', delay: 2000 },
  },
});

/**
 * Job Types
 */
export interface ResumeParkingJob {
  studentId: string;
  resumeUrl: string;
  jobId: string;
  tenantId: string;
}

export interface ATSScoringJob {
  studentId: string;
  resumeUrl: string;
  jobId: string;
  tenantId: string;
}

export interface EligibilityCheckJob {
  studentId: string;
  jobId: string;
  tenantId: string;
}

export interface NotificationJob {
  type: 'email' | 'sms' | 'push';
  recipientId: string;
  template: string;
  data: Record<string, any>;
  tenantId: string;
}

export interface InterviewJob {
  interviewId: string;
  recordingUrl: string;
  studentId: string;
  interviewerId: string;
  tenantId: string;
}

/**
 * Job Queue utilities
 */
export async function enqueueResumeAnalysis(job: ResumeParkingJob) {
  await resumeParsingQueue.add('parse-resume', job, {
    jobId: `${job.studentId}-${job.jobId}`,
  });
}

export async function enqueueATSScoring(job: ATSScoringJob) {
  await atsScoringQueue.add('score-ats', job, {
    priority: 5, // Higher priority
  });
}

export async function enqueueEligibilityCheck(job: EligibilityCheckJob) {
  await eligibilityQueue.add('check-eligibility', job);
}

export async function enqueueNotification(job: NotificationJob) {
  await notificationQueue.add('send-notification', job);
}

export async function scheduleRecurringJob(queueName: string, name: string, cron: string, data: any) {
  // Example: '0 0 * * *' for daily at midnight
  const queue = new Queue(queueName, { connection: { url: redisUrl } });
  
  await queue.add(
    name,
    data,
    {
      repeat: {
        pattern: cron,
      },
    }
  );
}

/**
 * Queue Monitoring
 */
export async function getQueueStats(queueName: string) {
  const queue = new Queue(queueName, { connection: { url: redisUrl } });
  
  const [count, waiting, active, completed, failed, delayed] = await Promise.all([
    queue.count(),
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount(),
    queue.getDelayedCount(),
  ]);

  return {
    name: queueName,
    totalCount: count,
    waiting,
    active,
    completed,
    failed,
    delayed,
    health: failed === 0 ? 'healthy' : 'degraded',
  };
}

export async function getAllQueueStats() {
  const queues = [
    'resume-parsing',
    'ats-scoring',
    'eligibility-check',
    'notifications',
    'interview-processing',
    'bulk-operations',
    'report-generation',
  ];

  return Promise.all(queues.map(q => getQueueStats(q)));
}

/**
 * Health check
 */
export async function checkQueueHealth(): Promise<boolean> {
  try {
    const stats = await resumeParsingQueue.getJobCounts();
    return stats.waiting >= 0; // Connection is alive if we can query
  } catch {
    return false;
  }
}

export default {
  resumeParsingQueue,
  atsScoringQueue,
  eligibilityQueue,
  notificationQueue,
  interviewQueue,
  bulkQueue,
  reportQueue,
};
