# Volta Architecture

> **Volta is a toolkit for building low-code/no-code platforms.**

## Overview

Volta provides a **layered architecture** with clear separation between framework-agnostic core and framework-specific adapters.

```
┌─────────────────────────────────────────────────────────┐
│                    Your Application                      │
├─────────────────────────────────────────────────────────┤
│                    React Adapter                         │
│         (ThemeProvider, useTheme, hooks)                 │
├─────────────────────────────────────────────────────────┤
│                      Layers                              │
│              (Generic ThemeManager<T>)                   │
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
import { componentRegistry } from '@voltakit/volta'

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
import { ApiClient, initApiClient } from '@voltakit/volta'

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

### ThemeManager<T> (Generic)

Fully generic theming system - define your own theme structure.

```typescript
import { createThemeManager } from '@voltakit/volta'

// 1. Define your theme type
interface MyTheme {
  colors: {
    brand: string
    accent: string
    background: string
  }
  typography: {
    fontFamily: string
    fontSize: number
  }
}

// 2. Create theme manager
const themeManager = createThemeManager<MyTheme>({
  defaultTheme: {
    colors: {
      brand: '#3B82F6',
      accent: '#10B981',
      background: '#FFFFFF',
    },
    typography: {
      fontFamily: 'Inter, sans-serif',
      fontSize: 16,
    },
  },

  // Optional: Map to CSS variables
  cssVariables: (theme) => ({
    '--color-brand': theme.colors.brand,
    '--color-accent': theme.colors.accent,
    '--font-family': theme.typography.fontFamily,
  }),

  // Optional: CDN for multi-tenant themes
  cdnUrl: 'https://cdn.example.com',
})

// 3. Use the theme
themeManager.setTheme({ ... })
themeManager.updateTheme({ colors: { brand: '#FF0000' } })
await themeManager.loadTheme('tenant-123')
themeManager.toggleDarkMode()
```

## React Adapter

React-specific providers and hooks.

```typescript
import { createThemeManager, react } from '@voltakit/volta'
const { ThemeProvider, useTheme, useThemeValue } = react

// Wrap your app
function App() {
  return (
    <ThemeProvider manager={themeManager} initDarkMode>
      <MyApp />
    </ThemeProvider>
  )
}

// Use in components
function MyComponent() {
  const { theme, setTheme, toggleDarkMode } = useTheme<MyTheme>()

  return (
    <div style={{ color: theme.colors.brand }}>
      <button onClick={() => toggleDarkMode()}>Toggle Dark</button>
    </div>
  )
}

// Or use specific value
function ColorDisplay() {
  const brand = useThemeValue('colors.brand') as string
  return <div style={{ color: brand }}>Branded</div>
}
```

## Design Principles

1. **Generic by default**: No opinionated theme structure
2. **Framework-agnostic core**: Pure TypeScript, React adapters optional
3. **CSS-flexible**: Map to CSS variables, CSS-in-JS, or raw values
4. **Multi-tenant ready**: CDN-based tenant theme loading
5. **Type-safe**: Full TypeScript generics support
