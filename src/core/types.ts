// ============================================================================
// Core Types - CRM Platform
// ============================================================================

import type { DataSourceConfig, LayoutTemplate } from './types/layout'

// Re-export for convenience
export type { DataSourceConfig, LayoutTemplate }
/** Tenant theme configuration for white-label support */
export interface TenantTheme {
  tenantId: string
  colors: {
    primary: string
    secondary: string
    accent: string
    neutral: string
  }
  logo: string
  favicon: string
}

/** Component definition for dynamic registration */
export interface ComponentDefinition {
  id: string
  type: 'input' | 'select' | 'graph' | 'tree' | 'table' | 'custom' | 'form'
  schema: Record<string, unknown> // JSON Schema for validation
  defaultProps: Record<string, unknown>
  renderMode: 'edit' | 'view' | 'both'
  category?: string
  label?: Record<string, string> // i18n labels
}

/** Page metadata from backend */
export interface PageMetadata {
  pageId: string
  title: Record<string, string> // i18n: { en: "Overview", tr: "Genel Bakış" }
  description?: Record<string, string>
  components: ComponentMetadata[]
  layout?: LayoutTemplate | 'grid' | 'flex' | 'stack'
}

/** Component metadata for runtime rendering */
export interface ComponentMetadata {
  id: string
  type: string
  dataSource?: DataSourceConfig
  props: Record<string, unknown>
  position?: {
    x: number
    y: number
    width: number
    height: number
  }
  children?: ComponentMetadata[]
}

// Note: DataSourceConfig is now defined in types/layout.ts with extended capabilities

/** API response wrapper */
export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  meta?: {
    page?: number
    limit?: number
    total?: number
  }
}

/** User information */
export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'editor' | 'viewer'
  tenantId: string
  locale: string
}

/** Feature flags for tenant-level rollout */
export interface FeatureFlags {
  newDesigner: boolean
  darkMode: boolean
  sseSupport: boolean
  experimentalFeatures: boolean
}
