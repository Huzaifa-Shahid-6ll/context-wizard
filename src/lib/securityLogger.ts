import { trackEvent } from './analytics';
import { logger } from './logger';

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

  // Log security events
  logger.warn('Security event detected', {
    eventType,
    ...details,
  });
}

