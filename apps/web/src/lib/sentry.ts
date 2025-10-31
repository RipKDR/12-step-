/**
 * Sentry Error Tracking Integration (Web)
 * Error monitoring and performance tracking
 */

let sentryInitialized = false;

/**
 * Initialize Sentry error tracking
 */
export function initSentry() {
  if (sentryInitialized || typeof window === 'undefined') return;
  
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  
  if (!dsn) {
    console.warn('Sentry DSN not configured, error tracking disabled');
    return;
  }

  try {
    // TODO: Install and use @sentry/nextjs
    // import * as Sentry from '@sentry/nextjs';
    // 
    // Sentry.init({
    //   dsn,
    //   environment: process.env.NODE_ENV || 'development',
    //   tracesSampleRate: 0.1, // 10% of transactions
    //   beforeSend(event) {
    //     // Privacy: Remove PII from error events
    //     if (event.user) {
    //       delete event.user.email;
    //       delete event.user.name;
    //       delete event.user.username;
    //     }
    //     // Remove sensitive data from breadcrumbs
    //     if (event.breadcrumbs) {
    //       event.breadcrumbs = event.breadcrumbs.map((crumb) => {
    //         if (crumb.data) {
    //           const sensitiveKeys = ['content', 'notes', 'gratitude', 'message'];
    //           sensitiveKeys.forEach((key) => {
    //             if (crumb.data[key]) {
    //               crumb.data[key] = '[REDACTED]';
    //             }
    //           });
    //         }
    //         return crumb;
    //       });
    //     }
    //     return event;
    //   },
    // });
    
    sentryInitialized = true;
    console.log('Sentry initialized (placeholder)');
  } catch (error) {
    console.error('Failed to initialize Sentry:', error);
  }
}

/**
 * Capture an exception
 */
export function captureException(error: Error, context?: Record<string, any>) {
  if (!sentryInitialized || typeof window === 'undefined') {
    console.error('Error (Sentry not initialized):', error);
    return;
  }
  
  try {
    // TODO: Use actual Sentry capture
    // Sentry.captureException(error, {
    //   extra: sanitizeContext(context),
    // });
    
    console.error('Error captured:', error, context);
  } catch (err) {
    console.error('Failed to capture exception:', err);
  }
}

/**
 * Capture a message
 */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  if (!sentryInitialized || typeof window === 'undefined') {
    console.log(`[${level}]`, message);
    return;
  }
  
  try {
    // TODO: Use actual Sentry capture
    // Sentry.captureMessage(message, {
    //   level: level as any,
    // });
    
    console.log(`[Sentry ${level}]`, message);
  } catch (error) {
    console.error('Failed to capture message:', error);
  }
}

/**
 * Set user context (anonymously)
 */
export function setUserContext(userId: string) {
  if (!sentryInitialized || typeof window === 'undefined') return;
  
  try {
    // TODO: Use actual Sentry setUser
    // Sentry.setUser({
    //   id: userId,
    //   // Don't include email, name, etc. for privacy
    // });
    
    console.log('[Sentry] User context set:', userId);
  } catch (error) {
    console.error('Failed to set user context:', error);
  }
}

/**
 * Sanitize context to remove PII
 */
function sanitizeContext(context?: Record<string, any>): Record<string, any> | undefined {
  if (!context) return undefined;
  
  const sanitized: Record<string, any> = {};
  const sensitiveKeys = ['content', 'notes', 'gratitude', 'message', 'email', 'phone', 'name'];
  
  for (const [key, value] of Object.entries(context)) {
    if (sensitiveKeys.includes(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'string' && value.length > 500) {
      sanitized[key] = value.substring(0, 100) + '...[TRUNCATED]';
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

