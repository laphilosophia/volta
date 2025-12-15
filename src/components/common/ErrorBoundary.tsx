// ============================================================================
// Error Boundary Component - Reusable Error Handling
// ============================================================================

import React from 'react'

// ============================================================================
// Error Fallback UI
// ============================================================================

interface ErrorFallbackProps {
  error: Error
  onRetry?: () => void
  title?: string
  compact?: boolean
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  onRetry,
  title = 'Something went wrong',
  compact = false,
}) => {
  if (compact) {
    return (
      <div
        className="p-4 rounded-xs border border-red-200 bg-red-50 text-red-700"
        role="alert"
      >
        <h4 className="font-semibold mb-1">Component Error</h4>
        <p className="text-xs text-red-600 mb-2">{error.message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-sm px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center h-screen bg-(--color-background)">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-(--color-text-primary) mb-2">
          {title}
        </h2>
        <p className="text-sm text-(--color-text-muted) mb-6">
          {error.message || 'An unexpected error occurred'}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-2.5 bg-(--color-primary) text-white rounded-xs
              hover:opacity-90 transition-opacity font-medium"
          >
            Reload Application
          </button>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// Error Boundary Class Component
// ============================================================================

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  compact?: boolean
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('ErrorBoundary caught error:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: undefined })
    window.location.reload()
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <ErrorFallback
          error={this.state.error || new Error('Unknown error')}
          onRetry={this.handleRetry}
          compact={this.props.compact}
        />
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
