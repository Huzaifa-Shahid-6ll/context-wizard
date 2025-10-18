import { createHash } from "crypto";

type ReqLike = { headers: Headers | Record<string, string | string[] | undefined>; ip?: string };

function readHeader(headers: ReqLike["headers"], key: string): string | undefined {
  if (headers instanceof Headers) return headers.get(key) || undefined;
  const val = (headers as Record<string, string | string[] | undefined>)[key] ?? (headers as Record<string, string | string[] | undefined>)[key.toLowerCase()];
  if (Array.isArray(val)) return val[0];
  return typeof val === "string" ? val : undefined;
}

export function getClientIp(req: ReqLike): string {
  const xff = readHeader(req.headers, "x-forwarded-for");
  if (xff) {
    const parts = xff.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length) return parts[0];
  }
  const real = readHeader(req.headers, "x-real-ip") || readHeader(req.headers, "cf-connecting-ip");
  if (real) return real;
  if (req.ip) return req.ip;
  return "0.0.0.0";
}

export function generateFingerprint(req: ReqLike): string {
  const ip = getClientIp(req);
  const ua = readHeader(req.headers, "user-agent") || "unknown";
  const data = `${ip}|${ua}`;
  return createHash("sha256").update(data).digest("hex");
}


