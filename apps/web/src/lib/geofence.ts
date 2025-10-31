import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface TriggerLocation {
  id: string;
  user_id: string;
  label: string;
  lat: number;
  lng: number;
  radius_m: number;
  on_enter: string[];
  on_exit: string[];
  active: boolean;
}

export interface ActionPlan {
  id: string;
  user_id: string;
  title: string;
  situation: string;
  if_then: Array<{
    condition: string;
    action: string;
  }>;
  emergency_contacts: Array<{
    name: string;
    phone: string;
    relationship: string;
  }>;
  is_shared_with_sponsor: boolean;
}

export interface GeofenceEvent {
  user_id: string;
  location_id: string;
  event_type: 'enter' | 'exit';
  triggered_at: Date;
  action_plan_id?: string;
  response_taken?: string;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Check if a location is within any active geofence
 */
export async function checkGeofenceTriggers(
  userId: string,
  currentLat: number,
  currentLng: number
): Promise<GeofenceEvent[]> {
  try {
    // Get all active trigger locations for the user
    const { data: triggerLocations, error: locationsError } = await supabase
      .from("trigger_locations")
      .select("*")
      .eq("user_id", userId)
      .eq("active", true);

    if (locationsError) {
      console.error("Error fetching trigger locations:", locationsError);
      return [];
    }

    const events: GeofenceEvent[] = [];

    for (const location of triggerLocations || []) {
      const distance = calculateDistance(
        currentLat,
        currentLng,
        location.lat,
        location.lng
      );

      const isInside = distance <= location.radius_m;

      // Check if we have a recent event for this location to determine enter/exit
      const { data: recentEvents } = await supabase
        .from("geofence_events")
        .select("event_type")
        .eq("user_id", userId)
        .eq("location_id", location.id)
        .order("triggered_at", { ascending: false })
        .limit(1);

      const lastEventType = recentEvents?.[0]?.event_type;
      let eventType: 'enter' | 'exit' | null = null;

      if (isInside && lastEventType !== 'enter') {
        eventType = 'enter';
      } else if (!isInside && lastEventType === 'enter') {
        eventType = 'exit';
      }

      if (eventType) {
        const event: GeofenceEvent = {
          user_id: userId,
          location_id: location.id,
          event_type: eventType,
          triggered_at: new Date(),
        };

        // Find relevant action plan
        const { data: actionPlans } = await supabase
          .from("action_plans")
          .select("*")
          .eq("user_id", userId)
          .eq("is_shared_with_sponsor", true);

        if (actionPlans && actionPlans.length > 0) {
          // Find the most relevant action plan based on the situation
          const relevantPlan = actionPlans.find(plan => 
            plan.situation.toLowerCase().includes(location.label.toLowerCase()) ||
            plan.title.toLowerCase().includes(location.label.toLowerCase())
          );
          
          if (relevantPlan) {
            event.action_plan_id = relevantPlan.id;
          }
        }

        events.push(event);
      }
    }

    return events;
  } catch (error) {
    console.error("Error checking geofence triggers:", error);
    return [];
  }
}

/**
 * Process geofence events and trigger appropriate actions
 */
export async function processGeofenceEvents(events: GeofenceEvent[]): Promise<void> {
  for (const event of events) {
    try {
      // Log the geofence event
      const { error: logError } = await supabase
        .from("geofence_events")
        .insert({
          user_id: event.user_id,
          location_id: event.location_id,
          event_type: event.event_type,
          triggered_at: event.triggered_at.toISOString(),
          action_plan_id: event.action_plan_id,
        });

      if (logError) {
        console.error("Error logging geofence event:", logError);
        continue;
      }

      // If there's an action plan, trigger the appropriate actions
      if (event.action_plan_id) {
        await triggerActionPlan(event);
      }

      // Send notification to sponsor if relationship exists
      await notifySponsor(event);

    } catch (error) {
      console.error("Error processing geofence event:", error);
    }
  }
}

/**
 * Trigger action plan based on geofence event
 */
async function triggerActionPlan(event: GeofenceEvent): Promise<void> {
  try {
    const { data: actionPlan } = await supabase
      .from("action_plans")
      .select("*")
      .eq("id", event.action_plan_id)
      .single();

    if (!actionPlan) return;

    // Get the appropriate actions based on event type
    const actions = event.event_type === 'enter' 
      ? actionPlan.on_enter || []
      : actionPlan.on_exit || [];

    // Log the triggered actions
    for (const action of actions) {
      await supabase
        .from("action_plan_logs")
        .insert({
          action_plan_id: event.action_plan_id,
          user_id: event.user_id,
          action: action,
          triggered_at: event.triggered_at.toISOString(),
          trigger_type: 'geofence',
          trigger_location_id: event.location_id,
        });
    }

    // Update the event with response taken
    await supabase
      .from("geofence_events")
      .update({
        response_taken: actions.join(", "),
      })
      .eq("user_id", event.user_id)
      .eq("location_id", event.location_id)
      .eq("triggered_at", event.triggered_at.toISOString());

  } catch (error) {
    console.error("Error triggering action plan:", error);
  }
}

/**
 * Notify sponsor about geofence event
 */
async function notifySponsor(event: GeofenceEvent): Promise<void> {
  try {
    // Get sponsor relationship
    const { data: relationship } = await supabase
      .from("sponsor_relationships")
      .select("sponsor_id")
      .eq("sponsee_id", event.user_id)
      .eq("status", "active")
      .single();

    if (!relationship) return;

    // Get trigger location details
    const { data: location } = await supabase
      .from("trigger_locations")
      .select("label")
      .eq("id", event.location_id)
      .single();

    // Create notification
    const notification = {
      user_id: relationship.sponsor_id,
      type: 'geofence_trigger',
      title: `Geofence Alert: ${location?.label || 'Unknown Location'}`,
      message: `Your sponsee ${event.event_type === 'enter' ? 'entered' : 'exited'} a trigger location`,
      data: {
        sponsee_id: event.user_id,
        location_id: event.location_id,
        event_type: event.event_type,
        action_plan_id: event.action_plan_id,
      },
    };

    await supabase
      .from("notifications")
      .insert(notification);

  } catch (error) {
    console.error("Error notifying sponsor:", error);
  }
}

/**
 * Get geofence events for a user
 */
export async function getGeofenceEvents(
  userId: string,
  limit: number = 50
): Promise<GeofenceEvent[]> {
  try {
    const { data, error } = await supabase
      .from("geofence_events")
      .select(`
        *,
        trigger_locations!inner(label)
      `)
      .eq("user_id", userId)
      .order("triggered_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching geofence events:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching geofence events:", error);
    return [];
  }
}

/**
 * Simulate geofence trigger for testing
 */
export async function simulateGeofenceTrigger(
  userId: string,
  locationId: string,
  eventType: 'enter' | 'exit'
): Promise<GeofenceEvent | null> {
  try {
    const event: GeofenceEvent = {
      user_id: userId,
      location_id: locationId,
      event_type: eventType,
      triggered_at: new Date(),
    };

    await processGeofenceEvents([event]);
    return event;
  } catch (error) {
    console.error("Error simulating geofence trigger:", error);
    return null;
  }
}
