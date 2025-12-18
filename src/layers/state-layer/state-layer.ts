// ============================================================================
// StateLayer - Volta State Management Layer
// ============================================================================

import { createStore, type StoreConfig as SthiraStoreConfig } from '@sthirajs/core'
import { createSyncPlugin } from '@sthirajs/cross-tab'
import { createDevToolsPlugin } from '@sthirajs/devtools'
import type { StateLayerConfig, SthiraStore, StoreConfig, StoreMetadata } from './types'

/**
 * StateLayer provides centralized state management with optional
 * DevTools integration and cross-tab synchronization.
 *
 * @example
 * ```typescript
 * const stateLayer = new StateLayer({ enableDevTools: true })
 *
 * const userStore = stateLayer.createStore('user', {
 *   initialState: { name: '', email: '' }
 * })
 * ```
 */
export class StateLayer {
  private stores: Map<string, StoreMetadata> = new Map()
  private config: StateLayerConfig

  constructor(config: StateLayerConfig = {}) {
    this.config = {
      enableDevTools:
        config.enableDevTools ??
        (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development'),
      enableCrossTab: config.enableCrossTab ?? false,
      namespace: config.namespace ?? 'volta',
    }
  }

  /**
   * Create a new store with the given name and configuration
   */
  createStore<TState extends object, TActions extends object = object>(
    name: string,
    config: StoreConfig<TState>,
    actions?: (set: (partial: Partial<TState>) => void, get: () => TState) => TActions
  ): SthiraStore<TState, TActions> {
    const fullName = `${this.config.namespace}/${name}`

    if (this.stores.has(fullName)) {
      throw new Error(`Store "${name}" already exists`)
    }

    const plugins = []

    // Add DevTools plugin if enabled
    if (this.config.enableDevTools && config.devTools !== false) {
      plugins.push(createDevToolsPlugin({ name: fullName }))
    }

    // Add cross-tab sync plugin if enabled
    if (this.config.enableCrossTab) {
      plugins.push(createSyncPlugin({ channel: fullName }))
    }

    const storeConfig: SthiraStoreConfig<TState, TActions> = {
      name: fullName,
      state: config.initialState,
      plugins,
    }

    if (actions) {
      storeConfig.actions = actions
    }

    const store = createStore<TState, TActions>(storeConfig)

    this.stores.set(fullName, {
      name: fullName,
      store: store as StoreMetadata['store'],
      createdAt: Date.now(),
      config,
    })

    return store
  }

  /**
   * Get an existing store by name
   */
  getStore<TState extends object, TActions extends object = object>(
    name: string
  ): SthiraStore<TState, TActions> | undefined {
    const fullName = `${this.config.namespace}/${name}`
    const metadata = this.stores.get(fullName)
    return metadata?.store as SthiraStore<TState, TActions> | undefined
  }

  /**
   * Check if a store exists
   */
  hasStore(name: string): boolean {
    const fullName = `${this.config.namespace}/${name}`
    return this.stores.has(fullName)
  }

  /**
   * Destroy a store and remove it from the registry
   */
  destroyStore(name: string): boolean {
    const fullName = `${this.config.namespace}/${name}`
    return this.stores.delete(fullName)
  }

  /**
   * Get all registered store names
   */
  getStoreNames(): string[] {
    return Array.from(this.stores.keys())
  }

  /**
   * Destroy all stores
   */
  destroyAll(): void {
    this.stores.clear()
  }
}

// Singleton instance
let stateLayerInstance: StateLayer | null = null

/**
 * Initialize the global StateLayer instance
 */
export const initStateLayer = (config?: StateLayerConfig): StateLayer => {
  stateLayerInstance = new StateLayer(config)
  return stateLayerInstance
}

/**
 * Get the global StateLayer instance
 * @throws Error if StateLayer is not initialized
 */
export const getStateLayer = (): StateLayer => {
  if (!stateLayerInstance) {
    throw new Error('StateLayer not initialized. Call initStateLayer() first.')
  }
  return stateLayerInstance
}

/**
 * Reset the StateLayer instance (for testing)
 */
export const resetStateLayer = (): void => {
  stateLayerInstance = null
}
