import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { createClient } from '@supabase/supabase-js';
import { RoutineSchema, RoutineLogSchema, CreateRoutineInput, UpdateRoutineInput, CreateRoutineLogInput } from '@repo/types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const routinesRouter = router({
  // Get user's routines
  list: protectedProcedure
    .input(z.object({
      activeOnly: z.boolean().default(true),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input, ctx }) => {
      let query = supabase
        .from('routines')
        .select('*')
        .eq('user_id', ctx.user.id)
        .order('created_at', { ascending: false })
        .range(input.offset, input.offset + input.limit - 1);

      if (input.activeOnly) {
        query = query.eq('active', true);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch routines: ${error.message}`);
      }

      return data;
    }),

  // Get single routine by ID
  get: protectedProcedure
    .input(z.object({
      routineId: z.string().uuid(),
    }))
    .query(async ({ input, ctx }) => {
      const { data, error } = await supabase
        .from('routines')
        .select('*')
        .eq('id', input.routineId)
        .eq('user_id', ctx.user.id)
        .single();

      if (error) {
        throw new Error(`Failed to fetch routine: ${error.message}`);
      }

      return data;
    }),

  // Create new routine
  create: protectedProcedure
    .input(RoutineSchema.omit({ id: true, user_id: true, created_at: true }))
    .mutation(async ({ input, ctx }) => {
      const { data, error } = await supabase
        .from('routines')
        .insert({
          user_id: ctx.user.id,
          ...input,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create routine: ${error.message}`);
      }

      return data;
    }),

  // Update existing routine
  update: protectedProcedure
    .input(z.object({
      routineId: z.string().uuid(),
      updates: RoutineSchema.omit({ id: true, user_id: true, created_at: true }).partial(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { data, error } = await supabase
        .from('routines')
        .update(input.updates)
        .eq('id', input.routineId)
        .eq('user_id', ctx.user.id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update routine: ${error.message}`);
      }

      return data;
    }),

  // Delete routine
  delete: protectedProcedure
    .input(z.object({
      routineId: z.string().uuid(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { error } = await supabase
        .from('routines')
        .delete()
        .eq('id', input.routineId)
        .eq('user_id', ctx.user.id);

      if (error) {
        throw new Error(`Failed to delete routine: ${error.message}`);
      }

      return { success: true };
    }),

  // Toggle routine active status
  toggleActive: protectedProcedure
    .input(z.object({
      routineId: z.string().uuid(),
      active: z.boolean(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { data, error } = await supabase
        .from('routines')
        .update({ active: input.active })
        .eq('id', input.routineId)
        .eq('user_id', ctx.user.id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to toggle routine active status: ${error.message}`);
      }

      return data;
    }),

  // Log routine completion
  logCompletion: protectedProcedure
    .input(z.object({
      routineId: z.string().uuid(),
      status: z.enum(['completed', 'skipped']),
      note: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { data, error } = await supabase
        .from('routine_logs')
        .insert({
          routine_id: input.routineId,
          user_id: ctx.user.id,
          status: input.status,
          note: input.note,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to log routine completion: ${error.message}`);
      }

      return data;
    }),

  // Get routine logs for a specific routine
  getLogs: protectedProcedure
    .input(z.object({
      routineId: z.string().uuid(),
      limit: z.number().min(1).max(100).default(30),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input, ctx }) => {
      const { data, error } = await supabase
        .from('routine_logs')
        .select('*')
        .eq('routine_id', input.routineId)
        .eq('user_id', ctx.user.id)
        .order('run_at', { ascending: false })
        .range(input.offset, input.offset + input.limit - 1);

      if (error) {
        throw new Error(`Failed to fetch routine logs: ${error.message}`);
      }

      return data;
    }),

  // Get routine completion statistics
  getStats: protectedProcedure
    .input(z.object({
      routineId: z.string().uuid().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }))
    .query(async ({ input, ctx }) => {
      let query = supabase
        .from('routine_logs')
        .select('status, run_at, routines (title)')
        .eq('user_id', ctx.user.id);

      if (input.routineId) {
        query = query.eq('routine_id', input.routineId);
      }

      if (input.startDate) {
        query = query.gte('run_at', input.startDate);
      }

      if (input.endDate) {
        query = query.lte('run_at', input.endDate);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch routine stats: ${error.message}`);
      }

      const total = data?.length || 0;
      const completed = data?.filter(log => log.status === 'completed').length || 0;
      const skipped = data?.filter(log => log.status === 'skipped').length || 0;
      const completionRate = total > 0 ? (completed / total) * 100 : 0;

      return {
        total_logs: total,
        completed: completed,
        skipped: skipped,
        completion_rate: Math.round(completionRate * 10) / 10,
      };
    }),

  // Get routines due for notification (for cron job)
  getDueForNotification: protectedProcedure
    .input(z.object({
      currentTime: z.string(), // ISO string
      lookAheadMinutes: z.number().default(60),
    }))
    .query(async ({ input, ctx }) => {
      const now = new Date(input.currentTime);
      const lookAhead = new Date(now.getTime() + input.lookAheadMinutes * 60 * 1000);

      // Get all active routines
      const { data: routines, error: routinesError } = await supabase
        .from('routines')
        .select('*')
        .eq('user_id', ctx.user.id)
        .eq('active', true);

      if (routinesError) {
        throw new Error(`Failed to fetch routines: ${routinesError.message}`);
      }

      const dueRoutines = [];

      for (const routine of routines || []) {
        const schedule = routine.schedule;
        
        if (schedule.type === 'daily' && schedule.hour !== undefined) {
          // Check if it's time for daily routine
          const today = new Date(now);
          today.setHours(schedule.hour, schedule.minute || 0, 0, 0);
          
          if (today >= now && today <= lookAhead) {
            // Check if we haven't already sent a notification today
            const todayStart = new Date(today);
            todayStart.setHours(0, 0, 0, 0);
            const todayEnd = new Date(today);
            todayEnd.setHours(23, 59, 59, 999);

            const { data: existingLogs } = await supabase
              .from('routine_logs')
              .select('id')
              .eq('routine_id', routine.id)
              .eq('user_id', ctx.user.id)
              .gte('run_at', todayStart.toISOString())
              .lte('run_at', todayEnd.toISOString())
              .limit(1);

            if (!existingLogs || existingLogs.length === 0) {
              dueRoutines.push(routine);
            }
          }
        } else if (schedule.type === 'weekly' && schedule.days && schedule.hour !== undefined) {
          // Check if it's time for weekly routine
          const today = new Date(now);
          const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
          
          if (schedule.days.includes(dayOfWeek)) {
            today.setHours(schedule.hour, schedule.minute || 0, 0, 0);
            
            if (today >= now && today <= lookAhead) {
              // Check if we haven't already sent a notification this week
              const weekStart = new Date(today);
              weekStart.setDate(today.getDate() - dayOfWeek);
              weekStart.setHours(0, 0, 0, 0);
              const weekEnd = new Date(weekStart);
              weekEnd.setDate(weekStart.getDate() + 6);
              weekEnd.setHours(23, 59, 59, 999);

              const { data: existingLogs } = await supabase
                .from('routine_logs')
                .select('id')
                .eq('routine_id', routine.id)
                .eq('user_id', ctx.user.id)
                .gte('run_at', weekStart.toISOString())
                .lte('run_at', weekEnd.toISOString())
                .limit(1);

              if (!existingLogs || existingLogs.length === 0) {
                dueRoutines.push(routine);
              }
            }
          }
        }
      }

      return dueRoutines;
    }),

  // Mark routine notification as sent
  markNotificationSent: protectedProcedure
    .input(z.object({
      routineId: z.string().uuid(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { data, error } = await supabase
        .from('routine_logs')
        .insert({
          routine_id: input.routineId,
          user_id: ctx.user.id,
          status: 'sent',
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to mark notification as sent: ${error.message}`);
      }

      return data;
    }),

  // Get routine completion streak
  getStreak: protectedProcedure
    .input(z.object({
      routineId: z.string().uuid(),
    }))
    .query(async ({ input, ctx }) => {
      const { data, error } = await supabase
        .from('routine_logs')
        .select('run_at, status')
        .eq('routine_id', input.routineId)
        .eq('user_id', ctx.user.id)
        .eq('status', 'completed')
        .order('run_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch routine completion streak: ${error.message}`);
      }

      if (!data || data.length === 0) {
        return { current_streak: 0, longest_streak: 0 };
      }

      // Calculate current streak
      let currentStreak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = 0; i < data.length; i++) {
        const logDate = new Date(data[i].run_at);
        logDate.setHours(0, 0, 0, 0);
        
        const expectedDate = new Date(today);
        expectedDate.setDate(today.getDate() - i);
        
        if (logDate.getTime() === expectedDate.getTime()) {
          currentStreak++;
        } else {
          break;
        }
      }

      // Calculate longest streak
      let longestStreak = 0;
      let tempStreak = 0;
      let lastDate = null;

      for (const log of data) {
        const logDate = new Date(log.run_at);
        logDate.setHours(0, 0, 0, 0);
        
        if (lastDate === null) {
          tempStreak = 1;
        } else {
          const dayDiff = (lastDate.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24);
          if (dayDiff === 1) {
            tempStreak++;
          } else {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
          }
        }
        
        lastDate = logDate;
      }
      
      longestStreak = Math.max(longestStreak, tempStreak);

      return {
        current_streak: currentStreak,
        longest_streak: longestStreak,
      };
    }),

  // Duplicate a routine
  duplicate: protectedProcedure
    .input(z.object({
      routineId: z.string().uuid(),
      newTitle: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Get the original routine
      const { data: originalRoutine, error: fetchError } = await supabase
        .from('routines')
        .select('*')
        .eq('id', input.routineId)
        .eq('user_id', ctx.user.id)
        .single();

      if (fetchError) {
        throw new Error(`Failed to fetch original routine: ${fetchError.message}`);
      }

      // Create a copy with the new title
      const { data, error } = await supabase
        .from('routines')
        .insert({
          user_id: ctx.user.id,
          title: input.newTitle,
          description: originalRoutine.description,
          schedule: originalRoutine.schedule,
          active: false, // Don't activate duplicates by default
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to duplicate routine: ${error.message}`);
      }

      return data;
    }),
});
