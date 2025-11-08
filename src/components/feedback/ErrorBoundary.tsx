import React, { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { FeedbackModal } from './FeedbackModal';

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
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-4 max-w-2xl mx-auto">
          <div className="bg-destructive/10 border border-destructive rounded-lg p-4 mb-4">
            <h2 className="text-lg font-semibold text-destructive">Something went wrong</h2>
            <p className="text-destructive/80 mt-2">{this.state.error?.message}</p>
          </div>
          <p className="mb-4">We{'&apos;'}ve been notified of this issue. If you{'&apos;'}d like to provide more details, please share your feedback below.</p>
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