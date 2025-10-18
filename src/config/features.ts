export interface FeatureFlags {
  ENABLE_OPENROUTER_CACHE: boolean;
  ENABLE_IP_RATE_LIMITING: boolean;
  ENABLE_ENHANCED_SECURITY: boolean;
  ENABLE_BILLING: boolean;
  ENABLE_MONITORING: boolean;
  ENABLE_FALLBACK_MODELS: boolean;
  ENABLE_REQUEST_TIMEOUTS: boolean;
  ENABLE_ABUSE_DETECTION: boolean;
}

declare global {
  // Optional client runtime override (e.g. window.__FEATURE_FLAGS__)
  // eslint-disable-next-line no-var
  var __FEATURE_FLAGS__: Partial<FeatureFlags> | undefined;
}

const booleanFrom = (value: unknown, fallback = false): boolean => {
  if (typeof value === "string") return value.toLowerCase() === "true";
  if (typeof value === "boolean") return value;
  return fallback;
};

export function getFeatureFlags(): FeatureFlags {
  const fromGlobal = (globalThis as any).__FEATURE_FLAGS__ as
    | Partial<FeatureFlags>
    | undefined;

  const read = (key: keyof FeatureFlags): boolean => {
    // Prefer runtime override (client), then server env, then NEXT_PUBLIC_* (client/build)
    const pub = process.env[
      (`NEXT_PUBLIC_` + key) as keyof NodeJS.ProcessEnv
    ] as unknown as string | boolean | undefined;
    const srv = process.env[key as keyof NodeJS.ProcessEnv] as unknown as
      | string
      | boolean
      | undefined;
    const glob = fromGlobal?.[key];
    return booleanFrom(glob ?? srv ?? pub, false);
  };

  return {
    ENABLE_OPENROUTER_CACHE: read("ENABLE_OPENROUTER_CACHE"),
    ENABLE_IP_RATE_LIMITING: read("ENABLE_IP_RATE_LIMITING"),
    ENABLE_ENHANCED_SECURITY: read("ENABLE_ENHANCED_SECURITY"),
    ENABLE_BILLING: read("ENABLE_BILLING"),
    ENABLE_MONITORING: read("ENABLE_MONITORING"),
    ENABLE_FALLBACK_MODELS: read("ENABLE_FALLBACK_MODELS"),
    ENABLE_REQUEST_TIMEOUTS: read("ENABLE_REQUEST_TIMEOUTS"),
    ENABLE_ABUSE_DETECTION: read("ENABLE_ABUSE_DETECTION"),
  };
}


