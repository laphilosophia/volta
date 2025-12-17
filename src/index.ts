// ============================================================================
// Volta - LC/NC Builder Toolkit
// ============================================================================

// Core (Pure TypeScript, framework-agnostic)
export * from './core'

// Layers (Application-level contexts)
// Note: TenantTheme is also exported from core/types, using layers version
export { themeManager } from './layers'
export type { TenantTheme } from './layers/ThemeManager'

// Primitives (Headless builder components)
export * from './primitives'

// React Adapter (Optional, for React projects)
export * as react from './react'
