// ============================================================================
// API Error Classes - Typed error handling for API operations
// ============================================================================

/**
 * Base error class for all API-related errors.
 * Provides structured error information for better error handling and debugging.
 */
export class ApiError extends Error {
  /** HTTP status code */
  public readonly status: number
  /** HTTP status text */
  public readonly statusText: string
  /** The endpoint that was called */
  public readonly endpoint: string
  /** Optional response body */
  public readonly responseBody?: unknown
  /** Timestamp of when the error occurred */
  public readonly timestamp: Date

  constructor(status: number, statusText: string, endpoint: string, responseBody?: unknown) {
    super(`API Error ${status}: ${statusText} at ${endpoint}`)
    this.name = 'ApiError'
    this.status = status
    this.statusText = statusText
    this.endpoint = endpoint
    this.responseBody = responseBody
    this.timestamp = new Date()

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError)
    }
  }

  /**
   * Check if this is a client error (4xx status code)
   */
  get isClientError(): boolean {
    return this.status >= 400 && this.status < 500
  }

  /**
   * Check if this is a server error (5xx status code)
   */
  get isServerError(): boolean {
    return this.status >= 500
  }

  /**
   * Check if this is an authentication error (401)
   */
  get isUnauthorized(): boolean {
    return this.status === 401
  }

  /**
   * Check if this is a forbidden error (403)
   */
  get isForbidden(): boolean {
    return this.status === 403
  }

  /**
   * Check if this is a not found error (404)
   */
  get isNotFound(): boolean {
    return this.status === 404
  }

  /**
   * Convert to a plain object for logging or serialization
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      statusText: this.statusText,
      endpoint: this.endpoint,
      timestamp: this.timestamp.toISOString(),
      responseBody: this.responseBody,
    }
  }
}

/**
 * Error class for network-related failures (e.g., no internet, CORS issues)
 */
export class NetworkError extends Error {
  /** The endpoint that was being called */
  public readonly endpoint: string
  /** The original error */
  public readonly originalError: Error
  /** Timestamp of when the error occurred */
  public readonly timestamp: Date

  constructor(endpoint: string, originalError: Error) {
    super(`Network error while fetching ${endpoint}: ${originalError.message}`)
    this.name = 'NetworkError'
    this.endpoint = endpoint
    this.originalError = originalError
    this.timestamp = new Date()

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NetworkError)
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      endpoint: this.endpoint,
      originalError: this.originalError.message,
      timestamp: this.timestamp.toISOString(),
    }
  }
}

/**
 * Error class for configuration-related issues
 */
export class ConfigurationError extends Error {
  /** The configuration key that was invalid */
  public readonly configKey: string

  constructor(message: string, configKey: string) {
    super(message)
    this.name = 'ConfigurationError'
    this.configKey = configKey

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ConfigurationError)
    }
  }
}

/**
 * Type guard to check if an error is an ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

/**
 * Type guard to check if an error is a NetworkError
 */
export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError
}

/**
 * Type guard to check if an error is a ConfigurationError
 */
export function isConfigurationError(error: unknown): error is ConfigurationError {
  return error instanceof ConfigurationError
}
