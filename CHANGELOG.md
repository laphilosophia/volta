# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.6.3] - 2025-12-20

### 🔧 Code Quality Improvements

- **VoltaProvider**: Refactored with lazy `useState` initializer pattern (no more `setState` in effects)
- **VoltaContext**: Separated from provider for React Fast Refresh compliance
- **ThemeProvider**: Added stable config documentation
- **useVoltaQuery**: Fixed dependency array with `useMemo` pattern
- **useVoltaMutation**: Added proper cleanup effect for `mountedRef`
- **ThemeContext**: Replaced `any` with `object` constraint

### 🐛 Fixes

- Removed all `eslint-disable` directives with proper architectural fixes
- Fixed type assertions in theme context system

---

## [0.6.2] - 2025-12-19

### 🐛 Fixes

- Fixed build failing lint errors (refs in render, explicit any).
- Resolved Fast Refresh linter rules in `VoltaProvider`.

---

## [0.6.1] - 2025-12-19

### 🐛 Fixes

- Trigger CI release pipeline (v0.6.0 was skipped).

---

## [0.6.0] - 2025-12-19

### 🎯 React Adapter & Builder Milestone

This release introduces a completely refactored React adapter and the "Component Builder" example, showcasing Volta's visual building capabilities.

### Added

#### New React Adapter (`@voltakit/volta/react`)

- **`useVolta()`** - Simple provider access
- **`useCreateStore()`** - Reactive store creation
- **`useVoltaStore()`** - Store subscription hook
- **`useVoltaQuery`** / **`useVoltaMutation`** - Data fetching hooks

#### Examples

- **Component Builder** - Complete low-code dashboard builder with DnD
- **React CRM** - Full business application demo

### Fixed

- **Module Structure**: React adapter is now isolated in its own entry point
- **Types**: Improved TypeScript inference for all hooks

---

## [0.5.1] - 2025-12-19

### 🔧 State Bindings & Documentation Overhaul

This release integrates state bindings into the React hook and provides comprehensive documentation.

### Added

#### State Bindings in useVoltaComponent

- **Instance lifecycle management** - `createInstance()` on mount, `destroyInstance()` on unmount
- **`state` property** in `VoltaComponentResult` - Access instance-scoped stores
- **Automatic cleanup** - Stores destroyed when component unmounts

```tsx
const { data, state, theme } = useVoltaComponent('user-card', { props: { userId } })
// state.counter is now available and scoped to this instance
```

#### Professional Documentation Structure

- **docs/index.md** - Main documentation index with navigation
- **docs/getting-started/** - Installation, initialization guides
- **docs/core-concepts/** - Vanilla API, Component Registry, Signals, Lifecycle
- **docs/layers/** - ThemeManager documentation
- **docs/react/** - Hooks overview, useVoltaComponent detailed guide
- **docs/guides/** - Migration guide from v0.4.x

### Changed

- `ARCHITECTURE.md` - Removed deprecated `getDataLayer()`/`getStateLayer()` examples
- `INTEGRATION.md` - Updated to use `initVolta()` instead of separate layer inits
- `README.md` - Added vanilla API examples, updated documentation links

### Fixed

- `instances` Map in ComponentRegistry now uses Symbol keys correctly
- `getInstanceCount()` returns actual instance count (not symbol count)
- `clearRegistry()` now also clears instances

### Dependencies

- `@sthirajs/core`: 0.3.1 → 0.3.6
- `@sthirajs/cross-tab`: 1.0.0 → 2.0.1
- `@sthirajs/devtools`: 1.0.0 → 2.0.0
- `@sthirajs/fetch`: 1.0.0 → 2.0.0
- `@sthirajs/react`: 1.0.0 → 2.0.0

### Tests

- 98 tests passing
- Added `useVoltaComponent.test.tsx` with 4 new tests
- Added `resolveStateBindings` tests in ComponentRegistry

---

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

[0.5.1]: https://github.com/laphilosophia/volta/releases/tag/v0.5.1
[0.5.0]: https://github.com/laphilosophia/volta/releases/tag/v0.5.0
[0.4.0]: https://github.com/laphilosophia/volta/releases/tag/v0.4.0
[0.3.0]: https://github.com/laphilosophia/volta/releases/tag/v0.3.0
[0.1.0-alpha.1]: https://github.com/laphilosophia/volta/releases/tag/v0.1.0-alpha.1
