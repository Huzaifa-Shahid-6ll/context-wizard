import { trackEvent } from './analytics';

export function trackAffiliateClick(
  toolName: string,
  category: string,
  link: string
) {
  trackEvent('affiliate_link_clicked', {
    tool: toolName,
    category: category,
    destination: link,
  });
  
  // Also log to our backend for tracking
  logAffiliateClick(toolName, category);
}

export async function logAffiliateClick(
  toolName: string,
  category: string
) {
  // Log to convex for tracking
  try {
    const response = await fetch('/api/log-affiliate-click', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ toolName, category }),
    });
    if (!response.ok) {
      console.error('Failed to log affiliate click to API');
    }
  } catch (error) {
    console.error('Error logging affiliate click:', error);
  }
}