import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const key = req.headers.get("x-security-api-key");
  if (!process.env.SECURITY_API_KEY || key !== process.env.SECURITY_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ status: "ok", time: Date.now() });
}


