/**
 * Frontend Logger Utility
 * Simple logging for debugging and monitoring
 */

export const logger = {
  debug: (message: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.log(`[DEBUG] ${message}`, data || '');
    }
  },

  info: (message: string, data?: any) => {
    console.log(`[INFO] ${message}`, data || '');
  },

  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data || '');
  },

  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error || '');
  },
};

export default logger;
