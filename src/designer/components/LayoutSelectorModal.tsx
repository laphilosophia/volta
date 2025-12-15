// ============================================================================
// Layout Selector Modal
// ============================================================================

import { LayoutDashboard } from 'lucide-react'
import React from 'react'
import { LayoutSelector } from '../../components/designer'
import type { LayoutTemplate } from '../../core'

// ============================================================================
// Types
// ============================================================================

interface LayoutSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectLayout: (template: LayoutTemplate) => void
  currentLayoutId: string
}

// ============================================================================
// Component
// ============================================================================

export const LayoutSelectorModal: React.FC<LayoutSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectLayout,
  currentLayoutId,
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative bg-(--color-surface) rounded-xl shadow-2xl w-full max-w-lg p-6">
        <h2 className="text-lg font-semibold text-(--color-text-primary) mb-4 flex items-center gap-2">
          <LayoutDashboard className="w-5 h-5 text-(--color-primary)" />
          Select Page Layout
        </h2>

        <LayoutSelector
          selectedLayoutId={currentLayoutId}
          onSelectLayout={(template) => {
            onSelectLayout(template)
            onClose()
          }}
        />

        <div className="mt-4 pt-4 border-t border-(--color-border) flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg text-(--color-text-muted) hover:bg-(--color-surface-hover)"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
