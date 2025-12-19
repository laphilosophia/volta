// Volta React Hooks
// React-specific hooks for data and state management
// Uses @sthirajs ecosystem for data fetching and state management

// Data Fetching Hooks
export { useVoltaQuery } from './useVoltaQuery'
export type { UseVoltaQueryOptions, UseVoltaQueryResult } from './useVoltaQuery'

export { useVoltaMutation } from './useVoltaMutation'
export type { UseVoltaMutationOptions, UseVoltaMutationResult } from './useVoltaMutation'

// State Management Hooks
export { useCreateStore, useGetStore } from './useCreateStore'
export { useVoltaStore } from './useVoltaStore'

// Unified Registry Hook (v0.4.0)
export { createTypedQueryKey, useVoltaRegistry } from './useVoltaRegistry'
export type { RegistryConfig, RegistryResult } from './useVoltaRegistry'

// Component Auto-Wiring Hook (v0.5.0)
export { useVoltaComponent } from './useVoltaComponent'
export type { UseVoltaComponentOptions, VoltaComponentResult } from './useVoltaComponent'
