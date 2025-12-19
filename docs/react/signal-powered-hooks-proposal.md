# React Adapter v2: Signal-Powered Hooks

> **Status**: Proposed
> **Author**: Volta Core Team
> **Created**: 2025-12-20
> **Target Version**: v0.7.0

## Executive Summary

Current React adapter uses pure React hooks with manual dependency management, leading to:

- Infinite render loops (fixed 3 times in v0.6.x)
- Complex workarounds (`JSON.stringify`, `useMemo` chains)
- Maintenance burden

**Proposal**: Refactor React hooks to use Sthira signals internally while maintaining the same external hook API. Developers still use familiar hooks, but reactivity is powered by signals.

---

## Problem Statement

### Current Architecture

```
┌─────────────────────────────────────────────────────────┐
│  React Component                                        │
│  ┌───────────────────────────────────────────────────┐  │
│  │  useVoltaComponent()                              │  │
│  │  ├── useState (6x)                                │  │
│  │  ├── useRef (4x)                                  │  │
│  │  ├── useMemo (3x)                                 │  │
│  │  ├── useCallback (2x)                             │  │
│  │  └── useEffect (4x)                               │  │
│  │      └── Manual dependency arrays                 │  │
│  │          └── JSON.stringify workarounds           │  │
│  └───────────────────────────────────────────────────┘  │
│                         ↓                                │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Volta Core (signal-based)                        │  │
│  │  ├── signal(), computed(), effect()              │  │
│  │  └── Automatic dependency tracking               │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

**Issues:**

1. Dependency arrays are error-prone
2. React doesn't know about signal changes
3. Full component re-renders on any state change
4. Complex mental model for maintainers

### Proposed Architecture

```
┌─────────────────────────────────────────────────────────┐
│  React Component                                        │
│  ┌───────────────────────────────────────────────────┐  │
│  │  useVoltaComponent()                              │  │
│  │  └── useSignalBridge()                            │  │
│  │      └── effect() subscription                    │  │
│  │          └── forceUpdate on signal change         │  │
│  └───────────────────────────────────────────────────┘  │
│                         ↓                                │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Signal Layer                                     │  │
│  │  ├── props$ = signal(props)                       │  │
│  │  ├── data$ = computed(() => fetch(props$()))     │  │
│  │  └── Automatic dependency tracking               │  │
│  └───────────────────────────────────────────────────┘  │
│                         ↓                                │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Volta Core                                       │  │
│  │  └── Pure signal-based API                       │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: Signal Bridge (Foundation)

**Goal**: Create the bridge between Sthira signals and React.

#### 1.1 Create `useSignalBridge` hook

```typescript
// src/react/hooks/useSignalBridge.ts
import { effect } from '@sthirajs/core'
import { useState, useEffect, useRef } from 'react'

export function useSignalBridge<T>(factory: () => T): T {
  const [, forceUpdate] = useState({})
  const stateRef = useRef<{ result: T; cleanup: () => void } | null>(null)

  // Initialize once
  if (stateRef.current === null) {
    let result: T
    const cleanup = effect(() => {
      result = factory()
      forceUpdate({})
    })
    stateRef.current = { result: result!, cleanup }
  }

  // Cleanup on unmount
  useEffect(() => () => stateRef.current?.cleanup(), [])

  return stateRef.current.result
}
```

#### 1.2 Create `useSignal` primitive hook

```typescript
// src/react/hooks/useSignal.ts
import { signal, type Signal } from '@sthirajs/core'
import { useSignalBridge } from './useSignalBridge'

export function useSignal<T>(initialValue: T): Signal<T> {
  return useSignalBridge(() => signal(initialValue))
}

export function useSignalValue<T>(sig: Signal<T>): T {
  return useSignalBridge(() => sig())
}
```

#### 1.3 Create `useComputed` hook

```typescript
// src/react/hooks/useComputed.ts
import { computed } from '@sthirajs/core'
import { useSignalBridge } from './useSignalBridge'

export function useComputed<T>(fn: () => T): T {
  return useSignalBridge(() => computed(fn)())
}
```

**Deliverables:**

- [ ] `useSignalBridge.ts`
- [ ] `useSignal.ts`
- [ ] `useComputed.ts`
- [ ] Unit tests for each

---

### Phase 2: Refactor Data Hooks

**Goal**: Refactor `useVoltaQuery` and `useVoltaMutation` to use signals.

#### 2.1 `useVoltaQuery` refactor

```typescript
// Before: 180 lines with complex dependency management
// After: ~60 lines with signal-based reactivity

export function useVoltaQuery<T>(
  endpoint: string,
  options: UseVoltaQueryOptions = {}
): UseVoltaQueryResult<T> {
  return useSignalBridge(() => {
    const enabled$ = signal(options.enabled ?? true)
    const path$ = signal(options.path)

    // Computed with async support
    const query$ = computed(async () => {
      if (!enabled$()) return { data: undefined, status: 'idle' }

      try {
        const data = await query<T>(endpoint, { path: path$() })
        return { data, status: 'success', error: null }
      } catch (error) {
        return { data: undefined, status: 'error', error }
      }
    })

    return {
      data: query$()?.data,
      isLoading: query$.pending,
      isError: query$()?.status === 'error',
      error: query$()?.error,
      refetch: () => query$.invalidate(),
    }
  })
}
```

#### 2.2 `useVoltaMutation` refactor

Similar pattern - signals for state, computed for derived values.

**Deliverables:**

- [ ] Refactored `useVoltaQuery.ts`
- [ ] Refactored `useVoltaMutation.ts`
- [ ] Updated tests
- [ ] Migration guide for breaking changes (if any)

---

### Phase 3: Refactor Component Hooks

**Goal**: Refactor `useVoltaComponent` and `useVoltaRegistry`.

#### 3.1 `useVoltaComponent` refactor

```typescript
export function useVoltaComponent(
  componentKey: string,
  options: UseVoltaComponentOptions = {}
): VoltaComponentResult {
  return useSignalBridge(() => {
    const props$ = signal(options.props ?? {})
    const skip$ = signal(options.skip ?? false)

    // Data bindings - automatic dependency tracking
    const data$ = computed(async () => {
      if (skip$()) return { data: {}, status: 'idle' }
      return await resolveDataBindings(componentKey, props$())
    })

    // Theme bindings
    const theme$ = computed(() => {
      if (!options.themeManager) return {}
      return resolveThemeBindings(componentKey, options.themeManager)
    })

    // State bindings
    const state$ = computed(async () => {
      const instance = createInstance(componentKey)
      return await resolveStateBindings(componentKey, instance.id)
    })

    return {
      data: data$()?.data ?? {},
      theme: theme$(),
      state: state$(),
      isLoading: data$.pending,
      error: data$()?.error,
      refetch: () => data$.invalidate(),
    }
  })
}
```

**Deliverables:**

- [ ] Refactored `useVoltaComponent.ts`
- [ ] Refactored `useVoltaRegistry.ts`
- [ ] Refactored `useVoltaStore.ts`
- [ ] Updated tests

---

### Phase 4: Provider Simplification

**Goal**: Simplify VoltaProvider and ThemeProvider using signals.

#### 4.1 `VoltaProvider` simplification

```typescript
// Module-level signal for global Volta state
const voltaState$ = signal<{ isReady: boolean; config: VoltaConfig | null }>({
  isReady: false,
  config: null,
})

export function VoltaProvider({ config, children }: VoltaProviderProps) {
  // One-time initialization
  useEffect(() => {
    initVolta(config)
    voltaState$.set({ isReady: true, config })
    return () => destroyVolta()
  }, [])

  return <VoltaContext.Provider value={voltaState$}>{children}</VoltaContext.Provider>
}

export function useVolta() {
  const state$ = useContext(VoltaContext)
  return useSignalValue(state$)
}
```

**Deliverables:**

- [ ] Simplified `VoltaProvider.tsx`
- [ ] Simplified `ThemeProvider.tsx`
- [ ] Remove workarounds and refs

---

### Phase 5: Testing & Documentation

**Goal**: Ensure stability and document the new architecture.

- [ ] Update all existing tests
- [ ] Add signal-specific tests
- [ ] Performance benchmarks (before/after)
- [ ] Update React hooks documentation
- [ ] Add architecture diagram to ARCHITECTURE.md
- [ ] Migration guide for v0.6 → v0.7

---

## Technical Considerations

### SSR Compatibility

Sthira signals need SSR testing:

```typescript
// Potential SSR guard
if (typeof window === 'undefined') {
  // Return static snapshot instead of reactive signal
  return factory() // No subscription
}
```

### React Concurrent Mode

The `effect()` subscription timing must work with:

- Strict Mode (double mount)
- Suspense
- Transitions

### DevTools Integration

Consider custom React DevTools extension or console logging for signal debugging.

---

## Success Metrics

| Metric                        | Current (v0.6) | Target (v0.7) |
| ----------------------------- | -------------- | ------------- |
| Lines of code in hooks        | ~800           | ~300          |
| `useMemo`/`useCallback` count | 15+            | 0             |
| Dependency arrays             | 20+            | 0             |
| Infinite loop bugs            | 3 in v0.6.x    | 0             |
| Re-render efficiency          | Full component | Granular      |

---

## Timeline

| Phase                    | Duration     | Dependencies   |
| ------------------------ | ------------ | -------------- |
| Phase 1: Bridge          | 2-3 days     | Sthira v0.3.2+ |
| Phase 2: Data Hooks      | 2-3 days     | Phase 1        |
| Phase 3: Component Hooks | 2-3 days     | Phase 2        |
| Phase 4: Providers       | 1-2 days     | Phase 3        |
| Phase 5: Testing & Docs  | 2-3 days     | Phase 4        |
| **Total**                | **~2 weeks** |                |

---

## Breaking Changes

### Potentially Breaking

1. **Internal state timing**: Signal updates are synchronous, React batches
2. **Ref behavior**: If anyone depended on internal refs (unlikely)

### Non-Breaking

- All public hook APIs remain the same
- Return types unchanged
- Options unchanged

---

## Decision

> **Approved / Pending / Rejected**: Pending review

This refactor is recommended because:

1. Core is already signal-based - adapter should leverage it
2. Eliminates entire class of bugs (dependency arrays)
3. Simplifies codebase significantly
4. Sets foundation for future reactive features
5. No breaking changes to public API
