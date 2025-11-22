import { trackEvent } from './analytics';
import { logger } from './logger';

export function logSecurityEvent(
  eventType: 'rate_limit' | 'bot_detected' | 'honeypot_triggered' | 'suspicious_ip' | 'csrf_validation_failed' | 'request_size_exceeded' | 'banned_ip_access_attempt',
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

