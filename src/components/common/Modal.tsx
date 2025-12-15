// ============================================================================
// Modal Component - Reusable Modal Dialog
// ============================================================================

import React, { useCallback, useEffect } from 'react'

// ============================================================================
// Types
// ============================================================================

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: React.ReactNode
  icon?: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

// ============================================================================
// Size Configurations
// ============================================================================

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

// ============================================================================
// Main Component
// ============================================================================

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  icon,
  children,
  footer,
  size = 'md',
}) => {
  // Handle escape key
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    },
    [onClose]
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleEscape])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className={`
          relative bg-(--color-surface) rounded-xl shadow-2xl
          w-full ${sizeClasses[size]} mx-4 animate-fadeIn
        `}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        {title && (
          <div className="p-6 border-b border-(--color-border)">
            <h2 className="text-lg font-semibold text-(--color-text-primary) flex items-center gap-2">
              {icon && <span className="text-(--color-primary)">{icon}</span>}
              {title}
            </h2>
          </div>
        )}

        {/* Content */}
        <div className="p-6">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="p-4 border-t border-(--color-border) flex justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
