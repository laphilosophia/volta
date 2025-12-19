# Volta Architecture

> **Volta is a toolkit for building low-code/no-code platforms.**

## Overview

Volta provides a **layered architecture** with clear separation between framework-agnostic core and framework-specific adapters.

```
┌─────────────────────────────────────────────────────────┐
│                    Your Application                      │
├─────────────────────────────────────────────────────────┤
│                    React Adapter                         │
│  (useVoltaComponent, useVoltaRegistry, useVoltaStore)    │
├─────────────────────────────────────────────────────────┤
│                     Volta Core                           │
│     (query, mutate, register, createDerivedStore)        │
├─────────────────────────────────────────────────────────┤
│                   Internal Layers                        │
│       (ThemeManager, DataLayer, StateLayer)              │
├─────────────────────────────────────────────────────────┤
│                   @sthirajs/core                         │
│        (signal, computed, effect, batch)                 │
└─────────────────────────────────────────────────────────┘
```

## Initialization

All Volta features are initialized through a single entry point:

```typescript
import { initVolta } from '@voltakit/volta'

initVolta({
  baseUrl: 'https://api.example.com',
  headers: { Authorization: 'Bearer token' },
  enableDevTools: true,
  enableCrossTab: true,
})
```

## Vanilla API

Framework-agnostic data operations:

```typescript
import { query, mutate, invalidate } from '@voltakit/volta'

// Fetch data
const users = await query<User[]>('/users')
const user = await query<User>('/users/:id', { path: { id: '123' } })

// Mutate data
const newUser = await mutate<User>('/users', { name: 'John' })
await mutate('/users/123', { name: 'Updated' }, { method: 'PUT' })

// Invalidate cache
invalidate('/users')
```

## Component Registry

Declarative component registration with data/state/theme bindings:

```typescript
import { query, store, register } from '@voltakit/volta'

// Data binding (lazy fetch)
const userData = query({
  endpoint: '/users/:userId',
  params: ['userId'],
})

// State binding (scoped store)
const userState = store({
  initial: { activeTab: 'info' },
})

// Register component
register('user-card', {
  type: 'data-display',
  component: () => import('./components/UserCard'),
  data: userData,
  state: userState,
  theme: ['colors.primary', 'colors.background'],
})
```

### Registry Access

```typescript
import { getComponent, listComponents, hasComponent } from '@voltakit/volta'

const definition = getComponent('user-card')
const components = listComponents()
const exists = hasComponent('user-card')
```

### Binding Resolution

```typescript
import { resolveDataBindings, resolveStateBindings, resolveThemeBindings } from '@voltakit/volta'

// Resolve data with AbortController
const { data, status, error } = await resolveDataBindings(
  'user-card',
  { userId: '123' },
  abortController.signal
)

// Resolve scoped stores
const stores = await resolveStateBindings('user-card', instanceId)

// Subscribe to theme tokens
const { tokens, unsubscribe } = resolveThemeBindings('user-card', themeManager, (newTokens) =>
  console.log('Theme changed:', newTokens)
)
```

## Signal-Based Derived Stores

Create reactive derived values using Sthira signals:

```typescript
import { signal } from '@sthirajs/core'
import { createDerivedStore } from '@voltakit/volta'

const count = signal(5)
const multiplier = signal(2)

const derived = createDerivedStore([count, multiplier], ([c, m]) => c * m)

console.log(derived.getValue()) // 10

count.set(10)
console.log(derived.getValue()) // 20

// Access underlying ComputedSignal
derived.signal.get()

// Subscribe to changes
const unsubscribe = derived.subscribe((value) => console.log(value))

// Cleanup
derived.destroy()
```

## ThemeManager

Generic theming with CSS variables and multi-tenant support:

```typescript
import { createThemeManager } from '@voltakit/volta'

const themeManager = createThemeManager({
  defaultTheme: { colors: { brand: '#3B82F6' } },
  cssVariables: (theme) => ({
    '--color-brand': theme.colors.brand,
  }),
})

// Load tenant theme from CDN
await themeManager.loadTheme('https://cdn.example.com/themes/tenant-123.json')
```

## React Adapter

### useVoltaComponent

Auto-resolve data, state, and theme bindings for registered components:

```tsx
import { react } from '@voltakit/volta'
const { useVoltaComponent } = react

function UserCard({ userId }: { userId: string }) {
  const { data, state, theme, isLoading, error } = useVoltaComponent('user-card', {
    props: { userId },
    themeManager,
  })

  if (isLoading) return <Spinner />

  return <div style={{ color: theme['colors.primary'] }}>{data.user?.name}</div>
}
```

### useVoltaRegistry

Unified hook for query and mutation operations:

```tsx
const { data, mutate, remove } = useVoltaRegistry<User>({
  endpoint: `/users/${userId}`,
})
```

## Lifecycle Management

Control Volta's operational state:

```typescript
import { holdVolta, resumeVolta, destroyVolta, getVoltaStatus } from '@voltakit/volta'

holdVolta() // Pause operations (requests queue)
resumeVolta() // Resume and process queue
destroyVolta() // Cleanup all resources
getVoltaStatus() // 'idle' | 'running' | 'held' | 'destroyed'
```

## Internal Layers

> **Note**: DataLayer and StateLayer are internal implementation details. Use the Volta API (`query`, `mutate`, `createStore`) instead of accessing layers directly.

- **DataLayer**: Handles HTTP requests, caching, and request queuing
- **StateLayer**: Manages stores, devtools integration, and cross-tab sync
- **ThemeManager**: The only layer with public API (for theming)

## Design Principles

1. **Vanilla-First**: Core logic is framework-agnostic
2. **Signal Integration**: Built on Sthira signals for reactivity
3. **Layered Architecture**: Clear separation of concerns
4. **Type-safe**: Full TypeScript generics support
5. **Multi-tenant Ready**: CDN-based tenant theme loading

## Further Reading

- [Getting Started](getting-started/installation.md)
- [Vanilla API](core-concepts/vanilla-api.md)
- [Component Registry](core-concepts/component-registry.md)
- [React Hooks](react/hooks.md)
