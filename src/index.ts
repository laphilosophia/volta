// ============================================================================
// Volta - LC/NC Builder Toolkit
// ============================================================================

// Core (Pure TypeScript, framework-agnostic)
export * from './core'

// Layers (Application-level contexts)
export { createThemeManager, ThemeManager } from './layers'
export type { ThemeChangeEvent, ThemeManagerConfig } from './layers'

// Primitives (Headless builder components)
export * from './primitives'

// React Adapter (Optional, for React projects)
export * as react from './react'
