// ============================================================================
// State Management Type Definitions
// ============================================================================

import type { TemporalState } from 'zundo'
import type { StoreApi, UseBoundStore } from 'zustand'

/**
 * Represents state that is tracked by zundo for undo/redo functionality.
 */
export interface TemporalTrackedState {
  currentLayout: unknown
  actionDescription: string
}

/**
 * Interface for a Zustand store enhanced with zundo temporal capabilities.
 * This provides proper typing for the temporal history features.
 */
export interface TemporalStore<TState, TTrackedState = Partial<TState>> {
  temporal: TemporalState<TTrackedState>
}

/**
 * Type helper for creating a temporal-enhanced store type.
 * Use this when defining store hooks that include undo/redo.
 */
export type TemporalBoundStore<TStore> = UseBoundStore<StoreApi<TStore> & TemporalStore<TStore>>

/**
 * Interface for temporal actions that can be destructured from the temporal store.
 */
export interface TemporalActions {
  /** Undo the last action */
  undo: () => void
  /** Redo the last undone action */
  redo: () => void
  /** Clear history */
  clear: () => void
  /** Check if undo is possible */
  isTracking: boolean
  /** Array of past states */
  pastStates: unknown[]
  /** Array of future states (after undo) */
  futureStates: unknown[]
}

/**
 * Type guard to check if a store has temporal capabilities.
 */
export function hasTemporalStore(store: unknown): store is { temporal: StoreApi<TemporalActions> } {
  return (
    typeof store === 'object' &&
    store !== null &&
    'temporal' in store &&
    typeof (store as { temporal: unknown }).temporal === 'object'
  )
}
