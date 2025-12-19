// ============================================================================
// ThemeProvider - React Provider for Theme Management
// ============================================================================
// Provides theme context to React components.
// Can accept either a ThemeManager instance or a config to create one internally.

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { ThemeManager, type ThemeManagerConfig } from '../../layers/theme-manager'
import { ThemeContext, type ThemeContextValue } from './ThemeContext'

// ============================================================================
// Props
// ============================================================================

interface ThemeProviderWithManagerProps<T extends object> {
  /** ThemeManager instance (if you need to share it outside React) */
  manager: ThemeManager<T>
  config?: never
  children: ReactNode
  initDarkMode?: boolean
}

interface ThemeProviderWithConfigProps<T extends object> {
  /**
   * Theme config (ThemeProvider will create ThemeManager internally)
   *
   * **IMPORTANT**: This should be a stable reference (defined outside component
   * or memoized with useMemo). Changing the config reference will create a new
   * ThemeManager and reset theme state.
   */
  config: ThemeManagerConfig<T>
  manager?: never
  children: ReactNode
  initDarkMode?: boolean
}

export type ThemeProviderProps<T extends object> =
  | ThemeProviderWithManagerProps<T>
  | ThemeProviderWithConfigProps<T>

// ============================================================================
// ThemeProvider Component
// ============================================================================

/**
 * React provider for theme management.
 * Can be used in two ways:
 *
 * @example With config (recommended for React-only apps)
 * ```tsx
 * // Define config outside component or use useMemo
 * const themeConfig = { defaultTheme: { mode: 'light', colors: {...} } }
 *
 * <ThemeProvider config={themeConfig}>
 *   <App />
 * </ThemeProvider>
 * ```
 *
 * @example With manager (for sharing ThemeManager outside React)
 * ```tsx
 * const themeManager = new ThemeManager({ defaultTheme: {...} })
 *
 * <ThemeProvider manager={themeManager}>
 *   <App />
 * </ThemeProvider>
 * ```
 */
export function ThemeProvider<T extends object>({
  manager: externalManager,
  config,
  children,
  initDarkMode = false,
}: ThemeProviderProps<T>) {
  // Get or create manager
  const manager = useMemo(() => {
    if (externalManager) {
      return externalManager
    }

    if (config) {
      return new ThemeManager<T>(config)
    }

    throw new Error('ThemeProvider requires either a manager or a config')
  }, [externalManager, config])

  const [theme, setThemeState] = useState<T>(manager.getTheme())
  const [tenantId, setTenantId] = useState<string | undefined>(manager.getTenantId())

  // Subscribe to theme changes
  useEffect(() => {
    const unsubscribe = manager.subscribe((newTheme: T) => {
      setThemeState(newTheme)
      setTenantId(manager.getTenantId())
    })

    return unsubscribe
  }, [manager])

  // Initialize dark mode
  useEffect(() => {
    if (initDarkMode) {
      manager.initDarkMode()
    }
  }, [manager, initDarkMode])

  // Memoized context value
  const value = useMemo<ThemeContextValue<T>>(
    () => ({
      theme,
      tenantId,
      setTheme: (t: T) => manager.setTheme(t),
      updateTheme: (partial: Partial<T>) => manager.updateTheme(partial),
      loadTheme: (id: string) => manager.loadTheme(id),
      reset: () => manager.reset(),
      get: (path: string) => manager.get(path),
      toggleDarkMode: (enabled?: boolean) => manager.toggleDarkMode(enabled),
    }),
    [theme, tenantId, manager]
  )

  return (
    <ThemeContext.Provider value={value as unknown as ThemeContextValue<object>}>
      {children}
    </ThemeContext.Provider>
  )
}

// ============================================================================
// Re-export types for convenience
// ============================================================================

export type { ThemeManagerConfig }
