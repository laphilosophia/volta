// ============================================================================
// useVoltaMutation - Data Mutation Hook
// Wraps the vanilla mutate() API for React
// ============================================================================

import { useCallback, useEffect, useRef, useState } from 'react'
import { mutate, type MutateOptions } from '../../core/volta'

/**
 * Mutation state returned by useVoltaMutation
 */
export interface MutationState<T> {
  data: T | undefined
  isLoading: boolean
  isError: boolean
  error: Error | null
  isSuccess: boolean
}

/**
 * Options for useVoltaMutation hook
 */
export interface UseVoltaMutationOptions<T, V> {
  /** HTTP method (default: 'POST') */
  method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  /** Path parameters for URL substitution */
  path?: Record<string, string | number>
  /** Override retry config */
  retry?: MutateOptions['retry']
  /** Override timeout */
  timeout?: number
  /** Endpoints to invalidate on success */
  invalidates?: string[]
  /** Called on successful mutation */
  onSuccess?: (data: T, variables: V) => void | Promise<void>
  /** Called on mutation error */
  onError?: (error: Error, variables: V) => void
  /** Called when mutation settles (success or error) */
  onSettled?: (data: T | undefined, error: Error | null, variables: V) => void
  /** Transform variables to get optimistic data */
  optimisticUpdate?: (variables: V) => T
}

/**
 * Result returned by useVoltaMutation
 */
export interface UseVoltaMutationResult<T, V> extends MutationState<T> {
  /** Execute the mutation (fire-and-forget) */
  mutate: (variables: V) => void
  /** Execute the mutation and return a promise */
  mutateAsync: (variables: V) => Promise<T>
  /** Reset mutation state */
  reset: () => void
}

/**
 * Hook for data mutations using the vanilla Volta API.
 *
 * @example
 * ```tsx
 * function CreateUserForm() {
 *   const { mutate, isLoading } = useVoltaMutation<User, CreateUserInput>(
 *     '/users',
 *     {
 *       onSuccess: (user) => console.log('Created:', user),
 *       invalidates: ['/users']
 *     }
 *   )
 *
 *   const handleSubmit = (data: CreateUserInput) => {
 *     mutate(data)
 *   }
 *
 *   return <button disabled={isLoading}>Create User</button>
 * }
 * ```
 */
export function useVoltaMutation<T, V = unknown>(
  endpoint: string,
  options: UseVoltaMutationOptions<T, V> = {}
): UseVoltaMutationResult<T, V> {
  const {
    method = 'POST',
    path,
    retry,
    timeout,
    invalidates: invalidatePatterns,
    onSuccess,
    onError,
    onSettled,
    optimisticUpdate,
  } = options

  const [state, setState] = useState<MutationState<T>>({
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
    isSuccess: false,
  })

  const mountedRef = useRef(true)

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const reset = useCallback(() => {
    setState({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
      isSuccess: false,
    })
  }, [])

  const mutateAsync = useCallback(
    async (variables: V): Promise<T> => {
      setState((prev) => ({
        ...prev,
        isLoading: true,
        isError: false,
        error: null,
        isSuccess: false,
      }))

      // Apply optimistic update if provided
      if (optimisticUpdate) {
        const optimisticData = optimisticUpdate(variables)
        setState((prev) => ({ ...prev, data: optimisticData }))
      }

      try {
        // Use vanilla mutate() API
        const data = await mutate<T>(endpoint, variables, {
          method,
          path,
          retry,
          timeout,
          invalidates: invalidatePatterns,
        })

        if (mountedRef.current) {
          setState({
            data,
            isLoading: false,
            isError: false,
            error: null,
            isSuccess: true,
          })
        }

        await onSuccess?.(data, variables)
        onSettled?.(data, null, variables)

        return data
      } catch (error) {
        const err = error as Error

        if (mountedRef.current) {
          setState({
            data: undefined,
            isLoading: false,
            isError: true,
            error: err,
            isSuccess: false,
          })
        }

        onError?.(err, variables)
        onSettled?.(undefined, err, variables)

        throw err
      }
    },
    [
      endpoint,
      method,
      path,
      retry,
      timeout,
      invalidatePatterns,
      onSuccess,
      onError,
      onSettled,
      optimisticUpdate,
    ]
  )

  const mutateSync = useCallback(
    (variables: V) => {
      mutateAsync(variables).catch(() => {
        // Error already handled in state
      })
    },
    [mutateAsync]
  )

  return {
    ...state,
    mutate: mutateSync,
    mutateAsync,
    reset,
  }
}
