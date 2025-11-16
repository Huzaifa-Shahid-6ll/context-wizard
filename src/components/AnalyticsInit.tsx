"use client";

import React from "react";
import { initAnalytics } from "@/lib/analytics";

export default function AnalyticsInit() {
  React.useEffect(() => {
    initAnalytics();
  }, []);

  return null;
}

