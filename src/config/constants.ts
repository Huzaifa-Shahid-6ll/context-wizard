const baseConstants = {
  TIMEOUT_MS: 5000,
  MAX_REQUESTS_PER_MINUTE: 100,
} as const;

type EnvName = "development" | "test" | "production";

const envName = (process.env.NODE_ENV ?? "development") as EnvName;

const environmentConstants: Record<EnvName, Partial<typeof baseConstants>> = {
  development: { TIMEOUT_MS: 10000 },
  test: { TIMEOUT_MS: 1000 },
  production: { TIMEOUT_MS: 5000 },
};

export const constants = {
  ...baseConstants,
  ...(environmentConstants[envName] ?? {}),
} as const;


