// ============================================================================
// VoltaContext - Context definition for Volta React adapter
// ============================================================================
// Separated from VoltaProvider for Fast Refresh compatibility.
// React Fast Refresh requires files to export only components OR only non-components.

import { createContext, useContext } from 'react'
import type { VoltaConfig } from '../../core/volta'

// ============================================================================
// Types
// ============================================================================

export interface VoltaContextValue {
  /** Whether Volta has been initialized and is ready */
  isReady: boolean
  /** Current Volta configuration (if initialized) */
  config: VoltaConfig | null
}

// ============================================================================
// Context
// ============================================================================

export const VoltaContext = createContext<VoltaContextValue | null>(null)

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
