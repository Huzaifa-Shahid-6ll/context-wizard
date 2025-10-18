export function sanitizeInput(input: unknown, type: "text" | "url" | "path"): string {
  const s = String(input ?? "");
  if (type === "text") {
    return s
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
      .replace(/<\/?script[^>]*>/gi, "")
      .trim();
  }
  if (type === "url") {
    try {
      const u = new URL(s);
      if (!/^https?:$/.test(u.protocol)) return "";
      u.hash = "";
      return u.toString();
    } catch {
      return "";
    }
  }
  // path
  return s.replace(/\\/g, "/").replace(/\.+\//g, "").replace(/\s+/g, " ").trim();
}

export function validateGithubUrl(url: string): boolean {
  try {
    const u = new URL(url);
    if (!u.hostname.endsWith("github.com")) return false;
    const parts = u.pathname.split("/").filter(Boolean);
    return parts.length >= 2 && /^[A-Za-z0-9_.-]+$/.test(parts[0]) && /^[A-Za-z0-9_.-]+$/.test(parts[1]);
  } catch {
    return false;
  }
}

export function validatePromptInput(text: string): boolean {
  if (!text || typeof text !== "string") return false;
  if (text.length > 8000) return false;
  if (/<\/?script/i.test(text)) return false;
  return true;
}


