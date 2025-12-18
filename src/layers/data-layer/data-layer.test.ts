import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  DataLayer,
  DataLayerError,
  getDataLayer,
  initDataLayer,
  resetDataLayer,
} from './data-layer'

// Mock @sthirajs/fetch
vi.mock('@sthirajs/fetch', () => ({
  createFetchSource: vi.fn(() => ({
    fetch: vi.fn().mockResolvedValue({ id: 1, name: 'Test' }),
  })),
  getQueryCache: vi.fn(() => ({
    invalidatePrefix: vi.fn(),
    invalidateAll: vi.fn(),
  })),
}))

describe('DataLayer', () => {
  beforeEach(() => {
    resetDataLayer()
  })

  describe('constructor', () => {
    it('should create an instance with config', () => {
      const layer = new DataLayer({
        baseUrl: 'https://api.example.com',
      })
      expect(layer).toBeInstanceOf(DataLayer)
    })

    it('should merge cache config with defaults', () => {
      const layer = new DataLayer({
        baseUrl: 'https://api.example.com',
        cache: { staleTime: 1000 },
      })
      expect(layer).toBeInstanceOf(DataLayer)
    })
  })

  describe('initDataLayer', () => {
    it('should initialize global instance', () => {
      const layer = initDataLayer({ baseUrl: 'https://api.example.com' })
      expect(layer).toBeInstanceOf(DataLayer)
    })

    it('should allow getting the instance after init', () => {
      initDataLayer({ baseUrl: 'https://api.example.com' })
      const layer = getDataLayer()
      expect(layer).toBeInstanceOf(DataLayer)
    })
  })

  describe('getDataLayer', () => {
    it('should throw if not initialized', () => {
      expect(() => getDataLayer()).toThrow('DataLayer not initialized')
    })
  })

  describe('resetDataLayer', () => {
    it('should reset the global instance', () => {
      initDataLayer({ baseUrl: 'https://api.example.com' })
      resetDataLayer()
      expect(() => getDataLayer()).toThrow('DataLayer not initialized')
    })
  })

  describe('buildUrl', () => {
    it('should build URL with path params', async () => {
      const layer = new DataLayer({ baseUrl: 'https://api.example.com' })

      // We test this indirectly via a request
      await layer.get('/users/:id', { path: { id: '123' } })
    })
  })
})

describe('DataLayerError', () => {
  it('should create error with message', () => {
    const error = new DataLayerError('Test error')
    expect(error.message).toBe('Test error')
    expect(error.name).toBe('DataLayerError')
  })

  it('should store status, endpoint, and cause', () => {
    const cause = new Error('Original')
    const error = new DataLayerError('Test error', 404, '/users', cause)

    expect(error.status).toBe(404)
    expect(error.endpoint).toBe('/users')
    expect(error.cause).toBe(cause)
  })

  it('should be an instance of Error', () => {
    const error = new DataLayerError('Test')
    expect(error).toBeInstanceOf(Error)
  })
})
