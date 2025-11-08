'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { initPostHog, trackEvent } from '@/lib/analytics';
import { Check, X, Star } from 'lucide-react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { HoneypotField } from '@/components/forms/HoneypotField';
import { logSecurityEvent } from '@/lib/securityLogger';
import { sanitizeInput, sanitizeEmail } from '@/lib/sanitize';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPage?: string;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ 
  isOpen, 
  onClose, 
  initialPage = typeof window !== 'undefined' ? window.location.pathname : ''
}) => {
  const [feedbackType, setFeedbackType] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const submitFeedback = useMutation(api.feedback.submitFeedback);
  const { user } = useUser();

  React.useEffect(() => {
    initPostHog();
  }, []);

  const feedbackTypeOptions = [
    { value: 'bug', label: '🐛 Bug Report' },
    { value: 'feature', label: '💡 Feature Request' },
    { value: 'general', label: '❤️ General Feedback' },
    { value: 'docs', label: '📖 Documentation Issue' },
    { value: 'confusion', label: '🤔 Something Isn\'t Clear' },
  ];

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!feedbackType) {
      newErrors.type = 'Feedback type is required';
    }
    
    if (message.length < 10) {
      newErrors.message = 'Feedback must be at least 10 characters';
    }
    
    if (message.length > 1000) {
      newErrors.message = 'Feedback must be less than 1000 characters';
    }
    
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check honeypot
    const formData = new FormData(e.target as HTMLFormElement);
    if (formData.get('website_url')) {
      logSecurityEvent('honeypot_triggered', {
        path: initialPage,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      });
      // Silently fail - don't show error to bot
      return;
    }
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    try {
      // Sanitize inputs
      const sanitizedMessage = sanitizeInput(message);
      const sanitizedEmail = email ? sanitizeEmail(email) : undefined;
      
      // Track the submission attempt
      trackEvent('feedback_submitted', {
        type: feedbackType,
        rating: rating || 0,
        page: initialPage
      });
      
      // Submit feedback via Convex mutation
      await submitFeedback({
        userId: user?.id,
        type: feedbackType,
        message: sanitizedMessage,
        email: sanitizedEmail,
        rating: rating || undefined,
        page: initialPage,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      });
      
      setSubmitSuccess(true);
      setShowSuccess(true);
      
      // Auto close after 2 seconds
      setTimeout(() => {
        setShowSuccess(false);
        setTimeout(() => {
          resetForm();
          onClose();
        }, 100);
      }, 2000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      trackEvent('feedback_submission_failed', {
        type: feedbackType,
        error: error instanceof Error ? error.message : 'Unknown error',
        page: initialPage
      });
      // In a real implementation, you might want to show an error message to the user
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFeedbackType('');
    setMessage('');
    setEmail('');
    setRating(null);
    setErrors({});
    setSubmitSuccess(false);
  };

  const handleModalClose = () => {
    trackEvent('feedback_modal_closed', { submitted: submitSuccess });
    onClose();
    resetForm();
  };

  const handleRatingClick = (value: number) => {
    setRating(value === rating ? null : value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleModalClose}>
      <AnimatePresence>
        {isOpen && (
          <DialogContent className="max-w-md w-full p-0 depth-layer-1 shadow-depth-lg border-0">
            <div className="relative p-6">
              <button
                onClick={handleModalClose}
                className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
              
              <AnimatePresence>
                {showSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="flex flex-col items-center justify-center py-8"
                  >
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4"
                    >
                      <Check className="h-8 w-8 text-green-500" />
                    </motion.div>
                    <h3 className="text-xl font-semibold text-primary mb-2">Thanks for your feedback!</h3>
                    <p className="text-muted-foreground text-center">We appreciate you helping us improve.</p>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <DialogHeader className="mb-4">
                      <DialogTitle className="text-2xl font-bold text-primary">Help Us Build Better</DialogTitle>
                      <p className="text-muted-foreground">Your feedback shapes Context Wizard. What can we improve?</p>
                    </DialogHeader>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <HoneypotField />
                      <div>
                        <label className="block text-sm font-medium mb-2">Feedback Type *</label>
                        <Select 
                          value={feedbackType} 
                          onChange={(e) => setFeedbackType(e.target.value)}
                          className="w-full depth-layer-1 shadow-inset"
                        >
                          <option value="">Select feedback type</option>
                          {feedbackTypeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </Select>
                        {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Your Feedback *</label>
                        <Textarea
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Tell us what's on your mind..."
                          className="depth-layer-1 shadow-inset min-h-[120px]"
                          maxLength={1000}
                        />
                        <div className="flex justify-between text-sm text-muted-foreground mt-1">
                          <span>{errors.message ? errors.message : ''}</span>
                          <span>{message.length}/1000</span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Your Email (Optional)</label>
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your@email.com (optional)"
                          className="depth-layer-1 shadow-inset"
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                        <p className="text-xs text-muted-foreground mt-1">Only if you want a response</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          How would you rate your experience so far?
                        </label>
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => handleRatingClick(star)}
                              className={`text-2xl ${star <= (rating || 0) ? 'text-yellow-500' : 'text-muted-foreground'}`}
                              aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
                            >
                              <Star
                                className={star <= (rating || 0) ? 'fill-current' : ''}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex space-x-3 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1 depth-layer-1 shadow-inset"
                          onClick={handleModalClose}
                          disabled={isSubmitting}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="flex-1 depth-top shadow-depth-lg hover:shadow-elevated"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? 'Sending...' : 'Send Feedback'}
                        </Button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
};