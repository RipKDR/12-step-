import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper to generate thread ID from two user IDs (deterministic)
function generateThreadId(userId1: string, userId2: string): string {
  const sorted = [userId1, userId2].sort();
  // Use a simple hash of the sorted IDs to create a consistent thread ID
  return `thread_${sorted[0]}_${sorted[1]}`;
}

// Helper to verify sponsor relationship exists and is active
async function verifySponsorRelationship(
  userId1: string,
  userId2: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('sponsor_relationships')
    .select('id, status')
    .or(`sponsor_id.eq.${userId1},sponsee_id.eq.${userId1}`)
    .or(`sponsor_id.eq.${userId2},sponsee_id.eq.${userId2}`)
    .eq('status', 'active')
    .single();

  if (error || !data) return false;

  // Verify the relationship involves both users
  const relationship = data as any;
  return (
    (relationship.sponsor_id === userId1 && relationship.sponsee_id === userId2) ||
    (relationship.sponsor_id === userId2 && relationship.sponsee_id === userId1)
  );
}

export const messagesRouter = router({
  // Send a message (encrypted client-side, stored as ciphertext)
  send: protectedProcedure
    .input(z.object({
      recipientId: z.string().uuid(),
      contentCiphertext: z.string().min(1),
      nonce: z.string().min(1),
    }))
    .mutation(async ({ input, ctx }) => {
      const senderId = ctx.user.id;

      // Verify sponsor relationship exists
      const hasRelationship = await verifySponsorRelationship(
        senderId,
        input.recipientId
      );

      if (!hasRelationship) {
        throw new Error('Active sponsor relationship required to send messages');
      }

      // Generate thread ID
      const threadId = generateThreadId(senderId, input.recipientId);

      // Insert message (content is already encrypted client-side)
      const { data, error } = await supabase
        .from('messages')
        .insert({
          thread_id: threadId,
          sender_id: senderId,
          recipient_id: input.recipientId,
          content_ciphertext: input.contentCiphertext,
          nonce: input.nonce,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to send message: ${error.message}`);
      }

      // Log audit action
      await supabase.from('audit_log').insert({
        user_id: senderId,
        action: 'message_sent',
        meta: {
          recipient_id: input.recipientId,
          thread_id: threadId,
        },
      });

      return data;
    }),

  // Get messages for a thread
  getThread: protectedProcedure
    .input(z.object({
      otherUserId: z.string().uuid(),
      limit: z.number().min(1).max(100).default(50),
      before: z.string().optional(), // Message ID for pagination
    }))
    .query(async ({ input, ctx }) => {
      const currentUserId = ctx.user.id;

      // Verify sponsor relationship
      const hasRelationship = await verifySponsorRelationship(
        currentUserId,
        input.otherUserId
      );

      if (!hasRelationship) {
        throw new Error('Active sponsor relationship required to view messages');
      }

      const threadId = generateThreadId(currentUserId, input.otherUserId);

      let query = supabase
        .from('messages')
        .select('*')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: false })
        .limit(input.limit);

      // Pagination: get messages before a specific message
      if (input.before) {
        const { data: beforeMessage } = await supabase
          .from('messages')
          .select('created_at')
          .eq('id', input.before)
          .single();

        if (beforeMessage) {
          query = query.lt('created_at', beforeMessage.created_at);
        }
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch messages: ${error.message}`);
      }

      // Return messages in chronological order (oldest first)
      return (data || []).reverse();
    }),

  // Get all threads for the current user
  getThreads: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.user.id;

      // Get all unique thread IDs where user is sender or recipient
      const { data: messages, error } = await supabase
        .from('messages')
        .select('thread_id, sender_id, recipient_id, created_at')
        .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch threads: ${error.message}`);
      }

      // Group by thread and get most recent message for each
      const threadMap = new Map<string, any>();
      
      for (const msg of messages || []) {
        if (!threadMap.has(msg.thread_id)) {
          threadMap.set(msg.thread_id, {
            thread_id: msg.thread_id,
            other_user_id: msg.sender_id === userId ? msg.recipient_id : msg.sender_id,
            last_message_at: msg.created_at,
          });
        }
      }

      // Get user profiles for other users
      const otherUserIds = Array.from(threadMap.values()).map(
        (t) => t.other_user_id
      );

      if (otherUserIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, handle, display_name, avatar_url')
          .in('user_id', otherUserIds);

        const profileMap = new Map(
          (profiles || []).map((p) => [p.user_id, p])
        );

        // Attach profile info to threads
        for (const thread of threadMap.values()) {
          const profile = profileMap.get(thread.other_user_id);
          thread.other_user = profile || null;
        }
      }

      return Array.from(threadMap.values()).sort(
        (a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
      );
    }),

  // Mark messages as read (optional - could add read receipts)
  markAsRead: protectedProcedure
    .input(z.object({
      threadId: z.string(),
      lastReadMessageId: z.string().uuid(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Note: This is a placeholder for read receipts
      // Would require adding a read_at or read_by field to messages table
      // For now, just log the action
      await supabase.from('audit_log').insert({
        user_id: ctx.user.id,
        action: 'messages_read',
        meta: {
          thread_id: input.threadId,
          last_read_message_id: input.lastReadMessageId,
        },
      });

      return { success: true };
    }),

  // Delete a message (only sender can delete their own messages)
  delete: protectedProcedure
    .input(z.object({
      messageId: z.string().uuid(),
    }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id;

      // Verify message belongs to user
      const { data: message, error: fetchError } = await supabase
        .from('messages')
        .select('sender_id')
        .eq('id', input.messageId)
        .single();

      if (fetchError || !message) {
        throw new Error('Message not found');
      }

      if (message.sender_id !== userId) {
        throw new Error('Can only delete your own messages');
      }

      // Delete the message
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', input.messageId);

      if (error) {
        throw new Error(`Failed to delete message: ${error.message}`);
      }

      // Log audit action
      await supabase.from('audit_log').insert({
        user_id: userId,
        action: 'message_deleted',
        meta: {
          message_id: input.messageId,
        },
      });

      return { success: true };
    }),
});

