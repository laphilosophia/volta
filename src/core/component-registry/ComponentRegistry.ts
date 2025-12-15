// ============================================================================
// Component Registry - Dynamic Component Management
// ============================================================================

import { type ComponentType, lazy } from 'react'
import type { ComponentDefinition, ComponentMetadata } from '../types'

/** Component loader function type */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ComponentLoader = () => Promise<{ default: ComponentType<any> }>

/**
 * ComponentRegistry manages dynamic component registration and loading.
 * Supports lazy loading for code splitting and performance optimization.
 */
class ComponentRegistry {
  private registry = new Map<string, ComponentDefinition>()
  private loaders = new Map<string, ComponentLoader>()
  private components = new Map<string, ComponentType<unknown>>()

  /**
   * Register a component definition with optional lazy loader
   */
  register(def: ComponentDefinition, loader?: ComponentLoader): void {
    this.registry.set(def.id, def)
    if (loader) {
      this.loaders.set(def.id, loader)
    }
  }

  /**
   * Get a component definition by ID
   */
  get(id: string): ComponentDefinition | undefined {
    return this.registry.get(id)
  }

  /**
   * Check if a component is registered
   */
  has(id: string): boolean {
    return this.registry.has(id)
  }

  /**
   * Get a lazy-loaded component by ID
   */
  getLoader(id: string): ComponentType<unknown> {
    const cached = this.components.get(id)
    if (cached) {
      return cached
    }

    const loader = this.loaders.get(id)
    if (!loader) {
      throw new Error(`Component loader not found for: ${id}`)
    }

    const LazyComponent = lazy(loader)
    this.components.set(id, LazyComponent)
    return LazyComponent
  }

  /**
   * Validate component metadata against its definition schema
   */
  validate(metadata: ComponentMetadata): boolean {
    const def = this.get(metadata.type)
    if (!def) {
      console.warn(`Component definition not found for: ${metadata.type}`)
      return false
    }
    // TODO: Implement JSON Schema validation using Zod or Ajv
    return true
  }

  /**
   * List all registered component definitions
   */
  list(): ComponentDefinition[] {
    return Array.from(this.registry.values())
  }

  /**
   * List components by category
   */
  listByCategory(category: string): ComponentDefinition[] {
    return this.list().filter((def) => def.category === category)
  }

  /**
   * Get all available categories
   */
  getCategories(): string[] {
    const categories = new Set<string>()
    this.list().forEach((def) => {
      if (def.category) {
        categories.add(def.category)
      }
    })
    return Array.from(categories)
  }

  /**
   * Unregister a component
   */
  unregister(id: string): boolean {
    this.loaders.delete(id)
    this.components.delete(id)
    return this.registry.delete(id)
  }

  /**
   * Clear all registered components
   */
  clear(): void {
    this.registry.clear()
    this.loaders.clear()
    this.components.clear()
  }
}

// Singleton instance
export const componentRegistry = new ComponentRegistry()

// ============================================================================
// Register Predefined Components
// ============================================================================

// Data Tree Component
componentRegistry.register(
  {
    id: 'data-tree',
    type: 'tree',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array' },
        expandable: { type: 'boolean' },
        selectable: { type: 'boolean' },
      },
    },
    defaultProps: { expandable: true, selectable: false },
    renderMode: 'view',
    category: 'data',
    label: { en: 'Data Tree', tr: 'Veri Ağacı' },
  },
  () => import('../../components/predefined/DataTree')
)

// Multi Select Component
componentRegistry.register(
  {
    id: 'multi-select',
    type: 'select',
    schema: {
      type: 'object',
      properties: {
        options: { type: 'array' },
        multiple: { type: 'boolean' },
        searchable: { type: 'boolean' },
      },
    },
    defaultProps: { multiple: true, searchable: true },
    renderMode: 'edit',
    category: 'input',
    label: { en: 'Multi Select', tr: 'Çoklu Seçim' },
  },
  () => import('../../components/predefined/MultiSelect')
)

// Graph Component
componentRegistry.register(
  {
    id: 'graph',
    type: 'graph',
    schema: {
      type: 'object',
      properties: {
        chartType: { type: 'string', enum: ['line', 'bar', 'pie', 'area'] },
        data: { type: 'array' },
      },
    },
    defaultProps: { chartType: 'line' },
    renderMode: 'view',
    category: 'visualization',
    label: { en: 'Graph', tr: 'Grafik' },
  },
  () => import('../../components/predefined/Graph')
)

// Input Component
componentRegistry.register(
  {
    id: 'text-input',
    type: 'input',
    schema: {
      type: 'object',
      properties: {
        label: { type: 'string' },
        placeholder: { type: 'string' },
        required: { type: 'boolean' },
      },
    },
    defaultProps: { required: false },
    renderMode: 'edit',
    category: 'input',
    label: { en: 'Text Input', tr: 'Metin Girişi' },
  },
  () => import('../../components/predefined/Input')
)

// Data Table Component
componentRegistry.register(
  {
    id: 'data-table',
    type: 'table',
    schema: {
      type: 'object',
      properties: {
        columns: { type: 'array' },
        data: { type: 'array' },
        pagination: { type: 'boolean' },
        sorting: { type: 'boolean' },
      },
    },
    defaultProps: { pagination: true, sorting: true },
    renderMode: 'view',
    category: 'data',
    label: { en: 'Data Table', tr: 'Veri Tablosu' },
  },
  () => import('../../components/predefined/DataTable')
)

// Query Builder Component
componentRegistry.register(
  {
    id: 'query-builder',
    type: 'custom',
    schema: {
      type: 'object',
      properties: {
        fields: { type: 'array' },
        tables: { type: 'array' },
        showPreview: { type: 'boolean' },
        multiTable: { type: 'boolean' },
      },
    },
    defaultProps: { showPreview: true, multiTable: false },
    renderMode: 'edit',
    category: 'data',
    label: { en: 'Query Builder', tr: 'Sorgu Oluşturucu' },
  },
  () => import('../../components/predefined/QueryBuilder')
)

// Form Builder Component
componentRegistry.register(
  {
    id: 'form-builder',
    type: 'form',
    schema: {
      type: 'object',
      properties: {
        fields: { type: 'array' },
        previewMode: { type: 'boolean' },
      },
    },
    defaultProps: { previewMode: false },
    renderMode: 'edit',
    category: 'input',
    label: { en: 'Form Builder', tr: 'Form Oluşturucu' },
  },
  () => import('../../components/predefined/FormBuilder')
)
