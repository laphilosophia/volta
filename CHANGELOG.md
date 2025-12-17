# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

### What's Next (Roadmap to Stable)

- [ ] Accessibility (A11y) compliance
- [ ] Documentation site (VitePress)
- [ ] Code coverage 70%+
- [ ] React 19 Strict Mode compliance

---

[0.1.0-alpha.1]: https://github.com/laphilosophia/volta/releases/tag/v0.1.0-alpha.1
