// ============================================================================
// Component Palette - Shared between Designer and DesignerV2
// ============================================================================

import { ChevronDown, Layers, Plus } from 'lucide-react'
import React, { useState } from 'react'
import { componentRegistry } from '../../../core/component-registry'

// ============================================================================
// Types
// ============================================================================

interface ComponentPaletteProps {
  /** Callback when a component is added */
  onAddComponent: (type: string) => void
  /** Optional active zone ID (for DesignerV2) */
  activeZone?: string | null
  /** Whether categories are collapsible */
  collapsible?: boolean
}

// ============================================================================
// Component Palette
// ============================================================================

export const ComponentPalette: React.FC<ComponentPaletteProps> = ({
  onAddComponent,
  activeZone,
  collapsible = true,
}) => {
  const components = componentRegistry.list()
  const categories = componentRegistry.getCategories()
  const [expandedCategories, setExpandedCategories] = useState<string[]>(categories)

  const toggleCategory = (category: string) => {
    if (!collapsible) return

    setExpandedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    )
  }

  return (
    <div className="w-64 border-r border-(--color-border) bg-(--color-surface) overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-(--color-border)">
        <h2 className="text-sm font-semibold text-(--color-text-primary) flex items-center gap-2">
          <Layers className="w-4 h-4" />
          Components
        </h2>
        {activeZone && (
          <p className="text-xs text-(--color-primary) mt-1">Adding to: {activeZone}</p>
        )}
      </div>

      {/* Component List */}
      <div className="flex-1 overflow-y-auto">
        {categories.map((category) => {
          const isExpanded = !collapsible || expandedCategories.includes(category)
          const categoryComponents = components.filter((c) => c.category === category)

          return (
            <div key={category} className="border-b border-(--color-border)">
              <button
                onClick={() => toggleCategory(category)}
                disabled={!collapsible}
                className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold
                  text-(--color-text-muted) uppercase hover:bg-(--color-surface-hover) transition-colors
                  disabled:cursor-default"
              >
                {category}
                {collapsible && (
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${isExpanded ? '' : '-rotate-90'}`}
                  />
                )}
              </button>

              {isExpanded && (
                <div className="pb-2">
                  {categoryComponents.map((component) => (
                    <button
                      key={component.id}
                      onClick={() => onAddComponent(component.id)}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm
                        text-(--color-text-primary)
                        hover:bg-(--color-surface-hover)
                        transition-colors duration-150"
                    >
                      <Plus className="w-4 h-4 text-(--color-primary)" />
                      {component.label?.['en'] || component.id}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
