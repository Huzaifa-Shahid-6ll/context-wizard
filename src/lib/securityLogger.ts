import { trackEvent } from './analytics';

export function logSecurityEvent(
  eventType: 'rate_limit' | 'bot_detected' | 'honeypot_triggered' | 'suspicious_ip',
  details: Record<string, unknown>
) {
  // Log to PostHog
  trackEvent('security_event', {
    type: eventType,
    ...details,
    timestamp: Date.now(),
  });

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[SECURITY]', eventType, details);
  }
}

