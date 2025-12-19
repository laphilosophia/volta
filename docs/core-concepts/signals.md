# Signals & Derived Stores

Volta integrates with `@sthirajs/core` to provide signal-based reactivity. This enables fine-grained updates and derived computations without framework-specific code.

## Overview

```typescript
import { signal } from '@sthirajs/core'
import { createDerivedStore } from '@voltakit/volta'

const count = signal(5)
const multiplier = signal(2)

const product = createDerivedStore([count, multiplier], ([c, m]) => c * m)

console.log(product.getValue()) // 10

count.set(10)
console.log(product.getValue()) // 20
```

## createDerivedStore()

Create a derived store that automatically recomputes when source signals change.

### Signature

```typescript
function createDerivedStore<T, Sources extends SignalSource<unknown>[]>(
  sources: [...Sources],
  compute: (values: InferValues<Sources>) => T
): DerivedStoreResult<T>
```

### Return Value

```typescript
interface DerivedStoreResult<T> {
  /** Get current computed value */
  getValue: () => T

  /** Underlying computed signal */
  signal: ComputedSignal<T>

  /** Subscribe to value changes */
  subscribe: (callback: (value: T) => void) => () => void

  /** Cleanup all subscriptions */
  destroy: () => void
}
```

### Examples

**Basic Derivation**

```typescript
const firstName = signal('John')
const lastName = signal('Doe')

const fullName = createDerivedStore([firstName, lastName], ([first, last]) => `${first} ${last}`)

console.log(fullName.getValue()) // 'John Doe'

firstName.set('Jane')
console.log(fullName.getValue()) // 'Jane Doe'
```

**Complex Computations**

```typescript
const items = signal([
  { id: 1, price: 10, qty: 2 },
  { id: 2, price: 25, qty: 1 },
])
const taxRate = signal(0.08)

const totals = createDerivedStore([items, taxRate], ([items, tax]) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0)
  const taxAmount = subtotal * tax
  return {
    subtotal,
    tax: taxAmount,
    total: subtotal + taxAmount,
  }
})

console.log(totals.getValue())
// { subtotal: 45, tax: 3.6, total: 48.6 }
```

**Subscribing to Changes**

```typescript
const count = signal(0)
const doubled = createDerivedStore([count], ([c]) => c * 2)

const unsubscribe = doubled.subscribe((value) => {
  console.log('Doubled value:', value)
})

count.set(5) // Logs: "Doubled value: 10"
count.set(7) // Logs: "Doubled value: 14"

unsubscribe() // Stop listening
```

**Accessing the Signal**

```typescript
import { effect } from '@sthirajs/core'

const derived = createDerivedStore([count], ([c]) => c * 2)

// Use in Sthira effects
effect(() => {
  console.log('Value:', derived.signal.get())
})
```

## createLegacyDerivedStore()

For stores using the `getState()`/`subscribe()` pattern (Zustand-like).

### Signature

```typescript
function createLegacyDerivedStore<T, Sources extends LegacySourceStore<unknown>[]>(
  sources: [...Sources],
  compute: (values: InferLegacyValues<Sources>) => T
): Omit<DerivedStoreResult<T>, 'signal'>
```

### Usage

```typescript
import { createLegacyDerivedStore } from '@voltakit/volta'

// Sthira stores use getState/subscribe
const userStore = getStateLayer().createStore('user', {
  initialState: { name: 'John', age: 30 },
})

const settingsStore = getStateLayer().createStore('settings', {
  initialState: { theme: 'dark' },
})

const derived = createLegacyDerivedStore([userStore, settingsStore], ([user, settings]) => ({
  displayName: user.name,
  isDarkMode: settings.theme === 'dark',
}))

console.log(derived.getValue())
// { displayName: 'John', isDarkMode: true }
```

## Cleanup

Always destroy derived stores when no longer needed to prevent memory leaks:

```typescript
const derived = createDerivedStore([signal1, signal2], compute)

// Use derived...

// Cleanup
derived.destroy()
```

In React, use `useEffect` cleanup:

```tsx
useEffect(() => {
  const derived = createDerivedStore([count], ([c]) => c * 2)

  return () => derived.destroy()
}, [])
```

## Signal Primer

Volta uses `@sthirajs/core` for signals. Quick overview:

```typescript
import { signal, computed, effect, batch } from '@sthirajs/core'

// Create a signal
const count = signal(0)
count.get() // Read: 0
count.set(5) // Write

// Create a computed (auto-tracks dependencies)
const doubled = computed(() => count.get() * 2)
doubled.get() // 10

// Create an effect (runs on change)
const dispose = effect(() => {
  console.log('Count is:', count.get())
})

// Batch multiple updates
batch(() => {
  count.set(10)
  otherSignal.set('value')
}) // Effects run once after batch
```

## Next Steps

- [useVoltaStore](../react/hooks.md#usevoltastore) - React hook for store consumption
- [API Reference](../api-reference/core.md) - Full signal API
