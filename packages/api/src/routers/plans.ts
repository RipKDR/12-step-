import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { createClient } from '@supabase/supabase-js';
import { ActionPlanSchema, CreateActionPlanInput, UpdateActionPlanInput } from '@repo/types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const plansRouter = router({
  // Get user's action plans
  list: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input, ctx }) => {
      const { data, error } = await supabase
        .from('action_plans')
        .select('*')
        .eq('user_id', ctx.user.id)
        .order('created_at', { ascending: false })
        .range(input.offset, input.offset + input.limit - 1);

      if (error) {
        throw new Error(`Failed to fetch action plans: ${error.message}`);
      }

      return data;
    }),

  // Get single action plan by ID
  get: protectedProcedure
    .input(z.object({
      planId: z.string().uuid(),
    }))
    .query(async ({ input, ctx }) => {
      const { data, error } = await supabase
        .from('action_plans')
        .select('*')
        .eq('id', input.planId)
        .eq('user_id', ctx.user.id)
        .single();

      if (error) {
        throw new Error(`Failed to fetch action plan: ${error.message}`);
      }

      return data;
    }),

  // Create new action plan
  create: protectedProcedure
    .input(ActionPlanSchema.omit({ id: true, user_id: true, created_at: true, updated_at: true }))
    .mutation(async ({ input, ctx }) => {
      const { data, error } = await supabase
        .from('action_plans')
        .insert({
          user_id: ctx.user.id,
          ...input,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create action plan: ${error.message}`);
      }

      return data;
    }),

  // Update existing action plan
  update: protectedProcedure
    .input(z.object({
      planId: z.string().uuid(),
      updates: ActionPlanSchema.omit({ id: true, user_id: true, created_at: true, updated_at: true }).partial(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { data, error } = await supabase
        .from('action_plans')
        .update(input.updates)
        .eq('id', input.planId)
        .eq('user_id', ctx.user.id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update action plan: ${error.message}`);
      }

      return data;
    }),

  // Delete action plan
  delete: protectedProcedure
    .input(z.object({
      planId: z.string().uuid(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { error } = await supabase
        .from('action_plans')
        .delete()
        .eq('id', input.planId)
        .eq('user_id', ctx.user.id);

      if (error) {
        throw new Error(`Failed to delete action plan: ${error.message}`);
      }

      return { success: true };
    }),

  // Toggle sharing with sponsor
  toggleShare: protectedProcedure
    .input(z.object({
      planId: z.string().uuid(),
      isShared: z.boolean(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { data, error } = await supabase
        .from('action_plans')
        .update({ is_shared_with_sponsor: input.isShared })
        .eq('id', input.planId)
        .eq('user_id', ctx.user.id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update action plan sharing: ${error.message}`);
      }

      return data;
    }),

  // Get action plans by trigger type (for geofencing)
  getByTrigger: protectedProcedure
    .input(z.object({
      triggerType: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      // This would typically search through the if_then pairs for matching triggers
      // For now, we'll return all plans and let the client filter
      const { data, error } = await supabase
        .from('action_plans')
        .select('*')
        .eq('user_id', ctx.user.id)
        .eq('active', true);

      if (error) {
        throw new Error(`Failed to fetch action plans by trigger: ${error.message}`);
      }

      // Filter plans that have if_then pairs matching the trigger type
      const matchingPlans = data?.filter(plan => 
        plan.if_then?.some((pair: any) => 
          pair.if.toLowerCase().includes(input.triggerType.toLowerCase())
        )
      ) || [];

      return matchingPlans;
    }),

  // Get default action plan (for support tools)
  getDefault: protectedProcedure
    .query(async ({ ctx }) => {
      const { data, error } = await supabase
        .from('action_plans')
        .select('*')
        .eq('user_id', ctx.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw new Error(`Failed to fetch default action plan: ${error.message}`);
      }

      return data;
    }),

  // Duplicate an action plan
  duplicate: protectedProcedure
    .input(z.object({
      planId: z.string().uuid(),
      newTitle: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Get the original plan
      const { data: originalPlan, error: fetchError } = await supabase
        .from('action_plans')
        .select('*')
        .eq('id', input.planId)
        .eq('user_id', ctx.user.id)
        .single();

      if (fetchError) {
        throw new Error(`Failed to fetch original action plan: ${fetchError.message}`);
      }

      // Create a copy with the new title
      const { data, error } = await supabase
        .from('action_plans')
        .insert({
          user_id: ctx.user.id,
          title: input.newTitle,
          situation: originalPlan.situation,
          if_then: originalPlan.if_then,
          checklist: originalPlan.checklist,
          emergency_contacts: originalPlan.emergency_contacts,
          is_shared_with_sponsor: false, // Don't share duplicates by default
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to duplicate action plan: ${error.message}`);
      }

      return data;
    }),

  // Get action plan statistics
  getStats: protectedProcedure
    .query(async ({ ctx }) => {
      const { data, error } = await supabase
        .from('action_plans')
        .select('id, title, created_at, is_shared_with_sponsor')
        .eq('user_id', ctx.user.id);

      if (error) {
        throw new Error(`Failed to fetch action plan stats: ${error.message}`);
      }

      const totalPlans = data?.length || 0;
      const sharedPlans = data?.filter(p => p.is_shared_with_sponsor).length || 0;
      const recentPlans = data?.filter(p => {
        const created = new Date(p.created_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return created > weekAgo;
      }).length || 0;

      return {
        total_plans: totalPlans,
        shared_plans: sharedPlans,
        recent_plans: recentPlans,
        private_plans: totalPlans - sharedPlans,
      };
    }),

  // Search action plans
  search: protectedProcedure
    .input(z.object({
      query: z.string().min(1),
      limit: z.number().min(1).max(50).default(10),
    }))
    .query(async ({ input, ctx }) => {
      const { data, error } = await supabase
        .from('action_plans')
        .select('*')
        .eq('user_id', ctx.user.id)
        .or(`title.ilike.%${input.query}%,situation.ilike.%${input.query}%`)
        .order('created_at', { ascending: false })
        .limit(input.limit);

      if (error) {
        throw new Error(`Failed to search action plans: ${error.message}`);
      }

      return data;
    }),

  // Update checklist item
  updateChecklistItem: protectedProcedure
    .input(z.object({
      planId: z.string().uuid(),
      itemIndex: z.number().min(0),
      done: z.boolean(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Get the current plan
      const { data: plan, error: fetchError } = await supabase
        .from('action_plans')
        .select('checklist')
        .eq('id', input.planId)
        .eq('user_id', ctx.user.id)
        .single();

      if (fetchError) {
        throw new Error(`Failed to fetch action plan: ${fetchError.message}`);
      }

      // Update the checklist item
      const updatedChecklist = [...(plan.checklist || [])];
      if (updatedChecklist[input.itemIndex]) {
        updatedChecklist[input.itemIndex] = {
          ...updatedChecklist[input.itemIndex],
          done: input.done,
        };
      }

      const { data, error } = await supabase
        .from('action_plans')
        .update({ checklist: updatedChecklist })
        .eq('id', input.planId)
        .eq('user_id', ctx.user.id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update checklist item: ${error.message}`);
      }

      return data;
    }),
});
