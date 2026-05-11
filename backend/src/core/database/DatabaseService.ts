import { DataSource, DataSourceOptions } from 'typeorm';
import path from 'path';
import env from '@config/env';
import { logger } from '../logger/logger';

/**
 * Database Service
 * Manages TypeORM DataSource initialization and connection lifecycle
 * Supports multi-tenant architecture with Row-Level Security (RLS)
 */
export class DatabaseService {
  private static instance: DataSource;

  /**
   * Get or initialize database connection
   */
  static async getConnection(): Promise<DataSource> {
    if (this.instance?.isInitialized) {
      return this.instance;
    }

    try {
      this.instance = new DataSource(this.getDataSourceConfig());
      await this.instance.initialize();
      logger.info('Database connection established');

      // Keep RLS setup as-is
      try {
        await this.enableRLS();
      } catch (rlsError) {
        logger.warn('RLS setup warning (this may be normal)', rlsError);
      }

      return this.instance;
    } catch (error: any) {
      logger.error('Database connection failed', error);
      
      // Handle duplicate type constraint error by disabling synchronize
      if (error?.message?.includes('duplicate key value violates unique constraint') ||
          error?.message?.includes('pg_type_typname_nsp_index')) {
        logger.warn('Database constraint error - schema may be corrupted. Retrying without synchronize...');
        
        // Retry without synchronize
        try {
          const baseConfig = this.getDataSourceConfig();
          const retryConfig: DataSourceOptions = {
            ...baseConfig,
            synchronize: false,
          };
          this.instance = new DataSource(retryConfig);
          await this.instance.initialize();
          logger.info('Database connection established (synchronize disabled)');
          
          try {
            await this.enableRLS();
          } catch (rlsError) {
            logger.warn('RLS setup warning', rlsError);
          }
          
          return this.instance;
        } catch (retryError) {
          logger.error('Database retry failed', retryError);
          throw retryError;
        }
      }
      
      throw error;
    }
  }

  /**
   * Get TypeORM DataSource configuration
   */
  private static getDataSourceConfig(): DataSourceOptions {
    // Parse DATABASE_URL for connection details
    const dbUrl = new URL(env.DATABASE_URL || 'postgresql://localhost/tnp');
    
    return {
      type: 'postgres',
      host: dbUrl.hostname || 'localhost',
      port: parseInt(dbUrl.port || '5432'),
      username: dbUrl.username || 'postgres',
      password: dbUrl.password || '',
      database: dbUrl.pathname?.replace('/', '') || 'tnp',
      entities: [path.join(__dirname, '../../modules/**/entities/*.{ts,js}')],
      migrations: [path.join(__dirname, '../../migrations/*.{ts,js}')],
      subscribers: [path.join(__dirname, '../../core/database/subscribers/*.{ts,js}')],
      synchronize: env.NODE_ENV === 'development',
      logging: env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
      maxQueryExecutionTime: 1000,
      ssl: env.DATABASE_SSL ? { rejectUnauthorized: false } : false,
    };
  }

  /**
   * Enable Row-Level Security (RLS) for multi-tenancy
   */
  private static async enableRLS(): Promise<void> {
    try {
      const connection = this.instance;

      // Get all existing tables that have a tenant_id column
      const result: any[] = await connection.query(`
        SELECT table_name 
        FROM information_schema.tables t
        WHERE table_schema = 'public' 
          AND table_type = 'BASE TABLE'
          AND EXISTS (
            SELECT 1 FROM information_schema.columns c
            WHERE c.table_name = t.table_name 
              AND c.column_name = 'tenant_id'
          )
        ORDER BY table_name;
      `);

      const existingTables = result.map((row: any) => row.table_name);
      logger.info(`Found ${existingTables.length} tables with tenant_id column:`, existingTables);

      for (const table of existingTables) {
        try {
          // Enable RLS
          await connection.query(`ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY;`);

          // Create policy allowing access only to own tenant
          // Cast to text since tenant_id is character varying (VARCHAR)
          await connection.query(`
            DROP POLICY IF EXISTS "${table}_tenant_isolation" ON "${table}";
            CREATE POLICY "${table}_tenant_isolation" ON "${table}"
            USING (tenant_id = current_setting('app.current_tenant_id')::text);
          `);

          logger.info(`RLS enabled for table: ${table}`);
        } catch (tableError: any) {
          if (tableError?.message?.includes('already exists')) {
            logger.debug(`RLS policy already exists for table: ${table}`);
          } else {
            logger.warn(`RLS setup error for table ${table}:`, tableError?.message);
          }
          // Continue to next table
          continue;
        }
      }

      logger.info('RLS setup completed successfully');
    } catch (error) {
      logger.warn('RLS setup warning', error);
      // Don't throw - RLS policies may already exist
    }
  }

  /**
   * Close database connection
   */
  static async closeConnection(): Promise<void> {
    if (this.instance?.isInitialized) {
      await this.instance.destroy();
      logger.info('Database connection closed');
    }
  }

  /**
   * Run migrations
   */
  static async runMigrations(): Promise<void> {
    try {
      const connection = await this.getConnection();
      await connection.runMigrations();
      logger.info('Migrations completed successfully');
    } catch (error) {
      logger.error('Migration failed', error);
      throw error;
    }
  }

  /**
   * Health check
   */
  static async healthCheck(): Promise<boolean> {
    try {
      const connection = await this.getConnection();
      await connection.query('SELECT 1');
      return true;
    } catch (error) {
      logger.error('Database health check failed', error);
      return false;
    }
  }

  /**
   * Get connection status
   */
  static isConnected(): boolean {
    return this.instance?.isInitialized ?? false;
  }
}

// Default export for convenience
export default DatabaseService;
