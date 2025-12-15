// ============================================================================
// Empty State - Reusable Empty State Component
// ============================================================================

import { Layout, Plus } from 'lucide-react'
import React from 'react'
import { ActionButton } from '../../common/Button'

// ============================================================================
// Types
// ============================================================================

interface EmptyStateProps {
  /** Icon to display */
  icon?: React.ReactNode
  /** Title text */
  title?: string
  /** Description text */
  description?: string
  /** Action button handler */
  onAction?: () => void
  /** Action button label */
  actionLabel?: string
  /** Minimum height */
  minHeight?: string
}

// ============================================================================
// Empty State Component
// ============================================================================

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = <Layout className="w-16 h-16 text-(--color-text-muted)" />,
  title = 'No Components Yet',
  description = 'Add components from the palette to start building your page.',
  onAction,
  actionLabel = 'Add Component',
  minHeight = '400px',
}) => (
  <div className="flex flex-col items-center justify-center text-center" style={{ minHeight }}>
    <div className="mb-4 opacity-50">{icon}</div>
    <h3 className="text-lg font-medium text-(--color-text-primary) mb-2">{title}</h3>
    <p className="text-sm text-(--color-text-muted) mb-4 max-w-xs">{description}</p>
    {onAction && (
      <ActionButton onClick={onAction} icon={<Plus className="w-4 h-4" />}>
        {actionLabel}
      </ActionButton>
    )}
  </div>
)
