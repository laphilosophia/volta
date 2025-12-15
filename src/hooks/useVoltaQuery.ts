import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { apiClient } from '../core/api/client'

/**
 * Generic hook to fetch data from any endpoint defined in volta.config.ts
 *
 * @param endpointKey The key of the endpoint definition
 * @param params Query parameters or path variables
 * @param options TanStack Query options
 */
export function useVoltaQuery<TData = unknown>(
  endpointKey: string,
  params?: Record<string, unknown>,
  options?: Omit<UseQueryOptions<TData>, 'queryKey' | 'queryFn'>
) {
  return useQuery<TData>({
    queryKey: [endpointKey, params],
    queryFn: async () => {
      if (!apiClient) {
        throw new Error('ApiClient not initialized. Call initApiClient(config) at app startup.')
      }
      return apiClient.request<TData>(endpointKey, params)
    },
    ...options,
  })
}
