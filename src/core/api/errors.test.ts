import { describe, expect, it } from 'vitest'
import {
  ApiError,
  ConfigurationError,
  isApiError,
  isConfigurationError,
  isNetworkError,
  NetworkError,
} from './errors'

describe('ApiError', () => {
  const createApiError = () =>
    new ApiError(404, 'Not Found', 'getUser', { error: 'User not found' })

  it('should create error with correct properties', () => {
    const error = createApiError()

    expect(error.status).toBe(404)
    expect(error.statusText).toBe('Not Found')
    expect(error.endpoint).toBe('getUser')
    expect(error.responseBody).toEqual({ error: 'User not found' })
    expect(error.timestamp).toBeInstanceOf(Date)
    expect(error.name).toBe('ApiError')
    expect(error.message).toBe('API Error 404: Not Found at getUser')
  })

  describe('status check getters', () => {
    it('isClientError should return true for 4xx status', () => {
      expect(new ApiError(400, 'Bad Request', 'test').isClientError).toBe(true)
      expect(new ApiError(404, 'Not Found', 'test').isClientError).toBe(true)
      expect(new ApiError(499, 'Client Error', 'test').isClientError).toBe(true)
      expect(new ApiError(500, 'Server Error', 'test').isClientError).toBe(false)
    })

    it('isServerError should return true for 5xx status', () => {
      expect(new ApiError(500, 'Internal Server Error', 'test').isServerError).toBe(true)
      expect(new ApiError(503, 'Service Unavailable', 'test').isServerError).toBe(true)
      expect(new ApiError(400, 'Bad Request', 'test').isServerError).toBe(false)
    })

    it('isUnauthorized should return true only for 401', () => {
      expect(new ApiError(401, 'Unauthorized', 'test').isUnauthorized).toBe(true)
      expect(new ApiError(403, 'Forbidden', 'test').isUnauthorized).toBe(false)
    })

    it('isForbidden should return true only for 403', () => {
      expect(new ApiError(403, 'Forbidden', 'test').isForbidden).toBe(true)
      expect(new ApiError(401, 'Unauthorized', 'test').isForbidden).toBe(false)
    })

    it('isNotFound should return true only for 404', () => {
      expect(new ApiError(404, 'Not Found', 'test').isNotFound).toBe(true)
      expect(new ApiError(400, 'Bad Request', 'test').isNotFound).toBe(false)
    })
  })

  it('toJSON should return serializable object', () => {
    const error = createApiError()
    const json = error.toJSON()

    expect(json.name).toBe('ApiError')
    expect(json.status).toBe(404)
    expect(json.statusText).toBe('Not Found')
    expect(json.endpoint).toBe('getUser')
    expect(json.responseBody).toEqual({ error: 'User not found' })
    expect(typeof json.timestamp).toBe('string')
  })
})

describe('NetworkError', () => {
  it('should create error with correct properties', () => {
    const originalError = new Error('Network failure')
    const error = new NetworkError('getUser', originalError)

    expect(error.endpoint).toBe('getUser')
    expect(error.originalError).toBe(originalError)
    expect(error.timestamp).toBeInstanceOf(Date)
    expect(error.name).toBe('NetworkError')
    expect(error.message).toBe('Network error while fetching getUser: Network failure')
  })

  it('toJSON should return serializable object', () => {
    const originalError = new Error('Network failure')
    const error = new NetworkError('getUser', originalError)
    const json = error.toJSON()

    expect(json.name).toBe('NetworkError')
    expect(json.endpoint).toBe('getUser')
    expect(json.originalError).toBe('Network failure')
    expect(typeof json.timestamp).toBe('string')
  })
})

describe('ConfigurationError', () => {
  it('should create error with correct properties', () => {
    const error = new ConfigurationError('Invalid endpoint', 'endpoints.getUser')

    expect(error.configKey).toBe('endpoints.getUser')
    expect(error.name).toBe('ConfigurationError')
    expect(error.message).toBe('Invalid endpoint')
  })
})

describe('Type guards', () => {
  it('isApiError should correctly identify ApiError', () => {
    expect(isApiError(new ApiError(404, 'Not Found', 'test'))).toBe(true)
    expect(isApiError(new Error('test'))).toBe(false)
    expect(isApiError(null)).toBe(false)
    expect(isApiError(undefined)).toBe(false)
  })

  it('isNetworkError should correctly identify NetworkError', () => {
    expect(isNetworkError(new NetworkError('test', new Error('fail')))).toBe(true)
    expect(isNetworkError(new Error('test'))).toBe(false)
    expect(isNetworkError(null)).toBe(false)
  })

  it('isConfigurationError should correctly identify ConfigurationError', () => {
    expect(isConfigurationError(new ConfigurationError('msg', 'key'))).toBe(true)
    expect(isConfigurationError(new Error('test'))).toBe(false)
    expect(isConfigurationError(null)).toBe(false)
  })
})
