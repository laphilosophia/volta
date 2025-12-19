// ============================================================================
// useVoltaQuery - Data Fetching Hook
// Wraps the vanilla query() API for React
// ============================================================================

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { query, type QueryOptions as VoltaQueryOptions } from '../../core/volta'

/**
 * Query state returned by useVoltaQuery
 */
export interface QueryState<T> {
  data: T | undefined
  isLoading: boolean
  isError: boolean
  error: Error | null
  isStale: boolean
}

/**
 * Options for useVoltaQuery hook
 */
export interface UseVoltaQueryOptions {
  /** Path parameters for URL substitution */
  path?: Record<string, string | number>
  /** Override retry config */
  retry?: VoltaQueryOptions['retry']
  /** Override timeout */
  timeout?: number
  /** Enable/disable the query (default: true) */
  enabled?: boolean
  /** Refetch when window gains focus */
  refetchOnFocus?: boolean
  /** Refetch when network reconnects (default: true) */
  refetchOnReconnect?: boolean
}

/**
 * Result returned by useVoltaQuery
 */
export interface UseVoltaQueryResult<T> extends QueryState<T> {
  /** Refetch the data */
  refetch: () => Promise<void>
}

/**
 * Hook for data fetching using the vanilla Volta API.
 *
 * @example
 * ```tsx
 * function UserProfile({ userId }: { userId: string }) {
 *   const { data, isLoading, error } = useVoltaQuery<User>(
 *     '/users/:id',
 *     { path: { id: userId } }
 *   )
 *
 *   if (isLoading) return <div>Loading...</div>
 *   if (error) return <div>Error: {error.message}</div>
 *   return <div>{data?.name}</div>
 * }
 * ```
 */
export function useVoltaQuery<T>(
  endpoint: string,
  options: UseVoltaQueryOptions = {}
): UseVoltaQueryResult<T> {
  const {
    path,
    retry,
    timeout,
    enabled = true,
    refetchOnFocus = false,
    refetchOnReconnect = true,
  } = options

  const [state, setState] = useState<QueryState<T>>({
    data: undefined,
    isLoading: enabled,
    isError: false,
    error: null,
    isStale: false,
  })

  const mountedRef = useRef(true)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Memoize options to create stable references for useCallback
  const memoizedOptions = useMemo(() => ({ path, retry, timeout }), [path, retry, timeout])

  const fetchData = useCallback(async () => {
    if (!enabled) return

    // Cancel previous request
    abortControllerRef.current?.abort()
    abortControllerRef.current = new AbortController()

    setState((prev) => ({ ...prev, isLoading: true, isError: false, error: null }))

    try {
      // Use vanilla query() API
      const data = await query<T>(endpoint, {
        path: memoizedOptions.path,
        retry: memoizedOptions.retry,
        timeout: memoizedOptions.timeout,
        signal: abortControllerRef.current.signal,
      })

      if (mountedRef.current) {
        setState({
          data,
          isLoading: false,
          isError: false,
          error: null,
          isStale: false,
        })
      }
    } catch (error) {
      // Don't update state if aborted
      if ((error as Error).name === 'AbortError') {
        return
      }

      if (mountedRef.current) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isError: true,
          error: error as Error,
        }))
      }
    }
  }, [endpoint, enabled, memoizedOptions])

  // Initial fetch and refetch on dependency changes
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      abortControllerRef.current?.abort()
    }
  }, [])

  // Refetch on window focus
  useEffect(() => {
    if (!refetchOnFocus) return

    const handleFocus = () => {
      setState((prev) => ({ ...prev, isStale: true }))
      fetchData()
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [refetchOnFocus, fetchData])

  // Refetch on reconnect
  useEffect(() => {
    if (!refetchOnReconnect) return

    const handleOnline = () => {
      fetchData()
    }

    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [refetchOnReconnect, fetchData])

  return {
    ...state,
    refetch: fetchData,
  }
}
