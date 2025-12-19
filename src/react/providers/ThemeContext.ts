// ============================================================================
// ThemeContext - React Context for ThemeManager
// ============================================================================

import { createContext } from 'react'

export interface ThemeContextValue<T extends object> {
  /** Current theme */
  theme: T
  /** Set the entire theme */
  setTheme: (theme: T) => void
  /** Update partial theme values */
  updateTheme: (partial: Partial<T>) => void
  /** Load theme for a tenant */
  loadTheme: (tenantId: string) => Promise<T>
  /** Reset to default theme */
  reset: () => void
  /** Get value by path */
  get: (path: string) => unknown
  /** Toggle dark mode */
  toggleDarkMode: (enabled?: boolean) => boolean
  /** Current tenant ID */
  tenantId?: string
}

export const ThemeContext = createContext<ThemeContextValue<object> | undefined>(undefined)
