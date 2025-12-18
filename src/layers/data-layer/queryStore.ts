// ============================================================================
// Query Store - Volta DataLayer-StateLayer Bridge
// ============================================================================

import type { RetryConfig } from './types'

/**
 * Query status representing FSM states
 */
export type QueryStatus = 'idle' | 'pending' | 'success' | 'error'

/**
 * Symbol-based query key for unique identification
 */
export type QueryKey = symbol | string

/**
 * Query store entry holding fetched data and status
 */
export interface QueryEntry<T = unknown> {
  /** Unique query key */
  key: QueryKey
  /** Associated endpoint */
  endpoint: string
  /** Query status (FSM state) */
  status: QueryStatus
  /** Fetched data */
  data: T | undefined
  /** Error if any */
  error: Error | null
  /** Last fetch timestamp */
  timestamp: number
  /** Is data stale */
  isStale: boolean
  /** Subscribers count (components using this query) */
  subscribers: number
}

/**
 * Query configuration for registration
 */
export interface QueryConfig {
  /** Unique query key */
  key: QueryKey
  /** API endpoint */
  endpoint: string
  /** Per-query retry override */
  retry?: RetryConfig | false
  /** Per-query timeout override */
  timeout?: number
  /** Stale time in ms */
  staleTime?: number
}

/**
 * Internal query store state
 */
export interface QueryStoreState {
  /** Map of query entries by key (using string representation) */
  queries: Map<string, QueryEntry>
}

/**
 * Query store actions
 */
export interface QueryStoreActions {
  /** Register a new query */
  registerQuery: (config: QueryConfig) => void
  /** Set query status */
  setStatus: (key: QueryKey, status: QueryStatus) => void
  /** Set query data */
  setData: <T>(key: QueryKey, data: T) => void
  /** Set query error */
  setError: (key: QueryKey, error: Error) => void
  /** Increment subscriber count */
  subscribe: (key: QueryKey) => void
  /** Decrement subscriber count */
  unsubscribe: (key: QueryKey) => void
  /** Get query entry */
  getQuery: <T>(key: QueryKey) => QueryEntry<T> | undefined
  /** Invalidate a query */
  invalidate: (key: QueryKey) => void
  /** Invalidate all queries */
  invalidateAll: () => void
}

/**
 * Convert QueryKey to string for Map storage
 */
export const keyToString = (key: QueryKey): string => {
  return typeof key === 'symbol' ? key.toString() : key
}

/**
 * Create a unique symbol key from string
 */
export const createQueryKey = (name: string): symbol => {
  return Symbol.for(`volta:query:${name}`)
}
