import { trpc } from './trpc';
import { 
  syncDown, 
  syncUp, 
  getPendingSyncItems, 
  markAsSynced, 
  getDatabaseStats,
  upsertDailyEntry,
  getPendingDailyEntries,
  markDailyEntrySynced,
  markDailyEntrySyncing,
  markDailyEntrySyncError,
} from './db';

// Sync configuration
const SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // 1 second

let syncInterval: NodeJS.Timeout | null = null;
let isSyncing = false;

// Start background sync
export function startBackgroundSync(userId: string): void {
  if (syncInterval) {
    clearInterval(syncInterval);
  }

  // Initial sync
  performFullSync(userId);

  // Set up periodic sync
  syncInterval = setInterval(() => {
    performFullSync(userId);
  }, SYNC_INTERVAL);
}

// Stop background sync
export function stopBackgroundSync(): void {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
}

// Perform full sync (down then up)
export async function performFullSync(userId: string): Promise<void> {
  if (isSyncing) {
    console.log('Sync already in progress, skipping...');
    return;
  }

  isSyncing = true;
  
  try {
    console.log('Starting full sync...');
    
    // Sync down first (server -> local)
    await syncDownFromServer(userId);
    
    // Then sync up (local -> server)
    await syncUpToServer(userId);
    
    console.log('Full sync completed successfully');
  } catch (error) {
    console.error('Sync failed:', error);
  } finally {
    isSyncing = false;
  }
}

// Sync data from server to local database
async function syncDownFromServer(userId: string): Promise<void> {
  try {
    // Sync steps (these are read-only)
    const steps = await trpc.steps.list.query({});
    // TODO: Store steps in local database
    
    // Sync daily entries from server to local
    const dailyEntries = await trpc.daily.getRecent.query({ limit: 100 });
    for (const entry of dailyEntries) {
      await upsertDailyEntry({
        id: entry.id, // Use server ID as primary key if exists
        server_id: entry.id,
        user_id: userId,
        entry_date: entry.entry_date,
        cravings_intensity: entry.cravings_intensity,
        feelings: entry.feelings || [],
        triggers: entry.triggers || [],
        coping_actions: entry.coping_actions || [],
        gratitude: entry.gratitude,
        commitments: entry.commitments || [],
        notes: entry.notes,
        is_shared_with_sponsor: entry.is_shared_with_sponsor,
        created_at: entry.created_at,
        updated_at: entry.updated_at,
        synced_at: new Date().toISOString(),
        sync_status: 'synced',
      });
    }
    
    // Sync action plans
    const actionPlans = await trpc.plans.list.query({ limit: 100 });
    // TODO: Store action plans in local database
    
    // Sync routines
    const routines = await trpc.routines.list.query({ activeOnly: false, limit: 100 });
    // TODO: Store routines in local database
    
    // Sync trigger locations
    const triggerLocations = await trpc.triggers.list.query({ activeOnly: false, limit: 100 });
    // TODO: Store trigger locations in local database
    
    console.log('Sync down completed');
  } catch (error) {
    console.error('Sync down failed:', error);
    throw error;
  }
}

// Sync local changes to server
async function syncUpToServer(userId: string): Promise<void> {
  try {
    // Get pending daily entries specifically (they have dedicated functions)
    const pendingDailyEntries = await getPendingDailyEntries(userId);
    
    // Get other pending items
    const pendingItems = await getPendingSyncItems(userId);
    
    // Filter out daily_entries from general pending items (we handle them separately)
    const otherPendingItems = pendingItems.filter(item => item._table !== 'daily_entries');
    
    const totalPending = pendingDailyEntries.length + otherPendingItems.length;
    
    if (totalPending === 0) {
      console.log('No pending items to sync');
      return;
    }

    console.log(`Syncing ${totalPending} pending items (${pendingDailyEntries.length} daily entries, ${otherPendingItems.length} other)...`);

    // Sync daily entries first (they're most critical)
    for (const entry of pendingDailyEntries) {
      await syncItemToServer(entry);
    }
    
    // Then sync other items
    for (const item of otherPendingItems) {
      await syncItemToServer(item);
    }

    console.log('Sync up completed');
  } catch (error) {
    console.error('Sync up failed:', error);
    throw error;
  }
}

// Sync individual item to server
async function syncItemToServer(item: any): Promise<void> {
  const { _table, ...itemData } = item;
  
  try {
    switch (_table) {
      case 'step_entries':
        await trpc.steps.upsertEntry.mutate({
          stepId: itemData.step_id,
          version: itemData.version,
          content: JSON.parse(itemData.content || '{}'),
          is_shared_with_sponsor: Boolean(itemData.is_shared_with_sponsor),
        });
        break;
        
      case 'daily_entries':
        // Mark as syncing
        await markDailyEntrySyncing(itemData.id);
        
        try {
          const result = await trpc.daily.upsert.mutate({
            entry_date: itemData.entry_date,
            cravings_intensity: itemData.cravings_intensity,
            feelings: itemData.feelings || [],
            triggers: itemData.triggers || [],
            coping_actions: itemData.coping_actions || [],
            gratitude: itemData.gratitude || null,
            commitments: itemData.commitments || [],
            notes: itemData.notes || null,
            is_shared_with_sponsor: Boolean(itemData.is_shared_with_sponsor),
          });
          
          // Mark as synced with server ID
          if (result?.id) {
            await markDailyEntrySynced(itemData.id, result.id);
          } else {
            // If no ID returned, use entry_date to find and update
            // This handles the case where server returns existing entry
            throw new Error('No server ID returned');
          }
        } catch (error) {
          // Mark as error on failure
          await markDailyEntrySyncError(itemData.id);
          throw error;
        }
        break;
        
      case 'craving_events':
        await trpc.daily.logCraving.mutate({
          intensity: itemData.intensity,
          trigger_type: itemData.trigger_type,
          lat: itemData.lat,
          lng: itemData.lng,
          notes: itemData.notes,
          response_taken: itemData.response_taken,
        });
        break;
        
      case 'action_plans':
        if (itemData.id.startsWith('temp_')) {
          // New item - create
          await trpc.plans.create.mutate({
            title: itemData.title,
            situation: itemData.situation,
            if_then: JSON.parse(itemData.if_then || '[]'),
            checklist: JSON.parse(itemData.checklist || '[]'),
            emergency_contacts: JSON.parse(itemData.emergency_contacts || '[]'),
            is_shared_with_sponsor: Boolean(itemData.is_shared_with_sponsor),
          });
        } else {
          // Existing item - update
          await trpc.plans.update.mutate({
            planId: itemData.id,
            updates: {
              title: itemData.title,
              situation: itemData.situation,
              if_then: JSON.parse(itemData.if_then || '[]'),
              checklist: JSON.parse(itemData.checklist || '[]'),
              emergency_contacts: JSON.parse(itemData.emergency_contacts || '[]'),
              is_shared_with_sponsor: Boolean(itemData.is_shared_with_sponsor),
            },
          });
        }
        break;
        
      case 'routines':
        if (itemData.id.startsWith('temp_')) {
          // New item - create
          await trpc.routines.create.mutate({
            title: itemData.title,
            description: itemData.description,
            schedule: JSON.parse(itemData.schedule || '{}'),
            active: Boolean(itemData.active),
          });
        } else {
          // Existing item - update
          await trpc.routines.update.mutate({
            routineId: itemData.id,
            updates: {
              title: itemData.title,
              description: itemData.description,
              schedule: JSON.parse(itemData.schedule || '{}'),
              active: Boolean(itemData.active),
            },
          });
        }
        break;
        
      case 'routine_logs':
        await trpc.routines.logCompletion.mutate({
          routineId: itemData.routine_id,
          status: itemData.status,
          note: itemData.note,
        });
        break;
        
      case 'trigger_locations':
        if (itemData.id.startsWith('temp_')) {
          // New item - create
          await trpc.triggers.create.mutate({
            label: itemData.label,
            lat: itemData.lat,
            lng: itemData.lng,
            radius_m: itemData.radius_m,
            on_enter: JSON.parse(itemData.on_enter || '[]'),
            on_exit: JSON.parse(itemData.on_exit || '[]'),
            active: Boolean(itemData.active),
          });
        } else {
          // Existing item - update
          await trpc.triggers.update.mutate({
            triggerId: itemData.id,
            updates: {
              label: itemData.label,
              lat: itemData.lat,
              lng: itemData.lng,
              radius_m: itemData.radius_m,
              on_enter: JSON.parse(itemData.on_enter || '[]'),
              on_exit: JSON.parse(itemData.on_exit || '[]'),
              active: Boolean(itemData.active),
            },
          });
        }
        break;
        
      case 'notification_tokens':
        await trpc.notifications.registerToken.mutate({
          token: itemData.token,
          platform: itemData.platform,
        });
        break;
        
      default:
        console.warn(`Unknown table for sync: ${_table}`);
        return;
    }

    // Mark as synced
    await markAsSynced(_table, itemData.id);
    console.log(`Synced ${_table} item: ${itemData.id}`);
    
  } catch (error) {
    console.error(`Failed to sync ${_table} item ${itemData.id}:`, error);
    throw error;
  }
}

// Force sync now (for user-initiated sync)
export async function forceSyncNow(userId: string): Promise<void> {
  await performFullSync(userId);
}

// Get sync status
export async function getSyncStatus(userId: string): Promise<{
  isSyncing: boolean;
  pendingItems: number;
  lastSync: string | null;
  stats: any;
}> {
  const pendingItems = await getPendingSyncItems(userId);
  const stats = await getDatabaseStats(userId);
  
  return {
    isSyncing,
    pendingItems: pendingItems.length,
    lastSync: null, // TODO: Store last sync time
    stats,
  };
}

// Handle network state changes
export function handleNetworkChange(isConnected: boolean, userId: string): void {
  if (isConnected) {
    console.log('Network connected, starting sync...');
    startBackgroundSync(userId);
  } else {
    console.log('Network disconnected, stopping sync...');
    stopBackgroundSync();
  }
}

// Cleanup on app close
export function cleanup(): void {
  stopBackgroundSync();
}
