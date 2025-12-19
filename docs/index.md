# Volta Documentation

> **Volta** - Framework-agnostic toolkit for building low-code/no-code platforms

Welcome to the Volta documentation. Volta provides the essential building blocks for creating visual builders, form generators, and metadata-driven applications.

## Quick Navigation

### Getting Started

- [Installation](getting-started/installation.md) - Install Volta in your project
- [Initialization](getting-started/initialization.md) - Configure and initialize Volta

### Core Concepts

- [Vanilla API](core-concepts/vanilla-api.md) - Framework-agnostic `query()`, `mutate()`, `invalidate()`
- [Component Registry](core-concepts/component-registry.md) - `register()`, `query()`, `store()` primitives
- [Signals & Derived Stores](core-concepts/signals.md) - Reactive computations with `createDerivedStore()`
- [Lifecycle](core-concepts/lifecycle.md) - `holdVolta()`, `resumeVolta()`, `destroyVolta()`

### Layers

- [ThemeManager](layers/theme-manager.md) - White-label theming with CSS variables
- [Data & State Layers](layers/internals.md) - Internal architecture (not public API)

### React Adapter

- [Hooks Overview](react/hooks.md) - All available React hooks
- [useVoltaComponent](react/use-volta-component.md) - Auto-wiring for registered components
- [useVoltaRegistry](react/use-volta-registry.md) - Unified query/mutation hook
- [Providers](react/providers.md) - ThemeProvider and context setup

### API Reference

- [Core API](api-reference/core.md) - Complete vanilla API reference
- [React API](api-reference/react.md) - React adapter API reference
- [Types](api-reference/types.md) - TypeScript type definitions

### Guides

- [Migration from v0.4.x](guides/migration-v04-v05.md) - Upgrade guide
- [Building LC/NC Platforms](guides/building-lc-nc.md) - Real-world integration patterns

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Your Application                      │
├─────────────────────────────────────────────────────────┤
│                    React Adapter                         │
│  (useVoltaComponent, useVoltaRegistry, useVoltaStore)    │
├─────────────────────────────────────────────────────────┤
│                     Volta Core                           │
│     (query, mutate, register, createDerivedStore)        │
├─────────────────────────────────────────────────────────┤
│                   Internal Layers                        │
│       (ThemeManager, DataLayer, StateLayer)              │
├─────────────────────────────────────────────────────────┤
│                   @sthirajs/core                         │
│        (signal, computed, effect, batch)                 │
└─────────────────────────────────────────────────────────┘
```

## Design Principles

1. **Vanilla-First**: Core logic is framework-agnostic
2. **Signal Integration**: Built on Sthira signals for fine-grained reactivity
3. **Layered Architecture**: Clear separation of concerns
4. **Type-Safe**: Full TypeScript generics support
5. **Multi-Tenant Ready**: CDN-based tenant theme loading
