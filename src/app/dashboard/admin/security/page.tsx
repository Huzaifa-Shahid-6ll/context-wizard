'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { initPostHog, trackEvent } from '@/lib/analytics';
import { 
  Shield, 
  AlertTriangle, 
  Bot, 
  Ban, 
  Activity, 
  TrendingUp,
  Download,
  RefreshCw
} from '@/lib/icons';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6'];

export default function AdminSecurityDashboard() {
  const { user } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    initPostHog();
    // Check if user is admin (same pattern as other admin pages)
    const adminEmail = 'james@contextwizard.com';
    setIsAdmin(user?.primaryEmailAddress?.emailAddress === adminEmail);
    if (isAdmin) {
      trackEvent('admin_security_dashboard_viewed');
    }
  }, [user, isAdmin]);

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-destructive mb-2">Access Denied</h2>
            <p className="text-muted-foreground">You do not have permission to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mock data structure - in production, this would query PostHog API
  // For now, showing structure and instructions
  const mockTimelineData = [
    { time: '00:00', rate_limit: 0, bot_detected: 0, honeypot: 0 },
    { time: '04:00', rate_limit: 2, bot_detected: 1, honeypot: 0 },
    { time: '08:00', rate_limit: 5, bot_detected: 2, honeypot: 1 },
    { time: '12:00', rate_limit: 8, bot_detected: 3, honeypot: 2 },
    { time: '16:00', rate_limit: 12, bot_detected: 4, honeypot: 1 },
    { time: '20:00', rate_limit: 6, bot_detected: 2, honeypot: 0 },
  ];

  const mockEventTypeData = [
    { name: 'Rate Limit Hits', value: 33, color: COLORS[0] },
    { name: 'Bot Detections', value: 14, color: COLORS[1] },
    { name: 'Honeypot Triggers', value: 4, color: COLORS[2] },
    { name: 'Suspicious IPs', value: 2, color: COLORS[3] },
  ];

  const mockTopIPs = [
    { ip: '192.168.1.100', count: 45, type: 'rate_limit' },
    { ip: '10.0.0.50', count: 23, type: 'bot_detected' },
    { ip: '172.16.0.10', count: 12, type: 'honeypot' },
    { ip: '203.0.113.5', count: 8, type: 'rate_limit' },
  ];

  const mockTopEndpoints = [
    { endpoint: '/api/generate', count: 28 },
    { endpoint: '/api/auth/sign-in', count: 15 },
    { endpoint: '/dashboard/cursor-builder', count: 12 },
    { endpoint: '/api/feedback', count: 8 },
  ];

  const handleRefresh = () => {
    setLastRefresh(new Date());
    trackEvent('admin_security_dashboard_refreshed');
    // In production, this would refetch data from PostHog
  };

  const handleExport = () => {
    trackEvent('admin_security_report_exported');
    // In production, this would export the data
    alert('Export functionality - would generate CSV/PDF report');
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Security Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitor rate limits, bot detections, and security events
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        Last updated: {lastRefresh.toLocaleTimeString()}
      </div>

      {/* Info Card about PostHog Integration */}
      <Card className="border-blue-500/20 bg-blue-500/5">
        <CardHeader>
          <CardTitle className="text-blue-500">Viewing Security Events</CardTitle>
          <CardDescription>
            Security events are tracked in PostHog. To view detailed analytics:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Go to your PostHog dashboard</li>
            <li>Filter events by: <code className="bg-secondary px-2 py-1 rounded">event:security_event</code></li>
            <li>Group by <code className="bg-secondary px-2 py-1 rounded">type</code> property to see event breakdown</li>
            <li>Use date filters to view last 24h, 7d, or 30d</li>
          </ol>
          <p className="mt-4 text-xs text-muted-foreground">
            To enable API integration, configure PostHog API credentials and update this dashboard.
          </p>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rate Limit Hits</CardTitle>
            <Ban className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">33</div>
            <p className="text-xs text-muted-foreground">Last 24h</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bot Detections</CardTitle>
            <Bot className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">14</div>
            <p className="text-xs text-muted-foreground">Last 24h</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Honeypot Triggers</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">Last 24h</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspicious IPs</CardTitle>
            <Activity className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Last 24h</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="ips">Top IPs</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Timeline Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Event Timeline (Last 24h)</CardTitle>
                <CardDescription>Security events over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockTimelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="rate_limit" stroke={COLORS[0]} name="Rate Limits" />
                    <Line type="monotone" dataKey="bot_detected" stroke={COLORS[1]} name="Bot Detections" />
                    <Line type="monotone" dataKey="honeypot" stroke={COLORS[2]} name="Honeypot" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Event Type Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Event Type Breakdown</CardTitle>
                <CardDescription>Distribution of security events</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={mockEventTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {mockEventTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ips" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Attacking IPs</CardTitle>
              <CardDescription>IPs with most security events in last 24h</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTopIPs.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="font-mono">
                        {item.ip}
                      </Badge>
                      <Badge
                        variant={
                          item.type === 'rate_limit'
                            ? 'destructive'
                            : item.type === 'bot_detected'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {item.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">{item.count} events</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endpoints" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Most Hit Endpoints</CardTitle>
              <CardDescription>Endpoints with most security events</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mockTopEndpoints}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="endpoint" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill={COLORS[0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

