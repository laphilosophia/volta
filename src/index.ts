// ============================================================================
// Volta - LC/NC Builder Toolkit
// ============================================================================

// Core (Pure TypeScript, framework-agnostic)
// This includes the main Volta API: initVolta, query, mutate, createStore, etc.
export * from './core'

// Layers (Application-level contexts: Theme, Data, State)
// Note: Some types are exported from core/volta.ts, so we explicitly export here
export { ThemeManager, createThemeManager } from './layers/theme-manager'
export type { ThemeChangeEvent, ThemeManagerConfig } from './layers/theme-manager'

// DataLayer internals are NOT exported (internal use only)
// StateLayer internals are NOT exported (use volta API instead)

// Primitives (Headless builder components)
export * from './primitives'

// React Adapter (Optional, for React projects)
export * as react from './react'
