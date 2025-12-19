// ============================================================================
// VoltaProvider - React Adapter for Volta Core
// ============================================================================
// Wraps vanilla initVolta() to handle React-specific lifecycle:
// - StrictMode double-mount
// - HMR re-execution
// - SSR (server-side rendering)
// - Concurrent rendering

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  destroyVolta,
  initVolta,
  isVoltaReady,
  type VoltaConfig,
} from '../../core/volta'

// ============================================================================
// Types
// ============================================================================

export interface VoltaContextValue {
  /** Whether Volta has been initialized and is ready */
  isReady: boolean
  /** Current Volta configuration (if initialized) */
  config: VoltaConfig | null
}

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
// Context
// ============================================================================

const VoltaContext = createContext<VoltaContextValue | null>(null)

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
export function VoltaProvider({
  config,
  children,
  destroyOnUnmount = false,
}: VoltaProviderProps) {
  const [isReady, setIsReady] = useState(false)

  // Track if this is the first mount (for StrictMode)
  const mountCountRef = useRef(0)
  // Track if we've initialized (for HMR)
  const initializedByUsRef = useRef(false)

  useEffect(() => {
    mountCountRef.current += 1

    // SSR guard
    if (typeof window === 'undefined') {
      return
    }

    // Initialize Volta if not already ready
    // This handles both fresh start and HMR scenarios
    if (!isVoltaReady()) {
      try {
        initVolta(config)
        initializedByUsRef.current = true
        // eslint-disable-next-line react-hooks/exhaustive-deps
        setIsReady(true)

        if (process.env.NODE_ENV === 'development') {
          console.log('[VoltaProvider] Initialized Volta')
        }
      } catch (error) {
        console.error('[VoltaProvider] Failed to initialize Volta:', error)
      }
    } else {
      // Volta already running (HMR or re-mount in StrictMode)
      // Just mark as ready without re-initializing
      // Just mark as ready without re-initializing
      setIsReady(true)

      if (process.env.NODE_ENV === 'development') {
        console.log('[VoltaProvider] Volta already ready, skipping init')
      }
    }

    // Cleanup function
    return () => {
      // Only destroy if destroyOnUnmount is true and we initialized Volta
      // Note: In StrictMode, this runs on first unmount, but Volta stays running
      // because the second mount will see isVoltaReady() === true
      if (destroyOnUnmount && initializedByUsRef.current) {
        // Use a flag to check if we should actually destroy
        // (in case component remounts quickly in StrictMode)
        const shouldDestroy = true //mountCountRef.current === 1

        if (shouldDestroy && isVoltaReady()) {
          destroyVolta()
          initializedByUsRef.current = false

          if (process.env.NODE_ENV === 'development') {
            console.log('[VoltaProvider] Destroyed Volta')
          }
        }
      }
    }
  }, [config, destroyOnUnmount]) // config is dependency

  // Stable config reference
  const stableConfig = useMemo(() => config, [config])

  // Stable context value to prevent unnecessary re-renders
  const contextValue = useMemo<VoltaContextValue>(
    () => ({
      isReady,
      config: stableConfig,
    }),
    [isReady, stableConfig]
  )

  return (
    <VoltaContext.Provider value={contextValue}>
      {children}
    </VoltaContext.Provider>
  )
}

// ============================================================================
// useVolta Hook
// ============================================================================

/**
 * Hook to access Volta context.
 * Must be used within a VoltaProvider.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isReady, config } = useVolta()
 *
 *   if (!isReady) return <Loading />
 *
 *   return <div>Base URL: {config?.baseUrl}</div>
 * }
 * ```
 */
export function useVolta(): VoltaContextValue {
  const context = useContext(VoltaContext)

  if (context === null) {
    throw new Error('useVolta must be used within a VoltaProvider')
  }

  return context
}

// ============================================================================
// Export Context for advanced use cases
// ============================================================================

export { VoltaContext }

