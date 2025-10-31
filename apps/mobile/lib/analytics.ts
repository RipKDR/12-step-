/**
 * Analytics Integration
 * PostHog for anonymous analytics (no PII)
 */

let posthogInitialized = false;

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
}

/**
 * Initialize PostHog analytics
 */
export async function initAnalytics() {
  if (posthogInitialized) return;
  
  const posthogKey = process.env.EXPO_PUBLIC_POSTHOG_KEY;
  const posthogHost = process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';
  
  if (!posthogKey) {
    console.warn('PostHog key not configured, analytics disabled');
    return;
  }

  try {
    // TODO: Install and use @posthog/react-native
    // import PostHog from '@posthog/react-native';
    // PostHog.setup(posthogKey, {
    //   host: posthogHost,
    //   enableSessionReplay: false, // Privacy: disable session replay
    //   captureApplicationLifecycleEvents: true,
    //   captureDeepLinks: true,
    // });
    
    // For now, just mark as initialized
    posthogInitialized = true;
    console.log('Analytics initialized (PostHog placeholder)');
  } catch (error) {
    console.error('Failed to initialize analytics:', error);
  }
}

/**
 * Track an event (anonymously, no PII)
 */
export function trackEvent(event: AnalyticsEvent) {
  if (!posthogInitialized) return;
  
  try {
    // TODO: Use actual PostHog tracking
    // PostHog.capture(event.name, {
    //   ...sanitizeProperties(event.properties),
    // });
    
    // Placeholder: log to console in development
    if (__DEV__) {
      console.log('[Analytics]', event.name, event.properties);
    }
  } catch (error) {
    console.error('Failed to track event:', error);
  }
}

/**
 * Sanitize properties to remove PII
 */
function sanitizeProperties(properties?: Record<string, any>): Record<string, any> {
  if (!properties) return {};
  
  const sanitized: Record<string, any> = {};
  const piiFields = ['email', 'phone', 'name', 'handle', 'content', 'notes', 'gratitude'];
  
  for (const [key, value] of Object.entries(properties)) {
    // Skip PII fields
    if (piiFields.includes(key.toLowerCase())) {
      continue;
    }
    
    // Skip free-text content
    if (typeof value === 'string' && value.length > 100) {
      continue;
    }
    
    sanitized[key] = value;
  }
  
  return sanitized;
}

/**
 * Identify user (anonymously, with user ID only)
 */
export function identifyUser(userId: string) {
  if (!posthogInitialized) return;
  
  try {
    // TODO: Use actual PostHog identify
    // PostHog.identify(userId);
    
    if (__DEV__) {
      console.log('[Analytics] Identify:', userId);
    }
  } catch (error) {
    console.error('Failed to identify user:', error);
  }
}

/**
 * Reset analytics (on logout)
 */
export function resetAnalytics() {
  if (!posthogInitialized) return;
  
  try {
    // TODO: Use actual PostHog reset
    // PostHog.reset();
    
    if (__DEV__) {
      console.log('[Analytics] Reset');
    }
  } catch (error) {
    console.error('Failed to reset analytics:', error);
  }
}

