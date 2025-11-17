/**
 * Audit logging utilities for Convex
 * Logs security events, data access, and important operations
 */

import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";

export type AuditEventType =
  | "user_login"
  | "user_logout"
  | "data_access"
  | "data_modification"
  | "subscription_change"
  | "security_event"
  | "rate_limit_hit"
  | "unauthorized_access"
  | "admin_action";

export interface AuditLogEntry {
  eventType: AuditEventType;
  userId?: string;
  resourceType?: string;
  resourceId?: string;
  action: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: number;
}

/**
 * Log an audit event
 */
export const logAuditEvent = mutation({
  args: {
    eventType: v.union(
      v.literal("user_login"),
      v.literal("user_logout"),
      v.literal("data_access"),
      v.literal("data_modification"),
      v.literal("subscription_change"),
      v.literal("security_event"),
      v.literal("rate_limit_hit"),
      v.literal("unauthorized_access"),
      v.literal("admin_action")
    ),
    userId: v.optional(v.string()),
    resourceType: v.optional(v.string()),
    resourceId: v.optional(v.string()),
    action: v.string(),
    details: v.optional(v.any()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // For now, we'll use the existing securityEvents table
    // In the future, we might want a dedicated auditLogs table
    
    const severity = 
      args.eventType === "unauthorized_access" || args.eventType === "security_event"
        ? "high"
        : args.eventType === "rate_limit_hit"
        ? "medium"
        : "low";
    
    await ctx.db.insert("securityEvents", {
      type: args.eventType,
      userId: args.userId,
      ip: args.ipAddress || "unknown",
      fingerprint: args.userAgent || "unknown",
      details: {
        action: args.action,
        resourceType: args.resourceType,
        resourceId: args.resourceId,
        ...args.details,
      },
      severity,
      timestamp: Date.now(),
    });
  },
});

/**
 * Helper function to log data access
 */
export async function logDataAccess(
  ctx: any,
  userId: string,
  resourceType: string,
  resourceId: string,
  action: string
) {
  await ctx.runMutation(api.mutations.logAuditEvent, {
    eventType: "data_access",
    userId,
    resourceType,
    resourceId,
    action,
    timestamp: Date.now(),
  });
}

/**
 * Helper function to log unauthorized access attempts
 */
export async function logUnauthorizedAccess(
  ctx: any,
  userId: string | undefined,
  resourceType: string,
  resourceId: string,
  ipAddress?: string
) {
  await ctx.runMutation(api.mutations.logAuditEvent, {
    eventType: "unauthorized_access",
    userId,
    resourceType,
    resourceId,
    action: "unauthorized_access_attempt",
    ipAddress,
    timestamp: Date.now(),
  });
}

