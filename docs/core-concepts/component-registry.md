# Component Registry

The Component Registry is Volta's system for declaratively defining components with their data, state, and theme bindings. This enables auto-wiring in visual builders and metadata-driven applications.

## Overview

```typescript
import { query, store, register } from '@voltakit/volta'

// 1. Define data binding
const userData = query({
  endpoint: '/users/:userId',
  params: ['userId'],
})

// 2. Define state binding
const cardState = store({
  initial: { collapsed: false },
})

// 3. Register component
register('user-card', {
  type: 'data-display',
  component: () => import('./UserCard'),
  data: userData,
  state: cardState,
  theme: ['colors.primary', 'colors.background'],
})
```

## Primitives

### query()

Create a lazy data binding. Data is fetched when the component mounts.

```typescript
import { query } from '@voltakit/volta'

const userData = query({
  // API endpoint with path parameters
  endpoint: '/users/:userId',

  // Props that become path parameters
  params: ['userId'],

  // Optional: HTTP method (default: GET)
  method: 'GET',

  // Optional: Cache stale time
  staleTime: 60000,

  // Optional: Transform response
  transform: (data) => data.user,
})
```

### store()

Create a scoped state binding. Each component instance gets its own store.

```typescript
import { store } from '@voltakit/volta'

const cardState = store({
  // Initial state value
  initial: {
    collapsed: false,
    activeTab: 'info',
  },

  // Optional: Persist to localStorage
  persist: true,
})
```

### register()

Register a component with its bindings.

```typescript
import { register } from '@voltakit/volta'

const result = register('user-card', {
  // Component type (for filtering/categorization)
  type: 'data-display',

  // Component reference (lazy import recommended)
  component: () => import('./UserCard'),

  // Data bindings (single or multiple)
  data: userData,
  // or: data: { user: userData, posts: postsData }

  // State bindings (single or multiple)
  state: cardState,
  // or: state: { ui: uiState, form: formState }

  // Theme token paths to subscribe
  theme: ['colors.primary', 'colors.background', 'spacing.md'],
})

console.log(result.id) // Symbol
console.log(result.status) // 'registered' | 'error'
```

## Registry Access

### getComponent()

Retrieve a registered component definition.

```typescript
import { getComponent } from '@voltakit/volta'

const definition = getComponent('user-card')
if (definition) {
  console.log(definition.type) // 'data-display'
  console.log(definition.theme) // ['colors.primary', ...]
}
```

### listComponents()

List all registered components.

```typescript
import { listComponents, listComponentsByType } from '@voltakit/volta'

const all = listComponents()
// [{ key: 'user-card', definition: {...} }, ...]

const displays = listComponentsByType('data-display')
// Only components with type: 'data-display'
```

### hasComponent() / unregister()

```typescript
import { hasComponent, unregister } from '@voltakit/volta'

if (hasComponent('user-card')) {
  unregister('user-card')
}
```

## Binding Resolution

These functions are typically called by framework adapters (like `useVoltaComponent`), but you can use them directly for custom integrations.

### resolveDataBindings()

Fetch all data defined in a component's bindings.

```typescript
import { resolveDataBindings } from '@voltakit/volta'

const controller = new AbortController()

const result = await resolveDataBindings(
  'user-card', // Component key
  { userId: '123' }, // Props for path params
  controller.signal // AbortSignal
)

console.log(result.data) // { default: {...} } or { user: {...}, posts: {...} }
console.log(result.status) // 'loading' | 'success' | 'error'
console.log(result.error) // Error if failed
```

### resolveStateBindings()

Create instance-scoped stores.

```typescript
import { resolveStateBindings, createInstance, destroyInstance } from '@voltakit/volta'

// Create instance
const instance = createInstance('user-card')

// Resolve stores
const stores = await resolveStateBindings('user-card', instance.id)
console.log(stores.default) // Sthira store instance

// Cleanup on unmount
destroyInstance(instance.id)
```

### resolveThemeBindings()

Subscribe to theme token changes.

```typescript
import { resolveThemeBindings } from '@voltakit/volta'

const { tokens, unsubscribe } = resolveThemeBindings('user-card', themeManager, (newTokens) =>
  console.log('Theme changed:', newTokens)
)

console.log(tokens['colors.primary']) // '#3B82F6'

// Cleanup
unsubscribe()
```

## Instance Management

Each usage of a registered component creates an instance with isolated state.

```typescript
import { createInstance, destroyInstance, getInstanceCount } from '@voltakit/volta'

// Create instance
const instance = createInstance('user-card')
console.log(instance.id) // Symbol
console.log(instance.createdAt) // Timestamp

// Check instance count (for debugging)
console.log(getInstanceCount()) // 1

// Cleanup
destroyInstance(instance.id)
console.log(getInstanceCount()) // 0
```

## Override Protection

Registering a component with an existing key throws an error:

```typescript
register('user-card', { type: 'display', component: null })
register('user-card', { type: 'other', component: null })
// ❌ Error: Component "user-card" is already registered

// To replace, unregister first:
unregister('user-card')
register('user-card', { type: 'other', component: null })
```

## TypeScript

Full type inference for bindings:

```typescript
interface User {
  id: string
  name: string
}

interface CardState {
  collapsed: boolean
}

const userData = query<User>({
  endpoint: '/users/:id',
  params: ['id'],
})

const cardState = store<CardState>({
  initial: { collapsed: false },
})
```

## Next Steps

- [useVoltaComponent](../react/use-volta-component.md) - React hook for auto-wiring
- [Signals](signals.md) - Derived stores and reactive computations
