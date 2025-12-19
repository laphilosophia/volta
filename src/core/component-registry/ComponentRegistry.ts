// ============================================================================
// Component Registry - Vanilla, Framework-Agnostic
// ============================================================================

import type {
  ComponentDefinition,
  ComponentInstance,
  QueryConfig,
  QueryRef,
  RegistrationResult,
  StoreConfig,
  StoreRef,
} from '../types/component'

// ============================================================================
// Module-level State
// ============================================================================

/** Registered component definitions */
const definitions = new Map<string, ComponentDefinition>()

/** Active component instances */
const instances = new Map<symbol, ComponentInstance>()

/** Symbol registry for garbage collection tracking */
const symbolRegistry = new Set<symbol>()

// ============================================================================
// Primitive Factories
// ============================================================================

/**
 * Create a lazy query reference (data binding)
 * Data is fetched when component mounts
 *
 * @example
 * ```ts
 * const userData = query({ endpoint: '/users/:userId', params: ['userId'] })
 * ```
 */
export function query(config: QueryConfig): QueryRef {
  return {
    __querySymbol: Symbol('volta:query'),
    config,
  }
}

/**
 * Create a store reference (state binding)
 * Store is created when component registers
 *
 * @example
 * ```ts
 * const counterStore = store({ initial: { count: 0 } })
 * ```
 */
export function store<T = unknown>(config: StoreConfig<T>): StoreRef<T> {
  return {
    __storeSymbol: Symbol('volta:store'),
    config,
  }
}

// ============================================================================
// Registration API
// ============================================================================

/**
 * Register a component with its data and state bindings
 *
 * @example
 * ```ts
 * const { id, status } = register('user-card', {
 *   type: 'data-display',
 *   component: () => import('./UserCard'),
 *   data: query({ endpoint: '/users/:userId', params: ['userId'] }),
 *   state: store({ initial: { selectedTab: 'info' } })
 * })
 * ```
 */
export function register(key: string, definition: ComponentDefinition): RegistrationResult {
  const id = Symbol(`volta:component:${key}`)

  // Override protection
  if (definitions.has(key)) {
    throw new Error(
      `Component "${key}" is already registered. Use unregister() first if you want to replace it.`
    )
  }

  try {
    // Store definition
    definitions.set(key, definition)

    // Track symbol for GC
    symbolRegistry.add(id)

    return {
      id,
      status: 'registered',
      component: definition,
    }
  } catch (error) {
    return {
      id,
      status: 'error',
      component: definition,
      error: error instanceof Error ? error : new Error(String(error)),
    }
  }
}

/**
 * Get a registered component definition
 */
export function getComponent(key: string): ComponentDefinition | undefined {
  return definitions.get(key)
}

/**
 * Check if a component is registered
 */
export function hasComponent(key: string): boolean {
  return definitions.has(key)
}

/**
 * List all registered components
 */
export function listComponents(): Array<{ key: string; definition: ComponentDefinition }> {
  return Array.from(definitions.entries()).map(([key, definition]) => ({
    key,
    definition,
  }))
}

/**
 * List components by type
 */
export function listComponentsByType(
  type: string
): Array<{ key: string; definition: ComponentDefinition }> {
  return listComponents().filter(({ definition }) => definition.type === type)
}

/**
 * Get all component types
 */
export function getComponentTypes(): string[] {
  const types = new Set<string>()
  definitions.forEach((def) => types.add(def.type))
  return Array.from(types)
}

/**
 * Unregister a component
 */
export function unregister(key: string): boolean {
  return definitions.delete(key)
}

/**
 * Clear all registrations (for testing)
 */
export function clearRegistry(): void {
  definitions.clear()
  instances.clear()
  symbolRegistry.clear()
}

// ============================================================================
// Instance Management
// ============================================================================

/**
 * Create a component instance (called by adapters on mount)
 */
export function createInstance(key: string, parentId?: symbol): ComponentInstance | undefined {
  const definition = definitions.get(key)
  if (!definition) return undefined

  const id = Symbol(`volta:instance:${key}`)
  const instance: ComponentInstance = {
    id,
    key,
    data: {},
    state: {},
    parentId,
    createdAt: Date.now(),
  }

  instances.set(id, instance)
  symbolRegistry.add(id)

  return instance
}

/**
 * Get instance count (for debugging)
 */
export function getInstanceCount(): number {
  return instances.size
}

// ============================================================================
// Binding Resolution
// ============================================================================

/**
 * Resolved data with status
 */
export interface ResolvedData {
  data: Record<string, unknown>
  status: 'loading' | 'success' | 'error'
  error?: Error
}

/**
 * Resolve data bindings for a component instance
 * Fetches all data defined in the component's data bindings
 *
 * @param componentKey - Component registration key
 * @param props - Props to use for path parameter substitution
 * @param signal - Optional AbortSignal for cancellation
 */
export async function resolveDataBindings(
  componentKey: string,
  props: Record<string, unknown>,
  signal?: AbortSignal
): Promise<ResolvedData> {
  const definition = definitions.get(componentKey)
  if (!definition) {
    return {
      data: {},
      status: 'error',
      error: new Error(`Component not registered: ${componentKey}`),
    }
  }

  const dataBindings = definition.data
  if (!dataBindings) {
    return { data: {}, status: 'success' }
  }

  const resolved: Record<string, unknown> = {}

  try {
    // Handle single QueryRef or Record<string, QueryRef>
    const bindings = '__querySymbol' in dataBindings ? { default: dataBindings } : dataBindings

    const fetchPromises = Object.entries(bindings).map(async ([key, queryRef]) => {
      if (!queryRef || !('__querySymbol' in queryRef)) return

      const qr = queryRef as QueryRef
      let endpoint = qr.config.endpoint

      // Substitute path parameters
      for (const param of qr.config.params ?? []) {
        const value = props[param]
        if (value !== undefined) {
          endpoint = endpoint.replace(`:${param}`, String(value))
        }
      }

      // Lazy import to avoid circular dependency
      const { query: voltaQuery } = await import('../volta')

      const data = await voltaQuery(endpoint, {
        signal,
        timeout: qr.config.staleTime,
      })

      // Apply transform if provided
      resolved[key] = qr.config.transform ? qr.config.transform(data) : data
    })

    await Promise.all(fetchPromises)
    return { data: resolved, status: 'success' }
  } catch (error) {
    return {
      data: resolved,
      status: 'error',
      error: error instanceof Error ? error : new Error(String(error)),
    }
  }
}

/**
 * Resolve state bindings for a component instance
 * Creates scoped stores based on the component's state bindings
 *
 * @param componentKey - Component registration key
 * @param instanceId - Unique instance identifier
 */
export async function resolveStateBindings(
  componentKey: string,
  instanceId: symbol
): Promise<Record<string, unknown>> {
  const definition = definitions.get(componentKey)
  if (!definition?.state) {
    return {}
  }

  const stateBindings = definition.state
  const resolved: Record<string, unknown> = {}

  // Handle single StoreRef or Record<string, StoreRef>
  const bindings = '__storeSymbol' in stateBindings ? { default: stateBindings } : stateBindings

  // Lazy import to avoid circular dependency
  const { createStore: voltaCreateStore } = await import('../volta')

  for (const [key, storeRef] of Object.entries(bindings)) {
    if (!storeRef || !('__storeSymbol' in storeRef)) continue

    const sr = storeRef as StoreRef

    // Create instance-scoped store name
    const storeName = `${componentKey}/${instanceId.description?.split(':').pop() ?? 'default'}/${key}`

    const store = voltaCreateStore(storeName, {
      initialState: sr.config.initial as object,
    })

    resolved[key] = store
  }

  return resolved
}

/**
 * Destroy an instance and cleanup its resources
 */
export function destroyInstance(instanceId: symbol): boolean {
  symbolRegistry.delete(instanceId)
  return instances.delete(instanceId)
}

// ============================================================================
// Theme Resolution
// ============================================================================

/**
 * Resolved theme tokens with values and subscription
 */
export interface ResolvedTheme {
  /** Current theme token values */
  tokens: Record<string, unknown>
  /** Unsubscribe function */
  unsubscribe: () => void
}

/**
 * Resolve theme bindings for a component
 * Subscribes to theme token changes and returns current values
 *
 * @param componentKey - Component registration key
 * @param themeManager - ThemeManager instance
 * @param onChange - Callback when theme tokens change
 */
export function resolveThemeBindings<T extends object>(
  componentKey: string,
  themeManager: {
    get: (path: string) => unknown
    subscribe: (cb: (theme: T) => void) => () => void
  },
  onChange?: (tokens: Record<string, unknown>) => void
): ResolvedTheme {
  const definition = definitions.get(componentKey)
  const themePaths = definition?.theme ?? []

  const getTokens = (): Record<string, unknown> => {
    const tokens: Record<string, unknown> = {}
    for (const path of themePaths) {
      tokens[path] = themeManager.get(path)
    }
    return tokens
  }

  // Get initial values
  const tokens = getTokens()

  // Subscribe to changes
  const unsubscribe = themeManager.subscribe(() => {
    const newTokens = getTokens()
    onChange?.(newTokens)
  })

  return { tokens, unsubscribe }
}
// ============================================================================
// Derived Stores (Signal-based)
// ============================================================================

import { computed, effect, type ComputedSignal } from '@sthirajs/core'

/**
 * Signal-compatible source interface
 */
interface SignalSource<T> {
  get(): T
}

/**
 * Derived store result (signal-based)
 */
export interface DerivedStoreResult<T> {
  /** Get current computed value */
  getValue: () => T
  /** The underlying computed signal */
  signal: ComputedSignal<T>
  /** Subscribe to derived value changes */
  subscribe: (callback: (value: T) => void) => () => void
  /** Cleanup all subscriptions */
  destroy: () => void
}

/**
 * Create a derived store using Sthira's signal primitives
 * Automatically re-computes when any source signal changes
 *
 * @example
 * ```ts
 * import { signal } from '@sthirajs/core'
 *
 * const count = signal(5)
 * const multiplier = signal(2)
 *
 * const derived = createDerivedStore(
 *   [count, multiplier],
 *   ([c, m]) => c * m
 * )
 *
 * console.log(derived.getValue()) // 10
 * count.set(10)
 * console.log(derived.getValue()) // 20
 * ```
 */
export function createDerivedStore<T, Sources extends SignalSource<unknown>[]>(
  sources: [...Sources],
  compute: (values: {
    [K in keyof Sources]: Sources[K] extends SignalSource<infer V> ? V : never
  }) => T
): DerivedStoreResult<T> {
  // Create computed signal that derives from source signals
  const derivedSignal = computed(() => {
    const values = sources.map((s) => s.get()) as {
      [K in keyof Sources]: Sources[K] extends SignalSource<infer V> ? V : never
    }
    return compute(values)
  })

  const cleanupFns: (() => void)[] = []

  return {
    getValue: () => derivedSignal.get(),
    signal: derivedSignal,
    subscribe: (callback) => {
      // Use effect for automatic tracking
      const dispose = effect(() => {
        callback(derivedSignal.get())
      })
      cleanupFns.push(dispose)
      return dispose
    },
    destroy: () => {
      cleanupFns.forEach((fn) => fn())
      cleanupFns.length = 0
    },
  }
}

// ============================================================================
// Legacy Derived Store (for non-signal stores)
// ============================================================================

/**
 * Legacy source store interface (getState/subscribe pattern)
 */
interface LegacySourceStore<T> {
  getState: () => T
  subscribe: (callback: () => void) => () => void
}

/**
 * Create a derived store from legacy stores (getState/subscribe pattern)
 * Use createDerivedStore for signal-based stores
 */
export function createLegacyDerivedStore<T, Sources extends LegacySourceStore<unknown>[]>(
  sources: [...Sources],
  compute: (values: {
    [K in keyof Sources]: Sources[K] extends LegacySourceStore<infer V> ? V : never
  }) => T
): Omit<DerivedStoreResult<T>, 'signal'> {
  const subscribers = new Set<(value: T) => void>()
  const unsubscribers: (() => void)[] = []

  const computeValue = (): T => {
    const values = sources.map((s) => s.getState()) as {
      [K in keyof Sources]: Sources[K] extends LegacySourceStore<infer V> ? V : never
    }
    return compute(values)
  }

  let currentValue = computeValue()

  const notify = () => {
    const newValue = computeValue()
    if (newValue !== currentValue) {
      currentValue = newValue
      subscribers.forEach((cb) => cb(newValue))
    }
  }

  for (const source of sources) {
    const unsub = source.subscribe(notify)
    unsubscribers.push(unsub)
  }

  return {
    getValue: () => currentValue,
    subscribe: (callback) => {
      subscribers.add(callback)
      return () => subscribers.delete(callback)
    },
    destroy: () => {
      unsubscribers.forEach((unsub) => unsub())
      subscribers.clear()
    },
  }
}
