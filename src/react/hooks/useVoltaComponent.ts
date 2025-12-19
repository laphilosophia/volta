// ============================================================================
// useVoltaComponent - Auto-Wiring Hook for Registered Components
// ============================================================================

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  createInstance,
  destroyInstance,
  getComponent,
  resolveDataBindings,
  resolveStateBindings,
  resolveThemeBindings,
  type ComponentDefinition,
  type ResolvedData,
  type ResolvedTheme,
} from '../../core/component-registry'
import type { ThemeManager } from '../../layers/theme-manager'

/**
 * Result from useVoltaComponent hook
 */
export interface VoltaComponentResult {
  /** Resolved data from data bindings */
  data: Record<string, unknown>
  /** Resolved theme tokens */
  theme: Record<string, unknown>
  /** Resolved state stores (scoped to instance) */
  state: Record<string, unknown>
  /** Component definition */
  definition: ComponentDefinition | undefined
  /** Loading state */
  isLoading: boolean
  /** Error if any */
  error: Error | undefined
  /** Refetch data bindings */
  refetch: () => Promise<void>
}

/**
 * Options for useVoltaComponent
 */
export interface UseVoltaComponentOptions {
  /** Props to pass for path parameter substitution */
  props?: Record<string, unknown>
  /** ThemeManager instance for theme bindings */
  themeManager?: ThemeManager<object>
  /** Skip initial data fetch */
  skip?: boolean
}

/**
 * React hook for auto-wiring registered components
 * Resolves data, state, and theme bindings automatically
 *
 * @example
 * ```tsx
 * function UserCard({ userId }: { userId: string }) {
 *   const { data, theme, state, isLoading } = useVoltaComponent('user-card', {
 *     props: { userId },
 *     themeManager
 *   })
 *
 *   if (isLoading) return <Spinner />
 *
 *   return (
 *     <div style={{ color: theme['colors.primary'] }}>
 *       {data.user?.name}
 *     </div>
 *   )
 * }
 * ```
 */
export function useVoltaComponent(
  componentKey: string,
  options: UseVoltaComponentOptions = {}
): VoltaComponentResult {
  const { props = {}, themeManager, skip = false } = options

  const [dataState, setDataState] = useState<ResolvedData>({
    data: {},
    status: 'loading',
  })
  const [themeTokens, setThemeTokens] = useState<Record<string, unknown>>({})
  const [stateBindings, setStateBindings] = useState<Record<string, unknown>>({})
  const [isLoading, setIsLoading] = useState(!skip)

  const abortControllerRef = useRef<AbortController | null>(null)
  const themeUnsubscribeRef = useRef<(() => void) | null>(null)
  // Track instance ID to avoid recreating on every render, but recreate if componentKey changes
  const instanceIdRef = useRef<symbol | null>(null)

  // Get component definition
  const definition = useMemo(() => getComponent(componentKey), [componentKey])

  // Manage Instance Lifecycle & State Bindings
  useEffect(() => {
    // 1. Create instance (equivalent to mounting)
    const instance = createInstance(componentKey)
    if (!instance) return

    instanceIdRef.current = instance.id

    // 2. Resolve state bindings (async)
    // We don't block the UI for state creation as it's usually fast
    resolveStateBindings(componentKey, instance.id)
      .then((bindings) => {
        setStateBindings(bindings)
      })
      .catch((err) => {
        console.error(`Failed to resolve state bindings for ${componentKey}:`, err)
      })

    // 3. Cleanup (destroy instance on unmount)
    return () => {
      if (instanceIdRef.current) {
        destroyInstance(instanceIdRef.current)
        instanceIdRef.current = null
      }
    }
  }, [componentKey])

  // Fetch data bindings
  const fetchData = useCallback(async () => {
    // Abort previous request
    abortControllerRef.current?.abort()
    abortControllerRef.current = new AbortController()

    setIsLoading(true)

    try {
      const result = await resolveDataBindings(
        componentKey,
        props,
        abortControllerRef.current.signal
      )
      setDataState(result)
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        setDataState({
          data: {},
          status: 'error',
          error: error instanceof Error ? error : new Error(String(error)),
        })
      }
    } finally {
      setIsLoading(false)
    }
  }, [componentKey, props])

  // Initial data fetch
  useEffect(() => {
    if (!skip && definition?.data) {
      fetchData()
    } else if (!definition?.data) {
      setIsLoading(false)
      setDataState({ data: {}, status: 'success' })
    }

    return () => {
      abortControllerRef.current?.abort()
    }
  }, [fetchData, skip, definition])

  // Theme bindings
  useEffect(() => {
    if (!themeManager || !definition?.theme?.length) {
      return
    }

    const result: ResolvedTheme = resolveThemeBindings(componentKey, themeManager, (tokens) =>
      setThemeTokens(tokens)
    )

    setThemeTokens(result.tokens)
    themeUnsubscribeRef.current = result.unsubscribe

    return () => {
      themeUnsubscribeRef.current?.()
    }
  }, [componentKey, themeManager, definition])

  return {
    data: dataState.data,
    theme: themeTokens,
    state: stateBindings,
    definition,
    isLoading,
    error: dataState.error,
    refetch: fetchData,
  }
}
