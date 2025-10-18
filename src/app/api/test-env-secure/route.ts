import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const key = req.headers.get('x-security-api-key');
  if (!process.env.SECURITY_API_KEY || key !== process.env.SECURITY_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({
    convex: !!process.env.NEXT_PUBLIC_CONVEX_URL,
    clerk: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    openrouterFree: !!process.env.OPENROUTER_API_KEY_FREE,
    openrouterPro: !!process.env.OPENROUTER_API_KEY_PRO,
    anthropic: !!process.env.ANTHROPIC_API_KEY,
    openrouterFreePreview: process.env.OPENROUTER_API_KEY_FREE?.substring(0, 10),
  });
}


