import posthog from 'posthog-js';

// Re-export init from analytics to avoid duplicate initialization logic.
export { initPostHog } from './analytics';

export default posthog;


