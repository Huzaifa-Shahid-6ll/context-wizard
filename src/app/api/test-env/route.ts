import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    convex: !!process.env.NEXT_PUBLIC_CONVEX_URL,
    clerk: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    openrouterFree: !!process.env.OPENROUTER_API_KEY_FREE,
    openrouterPro: !!process.env.OPENROUTER_API_KEY_PRO,
    anthropic: !!process.env.ANTHROPIC_API_KEY,
    // Show first 10 chars to verify
    openrouterFreePreview: process.env.OPENROUTER_API_KEY_FREE?.substring(0, 10),
  });
}