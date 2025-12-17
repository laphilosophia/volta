# Volta Architecture

> **Volta is a toolkit for building low-code/no-code platforms.**

## Overview

Volta provides a **layered architecture** with clear separation between framework-agnostic core and framework-specific adapters.

```
┌─────────────────────────────────────────────────────────┐
│                    Your Application                      │
├─────────────────────────────────────────────────────────┤
│                    React Adapter                         │
│              (hooks, providers, contexts)                │
├─────────────────────────────────────────────────────────┤
│                      Layers                              │
│           (ThemeManager, DataLayer, StateLayer)          │
├─────────────────────────────────────────────────────────┤
│                       Core                               │
│        (ComponentRegistry, ApiClient, Types)             │
├─────────────────────────────────────────────────────────┤
│                   @sthirajs/core                         │
│              (State Management Foundation)               │
└─────────────────────────────────────────────────────────┘
```

## Core Layer (Pure TypeScript)

### Component Registry

Manages dynamic component registration and lazy loading.

```typescript
import { componentRegistry } from 'volta'

// Register a component
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

// Get a component
const def = componentRegistry.get('custom-input')

// Get lazy loader
const LazyComponent = componentRegistry.getLoader('custom-input')
```

### API Client

Configuration-driven HTTP client with CSRF protection and error handling.

```typescript
import { ApiClient, initApiClient } from 'volta'

const config = {
  services: {
    main: {
      baseUrl: 'https://api.example.com',
      auth: { type: 'bearer', tokenStorageKey: 'auth_token' },
    },
  },
  endpoints: {
    getUsers: { service: 'main', path: '/users', method: 'GET' },
  },
}

initApiClient(config)
```

## Layers

### ThemeManager

White-label theming with CSS variable injection and dark mode support.

```typescript
import { themeManager } from 'volta'

// Load tenant theme from CDN
await themeManager.loadTheme('tenant-123')

// Apply theme directly
themeManager.applyTheme({
  tenantId: 'custom',
  colors: {
    primary: '#3B82F6',
    secondary: '#8B5CF6',
    accent: '#10B981',
    neutral: '#6B7280',
  },
  logo: '/logo.svg',
  favicon: '/favicon.ico',
})

// Toggle dark mode
themeManager.toggleDarkMode()
```

## React Adapter

Optional React-specific hooks and providers (requires React peer dependency).

```typescript
import { react } from 'volta'

// Hooks (coming soon with @sthirajs/fetch)
// const { data, isLoading } = react.hooks.useVoltaQuery('getUsers')
```

## Design Principles

1. **Metadata-driven**: Components and pages defined by JSON schemas
2. **Framework-agnostic core**: Pure TypeScript, no React dependency
3. **Lazy loading**: Components loaded on-demand for performance
4. **Type-safe**: Full TypeScript support with generics
5. **Extensible**: Plugin-friendly architecture

## Integration with Sthira

Volta uses `@sthirajs/core` as its state management foundation:

- **Data fetching**: Uses Sthira's fetch plugin
- **State management**: Distributed stores via Sthira
- **DevTools**: Compatible with Sthira DevTools
