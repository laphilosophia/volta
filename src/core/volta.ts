// ============================================================================
// Volta - Core API
// The vanilla (framework-agnostic) API for Volta toolkit
// ============================================================================

import type { CacheConfig, DataLayerConfig, RetryConfig } from '../layers/data-layer'
import { initDataLayer, resetDataLayer } from '../layers/data-layer'
import {
  getStateLayer,
  initStateLayer,
  resetStateLayer,
  type StateLayerConfig,
  type SthiraStore,
  type StoreConfig,
} from '../layers/state-layer'

// Re-export StoreConfig for external use
export type { SthiraStore, StoreConfig }

// ============================================================================
// Types
// ============================================================================

/**
 * Volta lifecycle status
 */
export type VoltaStatus = 'idle' | 'running' | 'held' | 'destroyed'

/**
 * Main configuration for Volta initialization
 */
export interface VoltaConfig {
  /** Base URL for API requests */
  baseUrl: string
  /** Default headers for all requests */
  headers?: Record<string, string>
  /** Cache configuration */
  cache?: CacheConfig
  /** Retry configuration */
  retry?: RetryConfig
  /** Request timeout in ms (default: 30000) */
  timeout?: number
  /** Enable DevTools integration */
  enableDevTools?: boolean
  /** Enable cross-tab synchronization */
  enableCrossTab?: boolean
  /** Namespace for state stores */
  namespace?: string
}

/**
 * Query options for data fetching
 */
export interface QueryOptions {
  /** Override retry config for this query */
  retry?: RetryConfig | false
  /** Override timeout for this query (in ms) */
  timeout?: number
  /** AbortSignal for request cancellation */
  signal?: AbortSignal
  /** Path parameters */
  path?: Record<string, string | number>
}

/**
 * Mutation options for data changes
 */
export interface MutateOptions extends QueryOptions {
  /** HTTP method (default: POST) */
  method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  /** Endpoints to invalidate after mutation */
  invalidates?: string[]
}

// ============================================================================
// Internal State
// ============================================================================

let voltaStatus: VoltaStatus = 'idle'
let voltaConfig: VoltaConfig | null = null
let requestQueue: QueuedRequest[] = []
let isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true

// Listen for online/offline events
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    isOnline = true
    processQueue()
  })
  window.addEventListener('offline', () => {
    isOnline = false
  })
}

// ============================================================================
// Request Queue (Full Featured)
// ============================================================================

interface QueuedRequest {
  id: string
  type: 'query' | 'mutation'
  endpoint: string
  data?: unknown
  options?: QueryOptions | MutateOptions
  priority: number
  timestamp: number
  resolve: (value: unknown) => void
  reject: (error: Error) => void
}

function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function enqueueRequest(request: Omit<QueuedRequest, 'id' | 'timestamp'>): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const queuedRequest: QueuedRequest = {
      ...request,
      id: generateRequestId(),
      timestamp: Date.now(),
      resolve,
      reject,
    }

    // Dedup: remove existing requests for same endpoint (for queries)
    if (request.type === 'query') {
      requestQueue = requestQueue.filter(
        (r) => !(r.type === 'query' && r.endpoint === request.endpoint)
      )
    }

    // Insert by priority (higher priority first)
    const insertIndex = requestQueue.findIndex((r) => r.priority < request.priority)
    if (insertIndex === -1) {
      requestQueue.push(queuedRequest)
    } else {
      requestQueue.splice(insertIndex, 0, queuedRequest)
    }

    // Process immediately if online
    if (isOnline && voltaStatus === 'running') {
      processQueue()
    }
  })
}

async function processQueue(): Promise<void> {
  if (voltaStatus !== 'running' || !isOnline || requestQueue.length === 0) {
    return
  }

  const request = requestQueue.shift()
  if (!request) return

  try {
    // Ensure StateLayer is available
    getStateLayer()
    let result: unknown

    if (request.type === 'query') {
      result = await executeQuery(request.endpoint, request.options as QueryOptions)
    } else {
      result = await executeMutation(
        request.endpoint,
        request.data,
        request.options as MutateOptions
      )
    }

    request.resolve(result)
  } catch (error) {
    request.reject(error as Error)
  }

  // Continue processing queue
  if (requestQueue.length > 0) {
    processQueue()
  }
}

// ============================================================================
// Internal Execution (bypasses queue - used by queue processor)
// ============================================================================

async function executeQuery<T>(endpoint: string, options?: QueryOptions): Promise<T> {
  // Ensure StateLayer is initialized
  getStateLayer()

  // Check cache in StateLayer
  const cacheKey = buildCacheKey(endpoint, options?.path)
  const cached = getCachedData<T>(cacheKey)

  if (cached && !isCacheStale(cacheKey)) {
    return cached
  }

  // Import DataLayer dynamically to keep it internal
  const { getDataLayer } = await import('../layers/data-layer')
  const dataLayer = getDataLayer()

  const data = await dataLayer.get<T>(endpoint, {
    path: options?.path,
    retry: options?.retry,
    timeout: options?.timeout,
    signal: options?.signal,
  })

  // Store in cache
  setCachedData(cacheKey, data)

  return data
}

async function executeMutation<T>(
  endpoint: string,
  data?: unknown,
  options?: MutateOptions
): Promise<T> {
  const { getDataLayer } = await import('../layers/data-layer')
  const dataLayer = getDataLayer()
  const method = options?.method ?? 'POST'

  let result: T

  switch (method) {
    case 'POST':
      result = await dataLayer.post<T>(endpoint, data, options)
      break
    case 'PUT':
      result = await dataLayer.put<T>(endpoint, data, options)
      break
    case 'PATCH':
      result = await dataLayer.patch<T>(endpoint, data, options)
      break
    case 'DELETE':
      result = await dataLayer.delete<T>(endpoint, options)
      break
  }

  // Invalidate specified endpoints
  if (options?.invalidates) {
    options.invalidates.forEach((pattern) => {
      invalidateCache(pattern)
    })
  }

  return result
}

// ============================================================================
// Cache Management (Simple TTL-based)
// ============================================================================

interface CacheEntry<T = unknown> {
  data: T
  timestamp: number
  ttl: number
}

const cache = new Map<string, CacheEntry>()
const DEFAULT_CACHE_TTL = 5 * 60 * 1000 // 5 minutes

function buildCacheKey(endpoint: string, path?: Record<string, string | number>): string {
  let key = endpoint
  if (path) {
    Object.entries(path).forEach(([k, v]) => {
      key = key.replace(`:${k}`, String(v))
    })
  }
  return key
}

function getCachedData<T>(key: string): T | undefined {
  const entry = cache.get(key)
  if (!entry) return undefined
  return entry.data as T
}

function setCachedData<T>(key: string, data: T, ttl = DEFAULT_CACHE_TTL): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl,
  })
}

function isCacheStale(key: string): boolean {
  const entry = cache.get(key)
  if (!entry) return true
  return Date.now() - entry.timestamp > entry.ttl
}

function invalidateCache(pattern: string): void {
  for (const key of cache.keys()) {
    if (key.startsWith(pattern) || key.includes(pattern)) {
      cache.delete(key)
    }
  }
}

function clearAllCache(): void {
  cache.clear()
}

// ============================================================================
// Public API - Initialization
// ============================================================================

/**
 * Initialize Volta with configuration
 *
 * @example
 * ```typescript
 * initVolta({
 *   baseUrl: 'https://api.example.com',
 *   headers: { Authorization: 'Bearer token' },
 *   enableDevTools: true,
 * })
 * ```
 */
export function initVolta(config: VoltaConfig): void {
  if (voltaStatus !== 'idle' && voltaStatus !== 'destroyed') {
    throw new Error(
      `Cannot initialize Volta in "${voltaStatus}" status. Call destroyVolta() first.`
    )
  }

  voltaConfig = config

  // Initialize DataLayer (internal)
  const dataLayerConfig: DataLayerConfig = {
    baseUrl: config.baseUrl,
    headers: config.headers,
    cache: config.cache,
    retry: config.retry,
    timeout: config.timeout,
  }
  initDataLayer(dataLayerConfig)

  // Initialize StateLayer
  const stateLayerConfig: StateLayerConfig = {
    enableDevTools: config.enableDevTools,
    enableCrossTab: config.enableCrossTab,
    namespace: config.namespace ?? 'volta',
  }
  initStateLayer(stateLayerConfig)

  voltaStatus = 'running'
}

/**
 * Get current Volta lifecycle status
 */
export function getVoltaStatus(): VoltaStatus {
  return voltaStatus
}

/**
 * Check if Volta is initialized and running
 */
export function isVoltaReady(): boolean {
  return voltaStatus === 'running'
}

/**
 * Get current Volta configuration
 * Returns null if not initialized
 */
export function getVoltaConfig(): VoltaConfig | null {
  return voltaConfig
}

// ============================================================================
// Public API - Lifecycle
// ============================================================================

/**
 * Hold/pause Volta operations
 * Queued requests will wait until resume
 */
export function holdVolta(): void {
  if (voltaStatus !== 'running') {
    throw new Error('Volta must be running to hold')
  }
  voltaStatus = 'held'
}

/**
 * Resume Volta operations after hold
 */
export function resumeVolta(): void {
  if (voltaStatus !== 'held') {
    throw new Error('Volta must be held to resume')
  }
  voltaStatus = 'running'
  processQueue()
}

/**
 * Destroy Volta instance and cleanup all resources
 */
export function destroyVolta(): void {
  voltaStatus = 'destroyed'
  voltaConfig = null
  requestQueue = []
  clearAllCache()

  // Reset layers
  resetDataLayer()
  resetStateLayer()
}

// ============================================================================
// Public API - Data Operations
// ============================================================================

/**
 * Fetch data from an endpoint
 *
 * @example
 * ```typescript
 * const users = await query<User[]>('/users')
 * const user = await query<User>('/users/:id', { path: { id: '123' } })
 * ```
 */
export async function query<T>(endpoint: string, options?: QueryOptions): Promise<T> {
  assertRunning('query')

  // Use queue for offline support
  return enqueueRequest({
    type: 'query',
    endpoint,
    options,
    priority: 0, // Normal priority
    resolve: () => {},
    reject: () => {},
  }) as Promise<T>
}

/**
 * Mutate data at an endpoint
 *
 * @example
 * ```typescript
 * const newUser = await mutate<User>('/users', { name: 'John' })
 * await mutate('/users/123', { name: 'Updated' }, { method: 'PUT' })
 * ```
 */
export async function mutate<T>(
  endpoint: string,
  data?: unknown,
  options?: MutateOptions
): Promise<T> {
  assertRunning('mutate')

  // Mutations have higher priority than queries
  return enqueueRequest({
    type: 'mutation',
    endpoint,
    data,
    options,
    priority: 10, // Higher priority
    resolve: () => {},
    reject: () => {},
  }) as Promise<T>
}

/**
 * Invalidate cached data matching a pattern
 *
 * @example
 * ```typescript
 * invalidate('/users') // Invalidates all /users/* entries
 * ```
 */
export function invalidate(pattern: string): void {
  invalidateCache(pattern)
}

// ============================================================================
// Public API - Store Operations
// ============================================================================

/**
 * Create a state store
 *
 * @example
 * ```typescript
 * const userStore = createStore('user', {
 *   initialState: { name: '', email: '' }
 * })
 * ```
 */
export function createStore<TState extends object, TActions extends object = object>(
  name: string,
  config: StoreConfig<TState>,
  actions?: (set: (partial: Partial<TState>) => void, get: () => TState) => TActions
): SthiraStore<TState, TActions> {
  assertRunning('createStore')
  return getStateLayer().createStore(name, config, actions)
}

/**
 * Get an existing store by name
 */
export function getStore<TState extends object, TActions extends object = object>(
  name: string
): SthiraStore<TState, TActions> | undefined {
  assertRunning('getStore')
  return getStateLayer().getStore<TState, TActions>(name)
}

/**
 * Check if a store exists
 */
export function hasStore(name: string): boolean {
  assertRunning('hasStore')
  return getStateLayer().hasStore(name)
}

/**
 * Get network status
 */
export function isNetworkOnline(): boolean {
  return isOnline
}

/**
 * Get pending request count
 */
export function getPendingRequestCount(): number {
  return requestQueue.length
}

// ============================================================================
// Internal Helpers
// ============================================================================

function assertRunning(operation: string): void {
  if (voltaStatus === 'idle') {
    throw new Error(`Cannot ${operation}: Volta is not initialized. Call initVolta() first.`)
  }
  if (voltaStatus === 'destroyed') {
    throw new Error(
      `Cannot ${operation}: Volta has been destroyed. Call initVolta() to reinitialize.`
    )
  }
  if (voltaStatus === 'held') {
    // Allow operation but it will be queued
  }
}
