"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "@/lib/icons";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
          <div className="max-w-md w-full">
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Something went wrong!</AlertTitle>
              <AlertDescription>
                {error.message || 'An unexpected error occurred. Please try again.'}
              </AlertDescription>
            </Alert>
            <Button
              onClick={() => reset()}
              className="w-full"
            >
              Try again
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}

