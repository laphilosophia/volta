import { beforeEach, describe, expect, it, vi } from 'vitest'
import { StateLayer, getStateLayer, initStateLayer, resetStateLayer } from './state-layer'

// Mock @sthirajs packages
vi.mock('@sthirajs/core', () => ({
  createStore: vi.fn((config) => ({
    getState: vi.fn(() => config.state),
    subscribe: vi.fn(() => () => {}),
    actions: {},
  })),
}))

vi.mock('@sthirajs/devtools', () => ({
  createDevToolsPlugin: vi.fn(() => ({ name: 'devtools', version: '1.0.0' })),
}))

vi.mock('@sthirajs/cross-tab', () => ({
  createSyncPlugin: vi.fn(() => ({ name: 'sync', version: '1.0.0' })),
}))

describe('StateLayer', () => {
  beforeEach(() => {
    resetStateLayer()
  })

  describe('constructor', () => {
    it('should create with default config', () => {
      const layer = new StateLayer()
      expect(layer).toBeInstanceOf(StateLayer)
    })

    it('should accept custom config', () => {
      const layer = new StateLayer({
        enableDevTools: false,
        enableCrossTab: true,
        namespace: 'test',
      })
      expect(layer).toBeInstanceOf(StateLayer)
    })
  })

  describe('createStore', () => {
    it('should create a store with initial state', () => {
      const layer = new StateLayer({ enableDevTools: false })
      const store = layer.createStore('test', {
        initialState: { count: 0 },
      })
      expect(store).toBeDefined()
      expect(store.getState()).toEqual({ count: 0 })
    })

    it('should throw if store already exists', () => {
      const layer = new StateLayer({ enableDevTools: false })
      layer.createStore('test', { initialState: { count: 0 } })

      expect(() => {
        layer.createStore('test', { initialState: { count: 0 } })
      }).toThrow('Store "test" already exists')
    })
  })

  describe('getStore', () => {
    it('should return undefined for non-existent store', () => {
      const layer = new StateLayer({ enableDevTools: false })
      expect(layer.getStore('nonexistent')).toBeUndefined()
    })

    it('should return existing store', () => {
      const layer = new StateLayer({ enableDevTools: false })
      layer.createStore('test', { initialState: { count: 0 } })
      const store = layer.getStore('test')
      expect(store).toBeDefined()
    })
  })

  describe('hasStore', () => {
    it('should return false for non-existent store', () => {
      const layer = new StateLayer({ enableDevTools: false })
      expect(layer.hasStore('nonexistent')).toBe(false)
    })

    it('should return true for existing store', () => {
      const layer = new StateLayer({ enableDevTools: false })
      layer.createStore('test', { initialState: { count: 0 } })
      expect(layer.hasStore('test')).toBe(true)
    })
  })

  describe('destroyStore', () => {
    it('should remove existing store', () => {
      const layer = new StateLayer({ enableDevTools: false })
      layer.createStore('test', { initialState: { count: 0 } })
      const result = layer.destroyStore('test')
      expect(result).toBe(true)
      expect(layer.hasStore('test')).toBe(false)
    })

    it('should return false for non-existent store', () => {
      const layer = new StateLayer({ enableDevTools: false })
      const result = layer.destroyStore('nonexistent')
      expect(result).toBe(false)
    })
  })

  describe('getStoreNames', () => {
    it('should return empty array when no stores', () => {
      const layer = new StateLayer({ enableDevTools: false })
      expect(layer.getStoreNames()).toEqual([])
    })

    it('should return all store names', () => {
      const layer = new StateLayer({ enableDevTools: false })
      layer.createStore('store1', { initialState: {} })
      layer.createStore('store2', { initialState: {} })
      const names = layer.getStoreNames()
      expect(names).toHaveLength(2)
      expect(names).toContain('volta/store1')
      expect(names).toContain('volta/store2')
    })
  })

  describe('destroyAll', () => {
    it('should remove all stores', () => {
      const layer = new StateLayer({ enableDevTools: false })
      layer.createStore('store1', { initialState: {} })
      layer.createStore('store2', { initialState: {} })
      layer.destroyAll()
      expect(layer.getStoreNames()).toEqual([])
    })
  })

  describe('initStateLayer', () => {
    it('should initialize global instance', () => {
      const layer = initStateLayer({ enableDevTools: false })
      expect(layer).toBeInstanceOf(StateLayer)
    })
  })

  describe('getStateLayer', () => {
    it('should throw if not initialized', () => {
      expect(() => getStateLayer()).toThrow('StateLayer not initialized')
    })

    it('should return instance after init', () => {
      initStateLayer({ enableDevTools: false })
      const layer = getStateLayer()
      expect(layer).toBeInstanceOf(StateLayer)
    })
  })

  describe('resetStateLayer', () => {
    it('should reset the global instance', () => {
      initStateLayer({ enableDevTools: false })
      resetStateLayer()
      expect(() => getStateLayer()).toThrow('StateLayer not initialized')
    })
  })
})
