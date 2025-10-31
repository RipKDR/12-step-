import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
);

export interface GeofenceEvent {
  user_id: string;
  location_id: string;
  event_type: 'enter' | 'exit';
  triggered_at: Date;
  action_plan_id?: string;
  response_taken?: string;
}

/**
 * Simulate geofence trigger for testing
 */
export async function simulateGeofenceTrigger(
  locationId: string,
  eventType: 'enter' | 'exit'
): Promise<GeofenceEvent | null> {
  try {
    const userId = await AsyncStorage.getItem('user_id');
    if (!userId) {
      console.error('No user ID found in storage');
      return null;
    }

    const event: GeofenceEvent = {
      user_id: userId,
      location_id: locationId,
      event_type: eventType,
      triggered_at: new Date(),
    };

    // Log the geofence event
    const { error: logError } = await supabase
      .from('geofence_events')
      .insert({
        user_id: event.user_id,
        location_id: event.location_id,
        event_type: event.event_type,
        triggered_at: event.triggered_at.toISOString(),
      });

    if (logError) {
      console.error('Error logging geofence event:', logError);
      return null;
    }

    // Get trigger location details
    const { data: triggerLocation, error: locationError } = await supabase
      .from('trigger_locations')
      .select('*')
      .eq('id', locationId)
      .eq('user_id', userId)
      .single();

    if (locationError || !triggerLocation) {
      console.error('Error fetching trigger location:', locationError);
      return null;
    }

    // Get action plan for this location
    const { data: actionPlans, error: plansError } = await supabase
      .from('action_plans')
      .select('*')
      .eq('user_id', userId)
      .eq('is_shared_with_sponsor', true);

    if (plansError) {
      console.error('Error fetching action plans:', plansError);
      return null;
    }

    // Find relevant action plan
    const relevantPlan = actionPlans?.find(plan => 
      plan.situation.toLowerCase().includes(triggerLocation.label.toLowerCase()) ||
      plan.title.toLowerCase().includes(triggerLocation.label.toLowerCase())
    );

    if (relevantPlan) {
      event.action_plan_id = relevantPlan.id;
      
      // Log action plan trigger
      await supabase
        .from('action_plan_logs')
        .insert({
          action_plan_id: relevantPlan.id,
          user_id: userId,
          action: `Simulated geofence ${eventType}`,
          triggered_at: event.triggered_at.toISOString(),
          trigger_type: 'geofence_simulation',
          trigger_location_id: locationId,
        });

      // Update the event with response taken
      await supabase
        .from('geofence_events')
        .update({
          response_taken: `Simulated ${eventType} - Action plan triggered`,
        })
        .eq('user_id', event.user_id)
        .eq('location_id', event.location_id)
        .eq('triggered_at', event.triggered_at.toISOString());
    }

    // Notify sponsor
    await notifySponsor(userId, triggerLocation, relevantPlan, eventType);

    return event;
  } catch (error) {
    console.error('Error simulating geofence trigger:', error);
    return null;
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
      type: 'geofence_simulation',
      title: `[TEST] Geofence Alert: ${triggerLocation.label}`,
      message: `Your sponsee ${eventType === 'enter' ? 'entered' : 'exited'} a trigger location (simulated)`,
      data: {
        sponsee_id: userId,
        location_id: triggerLocation.id,
        event_type: eventType,
        action_plan_id: actionPlan?.id,
        is_simulation: true,
      },
    };

    await supabase
      .from('notifications')
      .insert(notification);

  } catch (error) {
    console.error('Error notifying sponsor:', error);
  }
}

/**
 * Get geofence event history for debugging
 */
export async function getGeofenceEventHistory(limit: number = 20): Promise<any[]> {
  try {
    const userId = await AsyncStorage.getItem('user_id');
    if (!userId) return [];

    const { data, error } = await supabase
      .from('geofence_events')
      .select(`
        *,
        trigger_locations!inner(label, lat, lng)
      `)
      .eq('user_id', userId)
      .order('triggered_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching geofence event history:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching geofence event history:', error);
    return [];
  }
}
