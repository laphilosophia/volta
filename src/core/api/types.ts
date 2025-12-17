// ============================================================================
// Volta Core API Definitions
// ============================================================================

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

/**
 * Defines a microservice or external API source.
 */
export interface ServiceDefinition {
  baseUrl: string
  headers?: Record<string, string>
  /**
   * Optional authentication configuration
   * @example { type: 'bearer', tokenStorageKey: 'auth_token' }
   */
  auth?: {
    type: 'bearer' | 'basic' | 'apikey'
    tokenStorageKey?: string
    headerName?: string // For 'apikey', e.g., 'x-api-key'
  }
}

/**
 * Defines a specific API endpoint within a service.
 */
export interface EndpointDefinition {
  service: string // Must match a key in VoltaConfig.services
  path: string
  method: HttpMethod
  /**
   * Description for the designer UI
   */
  description?: string
  /**
   * Default parameters for the request
   */
  defaultParams?: Record<string, string | number | boolean>
}

/**
 * Theme layer configuration
 */
export interface ThemeConfig {
  /**
   * CDN URL for fetching tenant themes
   * @default 'https://cdn.yourapp.com'
   */
  cdnUrl?: string
  /**
   * Default theme to use when tenant theme is not available
   */
  defaultTheme?: {
    colors?: {
      primary?: string
      secondary?: string
      accent?: string
      neutral?: string
    }
    logo?: string
    favicon?: string
  }
}

/**
 * The main configuration object for a Volta application.
 */
export interface VoltaConfig {
  /**
   * Catalog of all available backend services
   */
  services: Record<string, ServiceDefinition>

  /**
   * Library of all available endpoints
   */
  endpoints: Record<string, EndpointDefinition>

  /**
   * Theme layer configuration
   */
  theme?: ThemeConfig
}
