import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { createClient } from '@supabase/supabase-js';
import { StepSchema, StepEntrySchema, CreateStepEntryInput, UpdateStepEntryInput } from '@repo/types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const stepsRouter = router({
  // Get all steps filtered by program (NA/AA)
  list: protectedProcedure
    .input(z.object({
      program: z.enum(['NA', 'AA']).optional(),
    }))
    .query(async ({ input, ctx }) => {
      let query = supabase
        .from('steps')
        .select('*')
        .order('step_number', { ascending: true });

      if (input.program) {
        query = query.eq('program', input.program);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch steps: ${error.message}`);
      }

      return data;
    }),

  // Get user's entry for a specific step and version
  getEntry: protectedProcedure
    .input(z.object({
      stepId: z.string().uuid(),
      version: z.number().optional(),
    }))
    .query(async ({ input, ctx }) => {
      let query = supabase
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
        .eq('user_id', ctx.user.id)
        .eq('step_id', input.stepId);

      if (input.version) {
        query = query.eq('version', input.version);
      } else {
        // Get the latest version
        query = query.order('version', { ascending: false }).limit(1);
      }

      const { data, error } = await query.single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw new Error(`Failed to fetch step entry: ${error.message}`);
      }

      return data;
    }),

  // Get all versions of a step entry for a user
  getEntryVersions: protectedProcedure
    .input(z.object({
      stepId: z.string().uuid(),
    }))
    .query(async ({ input, ctx }) => {
      const { data, error } = await supabase
        .from('step_entries')
        .select('id, version, created_at, updated_at, is_shared_with_sponsor')
        .eq('user_id', ctx.user.id)
        .eq('step_id', input.stepId)
        .order('version', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch step entry versions: ${error.message}`);
      }

      return data;
    }),

  // Create or update step entry
  upsertEntry: protectedProcedure
    .input(StepEntrySchema.omit({ id: true, created_at: true, updated_at: true }).extend({
      stepId: z.string().uuid(),
      content: z.record(z.any()),
    }))
    .mutation(async ({ input, ctx }) => {
      const { stepId, content, ...entryData } = input;

      // Check if entry exists for this step and user
      const { data: existingEntry } = await supabase
        .from('step_entries')
        .select('id, version')
        .eq('user_id', ctx.user.id)
        .eq('step_id', stepId)
        .order('version', { ascending: false })
        .limit(1)
        .single();

      let version = 1;
      if (existingEntry) {
        version = existingEntry.version + 1;
      }

      const { data, error } = await supabase
        .from('step_entries')
        .insert({
          user_id: ctx.user.id,
          step_id: stepId,
          version,
          content,
          ...entryData,
        })
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
        .single();

      if (error) {
        throw new Error(`Failed to create step entry: ${error.message}`);
      }

      return data;
    }),

  // Toggle sharing with sponsor
  toggleShare: protectedProcedure
    .input(z.object({
      entryId: z.string().uuid(),
      isShared: z.boolean(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { data, error } = await supabase
        .from('step_entries')
        .update({ is_shared_with_sponsor: input.isShared })
        .eq('id', input.entryId)
        .eq('user_id', ctx.user.id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update step entry sharing: ${error.message}`);
      }

      return data;
    }),

  // Get step entry with diff between versions
  getEntryDiff: protectedProcedure
    .input(z.object({
      stepId: z.string().uuid(),
      version1: z.number(),
      version2: z.number(),
    }))
    .query(async ({ input, ctx }) => {
      const { data: entries, error } = await supabase
        .from('step_entries')
        .select('version, content, created_at, updated_at')
        .eq('user_id', ctx.user.id)
        .eq('step_id', input.stepId)
        .in('version', [input.version1, input.version2])
        .order('version', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch step entry versions: ${error.message}`);
      }

      if (entries.length !== 2) {
        throw new Error('One or both versions not found');
      }

      return {
        version1: entries[0],
        version2: entries[1],
        // In a real implementation, you'd use a diff library like jsdiff
        // to generate the actual differences between the content objects
        diff: {
          // Placeholder for diff data
          changes: [],
        },
      };
    }),

  // Delete a specific version of a step entry
  deleteEntryVersion: protectedProcedure
    .input(z.object({
      entryId: z.string().uuid(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { error } = await supabase
        .from('step_entries')
        .delete()
        .eq('id', input.entryId)
        .eq('user_id', ctx.user.id);

      if (error) {
        throw new Error(`Failed to delete step entry: ${error.message}`);
      }

      return { success: true };
    }),

  // Get user's progress across all steps
  getProgress: protectedProcedure
    .input(z.object({
      program: z.enum(['NA', 'AA']).optional(),
    }))
    .query(async ({ input, ctx }) => {
      let stepsQuery = supabase
        .from('steps')
        .select('id, program, step_number, title')
        .order('step_number', { ascending: true });

      if (input.program) {
        stepsQuery = stepsQuery.eq('program', input.program);
      }

      const { data: steps, error: stepsError } = await stepsQuery;

      if (stepsError) {
        throw new Error(`Failed to fetch steps: ${stepsError.message}`);
      }

      // Get user's latest entries for each step
      const { data: entries, error: entriesError } = await supabase
        .from('step_entries')
        .select('step_id, version, created_at, updated_at, is_shared_with_sponsor')
        .eq('user_id', ctx.user.id)
        .in('step_id', steps?.map(s => s.id) || []);

      if (entriesError) {
        throw new Error(`Failed to fetch step entries: ${entriesError.message}`);
      }

      // Group entries by step_id and get the latest version for each
      const latestEntries = entries?.reduce((acc, entry) => {
        const existing = acc[entry.step_id];
        if (!existing || entry.version > existing.version) {
          acc[entry.step_id] = entry;
        }
        return acc;
      }, {} as Record<string, typeof entries[0]>) || {};

      // Combine steps with user progress
      const progress = steps?.map(step => ({
        ...step,
        hasEntry: !!latestEntries[step.id],
        latestVersion: latestEntries[step.id]?.version || 0,
        lastUpdated: latestEntries[step.id]?.updated_at || null,
        isShared: latestEntries[step.id]?.is_shared_with_sponsor || false,
      })) || [];

      return {
        steps: progress,
        totalSteps: steps?.length || 0,
        completedSteps: progress.filter(p => p.hasEntry).length,
        sharedSteps: progress.filter(p => p.isShared).length,
      };
    }),
});
