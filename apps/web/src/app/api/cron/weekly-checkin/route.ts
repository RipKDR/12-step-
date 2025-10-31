import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Expo Push API configuration
const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

export async function GET(request: NextRequest) {
  try {
    // Verify this is a legitimate cron request
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Starting weekly check-in cron job...');

    // Get all active users who haven't had a check-in this week
    const startOfWeek = getStartOfWeek();
    const endOfWeek = getEndOfWeek();

    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select(`
        user_id,
        handle,
        timezone
      `)
      .not('user_id', 'is', null);

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    const notificationsToSend = [];

    for (const user of users || []) {
      try {
        // Check if user has had a check-in this week
        const { data: weeklyCheckin } = await supabase
          .from('daily_entries')
          .select('id')
          .eq('user_id', user.user_id)
          .gte('entry_date', startOfWeek.toISOString())
          .lte('entry_date', endOfWeek.toISOString())
          .limit(1);

        if (weeklyCheckin && weeklyCheckin.length > 0) {
          // User already has entries this week, skip
          continue;
        }

        // Check if user has notification tokens
        const { data: tokens } = await supabase
          .from('notification_tokens')
          .select('token, platform')
          .eq('user_id', user.user_id);

        if (!tokens || tokens.length === 0) {
          console.log(`No notification tokens for user ${user.user_id}`);
          continue;
        }

        // Calculate engagement score for the past week
        const engagementScore = await calculateEngagementScore(user.user_id, startOfWeek, endOfWeek);

        // Prepare personalized check-in message
        const { title, body } = generateCheckinMessage(user.handle, engagementScore);

        notificationsToSend.push({
          user_id: user.user_id,
          handle: user.handle,
          tokens,
          title,
          body,
          engagement_score: engagementScore,
        });

      } catch (error) {
        console.error(`Error processing user ${user.user_id}:`, error);
        continue;
      }
    }

    // Send all notifications
    let successCount = 0;
    let errorCount = 0;

    for (const notification of notificationsToSend) {
      try {
        const messages = notification.tokens.map((token: any) => ({
          to: token.token,
          title: notification.title,
          body: notification.body,
          data: {
            type: 'weekly_checkin',
            engagement_score: notification.engagement_score,
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
          },
          body: JSON.stringify(messages),
        });

        if (!response.ok) {
          console.error(`Failed to send check-in notification for user ${notification.user_id}`);
          errorCount++;
          continue;
        }

        // Log the weekly check-in notification
        await supabase
          .from('audit_log')
          .insert({
            user_id: notification.user_id,
            action: 'send_weekly_checkin',
            meta: {
              handle: notification.handle,
              engagement_score: notification.engagement_score,
              title: notification.title,
              body: notification.body,
              tokens_sent: notification.tokens.length,
            },
          });

        successCount++;

      } catch (error) {
        console.error(`Error sending check-in notification for user ${notification.user_id}:`, error);
        errorCount++;
      }
    }

    console.log(`Weekly check-in cron completed: ${successCount} sent, ${errorCount} errors`);

    return NextResponse.json({
      success: true,
      sent: successCount,
      errors: errorCount,
      total: notificationsToSend.length,
    });

  } catch (error) {
    console.error('Weekly check-in cron error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function getStartOfWeek(): Date {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - dayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);
  return startOfWeek;
}

function getEndOfWeek(): Date {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const endOfWeek = new Date(now);
  endOfWeek.setDate(now.getDate() + (6 - dayOfWeek));
  endOfWeek.setHours(23, 59, 59, 999);
  return endOfWeek;
}

async function calculateEngagementScore(userId: string, startDate: Date, endDate: Date): Promise<number> {
  try {
    // Count various engagement activities
    const [
      dailyEntries,
      stepEntries,
      routineLogs,
      geofenceEvents,
    ] = await Promise.all([
      // Daily entries
      supabase
        .from('daily_entries')
        .select('id')
        .eq('user_id', userId)
        .gte('entry_date', startDate.toISOString())
        .lte('entry_date', endDate.toISOString()),
      
      // Step entries
      supabase
        .from('step_entries')
        .select('id')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString()),
      
      // Routine logs
      supabase
        .from('routine_logs')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .gte('run_at', startDate.toISOString())
        .lte('run_at', endDate.toISOString()),
      
      // Geofence events
      supabase
        .from('geofence_events')
        .select('id')
        .eq('user_id', userId)
        .gte('triggered_at', startDate.toISOString())
        .lte('triggered_at', endDate.toISOString()),
    ]);

    const dailyCount = dailyEntries.data?.length || 0;
    const stepCount = stepEntries.data?.length || 0;
    const routineCount = routineLogs.data?.length || 0;
    const geofenceCount = geofenceEvents.data?.length || 0;

    // Calculate engagement score (0-100)
    const maxPossible = 7 + 5 + 10 + 3; // Max daily entries + step entries + routine completions + geofence events
    const actualScore = dailyCount + stepCount + routineCount + geofenceCount;
    
    return Math.min(100, Math.round((actualScore / maxPossible) * 100));
  } catch (error) {
    console.error('Error calculating engagement score:', error);
    return 0;
  }
}

function generateCheckinMessage(handle: string, engagementScore: number): { title: string; body: string } {
  const name = handle || 'there';
  
  if (engagementScore >= 80) {
    return {
      title: `🌟 Great week, ${name}!`,
      body: `Your recovery journey is going strong! Keep up the excellent work. How are you feeling about this week?`,
    };
  } else if (engagementScore >= 50) {
    return {
      title: `💪 Keep going, ${name}!`,
      body: `You're making progress in your recovery. Every step counts. How has this week been for you?`,
    };
  } else if (engagementScore >= 20) {
    return {
      title: `🤗 How are you doing, ${name}?`,
      body: `Recovery is a journey with ups and downs. We're here to support you. How can we help this week?`,
    };
  } else {
    return {
      title: `💙 We're thinking of you, ${name}`,
      body: `Recovery takes courage, and you're not alone. How are you feeling? We're here when you're ready.`,
    };
  }
}
