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

// Initialize data layer
initDataLayer({
  baseUrl: process.env.API_URL || 'https://api.example.com',
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
  cache: {
    staleTime: 5 * 60 * 1000, // 5 min
  },
})

// Initialize state layer
initStateLayer({
  enableDevTools: process.env.NODE_ENV === 'development',
  enableCrossTab: true,
})
```

### 2. Create Stores

```typescript
// stores/user.ts
import { getStateLayer } from '@voltakit/volta'

export const userStore = getStateLayer().createStore(
  'user',
  {
    initialState: {
      id: null,
      name: '',
      email: '',
    },
  },
  (set) => ({
    setUser: (user) => set(user),
    logout: () => set({ id: null, name: '', email: '' }),
  })
)
```

### 3. Use in React

```tsx
// components/UserProfile.tsx
import { react } from '@voltakit/volta'
import { userStore } from '../stores/user'

const { useVoltaQuery, useVoltaStore } = react

export function UserProfile() {
  const user = useVoltaStore(userStore)
  const { data, isLoading } = useVoltaQuery(`/users/${user.id}`, {
    enabled: !!user.id,
  })

  if (isLoading) return <div>Loading...</div>

  return (
    <div>
      <h1>{data?.name}</h1>
      <p>{data?.email}</p>
    </div>
  )
}
```

## Mutations

```tsx
import { react } from '@voltakit/volta'
const { useVoltaMutation } = react

function CreatePost() {
  const { mutate, isLoading, isSuccess } = useVoltaMutation('/posts', {
    method: 'POST',
    invalidates: ['/posts'],
    onSuccess: (post) => {
      console.log('Created:', post)
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        mutate({ title: 'New Post', body: '...' })
      }}
    >
      <button disabled={isLoading}>{isLoading ? 'Creating...' : 'Create Post'}</button>
    </form>
  )
}
```

## Theming

```typescript
import { createThemeManager } from '@voltakit/volta'

const themeManager = createThemeManager({
  defaultTheme: {
    colors: { brand: '#3B82F6' },
  },
  cssVariables: (theme) => ({
    '--brand': theme.colors.brand,
  }),
  cdnUrl: 'https://cdn.example.com',
})

// Load tenant theme
await themeManager.loadTheme('tenant-123')

// Toggle dark mode
themeManager.initDarkMode()
themeManager.toggleDarkMode()
```

## Component Registry

```typescript
import { componentRegistry } from '@voltakit/volta'

componentRegistry.register(
  {
    id: 'my-component',
    type: 'custom',
    schema: { type: 'object', properties: {} },
    defaultProps: {},
    renderMode: 'view',
    category: 'display',
  },
  () => import('./components/MyComponent')
)
```

## API Reference

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed API documentation.
