// ============================================================================
// DataLayer - Volta Data Fetching Layer
// ============================================================================

import { createFetchSource, getQueryCache, type FetchSourceConfig } from '@sthirajs/fetch'
import type { CacheConfig, DataLayerConfig, RequestParams, RetryConfig } from './types'
import { DataLayerError } from './types'
export { DataLayerError }

const DEFAULT_CACHE_CONFIG: Required<CacheConfig> = {
  enabled: true,
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
}

const DEFAULT_RETRY_CONFIG: Required<Omit<RetryConfig, 'count'>> & { count: number } = {
  count: 3,
  delay: 1000,
  backoff: 'exponential',
}

const DEFAULT_TIMEOUT = 30000 // 30 seconds

/**
 * DataLayer provides a high-level API for data fetching with caching,
 * request deduplication, and error handling.
 *
 * @example
 * ```typescript
 * const dataLayer = new DataLayer({
 *   baseUrl: 'https://api.example.com',
 *   cache: { enabled: true, staleTime: 60000 },
 *   retry: { count: 3, delay: 1000 },
 *   timeout: 30000
 * })
 *
 * const users = await dataLayer.get('/users')
 * ```
 */
export class DataLayer {
  private config: DataLayerConfig
  private cacheConfig: Required<CacheConfig>
  private retryConfig: Required<Omit<RetryConfig, 'count'>> & { count: number | false }
  private timeout: number
  private queryCache = getQueryCache()

  constructor(config: DataLayerConfig) {
    this.config = config
    this.cacheConfig = { ...DEFAULT_CACHE_CONFIG, ...config.cache }
    this.retryConfig = {
      ...DEFAULT_RETRY_CONFIG,
      ...config.retry,
      count: config.retry?.count ?? DEFAULT_RETRY_CONFIG.count,
    }
    this.timeout = config.timeout ?? DEFAULT_TIMEOUT
  }

  /**
   * Perform a GET request
   */
  async get<T>(endpoint: string, params?: RequestParams): Promise<T> {
    const url = this.buildUrl(endpoint, params)
    return this.executeRequest<T>('GET', url, endpoint, undefined, params)
  }

  /**
   * Perform a POST request
   */
  async post<T>(endpoint: string, body?: unknown, params?: RequestParams): Promise<T> {
    const url = this.buildUrl(endpoint, params)
    return this.executeRequest<T>('POST', url, endpoint, body, params)
  }

  /**
   * Perform a PUT request
   */
  async put<T>(endpoint: string, body?: unknown, params?: RequestParams): Promise<T> {
    const url = this.buildUrl(endpoint, params)
    return this.executeRequest<T>('PUT', url, endpoint, body, params)
  }

  /**
   * Perform a PATCH request
   */
  async patch<T>(endpoint: string, body?: unknown, params?: RequestParams): Promise<T> {
    const url = this.buildUrl(endpoint, params)
    return this.executeRequest<T>('PATCH', url, endpoint, body, params)
  }

  /**
   * Perform a DELETE request
   */
  async delete<T>(endpoint: string, params?: RequestParams): Promise<T> {
    const url = this.buildUrl(endpoint, params)
    return this.executeRequest<T>('DELETE', url, endpoint, undefined, params)
  }

  /**
   * Invalidate cached data matching the given pattern
   */
  invalidateCache(pattern?: string): void {
    if (pattern) {
      this.queryCache.invalidatePrefix(pattern)
    } else {
      this.queryCache.invalidateAll()
    }
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.queryCache.invalidateAll()
  }

  /**
   * Build full URL with path parameters resolved
   */
  private buildUrl(endpoint: string, params?: RequestParams): string {
    let url = `${this.config.baseUrl}${endpoint}`

    // Replace path parameters
    if (params?.path) {
      Object.entries(params.path).forEach(([key, value]) => {
        url = url.replace(`:${key}`, String(value))
      })
    }

    return url
  }

  /**
   * Execute a request using @sthirajs/fetch
   */
  private async executeRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    url: string,
    endpoint: string,
    body?: unknown,
    params?: RequestParams
  ): Promise<T> {
    // Determine retry config (per-request override or global default)
    const retryConfig = params?.retry === false ? false : (params?.retry ?? this.retryConfig)

    // Determine timeout (per-request override or global default)
    const timeout = params?.timeout ?? this.timeout

    try {
      const config: FetchSourceConfig<T> = {
        url,
        method,
        headers: this.config.headers,
        staleTime: this.cacheConfig.staleTime,
        cacheTime: this.cacheConfig.cacheTime,
        // Retry configuration
        retry: retryConfig === false ? false : retryConfig.count,
        retryDelay: retryConfig === false ? undefined : retryConfig.delay,
        // Timeout and abort signal
        timeout,
        signal: params?.signal,
        // Cancel previous request for queries
        cancelOnNewRequest: method === 'GET',
        onError: (error) => {
          if (this.config.interceptors?.onError) {
            this.config.interceptors.onError(
              new DataLayerError(error.message, undefined, endpoint, error)
            )
          }
        },
      }

      if (body !== undefined) {
        config.body = body
      }

      const source = createFetchSource<T>(config)
      const data = await source.fetch()

      if (this.config.interceptors?.onResponse) {
        return await this.config.interceptors.onResponse(data)
      }

      return data
    } catch (error) {
      const err = error as Error
      // Handle abort errors specifically
      if (err.name === 'AbortError') {
        throw new DataLayerError('Request aborted', undefined, endpoint, error)
      }
      throw new DataLayerError(err.message || 'An error occurred', undefined, endpoint, error)
    }
  }
}

// Singleton instance (optional - can be initialized with config)
let dataLayerInstance: DataLayer | null = null

/**
 * Initialize the global DataLayer instance
 */
export const initDataLayer = (config: DataLayerConfig): DataLayer => {
  dataLayerInstance = new DataLayer(config)
  return dataLayerInstance
}

/**
 * Get the global DataLayer instance
 * @throws Error if DataLayer is not initialized
 */
export const getDataLayer = (): DataLayer => {
  if (!dataLayerInstance) {
    throw new Error('DataLayer not initialized. Call initDataLayer() first.')
  }
  return dataLayerInstance
}

/**
 * Reset the DataLayer instance (for testing)
 */
export const resetDataLayer = (): void => {
  dataLayerInstance = null
}
