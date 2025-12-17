// ============================================================================
// useVoltaMutation - Data Mutation Hook
// ============================================================================

import { useCallback, useRef, useState } from 'react'
import type {
  DataLayerError,
  MutationOptions,
  MutationState,
  RequestParams,
} from '../../layers/DataLayer'
import { getDataLayer } from '../../layers/DataLayer'

export interface UseVoltaMutationOptions<T, V> extends MutationOptions<T, V> {
  /** HTTP method (default: 'POST') */
  method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  /** Request parameters */
  params?: RequestParams
  /** Endpoints to invalidate on success */
  invalidates?: string[]
}

export interface UseVoltaMutationResult<T, V> extends MutationState<T> {
  /** Execute the mutation */
  mutate: (variables: V) => Promise<T>
  /** Execute the mutation and return a promise */
  mutateAsync: (variables: V) => Promise<T>
  /** Reset mutation state */
  reset: () => void
}

/**
 * Hook for data mutations with optimistic updates and cache invalidation.
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
    params,
    onSuccess,
    onError,
    onSettled,
    optimisticUpdate,
    invalidates,
  } = options

  const [state, setState] = useState<MutationState<T>>({
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
    isSuccess: false,
  })

  const mountedRef = useRef(true)

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
        const dataLayer = getDataLayer()
        let data: T

        switch (method) {
          case 'POST':
            data = await dataLayer.post<T>(endpoint, variables, params)
            break
          case 'PUT':
            data = await dataLayer.put<T>(endpoint, variables, params)
            break
          case 'PATCH':
            data = await dataLayer.patch<T>(endpoint, variables, params)
            break
          case 'DELETE':
            data = await dataLayer.delete<T>(endpoint, params)
            break
        }

        // Invalidate caches
        if (invalidates?.length) {
          invalidates.forEach((pattern) => dataLayer.invalidateCache(pattern))
        }

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
        const err = error as DataLayerError

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
    [endpoint, method, params, onSuccess, onError, onSettled, optimisticUpdate, invalidates]
  )

  const mutate = useCallback(
    (variables: V) => {
      mutateAsync(variables).catch(() => {
        // Error already handled in state
      })
    },
    [mutateAsync]
  ) as (variables: V) => Promise<T>

  return {
    ...state,
    mutate,
    mutateAsync,
    reset,
  }
}
