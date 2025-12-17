// Volta React Hooks
// React-specific hooks for data and state management
// Uses @sthirajs/core for state management

// Note: Full hook implementations require @sthirajs/fetch for data fetching.
// These are placeholder exports that will be implemented when Sthira
// integration is complete.

/**
 * Hook options for Volta queries
 */
export interface UseVoltaQueryOptions {
  /** Endpoint key from VoltaConfig */
  endpoint: string
  /** Query parameters */
  params?: Record<string, unknown>
  /** Enable/disable the query */
  enabled?: boolean
}

/**
 * Hook options for Volta mutations
 */
export interface UseVoltaMutationOptions {
  /** Endpoint key from VoltaConfig */
  endpoint: string
  /** Success callback */
  onSuccess?: (data: unknown) => void
  /** Error callback */
  onError?: (error: Error) => void
}

// Placeholder: useVoltaQuery will use @sthirajs/fetch
// export { useVoltaQuery } from './useVoltaQuery'

// Placeholder: useVoltaMutation will use @sthirajs/fetch
// export { useVoltaMutation } from './useVoltaMutation'
