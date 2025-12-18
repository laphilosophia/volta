// ============================================================================
// Volta Core - Pure TypeScript (Framework-agnostic)
// ============================================================================

// Volta API (vanilla, framework-agnostic)
export {
  // Store operations
  createStore,
  destroyVolta,
  getPendingRequestCount,
  getStore,
  getVoltaConfig,
  getVoltaStatus,
  hasStore,
  // Lifecycle
  holdVolta,
  // Initialization
  initVolta,
  invalidate,
  // Utilities
  isNetworkOnline,
  isVoltaReady,
  mutate,
  resumeVolta,
  // Data operations (keep for backward compat)
  query as voltaQuery,
} from './volta'

export type { MutateOptions, QueryOptions, VoltaConfig, VoltaStatus } from './volta'

// Component Registry (new builder API)
export {
  clearRegistry,
  createInstance,
  getComponent,
  getComponentTypes,
  getInstanceCount,
  hasComponent,
  listComponents,
  listComponentsByType,
  query,
  register,
  store,
  unregister,
} from './component-registry'

export type {
  ComponentDefinition,
  ComponentInstance,
  DataBinding,
  QueryConfig,
  QueryRef,
  RegistrationResult,
  StateBinding,
  StoreConfig,
  StoreRef,
} from './component-registry'

// Types
export * from './types/layout'

// Constants
export * from './constants'

// API Client
export * from './api'
