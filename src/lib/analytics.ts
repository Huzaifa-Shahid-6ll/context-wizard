import posthog from 'posthog-js';

// Extended window interface for our analytics properties
type PlausibleFunction = (
  eventName: string,
  options?: { callback?: () => void; props?: Record<string, any> }
) => void;

declare global {
  interface Window {
    posthog: typeof posthog;
    _phInitialized: boolean;
    plausible?: PlausibleFunction;
  }
}

export function initPostHog() {
  if (typeof window === 'undefined') return;
  if (window._phInitialized) return;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return;
  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
    autocapture: false,
    person_profiles: 'identified_only',
  });
  window.posthog = posthog;
  window._phInitialized = true;
}

export function initAnalytics() {
  initPostHog();
}

export const identify = (userId: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.posthog) {
    window.posthog.identify(userId, properties);
  }
};

export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (typeof window !== 'undefined' && window.posthog) {
    window.posthog.capture(eventName, properties);
  }
  if (typeof window !== 'undefined' && window.plausible) {
    window.plausible(eventName, { props: properties });
  }
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log('[Analytics]', eventName, properties);
  }
}

export const trackPageView = (pageName: string) => {
  if (typeof window !== 'undefined' && window.posthog) {
    window.posthog.capture('$pageview', {
      $current_url: window.location.href,
      page_name: pageName,
    });
  }
};

// Wrapper functions for specific event categories
export const trackAuth = (eventName: string, properties?: Record<string, any>) => {
  trackEvent(eventName, properties);
};

export const trackLandingEvent = (eventName: string, properties?: Record<string, any>) => {
  trackEvent(eventName, properties);
};

export const trackGenerationEvent = (eventName: string, properties?: Record<string, any>) => {
  trackEvent(eventName, properties);
};

export const trackHistoryEvent = (eventName: string, properties?: Record<string, any>) => {
  trackEvent(eventName, properties);
};

export const trackPromptEvent = (eventName: string, properties?: Record<string, any>) => {
  trackEvent(eventName, properties);
};

export const trackSettingsEvent = (eventName: string, properties?: Record<string, any>) => {
  trackEvent(eventName, properties);
};

// User lifecycle stages (persistent user properties)
export const USER_STAGES = {
  NEW: 'new',
  ACTIVATED: 'activated',
  REPEAT: 'repeat_user',
  POWER_USER: 'power_user',
  PAYING: 'paying_customer',
  CHURNED: 'churned',
} as const;

export function updateUserStage(
  userId: string,
  stage: typeof USER_STAGES[keyof typeof USER_STAGES],
  metadata?: Record<string, any>
) {
  if (typeof window === 'undefined' || !window.posthog) return;
  window.posthog.identify(userId, {
    $set: {
      user_stage: stage,
      stage_updated_at: new Date().toISOString(),
      ...(metadata || {}),
    },
  });
}

export function trackMilestone(milestoneName: string, properties?: Record<string, any>) {
  trackEvent('milestone_reached', {
    milestone_type: milestoneName,
    timestamp: new Date().toISOString(),
    ...(properties || {}),
  });
}
