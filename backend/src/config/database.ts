import { DataSource } from 'typeorm';
import env from './env';
import path from 'path';

/**
 * TypeORM Data Source Configuration
 * - Multi-tenant support with Row-Level Security
 * - Read replicas for scaling
 * - Connection pooling
 * - Automatic migrations
 */
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'tnp_prod',
  
  // Connection pooling
  poolSize: env.DATABASE_POOL_MAX,
  maxQueryExecutionTime: 60000, // 60s slow query log
  
  // SSL for production
  ssl: env.DATABASE_SSL ? { rejectUnauthorized: false } : false,
  
  // Entities & migrations
  entities: [path.join(__dirname, '../modules/*/entities/*.entity.ts')],
  migrations: [path.join(__dirname, '../../migrations/*.ts')],
  subscribers: [path.join(__dirname, '../**/*.subscriber.ts')],
  
  // Development settings
  synchronize: false, // Use migrations instead
  logging: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
  logger: 'advanced-console',
});

/**
 * Read Replica Connection (for analytics, reporting)
 * Async replication acceptable (100-500ms lag)
 */
export const ReadReplicaDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_READ_REPLICA_HOST || process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_READ_REPLICA_PORT || process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'tnp_prod',
  
  poolSize: 5, // Smaller pool for read-only
  ssl: env.DATABASE_SSL ? { rejectUnauthorized: false } : false,
  
  synchronize: false,
  logging: false,
});

/**
 * Initialize Row-Level Security Policies
 * Every table has tenant_id and RLS is enforced
 */
export async function initializeRLS() {
  const dataSource = AppDataSource;
  
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }

  const queryRunner = dataSource.createQueryRunner();

  try {
    // Enable RLS on all tables
    const tables = [
      'users', 'user_roles', 'permissions', 'organizations',
      'students', 'companies', 'recruiters',
      'jobs', 'applications', 'interviews', 'offers',
      'resumes', 'audit_logs', 'sessions',
    ];

    for (const table of tables) {
      // Check if table exists
      const tableExists = await queryRunner.query(
        `SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = $1)`,
        [table]
      );

      if (tableExists[0].exists) {
        // Enable RLS
        await queryRunner.query(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`);

        // Create policy if not exists
        const policyName = `${table}_tenant_isolation`;
        await queryRunner.query(`
          DROP POLICY IF EXISTS ${policyName} ON ${table};
          CREATE POLICY ${policyName} ON ${table}
          USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
        `);
      }
    }

    console.log('✅ Row-Level Security initialized');
  } catch (error) {
    console.error('❌ RLS initialization failed:', error);
    throw error;
  } finally {
    await queryRunner.release();
  }
}

/**
 * Set tenant context for current request
 * Call this in middleware/request handler
 */
export async function setTenantContext(dataSource: DataSource, tenantId: string) {
  const queryRunner = dataSource.createQueryRunner();
  try {
    await queryRunner.query(`SET app.current_tenant_id = $1`, [tenantId]);
  } finally {
    await queryRunner.release();
  }
}

/**
 * Get current tenant context
 */
export async function getCurrentTenantContext(dataSource: DataSource): Promise<string> {
  const result = await dataSource.query(`SELECT current_setting('app.current_tenant_id') as tenant_id`);
  return result[0]?.tenant_id;
}

export default AppDataSource;
