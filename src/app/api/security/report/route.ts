import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const key = req.headers.get("x-security-api-key");
  if (!process.env.SECURITY_API_KEY || key !== process.env.SECURITY_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  return NextResponse.json({ reported: true, id: `${Date.now()}`, body });
}


