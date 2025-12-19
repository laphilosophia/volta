// ============================================================================
// useVoltaComponent Tests
// ============================================================================

import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { clearRegistry, query, register, store } from '../../core/component-registry'
import * as voltaModule from '../../core/volta'
import { useVoltaComponent } from './useVoltaComponent'

// Mock Volta API
vi.mock('../../core/volta', async (importOriginal) => {
  const actual = await importOriginal<typeof voltaModule>()
  return {
    ...actual,
    query: vi.fn(),
    createStore: vi.fn((name, config) => ({
      name,
      config,
      getState: () => config.initialState,
      subscribe: () => () => {},
    })),
  }
})

describe('useVoltaComponent', () => {
  const mockQuery = vi.mocked(voltaModule.query)

  beforeEach(() => {
    clearRegistry()
    mockQuery.mockReset()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  // Mock ThemeManager
  const mockThemeManager = {
    get: (path: string) => {
      if (path === 'colors.primary') return '#blue'
      return undefined
    },
    subscribe: () => {
      return () => {}
    },
    loadTheme: vi.fn(),
    setTheme: vi.fn(),
  } as Parameters<typeof useVoltaComponent>[1] extends { themeManager?: infer T } ? T : never

  it('should resolve data bindings', async () => {
    const userData = query({ endpoint: '/users/:id', params: ['id'] })
    register('data-comp', {
      type: 'test',
      component: null,
      data: userData,
    })

    mockQuery.mockResolvedValueOnce({ name: 'User 1' })

    const { result } = renderHook(() =>
      useVoltaComponent('data-comp', {
        props: { id: 1 },
      })
    )

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toEqual({ default: { name: 'User 1' } })
    expect(mockQuery).toHaveBeenCalledWith('/users/1', expect.anything())
  })

  it('should resolve theme bindings', () => {
    register('theme-comp', {
      type: 'test',
      component: null,
      theme: ['colors.primary'],
    })

    const { result } = renderHook(() =>
      useVoltaComponent('theme-comp', {
        themeManager: mockThemeManager,
      })
    )

    expect(result.current.theme).toEqual({ 'colors.primary': '#blue' })
  })

  it('should resolve state bindings', async () => {
    const counterStore = store({ initial: { count: 0 } })
    register('state-comp', {
      type: 'test',
      component: null,
      state: { counter: counterStore },
    })

    const { result } = renderHook(() => useVoltaComponent('state-comp'))

    await waitFor(() => {
      expect(result.current.state).toHaveProperty('counter')
    })

    const resolvedStore = result.current.state['counter'] as {
      config: { initialState: unknown }
      name: string
    }
    expect(resolvedStore.config.initialState).toEqual({ count: 0 })
    // Ensure store name is scoped (contains instance ID)
    expect(resolvedStore.name).toMatch(/state-comp\/.*\/counter/)
  })

  it('should manage instance lifecycle', async () => {
    register('lifecycle-comp', {
      type: 'test',
      component: null,
      state: store({ initial: {} }),
    })

    const { unmount } = renderHook(() => useVoltaComponent('lifecycle-comp'))

    // Just creating the hook should register an instance
    // We can't easily check internal instances map, but we can check if state binding works
    // which implies instance creation.

    // However, we can use getInstanceCount from registry if we exported it
    const { getInstanceCount } = await import('../../core/component-registry')
    expect(getInstanceCount()).toBe(1)

    unmount()

    // Should be cleaned up
    expect(getInstanceCount()).toBe(0)
  })
})
