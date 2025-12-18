# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.5.0] - 2025-12-19

### 🎯 True Builder Framework Milestone

This release transforms Volta into a vanilla-first, framework-agnostic builder framework with signal-based reactivity.

### Added

#### Component Registration System

- **`register()`** - Vanilla component registration with override protection
- **`query()`** - Data binding factory for lazy data fetching
- **`store()`** - State binding factory for scoped stores
- **`getComponent()`**, **`listComponents()`** - Registry access

```typescript
const userData = query({ endpoint: '/users/:userId', params: ['userId'] })
const userState = store({ initial: { tab: 'info' } })

register('user-card', {
  type: 'data-display',
  component: () => import('./UserCard'),
  data: userData,
  state: userState,
  theme: ['colors.primary'],
})
```

#### Binding Resolution

- **`resolveDataBindings()`** - Fetch data with AbortController support
- **`resolveStateBindings()`** - Create instance-scoped stores
- **`resolveThemeBindings()`** - Subscribe to theme tokens automatically

#### Signal-Based Derived Stores

- **`createDerivedStore()`** - Uses `@sthirajs/core` computed signals
- **`createLegacyDerivedStore()`** - For getState/subscribe pattern

```typescript
import { signal } from '@sthirajs/core'

const count = signal(5)
const derived = createDerivedStore([count], ([c]) => c * 2)
```

#### React Adapter

- **`useVoltaComponent()`** - Auto-resolve data, state, theme on mount

### Changed

- Layers renamed to lowercase (`DataLayer` → `data-layer`)
- Updated `@sthirajs/core` to 0.3.2 (synchronous signal invalidation)

### Tests

- 91 tests passing

---

## [0.4.0] - 2025-12-18

### 🎯 Unified Registry Milestone

This release introduces the unified `useVoltaRegistry` hook with optimistic mutations and improved DX.

### Added

#### useVoltaRegistry Hook

- **Unified API** - Single hook for query + mutation operations
- **Auto-generated keys** - Symbol keys auto-generated from endpoint (no manual key required)
- **Optimistic updates** - Enabled by default with automatic rollback on error
- **FSM status** - Query states: `idle`, `pending`, `success`, `error`
- **Generic request method** - `request()` supports all HTTP methods

```typescript
const { data, loading, mutate, remove, request } = useVoltaRegistry<User>({
  endpoint: '/api/users',
})
```

#### DataLayer Enhancements

- **Retry config** - Global and per-endpoint retry settings
- **Timeout support** - Configurable request timeouts
- **AbortController** - Request cancellation with AbortSignal
- **cancelOnNewRequest** - Auto-cancel previous GET requests

### Changed

- `key` is now optional in `useVoltaRegistry` - auto-generated from endpoint
- Added `request()` method for generic HTTP operations

### Tests

- Added 13 new tests for useVoltaRegistry
- Total test count: 81

---

## [0.3.0] - 2025-12-17

### 🎯 Data Layer Milestone

This release introduces the Data Layer, State Layer, and React hooks for data fetching and state management.

### Added

#### Data Layer

- **DataLayer** class - High-level API for data fetching with `@sthirajs/fetch` integration
- Automatic caching with configurable stale/cache times
- Request interceptors (onRequest, onResponse, onError)
- Path parameter resolution (e.g., `/users/:id`)

#### State Layer

- **StateLayer** class - Centralized store registry with namespace isolation
- Redux DevTools integration via `@sthirajs/devtools`
- Cross-tab synchronization via `@sthirajs/cross-tab`
- Store lifecycle management (create, get, destroy)

#### React Hooks

- `useVoltaQuery` - Data fetching with caching, refetch on focus/reconnect
- `useVoltaMutation` - Mutations with optimistic updates and cache invalidation
- `useVoltaStore` - Sthira store consumption with selector support

### Changed

- **Folder Structure** - All layers now use consistent subfolder structure:
  - `src/layers/ThemeManager/`
  - `src/layers/DataLayer/`
  - `src/layers/StateLayer/`
- **Dependencies** - All `@sthirajs/*` packages are now regular dependencies (not peer)
- **ApiClient** - Marked as `@deprecated`, use DataLayer instead

### Tests

- Added 27 new tests (DataLayer: 10, StateLayer: 17)
- Total test count: 68

---

## [0.1.0-alpha.1] - 2025-12-16

### 🎉 Initial Alpha Release

This is the first public alpha release of Volta - a metadata-driven low-code platform.

### Added

#### Core Features

- **Visual Designer** - Drag-and-drop interface for building pages and layouts
- **Dynamic Runtime** - Lightweight rendering engine that interprets JSON metadata
- **Headless Architecture** - Core logic decoupled from presentation (`src/components/headless`)
- **Component Registry** - Extensible architecture for custom React components
- **Undo/Redo System** - Time-travel debugging with Zundo middleware
- **History Panel** - Visual history management for layout changes

#### Components

- Headless components: DataTable, ActionForm, QueryBuilder
- Predefined UI components: Button, Input, Card, Modal, DataTable
- Designer components: ComponentPalette, PropertyInspector, LayoutCanvas, Toolbar

#### Data Integration

- API data source support with `useVoltaQuery`
- Static JSON data support
- Component binding for inter-component data flow
- Configurable API client with interceptors

#### Developer Experience

- **Storybook** - Component playground and documentation
- **CLI Generators** - Scaffolding for headless/predefined components and hooks
- **Vitest** - Unit and integration testing
- **Playwright** - E2E testing with multi-browser support
- **Husky + lint-staged** - Pre-commit quality hooks

#### Theming & i18n

- Dark mode support
- Theming engine with CSS variables
- i18next integration for localization

### Technical Stack

- React 19.2
- TypeScript 5.9
- Tailwind CSS 4.1
- Vite 6.0
- Zustand 5.0 (state management)
- Zod 4.2 (schema validation)
- TanStack Query 5.x (data fetching)
- TanStack Table 8.x (table management)

### Known Issues

- Firefox/WebKit have timing issues with drag-and-drop tests
- Code coverage infrastructure not yet configured
- Documentation site not yet live

---

[0.4.0]: https://github.com/laphilosophia/volta/releases/tag/v0.4.0
[0.3.0]: https://github.com/laphilosophia/volta/releases/tag/v0.3.0
[0.1.0-alpha.1]: https://github.com/laphilosophia/volta/releases/tag/v0.1.0-alpha.1
