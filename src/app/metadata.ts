import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: 'Conard - AI-Powered Context Files for Better Code',
    template: '%s | Conard'
  },
  description:
    'Conard is an AI-powered tool that generates context files for your codebase, helping you understand and navigate complex projects with ease.',
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
      name: 'Conard',
      url: 'https://contextwizard.com',
    },
  ],
  creator: 'Conard',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://contextwizard.com',
    title: 'Conard - AI-Powered Context Files for Better Code',
    description:
      'Conard is an AI-powered tool that generates context files for your codebase, helping you understand and navigate complex projects with ease.',
    siteName: 'Conard',
    images: [
      {
        url: 'https://contextwizard.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Conard - AI-Powered Context Files for Better Code',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Conard - AI-Powered Context Files for Better Code',
    description:
      'Conard is an AI-powered tool that generates context files for your codebase, helping you understand and navigate complex projects with ease.',
    images: ['https://contextwizard.com/og-image.jpg'],
    creator: '@ContextWizard',
  },
  icons: {
    icon: '/image-Photoroom.png',
    shortcut: '/image-Photoroom.png',
    apple: '/image-Photoroom.png',
  },
  manifest: '/site.webmanifest',
};
