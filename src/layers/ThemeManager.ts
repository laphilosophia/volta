// ============================================================================
// ThemeManager - Generic Theme System (Pure TypeScript)
// ============================================================================

import { EVENT_NAMES, STORAGE_KEYS } from '../core/constants'

/**
 * Configuration for creating a ThemeManager
 */
export interface ThemeManagerConfig<T extends object> {
  /**
   * Default theme to use when no tenant theme is loaded
   */
  defaultTheme: T

  /**
   * Optional: Map theme values to CSS variables
   * If provided, variables will be applied to :root when theme changes
   */
  cssVariables?: (theme: T) => Record<string, string>

  /**
   * Optional: CDN URL for fetching tenant themes
   */
  cdnUrl?: string
}

/**
 * Theme change event detail
 */
export interface ThemeChangeEvent<T> {
  theme: T
  tenantId?: string
}

/**
 * Generic ThemeManager for any theme structure
 * Supports CSS variables injection and multi-tenant theming
 */
export class ThemeManager<T extends object> {
  private config: ThemeManagerConfig<T>
  private currentTheme: T
  private currentTenantId?: string
  private cache = new Map<string, T>()
  private subscribers = new Set<(theme: T) => void>()

  constructor(config: ThemeManagerConfig<T>) {
    this.config = config
    this.currentTheme = config.defaultTheme
  }

  // ===========================================================================
  // Public API
  // ===========================================================================

  /**
   * Get the current theme
   */
  getTheme(): T {
    return this.currentTheme
  }

  /**
   * Get a specific value from the theme using dot notation
   * @example theme.get('colors.primary')
   */
  get<K extends string>(path: K): unknown {
    return path.split('.').reduce((obj: unknown, key) => {
      if (obj && typeof obj === 'object' && key in obj) {
        return (obj as Record<string, unknown>)[key]
      }
      return undefined
    }, this.currentTheme)
  }

  /**
   * Set the theme directly
   */
  setTheme(theme: T, tenantId?: string): void {
    this.currentTheme = theme
    this.currentTenantId = tenantId
    this.applyCSS()
    this.notify()
    this.emitEvent()
  }

  /**
   * Update partial theme values (merge with current)
   */
  updateTheme(partial: Partial<T>): void {
    this.currentTheme = this.deepMerge(this.currentTheme, partial)
    this.applyCSS()
    this.notify()
    this.emitEvent()
  }

  /**
   * Load theme for a tenant from CDN
   */
  async loadTheme(tenantId: string): Promise<T> {
    // Check cache
    const cached = this.cache.get(tenantId)
    if (cached) {
      this.setTheme(cached, tenantId)
      return cached
    }

    // Fetch from CDN
    const cdnUrl = this.config.cdnUrl
    if (!cdnUrl) {
      console.warn('No CDN URL configured, using default theme')
      return this.currentTheme
    }

    try {
      const response = await fetch(`${cdnUrl}/themes/${tenantId}.json`)

      if (!response.ok) {
        console.warn(`Theme not found for tenant: ${tenantId}`)
        return this.currentTheme
      }

      const theme: T = await response.json()
      this.cache.set(tenantId, theme)
      this.setTheme(theme, tenantId)
      return theme
    } catch (error) {
      console.error('Failed to load theme:', error)
      return this.currentTheme
    }
  }

  /**
   * Reset to default theme
   */
  reset(): void {
    this.setTheme(this.config.defaultTheme)
    this.currentTenantId = undefined
  }

  /**
   * Subscribe to theme changes
   */
  subscribe(callback: (theme: T) => void): () => void {
    this.subscribers.add(callback)
    return () => this.subscribers.delete(callback)
  }

  /**
   * Get current tenant ID (if loaded from CDN)
   */
  getTenantId(): string | undefined {
    return this.currentTenantId
  }

  // ===========================================================================
  // Dark Mode Support
  // ===========================================================================

  /**
   * Toggle dark mode class on document
   */
  toggleDarkMode(enabled?: boolean): boolean {
    if (typeof document === 'undefined') return false

    const isDark = enabled ?? !document.documentElement.classList.contains('dark')
    document.documentElement.classList.toggle('dark', isDark)

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.DARK_MODE, String(isDark))
    }

    return isDark
  }

  /**
   * Initialize dark mode from user preference
   */
  initDarkMode(): boolean {
    if (typeof window === 'undefined') return false

    const saved = localStorage.getItem(STORAGE_KEYS.DARK_MODE)
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const shouldBeDark = saved !== null ? saved === 'true' : prefersDark

    return this.toggleDarkMode(shouldBeDark)
  }

  // ===========================================================================
  // Private Methods
  // ===========================================================================

  private applyCSS(): void {
    if (typeof document === 'undefined') return
    if (!this.config.cssVariables) return

    const variables = this.config.cssVariables(this.currentTheme)
    const root = document.documentElement

    Object.entries(variables).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })
  }

  private notify(): void {
    this.subscribers.forEach((callback) => callback(this.currentTheme))
  }

  private emitEvent(): void {
    if (typeof window === 'undefined') return

    const event = new CustomEvent<ThemeChangeEvent<T>>(EVENT_NAMES.THEME_CHANGE, {
      detail: {
        theme: this.currentTheme,
        tenantId: this.currentTenantId,
      },
    })
    window.dispatchEvent(event)
  }

  private deepMerge(target: T, source: Partial<T>): T {
    const result = { ...target }

    for (const key of Object.keys(source) as (keyof T)[]) {
      const sourceValue = source[key]
      const targetValue = target[key]

      if (
        sourceValue &&
        typeof sourceValue === 'object' &&
        !Array.isArray(sourceValue) &&
        targetValue &&
        typeof targetValue === 'object'
      ) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        result[key] = this.deepMerge(targetValue as any, sourceValue as any) as T[keyof T]
      } else if (sourceValue !== undefined) {
        result[key] = sourceValue as T[keyof T]
      }
    }

    return result
  }
}

// ===========================================================================
// Factory Function
// ===========================================================================

/**
 * Create a new ThemeManager instance
 */
export function createThemeManager<T extends object>(
  config: ThemeManagerConfig<T>
): ThemeManager<T> {
  return new ThemeManager(config)
}

// Types are exported via interface declarations above
