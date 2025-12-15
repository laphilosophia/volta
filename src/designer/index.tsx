// ============================================================================
// Designer - Low-Code Dashboard Builder with Layouts & Data Binding
// ============================================================================

import {
  closestCenter,
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { Layers } from 'lucide-react'
import React, { useCallback, useState } from 'react'
import { useStore } from 'zustand'
import { LayoutCanvas } from '../components/designer'
import {
  componentRegistry,
  DynamicRenderer,
  useDesignerStore,
  useMetadataStore,
  type ComponentMetadata,
  type LayoutTemplate,
  type PageMetadata,
} from '../core'
import { useDndSensors } from '../hooks'
import { ComponentPaletteV2 } from './components/ComponentPaletteV2'
import { HistoryPanel } from './components/HistoryPanel'
import { LayoutSelectorModal } from './components/LayoutSelectorModal'
import { PropertyInspectorV2 } from './components/PropertyInspectorV2'
import { ToolbarV2 } from './components/ToolbarV2'

// ============================================================================
// Types
// ============================================================================

interface DesignerPageWithLayout extends Omit<PageMetadata, 'layout'> {
  layout: LayoutTemplate
}

interface DragState {
  isDragging: boolean
  activeId: string | null
  activeType: 'palette-component' | 'zone-component' | null
  componentType: string | null
  activeComponent: ComponentMetadata | null
}

// ============================================================================
// Palette Drag Overlay - Shows dragged component preview from palette
// ============================================================================

const PaletteDragOverlay: React.FC<{ componentType: string | null }> = ({ componentType }) => {
  if (!componentType) return null

  const definition = componentRegistry.get(componentType)
  const label = definition?.label?.['en'] || componentType

  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-(--color-surface) rounded-lg shadow-2xl border border-(--color-primary) pointer-events-none">
      <Layers className="w-5 h-5 text-(--color-primary)" />
      <span className="text-sm font-medium text-(--color-text-primary)">{label}</span>
    </div>
  )
}

// ============================================================================
// Zone Component Drag Overlay - Shows actual component when reordering
// ============================================================================

const ZoneComponentDragOverlay: React.FC<{ component: ComponentMetadata | null }> = ({
  component,
}) => {
  if (!component) return null

  return (
    <div className="opacity-90 bg-(--color-surface) rounded-lg shadow-2xl p-4 border border-(--color-primary) pointer-events-none max-w-md">
      <DynamicRenderer metadata={component} />
    </div>
  )
}

// ============================================================================
// Designer Main Component
// ============================================================================

const Designer: React.FC = () => {
  const sensors = useDndSensors()

  // Zundo Temporal Store
  // Note: zundo v2 attaches temporal as a property on the store.
  // Type assertion needed due to zundo's dynamic store augmentation.
  // See: https://github.com/charkour/zundo for typing patterns.
  // TODO: Improve typing when zundo provides better TypeScript support
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const temporal = (useDesignerStore as any).temporal
  const { undo, redo, pastStates, futureStates } = useStore(temporal) as {
    undo: () => void
    redo: () => void
    pastStates: unknown[]
    futureStates: unknown[]
  }

  // Main Store
  const {
    currentLayout,
    mode,
    selectedComponent,
    clipboard,
    zoom,
    gridEnabled,
    isDirty,
    setMode,
    selectComponent,
    copyComponent,
    pasteComponent,
    setZoom,
    toggleGrid,
    setLayout,
    addComponent,
    reorderComponent,
    updateComponentProps,
    updateComponentDataSource,
    deleteComponent,
    setDirty,
  } = useDesignerStore()

  const { pages, setPage } = useMetadataStore()

  // Local State
  const [currentPageId] = useState('designer-v2-demo')
  const [showLayoutSelector, setShowLayoutSelector] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [activeZone] = useState<string | null>(null)

  // Drag state
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    activeId: null,
    activeType: null,
    componentType: null,
    activeComponent: null,
  })

  // Get current page or create default
  const currentPage = React.useMemo<DesignerPageWithLayout>(() => {
    const storedPage = pages[currentPageId]
    return storedPage
      ? {
          pageId: storedPage.pageId,
          title: storedPage.title,
          description: storedPage.description,
          components: storedPage.components,
          layout: currentLayout,
        }
      : {
          pageId: currentPageId,
          title: { en: 'Designer Demo' },
          components: [],
          layout: currentLayout,
        }
  }, [pages, currentPageId, currentLayout])

  // Helper to find component by ID across all zones
  const findComponentById = useCallback(
    (componentId: string): ComponentMetadata | null => {
      for (const zone of currentLayout.zones) {
        const found = zone.components.find((c) => c.id === componentId)
        if (found) return found
      }
      return null
    },
    [currentLayout]
  )

  // Helper to find zone containing a component
  const findZoneContainingComponent = useCallback(
    (componentId: string): string | null => {
      for (const zone of currentLayout.zones) {
        if (zone.components.some((c) => c.id === componentId)) {
          return zone.id
        }
      }
      return null
    },
    [currentLayout]
  )

  // ============================================================================
  // Component Handlers
  // ============================================================================

  const handleAddComponent = useCallback(
    (type: string, zoneId?: string) => {
      const definition = componentRegistry.get(type)
      if (!definition) return

      const newComponent: ComponentMetadata = {
        id: crypto.randomUUID(),
        type,
        props: { ...definition.defaultProps },
        dataSource: { type: 'static' },
      }

      addComponent(newComponent, zoneId)
    },
    [addComponent]
  )

  // ============================================================================
  // Global Drag Handlers
  // ============================================================================

  const handleGlobalDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event
      const activeId = active.id as string

      // Check if dragging from palette
      if (activeId.startsWith('palette-')) {
        const componentType = active.data.current?.componentType
        setDragState({
          isDragging: true,
          activeId,
          activeType: 'palette-component',
          componentType,
          activeComponent: null,
        })
      } else {
        // Dragging existing component in zone
        const component = findComponentById(activeId)
        setDragState({
          isDragging: true,
          activeId,
          activeType: 'zone-component',
          componentType: null,
          activeComponent: component,
        })
      }
    },
    [findComponentById]
  )

  const handleGlobalDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event

      // Store current drag info before resetting
      const currentDragState = { ...dragState }

      // Reset drag state
      setDragState({
        isDragging: false,
        activeId: null,
        activeType: null,
        componentType: null,
        activeComponent: null,
      })

      if (!over) return

      const activeId = active.id as string
      const overId = over.id as string

      // Handle palette drop to zone
      if (activeId.startsWith('palette-') && overId.startsWith('zone-')) {
        const componentType = active.data.current?.componentType
        const zoneId = over.data.current?.zoneId

        if (componentType && zoneId) {
          handleAddComponent(componentType, zoneId)
        }
        return
      }

      // Handle zone component reordering
      if (currentDragState.activeType === 'zone-component' && activeId !== overId) {
        const sourceZoneId = findZoneContainingComponent(activeId)
        if (!sourceZoneId) return

        const sourceZone = currentLayout.zones.find((z) => z.id === sourceZoneId)
        if (!sourceZone) return

        const oldIndex = sourceZone.components.findIndex((c) => c.id === activeId)
        const newIndex = sourceZone.components.findIndex((c) => c.id === overId)

        if (oldIndex !== -1 && newIndex !== -1) {
          reorderComponent(sourceZoneId, oldIndex, newIndex)
        }
      }
    },
    [dragState, currentLayout, findZoneContainingComponent, reorderComponent, handleAddComponent]
  )

  // ============================================================================
  // Other Handlers
  // ============================================================================

  const handleLayoutChange = useCallback(
    (template: LayoutTemplate) => {
      setLayout(template)
    },
    [setLayout]
  )

  const handleComponentReorder = useCallback(
    (zoneId: string, oldIndex: number, newIndex: number) => {
      reorderComponent(zoneId, oldIndex, newIndex)
    },
    [reorderComponent]
  )

  const handleComponentDrop = useCallback(
    (zoneId: string, componentType: string) => {
      handleAddComponent(componentType, zoneId)
    },
    [handleAddComponent]
  )

  const handleDeleteComponent = useCallback(() => {
    if (selectedComponent) {
      deleteComponent(selectedComponent)
    }
  }, [selectedComponent, deleteComponent])

  const handleCopyComponent = useCallback(() => {
    if (!selectedComponent) return

    const component = currentLayout.zones
      .flatMap((z) => z.components)
      .find((c) => c.id === selectedComponent)

    if (component) {
      copyComponent(component)
    }
  }, [selectedComponent, currentLayout, copyComponent])

  const handlePaste = useCallback(() => {
    const pastedComponent = pasteComponent()
    if (!pastedComponent) return
    addComponent(pastedComponent)
  }, [pasteComponent, addComponent])

  const handleSave = useCallback(() => {
    console.log('Saving page with layout:', currentLayout)
    setPage(currentPageId, { ...currentPage, layout: currentLayout })
    setDirty(false)
  }, [currentLayout, currentPage, currentPageId, setPage, setDirty])

  const selectedComponentData = selectedComponent
    ? currentLayout.zones.flatMap((z) => z.components).find((c) => c.id === selectedComponent) ||
      null
    : null

  return (
    <DndContext
      sensors={mode === 'preview' ? [] : sensors}
      collisionDetection={closestCenter}
      onDragStart={handleGlobalDragStart}
      onDragEnd={handleGlobalDragEnd}
    >
      <div
        className="h-screen flex flex-col bg-(--color-background)"
        data-testid="designer-container"
      >
        <ToolbarV2
          mode={mode}
          onModeChange={setMode}
          onSave={handleSave}
          onUndo={() => undo()}
          onRedo={() => redo()}
          canUndo={pastStates.length > 0}
          canRedo={futureStates.length > 0}
          zoom={zoom}
          onZoomChange={setZoom}
          onToggleGrid={toggleGrid}
          gridEnabled={gridEnabled}
          onPaste={handlePaste}
          clipboardHasContent={!!clipboard}
          isDirty={isDirty}
          currentLayout={currentLayout}
          onOpenLayoutSelector={() => setShowLayoutSelector(true)}
          onToggleHistory={() => setShowHistory(!showHistory)}
          showHistory={showHistory}
        />

        <div className="flex-1 flex overflow-hidden relative" data-testid="designer-canvas">
          {mode === 'edit' && (
            <ComponentPaletteV2 onAddComponent={handleAddComponent} activeZone={activeZone} />
          )}

          <LayoutCanvas
            layout={currentLayout}
            onSelectComponent={selectComponent}
            selectedComponent={selectedComponent}
            onComponentDrop={handleComponentDrop}
            onComponentReorder={handleComponentReorder}
            zoom={zoom}
            gridEnabled={gridEnabled}
            isDraggingFromPalette={
              dragState.isDragging && dragState.activeType === 'palette-component'
            }
            mode={mode}
          />

          {mode === 'edit' && (
            <PropertyInspectorV2
              component={selectedComponentData}
              onUpdateProps={(props) =>
                selectedComponent && updateComponentProps(selectedComponent, props)
              }
              onUpdateDataSource={(ds) =>
                selectedComponent && updateComponentDataSource(selectedComponent, ds)
              }
              onDelete={handleDeleteComponent}
              onCopy={handleCopyComponent}
            />
          )}

          {showHistory && <HistoryPanel onClose={() => setShowHistory(false)} />}
        </div>

        <LayoutSelectorModal
          isOpen={showLayoutSelector}
          onClose={() => setShowLayoutSelector(false)}
          onSelectLayout={handleLayoutChange}
          currentLayoutId={currentLayout.id}
        />
      </div>

      <DragOverlay dropAnimation={null}>
        {dragState.isDragging && dragState.activeType === 'palette-component' && (
          <PaletteDragOverlay componentType={dragState.componentType} />
        )}
        {dragState.isDragging && dragState.activeType === 'zone-component' && (
          <ZoneComponentDragOverlay component={dragState.activeComponent} />
        )}
      </DragOverlay>
    </DndContext>
  )
}

export default Designer
