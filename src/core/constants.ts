// ============================================================================
// Volta Constants - Centralized Configuration
// ============================================================================

/**
 * Storage keys for localStorage/sessionStorage
 */
export const STORAGE_KEYS = {
  /** Dark mode preference */
  DARK_MODE: 'volta-dark-mode',
  /** Theme cache prefix */
  THEME_CACHE_PREFIX: 'volta-theme-',
} as const

/**
 * Cookie names for CSRF and authentication
 */
export const COOKIE_NAMES = {
  /** XSRF token cookie name */
  XSRF_TOKEN: 'XSRF-TOKEN',
} as const

/**
 * Event names for custom events
 */
export const EVENT_NAMES = {
  /** Theme change event */
  THEME_CHANGE: 'volta:theme-change',
} as const

/**
 * Default configuration values
 */
export const DEFAULTS = {
  /** Default theme CDN path pattern */
  THEME_CDN_PATH: '/themes/{tenantId}.json',
} as const
