// ============================================================================
// useCreateStore - React Hook for Store Creation
// ============================================================================
// Creates Volta stores in a React-friendly way, handling:
// - Lazy initialization after Volta is ready
// - HMR guard (doesn't recreate existing stores)
// - StrictMode compatibility

import { useMemo } from 'react'
import { createStore, getStore, hasStore, type StoreConfig } from '../../core/volta'
import { useVolta } from '../providers/VoltaContext'

/**
 * React hook for creating Volta stores.
 * Automatically handles initialization timing and HMR.
 *
 * @example
 * ```tsx
 * interface FilterState {
 *   showActive: boolean
 *   sortBy: 'name' | 'value'
 * }
 *
 * function Dashboard() {
 *   const filtersStore = useCreateStore<FilterState>('dashboard-filters', {
 *     initialState: { showActive: true, sortBy: 'value' }
 *   })
 *
 *   // Use with useVoltaStore
 *   const filters = useVoltaStore(filtersStore)
 *
 *   return <div>Active: {filters.showActive ? 'Yes' : 'No'}</div>
 * }
 * ```
 */
export function useCreateStore<TState extends object, TActions extends object = object>(
  name: string,
  config: StoreConfig<TState>
): ReturnType<typeof createStore<TState, TActions>> | null {
  const { isReady } = useVolta()

  const store = useMemo(() => {
    // Don't create store until Volta is ready
    if (!isReady) {
      return null
    }

    // HMR guard: reuse existing store
    if (hasStore(name)) {
      return getStore(name) as ReturnType<typeof createStore<TState, TActions>>
    }

    // Create new store
    return createStore<TState, TActions>(name, config)
  }, [isReady, name, config])

  return store
}

/**
 * React hook for getting an existing store by name.
 * Returns null if store doesn't exist or Volta isn't ready.
 *
 * @example
 * ```tsx
 * function SomeComponent() {
 *   const filtersStore = useGetStore<FilterState>('dashboard-filters')
 *
 *   if (!filtersStore) return <div>Loading...</div>
 *
 *   const filters = useVoltaStore(filtersStore)
 *   return <div>{filters.sortBy}</div>
 * }
 * ```
 */
export function useGetStore<TState extends object, TActions extends object = object>(
  name: string
): ReturnType<typeof createStore<TState, TActions>> | null {
  const { isReady } = useVolta()

  const store = useMemo(() => {
    if (!isReady) return null
    if (!hasStore(name)) return null

    return getStore(name) as ReturnType<typeof createStore<TState, TActions>>
  }, [isReady, name])

  return store
}
