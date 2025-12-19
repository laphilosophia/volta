# React Hooks

Volta provides several React hooks for different use cases.

## Hook Overview

| Hook                | Purpose                         | When to Use                               |
| ------------------- | ------------------------------- | ----------------------------------------- |
| `useVoltaComponent` | Auto-wire registered components | Building LC/NC platforms with registry    |
| `useVoltaRegistry`  | Direct query/mutation           | Simple data fetching without registration |
| `useVoltaQuery`     | Data fetching only              | Read-only data access                     |
| `useVoltaMutation`  | Data mutation only              | Create/update/delete operations           |
| `useVoltaStore`     | State store access              | Direct store consumption                  |

## Import

```tsx
import { react } from '@voltakit/volta'

const { useVoltaComponent, useVoltaRegistry, useVoltaQuery, useVoltaMutation, useVoltaStore } =
  react

// Or direct import
import { useVoltaComponent } from '@voltakit/volta/react'
```

---

## useVoltaComponent

The primary hook for registered components. See [detailed documentation](use-volta-component.md).

```tsx
const { data, state, theme, isLoading, error, refetch } = useVoltaComponent('user-card', {
  props: { userId: '123' },
  themeManager,
})
```

---

## useVoltaRegistry

Unified hook for query and mutation operations without component registration.

```tsx
const {
  data, // Fetched data
  isLoading, // Loading state
  error, // Error if any
  status, // 'idle' | 'loading' | 'success' | 'error'
  mutate, // Mutation function
  remove, // DELETE mutation
  refetch, // Refetch data
  setData, // Optimistically update data
} = useVoltaRegistry<User>({
  endpoint: '/users/:id',
  path: { id: '123' },
})
```

### Options

```typescript
interface UseVoltaRegistryOptions<T> {
  endpoint: string
  path?: Record<string, string | number>
  initialData?: T
  skip?: boolean
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
}
```

### Mutations

```tsx
const { mutate, remove } = useVoltaRegistry<User>({
  endpoint: '/users/:id',
  path: { id: userId },
})

// Update
const handleUpdate = async () => {
  await mutate({ name: 'New Name' }, { method: 'PUT' })
}

// Delete
const handleDelete = async () => {
  await remove()
}
```

### Optimistic Updates

```tsx
const { data, setData, mutate } = useVoltaRegistry<User>({
  endpoint: '/users/:id',
  path: { id },
})

const handleOptimisticUpdate = async () => {
  // Optimistically update UI
  const previousData = data
  setData({ ...data, name: 'New Name' })

  try {
    await mutate({ name: 'New Name' })
  } catch {
    // Rollback on error
    setData(previousData)
  }
}
```

---

## useVoltaQuery

Simple data fetching hook (read-only).

```tsx
const { data, isLoading, error, refetch } = useVoltaQuery<User[]>('/users')

// With path parameters
const { data } = useVoltaQuery<User>('/users/:id', {
  path: { id: '123' },
})
```

---

## useVoltaMutation

Mutation-focused hook.

```tsx
const { mutate, isLoading, error } = useVoltaMutation<User>('/users', {
  method: 'POST',
  invalidates: ['/users'], // Invalidate cache after success
})

const handleCreate = async () => {
  const newUser = await mutate({ name: 'John', email: 'john@example.com' })
}
```

---

## useVoltaStore

Direct store access hook.

```tsx
const { state, set, subscribe } = useVoltaStore<UserState>('user-store')

// Read state
console.log(state.name)

// Update state
set({ name: 'New Name' })
```

---

## Common Patterns

### Loading States

```tsx
function UserList() {
  const { data, isLoading, error } = useVoltaQuery<User[]>('/users')

  if (isLoading) return <Skeleton count={5} />
  if (error) return <Alert variant="error">{error.message}</Alert>
  if (!data?.length) return <Empty message="No users found" />

  return (
    <ul>
      {data.map((user) => (
        <UserItem key={user.id} user={user} />
      ))}
    </ul>
  )
}
```

### Refetch on Focus

```tsx
function UserProfile({ userId }: { userId: string }) {
  const { data, refetch } = useVoltaRegistry<User>({
    endpoint: `/users/${userId}`,
  })

  useEffect(() => {
    const handleFocus = () => refetch()
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [refetch])

  return <div>{data?.name}</div>
}
```

### Polling

```tsx
function LiveData() {
  const { data, refetch } = useVoltaQuery('/metrics')

  useEffect(() => {
    const interval = setInterval(refetch, 5000)
    return () => clearInterval(interval)
  }, [refetch])

  return <MetricsDisplay data={data} />
}
```

## Next Steps

- [useVoltaComponent](use-volta-component.md) - Detailed hook documentation
- [useVoltaRegistry](use-volta-registry.md) - Query/mutation hook
