import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
);

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationData {
  type: 'geofence_trigger' | 'routine_reminder' | 'sponsor_message' | 'general';
  action?: string;
  planId?: string;
  locationId?: string;
  sponseeId?: string;
  is_simulation?: boolean;
}

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    if (!Device.isDevice) {
      console.log('Must use physical device for push notifications');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}

/**
 * Register for push notifications and save token to server
 */
export async function registerForPushNotifications(): Promise<string | null> {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return null;
    }

    const token = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID,
    });

    const userId = await AsyncStorage.getItem('user_id');
    if (!userId) {
      console.error('No user ID found in storage');
      return null;
    }

    // Save token to server
    const { error } = await supabase
      .from('notification_tokens')
      .upsert({
        user_id: userId,
        token: token.data,
        platform: Platform.OS,
      });

    if (error) {
      console.error('Error saving notification token:', error);
      return null;
    }

    // Save token locally for later use
    await AsyncStorage.setItem('expo_push_token', token.data);

    return token.data;
  } catch (error) {
    console.error('Error registering for push notifications:', error);
    return null;
  }
}

/**
 * Schedule a local notification
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  data?: NotificationData,
  trigger?: Notifications.NotificationTriggerInput
): Promise<string | null> {
  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: 'default',
      },
      trigger: trigger || null, // null means deliver immediately
    });

    return notificationId;
  } catch (error) {
    console.error('Error scheduling local notification:', error);
    return null;
  }
}

/**
 * Schedule a routine reminder notification
 */
export async function scheduleRoutineReminder(
  routineId: string,
  title: string,
  body: string,
  scheduledTime: Date
): Promise<string | null> {
  try {
    const trigger: Notifications.NotificationTriggerInput = {
      date: scheduledTime,
    };

    const notificationId = await scheduleLocalNotification(
      title,
      body,
      {
        type: 'routine_reminder',
        action: 'open_routine',
        planId: routineId,
      },
      trigger
    );

    return notificationId;
  } catch (error) {
    console.error('Error scheduling routine reminder:', error);
    return null;
  }
}

/**
 * Schedule a geofence notification
 */
export async function scheduleGeofenceNotification(
  locationLabel: string,
  eventType: 'enter' | 'exit',
  actionPlanId?: string,
  locationId?: string
): Promise<string | null> {
  try {
    const title = eventType === 'enter' 
      ? `🚨 ${locationLabel}` 
      : `✅ ${locationLabel}`;
    
    const body = eventType === 'enter'
      ? "You've entered a trigger location. Stay mindful and reach out if you need support."
      : "You've left the trigger location. Great job staying mindful!";

    const notificationId = await scheduleLocalNotification(
      title,
      body,
      {
        type: 'geofence_trigger',
        action: eventType === 'enter' ? 'open_action_plan' : 'location_exit',
        planId: actionPlanId,
        locationId: locationId,
      }
    );

    return notificationId;
  } catch (error) {
    console.error('Error scheduling geofence notification:', error);
    return null;
  }
}

/**
 * Schedule a sponsor message notification
 */
export async function scheduleSponsorMessage(
  sponsorName: string,
  message: string,
  sponseeId?: string
): Promise<string | null> {
  try {
    const notificationId = await scheduleLocalNotification(
      `Message from ${sponsorName}`,
      message,
      {
        type: 'sponsor_message',
        action: 'open_messages',
        sponseeId: sponseeId,
      }
    );

    return notificationId;
  } catch (error) {
    console.error('Error scheduling sponsor message notification:', error);
    return null;
  }
}

/**
 * Cancel a specific notification
 */
export async function cancelNotification(notificationId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error('Error canceling notification:', error);
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error canceling all notifications:', error);
  }
}

/**
 * Get all scheduled notifications
 */
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
}

/**
 * Handle notification response (when user taps notification)
 */
export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

/**
 * Handle notification received (when app is in foreground)
 */
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
): Notifications.Subscription {
  return Notifications.addNotificationReceivedListener(callback);
}

/**
 * Initialize notifications for the app
 */
export async function initializeNotifications(): Promise<boolean> {
  try {
    // Request permissions
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return false;
    }

    // Register for push notifications
    const token = await registerForPushNotifications();
    if (!token) {
      console.log('Failed to register for push notifications');
      return false;
    }

    console.log('Notifications initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing notifications:', error);
    return false;
  }
}

/**
 * Send push notification to a specific user
 */
export async function sendPushNotification(
  userId: string,
  title: string,
  body: string,
  data?: NotificationData
): Promise<boolean> {
  try {
    // Get user's push token
    const { data: tokenData, error: tokenError } = await supabase
      .from('notification_tokens')
      .select('token')
      .eq('user_id', userId)
      .single();

    if (tokenError || !tokenData) {
      console.error('Error getting push token for user:', tokenError);
      return false;
    }

    // Send push notification via Expo Push API
    const message = {
      to: tokenData.token,
      title,
      body,
      data: data || {},
      sound: 'default',
    };

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    const result = await response.json();
    
    if (result.data && result.data.status === 'ok') {
      console.log('Push notification sent successfully');
      return true;
    } else {
      console.error('Error sending push notification:', result);
      return false;
    }
  } catch (error) {
    console.error('Error sending push notification:', error);
    return false;
  }
}
