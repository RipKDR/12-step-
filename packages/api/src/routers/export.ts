import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const exportRouter = router({
  // Generate complete data export for user
  generateExport: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.user.id;
      const exportData: any = {
        export_info: {
          generated_at: new Date().toISOString(),
          user_id: userId,
          version: '1.0',
        },
        profile: null,
        step_entries: [],
        daily_entries: [],
        craving_events: [],
        action_plans: [],
        routines: [],
        routine_logs: [],
        sobriety_streaks: [],
        sponsor_relationships: [],
        trigger_locations: [],
        notification_tokens: [],
        messages: [],
        risk_signals: [],
        audit_log: [],
      };

      try {
        // Get user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          throw new Error(`Failed to fetch profile: ${profileError.message}`);
        }
        exportData.profile = profile;

        // Get step entries with step details
        const { data: stepEntries, error: stepEntriesError } = await supabase
          .from('step_entries')
          .select(`
            *,
            steps (
              id,
              program,
              step_number,
              title,
              prompts
            )
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (stepEntriesError) {
          throw new Error(`Failed to fetch step entries: ${stepEntriesError.message}`);
        }
        exportData.step_entries = stepEntries || [];

        // Get daily entries
        const { data: dailyEntries, error: dailyEntriesError } = await supabase
          .from('daily_entries')
          .select('*')
          .eq('user_id', userId)
          .order('entry_date', { ascending: false });

        if (dailyEntriesError) {
          throw new Error(`Failed to fetch daily entries: ${dailyEntriesError.message}`);
        }
        exportData.daily_entries = dailyEntries || [];

        // Get craving events
        const { data: cravingEvents, error: cravingEventsError } = await supabase
          .from('craving_events')
          .select('*')
          .eq('user_id', userId)
          .order('occurred_at', { ascending: false });

        if (cravingEventsError) {
          throw new Error(`Failed to fetch craving events: ${cravingEventsError.message}`);
        }
        exportData.craving_events = cravingEvents || [];

        // Get action plans
        const { data: actionPlans, error: actionPlansError } = await supabase
          .from('action_plans')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (actionPlansError) {
          throw new Error(`Failed to fetch action plans: ${actionPlansError.message}`);
        }
        exportData.action_plans = actionPlans || [];

        // Get routines
        const { data: routines, error: routinesError } = await supabase
          .from('routines')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (routinesError) {
          throw new Error(`Failed to fetch routines: ${routinesError.message}`);
        }
        exportData.routines = routines || [];

        // Get routine logs
        const { data: routineLogs, error: routineLogsError } = await supabase
          .from('routine_logs')
          .select('*')
          .eq('user_id', userId)
          .order('run_at', { ascending: false });

        if (routineLogsError) {
          throw new Error(`Failed to fetch routine logs: ${routineLogsError.message}`);
        }
        exportData.routine_logs = routineLogs || [];

        // Get sobriety streaks
        const { data: sobrietyStreaks, error: sobrietyStreaksError } = await supabase
          .from('sobriety_streaks')
          .select('*')
          .eq('user_id', userId)
          .order('start_date', { ascending: false });

        if (sobrietyStreaksError) {
          throw new Error(`Failed to fetch sobriety streaks: ${sobrietyStreaksError.message}`);
        }
        exportData.sobriety_streaks = sobrietyStreaks || [];

        // Get sponsor relationships (both as sponsor and sponsee)
        const { data: sponsorRelationships, error: sponsorRelationshipsError } = await supabase
          .from('sponsor_relationships')
          .select(`
            *,
            sponsor:profiles!sponsor_relationships_sponsor_id_fkey(handle, display_name),
            sponsee:profiles!sponsor_relationships_sponsee_id_fkey(handle, display_name)
          `)
          .or(`sponsor_id.eq.${userId},sponsee_id.eq.${userId}`)
          .order('created_at', { ascending: false });

        if (sponsorRelationshipsError) {
          throw new Error(`Failed to fetch sponsor relationships: ${sponsorRelationshipsError.message}`);
        }
        exportData.sponsor_relationships = sponsorRelationships || [];

        // Get trigger locations
        const { data: triggerLocations, error: triggerLocationsError } = await supabase
          .from('trigger_locations')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (triggerLocationsError) {
          throw new Error(`Failed to fetch trigger locations: ${triggerLocationsError.message}`);
        }
        exportData.trigger_locations = triggerLocations || [];

        // Get notification tokens (without the actual token values for security)
        const { data: notificationTokens, error: notificationTokensError } = await supabase
          .from('notification_tokens')
          .select('id, platform, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (notificationTokensError) {
          throw new Error(`Failed to fetch notification tokens: ${notificationTokensError.message}`);
        }
        exportData.notification_tokens = notificationTokens || [];

        // Get messages (both sent and received)
        const { data: messages, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
          .order('created_at', { ascending: false });

        if (messagesError) {
          throw new Error(`Failed to fetch messages: ${messagesError.message}`);
        }
        exportData.messages = messages || [];

        // Get risk signals
        const { data: riskSignals, error: riskSignalsError } = await supabase
          .from('risk_signals')
          .select('*')
          .eq('user_id', userId)
          .order('scored_at', { ascending: false });

        if (riskSignalsError) {
          throw new Error(`Failed to fetch risk signals: ${riskSignalsError.message}`);
        }
        exportData.risk_signals = riskSignals || [];

        // Get audit log
        const { data: auditLog, error: auditLogError } = await supabase
          .from('audit_log')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (auditLogError) {
          throw new Error(`Failed to fetch audit log: ${auditLogError.message}`);
        }
        exportData.audit_log = auditLog || [];

        // Log the export action
        await supabase
          .from('audit_log')
          .insert({
            user_id: userId,
            action: 'data_export',
            meta: {
              export_size: JSON.stringify(exportData).length,
              tables_exported: Object.keys(exportData).length - 1, // -1 for export_info
            },
          });

        return exportData;

      } catch (error) {
        // Log the export error
        await supabase
          .from('audit_log')
          .insert({
            user_id: userId,
            action: 'data_export_error',
            meta: {
              error: error instanceof Error ? error.message : 'Unknown error',
            },
          });

        throw error;
      }
    }),

  // Delete user account and all associated data
  deleteAccount: protectedProcedure
    .input(z.object({
      confirmation: z.string().regex(/^DELETE MY ACCOUNT$/, 'Confirmation text must be exactly "DELETE MY ACCOUNT"'),
    }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id;

      try {
        // Log the deletion action before starting
        await supabase
          .from('audit_log')
          .insert({
            user_id: userId,
            action: 'account_deletion_started',
            meta: {
              confirmation: input.confirmation,
              timestamp: new Date().toISOString(),
            },
          });

        // Delete all user data (RLS policies will handle the cascade)
        // We'll delete in reverse dependency order to avoid foreign key constraints

        // Delete notification tokens
        await supabase
          .from('notification_tokens')
          .delete()
          .eq('user_id', userId);

        // Delete routine logs
        await supabase
          .from('routine_logs')
          .delete()
          .eq('user_id', userId);

        // Delete routines
        await supabase
          .from('routines')
          .delete()
          .eq('user_id', userId);

        // Delete trigger locations
        await supabase
          .from('trigger_locations')
          .delete()
          .eq('user_id', userId);

        // Delete action plans
        await supabase
          .from('action_plans')
          .delete()
          .eq('user_id', userId);

        // Delete craving events
        await supabase
          .from('craving_events')
          .delete()
          .eq('user_id', userId);

        // Delete daily entries
        await supabase
          .from('daily_entries')
          .delete()
          .eq('user_id', userId);

        // Delete step entries
        await supabase
          .from('step_entries')
          .delete()
          .eq('user_id', userId);

        // Delete sobriety streaks
        await supabase
          .from('sobriety_streaks')
          .delete()
          .eq('user_id', userId);

        // Delete sponsor relationships (both as sponsor and sponsee)
        await supabase
          .from('sponsor_relationships')
          .delete()
          .or(`sponsor_id.eq.${userId},sponsee_id.eq.${userId}`);

        // Delete messages (both sent and received)
        await supabase
          .from('messages')
          .delete()
          .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`);

        // Delete risk signals
        await supabase
          .from('risk_signals')
          .delete()
          .eq('user_id', userId);

        // Delete profile
        await supabase
          .from('profiles')
          .delete()
          .eq('user_id', userId);

        // Log successful deletion
        await supabase
          .from('audit_log')
          .insert({
            user_id: userId,
            action: 'account_deletion_completed',
            meta: {
              deleted_at: new Date().toISOString(),
            },
          });

        return {
          success: true,
          message: 'Account and all associated data have been permanently deleted',
          deleted_at: new Date().toISOString(),
        };

      } catch (error) {
        // Log the deletion error
        await supabase
          .from('audit_log')
          .insert({
            user_id: userId,
            action: 'account_deletion_error',
            meta: {
              error: error instanceof Error ? error.message : 'Unknown error',
              timestamp: new Date().toISOString(),
            },
          });

        throw new Error(`Failed to delete account: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }),

  // Get export status/history
  getExportHistory: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(50).default(10),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input, ctx }) => {
      const { data, error } = await supabase
        .from('audit_log')
        .select('*')
        .eq('user_id', ctx.user.id)
        .in('action', ['data_export', 'data_export_error', 'account_deletion_started', 'account_deletion_completed', 'account_deletion_error'])
        .order('created_at', { ascending: false })
        .range(input.offset, input.offset + input.limit - 1);

      if (error) {
        throw new Error(`Failed to fetch export history: ${error.message}`);
      }

      return data;
    }),

  // Get data summary (for privacy dashboard)
  getDataSummary: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.user.id;

      try {
        // Get counts for each data type
        const [
          profileCount,
          stepEntriesCount,
          dailyEntriesCount,
          cravingEventsCount,
          actionPlansCount,
          routinesCount,
          routineLogsCount,
          sobrietyStreaksCount,
          sponsorRelationshipsCount,
          triggerLocationsCount,
          messagesCount,
          riskSignalsCount,
        ] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact' }).eq('user_id', userId),
          supabase.from('step_entries').select('id', { count: 'exact' }).eq('user_id', userId),
          supabase.from('daily_entries').select('id', { count: 'exact' }).eq('user_id', userId),
          supabase.from('craving_events').select('id', { count: 'exact' }).eq('user_id', userId),
          supabase.from('action_plans').select('id', { count: 'exact' }).eq('user_id', userId),
          supabase.from('routines').select('id', { count: 'exact' }).eq('user_id', userId),
          supabase.from('routine_logs').select('id', { count: 'exact' }).eq('user_id', userId),
          supabase.from('sobriety_streaks').select('id', { count: 'exact' }).eq('user_id', userId),
          supabase.from('sponsor_relationships').select('id', { count: 'exact' }).or(`sponsor_id.eq.${userId},sponsee_id.eq.${userId}`),
          supabase.from('trigger_locations').select('id', { count: 'exact' }).eq('user_id', userId),
          supabase.from('messages').select('id', { count: 'exact' }).or(`sender_id.eq.${userId},recipient_id.eq.${userId}`),
          supabase.from('risk_signals').select('id', { count: 'exact' }).eq('user_id', userId),
        ]);

        return {
          profile: profileCount.count || 0,
          step_entries: stepEntriesCount.count || 0,
          daily_entries: dailyEntriesCount.count || 0,
          craving_events: cravingEventsCount.count || 0,
          action_plans: actionPlansCount.count || 0,
          routines: routinesCount.count || 0,
          routine_logs: routineLogsCount.count || 0,
          sobriety_streaks: sobrietyStreaksCount.count || 0,
          sponsor_relationships: sponsorRelationshipsCount.count || 0,
          trigger_locations: triggerLocationsCount.count || 0,
          messages: messagesCount.count || 0,
          risk_signals: riskSignalsCount.count || 0,
          total_records: [
            profileCount.count || 0,
            stepEntriesCount.count || 0,
            dailyEntriesCount.count || 0,
            cravingEventsCount.count || 0,
            actionPlansCount.count || 0,
            routinesCount.count || 0,
            routineLogsCount.count || 0,
            sobrietyStreaksCount.count || 0,
            sponsorRelationshipsCount.count || 0,
            triggerLocationsCount.count || 0,
            messagesCount.count || 0,
            riskSignalsCount.count || 0,
          ].reduce((a, b) => a + b, 0),
        };

      } catch (error) {
        throw new Error(`Failed to fetch data summary: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }),

  // Request data portability (GDPR compliance)
  requestPortability: protectedProcedure
    .mutation(async ({ ctx }) => {
      const userId = ctx.user.id;

      // Log the portability request
      await supabase
        .from('audit_log')
        .insert({
          user_id: userId,
          action: 'data_portability_request',
          meta: {
            requested_at: new Date().toISOString(),
            gdpr_compliant: true,
          },
        });

      return {
        success: true,
        message: 'Data portability request logged. Use the generateExport endpoint to download your data.',
        request_id: `portability_${userId}_${Date.now()}`,
      };
    }),
});
