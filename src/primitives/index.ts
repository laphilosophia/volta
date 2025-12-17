// Volta Primitives
// Headless, composable building blocks for LC/NC builders

// Note: Primitives will be implemented when Sthira integration is complete.
// For now, this module exports type definitions for builders.

export interface PrimitiveComponent<T = unknown> {
  /** Component identifier */
  id: string
  /** Component props */
  props: T
  /** Children components (if any) */
  children?: PrimitiveComponent[]
}

// ActionForm will be a headless form primitive
// DataTable will be a headless table primitive
// These require Sthira's data layer for full implementation
