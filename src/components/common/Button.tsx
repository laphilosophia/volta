// ============================================================================
// Button Components - Reusable Button Primitives
// ============================================================================

import React, { forwardRef } from 'react'

// ============================================================================
// Types
// ============================================================================

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface BaseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isActive?: boolean
  isLoading?: boolean
}

// ============================================================================
// Style Configurations
// ============================================================================

const variantStyles: Record<ButtonVariant, { base: string; active: string }> = {
  primary: {
    base: 'bg-(--color-primary) text-white hover:opacity-90',
    active: 'bg-(--color-primary) text-white',
  },
  secondary: {
    base: 'bg-(--color-surface-hover) text-(--color-text-primary) hover:bg-(--color-primary) hover:bg-opacity-10',
    active: 'bg-(--color-primary-light) text-(--color-primary)',
  },
  ghost: {
    base: 'text-(--color-text-primary) hover:bg-(--color-surface-hover)',
    active: 'bg-(--color-primary-light) text-(--color-primary)',
  },
  danger: {
    base: 'bg-red-50 text-red-600 hover:bg-red-100',
    active: 'bg-red-100 text-red-700',
  },
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base',
}

// ============================================================================
// Icon Button (for toolbar icons)
// ============================================================================

interface IconButtonProps extends BaseButtonProps {
  icon: React.ReactNode
  label: string
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, label, variant = 'ghost', isActive = false, disabled, className = '', ...props }, ref) => {
    const styles = variantStyles[variant]

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`
          p-2 rounded-xs transition-colors
          ${isActive ? styles.active : styles.base}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${className}
        `}
        title={label}
        aria-label={label}
        {...props}
      >
        {icon}
      </button>
    )
  }
)

IconButton.displayName = 'IconButton'

// ============================================================================
// Toolbar Button (icon + optional text)
// ============================================================================

interface ToolbarButtonProps extends BaseButtonProps {
  icon?: React.ReactNode
  children?: React.ReactNode
}

export const ToolbarButton = forwardRef<HTMLButtonElement, ToolbarButtonProps>(
  ({ icon, children, variant = 'ghost', size = 'md', isActive = false, disabled, className = '', ...props }, ref) => {
    const styles = variantStyles[variant]

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`
          flex items-center gap-1.5 rounded-xs transition-colors
          ${sizeStyles[size]}
          ${isActive ? styles.active : styles.base}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${className}
        `}
        {...props}
      >
        {icon}
        {children}
      </button>
    )
  }
)

ToolbarButton.displayName = 'ToolbarButton'

// ============================================================================
// Action Button (full button with text)
// ============================================================================

interface ActionButtonProps extends BaseButtonProps {
  icon?: React.ReactNode
  children: React.ReactNode
}

export const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
  ({ icon, children, variant = 'primary', size = 'md', isLoading = false, disabled, className = '', ...props }, ref) => {
    const styles = variantStyles[variant]

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`
          flex items-center justify-center gap-2 rounded-xs transition-colors font-medium
          ${sizeStyles[size]}
          ${styles.base}
          ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''}
          ${className}
        `}
        {...props}
      >
        {isLoading ? (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          icon
        )}
        {children}
      </button>
    )
  }
)

ActionButton.displayName = 'ActionButton'

// ============================================================================
// Button Group (for toggle buttons)
// ============================================================================

interface ButtonGroupProps {
  children: React.ReactNode
  className?: string
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({ children, className = '' }) => (
  <div className={`flex rounded-xs border border-(--color-border) overflow-hidden ${className}`}>
    {children}
  </div>
)

interface ButtonGroupItemProps extends BaseButtonProps {
  icon?: React.ReactNode
  children?: React.ReactNode
}

export const ButtonGroupItem = forwardRef<HTMLButtonElement, ButtonGroupItemProps>(
  ({ icon, children, isActive = false, className = '', ...props }, ref) => (
    <button
      ref={ref}
      className={`
        px-3 py-1.5 text-sm flex items-center gap-1 transition-colors
        ${isActive
          ? 'bg-(--color-primary) text-white'
          : 'text-(--color-text-primary) hover:bg-(--color-surface-hover)'}
        ${className}
      `}
      {...props}
    >
      {icon}
      {children}
    </button>
  )
)

ButtonGroupItem.displayName = 'ButtonGroupItem'
