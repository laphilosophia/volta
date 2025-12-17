# Volta Integration Guide

This guide explains how to integrate Volta into your LC/NC platform.

## Installation

```bash
npm install @voltakit/volta @sthirajs/core
```

## Basic Setup

### 1. Configure API Client

Create a configuration file for your API endpoints:

```typescript
// volta.config.ts
import type { VoltaConfig } from '@voltakit/volta'

export const voltaConfig: VoltaConfig = {
  services: {
    main: {
      baseUrl: process.env.API_URL || 'https://api.example.com',
      auth: {
        type: 'bearer',
        tokenStorageKey: 'auth_token',
      },
    },
  },
  endpoints: {
    getUsers: { service: 'main', path: '/users', method: 'GET' },
    createUser: { service: 'main', path: '/users', method: 'POST' },
    updateUser: { service: 'main', path: '/users/:id', method: 'PUT' },
  },
}
```

### 2. Initialize in Your App

```typescript
import { initApiClient, themeManager } from '@voltakit/volta'
import { voltaConfig } from './volta.config'

// Initialize API client
initApiClient(voltaConfig)

// Initialize theming
themeManager.initDarkMode()
```

### 3. Register Components

```typescript
import { componentRegistry } from '@voltakit/volta'

// Register your custom components
componentRegistry.register(
  {
    id: 'my-component',
    type: 'custom',
    schema: { type: 'object', properties: {} },
    defaultProps: {},
    renderMode: 'view',
    category: 'display',
    label: { en: 'My Component', tr: 'Bileşenim' },
  },
  () => import('./components/MyComponent')
)
```

## Using with React

```typescript
import { react } from '@voltakit/volta'

// React hooks and providers are available via react namespace
// Full implementation coming with @sthirajs/fetch integration
```

## Theming

### Apply Tenant Theme

```typescript
import { themeManager } from '@voltakit/volta'

// Load from CDN
await themeManager.loadTheme('tenant-id')

// Or apply directly
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
```

### Dark Mode

```typescript
// Toggle dark mode
themeManager.toggleDarkMode()

// Set specific mode
themeManager.toggleDarkMode(true) // Enable
themeManager.toggleDarkMode(false) // Disable

// Initialize from user preference
themeManager.initDarkMode()
```

## API Reference

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed API documentation.
