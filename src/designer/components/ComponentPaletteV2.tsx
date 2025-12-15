// ============================================================================
// Component Palette V2 - Draggable Component List
// ============================================================================
// Supports both click-to-add and drag-and-drop to zone functionality

import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { ChevronDown, GripVertical, Layers, Plus } from 'lucide-react'
import React, { useState } from 'react'
import { componentRegistry } from '../../core'

// ============================================================================
// Types
// ============================================================================

interface ComponentPaletteV2Props {
  onAddComponent: (type: string, zoneId?: string) => void
  activeZone: string | null
}

interface DraggableComponentItemProps {
  componentId: string
  label: string
  onAddComponent: (type: string, zoneId?: string) => void
  activeZone: string | null
}

// ============================================================================
// Draggable Component Item
// ============================================================================

const DraggableComponentItem: React.FC<DraggableComponentItemProps> = ({
  componentId,
  label,
  onAddComponent,
  activeZone,
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `palette-${componentId}`,
    data: {
      type: 'palette-component',
      componentType: componentId,
    },
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-testid={`palette-${componentId}`}
      className={`
        w-full flex items-center gap-2 px-4 py-2 text-sm
        text-(--color-text-primary)
        hover:bg-(--color-surface-hover)
        transition-colors duration-150
        ${isDragging ? 'z-50 shadow-lg bg-(--color-surface)' : ''}
      `}
      {...attributes}
      {...listeners}
    >
      <GripVertical className="w-3 h-3 text-(--color-text-muted)" />
      <Plus
        className="w-4 h-4 text-(--color-primary) cursor-pointer"
        onClick={(e) => {
          e.stopPropagation()
          onAddComponent(componentId, activeZone || undefined)
        }}
      />
      <span
        className="flex-1 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation()
          onAddComponent(componentId, activeZone || undefined)
        }}
      >
        {label}
      </span>
    </div>
  )
}

// ============================================================================
// Component Palette V2
// ============================================================================

export const ComponentPaletteV2: React.FC<ComponentPaletteV2Props> = ({
  onAddComponent,
  activeZone,
}) => {
  const components = componentRegistry.list()
  const categories = componentRegistry.getCategories()
  const [expandedCategories, setExpandedCategories] = useState<string[]>(categories)

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    )
  }

  return (
    <div
      data-testid="component-palette"
      className="w-64 border-r border-(--color-border) bg-(--color-surface) overflow-y-auto flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-(--color-border)">
        <h2 className="text-sm font-semibold text-(--color-text-primary) flex items-center gap-2">
          <Layers className="w-4 h-4" />
          Components
        </h2>
        <p className="text-xs text-(--color-text-muted) mt-1">Click or drag to add</p>
        {activeZone && (
          <p className="text-xs text-(--color-primary) mt-1">Adding to: {activeZone}</p>
        )}
      </div>

      {/* Component List */}
      <div className="flex-1 overflow-y-auto">
        {categories.map((category) => (
          <div key={category} className="border-b border-(--color-border)">
            <button
              onClick={() => toggleCategory(category)}
              className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold
                text-(--color-text-muted) uppercase hover:bg-(--color-surface-hover) transition-colors"
            >
              {category}
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  expandedCategories.includes(category) ? '' : '-rotate-90'
                }`}
              />
            </button>
            {expandedCategories.includes(category) && (
              <div className="pb-2">
                {components
                  .filter((c) => c.category === category)
                  .map((component) => (
                    <DraggableComponentItem
                      key={component.id}
                      componentId={component.id}
                      label={component.label?.['en'] || component.id}
                      onAddComponent={onAddComponent}
                      activeZone={activeZone}
                    />
                  ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
