# Volta Architecture

> **Volta is a toolkit for building low-code/no-code platforms.**

## Overview

Volta provides a **layered architecture** with clear separation between framework-agnostic core and framework-specific adapters.

```
┌─────────────────────────────────────────────────────────┐
│                    Your Application                      │
├─────────────────────────────────────────────────────────┤
│                    React Adapter                         │
│    (useVoltaQuery, useVoltaMutation, useVoltaStore)      │
├─────────────────────────────────────────────────────────┤
│                       Layers                             │
│       (ThemeManager, DataLayer, StateLayer)              │
├─────────────────────────────────────────────────────────┤
│                        Core                              │
│        (ComponentRegistry, ApiClient, Types)             │
├─────────────────────────────────────────────────────────┤
│                   @sthirajs/*                            │
│        (fetch, core, devtools, cross-tab)                │
└─────────────────────────────────────────────────────────┘
```

## Layers

### DataLayer

High-level data fetching with caching, powered by `@sthirajs/fetch`.

```typescript
import { initDataLayer, getDataLayer } from '@voltakit/volta'

// Initialize once
initDataLayer({
  baseUrl: 'https://api.example.com',
  headers: { 'X-API-Key': 'secret' },
  cache: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  },
  interceptors: {
    onError: (error) => console.error(error),
  },
})

// Use anywhere
const dataLayer = getDataLayer()
const users = await dataLayer.get('/users')
const user = await dataLayer.get('/users/:id', { path: { id: '123' } })
await dataLayer.post('/users', { name: 'John' })
dataLayer.invalidateCache('/users')
```

### StateLayer

Centralized store registry with DevTools and cross-tab sync.

```typescript
import { initStateLayer, getStateLayer } from '@voltakit/volta'

// Initialize once
initStateLayer({
  enableDevTools: true, // Redux DevTools
  enableCrossTab: true, // Sync across tabs
  namespace: 'myapp',
})

// Create stores
const stateLayer = getStateLayer()

const userStore = stateLayer.createStore('user', {
  initialState: { name: '', email: '' },
})

const counterStore = stateLayer.createStore(
  'counter',
  { initialState: { count: 0 } },
  (set, get) => ({
    increment: () => set({ count: get().count + 1 }),
  })
)

// Manage stores
stateLayer.hasStore('user') // true
stateLayer.getStoreNames() // ['myapp/user', 'myapp/counter']
stateLayer.destroyStore('user')
```

### ThemeManager

Generic theming with CSS variables and multi-tenant support.

```typescript
import { createThemeManager } from '@voltakit/volta'

const themeManager = createThemeManager({
  defaultTheme: {
    colors: { brand: '#3B82F6', accent: '#10B981' },
    typography: { fontFamily: 'Inter' },
  },
  cssVariables: (theme) => ({
    '--color-brand': theme.colors.brand,
  }),
  cdnUrl: 'https://cdn.example.com',
})

themeManager.setTheme({ ... })
await themeManager.loadTheme('tenant-123')
themeManager.toggleDarkMode()
```

## React Hooks

### useVoltaQuery

Data fetching with caching and automatic refetch.

```tsx
import { react } from '@voltakit/volta'
const { useVoltaQuery } = react

function UserList() {
  const { data, isLoading, error, refetch } = useVoltaQuery('/users', {
    refetchOnFocus: true,
    refetchOnReconnect: true,
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <ul>
      {data?.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  )
}
```

### useVoltaMutation

Mutations with optimistic updates.

```tsx
const { useVoltaMutation } = react

function CreateUser() {
  const { mutate, isLoading } = useVoltaMutation('/users', {
    method: 'POST',
    invalidates: ['/users'],
    onSuccess: (user) => console.log('Created:', user),
  })

  return (
    <button onClick={() => mutate({ name: 'John' })} disabled={isLoading}>
      Create User
    </button>
  )
}
```

### useVoltaStore

Consume Sthira stores with selector support.

```tsx
const { useVoltaStore } = react

function Counter() {
  const { count } = useVoltaStore(counterStore)
  const actions = counterStore.actions

  return (
    <div>
      <span>{count}</span>
      <button onClick={actions.increment}>+</button>
    </div>
  )
}

// With selector
function UserName() {
  const name = useVoltaStore(userStore, (state) => state.name)
  return <div>{name}</div>
}
```

## Core

### Component Registry

Dynamic component registration with lazy loading.

```typescript
import { componentRegistry } from '@voltakit/volta'

componentRegistry.register(
  {
    id: 'custom-input',
    type: 'input',
    schema: {
      /* JSON Schema */
    },
    defaultProps: {},
    renderMode: 'edit',
    category: 'input',
  },
  () => import('./components/CustomInput')
)
```

## Design Principles

1. **Layered Architecture**: Clear separation between core, layers, and adapters
2. **Framework-agnostic Core**: Pure TypeScript, React adapters optional
3. **Sthira Integration**: Built on `@sthirajs/*` ecosystem
4. **Type-safe**: Full TypeScript generics support
5. **Multi-tenant Ready**: CDN-based tenant theme loading
