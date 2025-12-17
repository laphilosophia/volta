// ============================================================================
// Theme Hooks - React hooks for ThemeManager
// ============================================================================

import { useContext } from 'react'
import { ThemeContext, type ThemeContextValue } from './ThemeContext'

/**
 * Hook to access the current theme and theme utilities
 * Must be used within a ThemeProvider
 */
export function useTheme<T extends object>(): ThemeContextValue<T> {
  const context = useContext(ThemeContext)

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }

  return context as ThemeContextValue<T>
}

/**
 * Hook to get a specific theme value by path
 * @example const primary = useThemeValue('colors.primary')
 */
export function useThemeValue(path: string): unknown {
  const { get } = useTheme()
  return get(path)
}
