// ============================================================================
// useVoltaStore - State Store Hook
// ============================================================================

import { useCallback, useMemo, useSyncExternalStore } from 'react'
import type { SthiraStore } from '../../layers/state-layer'

/**
 * Hook for consuming Sthira stores with optional selector support.
 *
 * @example
 * ```tsx
 * // Full state
 * const state = useVoltaStore(userStore)
 *
 * // With selector
 * const userName = useVoltaStore(userStore, (state) => state.name)
 *
 * // With actions
 * function UserProfile() {
 *   const { name, email } = useVoltaStore(userStore)
 *   return <div>{name} - {email}</div>
 * }
 * ```
 */
export function useVoltaStore<
  TState extends object,
  TActions extends object = object,
  TSelected = TState,
>(
  store: SthiraStore<TState, TActions> | null,
  selector?: (state: TState) => TSelected
): TSelected | null {
  const subscribe = useCallback(
    (callback: () => void) => {
      if (!store) return () => {}
      return store.subscribe(callback)
    },
    [store]
  )

  const getSnapshot = useCallback(() => {
    if (!store) return null as unknown as TState
    return store.getState()
  }, [store])

  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  return useMemo(() => {
    if (!state) return null
    if (selector) {
      return selector(state)
    }
    return state as unknown as TSelected
  }, [state, selector])
}
