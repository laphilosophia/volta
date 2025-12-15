// ============================================================================
// Layout Canvas Component - Renders zones with drag-and-drop support
// ============================================================================
// 'preview' mode (readonly, no DnD)

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Layout, Plus } from 'lucide-react'
import React from 'react'
import { DynamicRenderer } from '../../core'
import type { LayoutTemplate, LayoutZone } from '../../core/types/layout'
import { SortableItem } from './shared'

// ============================================================================
// Types
// ============================================================================

interface LayoutCanvasProps {
  layout: LayoutTemplate
  onSelectComponent: (componentId: string | null) => void
  selectedComponent: string | null
  onComponentDrop: (zoneId: string, componentType: string) => void
  onComponentReorder: (zoneId: string, oldIndex: number, newIndex: number) => void
  zoom: number
  gridEnabled: boolean
  // Global drag state passed from parent
  isDraggingFromPalette?: boolean
  draggingComponentType?: string | null
  mode?: 'edit' | 'preview'
}

interface ZoneProps {
  zone: LayoutZone
  onSelectComponent: (componentId: string | null) => void
  selectedComponent: string | null
  onAddComponent: (zoneId: string) => void
  isDraggingFromPalette?: boolean
  mode?: 'edit' | 'preview'
}

// ============================================================================
// Droppable Zone Wrapper
// ============================================================================

const DroppableZone: React.FC<{
  zoneId: string
  children: React.ReactNode
  isDropTarget?: boolean
  disabled?: boolean
}> = ({ zoneId, children, isDropTarget, disabled }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: `zone-${zoneId}`,
    data: {
      type: 'zone',
      zoneId,
    },
    disabled,
  })

  // If disabled (preview mode), just return children without ref or styles
  if (disabled) {
    return <div className="h-full">{children}</div>
  }

  return (
    <div
      ref={setNodeRef}
      className={`
        h-full transition-all duration-200
        ${isOver ? 'ring-2 ring-(--color-primary) ring-opacity-50 bg-(--color-primary) bg-opacity-5' : ''}
        ${isDropTarget ? 'ring-2 ring-dashed ring-(--color-primary) ring-opacity-30' : ''}
      `}
    >
      {children}
    </div>
  )
}

// ============================================================================
// Zone Component
// ============================================================================

const Zone: React.FC<ZoneProps> = ({
  zone,
  onSelectComponent,
  selectedComponent,
  onAddComponent,
  isDraggingFromPalette,
  mode = 'edit',
}) => {
  const isEmpty = zone.components.length === 0
  const isPreview = mode === 'preview'

  const containerClasses = isPreview
    ? 'relative h-full min-h-[50px] p-4 transition-all'
    : `relative h-full min-h-[200px] p-4 rounded-lg border-2 border-dashed transition-all
       ${isEmpty
      ? 'border-(--color-border) bg-(--color-surface-hover)'
      : 'border-transparent bg-(--color-surface)'}
       ${isDraggingFromPalette ? 'border-(--color-primary) border-opacity-50' : ''}
      `

  return (
    <DroppableZone zoneId={zone.id} isDropTarget={isDraggingFromPalette} disabled={isPreview}>
      <div
        className={containerClasses}
        onClick={() => !isPreview && onSelectComponent(null)}
      >
        {/* Zone Label - Hide in preview */}
        {!isPreview && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-xs font-medium
            bg-(--color-surface-hover) text-(--color-text-muted) z-10">
            {zone.name}
          </div>
        )}

        {isEmpty ? (
          /* Empty Zone */
          !isPreview && (
            <div className="flex flex-col items-center justify-center h-full min-h-[200px]">
              <Layout className="w-10 h-10 text-(--color-text-muted) opacity-50 mb-3" />
              <p className="text-sm text-(--color-text-muted) mb-3">
                {isDraggingFromPalette ? 'Drop component here' : 'Drop components here'}
              </p>
              {!isDraggingFromPalette && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onAddComponent(zone.id)
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg
                    bg-(--color-primary) text-white hover:opacity-90 transition-opacity"
                >
                  <Plus className="w-4 h-4" />
                  Add Component
                </button>
              )}
            </div>
          )
        ) : (
          /* Zone with Components */
          <div className={`${isPreview ? '' : 'space-y-4 pt-8'}`}>
            {isPreview ? (
              /* Preview Mode: Render directly */
              <div className="space-y-4">
                {zone.components.map((component) => (
                  <DynamicRenderer key={component.id} metadata={component} />
                ))}
              </div>
            ) : (
              /* Edit Mode: Render Sortable Items */
              <SortableContext
                items={zone.components.map((c) => c.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {zone.components.map((component) => (
                    <SortableItem
                      key={component.id}
                      component={component}
                      isSelected={selectedComponent === component.id}
                      onSelect={() => onSelectComponent(component.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            )}
          </div>
        )}
      </div>
    </DroppableZone>
  )
}

// ============================================================================
// Layout Renderers Map
// ============================================================================

type LayoutRenderer = (
  layout: LayoutTemplate,
  props: Omit<LayoutCanvasProps, 'layout' | 'zoom' | 'gridEnabled'> & {
    handleAddComponent: (zoneId: string) => void
  }
) => React.ReactNode

const layoutRenderers: Record<string, LayoutRenderer> = {
  'sidebar-left': (layout, { onSelectComponent, selectedComponent, handleAddComponent, isDraggingFromPalette, mode }) => {
    const sidebar = layout.zones.find((z) => z.position === 'sidebar')
    const main = layout.zones.find((z) => z.position === 'main') || layout.zones[0]

    return (
      <div className="flex h-full gap-4">
        {sidebar && (
          <div className="shrink-0" style={{ width: sidebar.size?.width || '280px' }}>
            <Zone
              zone={sidebar}
              onSelectComponent={onSelectComponent}
              selectedComponent={selectedComponent}
              onAddComponent={handleAddComponent}
              isDraggingFromPalette={isDraggingFromPalette}
              mode={mode}
            />
          </div>
        )}
        <div className="flex-1">
          <Zone
            zone={main}
            onSelectComponent={onSelectComponent}
            selectedComponent={selectedComponent}
            onAddComponent={handleAddComponent}
            isDraggingFromPalette={isDraggingFromPalette}
            mode={mode}
          />
        </div>
      </div>
    )
  },

  'sidebar-right': (layout, { onSelectComponent, selectedComponent, handleAddComponent, isDraggingFromPalette, mode }) => {
    const sidebar = layout.zones.find((z) => z.position === 'sidebar')
    const main = layout.zones.find((z) => z.position === 'main') || layout.zones[0]

    return (
      <div className="flex h-full gap-4">
        <div className="flex-1">
          <Zone
            zone={main}
            onSelectComponent={onSelectComponent}
            selectedComponent={selectedComponent}
            onAddComponent={handleAddComponent}
            isDraggingFromPalette={isDraggingFromPalette}
            mode={mode}
          />
        </div>
        {sidebar && (
          <div className="shrink-0" style={{ width: sidebar.size?.width || '320px' }}>
            <Zone
              zone={sidebar}
              onSelectComponent={onSelectComponent}
              selectedComponent={selectedComponent}
              onAddComponent={handleAddComponent}
              isDraggingFromPalette={isDraggingFromPalette}
              mode={mode}
            />
          </div>
        )}
      </div>
    )
  },

  'two-column': (layout, { onSelectComponent, selectedComponent, handleAddComponent, isDraggingFromPalette, mode }) => (
    <div className="flex h-full gap-4">
      {layout.zones.map((zone) => (
        <div key={zone.id} className="flex-1">
          <Zone
            zone={zone}
            onSelectComponent={onSelectComponent}
            selectedComponent={selectedComponent}
            onAddComponent={handleAddComponent}
            isDraggingFromPalette={isDraggingFromPalette}
            mode={mode}
          />
        </div>
      ))}
    </div>
  ),

  'full-width': (layout, { onSelectComponent, selectedComponent, handleAddComponent, isDraggingFromPalette, mode }) => {
    const zone = layout.zones[0] || { id: 'main', name: 'Main', position: 'main' as const, components: [] }
    return (
      <Zone
        zone={zone}
        onSelectComponent={onSelectComponent}
        selectedComponent={selectedComponent}
        onAddComponent={handleAddComponent}
        isDraggingFromPalette={isDraggingFromPalette}
        mode={mode}
      />
    )
  },
}

// ============================================================================
// Main Layout Canvas
// ============================================================================

const LayoutCanvas: React.FC<LayoutCanvasProps> = ({
  layout,
  onSelectComponent,
  selectedComponent,
  onComponentDrop,
  onComponentReorder,
  zoom,
  gridEnabled,
  isDraggingFromPalette,
  mode = 'edit',
}) => {
  const handleAddComponent = (zoneId: string) => {
    // Default to adding data-tree, can be enhanced with a picker modal
    onComponentDrop(zoneId, 'data-tree')
  }

  const renderer = layoutRenderers[layout.structure] || layoutRenderers['full-width']

  return (
    <div
      className="flex-1 overflow-auto p-8"
      style={{
        backgroundColor: 'var(--color-background)',
        // Hide grid in preview mode
        backgroundImage: (gridEnabled && mode === 'edit')
          ? 'radial-gradient(circle, var(--color-border) 1px, transparent 1px)'
          : 'none',
        backgroundSize: '20px 20px',
      }}
    >
      <div
        className={`mx-auto bg-(--color-surface) rounded-xl shadow-lg
          ${mode === 'preview' ? 'p-0 shadow-none' : 'p-6 min-h-[600px]'}`}
        style={{
          maxWidth: '1400px',
          transform: `scale(${zoom / 100})`,
          transformOrigin: 'top center',
        }}
      >
        {renderer(layout, {
          onSelectComponent,
          selectedComponent,
          onComponentDrop,
          onComponentReorder,
          handleAddComponent,
          isDraggingFromPalette,
          mode,
        })}
      </div>
    </div>
  )
}

export default LayoutCanvas
