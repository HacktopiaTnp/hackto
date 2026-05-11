import 'reflect-metadata';
import 'dotenv/config';

import { logger } from './core/logger/logger';
import { createApp } from './app';
// Initialize Bull queues with Redis connection
import './config/bull';
// Initialize Redis with correct URL parsing
import './config/redis';

/**
 * Main Entry Point
 * Starts the server and handles graceful shutdown
 */
async function main(): Promise<void> {
  try {
    logger.info('✅ Redis initialized with proper URL parsing');
    
    logger.info('Starting application...');

    // Create and start app
    const app = await createApp();
    await app.start();

    // Handle shutdown signals
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received');
      app.shutdown();
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received');
      app.shutdown();
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      logger.fatal('Uncaught Exception', error);
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
      logger.fatal('Unhandled Rejection', new Error(String(reason)), { promise });
      process.exit(1);
    });
  } catch (error) {
    logger.fatal('Application startup failed', error);
    process.exit(1);
  }
}

// Run main function
main();
