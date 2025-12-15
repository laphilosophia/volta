import { ApiError, ConfigurationError, NetworkError } from './errors'
import type { VoltaConfig } from './types'

export class ApiClient {
  private config: VoltaConfig

  constructor(config: VoltaConfig) {
    this.config = config
  }

  /**
   * Resolves the full URL for a given endpoint.
   */
  private resolveUrl(endpointKey: string, params?: Record<string, unknown>): string {
    const endpoint = this.config.endpoints[endpointKey]
    if (!endpoint) {
      throw new ConfigurationError(
        `Endpoint "${endpointKey}" not found in configuration.`,
        `endpoints.${endpointKey}`
      )
    }

    const service = this.config.services[endpoint.service]
    if (!service) {
      throw new ConfigurationError(
        `Service "${endpoint.service}" not found in configuration.`,
        `services.${endpoint.service}`
      )
    }

    // Join base URL and path, ensuring no double slashes
    const baseUrl = service.baseUrl.replace(/\/+$/, '')
    const path = endpoint.path.replace(/^\/+/, '')
    let url = `${baseUrl}/${path}`

    // Replace path parameters (e.g., /users/:id)
    if (params) {
      Object.keys(params).forEach((key) => {
        if (url.includes(`:${key}`)) {
          url = url.replace(`:${key}`, String(params[key]))
          // Remove from query params if used in path
          delete params[key]
        }
      })
    }

    return url
  }

  /**
   * Executes an API request for the given endpoint.
   * @throws {ApiError} When the API returns a non-OK response
   * @throws {NetworkError} When a network failure occurs
   * @throws {ConfigurationError} When the endpoint or service is not configured
   */
  async request<T>(
    endpointKey: string,
    params?: Record<string, unknown>,
    body?: unknown
  ): Promise<T> {
    const endpoint = this.config.endpoints[endpointKey]
    if (!endpoint) {
      throw new ConfigurationError(
        `Endpoint "${endpointKey}" not found.`,
        `endpoints.${endpointKey}`
      )
    }

    const service = this.config.services[endpoint.service]
    const url = this.resolveUrl(endpointKey, { ...params })

    // Prepare headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...service.headers,
    }

    // CSRF Protection: Add X-XSRF-TOKEN if available in cookies
    const xsrfToken = document.cookie
      .split('; ')
      .find((row) => row.startsWith('XSRF-TOKEN='))
      ?.split('=')[1]

    if (xsrfToken) {
      headers['X-XSRF-TOKEN'] = decodeURIComponent(xsrfToken)
    }

    // Handle Auth (Simple Bearer implementation for now)
    if (service.auth?.type === 'bearer' && service.auth.tokenStorageKey) {
      const token = localStorage.getItem(service.auth.tokenStorageKey)
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }

    // Prepare search params (query string)
    const searchParams = new URLSearchParams()
    if (params && endpoint.method === 'GET') {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value))
        }
      })
    }

    const finalUrl = searchParams.toString() ? `${url}?${searchParams.toString()}` : url

    try {
      const response = await fetch(finalUrl, {
        method: endpoint.method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        credentials: 'include', // Ensure cookies are sent (CSRF protection)
      })

      if (!response.ok) {
        // Try to parse error response body
        let responseBody: unknown
        try {
          responseBody = await response.json()
        } catch {
          // Response body is not JSON
          responseBody = await response.text()
        }

        throw new ApiError(response.status, response.statusText, endpointKey, responseBody)
      }

      return await response.json()
    } catch (error) {
      // Re-throw our custom errors
      if (error instanceof ApiError || error instanceof ConfigurationError) {
        throw error
      }

      // Wrap other errors as NetworkError
      throw new NetworkError(endpointKey, error as Error)
    }
  }
}

// Singleton instance holder (will be initialized with config)
export let apiClient: ApiClient | null = null

export const initApiClient = (config: VoltaConfig) => {
  apiClient = new ApiClient(config)
}
