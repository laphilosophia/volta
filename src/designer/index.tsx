// ============================================================================
// Designer - Low-Code Dashboard Builder with Layouts & Data Binding
// ============================================================================
// Modular architecture with SINGLE global drag-and-drop context
// Handles both palette drops AND zone reordering

import {
  closestCenter,
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { Layers } from 'lucide-react'
import React, { useCallback, useState } from 'react'
import { LayoutCanvas } from '../components/designer'
import {
  cloneLayoutTemplate,
  componentRegistry,
  DynamicRenderer,
  layoutTemplates,
  useDesignerStore,
  useMetadataStore,
  type ComponentMetadata,
  type DataSourceConfig,
  type LayoutTemplate,
  type PageMetadata,
} from '../core'
import { useDndSensors } from '../hooks'
import { ComponentPaletteV2 } from './components/ComponentPaletteV2'
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

const ZoneComponentDragOverlay: React.FC<{ component: ComponentMetadata | null }> = ({ component }) => {
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

  const {
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
    addToHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    setDirty,
  } = useDesignerStore()

  const { pages, setPage } = useMetadataStore()

  // State
  const [currentPageId] = useState('designer-v2-demo')
  const [showLayoutSelector, setShowLayoutSelector] = useState(false)
  const [currentLayout, setCurrentLayout] = useState<LayoutTemplate>(
    cloneLayoutTemplate(
      layoutTemplates.find((l) => l.id === 'sidebar-left') || layoutTemplates[0]
    )
  )
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
  const storedPage = pages[currentPageId]
  const currentPage: DesignerPageWithLayout = storedPage
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

  // Helper to find component by ID across all zones
  const findComponentById = useCallback((componentId: string): ComponentMetadata | null => {
    for (const zone of currentLayout.zones) {
      const found = zone.components.find(c => c.id === componentId)
      if (found) return found
    }
    return null
  }, [currentLayout])

  // Helper to find zone containing a component
  const findZoneContainingComponent = useCallback((componentId: string): string | null => {
    for (const zone of currentLayout.zones) {
      if (zone.components.some(c => c.id === componentId)) {
        return zone.id
      }
    }
    return null
  }, [currentLayout])

  // ============================================================================
  // Global Drag Handlers - Handles BOTH palette drops AND zone reordering
  // ============================================================================

  const handleGlobalDragStart = useCallback((event: DragStartEvent) => {
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
  }, [findComponentById])

  const handleGlobalDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event

    // Store current drag info before resetting
    const currentDragState = { ...dragState }

    // Reset drag state immediately
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

    // Handle zone component reordering (within same zone)
    if (currentDragState.activeType === 'zone-component' && activeId !== overId) {
      // Find the zone containing the active component
      const sourceZoneId = findZoneContainingComponent(activeId)
      if (!sourceZoneId) return

      const sourceZone = currentLayout.zones.find(z => z.id === sourceZoneId)
      if (!sourceZone) return

      // Check if dropping on another component in the same zone
      const oldIndex = sourceZone.components.findIndex(c => c.id === activeId)
      const newIndex = sourceZone.components.findIndex(c => c.id === overId)

      if (oldIndex !== -1 && newIndex !== -1) {
        // Reorder within the same zone
        const updatedZones = currentLayout.zones.map((zone) => {
          if (zone.id !== sourceZoneId) return zone

          return {
            ...zone,
            components: arrayMove(zone.components, oldIndex, newIndex),
          }
        })

        setCurrentLayout({ ...currentLayout, zones: updatedZones })
        addToHistory('reorder', { zoneId: sourceZoneId, oldIndex, newIndex })
        setDirty(true)
      }
    }
  }, [dragState, currentLayout, findZoneContainingComponent, addToHistory, setDirty])

  // ============================================================================
  // Component Handlers
  // ============================================================================

  // Handle layout change
  const handleLayoutChange = useCallback(
    (template: LayoutTemplate) => {
      const clonedTemplate = cloneLayoutTemplate(template)

      // Preserve components from old layout
      if (currentLayout && currentLayout.zones.length > 0) {
        const allComponents = currentLayout.zones.flatMap((z) => z.components)
        if (clonedTemplate.zones.length > 0 && allComponents.length > 0) {
          clonedTemplate.zones[0].components = allComponents
        }
      }

      setCurrentLayout(clonedTemplate)
      addToHistory('changeLayout', template.id)
      setDirty(true)
    },
    [currentLayout, addToHistory, setDirty]
  )

  // Handle add component to zone
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

      const targetZoneId = zoneId || currentLayout.zones[0]?.id || 'main'
      const updatedZones = currentLayout.zones.map((zone) =>
        zone.id === targetZoneId
          ? { ...zone, components: [...zone.components, newComponent] }
          : zone
      )

      setCurrentLayout({ ...currentLayout, zones: updatedZones })
      addToHistory('addComponent', newComponent)
      selectComponent(newComponent.id)
      setDirty(true)
    },
    [currentLayout, addToHistory, selectComponent, setDirty]
  )

  // Handle component reorder in zone (called from LayoutCanvas if needed)
  const handleComponentReorder = useCallback(
    (zoneId: string, oldIndex: number, newIndex: number) => {
      const updatedZones = currentLayout.zones.map((zone) => {
        if (zone.id !== zoneId) return zone

        return {
          ...zone,
          components: arrayMove(zone.components, oldIndex, newIndex),
        }
      })

      setCurrentLayout({ ...currentLayout, zones: updatedZones })
      addToHistory('reorder', { zoneId, oldIndex, newIndex })
      setDirty(true)
    },
    [currentLayout, addToHistory, setDirty]
  )

  // Handle component drop (from palette to zone)
  const handleComponentDrop = useCallback(
    (zoneId: string, componentType: string) => {
      handleAddComponent(componentType, zoneId)
    },
    [handleAddComponent]
  )

  // Handle update props
  const handleUpdateProps = useCallback(
    (componentId: string, props: Record<string, unknown>) => {
      const updatedZones = currentLayout.zones.map((zone) => ({
        ...zone,
        components: zone.components.map((comp) =>
          comp.id === componentId
            ? { ...comp, props: { ...comp.props, ...props } }
            : comp
        ),
      }))

      setCurrentLayout({ ...currentLayout, zones: updatedZones })
      addToHistory('updateProps', { componentId, props })
      setDirty(true)
    },
    [currentLayout, addToHistory, setDirty]
  )

  // Handle update data source
  const handleUpdateDataSource = useCallback(
    (componentId: string, dataSource: DataSourceConfig) => {
      const updatedZones = currentLayout.zones.map((zone) => ({
        ...zone,
        components: zone.components.map((comp) =>
          comp.id === componentId ? { ...comp, dataSource } : comp
        ),
      }))

      setCurrentLayout({ ...currentLayout, zones: updatedZones })
      addToHistory('updateDataSource', { componentId, dataSource })
      setDirty(true)
    },
    [currentLayout, addToHistory, setDirty]
  )

  // Handle delete component
  const handleDeleteComponent = useCallback(() => {
    if (!selectedComponent) return

    const updatedZones = currentLayout.zones.map((zone) => ({
      ...zone,
      components: zone.components.filter((comp) => comp.id !== selectedComponent),
    }))

    setCurrentLayout({ ...currentLayout, zones: updatedZones })
    addToHistory('deleteComponent', selectedComponent)
    selectComponent(null)
    setDirty(true)
  }, [selectedComponent, currentLayout, addToHistory, selectComponent, setDirty])

  // Handle copy component
  const handleCopyComponent = useCallback(() => {
    if (!selectedComponent) return

    const component = currentLayout.zones
      .flatMap((z) => z.components)
      .find((c) => c.id === selectedComponent)

    if (component) {
      copyComponent(component)
    }
  }, [selectedComponent, currentLayout, copyComponent])

  // Handle paste
  const handlePaste = useCallback(() => {
    const pastedComponent = pasteComponent()
    if (!pastedComponent) return

    const targetZoneId = currentLayout.zones[0]?.id || 'main'
    const updatedZones = currentLayout.zones.map((zone) =>
      zone.id === targetZoneId
        ? { ...zone, components: [...zone.components, pastedComponent] }
        : zone
    )

    setCurrentLayout({ ...currentLayout, zones: updatedZones })
    addToHistory('paste', pastedComponent)
    selectComponent(pastedComponent.id)
    setDirty(true)
  }, [pasteComponent, currentLayout, addToHistory, selectComponent, setDirty])

  // Handle save
  const handleSave = useCallback(() => {
    console.log('Saving page with layout:', currentLayout)
    setPage(currentPageId, { ...currentPage, layout: currentLayout })
    setDirty(false)
  }, [currentLayout, currentPage, currentPageId, setPage, setDirty])

  // Get selected component data
  const selectedComponentData = selectedComponent
    ? currentLayout.zones
      .flatMap((z) => z.components)
      .find((c) => c.id === selectedComponent) || null
    : null

  return (
    <DndContext
      sensors={mode === 'preview' ? [] : sensors}
      collisionDetection={closestCenter}
      onDragStart={handleGlobalDragStart}
      onDragEnd={handleGlobalDragEnd}
    >
      <div className="h-screen flex flex-col bg-(--color-background)">
        <ToolbarV2
          mode={mode}
          onModeChange={setMode}
          onSave={handleSave}
          onUndo={undo}
          onRedo={redo}
          canUndo={canUndo()}
          canRedo={canRedo()}
          zoom={zoom}
          onZoomChange={setZoom}
          onToggleGrid={toggleGrid}
          gridEnabled={gridEnabled}
          onPaste={handlePaste}
          clipboardHasContent={!!clipboard}
          isDirty={isDirty}
          currentLayout={currentLayout}
          onOpenLayoutSelector={() => setShowLayoutSelector(true)}
        />

        <div className="flex-1 flex overflow-hidden">
          {mode === 'edit' && (
            <ComponentPaletteV2
              onAddComponent={handleAddComponent}
              activeZone={activeZone}
            />
          )}

          <LayoutCanvas
            layout={currentLayout}
            onSelectComponent={selectComponent}
            selectedComponent={selectedComponent}
            onComponentDrop={handleComponentDrop}
            onComponentReorder={handleComponentReorder}
            zoom={zoom}
            gridEnabled={gridEnabled}
            isDraggingFromPalette={dragState.isDragging && dragState.activeType === 'palette-component'}
            mode={mode}
          />

          {mode === 'edit' && (
            <PropertyInspectorV2
              component={selectedComponentData}
              onUpdateProps={(props) =>
                selectedComponent && handleUpdateProps(selectedComponent, props)
              }
              onUpdateDataSource={(ds) =>
                selectedComponent && handleUpdateDataSource(selectedComponent, ds)
              }
              onDelete={handleDeleteComponent}
              onCopy={handleCopyComponent}
            />
          )}
        </div>

        <LayoutSelectorModal
          isOpen={showLayoutSelector}
          onClose={() => setShowLayoutSelector(false)}
          onSelectLayout={handleLayoutChange}
          currentLayoutId={currentLayout.id}
        />
      </div>

      {/* Global Drag Overlay - Shows preview for BOTH palette and zone drags */}
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
