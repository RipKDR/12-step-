import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const GEOFENCING_TASK_NAME = 'geofencing-task';

// Initialize Supabase client
const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
);

// This task runs in the background when a geofencing event occurs.
TaskManager.defineTask(GEOFENCING_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('Geofencing task error:', error);
    return;
  }
  
  if (data) {
    const { eventType, region } = data as any;
    
    try {
      // Get user ID from storage
      const userId = await AsyncStorage.getItem('user_id');
      if (!userId) {
        console.error('No user ID found in storage');
        return;
      }

      // Log the geofence event
      const { error: logError } = await supabase
        .from('geofence_events')
        .insert({
          user_id: userId,
          location_id: region.identifier,
          event_type: eventType === Location.GeofencingEventType.Enter ? 'enter' : 'exit',
          triggered_at: new Date().toISOString(),
        });

      if (logError) {
        console.error('Error logging geofence event:', logError);
      }

      if (eventType === Location.GeofencingEventType.Enter) {
        console.log("You've entered region:", region);
        await handleGeofenceEnter(userId, region);
      } else if (eventType === Location.GeofencingEventType.Exit) {
        console.log("You've left region:", region);
        await handleGeofenceExit(userId, region);
      }
    } catch (error) {
      console.error('Error in geofencing task:', error);
    }
  }
});

async function handleGeofenceEnter(userId: string, region: any) {
  try {
    // Get trigger location details
    const { data: triggerLocation, error: locationError } = await supabase
      .from('trigger_locations')
      .select('*')
      .eq('id', region.identifier)
      .eq('user_id', userId)
      .single();

    if (locationError || !triggerLocation) {
      console.error('Error fetching trigger location:', locationError);
      return;
    }

    // Get action plan for this location
    const { data: actionPlans, error: plansError } = await supabase
      .from('action_plans')
      .select('*')
      .eq('user_id', userId)
      .eq('is_shared_with_sponsor', true);

    if (plansError) {
      console.error('Error fetching action plans:', plansError);
      return;
    }

    // Find relevant action plan
    const relevantPlan = actionPlans?.find(plan => 
      plan.situation.toLowerCase().includes(triggerLocation.label.toLowerCase()) ||
      plan.title.toLowerCase().includes(triggerLocation.label.toLowerCase())
    );

    if (relevantPlan) {
      // Log action plan trigger
      await supabase
        .from('action_plan_logs')
        .insert({
          action_plan_id: relevantPlan.id,
          user_id: userId,
          action: 'Geofence trigger - Enter',
          triggered_at: new Date().toISOString(),
          trigger_type: 'geofence',
          trigger_location_id: region.identifier,
        });

      // Send notification with action plan
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `🚨 ${triggerLocation.label}`,
          body: `You've entered a trigger location. ${relevantPlan.situation}`,
          data: { 
            action: 'open_action_plan', 
            planId: relevantPlan.id,
            locationId: region.identifier,
            type: 'geofence_enter'
          },
        },
        trigger: null, // deliver immediately
      });

      // Notify sponsor
      await notifySponsor(userId, triggerLocation, relevantPlan, 'enter');
    } else {
      // Default notification if no specific action plan
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `📍 ${triggerLocation.label}`,
          body: "You've entered a trigger location. Stay mindful and reach out if you need support.",
          data: { 
            action: 'general_alert',
            locationId: region.identifier,
            type: 'geofence_enter'
          },
        },
        trigger: null,
      });
    }
  } catch (error) {
    console.error('Error handling geofence enter:', error);
  }
}

async function handleGeofenceExit(userId: string, region: any) {
  try {
    // Get trigger location details
    const { data: triggerLocation, error: locationError } = await supabase
      .from('trigger_locations')
      .select('*')
      .eq('id', region.identifier)
      .eq('user_id', userId)
      .single();

    if (locationError || !triggerLocation) {
      console.error('Error fetching trigger location:', locationError);
      return;
    }

    // Log exit event
    await supabase
      .from('geofence_events')
      .update({
        response_taken: 'Exited trigger location',
      })
      .eq('user_id', userId)
      .eq('location_id', region.identifier)
      .eq('triggered_at', new Date().toISOString());

    // Send exit notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `✅ ${triggerLocation.label}`,
        body: "You've left the trigger location. Great job staying mindful!",
        data: { 
          action: 'location_exit',
          locationId: region.identifier,
          type: 'geofence_exit'
        },
      },
      trigger: null,
    });

    // Notify sponsor
    await notifySponsor(userId, triggerLocation, null, 'exit');
  } catch (error) {
    console.error('Error handling geofence exit:', error);
  }
}

async function notifySponsor(
  userId: string, 
  triggerLocation: any, 
  actionPlan: any, 
  eventType: 'enter' | 'exit'
) {
  try {
    // Get sponsor relationship
    const { data: relationship } = await supabase
      .from('sponsor_relationships')
      .select('sponsor_id')
      .eq('sponsee_id', userId)
      .eq('status', 'active')
      .single();

    if (!relationship) return;

    // Create notification for sponsor
    const notification = {
      user_id: relationship.sponsor_id,
      type: 'geofence_trigger',
      title: `Geofence Alert: ${triggerLocation.label}`,
      message: `Your sponsee ${eventType === 'enter' ? 'entered' : 'exited'} a trigger location`,
      data: {
        sponsee_id: userId,
        location_id: triggerLocation.id,
        event_type: eventType,
        action_plan_id: actionPlan?.id,
      },
    };

    await supabase
      .from('notifications')
      .insert(notification);

  } catch (error) {
    console.error('Error notifying sponsor:', error);
  }
}

// Helper function to start geofencing
export async function startGeofencing(regions: Location.GeofencingRegion[]) {
    // Verify permissions
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    if (foregroundStatus !== 'granted') {
        console.error('Foreground location permission not granted');
        return;
    }

    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    if (backgroundStatus !== 'granted') {
        console.error('Background location permission not granted');
        return;
    }

    // Start monitoring
    await Location.startGeofencingAsync(GEOFENCING_TASK_NAME, regions);
    console.log('Geofencing started for regions:', regions.map(r => r.identifier));
}
