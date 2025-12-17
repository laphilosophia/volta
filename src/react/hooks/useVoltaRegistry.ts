// ============================================================================
// useVoltaRegistry - Unified Registry Hook
// ============================================================================
//
// The core primitive for component-data binding in Volta.
// Components register their data requirements, and the framework handles:
// - Auto-wiring to DataLayer (fetch)
// - Auto-wiring to StateLayer (storage)
// - Auto-wiring to ThemeManager (styling)
// - FSM status management (idle → pending → success/error)
// - Lazy evaluation (fetch on mount)
// - Cleanup on unmount
//
// ============================================================================

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import {
  createQueryKey,
  getDataLayer,
  keyToString,
  type QueryKey,
  type QueryStatus,
  type RetryConfig,
} from '../../layers/DataLayer'

/**
 * Configuration for useVoltaRegistry hook
 */
export interface RegistryConfig<T = unknown> {
  /** Unique query key - auto-generated from endpoint if not provided */
  key?: QueryKey
  /** API endpoint to fetch data from */
  endpoint?: string
  /** Override retry config for this query */
  retry?: RetryConfig | false
  /** Override timeout for this query (in ms) */
  timeout?: number
  /** Enable/disable the query */
  enabled?: boolean
  /** Selector to transform state data */
  selector?: (state: T) => unknown
  /** Initial data before fetch completes */
  initialData?: T
  /** Stale time in ms */
  staleTime?: number
  /** Mutation endpoint (defaults to query endpoint) */
  mutationEndpoint?: string
  /** Enable optimistic updates (default: true) */
  optimistic?: boolean
  /** Callback on successful mutation */
  onMutationSuccess?: (data: T) => void
  /** Callback on mutation error */
  onMutationError?: (error: Error, rollbackData: T | undefined) => void
}

/**
 * Result returned by useVoltaRegistry hook
 */
export interface RegistryResult<T> {
  /** The fetched data */
  data: T | undefined
  /** Loading state */
  loading: boolean
  /** Error state */
  error: Error | null
  /** Current FSM status */
  status: QueryStatus
  /** Is data stale */
  isStale: boolean
  /** Refetch the data manually */
  refetch: () => Promise<void>
  /** Set data directly (for local updates) */
  setData: (data: T | ((prev: T | undefined) => T)) => void
  /** Mutation loading state */
  isMutating: boolean
  /** Execute a mutation (POST/PUT/PATCH) */
  mutate: (data: Partial<T>, method?: 'POST' | 'PUT' | 'PATCH') => Promise<T | undefined>
  /** Execute a delete mutation */
  remove: () => Promise<void>
  /** Generic request for any HTTP method */
  request: <R = T>(method: string, data?: unknown) => Promise<R | undefined>
}

/**
 * Internal store for query states
 * This is a simple in-memory store that components can subscribe to
 */
interface QueryStore<T = unknown> {
  status: QueryStatus
  data: T | undefined
  error: Error | null
  timestamp: number
  isStale: boolean
}

// Global query store
const queryStores = new Map<string, QueryStore>()
const queryListeners = new Map<string, Set<() => void>>()

const getQueryStore = <T>(keyStr: string): QueryStore<T> => {
  if (!queryStores.has(keyStr)) {
    queryStores.set(keyStr, {
      status: 'idle',
      data: undefined,
      error: null,
      timestamp: 0,
      isStale: true,
    })
  }
  return queryStores.get(keyStr) as QueryStore<T>
}

const setQueryStore = <T>(keyStr: string, update: Partial<QueryStore<T>>) => {
  const current = getQueryStore<T>(keyStr)
  queryStores.set(keyStr, { ...current, ...update })

  // Notify all listeners
  const listeners = queryListeners.get(keyStr)
  if (listeners) {
    listeners.forEach((listener) => listener())
  }
}

const subscribeToQuery = (keyStr: string, listener: () => void) => {
  if (!queryListeners.has(keyStr)) {
    queryListeners.set(keyStr, new Set())
  }
  queryListeners.get(keyStr)!.add(listener)

  return () => {
    queryListeners.get(keyStr)?.delete(listener)
  }
}

/**
 * useVoltaRegistry - The unified hook for component-data binding
 *
 * This hook provides a simple API surface while the framework handles:
 * - DataLayer orchestration (fetch, retry, timeout, abort)
 * - StateLayer storage (cache, cross-tab sync)
 * - FSM status management
 * - Component lifecycle awareness
 *
 * @example
 * ```tsx
 * function UserList() {
 *   const { data, loading, error, refetch } = useVoltaRegistry<User[]>({
 *     endpoint: '/api/users'
 *   })
 *
 *   if (loading) return <Skeleton />
 *   if (error) return <ErrorBoundary error={error} />
 *   return <List data={data} />
 * }
 * ```
 */
export function useVoltaRegistry<T>(config: RegistryConfig<T>): RegistryResult<T> {
  const {
    key,
    endpoint,
    retry,
    timeout,
    enabled = true,
    selector,
    initialData,
    staleTime = 5 * 60 * 1000, // 5 minutes default
    mutationEndpoint,
    optimistic = true,
    onMutationSuccess,
    onMutationError,
  } = config

  // Auto-generate key from endpoint if not provided
  const resolvedKey: QueryKey = useMemo(
    () => key ?? (endpoint ? createQueryKey(endpoint) : createQueryKey('volta:default')),
    [key, endpoint]
  )

  // Convert key to string for Map storage
  const keyStr = useMemo(() => keyToString(resolvedKey), [resolvedKey])

  // Abort controller for cleanup
  const abortControllerRef = useRef<AbortController | null>(null)
  const mountedRef = useRef(true)

  // Mutation state
  const [isMutating, setIsMutating] = useState(false)

  // Subscribe to query store changes using useSyncExternalStore
  const store = useSyncExternalStore(
    useCallback((onStoreChange) => subscribeToQuery(keyStr, onStoreChange), [keyStr]),
    useCallback(() => getQueryStore<T>(keyStr), [keyStr]),
    useCallback(() => getQueryStore<T>(keyStr), [keyStr])
  )

  // Initialize with initial data if provided
  useEffect(() => {
    if (initialData !== undefined && store.data === undefined && store.status === 'idle') {
      setQueryStore<T>(keyStr, { data: initialData })
    }
  }, [keyStr, initialData, store.data, store.status])

  // Fetch function
  const fetchData = useCallback(async () => {
    if (!enabled || !endpoint) return

    // Cancel previous request
    abortControllerRef.current?.abort()
    abortControllerRef.current = new AbortController()

    // Set pending status (FSM: idle/success/error → pending)
    setQueryStore<T>(keyStr, { status: 'pending', error: null })

    try {
      const dataLayer = getDataLayer()
      const data = await dataLayer.get<T>(endpoint, {
        retry,
        timeout,
        signal: abortControllerRef.current.signal,
      })

      if (mountedRef.current) {
        // Set success status (FSM: pending → success)
        setQueryStore<T>(keyStr, {
          status: 'success',
          data,
          error: null,
          timestamp: Date.now(),
          isStale: false,
        })
      }
    } catch (error) {
      // Handle abort - don't set error state
      if ((error as Error).name === 'AbortError') {
        return
      }

      if (mountedRef.current) {
        // Set error status (FSM: pending → error)
        setQueryStore<T>(keyStr, {
          status: 'error',
          error: error as Error,
        })
      }
    }
  }, [enabled, endpoint, keyStr, retry, timeout])

  // Auto-fetch on mount (lazy evaluation)
  useEffect(() => {
    mountedRef.current = true

    // Only fetch if we don't have fresh data
    const currentStore = getQueryStore<T>(keyStr)
    const isFresh = currentStore.timestamp > 0 && Date.now() - currentStore.timestamp < staleTime

    if (enabled && endpoint && !isFresh) {
      fetchData()
    }

    // Cleanup on unmount
    return () => {
      mountedRef.current = false
      abortControllerRef.current?.abort()
    }
  }, [enabled, endpoint, fetchData, keyStr, staleTime])

  // Check if data is stale
  useEffect(() => {
    if (store.timestamp > 0) {
      const isStale = Date.now() - store.timestamp > staleTime
      if (isStale !== store.isStale) {
        setQueryStore<T>(keyStr, { isStale })
      }
    }
  }, [keyStr, staleTime, store.timestamp, store.isStale])

  // setData function for local updates
  const setData = useCallback(
    (dataOrUpdater: T | ((prev: T | undefined) => T)) => {
      const currentStore = getQueryStore<T>(keyStr)
      const newData =
        typeof dataOrUpdater === 'function'
          ? (dataOrUpdater as (prev: T | undefined) => T)(currentStore.data)
          : dataOrUpdater

      setQueryStore<T>(keyStr, {
        data: newData,
        status: 'success',
        timestamp: Date.now(),
        isStale: false,
      })
    },
    [keyStr]
  )

  // Mutate function with optimistic updates
  const mutate = useCallback(
    async (
      mutationData: Partial<T>,
      method: 'POST' | 'PUT' | 'PATCH' = 'PUT'
    ): Promise<T | undefined> => {
      const mutateEndpoint = mutationEndpoint ?? endpoint
      if (!mutateEndpoint) return undefined

      const previousData = getQueryStore<T>(keyStr).data
      setIsMutating(true)

      // Optimistic update
      if (optimistic && previousData) {
        setQueryStore<T>(keyStr, {
          data: { ...previousData, ...mutationData } as T,
          timestamp: Date.now(),
        })
      }

      try {
        const dataLayer = getDataLayer()
        let result: T

        switch (method) {
          case 'POST':
            result = await dataLayer.post<T>(mutateEndpoint, mutationData, { retry, timeout })
            break
          case 'PUT':
            result = await dataLayer.put<T>(mutateEndpoint, mutationData, { retry, timeout })
            break
          case 'PATCH':
            result = await dataLayer.patch<T>(mutateEndpoint, mutationData, { retry, timeout })
            break
        }

        if (mountedRef.current) {
          setQueryStore<T>(keyStr, {
            data: result,
            status: 'success',
            timestamp: Date.now(),
            isStale: false,
          })
          onMutationSuccess?.(result)
        }

        return result
      } catch (error) {
        // Rollback on error
        if (mountedRef.current && optimistic) {
          setQueryStore<T>(keyStr, { data: previousData })
        }
        onMutationError?.(error as Error, previousData)
        throw error
      } finally {
        if (mountedRef.current) {
          setIsMutating(false)
        }
      }
    },
    [
      endpoint,
      keyStr,
      mutationEndpoint,
      onMutationError,
      onMutationSuccess,
      optimistic,
      retry,
      timeout,
    ]
  )

  // Remove function
  const remove = useCallback(async (): Promise<void> => {
    const removeEndpoint = mutationEndpoint ?? endpoint
    if (!removeEndpoint) return

    const previousData = getQueryStore<T>(keyStr).data
    setIsMutating(true)

    // Optimistic delete
    if (optimistic) {
      setQueryStore<T>(keyStr, { data: undefined })
    }

    try {
      const dataLayer = getDataLayer()
      await dataLayer.delete(removeEndpoint, { retry, timeout })

      if (mountedRef.current) {
        setQueryStore<T>(keyStr, {
          data: undefined,
          status: 'success',
          timestamp: Date.now(),
        })
      }
    } catch (error) {
      // Rollback on error
      if (mountedRef.current && optimistic) {
        setQueryStore<T>(keyStr, { data: previousData })
      }
      onMutationError?.(error as Error, previousData)
      throw error
    } finally {
      if (mountedRef.current) {
        setIsMutating(false)
      }
    }
  }, [endpoint, keyStr, mutationEndpoint, onMutationError, optimistic, retry, timeout])

  // Generic request method for any HTTP method
  const request = useCallback(
    async <R = T>(method: string, data?: unknown): Promise<R | undefined> => {
      const requestEndpoint = mutationEndpoint ?? endpoint
      if (!requestEndpoint) return undefined

      setIsMutating(true)

      try {
        const dataLayer = getDataLayer()
        let result: R

        // Map method to DataLayer method
        const upperMethod = method.toUpperCase()
        switch (upperMethod) {
          case 'GET':
            result = await dataLayer.get<R>(requestEndpoint, { retry, timeout })
            break
          case 'POST':
            result = await dataLayer.post<R>(requestEndpoint, data, { retry, timeout })
            break
          case 'PUT':
            result = await dataLayer.put<R>(requestEndpoint, data, { retry, timeout })
            break
          case 'PATCH':
            result = await dataLayer.patch<R>(requestEndpoint, data, { retry, timeout })
            break
          case 'DELETE':
            result = await dataLayer.delete<R>(requestEndpoint, { retry, timeout })
            break
          default:
            // For other methods, use POST as fallback
            result = await dataLayer.post<R>(requestEndpoint, data, { retry, timeout })
        }

        return result
      } finally {
        if (mountedRef.current) {
          setIsMutating(false)
        }
      }
    },
    [endpoint, mutationEndpoint, retry, timeout]
  )

  // Apply selector if provided
  const selectedData = useMemo(() => {
    if (selector && store.data !== undefined) {
      return selector(store.data) as T
    }
    return store.data
  }, [selector, store.data])

  return {
    data: selectedData,
    loading: store.status === 'pending',
    error: store.error,
    status: store.status,
    isStale: store.isStale,
    refetch: fetchData,
    setData,
    isMutating,
    mutate,
    remove,
    request,
  }
}

/**
 * Create a query key helper
 *
 * @example
 * ```ts
 * const USERS_KEY = createTypedQueryKey('users')
 * const { data } = useVoltaRegistry<User[]>({ key: USERS_KEY, endpoint: '/api/users' })
 * // Type inference comes from useVoltaRegistry generic, not from key
 * ```
 */
export function createTypedQueryKey(name: string): QueryKey {
  return createQueryKey(name)
}
