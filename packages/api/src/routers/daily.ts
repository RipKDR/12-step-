import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { createClient } from '@supabase/supabase-js';
import { DailyEntrySchema, CravingEventSchema, CreateDailyEntryInput, UpdateDailyEntryInput, CreateCravingEventInput, WeeklySummary } from '@repo/types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const dailyRouter = router({
  // Get daily entry for specific date
  getByDate: protectedProcedure
    .input(z.object({
      date: z.string(), // YYYY-MM-DD format
    }))
    .query(async ({ input, ctx }) => {
      const { data, error } = await supabase
        .from('daily_entries')
        .select('*')
        .eq('user_id', ctx.user.id)
        .eq('entry_date', input.date)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw new Error(`Failed to fetch daily entry: ${error.message}`);
      }

      return data;
    }),

  // Get recent daily entries (last 30 days)
  getRecent: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(30),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input, ctx }) => {
      const { data, error } = await supabase
        .from('daily_entries')
        .select('*')
        .eq('user_id', ctx.user.id)
        .order('entry_date', { ascending: false })
        .range(input.offset, input.offset + input.limit - 1);

      if (error) {
        throw new Error(`Failed to fetch recent daily entries: ${error.message}`);
      }

      return data;
    }),

  // Create or update daily entry
  upsert: protectedProcedure
    .input(DailyEntrySchema.omit({ id: true, created_at: true, updated_at: true }).extend({
      entry_date: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { data, error } = await supabase
        .from('daily_entries')
        .upsert({
          user_id: ctx.user.id,
          ...input,
        }, {
          onConflict: 'user_id,entry_date',
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to upsert daily entry: ${error.message}`);
      }

      return data;
    }),

  // Quick craving event log
  logCraving: protectedProcedure
    .input(CravingEventSchema.omit({ id: true, user_id: true, occurred_at: true, created_at: true }).extend({
      intensity: z.number().min(0).max(10),
      trigger_type: z.string().optional(),
      lat: z.number().optional(),
      lng: z.number().optional(),
      notes: z.string().optional(),
      response_taken: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { data, error } = await supabase
        .from('craving_events')
        .insert({
          user_id: ctx.user.id,
          ...input,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to log craving event: ${error.message}`);
      }

      return data;
    }),

  // Get weekly summary for check-in card
  getWeeklySummary: protectedProcedure
    .input(z.object({
      weekStart: z.string(), // YYYY-MM-DD format
      weekEnd: z.string(), // YYYY-MM-DD format
    }))
    .query(async ({ input, ctx }) => {
      // Get daily entries for the week
      const { data: entries, error: entriesError } = await supabase
        .from('daily_entries')
        .select('entry_date, cravings_intensity, feelings, triggers, coping_actions')
        .eq('user_id', ctx.user.id)
        .gte('entry_date', input.weekStart)
        .lte('entry_date', input.weekEnd)
        .order('entry_date', { ascending: true });

      if (entriesError) {
        throw new Error(`Failed to fetch weekly entries: ${entriesError.message}`);
      }

      // Get routine completions for the week
      const { data: routineLogs, error: routineError } = await supabase
        .from('routine_logs')
        .select(`
          status,
          routines (
            title
          )
        `)
        .eq('user_id', ctx.user.id)
        .gte('run_at', input.weekStart)
        .lte('run_at', input.weekEnd);

      if (routineError) {
        throw new Error(`Failed to fetch routine logs: ${routineError.message}`);
      }

      // Calculate statistics
      const cravings = entries?.map(e => e.cravings_intensity).filter(c => c !== null) || [];
      const avgCravings = cravings.length > 0 ? cravings.reduce((a, b) => a + b, 0) / cravings.length : 0;

      // Count feelings
      const allFeelings = entries?.flatMap(e => e.feelings || []) || [];
      const feelingCounts = allFeelings.reduce((acc, feeling) => {
        acc[feeling] = (acc[feeling] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      const topFeelings = Object.entries(feelingCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([feeling]) => feeling);

      // Count triggers
      const allTriggers = entries?.flatMap(e => e.triggers || []).map(t => t.type) || [];
      const triggerCounts = allTriggers.reduce((acc, trigger) => {
        acc[trigger] = (acc[trigger] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      const topTriggers = Object.entries(triggerCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([trigger]) => trigger);

      // Count routine completions
      const completedRoutines = routineLogs?.filter(r => r.status === 'completed').length || 0;
      const totalRoutines = routineLogs?.length || 0;

      const summary: WeeklySummary = {
        week_start: input.weekStart,
        week_end: input.weekEnd,
        avg_cravings: Math.round(avgCravings * 10) / 10, // Round to 1 decimal
        total_entries: entries?.length || 0,
        completed_routines: completedRoutines,
        total_routines: totalRoutines,
        top_feelings: topFeelings,
        top_triggers: topTriggers,
      };

      return summary;
    }),

  // Get sobriety streak information
  getStreak: protectedProcedure
    .query(async ({ ctx }) => {
      const { data, error } = await supabase
        .from('sobriety_streaks')
        .select('*')
        .eq('user_id', ctx.user.id)
        .is('end_date', null) // Active streak
        .order('start_date', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw new Error(`Failed to fetch sobriety streak: ${error.message}`);
      }

      if (!data) {
        return {
          current_streak_days: 0,
          longest_streak_days: 0,
          total_relapses: 0,
          start_date: null,
          is_active: false,
        };
      }

      // Calculate current streak days
      const startDate = new Date(data.start_date);
      const today = new Date();
      const diffTime = today.getTime() - startDate.getTime();
      const currentStreakDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      // Get longest streak and total relapses
      const { data: allStreaks, error: allStreaksError } = await supabase
        .from('sobriety_streaks')
        .select('start_date, end_date')
        .eq('user_id', ctx.user.id)
        .order('start_date', { ascending: false });

      if (allStreaksError) {
        throw new Error(`Failed to fetch all streaks: ${allStreaksError.message}`);
      }

      let longestStreakDays = 0;
      let totalRelapses = 0;

      allStreaks?.forEach(streak => {
        const start = new Date(streak.start_date);
        const end = streak.end_date ? new Date(streak.end_date) : new Date();
        const diffTime = end.getTime() - start.getTime();
        const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (days > longestStreakDays) {
          longestStreakDays = days;
        }
        
        if (streak.end_date) {
          totalRelapses++;
        }
      });

      return {
        current_streak_days: currentStreakDays,
        longest_streak_days: longestStreakDays,
        total_relapses: totalRelapses,
        start_date: data.start_date,
        is_active: true,
      };
    }),

  // Start a new sobriety streak
  startStreak: protectedProcedure
    .input(z.object({
      startDate: z.string(), // YYYY-MM-DD format
    }))
    .mutation(async ({ input, ctx }) => {
      // End any existing active streak
      await supabase
        .from('sobriety_streaks')
        .update({ end_date: input.startDate })
        .eq('user_id', ctx.user.id)
        .is('end_date', null);

      // Start new streak
      const { data, error } = await supabase
        .from('sobriety_streaks')
        .insert({
          user_id: ctx.user.id,
          start_date: input.startDate,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to start sobriety streak: ${error.message}`);
      }

      return data;
    }),

  // End current streak (relapse)
  endStreak: protectedProcedure
    .input(z.object({
      endDate: z.string(), // YYYY-MM-DD format
      relapseNote: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { data, error } = await supabase
        .from('sobriety_streaks')
        .update({
          end_date: input.endDate,
          relapse_note: input.relapseNote,
        })
        .eq('user_id', ctx.user.id)
        .is('end_date', null)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to end sobriety streak: ${error.message}`);
      }

      return data;
    }),

  // Get craving events for a date range
  getCravingEvents: protectedProcedure
    .input(z.object({
      startDate: z.string(),
      endDate: z.string(),
      limit: z.number().min(1).max(100).default(50),
    }))
    .query(async ({ input, ctx }) => {
      const { data, error } = await supabase
        .from('craving_events')
        .select('*')
        .eq('user_id', ctx.user.id)
        .gte('occurred_at', input.startDate)
        .lte('occurred_at', input.endDate)
        .order('occurred_at', { ascending: false })
        .limit(input.limit);

      if (error) {
        throw new Error(`Failed to fetch craving events: ${error.message}`);
      }

      return data;
    }),

  // Delete a daily entry
  deleteEntry: protectedProcedure
    .input(z.object({
      entryId: z.string().uuid(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { error } = await supabase
        .from('daily_entries')
        .delete()
        .eq('id', input.entryId)
        .eq('user_id', ctx.user.id);

      if (error) {
        throw new Error(`Failed to delete daily entry: ${error.message}`);
      }

      return { success: true };
    }),

  // Get daily entry statistics for charts
  getStats: protectedProcedure
    .input(z.object({
      startDate: z.string(),
      endDate: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      const { data, error } = await supabase
        .from('daily_entries')
        .select('entry_date, cravings_intensity, feelings, triggers')
        .eq('user_id', ctx.user.id)
        .gte('entry_date', input.startDate)
        .lte('entry_date', input.endDate)
        .order('entry_date', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch daily entry stats: ${error.message}`);
      }

      // Process data for charts
      const chartData = data?.map(entry => ({
        date: entry.entry_date,
        cravings: entry.cravings_intensity || 0,
        feelings: entry.feelings || [],
        triggers: entry.triggers || [],
      })) || [];

      // Calculate trends
      const cravings = chartData.map(d => d.cravings).filter(c => c > 0);
      const avgCravings = cravings.length > 0 ? cravings.reduce((a, b) => a + b, 0) / cravings.length : 0;

      return {
        chartData,
        avgCravings: Math.round(avgCravings * 10) / 10,
        totalDays: chartData.length,
        daysWithCravings: cravings.length,
      };
    }),
});
