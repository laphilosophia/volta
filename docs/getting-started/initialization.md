# Initialization

Before using Volta's data operations, you must initialize it with your configuration.

## Basic Setup

```typescript
import { initVolta } from '@voltakit/volta'

initVolta({
  baseUrl: 'https://api.example.com',
})
```

## Full Configuration

```typescript
import { initVolta } from '@voltakit/volta'

initVolta({
  // Required: Base URL for all API requests
  baseUrl: 'https://api.example.com',

  // Optional: Default headers for all requests
  headers: {
    Authorization: `Bearer ${token}`,
    'X-API-Version': '2024-01',
  },

  // Optional: Cache configuration
  cache: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  },

  // Optional: Retry configuration
  retry: {
    maxRetries: 3,
    retryDelay: 1000,
    retryOn: [500, 502, 503, 504],
  },

  // Optional: Request timeout (default: 30000ms)
  timeout: 30000,

  // Optional: Enable DevTools integration (development only)
  enableDevTools: process.env.NODE_ENV === 'development',

  // Optional: Enable cross-tab state synchronization
  enableCrossTab: true,

  // Optional: Namespace for state stores (default: 'volta')
  namespace: 'my-app',
})
```

## Configuration Options

| Option             | Type                     | Default      | Description                                |
| ------------------ | ------------------------ | ------------ | ------------------------------------------ |
| `baseUrl`          | `string`                 | **required** | Base URL for API requests                  |
| `headers`          | `Record<string, string>` | `{}`         | Default headers for all requests           |
| `cache.staleTime`  | `number`                 | `300000`     | Time before data is considered stale (ms)  |
| `cache.cacheTime`  | `number`                 | `1800000`    | Time before data is garbage collected (ms) |
| `retry.maxRetries` | `number`                 | `3`          | Maximum retry attempts                     |
| `retry.retryDelay` | `number`                 | `1000`       | Delay between retries (ms)                 |
| `timeout`          | `number`                 | `30000`      | Request timeout (ms)                       |
| `enableDevTools`   | `boolean`                | `false`      | Enable DevTools integration                |
| `enableCrossTab`   | `boolean`                | `false`      | Enable cross-tab sync                      |
| `namespace`        | `string`                 | `'volta'`    | Namespace for state stores                 |

## Lifecycle Status

Check Volta's current status:

```typescript
import { getVoltaStatus, isVoltaReady } from '@voltakit/volta'

if (isVoltaReady()) {
  // Safe to use query/mutate
}

const status = getVoltaStatus()
// 'idle' | 'running' | 'held' | 'destroyed'
```

## React Integration

For React apps, initialize Volta before rendering:

```tsx
// main.tsx
import { initVolta } from '@voltakit/volta'
import { createRoot } from 'react-dom/client'
import App from './App'

// Initialize before render
initVolta({
  baseUrl: import.meta.env.VITE_API_URL,
  enableDevTools: import.meta.env.DEV,
})

createRoot(document.getElementById('root')!).render(<App />)
```

## Next Steps

- [Vanilla API](../core-concepts/vanilla-api.md) - Learn `query()` and `mutate()`
- [Component Registry](../core-concepts/component-registry.md) - Register components with bindings
