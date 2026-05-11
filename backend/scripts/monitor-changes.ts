/**
 * Real-Time Database Change Monitor
 * Logs all database changes with timestamps and details
 * 
 * Usage: npx ts-node scripts/monitor-changes.ts
 */

import fs from 'fs';
import path from 'path';

const logFile = path.join(__dirname, '../logs/database-changes.log');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

export function logDatabaseChange(data: {
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  module: string;
  recordId: string;
  changes?: Record<string, any>;
  changedBy?: string;
  timestamp?: Date;
}): void {
  const timestamp = data.timestamp || new Date();
  const logEntry = {
    timestamp: timestamp.toISOString(),
    action: data.action,
    module: data.module,
    recordId: data.recordId,
    changedBy: data.changedBy || 'SYSTEM',
    changes: data.changes || {},
  };

  const logLine = JSON.stringify(logEntry) + '\n';

  // Append to file
  fs.appendFileSync(logFile, logLine);

  // Also log to console
  const emoji = 
    data.action === 'CREATE' ? '✨' :
    data.action === 'UPDATE' ? '📝' : '🗑️';

  console.log(`${emoji} [${timestamp.toLocaleTimeString()}] ${data.action} ${data.module} #${data.recordId}`);
  if (data.changes) {
    console.log('   Changes:', data.changes);
  }
}

export function getDatabaseChanges(options?: {
  module?: string;
  action?: string;
  startTime?: Date;
  endTime?: Date;
}): any[] {
  if (!fs.existsSync(logFile)) {
    return [];
  }

  const content = fs.readFileSync(logFile, 'utf-8');
  let changes = content
    .split('\n')
    .filter(line => line.trim())
    .map(line => JSON.parse(line));

  // Apply filters
  if (options?.module) {
    changes = changes.filter(c => c.module === options.module);
  }
  if (options?.action) {
    changes = changes.filter(c => c.action === options.action);
  }
  if (options?.startTime) {
    changes = changes.filter(c => new Date(c.timestamp) >= options.startTime!);
  }
  if (options?.endTime) {
    changes = changes.filter(c => new Date(c.timestamp) <= options.endTime!);
  }

  return changes;
}

export function printChangeReport(options?: any): void {
  const changes = getDatabaseChanges(options);

  console.log('\n📊 DATABASE CHANGE REPORT');
  console.log('========================\n');

  if (changes.length === 0) {
    console.log('✅ No changes recorded');
    return;
  }

  // Group by module
  const byModule: Record<string, any[]> = {};
  changes.forEach(change => {
    if (!byModule[change.module]) {
      byModule[change.module] = [];
    }
    byModule[change.module].push(change);
  });

  // Print summary
  Object.entries(byModule).forEach(([module, moduleChanges]) => {
    const creates = moduleChanges.filter(c => c.action === 'CREATE').length;
    const updates = moduleChanges.filter(c => c.action === 'UPDATE').length;
    const deletes = moduleChanges.filter(c => c.action === 'DELETE').length;

    console.log(`${module}:`);
    console.log(`  ✨ Created: ${creates}`);
    console.log(`  📝 Updated: ${updates}`);
    console.log(`  🗑️  Deleted: ${deletes}`);
    console.log();
  });

  // Print recent changes
  console.log('📝 RECENT CHANGES (Last 10):');
  console.log('---------------------------');
  changes.slice(-10).reverse().forEach(change => {
    console.log(`${change.timestamp} | ${change.action} ${change.module} #${change.recordId}`);
  });
}

if (require.main === module) {
  printChangeReport();
}
