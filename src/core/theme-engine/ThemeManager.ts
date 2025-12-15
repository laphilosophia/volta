// ============================================================================
// Theme Manager - White-label Theming System
// ============================================================================

import type { TenantTheme } from '../types'

// Default CDN URL (can be configured per deployment)
const DEFAULT_CDN_URL = 'https://cdn.yourapp.com'

/**
 * ThemeManager handles tenant-specific theming with caching and runtime CSS variable injection.
 */
class ThemeManager {
  private cache = new Map<string, TenantTheme>()
  private cdnUrl: string
  private currentTheme: TenantTheme | null = null

  constructor(cdnUrl = DEFAULT_CDN_URL) {
    this.cdnUrl = cdnUrl
  }

  /**
   * Set the CDN URL for fetching themes
   */
  setCdnUrl(url: string): void {
    this.cdnUrl = url
  }

  /**
   * Get the current active theme
   */
  getCurrentTheme(): TenantTheme | null {
    return this.currentTheme
  }

  /**
   * Load and apply theme for a specific tenant
   */
  async loadTheme(tenantId: string): Promise<TenantTheme> {
    // Check cache first
    if (this.cache.has(tenantId)) {
      const cachedTheme = this.cache.get(tenantId)!
      this.applyTheme(cachedTheme)
      return cachedTheme
    }

    // In development mode, skip CDN and use default theme
    const isDevelopment = import.meta.env.DEV
    if (isDevelopment) {
      const defaultTheme = this.getDefaultTheme()
      defaultTheme.tenantId = tenantId
      this.cache.set(tenantId, defaultTheme)
      return defaultTheme
    }

    try {
      // Fetch theme from CDN (production only)
      const response = await fetch(`${this.cdnUrl}/themes/${tenantId}.json`)

      if (!response.ok) {
        console.warn(`Theme not found for tenant: ${tenantId}, using default`)
        return this.getDefaultTheme()
      }

      const theme: TenantTheme = await response.json()
      this.cache.set(tenantId, theme)
      this.applyTheme(theme)
      return theme
    } catch (error) {
      console.error('Failed to load theme:', error)
      return this.getDefaultTheme()
    }
  }

  /**
   * Apply theme directly (for local/preview mode)
   */
  applyTheme(theme: TenantTheme): void {
    this.currentTheme = theme
    const root = document.documentElement

    // Set color CSS variables
    root.style.setProperty('--color-primary', theme.colors.primary)
    root.style.setProperty('--color-secondary', theme.colors.secondary)
    root.style.setProperty('--color-accent', theme.colors.accent)
    root.style.setProperty('--color-neutral', theme.colors.neutral)

    // Derived colors
    root.style.setProperty(
      '--color-primary-light',
      `color-mix(in srgb, ${theme.colors.primary} 20%, white)`
    )
    root.style.setProperty(
      '--color-primary-dark',
      `color-mix(in srgb, ${theme.colors.primary} 80%, black)`
    )

    // Update favicon
    this.updateFavicon(theme.favicon)

    // Emit theme change event
    window.dispatchEvent(new CustomEvent('themeChange', { detail: theme }))
  }

  /**
   * Update favicon dynamically
   */
  private updateFavicon(faviconUrl: string): void {
    let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null

    if (!favicon) {
      favicon = document.createElement('link')
      favicon.rel = 'icon'
      document.head.appendChild(favicon)
    }

    favicon.href = faviconUrl
  }

  /**
   * Get default theme when tenant theme is not available
   */
  getDefaultTheme(): TenantTheme {
    const defaultTheme: TenantTheme = {
      tenantId: 'default',
      colors: {
        primary: '#3B82F6',
        secondary: '#8B5CF6',
        accent: '#10B981',
        neutral: '#6B7280',
      },
      logo: '/logo.svg',
      favicon: '/favicon.ico',
    }

    this.applyTheme(defaultTheme)
    return defaultTheme
  }

  /**
   * Clear theme cache
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * Pre-load multiple themes for faster switching
   */
  async preloadThemes(tenantIds: string[]): Promise<void> {
    await Promise.all(tenantIds.map((id) => this.loadTheme(id)))
  }

  /**
   * Toggle dark mode
   */
  toggleDarkMode(enabled?: boolean): boolean {
    const isDark = enabled ?? !document.documentElement.classList.contains('dark')
    document.documentElement.classList.toggle('dark', isDark)
    localStorage.setItem('darkMode', String(isDark))
    return isDark
  }

  /**
   * Initialize dark mode from user preference
   */
  initDarkMode(): void {
    const savedPreference = localStorage.getItem('darkMode')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    const shouldBeDark = savedPreference !== null ? savedPreference === 'true' : prefersDark

    this.toggleDarkMode(shouldBeDark)
  }
}

// Singleton instance
export const themeManager = new ThemeManager()
