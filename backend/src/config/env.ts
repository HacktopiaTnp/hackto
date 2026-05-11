import dotenv from 'dotenv';

// Only load .env in development if it exists
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

// Helper to get env vars with fallback
const getEnv = (key: string, fallback: string): string => {
  const value = process.env[key];
  if (value !== undefined && value !== '') {
    return value;
  }
  return fallback;
};

export const env = {
  // Environment
  NODE_ENV: getEnv('NODE_ENV', 'development'),
  PORT: parseInt(getEnv('PORT', '3000')),
  APP_NAME: 'TnP Backend',
  APP_VERSION: getEnv('APP_VERSION', '1.0.0'),

  // Database
  DATABASE_URL: getEnv('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/tnp_dev'),
  DATABASE_SSL: process.env.DATABASE_SSL === 'true',
  DATABASE_POOL_MIN: parseInt(getEnv('DATABASE_POOL_MIN', '2')),
  DATABASE_POOL_MAX: parseInt(getEnv('DATABASE_POOL_MAX', '10')),
  
  // Redis - IMPORTANT: Read from environment variable, use service name for Docker
  REDIS_URL: getEnv('REDIS_URL', 'redis://localhost:6379'),
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
  
  // JWT
  JWT_SECRET: getEnv('JWT_SECRET', 'dev-secret-key-change-in-production-do-not-use-in-prod'),
  JWT_REFRESH_SECRET: getEnv('JWT_REFRESH_SECRET', 'dev-refresh-secret-key-change-in-production-do-not-use-in-prod'),
  JWT_EXPIRY: getEnv('JWT_EXPIRY', '15m'),
  JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY || '7d',
  
  // AWS/S3
  AWS_REGION: process.env.AWS_REGION || 'us-east-1',
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  S3_BUCKET: process.env.S3_BUCKET || 'tnp-dev-bucket',
  CLOUDFLARE_R2_ENDPOINT: process.env.CLOUDFLARE_R2_ENDPOINT,
  
  // File uploads
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '50') * 1024 * 1024, // 50MB
  ALLOWED_FILE_TYPES: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'],
  
  // Email
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587'),
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASSWORD: process.env.SMTP_PASSWORD,
  SMTP_FROM: process.env.SMTP_FROM || 'noreply@tnp.com',
  
  // Kafka/SQS
  KAFKA_BROKERS: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'],
  AWS_SQS_QUEUE_URL: process.env.AWS_SQS_QUEUE_URL,
  
  // Elasticsearch/Meilisearch
  ELASTICSEARCH_URL: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
  MEILISEARCH_URL: process.env.MEILISEARCH_URL || 'http://localhost:7700',
  MEILISEARCH_API_KEY: process.env.MEILISEARCH_API_KEY,
  
  // Monitoring
  SENTRY_DSN: process.env.SENTRY_DSN,
  GRAFANA_URL: process.env.GRAFANA_URL,
  
  // AI Services
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  HUGGINGFACE_API_KEY: process.env.HUGGINGFACE_API_KEY,
  
  // Rate limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  
  // Feature flags
  ENABLE_GRAPHQL: process.env.ENABLE_GRAPHQL !== 'false',
  ENABLE_WEBSOCKET: process.env.ENABLE_WEBSOCKET !== 'false',
  ENABLE_EVENTS: process.env.ENABLE_EVENTS !== 'false',
  
  // Secrets Manager
  VAULT_ADDR: process.env.VAULT_ADDR,
  VAULT_TOKEN: process.env.VAULT_TOKEN,
};

// Validate required env vars (only in production or if explicitly set)
if (process.env.NODE_ENV === 'production') {
  const requiredEnvVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'S3_BUCKET',
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable in production: ${envVar}`);
    }
  }
}

// Debug logging for Redis connection
if (process.env.NODE_ENV === 'development') {
  console.error('[ENV DEBUG] REDIS_URL from process.env:', process.env.REDIS_URL);
  console.error('[ENV DEBUG] REDIS_HOST from process.env:', process.env.REDIS_HOST);
  console.error('[ENV DEBUG] REDIS_PORT from process.env:', process.env.REDIS_PORT);
  console.error('[ENV DEBUG] Final env.REDIS_URL:', env.REDIS_URL);
}

// Type assertion to ensure all string properties are actually strings
export default env as typeof env & {
  JWT_EXPIRY: string;
  JWT_REFRESH_EXPIRY: string;
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  DATABASE_URL: string;
  REDIS_URL: string;
  S3_BUCKET: string;
};
