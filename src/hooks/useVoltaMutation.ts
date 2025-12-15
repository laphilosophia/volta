import { useMutation, type UseMutationOptions } from '@tanstack/react-query'
import { apiClient } from '../core/api/client'

/**
 * Generic hook to mutate data on any endpoint defined in volta.config.ts
 *
 * @param endpointKey The key of the endpoint definition
 * @param options TanStack Query mutation options
 */
export function useVoltaMutation<TData = unknown, TVariables = unknown>(
  endpointKey: string,
  options?: Omit<UseMutationOptions<TData, Error, TVariables>, 'mutationFn'>
) {
  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables) => {
      if (!apiClient) {
        throw new Error('ApiClient not initialized. Call initApiClient(config) at app startup.')
      }
      // Assuming variables object contains both params and body.
      // For simplicity in this generic hook, we'll treat 'variables' as the body
      // unless it has a special structure we define later.
      // For REST POST/PUT, variables usually equals body.
      // If we need path params for mutation (like PUT /posts/:id), we might need a convention.
      // Convention: variables = { ...body, _params: { id: 1 } } ?
      // OR mostly, standard mutations use body. Path params might be embedded or passed differently.

      // Let's check if variables has mixed content or simple body.
      // For now, we will treat variables as BODY.
      // TODO: Improve to separate params and body if needed.

      return apiClient.request<TData>(endpointKey, undefined, variables)
    },
    ...options,
  })
}
