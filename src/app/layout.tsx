import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import PageTransition from "@/components/PageTransition";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: 'Context Wizard - AI-Powered Context Files for Better Code',
    template: '%s | Context Wizard'
  },
  description: 'Generate perfect .cursorrules, documentation, and context files from any GitHub repository in 30 seconds. Make AI coding assistants understand your project perfectly. Free tier available.',
  keywords: [
    'cursor ai',
    'cursorrules',
    'ai coding assistant',
    'github context',
    'code documentation',
    'ai development tools',
    'cursor rules generator',
    'ai pair programming',
    'code context files',
    'developer tools'
  ],
  authors: [{ name: 'Context Wizard' }],
  creator: 'Context Wizard',
  publisher: 'Context Wizard',
  metadataBase: new URL('https://contextwizard.ai'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://contextwizard.ai',
    title: 'Context Wizard - AI-Powered Context Files for Better Code',
    description: 'Generate perfect .cursorrules and documentation from any GitHub repo. Make AI coding assistants 10x better. Free tier available.',
    siteName: 'Context Wizard',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Context Wizard - Generate Perfect Context Files',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Context Wizard - AI-Powered Context Files',
    description: 'Generate perfect .cursorrules from any GitHub repo in 30 seconds. Free tier available.',
    images: ['/twitter-image.png'],
    creator: '@contextwizard',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClerkProvider>
          <ConvexClientProvider>
            <PageTransition>{children}</PageTransition>
            <Toaster richColors closeButton position="top-right" />
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
