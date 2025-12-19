// ============================================================================
// Component Registry - Base Components for Builder
// ============================================================================

import { hasComponent, register, type ComponentDefinition } from '@voltakit/volta/core'

// Define metadata type for builder
interface BuilderMeta {
  name: string
  description: string
  icon: string
  category: 'display' | 'layout'
  defaultProps: Record<string, unknown>
}

// Store for builder metadata (since ComponentDefinition doesn't have meta)
export const builderMeta = new Map<string, BuilderMeta>()

// Base components with metadata
const baseComponents: Array<{ key: string; definition: ComponentDefinition; meta: BuilderMeta }> = [
  {
    key: 'stat-card',
    definition: {
      type: 'data-display',
      component: () => Promise.resolve({ default: null }), // Placeholder - rendered via ComponentPreview
    },
    meta: {
      name: 'Stat Card',
      description: 'Display a single statistic',
      icon: '📊',
      category: 'display',
      defaultProps: { title: 'Total', value: '0', icon: '📊' },
    },
  },
  {
    key: 'data-table',
    definition: {
      type: 'data-display',
      component: () => Promise.resolve({ default: null }),
    },
    meta: {
      name: 'Data Table',
      description: 'Display tabular data',
      icon: '📋',
      category: 'display',
      defaultProps: { title: 'Table', columns: ['Name', 'Value'], dataSource: '/customers' },
    },
  },
  {
    key: 'bar-chart',
    definition: {
      type: 'data-display',
      component: () => Promise.resolve({ default: null }),
    },
    meta: {
      name: 'Bar Chart',
      description: 'Display bar chart',
      icon: '📈',
      category: 'display',
      defaultProps: { title: 'Chart', dataSource: '/stats' },
    },
  },
  {
    key: 'text-block',
    definition: {
      type: 'layout',
      component: () => Promise.resolve({ default: null }),
    },
    meta: {
      name: 'Text Block',
      description: 'Display text content',
      icon: '📝',
      category: 'layout',
      defaultProps: { content: 'Enter text here...', fontSize: '1rem' },
    },
  },
  {
    key: 'header-block',
    definition: {
      type: 'layout',
      component: () => Promise.resolve({ default: null }),
    },
    meta: {
      name: 'Header',
      description: 'Section header',
      icon: '📌',
      category: 'layout',
      defaultProps: { title: 'Section Title', level: 'h2' },
    },
  },
  {
    key: 'spacer',
    definition: {
      type: 'layout',
      component: () => Promise.resolve({ default: null }),
    },
    meta: {
      name: 'Spacer',
      description: 'Add vertical space',
      icon: '↕️',
      category: 'layout',
      defaultProps: { height: '24px' },
    },
  },
  {
    key: 'card-container',
    definition: {
      type: 'layout',
      component: () => Promise.resolve({ default: null }),
    },
    meta: {
      name: 'Card',
      description: 'Container card',
      icon: '🃏',
      category: 'layout',
      defaultProps: { title: 'Card Title', padding: '16px' },
    },
  },
]

/**
 * Register all base components
 */
export function registerBaseComponents() {
  for (const { key, definition, meta } of baseComponents) {
    if (!hasComponent(key)) {
      register(key, definition)
      builderMeta.set(key, meta)
    }
  }
}

/**
 * Get builder metadata for a component
 */
export function getBuilderMeta(key: string): BuilderMeta | undefined {
  return builderMeta.get(key)
}

/**
 * List all registered builder components with metadata
 */
export function listBuilderComponents(): Array<{ key: string; meta: BuilderMeta }> {
  return Array.from(builderMeta.entries()).map(([key, meta]) => ({ key, meta }))
}

export { baseComponents }
