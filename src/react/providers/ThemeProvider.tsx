// ============================================================================
// ThemeProvider - React Provider for ThemeManager
// ============================================================================

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { ThemeManager } from '../../layers/ThemeManager'
import { ThemeContext, type ThemeContextValue } from './ThemeContext'

interface ThemeProviderProps<T extends object> {
  /** ThemeManager instance */
  manager: ThemeManager<T>
  /** Children */
  children: ReactNode
  /** Initialize dark mode on mount */
  initDarkMode?: boolean
}

export function ThemeProvider<T extends object>({
  manager,
  children,
  initDarkMode = false,
}: ThemeProviderProps<T>) {
  const [theme, setThemeState] = useState<T>(manager.getTheme())
  const [tenantId, setTenantId] = useState<string | undefined>(manager.getTenantId())

  // Subscribe to theme changes
  useEffect(() => {
    const unsubscribe = manager.subscribe((newTheme) => {
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

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
