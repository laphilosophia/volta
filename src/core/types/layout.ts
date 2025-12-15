// ============================================================================
// Layout Types - Page Layout System
// ============================================================================

import type { ComponentMetadata } from '../types'

/**
 * Layout zone position types
 */
export type ZonePosition = 'header' | 'sidebar' | 'main' | 'footer'

/**
 * Layout template structure types
 */
export type LayoutStructure =
  | 'full-width'
  | 'sidebar-left'
  | 'sidebar-right'
  | 'two-column'
  | 'dashboard-grid'

/**
 * Layout zone definition
 */
export interface LayoutZone {
  id: string
  name: string
  position: ZonePosition
  size?: {
    width?: string
    height?: string
    minWidth?: string
    maxWidth?: string
  }
  components: ComponentMetadata[]
  allowedComponentTypes?: string[] // Restrict what can be dropped
  maxComponents?: number
}

/**
 * Layout template definition
 */
export interface LayoutTemplate {
  id: string
  name: string
  description?: string
  icon?: string
  structure: LayoutStructure
  zones: LayoutZone[]
  defaultStyles?: Record<string, string>
}

/**
 * Data source types for components
 */
export type DataSourceType = 'api' | 'query' | 'static' | 'binding'

/**
 * Data source configuration
 */
export interface DataSourceConfig {
  type: DataSourceType

  // API Configuration
  endpoint?: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: Record<string, string>
  body?: unknown
  refreshInterval?: number // Auto-refresh in ms

  // Query Builder Configuration
  query?: {
    combinator: string
    rules: unknown[]
  }
  table?: string
  outputFormat?: 'sql' | 'json' | 'mongodb'

  // Static Data
  staticData?: unknown

  // Binding (depends on another component)
  bindingSource?: {
    componentId: string
    outputKey: string
    transform?: string // Optional transformation expression
  }

  // Response transformation
  responsePath?: string // e.g., 'data.items' to extract nested data
}

/**
 * Component output definition (what a component can emit)
 */
export interface ComponentOutput {
  key: string
  label: string
  type: 'string' | 'number' | 'object' | 'array'
  description?: string
}

/**
 * Component binding configuration
 */
export interface ComponentBinding {
  componentId: string
  outputs: ComponentOutput[]
  subscribers: {
    componentId: string
    inputKey: string
  }[]
}

// ============================================================================
// Pre-defined Layout Templates
// ============================================================================

export const layoutTemplates: LayoutTemplate[] = [
  {
    id: 'full-width',
    name: 'Full Width',
    description: 'Single column layout spanning full width',
    icon: 'layout',
    structure: 'full-width',
    zones: [
      {
        id: 'main',
        name: 'Main Content',
        position: 'main',
        components: [],
      },
    ],
  },
  {
    id: 'sidebar-left',
    name: 'Sidebar Left',
    description: 'Left sidebar with main content area',
    icon: 'sidebar',
    structure: 'sidebar-left',
    zones: [
      {
        id: 'sidebar',
        name: 'Sidebar',
        position: 'sidebar',
        size: { width: '280px', minWidth: '200px', maxWidth: '400px' },
        components: [],
        allowedComponentTypes: ['data-tree', 'multi-select'],
      },
      {
        id: 'main',
        name: 'Main Content',
        position: 'main',
        components: [],
      },
    ],
  },
  {
    id: 'sidebar-right',
    name: 'Sidebar Right',
    description: 'Main content with right sidebar',
    icon: 'sidebar-right',
    structure: 'sidebar-right',
    zones: [
      {
        id: 'main',
        name: 'Main Content',
        position: 'main',
        components: [],
      },
      {
        id: 'sidebar',
        name: 'Sidebar',
        position: 'sidebar',
        size: { width: '320px' },
        components: [],
      },
    ],
  },
  {
    id: 'header-sidebar-main',
    name: 'Header + Sidebar + Main',
    description: 'Full page layout with header, sidebar and main area',
    icon: 'layout-dashboard',
    structure: 'sidebar-left',
    zones: [
      {
        id: 'header',
        name: 'Header',
        position: 'header',
        size: { height: '64px' },
        components: [],
        maxComponents: 1,
      },
      {
        id: 'sidebar',
        name: 'Sidebar',
        position: 'sidebar',
        size: { width: '280px' },
        components: [],
      },
      {
        id: 'main',
        name: 'Main Content',
        position: 'main',
        components: [],
      },
    ],
  },
  {
    id: 'two-column',
    name: 'Two Column',
    description: 'Equal two-column layout',
    icon: 'columns',
    structure: 'two-column',
    zones: [
      {
        id: 'left',
        name: 'Left Column',
        position: 'main',
        size: { width: '50%' },
        components: [],
      },
      {
        id: 'right',
        name: 'Right Column',
        position: 'main',
        size: { width: '50%' },
        components: [],
      },
    ],
  },
]

/**
 * Get layout template by ID
 */
export function getLayoutTemplate(id: string): LayoutTemplate | undefined {
  return layoutTemplates.find((t) => t.id === id)
}

/**
 * Create a deep copy of a layout template for page use
 */
export function cloneLayoutTemplate(template: LayoutTemplate): LayoutTemplate {
  return JSON.parse(JSON.stringify(template))
}
