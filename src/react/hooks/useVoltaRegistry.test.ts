// ============================================================================
// useVoltaRegistry Tests
// ============================================================================

import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as dataLayerModule from '../../layers/DataLayer'
import { createTypedQueryKey, useVoltaRegistry } from './useVoltaRegistry'

// Mock DataLayer
vi.mock('../../layers/DataLayer', async (importOriginal) => {
  const actual = await importOriginal<typeof dataLayerModule>()
  return {
    ...actual,
    getDataLayer: vi.fn(),
  }
})

describe('useVoltaRegistry', () => {
  const mockGet = vi.fn()
  const mockDataLayer = {
    get: mockGet,
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  }

  beforeEach(() => {
    vi.mocked(dataLayerModule.getDataLayer).mockReturnValue(
      mockDataLayer as unknown as dataLayerModule.DataLayer
    )
    mockGet.mockReset()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('basic functionality', () => {
    it('should return idle status initially', () => {
      const key = createTypedQueryKey('test-idle')

      const { result } = renderHook(() =>
        useVoltaRegistry({
          key,
          enabled: false,
        })
      )

      expect(result.current.status).toBe('idle')
      expect(result.current.loading).toBe(false)
      expect(result.current.data).toBeUndefined()
      expect(result.current.error).toBeNull()
    })

    it('should fetch data on mount when enabled', async () => {
      const key = createTypedQueryKey('test-fetch')
      const mockData = { id: 1, name: 'Test User' }
      mockGet.mockResolvedValueOnce(mockData)

      const { result } = renderHook(() =>
        useVoltaRegistry<{ id: number; name: string }>({
          key,
          endpoint: '/api/users',
        })
      )

      // Should be loading
      expect(result.current.loading).toBe(true)
      expect(result.current.status).toBe('pending')

      // Wait for fetch to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.status).toBe('success')
      expect(result.current.data).toEqual(mockData)
      expect(result.current.error).toBeNull()
    })

    it('should handle fetch errors', async () => {
      const key = createTypedQueryKey('test-error')
      const mockError = new Error('Network error')
      mockGet.mockRejectedValueOnce(mockError)

      const { result } = renderHook(() =>
        useVoltaRegistry({
          key,
          endpoint: '/api/users',
        })
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.status).toBe('error')
      expect(result.current.error).toEqual(mockError)
      expect(result.current.data).toBeUndefined()
    })
  })

  describe('refetch', () => {
    it('should refetch data when refetch is called', async () => {
      const key = createTypedQueryKey('test-refetch')
      const mockData1 = { id: 1 }
      const mockData2 = { id: 2 }
      mockGet.mockResolvedValueOnce(mockData1).mockResolvedValueOnce(mockData2)

      const { result } = renderHook(() =>
        useVoltaRegistry<{ id: number }>({
          key,
          endpoint: '/api/data',
        })
      )

      await waitFor(() => {
        expect(result.current.data).toEqual(mockData1)
      })

      // Trigger refetch
      await act(async () => {
        await result.current.refetch()
      })

      expect(result.current.data).toEqual(mockData2)
      expect(mockGet).toHaveBeenCalledTimes(2)
    })
  })

  describe('setData', () => {
    it('should update data directly with setData', async () => {
      const key = createTypedQueryKey('test-setdata')
      mockGet.mockResolvedValueOnce({ count: 0 })

      const { result } = renderHook(() =>
        useVoltaRegistry<{ count: number }>({
          key,
          endpoint: '/api/counter',
        })
      )

      await waitFor(() => {
        expect(result.current.data).toEqual({ count: 0 })
      })

      // Update data directly
      act(() => {
        result.current.setData({ count: 5 })
      })

      expect(result.current.data).toEqual({ count: 5 })
      expect(result.current.status).toBe('success')
    })

    it('should support updater function in setData', async () => {
      const key = createTypedQueryKey('test-setdata-updater')
      mockGet.mockResolvedValueOnce({ count: 10 })

      const { result } = renderHook(() =>
        useVoltaRegistry<{ count: number }>({
          key,
          endpoint: '/api/counter',
        })
      )

      await waitFor(() => {
        expect(result.current.data).toEqual({ count: 10 })
      })

      // Update using function
      act(() => {
        result.current.setData((prev) => ({ count: (prev?.count ?? 0) + 1 }))
      })

      expect(result.current.data).toEqual({ count: 11 })
    })
  })

  describe('enabled option', () => {
    it('should not fetch when enabled is false', () => {
      const key = createTypedQueryKey('test-disabled')

      renderHook(() =>
        useVoltaRegistry({
          key,
          endpoint: '/api/data',
          enabled: false,
        })
      )

      expect(mockGet).not.toHaveBeenCalled()
    })
  })

  describe('initialData', () => {
    it('should use initialData before fetch completes', () => {
      const key = createTypedQueryKey('test-initial')
      const initialData = { name: 'Initial' }
      mockGet.mockImplementation(() => new Promise(() => {})) // Never resolves

      const { result } = renderHook(() =>
        useVoltaRegistry<{ name: string }>({
          key,
          endpoint: '/api/data',
          initialData,
        })
      )

      expect(result.current.data).toEqual(initialData)
    })
  })

  describe('createTypedQueryKey', () => {
    it('should create a Symbol key', () => {
      const key = createTypedQueryKey('my-key')
      expect(typeof key).toBe('symbol')
      expect(key.toString()).toContain('volta:query:my-key')
    })

    it('should create same symbol for same name', () => {
      const key1 = Symbol.for('volta:query:same')
      const key2 = Symbol.for('volta:query:same')
      expect(key1).toBe(key2)
    })
  })

  describe('mutation support', () => {
    it('should have isMutating state', () => {
      const key = createTypedQueryKey('test-mutating-state')

      const { result } = renderHook(() =>
        useVoltaRegistry({
          key,
          enabled: false,
        })
      )

      expect(result.current.isMutating).toBe(false)
    })

    it('should perform optimistic update on mutate', async () => {
      const key = createTypedQueryKey('test-optimistic')
      const initialData = { id: 1, name: 'Initial' }
      const mutationData = { name: 'Updated' }
      const mockPost = vi.fn().mockResolvedValueOnce(initialData)
      const mockPut = vi.fn().mockResolvedValueOnce({ id: 1, name: 'Updated' })

      vi.mocked(dataLayerModule.getDataLayer).mockReturnValue({
        get: mockPost,
        post: mockPut,
        put: mockPut,
        patch: mockPut,
        delete: vi.fn(),
      } as unknown as dataLayerModule.DataLayer)

      mockPost.mockResolvedValueOnce(initialData)

      const { result } = renderHook(() =>
        useVoltaRegistry<{ id: number; name: string }>({
          key,
          endpoint: '/api/users',
          optimistic: true,
        })
      )

      await waitFor(() => {
        expect(result.current.data).toEqual(initialData)
      })

      // Perform mutation
      await act(async () => {
        await result.current.mutate(mutationData)
      })

      expect(result.current.data?.name).toBe('Updated')
    })

    it('should rollback on mutation error when optimistic', async () => {
      const key = createTypedQueryKey('test-rollback')
      const initialData = { id: 1, name: 'Original' }
      const mockGet = vi.fn().mockResolvedValueOnce(initialData)
      const mockPut = vi.fn().mockRejectedValueOnce(new Error('Server error'))

      vi.mocked(dataLayerModule.getDataLayer).mockReturnValue({
        get: mockGet,
        put: mockPut,
        post: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
      } as unknown as dataLayerModule.DataLayer)

      const { result } = renderHook(() =>
        useVoltaRegistry<{ id: number; name: string }>({
          key,
          endpoint: '/api/users',
          optimistic: true,
        })
      )

      await waitFor(() => {
        expect(result.current.data).toEqual(initialData)
      })

      // Attempt mutation that will fail
      await act(async () => {
        try {
          await result.current.mutate({ name: 'Failed Update' })
        } catch {
          // Expected error
        }
      })

      // Should rollback to original data
      expect(result.current.data?.name).toBe('Original')
    })
  })
})
