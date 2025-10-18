'use client';
import React from 'react';
import { useOpenRouterStatus } from '@/hooks/useOpenRouterStatus';

export function SecurityBanner({ isAdmin }: { isAdmin: boolean }) {
  const status = useOpenRouterStatus();
  if (!isAdmin) return null;
  if (status.loading) return null;
  return (
    <div style={{ padding: 8, background: status.isHealthy ? '#ecfdf5' : '#fff7ed', border: '1px solid #e5e7eb' }}>
      {status.isHealthy ? 'System secure' : 'Security warnings present'} (last check: {new Date(status.lastCheck).toLocaleString()})
    </div>
  );
}


