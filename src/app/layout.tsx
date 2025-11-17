"use client";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import PageTransition from "@/components/PageTransition";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/contexts/ThemeContext";
import "./globals.css";
import React from "react";
import { initAnalytics, identify } from "@/lib/analytics";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { clearAllStorage, clearExpiredItems } from "@/lib/storage";
import { migrateStorageKeys } from "@/lib/storage-migration";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  React.useEffect(() => {
    initAnalytics();
    // Run storage migration on app load
    migrateStorageKeys();
    // Clear expired storage items
    clearExpiredItems();
  }, []);
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <ClerkProvider>
            <ConvexClientProvider>
              <PageTransition>{children}</PageTransition>
              <Toaster richColors closeButton position="top-right" />
            </ConvexClientProvider>
          </ClerkProvider>
        </ThemeProvider>
        <Script src="https://tweakcn.com/live-preview.min.js" strategy="lazyOnload" />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
