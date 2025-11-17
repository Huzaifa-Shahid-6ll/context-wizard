import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { api } from '@/../convex/_generated/api';
import { ConvexHttpClient } from 'convex/browser';
import { sanitizeInput } from '@/lib/sanitize';
import { createSafeErrorResponse } from '@/lib/errorMessages';

// Request size limit: 5KB for affiliate click requests
const MAX_REQUEST_SIZE = 5 * 1024; // 5KB

export async function POST(request: NextRequest) {
  try {
    // Check content length
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > MAX_REQUEST_SIZE) {
      return Response.json(
        { error: 'Request payload too large' },
        { status: 413 }
      );
    }
    
    // Use Clerk to get the authenticated user
    const authObject = await auth();
    const { userId } = authObject;
    
    const body = await request.json();
    
    // Additional validation after parsing
    if (JSON.stringify(body).length > MAX_REQUEST_SIZE) {
      return Response.json(
        { error: 'Request payload too large' },
        { status: 413 }
      );
    }
    const { toolName, category } = body;

    if (!toolName || !category) {
      return Response.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Sanitize inputs
    const sanitizedToolName = sanitizeInput(String(toolName));
    const sanitizedCategory = sanitizeInput(String(category));

    // Create a convex instance for server-side operations
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

    // Log to Convex
    await convex.mutation(api.affiliate.logClick, {
      toolName: sanitizedToolName,
      category: sanitizedCategory,
      userId: userId || undefined, // Store undefined if not authenticated
    });

    return Response.json({ message: 'Affiliate click logged' });
  } catch (error) {
    console.error('Error logging affiliate click:', error);
    const errorResponse = createSafeErrorResponse(error);
    return Response.json(errorResponse.error, { status: 500 });
  }
}