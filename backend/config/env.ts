import dotenv from 'dotenv';

dotenv.config();

export const env = {
  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000'),
  APP_NAME: 'TnP Backend',
  APP_VERSION: process.env.APP_VERSION || '1.0.0',

  // Database
  DATABASE_URL: process.env.DATABASE_URL!,
  DATABASE_SSL: process.env.DATABASE_SSL === 'true',
  DATABASE_POOL_MIN: parseInt(process.env.DATABASE_POOL_MIN || '2'),
  DATABASE_POOL_MAX: parseInt(process.env.DATABASE_POOL_MAX || '10'),
  
  // Redis
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
  JWT_EXPIRY: process.env.JWT_EXPIRY || '15m',
  JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY || '7d',
  
  // AWS/S3
  AWS_REGION: process.env.AWS_REGION || 'us-east-1',
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  S3_BUCKET: process.env.S3_BUCKET!,
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

// Validate required env vars
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'S3_BUCKET',
];

for (const envVar of requiredEnvVars) {
  if (!env[envVar as keyof typeof env]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export default env;
