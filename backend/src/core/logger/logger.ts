import pino from 'pino';
import env from '@config/env';

/**
 * Logger Service
 * Provides structured logging with Pino
 * Integrates with OpenTelemetry for distributed tracing
 */
class LoggerService {
  private logger: pino.Logger;

  constructor() {
    const logLevel = this.getLogLevel();

    const transportOptions = env.NODE_ENV === 'development' ? {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
        singleLine: false,
        quietDays: [],
      },
    } : undefined;

    this.logger = pino(
      {
        level: logLevel,
        timestamp: pino.stdTimeFunctions.isoTime,
        formatters: {
          level: (label) => {
            return {
              level: label.toUpperCase(),
            };
          },
          bindings: (_bindings) => {
            return {
              environment: env.NODE_ENV,
              service: env.APP_NAME,
              version: env.APP_VERSION,
            };
          },
        },
        base: {
          environment: env.NODE_ENV,
          service: env.APP_NAME,
        },
      },
      transportOptions ? pino.transport(transportOptions) : undefined,
    );
  }

  private getLogLevel(): pino.LevelWithSilent {
    const level = (process.env.LOG_LEVEL || 'info').toLowerCase();
    const validLevels: pino.LevelWithSilent[] = ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'];
    return (validLevels.includes(level as pino.LevelWithSilent) ? level : 'info') as pino.LevelWithSilent;
  }

  /**
   * Log info level
   */
  info(message: string, data?: any): void {
    this.logger.info(data || {}, message);
  }

  /**
   * Log error level
   */
  error(message: string, error?: any, data?: any): void {
    if (error instanceof Error) {
      this.logger.error(
        {
          ...data,
          error: {
            message: error.message,
            stack: error.stack,
            name: error.name,
          },
        },
        message,
      );
    } else {
      this.logger.error(error || data || {}, message);
    }
  }

  /**
   * Log warn level
   */
  warn(message: string, data?: any): void {
    this.logger.warn(data || {}, message);
  }

  /**
   * Log debug level
   */
  debug(message: string, data?: any): void {
    this.logger.debug(data || {}, message);
  }

  /**
   * Log trace level (very detailed)
   */
  trace(message: string, data?: any): void {
    this.logger.trace(data || {}, message);
  }

  /**
   * Log fatal level
   */
  fatal(message: string, error?: any, data?: any): void {
    if (error instanceof Error) {
      this.logger.fatal(
        {
          ...data,
          error: {
            message: error.message,
            stack: error.stack,
            name: error.name,
          },
        },
        message,
      );
    } else {
      this.logger.fatal(error || data || {}, message);
    }
  }

  /**
   * Create child logger with additional context
   */
  createChild(bindings: Record<string, any>): pino.Logger {
    return this.logger.child(bindings);
  }

  /**
   * Get raw Pino logger instance
   */
  getLogger(): pino.Logger {
    return this.logger;
  }
}

// Create singleton instance
const loggerService = new LoggerService();

// Export logger instance for use throughout application
export const logger = loggerService;
export default loggerService;
