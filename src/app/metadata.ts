import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: 'Context Wizard - AI-Powered Context Files for Better Code',
    template: '%s | Context Wizard'
  },
  description:
    'Context Wizard is an AI-powered tool that generates context files for your codebase, helping you understand and navigate complex projects with ease.',
  keywords: [
    'AI',
    'Context',
    'Codebase',
    'Developer Tools',
    'Software Engineering',
    'Productivity',
    'Next.js',
    'React',
    'TypeScript',
    'Tailwind CSS',
    'Convex',
    'Clerk',
    'Vercel',
  ],
  authors: [
    {
      name: 'Context Wizard',
      url: 'https://contextwizard.com',
    },
  ],
  creator: 'Context Wizard',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://contextwizard.com',
    title: 'Context Wizard - AI-Powered Context Files for Better Code',
    description:
      'Context Wizard is an AI-powered tool that generates context files for your codebase, helping you understand and navigate complex projects with ease.',
    siteName: 'Context Wizard',
    images: [
      {
        url: 'https://contextwizard.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Context Wizard - AI-Powered Context Files for Better Code',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Context Wizard - AI-Powered Context Files for Better Code',
    description:
      'Context Wizard is an AI-powered tool that generates context files for your codebase, helping you understand and navigate complex projects with ease.',
    images: ['https://contextwizard.com/og-image.jpg'],
    creator: '@ContextWizard',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};
