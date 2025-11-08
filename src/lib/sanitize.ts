// Prevent XSS and injection attacks

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, ''); // Remove event handlers
}

export function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url);

    // Only allow http/https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Invalid protocol');
    }

    // For GitHub URLs, validate format
    if (url.includes('github.com')) {
      const githubRegex = /^https?:\/\/github\.com\/[\w.-]+\/[\w.-]+(\/.*)?$/i;
      if (!githubRegex.test(url)) {
        throw new Error('Invalid GitHub URL');
      }
    }

    return parsed.href;
  } catch {
    throw new Error('Invalid URL');
  }
}

export function sanitizeEmail(email: string): string {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const cleaned = email.trim().toLowerCase();

  if (!emailRegex.test(cleaned)) {
    throw new Error('Invalid email');
  }

  return cleaned;
}

