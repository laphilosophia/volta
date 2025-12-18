# Volta Architecture

> **Volta is a toolkit for building low-code/no-code platforms.**

## Overview

Volta provides a **layered architecture** with clear separation between framework-agnostic core and framework-specific adapters.

```
┌─────────────────────────────────────────────────────────┐
│                    Your Application                      │
├─────────────────────────────────────────────────────────┤
│                    React Adapter                         │
│  (useVoltaComponent, useVoltaRegistry, useVoltaQuery)    │
├─────────────────────────────────────────────────────────┤
│                       Layers                             │
│       (ThemeManager, DataLayer, StateLayer)              │
├─────────────────────────────────────────────────────────┤
│                        Core                              │
│  (register, query, store, createDerivedStore)            │
├─────────────────────────────────────────────────────────┤
│                   @sthirajs/core                         │
│        (signal, computed, effect, batch)                 │
└─────────────────────────────────────────────────────────┘
```

## Component Registry (v0.5.0+)

Vanilla-first component registration with data/state/theme bindings.

### Primitives

```typescript
import { query, store, register } from '@voltakit/volta'

// Data binding (lazy fetch)
const userData = query({
  endpoint: '/users/:userId',
  params: ['userId'],
  config: { staleTime: 60000 },
})

// State binding (scoped store)
const userState = store({
  initial: { activeTab: 'info' },
})

// Register component
const { id, status } = register('user-card', {
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

## Signal-Based Derived Stores (v0.5.0+)

Create reactive derived values using Sthira signals.

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

### Legacy Derived Stores

For stores using getState/subscribe pattern:

```typescript
import { createLegacyDerivedStore } from '@voltakit/volta'

const derived = createLegacyDerivedStore([sthiraStore1, sthiraStore2], ([s1, s2]) => ({
  combined: s1.value + s2.value,
}))
```

## Layers

### DataLayer

High-level data fetching with caching, powered by `@sthirajs/fetch`.

```typescript
import { initDataLayer, getDataLayer } from '@voltakit/volta'

initDataLayer({
  baseUrl: 'https://api.example.com',
  cache: { staleTime: 5 * 60 * 1000 },
})

const users = await getDataLayer().get('/users')
```

### StateLayer

Centralized store registry with DevTools and cross-tab sync.

```typescript
import { initStateLayer, getStateLayer } from '@voltakit/volta'

initStateLayer({
  enableDevTools: true,
  enableCrossTab: true,
})

const userStore = getStateLayer().createStore('user', {
  initialState: { name: '', email: '' },
})
```

### ThemeManager

Generic theming with CSS variables and multi-tenant support.

```typescript
import { createThemeManager } from '@voltakit/volta'

const themeManager = createThemeManager({
  defaultTheme: { colors: { brand: '#3B82F6' } },
  cssVariables: (theme) => ({
    '--color-brand': theme.colors.brand,
  }),
})
```

## React Hooks

### useVoltaComponent (v0.5.0+)

Auto-resolve data and theme bindings for registered components.

```tsx
import { react } from '@voltakit/volta'
const { useVoltaComponent } = react

function UserCard({ userId }: { userId: string }) {
  const { data, theme, isLoading, error } = useVoltaComponent('user-card', {
    props: { userId },
    themeManager,
  })

  if (isLoading) return <Spinner />

  return <div style={{ color: theme['colors.primary'] }}>{data.user?.name}</div>
}
```

### useVoltaRegistry (v0.4.0+)

Unified hook for query and mutation operations.

```tsx
const { data, mutate, remove } = useVoltaRegistry<User>({
  endpoint: `/users/${userId}`,
})
```

### useVoltaQuery / useVoltaMutation / useVoltaStore

See previous versions for these hooks.

## Design Principles

1. **Vanilla-First**: Core logic is framework-agnostic
2. **Signal Integration**: Built on Sthira signals for reactivity
3. **Layered Architecture**: Clear separation of concerns
4. **Type-safe**: Full TypeScript generics support
5. **Multi-tenant Ready**: CDN-based tenant theme loading
