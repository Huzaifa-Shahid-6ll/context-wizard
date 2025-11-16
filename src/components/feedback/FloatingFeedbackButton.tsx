'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FeedbackModal } from './FeedbackModal';
import { MessageCircle } from '@/lib/icons';
import { trackEvent } from '@/lib/analytics';

export const FloatingFeedbackButton: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialPage] = useState(() => typeof window !== 'undefined' ? window.location.pathname : '');

  const openModal = () => {
    trackEvent('feedback_modal_opened', { location: 'floating_button' });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Button
        onClick={openModal}
        className="fixed bottom-6 right-6 z-50 w-auto h-14 rounded-full px-4 py-2 depth-top shadow-depth-lg hover:shadow-elevated hover:scale-105 transition-all duration-300 flex items-center gap-2"
        aria-label="Feedback"
        style={{ animation: 'pulse 2s infinite' }}
      >
        <MessageCircle className="h-5 w-5" />
        <span className="hidden sm:inline">Feedback</span>
      </Button>

      <style jsx>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
          100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }
      `}</style>

      <FeedbackModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        initialPage={initialPage}
      />
    </>
  );
};