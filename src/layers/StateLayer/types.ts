// ============================================================================
// StateLayer Types - Volta
// ============================================================================

import type { Store } from '@sthirajs/core'

/**
 * Configuration for StateLayer instance
 */
export interface StateLayerConfig {
  /** Enable Redux DevTools integration */
  enableDevTools?: boolean
  /** Enable cross-tab synchronization */
  enableCrossTab?: boolean
  /** Namespace for store isolation */
  namespace?: string
}

/**
 * Store metadata for registry
 */
export interface StoreMetadata<TState extends object = object, TActions extends object = object> {
  name: string
  store: Store<TState, TActions>
  createdAt: number
  config?: StoreConfig<TState>
}

/**
 * Configuration for individual stores
 */
export interface StoreConfig<T> {
  /** Initial state */
  initialState: T
  /** Enable persistence to localStorage */
  persist?: boolean
  /** Storage key for persistence */
  persistKey?: string
  /** Enable DevTools for this store */
  devTools?: boolean
}

/**
 * Re-export Sthira store type with proper generics
 */
export type SthiraStore<TState extends object, TActions extends object = object> = Store<
  TState,
  TActions
>
