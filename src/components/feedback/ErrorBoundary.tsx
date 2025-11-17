import React, { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { FeedbackModal } from './FeedbackModal';
import { logger } from '@/lib/logger';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from '@/lib/icons';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: undefined };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('Error caught by boundary', { 
      error: error.message, 
      stack: error.stack,
      componentStack: errorInfo.componentStack 
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-4 max-w-2xl mx-auto">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription>
              {this.state.error?.message || 'An unexpected error occurred'}
            </AlertDescription>
          </Alert>
          <p className="mb-4 text-sm text-muted-foreground">
            We{'\''}ve been notified of this issue. If you{'\''}d like to provide more details, please share your feedback below.
          </p>
          <FeedbackTrigger error={this.state.error} />
        </div>
      );
    }

    return this.props.children;
  }
}

const FeedbackTrigger: React.FC<{ error?: Error }> = ({ error }) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [initialPage] = React.useState(() => typeof window !== 'undefined' ? window.location.pathname : '');

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        variant="outline"
        className="mr-2"
      >
        Report Problem
      </Button>
      
      <FeedbackModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        initialPage={initialPage}
      />
    </>
  );
};

export default ErrorBoundary;