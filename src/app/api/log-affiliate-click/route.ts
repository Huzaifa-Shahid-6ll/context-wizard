import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { api } from '@/../convex/_generated/api';
import { ConvexHttpClient } from 'convex/browser';

export async function POST(request: NextRequest) {
  try {
    // Use Clerk to get the authenticated user
    const authObject = await auth();
    const { userId } = authObject;
    
    const body = await request.json();
    const { toolName, category } = body;

    if (!toolName || !category) {
      return Response.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Create a convex instance for server-side operations
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

    // Log to Convex
    await convex.mutation(api.affiliate.logClick, {
      toolName,
      category,
      userId: userId || undefined, // Store undefined if not authenticated
    });

    return Response.json({ message: 'Affiliate click logged' });
  } catch (error) {
    console.error('Error logging affiliate click:', error);
    return Response.json({ message: 'Internal server error' }, { status: 500 });
  }
}