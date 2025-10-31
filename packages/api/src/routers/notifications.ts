import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { createClient } from '@supabase/supabase-js';
import { NotificationTokenSchema, CreateNotificationTokenInput } from '@repo/types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Expo Push API configuration
const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const EXPO_PUSH_ACCESS_TOKEN = process.env.EXPO_PUSH_ACCESS_TOKEN;

export const notificationsRouter = router({
  // Register push notification token
  registerToken: protectedProcedure
    .input(NotificationTokenSchema.omit({ id: true, user_id: true, created_at: true }))
    .mutation(async ({ input, ctx }) => {
      // Check if token already exists for this user
      const { data: existingToken, error: fetchError } = await supabase
        .from('notification_tokens')
        .select('id')
        .eq('user_id', ctx.user.id)
        .eq('token', input.token)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw new Error(`Failed to check existing token: ${fetchError.message}`);
      }

      if (existingToken) {
        // Token already exists, return it
        return { success: true, message: 'Token already registered' };
      }

      // Register new token
      const { data, error } = await supabase
        .from('notification_tokens')
        .insert({
          user_id: ctx.user.id,
          ...input,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to register notification token: ${error.message}`);
      }

      return { success: true, data };
    }),

  // Unregister push notification token
  unregisterToken: protectedProcedure
    .input(z.object({
      token: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { error } = await supabase
        .from('notification_tokens')
        .delete()
        .eq('user_id', ctx.user.id)
        .eq('token', input.token);

      if (error) {
        throw new Error(`Failed to unregister notification token: ${error.message}`);
      }

      return { success: true };
    }),

  // Get user's notification tokens
  getTokens: protectedProcedure
    .query(async ({ ctx }) => {
      const { data, error } = await supabase
        .from('notification_tokens')
        .select('*')
        .eq('user_id', ctx.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch notification tokens: ${error.message}`);
      }

      return data;
    }),

  // Send push notification to user
  send: protectedProcedure
    .input(z.object({
      userId: z.string().uuid(),
      title: z.string().min(1).max(100),
      body: z.string().min(1).max(500),
      data: z.record(z.any()).optional(),
      sound: z.enum(['default', 'none']).default('default'),
      priority: z.enum(['default', 'normal', 'high']).default('normal'),
    }))
    .mutation(async ({ input, ctx }) => {
      // Get user's notification tokens
      const { data: tokens, error: tokensError } = await supabase
        .from('notification_tokens')
        .select('token, platform')
        .eq('user_id', input.userId);

      if (tokensError) {
        throw new Error(`Failed to fetch user tokens: ${tokensError.message}`);
      }

      if (!tokens || tokens.length === 0) {
        throw new Error('User has no registered notification tokens');
      }

      // Prepare push notification payload
      const messages = tokens.map(token => ({
        to: token.token,
        title: input.title,
        body: input.body,
        data: input.data || {},
        sound: input.sound,
        priority: input.priority,
        channelId: 'recovery-companion',
      }));

      // Send push notifications via Expo API
      const response = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
          ...(EXPO_PUSH_ACCESS_TOKEN && {
            'Authorization': `Bearer ${EXPO_PUSH_ACCESS_TOKEN}`,
          }),
        },
        body: JSON.stringify(messages),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to send push notification: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      
      // Log the notification send attempt
      await supabase
        .from('audit_log')
        .insert({
          user_id: ctx.user.id,
          action: 'send_notification',
          meta: {
            target_user_id: input.userId,
            title: input.title,
            body: input.body,
            tokens_sent: tokens.length,
            expo_response: result,
          },
        });

      return {
        success: true,
        tokens_sent: tokens.length,
        expo_response: result,
      };
    }),

  // Send notification to sponsor about sponsee
  sendToSponsor: protectedProcedure
    .input(z.object({
      sponseeId: z.string().uuid(),
      title: z.string().min(1).max(100),
      body: z.string().min(1).max(500),
      data: z.record(z.any()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Verify sponsor relationship
      const { data: relationship, error: relationshipError } = await supabase
        .from('sponsor_relationships')
        .select('sponsor_id')
        .eq('sponsor_id', ctx.user.id)
        .eq('sponsee_id', input.sponseeId)
        .eq('status', 'active')
        .single();

      if (relationshipError || !relationship) {
        throw new Error('Active sponsor relationship not found');
      }

      // Get sponsor's notification tokens
      const { data: tokens, error: tokensError } = await supabase
        .from('notification_tokens')
        .select('token, platform')
        .eq('user_id', relationship.sponsor_id);

      if (tokensError) {
        throw new Error(`Failed to fetch sponsor tokens: ${tokensError.message}`);
      }

      if (!tokens || tokens.length === 0) {
        throw new Error('Sponsor has no registered notification tokens');
      }

      // Send notification to sponsor
      const messages = tokens.map(token => ({
        to: token.token,
        title: input.title,
        body: input.body,
        data: {
          ...input.data,
          sponsee_id: input.sponseeId,
          type: 'sponsor_notification',
        },
        sound: 'default',
        priority: 'high',
        channelId: 'recovery-companion-sponsor',
      }));

      const response = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
          ...(EXPO_PUSH_ACCESS_TOKEN && {
            'Authorization': `Bearer ${EXPO_PUSH_ACCESS_TOKEN}`,
          }),
        },
        body: JSON.stringify(messages),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to send sponsor notification: ${response.status} ${errorText}`);
      }

      const result = await response.json();

      // Log the notification
      await supabase
        .from('audit_log')
        .insert({
          user_id: ctx.user.id,
          action: 'send_sponsor_notification',
          meta: {
            sponsee_id: input.sponseeId,
            sponsor_id: relationship.sponsor_id,
            title: input.title,
            body: input.body,
            tokens_sent: tokens.length,
            expo_response: result,
          },
        });

      return {
        success: true,
        tokens_sent: tokens.length,
        expo_response: result,
      };
    }),

  // Send routine reminder notification
  sendRoutineReminder: protectedProcedure
    .input(z.object({
      routineId: z.string().uuid(),
      title: z.string().min(1).max(100),
      body: z.string().min(1).max(500),
    }))
    .mutation(async ({ input, ctx }) => {
      // Get routine details
      const { data: routine, error: routineError } = await supabase
        .from('routines')
        .select('title, user_id')
        .eq('id', input.routineId)
        .eq('user_id', ctx.user.id)
        .single();

      if (routineError || !routine) {
        throw new Error('Routine not found');
      }

      // Get user's notification tokens
      const { data: tokens, error: tokensError } = await supabase
        .from('notification_tokens')
        .select('token, platform')
        .eq('user_id', ctx.user.id);

      if (tokensError) {
        throw new Error(`Failed to fetch user tokens: ${tokensError.message}`);
      }

      if (!tokens || tokens.length === 0) {
        throw new Error('User has no registered notification tokens');
      }

      // Send routine reminder
      const messages = tokens.map(token => ({
        to: token.token,
        title: input.title,
        body: input.body,
        data: {
          routine_id: input.routineId,
          type: 'routine_reminder',
        },
        sound: 'default',
        priority: 'normal',
        channelId: 'recovery-companion-routine',
      }));

      const response = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
          ...(EXPO_PUSH_ACCESS_TOKEN && {
            'Authorization': `Bearer ${EXPO_PUSH_ACCESS_TOKEN}`,
          }),
        },
        body: JSON.stringify(messages),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to send routine reminder: ${response.status} ${errorText}`);
      }

      const result = await response.json();

      // Log routine notification
      await supabase
        .from('routine_logs')
        .insert({
          routine_id: input.routineId,
          user_id: ctx.user.id,
          status: 'sent',
          note: 'Routine reminder sent',
        });

      return {
        success: true,
        tokens_sent: tokens.length,
        expo_response: result,
      };
    }),

  // Send weekly check-in reminder
  sendWeeklyCheckin: protectedProcedure
    .input(z.object({
      title: z.string().min(1).max(100),
      body: z.string().min(1).max(500),
    }))
    .mutation(async ({ input, ctx }) => {
      // Get user's notification tokens
      const { data: tokens, error: tokensError } = await supabase
        .from('notification_tokens')
        .select('token, platform')
        .eq('user_id', ctx.user.id);

      if (tokensError) {
        throw new Error(`Failed to fetch user tokens: ${tokensError.message}`);
      }

      if (!tokens || tokens.length === 0) {
        throw new Error('User has no registered notification tokens');
      }

      // Send weekly check-in reminder
      const messages = tokens.map(token => ({
        to: token.token,
        title: input.title,
        body: input.body,
        data: {
          type: 'weekly_checkin',
        },
        sound: 'default',
        priority: 'normal',
        channelId: 'recovery-companion-checkin',
      }));

      const response = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
          ...(EXPO_PUSH_ACCESS_TOKEN && {
            'Authorization': `Bearer ${EXPO_PUSH_ACCESS_TOKEN}`,
          }),
        },
        body: JSON.stringify(messages),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to send weekly check-in: ${response.status} ${errorText}`);
      }

      const result = await response.json();

      // Log the notification
      await supabase
        .from('audit_log')
        .insert({
          user_id: ctx.user.id,
          action: 'send_weekly_checkin',
          meta: {
            title: input.title,
            body: input.body,
            tokens_sent: tokens.length,
            expo_response: result,
          },
        });

      return {
        success: true,
        tokens_sent: tokens.length,
        expo_response: result,
      };
    }),

  // Get notification history
  getHistory: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input, ctx }) => {
      const { data, error } = await supabase
        .from('audit_log')
        .select('*')
        .eq('user_id', ctx.user.id)
        .in('action', ['send_notification', 'send_sponsor_notification', 'send_routine_reminder', 'send_weekly_checkin'])
        .order('created_at', { ascending: false })
        .range(input.offset, input.offset + input.limit - 1);

      if (error) {
        throw new Error(`Failed to fetch notification history: ${error.message}`);
      }

      return data;
    }),

  // Update notification preferences (placeholder for future implementation)
  updatePreferences: protectedProcedure
    .input(z.object({
      routineReminders: z.boolean().default(true),
      weeklyCheckins: z.boolean().default(true),
      sponsorNotifications: z.boolean().default(true),
      geofenceAlerts: z.boolean().default(true),
    }))
    .mutation(async ({ input, ctx }) => {
      // This would typically store preferences in a user_preferences table
      // For now, we'll just return success
      return {
        success: true,
        preferences: input,
      };
    }),
});
