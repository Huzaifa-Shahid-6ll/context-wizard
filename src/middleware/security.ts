import { NextRequest, NextResponse } from "next/server";
import { getFeatureFlags } from "@/config/features";
import { getClientIp } from "@/lib/ipTracker";
import { checkRateLimit } from "@/lib/rateLimit";

export function securityMiddleware(
  base?: (req: NextRequest) => NextResponse | Promise<NextResponse>
) {
  return async function middleware(req: NextRequest) {
    const flags = getFeatureFlags();
    const ip = getClientIp({ headers: req.headers });

    if (flags.ENABLE_IP_RATE_LIMITING) {
      const { remaining, retryAfterMs } = checkRateLimit(`ip:${ip}`, 100, 60_000);
      if (remaining <= 0) {
        return new NextResponse("Too Many Requests", {
          status: 429,
          headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) },
        });
      }
    }

    const res = (await (base ? base(req) : NextResponse.next())) as NextResponse;
    // Security headers
    res.headers.set("X-Frame-Options", "DENY");
    res.headers.set("X-Content-Type-Options", "nosniff");
    res.headers.set("Referrer-Policy", "no-referrer");
    res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    res.headers.set(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'self'"
    );
    return res;
  };
}


