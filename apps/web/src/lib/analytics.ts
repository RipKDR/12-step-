/**
 * Analytics Integration (Web)
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
export function initAnalytics() {
  if (posthogInitialized || typeof window === 'undefined') return;
  
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';
  
  if (!posthogKey) {
    console.warn('PostHog key not configured, analytics disabled');
    return;
  }

  try {
    // TODO: Install and use posthog-js
    // import posthog from 'posthog-js';
    // posthog.init(posthogKey, {
    //   api_host: posthogHost,
    //   session_recording: {
    //     maskAllInputs: true, // Privacy: mask all inputs
    //     maskAllText: false,
    //   },
    //   capture_pageview: true,
    //   capture_pageleave: true,
    // });
    
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
  if (!posthogInitialized || typeof window === 'undefined') return;
  
  try {
    // TODO: Use actual PostHog tracking
    // posthog.capture(event.name, {
    //   ...sanitizeProperties(event.properties),
    // });
    
    // Placeholder: log to console in development
    if (process.env.NODE_ENV === 'development') {
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
  const piiFields = ['email', 'phone', 'name', 'handle', 'content', 'notes'];
  
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
  if (!posthogInitialized || typeof window === 'undefined') return;
  
  try {
    // TODO: Use actual PostHog identify
    // posthog.identify(userId);
    
    if (process.env.NODE_ENV === 'development') {
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
  if (!posthogInitialized || typeof window === 'undefined') return;
  
  try {
    // TODO: Use actual PostHog reset
    // posthog.reset();
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics] Reset');
    }
  } catch (error) {
    console.error('Failed to reset analytics:', error);
  }
}

