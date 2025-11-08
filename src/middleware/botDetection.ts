import { NextRequest } from 'next/server';

const SUSPICIOUS_USER_AGENTS = [
  'bot',
  'crawler',
  'spider',
  'scraper',
  'curl',
  'wget',
  'python-requests',
  'go-http-client',
];

const ALLOWED_BOTS = [
  'googlebot',
  'bingbot',
  'slackbot',
  'twitterbot',
  'facebookexternalhit',
];

export function isSuspiciousBot(request: NextRequest): boolean {
  const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';

  // Allow legitimate bots
  if (ALLOWED_BOTS.some(bot => userAgent.includes(bot))) {
    return false;
  }

  // Block suspicious patterns
  return SUSPICIOUS_USER_AGENTS.some(pattern => userAgent.includes(pattern));
}

