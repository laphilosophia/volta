// ============================================================================
// DataLayer Types - Volta
// ============================================================================

/**
 * Configuration for DataLayer instance
 */
export interface DataLayerConfig {
  /** Base URL for all API requests */
  baseUrl: string
  /** Default headers to include in all requests */
  headers?: Record<string, string>
  /** Cache configuration */
  cache?: CacheConfig
  /** Request interceptors */
  interceptors?: DataLayerInterceptors
}

/**
 * Cache configuration options
 */
export interface CacheConfig {
  /** Enable caching (default: true) */
  enabled?: boolean
  /** Stale time in milliseconds (default: 5 minutes) */
  staleTime?: number
  /** Cache time in milliseconds (default: 10 minutes) */
  cacheTime?: number
}

/**
 * Interceptors for request/response transformation
 */
export interface DataLayerInterceptors {
  /** Called before each request */
  onRequest?: (url: string, options: RequestInit) => RequestInit | Promise<RequestInit>
  /** Called after each successful response */
  onResponse?: <T>(response: T) => T | Promise<T>
  /** Called when an error occurs */
  onError?: (error: DataLayerError) => void
}

/**
 * Query state for data fetching hooks
 */
export interface QueryState<T> {
  data: T | undefined
  isLoading: boolean
  isError: boolean
  error: DataLayerError | null
  isStale: boolean
}

/**
 * Mutation state for data mutation hooks
 */
export interface MutationState<T> {
  data: T | undefined
  isLoading: boolean
  isError: boolean
  error: DataLayerError | null
  isSuccess: boolean
}

/**
 * Options for query operations
 */
export interface QueryOptions {
  /** Enable/disable the query */
  enabled?: boolean
  /** Stale time for this specific query */
  staleTime?: number
  /** Refetch on window focus */
  refetchOnFocus?: boolean
  /** Refetch on reconnect */
  refetchOnReconnect?: boolean
}

/**
 * Options for mutation operations
 */
export interface MutationOptions<T, V> {
  /** Called on successful mutation */
  onSuccess?: (data: T, variables: V) => void | Promise<void>
  /** Called on mutation error */
  onError?: (error: DataLayerError, variables: V) => void | Promise<void>
  /** Called after mutation completes (success or error) */
  onSettled?: (data: T | undefined, error: DataLayerError | null, variables: V) => void
  /** Optimistic update function */
  optimisticUpdate?: (variables: V) => T
}

/**
 * Error thrown by DataLayer operations
 */
export class DataLayerError extends Error {
  public readonly status: number | undefined
  public readonly endpoint: string | undefined
  public readonly cause: unknown

  constructor(message: string, status?: number, endpoint?: string, cause?: unknown) {
    super(message)
    this.name = 'DataLayerError'
    this.status = status
    this.endpoint = endpoint
    this.cause = cause
  }
}

/**
 * Request parameters
 */
export interface RequestParams {
  /** Path parameters (e.g., /users/:id) */
  path?: Record<string, string | number>
  /** Query string parameters */
  query?: Record<string, string | number | boolean | undefined>
}
