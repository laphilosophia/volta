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
    // TODO: Implement JSON Schema validation using Zod
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

// Note: Component registrations should be done by the consuming application
// using componentRegistry.register() with their own component loaders.
