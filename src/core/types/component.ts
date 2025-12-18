// ============================================================================
// Component Registration Types
// ============================================================================

/**
 * Data binding configuration for auto-fetching
 */
export interface DataBinding {
  /** API endpoint with optional path params (e.g., '/users/:userId') */
  endpoint: string
  /** Props that become path parameters */
  params?: string[]
  /** HTTP method (default: GET) */
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  /** Cache stale time in milliseconds */
  staleTime?: number
  /** Transform function for response data */
  transform?: (data: unknown) => unknown
}

/**
 * State binding configuration for auto-created stores
 */
export interface StateBinding {
  /** Initial state value */
  initial: unknown
  /** Whether to persist to storage */
  persist?: boolean
}

/**
 * Query configuration (lazy data fetching)
 */
export interface QueryConfig {
  /** API endpoint with optional path params */
  endpoint: string
  /** Props that become path parameters */
  params?: string[]
  /** HTTP method (default: GET) */
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  /** Cache stale time in milliseconds */
  staleTime?: number
  /** Transform function for response data */
  transform?: (data: unknown) => unknown
}

/**
 * Store configuration (state container)
 */
export interface StoreConfig<T = unknown> {
  /** Initial state value */
  initial: T
  /** Whether to persist to storage */
  persist?: boolean
  /** Derived state from other stores */
  derived?: Record<string, (get: <S>(store: StoreRef<S>) => S) => unknown>
}

/**
 * Reference to a store (for derived stores)
 */
export interface StoreRef<T = unknown> {
  /** Internal symbol for store identification */
  readonly __storeSymbol: symbol
  /** Store configuration */
  readonly config: StoreConfig<T>
}

/**
 * Query reference (lazy data subscription)
 */
export interface QueryRef {
  /** Internal symbol for query identification */
  readonly __querySymbol: symbol
  /** Query configuration */
  readonly config: QueryConfig
}

/**
 * Component registration definition
 */
export interface ComponentDefinition {
  /** Component type identifier (e.g., 'data-display', 'input', 'layout') */
  type: string

  /**
   * Component reference (framework-agnostic)
   * - React: ComponentType
   * - Svelte: SvelteComponent
   * - Web Components: CustomElementConstructor
   * - Lazy: () => Promise<{ default: unknown }>
   */
  component: unknown | (() => Promise<{ default: unknown }>)

  /** Data bindings (auto-fetched on mount) */
  data?: QueryRef | Record<string, QueryRef>

  /** State bindings (auto-created on register) */
  state?: StoreRef | Record<string, StoreRef>

  /** Theme token paths to subscribe to (e.g., ['colors.primary', 'spacing.md']) */
  theme?: string[]
}

/**
 * Registration result
 */
export interface RegistrationResult {
  /** Unique instance identifier */
  id: symbol
  /** Registration status */
  status: 'registered' | 'loading' | 'error'
  /** Component definition */
  component: ComponentDefinition
  /** Error if registration failed */
  error?: Error
}

/**
 * Component instance (runtime)
 */
export interface ComponentInstance {
  /** Unique instance identifier */
  id: symbol
  /** Component type key */
  key: string
  /** Resolved data (fetched values) */
  data: Record<string, unknown>
  /** Resolved state (store instances) */
  state: Record<string, unknown>
  /** Parent instance ID (for hierarchy) */
  parentId?: symbol
  /** Creation timestamp */
  createdAt: number
}
