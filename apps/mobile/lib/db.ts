import * as SQLite from 'expo-sqlite';
import { Database } from '@repo/types';

// Database instance
let db: SQLite.SQLiteDatabase | null = null;

// Initialize SQLite database
export async function initDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) {
    return db;
  }

  db = await SQLite.openDatabaseAsync('recovery_companion.db');
  
  // Create tables
  await createTables();
  
  return db;
}

// Create all tables matching Supabase schema
async function createTables(): Promise<void> {
  if (!db) throw new Error('Database not initialized');

  // Enable foreign keys
  await db.execAsync('PRAGMA foreign_keys = ON;');

  // Profiles table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS profiles (
      user_id TEXT PRIMARY KEY,
      handle TEXT UNIQUE,
      display_name TEXT,
      timezone TEXT DEFAULT 'UTC',
      avatar_url TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Steps table (read-only, synced from server)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS steps (
      id TEXT PRIMARY KEY,
      program TEXT NOT NULL CHECK (program IN ('NA', 'AA')),
      step_number INTEGER NOT NULL CHECK (step_number BETWEEN 1 AND 12),
      title TEXT NOT NULL,
      prompts TEXT NOT NULL DEFAULT '[]', -- JSON string
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(program, step_number)
    );
  `);

  // Step entries table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS step_entries (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      step_id TEXT NOT NULL,
      version INTEGER NOT NULL DEFAULT 1,
      content TEXT NOT NULL DEFAULT '{}', -- JSON string
      is_shared_with_sponsor INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      synced_at TEXT, -- When last synced to server
      UNIQUE(user_id, step_id, version),
      FOREIGN KEY (step_id) REFERENCES steps (id) ON DELETE CASCADE
    );
  `);

  // Daily entries table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS daily_entries (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      entry_date TEXT NOT NULL,
      cravings_intensity INTEGER CHECK (cravings_intensity BETWEEN 0 AND 10),
      feelings TEXT, -- JSON string
      triggers TEXT, -- JSON string
      coping_actions TEXT, -- JSON string
      gratitude TEXT,
      commitments TEXT, -- JSON string
      notes TEXT,
      is_shared_with_sponsor INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      synced_at TEXT,
      sync_status TEXT CHECK (sync_status IN ('pending', 'syncing', 'synced', 'error')) DEFAULT 'pending',
      server_id TEXT, -- UUID from Supabase after sync
      UNIQUE(user_id, entry_date)
    );
  `);
  
  // Migration: Add sync_status and server_id columns if they don't exist
  // SQLite doesn't support IF NOT EXISTS for ALTER TABLE, so we catch errors
  try {
    await db.execAsync(`ALTER TABLE daily_entries ADD COLUMN sync_status TEXT CHECK (sync_status IN ('pending', 'syncing', 'synced', 'error')) DEFAULT 'pending';`);
  } catch (e) {
    // Column already exists, ignore
  }
  try {
    await db.execAsync(`ALTER TABLE daily_entries ADD COLUMN server_id TEXT;`);
  } catch (e) {
    // Column already exists, ignore
  }

  // Craving events table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS craving_events (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      occurred_at TEXT NOT NULL DEFAULT (datetime('now')),
      intensity INTEGER CHECK (intensity BETWEEN 0 AND 10),
      trigger_type TEXT,
      lat REAL,
      lng REAL,
      notes TEXT,
      response_taken TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      synced_at TEXT
    );
  `);

  // Action plans table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS action_plans (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      situation TEXT,
      if_then TEXT NOT NULL DEFAULT '[]', -- JSON string
      checklist TEXT NOT NULL DEFAULT '[]', -- JSON string
      emergency_contacts TEXT NOT NULL DEFAULT '[]', -- JSON string
      is_shared_with_sponsor INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      synced_at TEXT
    );
  `);

  // Routines table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS routines (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      schedule TEXT NOT NULL, -- JSON string
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      synced_at TEXT
    );
  `);

  // Routine logs table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS routine_logs (
      id TEXT PRIMARY KEY,
      routine_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      run_at TEXT NOT NULL DEFAULT (datetime('now')),
      status TEXT CHECK (status IN ('sent', 'completed', 'skipped')),
      note TEXT,
      synced_at TEXT,
      FOREIGN KEY (routine_id) REFERENCES routines (id) ON DELETE CASCADE
    );
  `);

  // Sobriety streaks table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS sobriety_streaks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT,
      relapse_note TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      synced_at TEXT
    );
  `);

  // Sponsor relationships table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS sponsor_relationships (
      id TEXT PRIMARY KEY,
      sponsor_id TEXT NOT NULL,
      sponsee_id TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'revoked')) DEFAULT 'pending',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      synced_at TEXT,
      UNIQUE (sponsor_id, sponsee_id)
    );
  `);

  // Trigger locations table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS trigger_locations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      label TEXT NOT NULL,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      radius_m INTEGER NOT NULL DEFAULT 100,
      on_enter TEXT DEFAULT '[]', -- JSON string
      on_exit TEXT DEFAULT '[]', -- JSON string
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      synced_at TEXT
    );
  `);

  // Notification tokens table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS notification_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token TEXT NOT NULL,
      platform TEXT CHECK (platform IN ('ios', 'android', 'web')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      synced_at TEXT,
      UNIQUE (user_id, token)
    );
  `);

  // Create indexes for better performance
  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_step_entries_user_step ON step_entries(user_id, step_id);
    CREATE INDEX IF NOT EXISTS idx_daily_entries_user_date ON daily_entries(user_id, entry_date);
    CREATE INDEX IF NOT EXISTS idx_craving_events_user_time ON craving_events(user_id, occurred_at);
    CREATE INDEX IF NOT EXISTS idx_trigger_locations_user ON trigger_locations(user_id);
    CREATE INDEX IF NOT EXISTS idx_routine_logs_user ON routine_logs(user_id);
  `);
}

// Sync data from server to local database
export async function syncDown(userId: string): Promise<void> {
  if (!db) throw new Error('Database not initialized');

  // This would typically make API calls to fetch data from Supabase
  // For now, we'll implement a basic structure
  console.log('Syncing data from server...');
  
  // TODO: Implement actual sync logic with tRPC calls
  // This would involve:
  // 1. Fetching data from each table via tRPC
  // 2. Upserting into local SQLite
  // 3. Handling conflicts (server wins)
  // 4. Updating synced_at timestamps
}

// Sync local changes to server
export async function syncUp(userId: string): Promise<void> {
  if (!db) throw new Error('Database not initialized');

  console.log('Syncing local changes to server...');
  
  // TODO: Implement actual sync logic
  // This would involve:
  // 1. Finding records where synced_at is NULL
  // 2. Sending them to server via tRPC mutations
  // 3. Updating synced_at on success
  // 4. Handling conflicts and retries
}

// Get daily entry from local database
export async function getDailyEntry(userId: string, date: string): Promise<any | null> {
  if (!db) throw new Error('Database not initialized');

  const result = await db.getFirstAsync(`
    SELECT * FROM daily_entries 
    WHERE user_id = ? AND entry_date = ?
  `, [userId, date]);

  if (!result) return null;

  // Parse JSON fields
  return {
    ...result,
    feelings: result.feelings ? JSON.parse(result.feelings) : [],
    triggers: result.triggers ? JSON.parse(result.triggers) : [],
    coping_actions: result.coping_actions ? JSON.parse(result.coping_actions) : [],
    commitments: result.commitments ? JSON.parse(result.commitments) : [],
    is_shared_with_sponsor: Boolean(result.is_shared_with_sponsor),
  };
}

// Upsert daily entry to local database
// If entry doesn't have server_id, it's a local entry and will be synced later
export async function upsertDailyEntry(entry: any): Promise<void> {
  if (!db) throw new Error('Database not initialized');

  // Determine sync status
  let syncStatus = entry.sync_status || 'pending';
  if (entry.server_id) {
    // Entry already synced before
    syncStatus = entry.synced_at ? 'synced' : 'pending';
  } else if (!entry.id?.startsWith('temp_')) {
    // Entry has non-temp ID but no server_id means it needs sync
    syncStatus = 'pending';
  }

  const localId = entry.id || `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  await db.runAsync(`
    INSERT OR REPLACE INTO daily_entries (
      id, user_id, entry_date, cravings_intensity, feelings, triggers,
      coping_actions, gratitude, commitments, notes, is_shared_with_sponsor,
      created_at, updated_at, synced_at, sync_status, server_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    localId,
    entry.user_id,
    entry.entry_date,
    entry.cravings_intensity ?? null,
    JSON.stringify(entry.feelings || []),
    JSON.stringify(entry.triggers || []),
    JSON.stringify(entry.coping_actions || []),
    entry.gratitude || null,
    JSON.stringify(entry.commitments || []),
    entry.notes || null,
    entry.is_shared_with_sponsor ? 1 : 0,
    entry.created_at || new Date().toISOString(),
    entry.updated_at || new Date().toISOString(),
    entry.synced_at || null,
    syncStatus,
    entry.server_id || null,
  ]);
}

// Mark daily entry as synced
export async function markDailyEntrySynced(localId: string, serverId: string): Promise<void> {
  if (!db) throw new Error('Database not initialized');

  await db.runAsync(`
    UPDATE daily_entries 
    SET sync_status = 'synced', 
        server_id = ?,
        synced_at = datetime('now')
    WHERE id = ?
  `, [serverId, localId]);
}

// Mark daily entry as syncing
export async function markDailyEntrySyncing(localId: string): Promise<void> {
  if (!db) throw new Error('Database not initialized');

  await db.runAsync(`
    UPDATE daily_entries 
    SET sync_status = 'syncing'
    WHERE id = ?
  `, [localId]);
}

// Mark daily entry sync error
export async function markDailyEntrySyncError(localId: string): Promise<void> {
  if (!db) throw new Error('Database not initialized');

  await db.runAsync(`
    UPDATE daily_entries 
    SET sync_status = 'error'
    WHERE id = ?
  `, [localId]);
}

// Get pending daily entries for sync
export async function getPendingDailyEntries(userId: string): Promise<any[]> {
  if (!db) throw new Error('Database not initialized');

  const results = await db.getAllAsync(`
    SELECT * FROM daily_entries 
    WHERE user_id = ? AND sync_status = 'pending'
    ORDER BY created_at ASC
  `, [userId]);

  return results.map((row: any) => ({
    ...row,
    feelings: row.feelings ? JSON.parse(row.feelings) : [],
    triggers: row.triggers ? JSON.parse(row.triggers) : [],
    coping_actions: row.coping_actions ? JSON.parse(row.coping_actions) : [],
    commitments: row.commitments ? JSON.parse(row.commitments) : [],
    is_shared_with_sponsor: Boolean(row.is_shared_with_sponsor),
    _table: 'daily_entries', // For sync routing
  }));
}

// Get steps from local database
export async function getSteps(program?: 'NA' | 'AA'): Promise<any[]> {
  if (!db) throw new Error('Database not initialized');

  let query = 'SELECT * FROM steps ORDER BY step_number';
  const params: any[] = [];

  if (program) {
    query += ' WHERE program = ?';
    params.push(program);
  }

  const result = await db.getAllAsync(query, params);
  return result.map(step => ({
    ...step,
    prompts: JSON.parse(step.prompts || '[]'),
  }));
}

// Upsert step entry to local database
export async function upsertStepEntry(entry: any): Promise<void> {
  if (!db) throw new Error('Database not initialized');

  await db.runAsync(`
    INSERT OR REPLACE INTO step_entries (
      id, user_id, step_id, version, content, is_shared_with_sponsor,
      created_at, updated_at, synced_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    entry.id,
    entry.user_id,
    entry.step_id,
    entry.version,
    JSON.stringify(entry.content || {}),
    entry.is_shared_with_sponsor ? 1 : 0,
    entry.created_at || new Date().toISOString(),
    entry.updated_at || new Date().toISOString(),
    entry.synced_at || null,
  ]);
}

// Get action plans from local database
export async function getActionPlans(userId: string): Promise<any[]> {
  if (!db) throw new Error('Database not initialized');

  const result = await db.getAllAsync(`
    SELECT * FROM action_plans 
    WHERE user_id = ? 
    ORDER BY created_at DESC
  `, [userId]);

  return result.map(plan => ({
    ...plan,
    if_then: JSON.parse(plan.if_then || '[]'),
    checklist: JSON.parse(plan.checklist || '[]'),
    emergency_contacts: JSON.parse(plan.emergency_contacts || '[]'),
  }));
}

// Upsert action plan to local database
export async function upsertActionPlan(plan: any): Promise<void> {
  if (!db) throw new Error('Database not initialized');

  await db.runAsync(`
    INSERT OR REPLACE INTO action_plans (
      id, user_id, title, situation, if_then, checklist,
      emergency_contacts, is_shared_with_sponsor,
      created_at, updated_at, synced_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    plan.id,
    plan.user_id,
    plan.title,
    plan.situation,
    JSON.stringify(plan.if_then || []),
    JSON.stringify(plan.checklist || []),
    JSON.stringify(plan.emergency_contacts || []),
    plan.is_shared_with_sponsor ? 1 : 0,
    plan.created_at || new Date().toISOString(),
    plan.updated_at || new Date().toISOString(),
    plan.synced_at || null,
  ]);
}

// Get routines from local database
export async function getRoutines(userId: string, activeOnly: boolean = true): Promise<any[]> {
  if (!db) throw new Error('Database not initialized');

  let query = 'SELECT * FROM routines WHERE user_id = ?';
  const params: any[] = [userId];

  if (activeOnly) {
    query += ' AND active = 1';
  }

  query += ' ORDER BY created_at DESC';

  const result = await db.getAllAsync(query, params);
  return result.map(routine => ({
    ...routine,
    schedule: JSON.parse(routine.schedule || '{}'),
  }));
}

// Upsert routine to local database
export async function upsertRoutine(routine: any): Promise<void> {
  if (!db) throw new Error('Database not initialized');

  await db.runAsync(`
    INSERT OR REPLACE INTO routines (
      id, user_id, title, description, schedule, active,
      created_at, synced_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    routine.id,
    routine.user_id,
    routine.title,
    routine.description,
    JSON.stringify(routine.schedule || {}),
    routine.active ? 1 : 0,
    routine.created_at || new Date().toISOString(),
    routine.synced_at || null,
  ]);
}

// Get trigger locations from local database
export async function getTriggerLocations(userId: string, activeOnly: boolean = true): Promise<any[]> {
  if (!db) throw new Error('Database not initialized');

  let query = 'SELECT * FROM trigger_locations WHERE user_id = ?';
  const params: any[] = [userId];

  if (activeOnly) {
    query += ' AND active = 1';
  }

  query += ' ORDER BY created_at DESC';

  const result = await db.getAllAsync(query, params);
  return result.map(trigger => ({
    ...trigger,
    on_enter: JSON.parse(trigger.on_enter || '[]'),
    on_exit: JSON.parse(trigger.on_exit || '[]'),
  }));
}

// Upsert trigger location to local database
export async function upsertTriggerLocation(trigger: any): Promise<void> {
  if (!db) throw new Error('Database not initialized');

  await db.runAsync(`
    INSERT OR REPLACE INTO trigger_locations (
      id, user_id, label, lat, lng, radius_m, on_enter, on_exit, active,
      created_at, synced_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    trigger.id,
    trigger.user_id,
    trigger.label,
    trigger.lat,
    trigger.lng,
    trigger.radius_m,
    JSON.stringify(trigger.on_enter || []),
    JSON.stringify(trigger.on_exit || []),
    trigger.active ? 1 : 0,
    trigger.created_at || new Date().toISOString(),
    trigger.synced_at || null,
  ]);
}

// Get pending sync items (records that need to be synced to server)
export async function getPendingSyncItems(userId: string): Promise<any[]> {
  if (!db) throw new Error('Database not initialized');

  const tables = [
    'step_entries',
    'daily_entries',
    'craving_events',
    'action_plans',
    'routines',
    'routine_logs',
    'sobriety_streaks',
    'sponsor_relationships',
    'trigger_locations',
    'notification_tokens',
  ];

  const pendingItems: any[] = [];

  for (const table of tables) {
    const result = await db.getAllAsync(`
      SELECT * FROM ${table} 
      WHERE user_id = ? AND synced_at IS NULL
    `, [userId]);

    pendingItems.push(...result.map(item => ({ ...item, _table: table })));
  }

  return pendingItems;
}

// Mark item as synced
export async function markAsSynced(table: string, id: string): Promise<void> {
  if (!db) throw new Error('Database not initialized');

  await db.runAsync(`
    UPDATE ${table} 
    SET synced_at = ? 
    WHERE id = ?
  `, [new Date().toISOString(), id]);
}

// Clear all data for user (for logout)
export async function clearUserData(userId: string): Promise<void> {
  if (!db) throw new Error('Database not initialized');

  const tables = [
    'step_entries',
    'daily_entries',
    'craving_events',
    'action_plans',
    'routines',
    'routine_logs',
    'sobriety_streaks',
    'sponsor_relationships',
    'trigger_locations',
    'notification_tokens',
  ];

  for (const table of tables) {
    await db.runAsync(`DELETE FROM ${table} WHERE user_id = ?`, [userId]);
  }
}

// Get database statistics
export async function getDatabaseStats(userId: string): Promise<any> {
  if (!db) throw new Error('Database not initialized');

  const stats: any = {};

  const tables = [
    'step_entries',
    'daily_entries',
    'craving_events',
    'action_plans',
    'routines',
    'routine_logs',
    'sobriety_streaks',
    'sponsor_relationships',
    'trigger_locations',
    'notification_tokens',
  ];

  for (const table of tables) {
    const result = await db.getFirstAsync(`
      SELECT COUNT(*) as count FROM ${table} WHERE user_id = ?
    `, [userId]);
    stats[table] = result?.count || 0;
  }

  // Get pending sync count
  const pendingResult = await db.getFirstAsync(`
    SELECT COUNT(*) as count FROM step_entries 
    WHERE user_id = ? AND synced_at IS NULL
  `, [userId]);
  stats.pending_sync = pendingResult?.count || 0;

  return stats;
}
