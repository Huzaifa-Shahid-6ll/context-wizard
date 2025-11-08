'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { initPostHog, trackEvent } from '@/lib/analytics';

interface FeedbackItem {
  _id: string;
  userId?: string;
  email?: string;
  type: string;
  message: string;
  rating?: number;
  page?: string;
  resolved: boolean;
  resolvedAt?: number;
  resolvedBy?: string;
  notes?: string;
  createdAt: number;
}

const typeColors = {
  bug: 'bg-red-500/20 text-red-500',
  feature: 'bg-blue-500/20 text-blue-500',
  general: 'bg-green-500/20 text-green-500',
  docs: 'bg-yellow-500/20 text-yellow-500',
  confusion: 'bg-purple-500/20 text-purple-500',
};

const typeLabels = {
  bug: '🐛 Bug Report',
  feature: '💡 Feature Request',
  general: '❤️ General Feedback',
  docs: '📖 Documentation Issue',
  confusion: '🤔 Something Isn\'t Clear',
};

export default function AdminFeedbackDashboard() {
  const [activeTab, setActiveTab] = useState<'new' | 'resolved' | 'all'>('new');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFeedback, setExpandedFeedback] = useState<string | null>(null);
  const [notes, setNotes] = useState<{ [key: string]: string }>({});
  const [isAdmin, setIsAdmin] = useState(false);
  
  const allFeedback = useQuery(api.feedback.listFeedback, {
    resolved: activeTab === 'resolved' ? true : activeTab === 'new' ? false : undefined,
    limit: 100,
  });

  useEffect(() => {
    initPostHog();
    // Implement admin check here - in a real app this would be based on user role
    // For now, we'll just set it to true for demonstration
    setIsAdmin(true);
    trackEvent('admin_feedback_dashboard_viewed');
  }, []);

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

  // Filter feedback based on search term
  const filteredFeedback = allFeedback?.filter(feedback => 
    feedback.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (feedback.email && feedback.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (feedback.page && feedback.page.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const toggleExpand = (id: string) => {
    setExpandedFeedback(expandedFeedback === id ? null : id);
  };

  const handleResolve = (feedbackId: string) => {
    // This would call a mutation to resolve feedback
    console.log(`Resolving feedback: ${feedbackId}`, notes[feedbackId]);
    trackEvent('feedback_resolved', { feedback_id: feedbackId });
  };

  const handleNoteChange = (feedbackId: string, note: string) => {
    setNotes(prev => ({ ...prev, [feedbackId]: note }));
  };

  // Calculate stats
  const totalFeedback = allFeedback?.length || 0;
  const unresolvedFeedback = allFeedback?.filter(f => !f.resolved).length || 0;
  const avgRating = allFeedback && allFeedback.length > 0 
    ? allFeedback.reduce((sum, f) => sum + (f.rating || 0), 0) / allFeedback.filter(f => f.rating).length
    : 0;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">Feedback Dashboard</h1>
        <p className="text-muted-foreground">Manage and respond to user feedback</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{totalFeedback}</div>
            <div className="text-sm text-muted-foreground">Total Feedback</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{unresolvedFeedback}</div>
            <div className="text-sm text-muted-foreground">Unresolved</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{avgRating ? avgRating.toFixed(1) : 0}</div>
            <div className="text-sm text-muted-foreground">Average Rating</div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <Tabs value={activeTab} onValueChange={(v: string) => setActiveTab(v as 'new' | 'resolved' | 'all')} className="w-full md:w-auto">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="new">New</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
        </Tabs>
        <Input
          placeholder="Search feedback..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Feedback List */}
      <div className="space-y-4">
        {filteredFeedback.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No feedback found</p>
            </CardContent>
          </Card>
        ) : (
          filteredFeedback.map(feedback => (
            <Card key={feedback._id}>
              <CardHeader className="cursor-pointer" onClick={() => toggleExpand(feedback._id)}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge className={`${typeColors[feedback.type as keyof typeof typeColors] || 'bg-gray-500/20 text-gray-500'}`}>
                      {typeLabels[feedback.type as keyof typeof typeLabels] || feedback.type}
                    </Badge>
                    {feedback.rating && (
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < feedback.rating! ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'}`}
                          />
                        ))}
                      </div>
                    )}
                    <div className="text-sm text-muted-foreground">
                      {feedback.email || 'Anonymous'} • {new Date(feedback.createdAt).toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Page: {feedback.page || 'N/A'}
                    </div>
                  </div>
                  <div>
                    {feedback.resolved && (
                      <Badge variant="secondary">Resolved</Badge>
                    )}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground line-clamp-1">
                  {feedback.message.substring(0, 100)}{feedback.message.length > 100 ? '...' : ''}
                </div>
              </CardHeader>
              
              {expandedFeedback === feedback._id && (
                <CardContent className="border-t pt-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-1">Full Message</h4>
                      <p className="text-sm">{feedback.message}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-1">User Info</h4>
                        <p className="text-sm text-muted-foreground">
                          Email: {feedback.email || 'N/A'}<br />
                          User ID: {feedback.userId || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Context</h4>
                        <p className="text-sm text-muted-foreground">
                          Page: {feedback.page || 'N/A'}<br />
                          Submitted: {new Date(feedback.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    {!feedback.resolved && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium">Admin Notes</label>
                          <Textarea
                            value={notes[feedback._id] || ''}
                            onChange={(e) => handleNoteChange(feedback._id, e.target.value)}
                            placeholder="Add internal notes..."
                            className="mt-1"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleResolve(feedback._id)}
                            variant="default"
                          >
                            Mark as Resolved
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {feedback.resolved && (
                      <div className="text-sm text-muted-foreground">
                        <p>
                          Resolved by: {feedback.resolvedBy || 'N/A'} at{' '}
                          {feedback.resolvedAt ? new Date(feedback.resolvedAt).toLocaleString() : 'N/A'}
                        </p>
                        {feedback.notes && (
                          <p className="mt-1">
                            Notes: {feedback.notes}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}