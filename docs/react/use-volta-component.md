# useVoltaComponent

The primary React hook for consuming registered components. Automatically resolves data, state, and theme bindings.

## Overview

```tsx
import { react } from '@voltakit/volta'
const { useVoltaComponent } = react

function UserCard({ userId }: { userId: string }) {
  const { data, state, theme, isLoading, error, refetch } = useVoltaComponent('user-card', {
    props: { userId },
    themeManager,
  })

  if (isLoading) return <Spinner />
  if (error) return <Error message={error.message} />

  return (
    <div style={{ color: theme['colors.primary'] }}>
      <h2>{data.name}</h2>
      <button onClick={() => state.counter?.set({ count: 0 })}>Reset</button>
      <button onClick={refetch}>Refresh</button>
    </div>
  )
}
```

## Signature

```typescript
function useVoltaComponent(
  componentKey: string,
  options?: UseVoltaComponentOptions
): VoltaComponentResult
```

## Options

```typescript
interface UseVoltaComponentOptions {
  /** Props for path parameter substitution in data bindings */
  props?: Record<string, unknown>

  /** ThemeManager instance for theme token resolution */
  themeManager?: ThemeManager<object>

  /** Skip initial data fetch (default: false) */
  skip?: boolean
}
```

## Return Value

```typescript
interface VoltaComponentResult {
  /** Resolved data from data bindings */
  data: Record<string, unknown>

  /** Resolved theme tokens */
  theme: Record<string, unknown>

  /** Resolved state stores (scoped to this instance) */
  state: Record<string, unknown>

  /** Component definition from registry */
  definition: ComponentDefinition | undefined

  /** Loading state for data bindings */
  isLoading: boolean

  /** Error if data fetch failed */
  error: Error | undefined

  /** Refetch data bindings */
  refetch: () => Promise<void>
}
```

## Features

### Data Binding Resolution

Props are used to substitute path parameters in endpoints:

```typescript
// Registration
const userData = query({
  endpoint: '/users/:userId',
  params: ['userId'],
})
register('user-card', { ..., data: userData })

// Usage
const { data } = useVoltaComponent('user-card', {
  props: { userId: '123' }  // Fetches /users/123
})

console.log(data.default)  // User data
```

### Multiple Data Bindings

```typescript
// Registration with named bindings
register('dashboard', {
  data: {
    user: query({ endpoint: '/users/:id', params: ['id'] }),
    posts: query({ endpoint: '/users/:id/posts', params: ['id'] }),
  },
})

// Usage
const { data } = useVoltaComponent('dashboard', {
  props: { id: '123' },
})

console.log(data.user) // User data
console.log(data.posts) // Posts array
```

### State Binding Resolution

Each hook instance gets isolated state stores:

```typescript
// Registration
const counterState = store({ initial: { count: 0 } })
register('counter', { ..., state: counterState })

// Usage
const { state } = useVoltaComponent('counter')

// Access store
const store = state.default as SthiraStore<{ count: number }>
store.getState()           // { count: 0 }
store.set({ count: 1 })    // Update state

// Each instance is isolated
<Counter />  // Instance 1: count = 0
<Counter />  // Instance 2: count = 0 (separate)
```

### Theme Binding Resolution

Subscribe to theme tokens:

```typescript
// Registration
register('card', {
  theme: ['colors.primary', 'colors.background', 'spacing.md'],
})

// Usage
const { theme } = useVoltaComponent('card', { themeManager })

console.log(theme['colors.primary']) // '#3B82F6'
console.log(theme['spacing.md']) // '16px'
```

### Skip Initial Fetch

Delay data fetching:

```typescript
const [shouldFetch, setShouldFetch] = useState(false)

const { data, refetch } = useVoltaComponent('user-card', {
  props: { userId },
  skip: !shouldFetch,
})

// Manually fetch when ready
useEffect(() => {
  if (shouldFetch) {
    refetch()
  }
}, [shouldFetch])
```

### Refetching

Manually refetch data bindings:

```tsx
const { data, refetch, isLoading } = useVoltaComponent('user-card', {
  props: { userId },
})

return (
  <div>
    <button onClick={refetch} disabled={isLoading}>
      Refresh
    </button>
  </div>
)
```

## Instance Lifecycle

The hook automatically manages component instances:

1. **Mount**: Creates instance via `createInstance()`
2. **Resolve**: Fetches data, creates stores, subscribes to theme
3. **Unmount**: Destroys instance via `destroyInstance()`, cleans up subscriptions

```tsx
// Each <UserCard /> creates its own instance
<UserCard userId="1" />  // Instance A
<UserCard userId="2" />  // Instance B

// When unmounted, instances are cleaned up automatically
```

## Error Handling

```tsx
const { data, error, isLoading, refetch } = useVoltaComponent('user-card', {
  props: { userId },
})

if (error) {
  return (
    <div>
      <p>Error: {error.message}</p>
      <button onClick={refetch}>Retry</button>
    </div>
  )
}
```

## TypeScript

Type the data response:

```tsx
interface UserData {
  default: {
    id: string
    name: string
    email: string
  }
}

const { data } = useVoltaComponent('user-card', {
  props: { userId },
}) as VoltaComponentResult & { data: UserData }

console.log(data.default.name) // Type-safe
```

## Best Practices

1. **Register before render**: Call `register()` before any hooks use the component
2. **Use skip for conditional fetching**: Avoid unnecessary requests
3. **Handle loading and error states**: Always provide feedback
4. **Clean naming**: Use descriptive component keys (`'user-profile-card'` not `'card1'`)

## Next Steps

- [useVoltaRegistry](use-volta-registry.md) - Direct query/mutation without registration
- [Component Registry](../core-concepts/component-registry.md) - How registration works
