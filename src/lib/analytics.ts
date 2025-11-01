"use client";

// Lightweight PostHog wrapper. Uses window.posthog if present; otherwise no-ops.

declare global {
  interface Window { posthog?: any }
}

let initialized = false;

export function initAnalytics() {
  if (initialized) return;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com";
  if (!key) return; // no-op
  try {
    // If the site includes posthog-js via script tag, configure it; otherwise rely on existing setup
    if (typeof window !== "undefined" && window.posthog && window.posthog.init) {
      window.posthog.init(key, { api_host: host, autocapture: false });
      initialized = true;
    }
  } catch {}
}

export function identify(userId?: string) {
  try { if (window.posthog && userId) window.posthog.identify(userId); } catch {}
}

export function track(event: string, properties?: Record<string, unknown>) {
  try { if (window.posthog) window.posthog.capture(event, properties || {}); } catch {}
}


