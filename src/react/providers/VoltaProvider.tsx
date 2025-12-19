// ============================================================================
// VoltaProvider - React Adapter for Volta Core
// ============================================================================
// Wraps vanilla initVolta() to handle React-specific lifecycle:
// - StrictMode double-mount
// - HMR re-execution
// - SSR (server-side rendering)
// - Concurrent rendering

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { destroyVolta, initVolta, isVoltaReady, type VoltaConfig } from '../../core/volta'
import { VoltaContext, type VoltaContextValue } from './VoltaContext'

// ============================================================================
// Types
// ============================================================================

export interface VoltaProviderProps {
  /** Volta configuration */
  config: VoltaConfig
  /** Child components */
  children: ReactNode
  /**
   * If true, destroys Volta on unmount (default: false)
   * Set to false for SPA where Volta should persist for app lifetime
   * Set to true for micro-frontends or when provider can be unmounted
   */
  destroyOnUnmount?: boolean
}

// ============================================================================
// Module-level tracking
// ============================================================================

// Track initialization at module level to handle HMR correctly
// This is intentional - Volta is a singleton, so tracking should be too
let voltaInitializedByProvider = false

// ============================================================================
// Helpers
// ============================================================================

/**
 * Synchronously initialize Volta if not already ready.
 * Returns true if Volta is ready (either freshly initialized or already running).
 */
function ensureVoltaInitialized(config: VoltaConfig): boolean {
  // SSR guard
  if (typeof window === 'undefined') {
    return false
  }

  if (isVoltaReady()) {
    return true
  }

  try {
    initVolta(config)
    voltaInitializedByProvider = true
    if (process.env.NODE_ENV === 'development') {
      console.log('[VoltaProvider] Initialized Volta')
    }
    return true
  } catch (error) {
    console.error('[VoltaProvider] Failed to initialize Volta:', error)
    return false
  }
}

// ============================================================================
// VoltaProvider Component
// ============================================================================

/**
 * React provider that initializes Volta and handles lifecycle properly.
 *
 * @example
 * ```tsx
 * // In main.tsx or App.tsx
 * import { VoltaProvider } from '@voltakit/volta/react'
 *
 * <VoltaProvider config={{ baseUrl: '/api', enableDevTools: true }}>
 *   <App />
 * </VoltaProvider>
 * ```
 */
export function VoltaProvider({ config, children, destroyOnUnmount = false }: VoltaProviderProps) {
  // Lazy initialization: compute initial state synchronously during first render
  // This avoids the anti-pattern of calling setState inside useEffect
  const [isReady] = useState(() => ensureVoltaInitialized(config))

  // Handle HMR: if config changes, we may need to re-initialize
  useEffect(() => {
    if (!isVoltaReady() && typeof window !== 'undefined') {
      ensureVoltaInitialized(config)
    }
  }, [config])

  // Cleanup on unmount (only if destroyOnUnmount is true)
  useEffect(() => {
    return () => {
      if (destroyOnUnmount && voltaInitializedByProvider && isVoltaReady()) {
        destroyVolta()
        voltaInitializedByProvider = false
        if (process.env.NODE_ENV === 'development') {
          console.log('[VoltaProvider] Destroyed Volta')
        }
      }
    }
  }, [destroyOnUnmount])

  // Stable config reference for context
  const stableConfig = useMemo(() => config, [config])

  // Stable context value to prevent unnecessary re-renders
  const contextValue = useMemo<VoltaContextValue>(
    () => ({
      isReady,
      config: stableConfig,
    }),
    [isReady, stableConfig]
  )

  return <VoltaContext.Provider value={contextValue}>{children}</VoltaContext.Provider>
}
