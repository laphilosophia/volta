// ============================================================================
// Shared Style Utilities - Reusable CSS class definitions
// ============================================================================

/**
 * Form input size classes for consistent sizing across components.
 */
export const formSizeClasses = {
  sm: 'h-8 text-sm px-2.5',
  md: 'h-10 text-sm px-3',
  lg: 'h-12 text-base px-4',
} as const

export type FormSize = keyof typeof formSizeClasses

/**
 * Form input variant classes for different visual styles.
 * Uses CSS variables for theming support.
 */
export const formVariantClasses = {
  default: `
    bg-[var(--color-surface)]
    border border-[var(--color-border)]
    focus:border-[var(--color-primary)]
    focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-20
  `,
  filled: `
    bg-[var(--color-surface-hover)]
    border border-transparent
    focus:bg-[var(--color-surface)]
    focus:border-[var(--color-primary)]
    focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-20
  `,
  ghost: `
    bg-transparent
    border border-transparent
    hover:bg-[var(--color-surface-hover)]
    focus:border-[var(--color-primary)]
    focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-20
  `,
} as const

export type FormVariant = keyof typeof formVariantClasses

/**
 * Icon size classes for consistent icon sizing.
 */
export const iconSizeClasses = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
} as const

export type IconSize = keyof typeof iconSizeClasses

/**
 * Maps form sizes to appropriate icon sizes.
 */
export const formSizeToIconSize: Record<FormSize, IconSize> = {
  sm: 'sm',
  md: 'sm',
  lg: 'md',
}

/**
 * Common button variant classes.
 */
export const buttonVariantClasses = {
  primary: `
    bg-(--color-primary) text-white
    hover:opacity-90
    focus:ring-2 focus:ring-(--color-primary) focus:ring-offset-2
  `,
  secondary: `
    bg-(--color-surface-hover) text-(--color-text-primary)
    border border-(--color-border)
    hover:bg-(--color-surface)
    focus:ring-2 focus:ring-(--color-primary) focus:ring-offset-2
  `,
  ghost: `
    bg-transparent text-(--color-text-primary)
    hover:bg-(--color-surface-hover)
    focus:ring-2 focus:ring-(--color-primary)
  `,
  danger: `
    bg-red-500 text-white
    hover:bg-red-600
    focus:ring-2 focus:ring-red-500 focus:ring-offset-2
  `,
} as const

export type ButtonVariant = keyof typeof buttonVariantClasses

/**
 * Common disabled state classes.
 */
export const disabledClasses = 'opacity-50 cursor-not-allowed pointer-events-none'

/**
 * Common transition classes for smooth interactions.
 */
export const transitionClasses = {
  fast: 'transition-all duration-150',
  normal: 'transition-all duration-200',
  slow: 'transition-all duration-300',
} as const

/**
 * Helper to combine class names, filtering out falsy values.
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim()
}
