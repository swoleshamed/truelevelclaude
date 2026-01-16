// ===========================================
// FILE: src/components/ui/ErrorBoundary.tsx
// PURPOSE: Error boundary for graceful error handling
// PRD REFERENCE: PRD Section 10 - Error Handling
// USED BY: Layout, page components
// ===========================================

'use client';

import React, { Component, ReactNode } from 'react';
import { Button } from './Button';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary Component
 *
 * WHY: Catch JavaScript errors anywhere in the child component tree,
 * log them, and display a fallback UI instead of crashing.
 *
 * FEATURES:
 * - Catches render errors
 * - Displays fallback UI
 * - Provides retry functionality
 * - Reports errors (optional)
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, you would report to an error tracking service
    // e.g., Sentry, LogRocket, etc.
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback
          error={this.state.error}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Default error fallback UI
 */
interface ErrorFallbackProps {
  error: Error | null;
  onRetry?: () => void;
}

export function ErrorFallback({ error, onRetry }: ErrorFallbackProps) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {/* Error Icon */}
        <div className="mx-auto w-16 h-16 mb-6 rounded-full bg-error/10 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-error"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Error Message */}
        <h2 className="text-xl font-semibold text-text-primary mb-2">
          Something went wrong
        </h2>
        <p className="text-text-secondary mb-6">
          We're sorry, but something unexpected happened. Please try again.
        </p>

        {/* Error Details (development only) */}
        {process.env.NODE_ENV === 'development' && error && (
          <div className="mb-6 p-4 bg-error/5 border border-error/20 rounded-lg text-left">
            <p className="text-sm font-mono text-error break-all">
              {error.message}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          {onRetry && (
            <Button onClick={onRetry}>
              Try Again
            </Button>
          )}
          <Button
            variant="secondary"
            onClick={() => window.location.href = '/'}
          >
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Page Error Component - Full page error display
 */
interface PageErrorProps {
  title?: string;
  message?: string;
  showRetry?: boolean;
  onRetry?: () => void;
}

export function PageError({
  title = 'Page Error',
  message = 'This page encountered an error and cannot be displayed.',
  showRetry = true,
  onRetry,
}: PageErrorProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-bg-primary">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto w-20 h-20 mb-8 rounded-full bg-error/10 flex items-center justify-center">
          <svg
            className="w-10 h-10 text-error"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-text-primary mb-3">{title}</h1>
        <p className="text-text-secondary mb-8">{message}</p>

        <div className="flex gap-3 justify-center">
          {showRetry && onRetry && (
            <Button onClick={onRetry}>
              Try Again
            </Button>
          )}
          <Button
            variant="secondary"
            onClick={() => window.location.href = '/'}
          >
            Return Home
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Not Found Component - 404 page
 */
export function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-bg-primary">
      <div className="max-w-md w-full text-center">
        <div className="text-8xl font-bold text-primary/20 mb-4">404</div>
        <h1 className="text-2xl font-bold text-text-primary mb-3">
          Page Not Found
        </h1>
        <p className="text-text-secondary mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button onClick={() => window.location.href = '/'}>
          Go Home
        </Button>
      </div>
    </div>
  );
}
