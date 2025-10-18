import { clerkMiddleware } from "@clerk/nextjs/server";
import { getFeatureFlags } from "@/config/features";
import { securityMiddleware } from "@/middleware/security";

const flags = getFeatureFlags();
const base = clerkMiddleware();
const enhanced = flags.ENABLE_ENHANCED_SECURITY ? securityMiddleware(base as any) : (base as any);

export default enhanced;

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};


