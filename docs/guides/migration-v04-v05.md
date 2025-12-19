# Migration Guide: v0.4.x to v0.5.0

This guide covers the changes when upgrading from Volta v0.4.x to v0.5.0.

## Breaking Changes

### 1. Initialization API Changed

**Before (v0.4.x):**

```typescript
import { initDataLayer, initStateLayer } from '@voltakit/volta'

initDataLayer({
  baseUrl: 'https://api.example.com',
  cache: { staleTime: 300000 },
})

initStateLayer({
  enableDevTools: true,
})
```

**After (v0.5.0):**

```typescript
import { initVolta } from '@voltakit/volta'

initVolta({
  baseUrl: 'https://api.example.com',
  cache: { staleTime: 300000 },
  enableDevTools: true,
  enableCrossTab: true,
})
```

### 2. DataLayer No Longer Public

**Before (v0.4.x):**

```typescript
import { getDataLayer } from '@voltakit/volta'

const users = await getDataLayer().get('/users')
```

**After (v0.5.0):**

```typescript
import { query } from '@voltakit/volta'

const users = await query('/users')
```

### 3. StateLayer No Longer Public

**Before (v0.4.x):**

```typescript
import { getStateLayer } from '@voltakit/volta'

const store = getStateLayer().createStore('user', {
  initialState: { name: '' },
})
```

**After (v0.5.0):**

```typescript
import { createStore } from '@voltakit/volta'

const store = createStore('user', {
  initialState: { name: '' },
})
```

## New Features

### Vanilla API

Framework-agnostic data operations:

```typescript
import { query, mutate, invalidate } from '@voltakit/volta'

// Fetch
const users = await query<User[]>('/users')

// Create
const newUser = await mutate<User>('/users', { name: 'John' })

// Invalidate cache
invalidate('/users')
```

### useVoltaComponent State Bindings

The hook now resolves state bindings:

```tsx
const { data, state, theme } = useVoltaComponent('user-card', {
  props: { userId },
  themeManager,
})

// Access instance-scoped stores
const counterStore = state.counter
```

### Lifecycle Management

New lifecycle functions:

```typescript
import { holdVolta, resumeVolta, destroyVolta, getVoltaStatus } from '@voltakit/volta'

holdVolta() // Pause operations
resumeVolta() // Resume operations
destroyVolta() // Cleanup
getVoltaStatus() // 'idle' | 'running' | 'held' | 'destroyed'
```

### Signal-Based Derived Stores

New reactive derivation:

```typescript
import { signal } from '@sthirajs/core'
import { createDerivedStore } from '@voltakit/volta'

const count = signal(5)
const doubled = createDerivedStore([count], ([c]) => c * 2)
```

## Migration Checklist

- [ ] Replace `initDataLayer()` + `initStateLayer()` with `initVolta()`
- [ ] Replace `getDataLayer().get()` with `query()`
- [ ] Replace `getDataLayer().post()` etc. with `mutate()`
- [ ] Replace `getStateLayer().createStore()` with `createStore()`
- [ ] Update `useVoltaComponent` usage to access `state` property
- [ ] Remove direct DataLayer/StateLayer imports
- [ ] Update any tests mocking DataLayer/StateLayer

## Dependency Updates

Update `@sthirajs/*` packages to latest:

```bash
npm install @sthirajs/core@latest @sthirajs/cross-tab@latest @sthirajs/devtools@latest @sthirajs/fetch@latest @sthirajs/react@latest
```

## Questions?

If you encounter issues during migration, please open an issue on GitHub.
