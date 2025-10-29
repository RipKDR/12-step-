import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';

export const GEOFENCING_TASK_NAME = 'geofencing-task';

// This task runs in the background when a geofencing event occurs.
TaskManager.defineTask(GEOFENCING_TASK_NAME, ({ data, error }) => {
  if (error) {
    console.error('Geofencing task error:', error);
    return;
  }
  if (data) {
    const { eventType, region } = data as any;
    
    if (eventType === Location.GeofencingEventType.Enter) {
      console.log("You've entered region:", region);
      
      // TODO: Fetch the Action Plan associated with this region's identifier.
      const actionPlan = { title: "You've entered a high-risk area.", message: "Time to check in. Would you like to call your sponsor?" };
      
      // Surface the matching Action Plan via a push notification
      Notifications.scheduleNotificationAsync({
        content: {
          title: actionPlan.title,
          body: actionPlan.message,
          data: { action: 'call-sponsor', planId: region.identifier },
        },
        trigger: null, // deliver immediately
      });
    } else if (eventType === Location.GeofencingEventType.Exit) {
      console.log("You've left region:", region);
    }
  }
});

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
