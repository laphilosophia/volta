# Volta Integration Guide

This guide explains how to integrate Volta into your LC/NC platform.

## Installation

```bash
npm install @voltakit/volta
```

> All dependencies are bundled—no peer deps required!

## Quick Setup

### 1. Initialize Volta

```typescript
// app.ts or main.ts
import { initVolta } from '@voltakit/volta'

initVolta({
  baseUrl: process.env.API_URL,
  cache: { staleTime: 5 * 60 * 1000 },
  enableDevTools: process.env.NODE_ENV === 'development',
  enableCrossTab: true,
})
```

### 2. Register Components

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
  const { data, state, theme, isLoading, refetch } = useVoltaComponent('user-card', {
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

## Vanilla API (Without Registration)

For simpler cases, use the vanilla API directly:

```typescript
import { query, mutate, invalidate } from '@voltakit/volta'

// Fetch data
const users = await query<User[]>('/users')

// Create user
const newUser = await mutate<User>('/users', { name: 'John' })

// Update user
await mutate('/users/123', { name: 'Jane' }, { method: 'PUT' })

// Delete user
await mutate('/users/123', undefined, { method: 'DELETE' })

// Invalidate cache
invalidate('/users')
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

## React Hooks

### useVoltaComponent

Primary hook for registered components:

```tsx
const { data, state, theme, isLoading, error, refetch } = useVoltaComponent('user-card', {
  props: { userId: '123' },
  themeManager,
})
```

### useVoltaRegistry

Direct query/mutation without registration:

```tsx
const { data, mutate, remove, refetch } = useVoltaRegistry<User>({
  endpoint: `/users/${userId}`,
})
```

### useVoltaQuery

Simple data fetching:

```tsx
const { data, isLoading, error } = useVoltaQuery<User[]>('/users')
```

### useVoltaMutation

Data mutations:

```tsx
const { mutate, isLoading, error } = useVoltaMutation<User>('/users', {
  method: 'POST',
  invalidates: ['/users'],
})
```

## Theming

```typescript
import { createThemeManager } from '@voltakit/volta'

const themeManager = createThemeManager({
  defaultTheme: {
    colors: { primary: '#3B82F6' },
  },
  cssVariables: (theme) => ({
    '--color-primary': theme.colors.primary,
  }),
})

// Pass to useVoltaComponent for auto-wiring
const { theme } = useVoltaComponent('user-card', { themeManager })
```

## Best Practices

1. **Initialize once at app startup** - Call `initVolta()` before any component renders
2. **Register components early** - Register before hooks try to use them
3. **Use query() for data bindings** - Supports path parameters and caching
4. **Use store() for component state** - Scoped per instance, prevents cross-talk
5. **Use theme bindings** - Enable white-label support from day one
6. **Prefer signals** - Use `createDerivedStore()` for computed values

## Further Reading

- [Architecture Overview](ARCHITECTURE.md)
- [Vanilla API](core-concepts/vanilla-api.md)
- [Component Registry](core-concepts/component-registry.md)
- [React Hooks](react/hooks.md)
- [Migration Guide](guides/migration-v04-v05.md)
