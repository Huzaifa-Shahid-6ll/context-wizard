"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function useOpenRouterStatus() {
  const health = useQuery(api.queries.getOpenRouterHealth);

  return {
    isHealthy: health?.overall === "healthy",
    loading: health === undefined,
    lastCheck: Math.max(health?.free.checkedAt || 0, health?.pro.checkedAt || 0),
    freeStatus: health?.free.status,
    proStatus: health?.pro.status,
    stats: {
      freeResponseTime: (health as any)?.free?.responseTime,
      proResponseTime: (health as any)?.pro?.responseTime,
    },
  };
}


