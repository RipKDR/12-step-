import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { createClient } from '@supabase/supabase-js';
import { SponsorRelationshipSchema, CreateSponsorRelationshipInput, UpdateSponsorRelationshipInput, SharedContent } from '@repo/types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Generate a 6-character alphanumeric code
function generateSponsorCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const sponsorRouter = router({
  // Generate a sponsor code for someone wanting a sponsor
  generateCode: protectedProcedure
    .mutation(async ({ ctx }) => {
      // Check if user already has a pending or active relationship as a sponsee
      const { data: existingRelationship } = await supabase
        .from('sponsor_relationships')
        .select('id, status')
        .eq('sponsee_id', ctx.user.id)
        .in('status', ['pending', 'active'])
        .single();

      if (existingRelationship) {
        throw new Error('You already have an active or pending sponsor relationship');
      }

      // Generate unique code
      let code: string;
      let attempts = 0;
      const maxAttempts = 10;

      do {
        code = generateSponsorCode();
        attempts++;
        
        const { data: existingCode } = await supabase
          .from('sponsor_relationships')
          .select('id')
          .eq('sponsee_id', ctx.user.id)
          .eq('status', 'pending')
          .single();

        if (!existingCode) break;
      } while (attempts < maxAttempts);

      if (attempts >= maxAttempts) {
        throw new Error('Failed to generate unique sponsor code');
      }

      // Create pending relationship with the code as a unique identifier
      // We'll use a special format: "CODE-{code}" in the sponsor_id field temporarily
      const { data, error } = await supabase
        .from('sponsor_relationships')
        .insert({
          sponsor_id: `CODE-${code}`, // Temporary placeholder
          sponsee_id: ctx.user.id,
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to generate sponsor code: ${error.message}`);
      }

      return {
        code,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      };
    }),

  // Accept a sponsor code (for sponsors)
  acceptCode: protectedProcedure
    .input(z.object({
      code: z.string().length(6),
    }))
    .mutation(async ({ input, ctx }) => {
      // Find the pending relationship with this code
      const { data: pendingRelationship, error: fetchError } = await supabase
        .from('sponsor_relationships')
        .select('*')
        .eq('sponsor_id', `CODE-${input.code}`)
        .eq('status', 'pending')
        .single();

      if (fetchError || !pendingRelationship) {
        throw new Error('Invalid or expired sponsor code');
      }

      // Check if the sponsor already has too many active relationships
      const { data: activeRelationships } = await supabase
        .from('sponsor_relationships')
        .select('id')
        .eq('sponsor_id', ctx.user.id)
        .eq('status', 'active');

      if (activeRelationships && activeRelationships.length >= 5) {
        throw new Error('You have reached the maximum number of active sponsor relationships');
      }

      // Update the relationship with the actual sponsor ID and activate it
      const { data, error } = await supabase
        .from('sponsor_relationships')
        .update({
          sponsor_id: ctx.user.id,
          status: 'active',
        })
        .eq('id', pendingRelationship.id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to accept sponsor code: ${error.message}`);
      }

      return data;
    }),

  // List sponsor relationships
  listRelationships: protectedProcedure
    .input(z.object({
      asSponsor: z.boolean().optional(),
      asSponsee: z.boolean().optional(),
    }))
    .query(async ({ input, ctx }) => {
      let query = supabase
        .from('sponsor_relationships')
        .select(`
          *,
          sponsor:profiles!sponsor_relationships_sponsor_id_fkey(handle, display_name, avatar_url),
          sponsee:profiles!sponsor_relationships_sponsee_id_fkey(handle, display_name, avatar_url)
        `)
        .or(`sponsor_id.eq.${ctx.user.id},sponsee_id.eq.${ctx.user.id}`)
        .order('created_at', { ascending: false });

      if (input.asSponsor) {
        query = query.eq('sponsor_id', ctx.user.id);
      }
      if (input.asSponsee) {
        query = query.eq('sponsee_id', ctx.user.id);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch sponsor relationships: ${error.message}`);
      }

      return data;
    }),

  // Revoke a sponsor relationship
  revoke: protectedProcedure
    .input(z.object({
      relationshipId: z.string().uuid(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Verify the user is part of this relationship
      const { data: relationship, error: fetchError } = await supabase
        .from('sponsor_relationships')
        .select('*')
        .eq('id', input.relationshipId)
        .or(`sponsor_id.eq.${ctx.user.id},sponsee_id.eq.${ctx.user.id}`)
        .single();

      if (fetchError || !relationship) {
        throw new Error('Relationship not found or access denied');
      }

      const { data, error } = await supabase
        .from('sponsor_relationships')
        .update({ status: 'revoked' })
        .eq('id', input.relationshipId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to revoke sponsor relationship: ${error.message}`);
      }

      return data;
    }),

  // Get shared content for sponsors
  getSharedContent: protectedProcedure
    .input(z.object({
      sponseeId: z.string().uuid(),
    }))
    .query(async ({ input, ctx }) => {
      // Verify the sponsor relationship exists and is active
      const { data: relationship, error: relationshipError } = await supabase
        .from('sponsor_relationships')
        .select('id')
        .eq('sponsor_id', ctx.user.id)
        .eq('sponsee_id', input.sponseeId)
        .eq('status', 'active')
        .single();

      if (relationshipError || !relationship) {
        throw new Error('Active sponsor relationship not found');
      }

      // Get shared step entries
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
        .eq('user_id', input.sponseeId)
        .eq('is_shared_with_sponsor', true)
        .order('updated_at', { ascending: false });

      if (stepEntriesError) {
        throw new Error(`Failed to fetch shared step entries: ${stepEntriesError.message}`);
      }

      // Get shared daily entries (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: dailyEntries, error: dailyEntriesError } = await supabase
        .from('daily_entries')
        .select('*')
        .eq('user_id', input.sponseeId)
        .eq('share_with_sponsor', true)
        .gte('entry_date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('entry_date', { ascending: false });

      if (dailyEntriesError) {
        throw new Error(`Failed to fetch shared daily entries: ${dailyEntriesError.message}`);
      }

      // Get shared action plans
      const { data: actionPlans, error: actionPlansError } = await supabase
        .from('action_plans')
        .select('*')
        .eq('user_id', input.sponseeId)
        .eq('is_shared_with_sponsor', true)
        .order('updated_at', { ascending: false });

      if (actionPlansError) {
        throw new Error(`Failed to fetch shared action plans: ${actionPlansError.message}`);
      }

      const sharedContent: SharedContent = {
        step_entries: stepEntries || [],
        daily_entries: dailyEntries || [],
        action_plans: actionPlans || [],
      };

      return sharedContent;
    }),

  // Get sponsor dashboard data
  getDashboard: protectedProcedure
    .query(async ({ ctx }) => {
      // Get active sponsees
      const { data: relationships, error: relationshipsError } = await supabase
        .from('sponsor_relationships')
        .select(`
          id,
          sponsee_id,
          created_at,
          sponsee:profiles!sponsor_relationships_sponsee_id_fkey(handle, display_name, avatar_url)
        `)
        .eq('sponsor_id', ctx.user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (relationshipsError) {
        throw new Error(`Failed to fetch sponsor relationships: ${relationshipsError.message}`);
      }

      // Get recent shared content counts
      const sponseeIds = relationships?.map(r => r.sponsee_id) || [];
      
      let recentStepEntries = 0;
      let recentDailyEntries = 0;
      let recentActionPlans = 0;

      if (sponseeIds.length > 0) {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Count recent step entries
        const { count: stepCount } = await supabase
          .from('step_entries')
          .select('id', { count: 'exact' })
          .in('user_id', sponseeIds)
          .eq('is_shared_with_sponsor', true)
          .gte('updated_at', sevenDaysAgo.toISOString());

        // Count recent daily entries
        const { count: dailyCount } = await supabase
          .from('daily_entries')
          .select('id', { count: 'exact' })
          .in('user_id', sponseeIds)
          .eq('share_with_sponsor', true)
          .gte('updated_at', sevenDaysAgo.toISOString());

        // Count recent action plans
        const { count: planCount } = await supabase
          .from('action_plans')
          .select('id', { count: 'exact' })
          .in('user_id', sponseeIds)
          .eq('is_shared_with_sponsor', true)
          .gte('updated_at', sevenDaysAgo.toISOString());

        recentStepEntries = stepCount || 0;
        recentDailyEntries = dailyCount || 0;
        recentActionPlans = planCount || 0;
      }

      return {
        active_sponsees: relationships || [],
        total_sponsees: relationships?.length || 0,
        recent_activity: {
          step_entries: recentStepEntries,
          daily_entries: recentDailyEntries,
          action_plans: recentActionPlans,
        },
      };
    }),

  // Get sponsee profile information
  getSponseeProfile: protectedProcedure
    .input(z.object({
      sponseeId: z.string().uuid(),
    }))
    .query(async ({ input, ctx }) => {
      // Verify the sponsor relationship exists and is active
      const { data: relationship, error: relationshipError } = await supabase
        .from('sponsor_relationships')
        .select('id')
        .eq('sponsor_id', ctx.user.id)
        .eq('sponsee_id', input.sponseeId)
        .eq('status', 'active')
        .single();

      if (relationshipError || !relationship) {
        throw new Error('Active sponsor relationship not found');
      }

      // Get sponsee profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('handle, display_name, avatar_url, timezone, created_at')
        .eq('user_id', input.sponseeId)
        .single();

      if (profileError) {
        throw new Error(`Failed to fetch sponsee profile: ${profileError.message}`);
      }

      // Get sobriety streak
      const { data: streak, error: streakError } = await supabase
        .from('sobriety_streaks')
        .select('start_date, end_date')
        .eq('user_id', input.sponseeId)
        .is('end_date', null)
        .order('start_date', { ascending: false })
        .limit(1)
        .single();

      if (streakError && streakError.code !== 'PGRST116') {
        throw new Error(`Failed to fetch sobriety streak: ${streakError.message}`);
      }

      return {
        profile,
        sobriety_streak: streak,
      };
    }),

  // Send a message to sponsee (placeholder for future implementation)
  sendMessage: protectedProcedure
    .input(z.object({
      sponseeId: z.string().uuid(),
      message: z.string().min(1).max(1000),
    }))
    .mutation(async ({ input, ctx }) => {
      // Verify the sponsor relationship exists and is active
      const { data: relationship, error: relationshipError } = await supabase
        .from('sponsor_relationships')
        .select('id')
        .eq('sponsor_id', ctx.user.id)
        .eq('sponsee_id', input.sponseeId)
        .eq('status', 'active')
        .single();

      if (relationshipError || !relationship) {
        throw new Error('Active sponsor relationship not found');
      }

      // For now, just return success - actual messaging would be implemented later
      // with end-to-end encryption using libsodium
      return { success: true, message: 'Message sent successfully' };
    }),

  // Get relationship statistics
  getStats: protectedProcedure
    .query(async ({ ctx }) => {
      // Get all relationships for this user
      const { data: relationships, error: relationshipsError } = await supabase
        .from('sponsor_relationships')
        .select('status, created_at')
        .or(`sponsor_id.eq.${ctx.user.id},sponsee_id.eq.${ctx.user.id}`);

      if (relationshipsError) {
        throw new Error(`Failed to fetch relationship stats: ${relationshipsError.message}`);
      }

      const asSponsor = relationships?.filter(r => r.sponsor_id === ctx.user.id) || [];
      const asSponsee = relationships?.filter(r => r.sponsee_id === ctx.user.id) || [];

      return {
        as_sponsor: {
          total: asSponsor.length,
          active: asSponsor.filter(r => r.status === 'active').length,
          pending: asSponsor.filter(r => r.status === 'pending').length,
          revoked: asSponsor.filter(r => r.status === 'revoked').length,
        },
        as_sponsee: {
          total: asSponsee.length,
          active: asSponsee.filter(r => r.status === 'active').length,
          pending: asSponsee.filter(r => r.status === 'pending').length,
          revoked: asSponsee.filter(r => r.status === 'revoked').length,
        },
      };
    }),
});
