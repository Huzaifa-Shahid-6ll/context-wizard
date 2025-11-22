/**
 * Metrics Collection
 * 
 * Provides centralized metrics collection for system health monitoring
 */

import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../convex/_generated/api';

let metricsClient: ConvexHttpClient | null = null;

function getMetricsClient(): ConvexHttpClient {
  if (!metricsClient) {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      throw new Error('NEXT_PUBLIC_CONVEX_URL is not set');
    }
    metricsClient = new ConvexHttpClient(convexUrl);
  }
  return metricsClient;
}

export interface MetricData {
  name: string;
  value: number;
  tags?: Record<string, string>;
  timestamp?: number;
}

/**
 * Record a metric
 * Temporarily disabled - logMetric mutation doesn't exist yet
 */
export async function recordMetric(metric: MetricData): Promise<void> {
  console.warn('Metrics.recordMetric() called but logMetric mutation not yet implemented', metric.name);
  // Temporarily disabled - logMetric mutation doesn't exist yet
  return;
}

/**
 * Record API response time
 */
export async function recordApiLatency(
  endpoint: string,
  method: string,
  latencyMs: number,
  statusCode: number
): Promise<void> {
  await recordMetric({
    name: 'api.latency',
    value: latencyMs,
    tags: {
      endpoint,
      method,
      statusCode: String(statusCode),
    },
  });
}

/**
 * Record error rate
 */
export async function recordErrorRate(
  endpoint: string,
  errorType: string
): Promise<void> {
  await recordMetric({
    name: 'api.errors',
    value: 1,
    tags: {
      endpoint,
      errorType,
    },
  });
}
