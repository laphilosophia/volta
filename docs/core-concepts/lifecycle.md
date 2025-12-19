# Lifecycle

Volta provides lifecycle management for controlling its operational state.

## Status Flow

```
idle → running ⇄ held → destroyed
        ↓                   ↑
        └───────────────────┘
```

| Status      | Description                               |
| ----------- | ----------------------------------------- |
| `idle`      | Initial state, not initialized            |
| `running`   | Normal operation, requests processed      |
| `held`      | Paused, requests queued but not processed |
| `destroyed` | Cleaned up, must reinitialize to use      |

## Functions

### getVoltaStatus()

Get the current lifecycle status.

```typescript
import { getVoltaStatus } from '@voltakit/volta'

const status = getVoltaStatus()
// 'idle' | 'running' | 'held' | 'destroyed'
```

### isVoltaReady()

Check if Volta is ready for operations.

```typescript
import { isVoltaReady } from '@voltakit/volta'

if (isVoltaReady()) {
  const data = await query('/users')
}
```

### holdVolta()

Pause Volta operations. Requests are queued but not sent.

```typescript
import { holdVolta } from '@voltakit/volta'

// Pause for maintenance or navigation
holdVolta()

// Requests made while held are queued
query('/users') // Queued, not sent
```

**Use Cases:**

- App going to background
- Auth token refresh in progress
- Page transitions

### resumeVolta()

Resume operations after hold. Queued requests are processed.

```typescript
import { resumeVolta } from '@voltakit/volta'

// Resume and process queued requests
resumeVolta()
```

### destroyVolta()

Clean up all resources. Requires reinitialization to use again.

```typescript
import { destroyVolta, initVolta } from '@voltakit/volta'

// Clean up
destroyVolta()

// Reinitialize if needed
initVolta({ baseUrl: '...' })
```

**What gets cleaned:**

- Request queue cleared
- Cache cleared
- State stores destroyed
- Data layer reset

## Request Queue

While in `running` status, Volta maintains a request queue with:

- **Priority**: Mutations (priority 10) before queries (priority 0)
- **Deduplication**: Duplicate queries merged
- **Offline Support**: Auto-queue when offline, process when online

```typescript
import { getPendingRequestCount, isNetworkOnline } from '@voltakit/volta'

console.log(getPendingRequestCount()) // Pending requests
console.log(isNetworkOnline()) // Network status
```

## Patterns

### Auth Token Refresh

```typescript
async function refreshToken() {
  holdVolta()

  try {
    const newToken = await fetchNewToken()
    // Reinitialize with new token
    destroyVolta()
    initVolta({
      baseUrl: '...',
      headers: { Authorization: `Bearer ${newToken}` },
    })
  } finally {
    resumeVolta()
  }
}
```

### App Background/Foreground

```typescript
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    holdVolta()
  } else {
    resumeVolta()
  }
})
```

### Cleanup on Unmount (SPA)

```typescript
// cleanup.ts
export function cleanupVolta() {
  destroyVolta()
}

// Use in your app's cleanup logic
window.addEventListener('beforeunload', cleanupVolta)
```

## Error Handling

Calling lifecycle functions in wrong states throws errors:

```typescript
// ❌ Error: Cannot initialize Volta in "running" status
initVolta({ ... })  // Already running

// ❌ Error: Volta must be running to hold
holdVolta()  // Already held or destroyed

// ❌ Error: Cannot query: Volta is not initialized
query('/users')  // Before initVolta()
```

## Next Steps

- [Initialization](../getting-started/initialization.md) - Configure Volta
- [Vanilla API](vanilla-api.md) - Data operations
