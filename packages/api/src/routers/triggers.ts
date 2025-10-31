import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { createClient } from '@supabase/supabase-js';
import { TriggerLocationSchema, CreateTriggerLocationInput, UpdateTriggerLocationInput } from '@repo/types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const triggersRouter = router({
  // Get user's trigger locations
  list: protectedProcedure
    .input(z.object({
      activeOnly: z.boolean().default(true),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input, ctx }) => {
      let query = supabase
        .from('trigger_locations')
        .select('*')
        .eq('user_id', ctx.user.id)
        .order('created_at', { ascending: false })
        .range(input.offset, input.offset + input.limit - 1);

      if (input.activeOnly) {
        query = query.eq('active', true);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch trigger locations: ${error.message}`);
      }

      return data;
    }),

  // Get single trigger location by ID
  get: protectedProcedure
    .input(z.object({
      triggerId: z.string().uuid(),
    }))
    .query(async ({ input, ctx }) => {
      const { data, error } = await supabase
        .from('trigger_locations')
        .select('*')
        .eq('id', input.triggerId)
        .eq('user_id', ctx.user.id)
        .single();

      if (error) {
        throw new Error(`Failed to fetch trigger location: ${error.message}`);
      }

      return data;
    }),

  // Create new trigger location
  create: protectedProcedure
    .input(TriggerLocationSchema.omit({ id: true, user_id: true, created_at: true }))
    .mutation(async ({ input, ctx }) => {
      const { data, error } = await supabase
        .from('trigger_locations')
        .insert({
          user_id: ctx.user.id,
          ...input,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create trigger location: ${error.message}`);
      }

      return data;
    }),

  // Update existing trigger location
  update: protectedProcedure
    .input(z.object({
      triggerId: z.string().uuid(),
      updates: TriggerLocationSchema.omit({ id: true, user_id: true, created_at: true }).partial(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { data, error } = await supabase
        .from('trigger_locations')
        .update(input.updates)
        .eq('id', input.triggerId)
        .eq('user_id', ctx.user.id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update trigger location: ${error.message}`);
      }

      return data;
    }),

  // Delete trigger location
  delete: protectedProcedure
    .input(z.object({
      triggerId: z.string().uuid(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { error } = await supabase
        .from('trigger_locations')
        .delete()
        .eq('id', input.triggerId)
        .eq('user_id', ctx.user.id);

      if (error) {
        throw new Error(`Failed to delete trigger location: ${error.message}`);
      }

      return { success: true };
    }),

  // Toggle trigger location active status
  toggleActive: protectedProcedure
    .input(z.object({
      triggerId: z.string().uuid(),
      active: z.boolean(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { data, error } = await supabase
        .from('trigger_locations')
        .update({ active: input.active })
        .eq('id', input.triggerId)
        .eq('user_id', ctx.user.id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to toggle trigger location active status: ${error.message}`);
      }

      return data;
    }),

  // Handle geofence entry event
  onEnter: protectedProcedure
    .input(z.object({
      triggerId: z.string().uuid(),
      lat: z.number(),
      lng: z.number(),
      timestamp: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Get the trigger location
      const { data: trigger, error: triggerError } = await supabase
        .from('trigger_locations')
        .select('*')
        .eq('id', input.triggerId)
        .eq('user_id', ctx.user.id)
        .eq('active', true)
        .single();

      if (triggerError || !trigger) {
        throw new Error('Trigger location not found or inactive');
      }

      // Log the geofence event
      const { data: event, error: eventError } = await supabase
        .from('craving_events')
        .insert({
          user_id: ctx.user.id,
          occurred_at: input.timestamp,
          intensity: 5, // Default intensity for geofence triggers
          trigger_type: 'location',
          lat: input.lat,
          lng: input.lng,
          notes: `Geofence entry: ${trigger.label}`,
          response_taken: 'geofence_triggered',
        })
        .select()
        .single();

      if (eventError) {
        throw new Error(`Failed to log geofence event: ${eventError.message}`);
      }

      // Get matching action plans based on trigger actions
      let matchingPlans = [];
      
      if (trigger.on_enter?.includes('show_plan')) {
        const { data: plans, error: plansError } = await supabase
          .from('action_plans')
          .select('*')
          .eq('user_id', ctx.user.id)
          .eq('is_shared_with_sponsor', false); // Don't share geofence-triggered plans by default

        if (plansError) {
          throw new Error(`Failed to fetch action plans: ${plansError.message}`);
        }

        // Filter plans that might be relevant to this trigger
        matchingPlans = plans?.filter(plan => 
          plan.situation?.toLowerCase().includes('location') ||
          plan.situation?.toLowerCase().includes('trigger') ||
          plan.title.toLowerCase().includes(trigger.label.toLowerCase())
        ) || [];
      }

      // If sponsor notification is requested, we would send a push notification here
      // This would be implemented with the notifications router
      if (trigger.on_enter?.includes('notify_sponsor')) {
        // Get active sponsor relationships
        const { data: relationships } = await supabase
          .from('sponsor_relationships')
          .select('sponsor_id')
          .eq('sponsee_id', ctx.user.id)
          .eq('status', 'active');

        // This would trigger a push notification to the sponsor
        // Implementation would be in the notifications router
      }

      return {
        event,
        matching_plans: matchingPlans,
        trigger_actions: trigger.on_enter || [],
      };
    }),

  // Handle geofence exit event
  onExit: protectedProcedure
    .input(z.object({
      triggerId: z.string().uuid(),
      lat: z.number(),
      lng: z.number(),
      timestamp: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Get the trigger location
      const { data: trigger, error: triggerError } = await supabase
        .from('trigger_locations')
        .select('*')
        .eq('id', input.triggerId)
        .eq('user_id', ctx.user.id)
        .eq('active', true)
        .single();

      if (triggerError || !trigger) {
        throw new Error('Trigger location not found or inactive');
      }

      // Log the geofence exit event
      const { data: event, error: eventError } = await supabase
        .from('craving_events')
        .insert({
          user_id: ctx.user.id,
          occurred_at: input.timestamp,
          intensity: 0, // Exit events typically have low intensity
          trigger_type: 'location_exit',
          lat: input.lat,
          lng: input.lng,
          notes: `Geofence exit: ${trigger.label}`,
          response_taken: 'geofence_exit',
        })
        .select()
        .single();

      if (eventError) {
        throw new Error(`Failed to log geofence exit event: ${eventError.message}`);
      }

      return {
        event,
        trigger_actions: trigger.on_exit || [],
      };
    }),

  // Get trigger locations near a point (for map display)
  getNearby: protectedProcedure
    .input(z.object({
      lat: z.number(),
      lng: z.number(),
      radiusKm: z.number().default(10),
      limit: z.number().min(1).max(50).default(20),
    }))
    .query(async ({ input, ctx }) => {
      // This is a simplified version - in production you'd use PostGIS for proper geo queries
      const { data, error } = await supabase
        .from('trigger_locations')
        .select('*')
        .eq('user_id', ctx.user.id)
        .eq('active', true);

      if (error) {
        throw new Error(`Failed to fetch nearby trigger locations: ${error.message}`);
      }

      // Filter by distance (simplified calculation)
      const nearbyTriggers = data?.filter(trigger => {
        const distance = calculateDistance(
          input.lat, input.lng,
          trigger.lat, trigger.lng
        );
        return distance <= input.radiusKm;
      }).slice(0, input.limit) || [];

      return nearbyTriggers;
    }),

  // Get trigger location statistics
  getStats: protectedProcedure
    .query(async ({ ctx }) => {
      const { data, error } = await supabase
        .from('trigger_locations')
        .select('id, active, created_at')
        .eq('user_id', ctx.user.id);

      if (error) {
        throw new Error(`Failed to fetch trigger location stats: ${error.message}`);
      }

      const totalTriggers = data?.length || 0;
      const activeTriggers = data?.filter(t => t.active).length || 0;
      const recentTriggers = data?.filter(t => {
        const created = new Date(t.created_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return created > weekAgo;
      }).length || 0;

      return {
        total_triggers: totalTriggers,
        active_triggers: activeTriggers,
        recent_triggers: recentTriggers,
        inactive_triggers: totalTriggers - activeTriggers,
      };
    }),

  // Test geofence (for development)
  testGeofence: protectedProcedure
    .input(z.object({
      triggerId: z.string().uuid(),
    }))
    .mutation(async ({ input, ctx }) => {
      // This simulates a geofence entry for testing purposes
      const { data: trigger, error: triggerError } = await supabase
        .from('trigger_locations')
        .select('*')
        .eq('id', input.triggerId)
        .eq('user_id', ctx.user.id)
        .single();

      if (triggerError || !trigger) {
        throw new Error('Trigger location not found');
      }

      // Simulate geofence entry
      const now = new Date().toISOString();
      
      const { data: event, error: eventError } = await supabase
        .from('craving_events')
        .insert({
          user_id: ctx.user.id,
          occurred_at: now,
          intensity: 5,
          trigger_type: 'location_test',
          lat: trigger.lat,
          lng: trigger.lng,
          notes: `Test geofence entry: ${trigger.label}`,
          response_taken: 'test_triggered',
        })
        .select()
        .single();

      if (eventError) {
        throw new Error(`Failed to log test geofence event: ${eventError.message}`);
      }

      return {
        event,
        trigger,
        message: 'Test geofence event logged successfully',
      };
    }),

  // Bulk update trigger locations (for batch operations)
  bulkUpdate: protectedProcedure
    .input(z.object({
      updates: z.array(z.object({
        triggerId: z.string().uuid(),
        updates: TriggerLocationSchema.omit({ id: true, user_id: true, created_at: true }).partial(),
      })),
    }))
    .mutation(async ({ input, ctx }) => {
      const results = [];

      for (const update of input.updates) {
        const { data, error } = await supabase
          .from('trigger_locations')
          .update(update.updates)
          .eq('id', update.triggerId)
          .eq('user_id', ctx.user.id)
          .select()
          .single();

        if (error) {
          results.push({ triggerId: update.triggerId, error: error.message });
        } else {
          results.push({ triggerId: update.triggerId, data });
        }
      }

      return results;
    }),
});

// Helper function to calculate distance between two points
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
