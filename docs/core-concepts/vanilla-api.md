# Vanilla API

Volta provides a framework-agnostic API for data operations. These functions work in any JavaScript environment—Node.js, browsers, or frameworks like React, Vue, and Svelte.

## Overview

```typescript
import { query, mutate, invalidate } from '@voltakit/volta'

// Fetch data
const users = await query<User[]>('/users')

// Create/update data
const newUser = await mutate<User>('/users', { name: 'John' })

// Invalidate cache
invalidate('/users')
```

## query()

Fetch data from an endpoint with automatic caching.

### Signature

```typescript
function query<T>(endpoint: string, options?: QueryOptions): Promise<T>
```

### Basic Usage

```typescript
// Simple GET request
const users = await query<User[]>('/users')

// With path parameters
const user = await query<User>('/users/:id', {
  path: { id: '123' },
})
// Resolves to: GET /users/123
```

### Options

```typescript
interface QueryOptions {
  /** Path parameters to substitute in endpoint */
  path?: Record<string, string | number>

  /** Override retry config for this request */
  retry?: RetryConfig | false

  /** Override timeout (ms) */
  timeout?: number

  /** AbortSignal for cancellation */
  signal?: AbortSignal
}
```

### With AbortController

```typescript
const controller = new AbortController()

// Start request
const promise = query<User[]>('/users', {
  signal: controller.signal,
})

// Cancel if needed
controller.abort()
```

### Caching Behavior

- First request fetches from server and caches result
- Subsequent requests return cached data if not stale
- Stale data triggers background refetch
- Configure via `cache` option in `initVolta()`

## mutate()

Create, update, or delete data.

### Signature

```typescript
function mutate<T>(endpoint: string, data?: unknown, options?: MutateOptions): Promise<T>
```

### Basic Usage

```typescript
// POST (default)
const newUser = await mutate<User>('/users', {
  name: 'John',
  email: 'john@example.com',
})

// PUT
await mutate('/users/123', { name: 'Jane' }, { method: 'PUT' })

// PATCH
await mutate('/users/123', { name: 'Jane' }, { method: 'PATCH' })

// DELETE
await mutate('/users/123', undefined, { method: 'DELETE' })
```

### Options

```typescript
interface MutateOptions extends QueryOptions {
  /** HTTP method (default: POST) */
  method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE'

  /** Endpoints to invalidate after success */
  invalidates?: string[]
}
```

### Auto-Invalidation

```typescript
// Create user and invalidate users list
await mutate('/users', userData, {
  invalidates: ['/users'], // Clears /users cache
})
```

## invalidate()

Manually invalidate cached data.

### Signature

```typescript
function invalidate(pattern: string): void
```

### Usage

```typescript
// Invalidate exact endpoint
invalidate('/users')

// Invalidate by prefix (matches /users, /users/123, etc.)
invalidate('/users')

// Invalidate all user-related cache
invalidate('/api/v1/users')
```

## Request Queue

Volta automatically manages a request queue with:

- **Priority**: Mutations have higher priority than queries
- **Deduplication**: Duplicate queries are merged
- **Offline Support**: Requests queue when offline, process when online

```typescript
import { getPendingRequestCount, isNetworkOnline } from '@voltakit/volta'

console.log(getPendingRequestCount()) // Number of queued requests
console.log(isNetworkOnline()) // Network status
```

## Error Handling

```typescript
try {
  const user = await query<User>('/users/999')
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('Request was cancelled')
  } else {
    console.error('Request failed:', error.message)
  }
}
```

## TypeScript

Full generic support for type-safe responses:

```typescript
interface User {
  id: string
  name: string
  email: string
}

// Type-safe response
const user = await query<User>('/users/123')
user.name // string
user.foo // ❌ TypeScript error
```

## Next Steps

- [Component Registry](component-registry.md) - Register components with data bindings
- [Lifecycle](lifecycle.md) - Control Volta lifecycle
