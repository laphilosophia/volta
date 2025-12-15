// ============================================================================
// Loading Components - Reusable Loading States
// ============================================================================

import React from 'react'

// ============================================================================
// Loading Spinner
// ============================================================================

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = '',
}) => (
  <div className={`relative ${sizeClasses[size]} ${className}`}>
    <div className="absolute inset-0 rounded-full border-4 border-(--color-primary-light)" />
    <div className="absolute inset-0 rounded-full border-4 border-(--color-primary) border-t-transparent animate-spin" />
  </div>
)

// ============================================================================
// Full Screen Loading
// ============================================================================

interface LoadingScreenProps {
  title?: string
  subtitle?: string
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  title = 'Loading...',
  subtitle = 'Preparing your workspace',
}) => (
  <div className="flex items-center justify-center h-screen bg-(--color-background)">
    <div className="text-center">
      <LoadingSpinner size="lg" className="mx-auto mb-6" />
      <h2 className="text-lg font-semibold text-(--color-text-primary) mb-2">
        {title}
      </h2>
      <p className="text-sm text-(--color-text-muted)">{subtitle}</p>
    </div>
  </div>
)

// ============================================================================
// Component Skeleton (Loading Placeholder)
// ============================================================================

interface SkeletonProps {
  className?: string
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div
    className={`skeleton rounded-xs h-32 w-full ${className}`}
    role="progressbar"
    aria-label="Loading component..."
  />
)
