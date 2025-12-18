// ============================================================================
// useVoltaComponent - Auto-Wiring Hook for Registered Components
// ============================================================================

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  getComponent,
  resolveDataBindings,
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
 *   const { data, theme, isLoading } = useVoltaComponent('user-card', {
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
  const [isLoading, setIsLoading] = useState(!skip)

  const abortControllerRef = useRef<AbortController | null>(null)
  const themeUnsubscribeRef = useRef<(() => void) | null>(null)

  // Get component definition
  const definition = useMemo(() => getComponent(componentKey), [componentKey])

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
  }, [componentKey, JSON.stringify(props)])

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
    definition,
    isLoading,
    error: dataState.error,
    refetch: fetchData,
  }
}
