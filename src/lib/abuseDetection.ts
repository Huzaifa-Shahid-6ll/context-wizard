import { checkRateLimit } from "@/lib/rateLimit";
import { getClientIp } from "@/lib/ipTracker";

export type AbuseResult = { isAbusive: boolean; reason: string; severity: "low" | "medium" | "high" };

export async function detectAbuse(req: Request): Promise<AbuseResult> {
  const ip = getClientIp({ headers: req.headers });

  // Heuristic 1: rapid requests (>50/min)
  const { remaining } = checkRateLimit(`abuse:${ip}`, 50, 60_000);
  if (remaining === 0) {
    return { isAbusive: true, reason: "rapid_requests", severity: "medium" };
  }

  // Heuristic 2: suspicious user agent
  const ua = req.headers.get("user-agent") || "";
  if (ua.length < 8 || /bot|curl|wget|spider/i.test(ua)) {
    return { isAbusive: true, reason: "suspicious_user_agent", severity: "low" };
  }

  // Placeholder for failed auth attempts & external bad IP lists
  return { isAbusive: false, reason: "ok", severity: "low" };
}


