import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clearRegistry,
  getComponent,
  getComponentTypes,
  hasComponent,
  listComponents,
  listComponentsByType,
  query,
  register,
  store,
  unregister,
} from './index'

describe('ComponentRegistry', () => {
  beforeEach(() => {
    clearRegistry()
  })

  describe('query factory', () => {
    it('should create a QueryRef with config', () => {
      const userQuery = query({ endpoint: '/users/:userId', params: ['userId'] })

      expect(userQuery.__querySymbol).toBeDefined()
      expect(typeof userQuery.__querySymbol).toBe('symbol')
      expect(userQuery.config.endpoint).toBe('/users/:userId')
      expect(userQuery.config.params).toEqual(['userId'])
    })
  })

  describe('store factory', () => {
    it('should create a StoreRef with config', () => {
      const counterStore = store({ initial: { count: 0 } })

      expect(counterStore.__storeSymbol).toBeDefined()
      expect(typeof counterStore.__storeSymbol).toBe('symbol')
      expect(counterStore.config.initial).toEqual({ count: 0 })
    })

    it('should support persist option', () => {
      const persistedStore = store({ initial: { value: '' }, persist: true })

      expect(persistedStore.config.persist).toBe(true)
    })
  })

  describe('register', () => {
    it('should register a component and return unique id', () => {
      const result = register('user-card', {
        type: 'data-display',
        component: () => Promise.resolve({ default: {} }),
      })

      expect(result.id).toBeDefined()
      expect(typeof result.id).toBe('symbol')
      expect(result.status).toBe('registered')
    })

    it('should register component with data and state bindings', () => {
      const userData = query({ endpoint: '/users/:id', params: ['id'] })
      const userState = store({ initial: { tab: 'info' } })

      const result = register('user-profile', {
        type: 'data-display',
        component: null,
        data: userData,
        state: userState,
      })

      expect(result.status).toBe('registered')
      expect(result.component.data).toBe(userData)
      expect(result.component.state).toBe(userState)
    })

    it('should throw error when registering duplicate key', () => {
      register('duplicate-test', { type: 'input', component: null })

      expect(() => {
        register('duplicate-test', { type: 'select', component: null })
      }).toThrow('Component "duplicate-test" is already registered')
    })
  })

  describe('getComponent', () => {
    it('should retrieve a registered component', () => {
      register('test-component', {
        type: 'input',
        component: null,
      })

      const retrieved = getComponent('test-component')

      expect(retrieved).toBeDefined()
      expect(retrieved?.type).toBe('input')
    })

    it('should return undefined for unregistered component', () => {
      expect(getComponent('non-existent')).toBeUndefined()
    })
  })

  describe('hasComponent', () => {
    it('should return true for registered component', () => {
      register('test-button', {
        type: 'action',
        component: null,
      })

      expect(hasComponent('test-button')).toBe(true)
    })

    it('should return false for unregistered component', () => {
      expect(hasComponent('non-existent')).toBe(false)
    })
  })

  describe('listComponents', () => {
    it('should return empty array when no components registered', () => {
      expect(listComponents()).toEqual([])
    })

    it('should return all registered components with keys', () => {
      register('comp-1', { type: 'input', component: null })
      register('comp-2', { type: 'select', component: null })

      const list = listComponents()
      expect(list).toHaveLength(2)
      expect(list.map((c) => c.key)).toContain('comp-1')
      expect(list.map((c) => c.key)).toContain('comp-2')
    })
  })

  describe('listComponentsByType', () => {
    it('should filter components by type', () => {
      register('form-input', { type: 'input', component: null })
      register('chart-bar', { type: 'chart', component: null })
      register('form-select', { type: 'input', component: null })

      const inputComponents = listComponentsByType('input')
      expect(inputComponents).toHaveLength(2)
      expect(inputComponents.every((c) => c.definition.type === 'input')).toBe(true)
    })
  })

  describe('getComponentTypes', () => {
    it('should return unique types', () => {
      register('c1', { type: 'input', component: null })
      register('c2', { type: 'input', component: null })
      register('c3', { type: 'chart', component: null })

      const types = getComponentTypes()
      expect(types).toHaveLength(2)
      expect(types).toContain('input')
      expect(types).toContain('chart')
    })
  })

  describe('unregister', () => {
    it('should remove a registered component', () => {
      register('to-remove', { type: 'input', component: null })

      expect(hasComponent('to-remove')).toBe(true)
      const result = unregister('to-remove')
      expect(result).toBe(true)
      expect(hasComponent('to-remove')).toBe(false)
    })

    it('should return false for non-existent component', () => {
      expect(unregister('non-existent')).toBe(false)
    })
  })

  describe('clearRegistry', () => {
    it('should remove all registered components', () => {
      register('c1', { type: 'input', component: null })
      register('c2', { type: 'select', component: null })

      expect(listComponents()).toHaveLength(2)
      clearRegistry()
      expect(listComponents()).toHaveLength(0)
    })
  })

  describe('resolveThemeBindings', () => {
    it('should resolve theme tokens from ThemeManager', async () => {
      const { resolveThemeBindings } = await import('./ComponentRegistry')

      register('themed-card', {
        type: 'card',
        component: null,
        theme: ['colors.primary', 'spacing.md'],
      })

      const mockThemeManager = {
        get: (path: string) => {
          if (path === 'colors.primary') return '#3b82f6'
          if (path === 'spacing.md') return '16px'
          return undefined
        },
        subscribe: () => () => {},
      }

      const result = resolveThemeBindings('themed-card', mockThemeManager)

      expect(result.tokens['colors.primary']).toBe('#3b82f6')
      expect(result.tokens['spacing.md']).toBe('16px')
      expect(typeof result.unsubscribe).toBe('function')
    })

    it('should call onChange when theme updates', async () => {
      const { resolveThemeBindings } = await import('./ComponentRegistry')

      register('reactive-card', {
        type: 'card',
        component: null,
        theme: ['colors.accent'],
      })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let capturedCallback: any = null
      const mockThemeManager = {
        get: () => '#ff0000',
        subscribe: (cb: (theme: object) => void) => {
          capturedCallback = cb
          return () => {}
        },
      }

      const onChange = vi.fn()
      resolveThemeBindings('reactive-card', mockThemeManager, onChange)

      // Simulate theme change
      capturedCallback({})

      expect(onChange).toHaveBeenCalledWith({ 'colors.accent': '#ff0000' })
    })
  })

  describe('createDerivedStore (signal-based)', () => {
    it('should compute derived value from signal sources', async () => {
      const { signal } = await import('@sthirajs/core')
      const { createDerivedStore } = await import('./ComponentRegistry')

      const count = signal(5)
      const multiplier = signal(2)

      const derived = createDerivedStore([count, multiplier], ([c, m]) => c * m)

      expect(derived.getValue()).toBe(10)
    })

    // Reactive re-computation now works with Sthira 0.3.2+
    it('should re-compute when signals change', async () => {
      const { signal } = await import('@sthirajs/core')
      const { createDerivedStore } = await import('./ComponentRegistry')

      const count = signal(1)
      const derived = createDerivedStore([count], ([c]) => c * 10)

      expect(derived.getValue()).toBe(10)

      count.set(5)
      expect(derived.getValue()).toBe(50)
    })

    it('should expose underlying computed signal', async () => {
      const { signal, isComputed } = await import('@sthirajs/core')
      const { createDerivedStore } = await import('./ComponentRegistry')

      const count = signal(5)
      const derived = createDerivedStore([count], ([c]) => c * 2)

      expect(isComputed(derived.signal)).toBe(true)
      expect(derived.signal.get()).toBe(10)
    })
  })

  describe('createLegacyDerivedStore', () => {
    it('should work with getState/subscribe pattern', async () => {
      const { createLegacyDerivedStore } = await import('./ComponentRegistry')

      const source = {
        getState: () => ({ count: 5 }),
        subscribe: () => () => {},
      }

      const derived = createLegacyDerivedStore([source], ([s]) => s.count * 2)

      expect(derived.getValue()).toBe(10)
    })

    it('should notify subscribers on change', async () => {
      const { createLegacyDerivedStore } = await import('./ComponentRegistry')

      let value = 1
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let callback: any = null

      const source = {
        getState: () => ({ value }),
        subscribe: (cb: () => void) => {
          callback = cb
          return () => {}
        },
      }

      const derived = createLegacyDerivedStore([source], ([s]) => s.value)
      const onChange = vi.fn()
      derived.subscribe(onChange)

      value = 42
      callback?.()

      expect(onChange).toHaveBeenCalledWith(42)
    })
  })
})
