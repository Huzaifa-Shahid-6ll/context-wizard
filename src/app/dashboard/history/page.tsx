"use client";
import React from "react";
import { useUser } from "@clerk/nextjs";
import { Card } from "@/components/ui/card";
import { initPostHog, trackEvent } from "@/lib/analytics";

export default function HistoryPage() {
  const { user } = useUser();

  React.useEffect(() => {
    initPostHog();
    trackEvent('history_page_viewed');
  }, []);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <h1 className="text-2xl font-semibold text-primary">History</h1>

      <Card className="mt-6 p-8 text-center ring-1 ring-border shadow-sm">
        <div className="flex flex-col items-center justify-center gap-4">
          <p className="text-lg font-medium text-foreground">Generation history has been removed</p>
          <p className="text-sm text-foreground/60">
            The GitHub repository generation feature is no longer available.
          </p>
        </div>
      </Card>
    </div>
  );
}
