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

    console.log('Starting routine nudges cron job...');

    // Get all active routines that should run today
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const currentHour = today.getHours();

    const { data: routines, error: routinesError } = await supabase
      .from('routines')
      .select(`
        *,
        profiles!inner(user_id, handle)
      `)
      .eq('active', true)
      .not('schedule', 'is', null);

    if (routinesError) {
      console.error('Error fetching routines:', routinesError);
      return NextResponse.json({ error: 'Failed to fetch routines' }, { status: 500 });
    }

    const notificationsToSend = [];

    for (const routine of routines || []) {
      try {
        const schedule = routine.schedule as any;
        
        // Check if routine should run today
        const shouldRunToday = checkIfRoutineShouldRun(schedule, dayOfWeek, currentHour);
        
        if (!shouldRunToday) continue;

        // Check if routine was already completed today
        const { data: todayLog } = await supabase
          .from('routine_logs')
          .select('id')
          .eq('routine_id', routine.id)
          .eq('user_id', routine.user_id)
          .gte('run_at', new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString())
          .limit(1);

        if (todayLog && todayLog.length > 0) {
          // Already completed today, skip
          continue;
        }

        // Get user's notification tokens
        const { data: tokens } = await supabase
          .from('notification_tokens')
          .select('token, platform')
          .eq('user_id', routine.user_id);

        if (!tokens || tokens.length === 0) {
          console.log(`No notification tokens for user ${routine.user_id}`);
          continue;
        }

        // Prepare notification
        const title = `🔄 ${routine.title}`;
        const body = `Time for your routine! ${routine.description || 'Stay consistent with your recovery journey.'}`;

        notificationsToSend.push({
          routine_id: routine.id,
          user_id: routine.user_id,
          tokens,
          title,
          body,
        });

      } catch (error) {
        console.error(`Error processing routine ${routine.id}:`, error);
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
            routine_id: notification.routine_id,
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
          },
          body: JSON.stringify(messages),
        });

        if (!response.ok) {
          console.error(`Failed to send notification for routine ${notification.routine_id}`);
          errorCount++;
          continue;
        }

        // Log the routine reminder
        await supabase
          .from('routine_logs')
          .insert({
            routine_id: notification.routine_id,
            user_id: notification.user_id,
            status: 'sent',
            note: 'Routine reminder sent via cron',
          });

        successCount++;

      } catch (error) {
        console.error(`Error sending notification for routine ${notification.routine_id}:`, error);
        errorCount++;
      }
    }

    console.log(`Routine nudges cron completed: ${successCount} sent, ${errorCount} errors`);

    return NextResponse.json({
      success: true,
      sent: successCount,
      errors: errorCount,
      total: notificationsToSend.length,
    });

  } catch (error) {
    console.error('Routine nudges cron error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function checkIfRoutineShouldRun(schedule: any, dayOfWeek: number, currentHour: number): boolean {
  if (!schedule) return false;

  // Handle different schedule formats
  if (schedule.type === 'daily') {
    return schedule.hours?.includes(currentHour) || false;
  }

  if (schedule.type === 'weekly') {
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[dayOfWeek];
    
    if (!schedule.days?.[dayName]) return false;
    
    return schedule.days[dayName].hours?.includes(currentHour) || false;
  }

  if (schedule.type === 'custom') {
    // Handle custom schedule format
    const todaySchedule = schedule[dayOfWeek];
    if (!todaySchedule) return false;
    
    return todaySchedule.hours?.includes(currentHour) || false;
  }

  return false;
}
