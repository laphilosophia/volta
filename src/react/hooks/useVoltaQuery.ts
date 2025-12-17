// ============================================================================
// useVoltaQuery - Data Fetching Hook
// ============================================================================

import { useCallback, useEffect, useRef, useState } from 'react'
import type {
  DataLayerError,
  QueryOptions,
  QueryState,
  RequestParams,
} from '../../layers/DataLayer'
import { getDataLayer } from '../../layers/DataLayer'

export interface UseVoltaQueryOptions extends QueryOptions {
  /** Request parameters */
  params?: RequestParams
}

export interface UseVoltaQueryResult<T> extends QueryState<T> {
  /** Refetch the data */
  refetch: () => Promise<void>
}

/**
 * Hook for data fetching with caching and automatic refetching.
 *
 * @example
 * ```tsx
 * function UserProfile({ userId }: { userId: string }) {
 *   const { data, isLoading, error } = useVoltaQuery<User>(
 *     '/users/:id',
 *     { params: { path: { id: userId } } }
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
  const { enabled = true, params, refetchOnFocus = false, refetchOnReconnect = true } = options

  const [state, setState] = useState<QueryState<T>>({
    data: undefined,
    isLoading: enabled,
    isError: false,
    error: null,
    isStale: false,
  })

  const mountedRef = useRef(true)
  const abortControllerRef = useRef<AbortController | null>(null)

  const paramsKey = JSON.stringify(params)

  const fetchData = useCallback(async () => {
    if (!enabled) return

    // Cancel previous request
    abortControllerRef.current?.abort()
    abortControllerRef.current = new AbortController()

    setState((prev) => ({ ...prev, isLoading: true, isError: false, error: null }))

    try {
      const dataLayer = getDataLayer()
      const data = await dataLayer.get<T>(endpoint, params)

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
      if (mountedRef.current) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isError: true,
          error: error as DataLayerError,
        }))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, enabled, paramsKey])

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
