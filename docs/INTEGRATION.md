# Volta Integration Guide

This guide explains how to integrate Volta into your LC/NC platform.

## Installation

```bash
npm install @voltakit/volta
```

> All dependencies are bundled—no peer deps required!

## Quick Setup

### 1. Initialize Layers

```typescript
// app.ts
import { initDataLayer, initStateLayer } from '@voltakit/volta'

initDataLayer({
  baseUrl: process.env.API_URL,
  cache: { staleTime: 5 * 60 * 1000 },
})

initStateLayer({
  enableDevTools: process.env.NODE_ENV === 'development',
})
```

### 2. Register Components (v0.5.0+)

```typescript
// components/registry.ts
import { query, store, register } from '@voltakit/volta'

// Define data binding
const userData = query({
  endpoint: '/users/:userId',
  params: ['userId'],
})

// Define state binding
const userState = store({
  initial: { activeTab: 'info' },
})

// Register component
register('user-card', {
  type: 'data-display',
  component: () => import('./UserCard'),
  data: userData,
  state: userState,
  theme: ['colors.primary', 'colors.accent'],
})
```

### 3. Use in React

```tsx
// components/UserCard.tsx
import { react } from '@voltakit/volta'
const { useVoltaComponent } = react

export function UserCard({ userId }: { userId: string }) {
  const { data, theme, isLoading, refetch } = useVoltaComponent('user-card', {
    props: { userId },
    themeManager, // optional
  })

  if (isLoading) return <div>Loading...</div>

  return (
    <div style={{ color: theme['colors.primary'] }}>
      <h2>{data.name}</h2>
      <p>{data.email}</p>
    </div>
  )
}
```

## Signal-Based Derived Stores

Combine multiple signals into derived values:

```typescript
import { signal } from '@sthirajs/core'
import { createDerivedStore } from '@voltakit/volta'

const count = signal(0)
const doubled = createDerivedStore([count], ([c]) => c * 2)

count.set(5)
console.log(doubled.getValue()) // 10
```

## Legacy Patterns

### useVoltaQuery

```tsx
const { data, isLoading } = useVoltaQuery('/users')
```

### useVoltaMutation

```tsx
const { mutate, isLoading } = useVoltaMutation('/users', {
  method: 'POST',
  invalidates: ['/users'],
})
```

### useVoltaRegistry

```tsx
const { data, mutate, remove } = useVoltaRegistry<User>({
  endpoint: `/users/${userId}`,
})
```

## Theming

```typescript
import { createThemeManager } from '@voltakit/volta'

const themeManager = createThemeManager({
  defaultTheme: {
    colors: { primary: '#3B82F6' },
  },
})

// Pass to useVoltaComponent for auto-wiring
```

## Best Practices

1. **Register components at app startup** before rendering
2. **Use query() for data bindings** - supports path parameters
3. **Use store() for component state** - scoped per instance
4. **Use theme bindings** for white-label support
5. **Prefer signals** for derived computations
