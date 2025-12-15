// ============================================================================
// Designer Store - Dashboard Builder State
// ============================================================================

import { temporal } from 'zundo'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { ComponentMetadata, DataSourceConfig, LayoutTemplate } from '../../types'
import { layoutTemplates, type LayoutZone } from '../../types/layout'

// Helper to clone objects
const clone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj))

interface DesignerState {
  // Global Layout State (Moved from Designer.tsx)
  currentLayout: LayoutTemplate
  actionDescription: string // For History Panel

  // Designer UX State
  mode: 'edit' | 'preview'
  selectedComponent: string | null
  hoveredComponent: string | null
  clipboard: ComponentMetadata | null
  isDirty: boolean
  zoom: number
  gridEnabled: boolean
  snapToGrid: boolean
}

interface DesignerActions {
  // Metadata / Layout Actions
  setLayout: (layout: LayoutTemplate, description?: string) => void
  addComponent: (component: ComponentMetadata, zoneId?: string, index?: number) => void
  updateComponentProps: (componentId: string, props: Record<string, unknown>) => void
  updateComponentDataSource: (componentId: string, dataSource: DataSourceConfig) => void
  deleteComponent: (componentId: string) => void
  reorderComponent: (zoneId: string, oldIndex: number, newIndex: number) => void
  moveComponent: (
    componentId: string,
    sourceZoneId: string,
    targetZoneId: string,
    newIndex?: number
  ) => void

  // UX Actions
  setMode: (mode: 'edit' | 'preview') => void
  selectComponent: (componentId: string | null) => void
  hoverComponent: (componentId: string | null) => void
  copyComponent: (component: ComponentMetadata) => void
  pasteComponent: () => ComponentMetadata | null
  clearClipboard: () => void
  setDirty: (dirty: boolean) => void
  setZoom: (zoom: number) => void
  toggleGrid: () => void
  toggleSnapToGrid: () => void
  reset: () => void
}

type DesignerStore = DesignerState & DesignerActions

// Default initial layout
const defaultLayout = clone(layoutTemplates[0])

const initialState: DesignerState = {
  currentLayout: defaultLayout,
  actionDescription: 'Initial State',
  mode: 'edit',
  selectedComponent: null,
  hoveredComponent: null,
  clipboard: null,
  isDirty: false,
  zoom: 100,
  gridEnabled: true,
  snapToGrid: true,
}

export const useDesignerStore = create<DesignerStore>()(
  temporal(
    devtools(
      (set, get: () => DesignerStore) => ({
        ...initialState,

        // ====================================================================
        // Layout Actions (Tracked by Zundo)
        // ====================================================================

        setLayout: (layout: LayoutTemplate, description = 'Changed Layout') =>
          set(
            {
              currentLayout: clone(layout),
              actionDescription: description,
              isDirty: true,
            },
            false,
            'setLayout'
          ),

        addComponent: (component: ComponentMetadata, zoneId?: string, index?: number) =>
          set(
            (state: DesignerState) => {
              const Layout = clone(state.currentLayout)
              const targetZoneId = zoneId || Layout.zones[0]?.id || 'main'
              const updatedZones = Layout.zones.map((zone: LayoutZone) => {
                if (zone.id !== targetZoneId) return zone
                const newComponents = [...zone.components]
                if (typeof index === 'number') {
                  newComponents.splice(index, 0, component)
                } else {
                  newComponents.push(component)
                }
                return { ...zone, components: newComponents }
              })

              return {
                currentLayout: { ...Layout, zones: updatedZones },
                actionDescription: `Added ${component.type}`,
                selectedComponent: component.id,
                isDirty: true,
              }
            },
            false,
            'addComponent'
          ),

        updateComponentProps: (componentId: string, props: Record<string, unknown>) =>
          set(
            (state: DesignerState) => {
              const Layout = clone(state.currentLayout)
              const updatedZones = Layout.zones.map((zone: LayoutZone) => ({
                ...zone,
                components: zone.components.map((comp: ComponentMetadata) =>
                  comp.id === componentId ? { ...comp, props: { ...comp.props, ...props } } : comp
                ),
              }))
              return {
                currentLayout: { ...Layout, zones: updatedZones },
                actionDescription: 'Updated Properties',
                isDirty: true,
              }
            },
            false,
            'updateComponentProps'
          ),

        updateComponentDataSource: (componentId: string, dataSource: DataSourceConfig) =>
          set(
            (state: DesignerState) => {
              const Layout = clone(state.currentLayout)
              const updatedZones = Layout.zones.map((zone: LayoutZone) => ({
                ...zone,
                components: zone.components.map((comp: ComponentMetadata) =>
                  comp.id === componentId ? { ...comp, dataSource } : comp
                ),
              }))
              return {
                currentLayout: { ...Layout, zones: updatedZones },
                actionDescription: 'Updated Data Source',
                isDirty: true,
              }
            },
            false,
            'updateComponentDataSource'
          ),

        deleteComponent: (componentId: string) =>
          set(
            (state: DesignerState) => {
              const Layout = clone(state.currentLayout)
              const updatedZones = Layout.zones.map((zone: LayoutZone) => ({
                ...zone,
                components: zone.components.filter((c: ComponentMetadata) => c.id !== componentId),
              }))
              return {
                currentLayout: { ...Layout, zones: updatedZones },
                actionDescription: 'Deleted Component',
                selectedComponent: null,
                isDirty: true,
              }
            },
            false,
            'deleteComponent'
          ),

        reorderComponent: (zoneId: string, oldIndex: number, newIndex: number) =>
          set(
            (state: DesignerState) => {
              const Layout = clone(state.currentLayout)
              const zone = Layout.zones.find((z: LayoutZone) => z.id === zoneId)
              if (!zone) return {}

              const [removed] = zone.components.splice(oldIndex, 1)
              zone.components.splice(newIndex, 0, removed)

              return {
                currentLayout: Layout,
                actionDescription: 'Reordered Component',
                isDirty: true,
              }
            },
            false,
            'reorderComponent'
          ),

        moveComponent: (
          componentId: string,
          sourceZoneId: string,
          targetZoneId: string,
          newIndex?: number
        ) =>
          set(
            (state: DesignerState) => {
              const Layout = clone(state.currentLayout)
              const sourceZone = Layout.zones.find((z: LayoutZone) => z.id === sourceZoneId)
              const targetZone = Layout.zones.find((z: LayoutZone) => z.id === targetZoneId)

              if (!sourceZone || !targetZone) return {}

              // Find and remove from source
              const compIndex = sourceZone.components.findIndex(
                (c: ComponentMetadata) => c.id === componentId
              )
              if (compIndex === -1) return {}
              const [movedComp] = sourceZone.components.splice(compIndex, 1)

              // Add to target
              if (typeof newIndex === 'number') {
                targetZone.components.splice(newIndex, 0, movedComp)
              } else {
                targetZone.components.push(movedComp)
              }

              return {
                currentLayout: Layout,
                actionDescription: 'Moved Component',
                isDirty: true,
              }
            },
            false,
            'moveComponent'
          ),

        // ====================================================================
        // UI Actions (Not tracked or partial)
        // ====================================================================

        setMode: (mode: 'edit' | 'preview') => set({ mode }, false, 'setMode'),
        selectComponent: (id: string | null) =>
          set({ selectedComponent: id }, false, 'selectComponent'),
        hoverComponent: (id: string | null) =>
          set({ hoveredComponent: id }, false, 'hoverComponent'),

        copyComponent: (component: ComponentMetadata) =>
          set({ clipboard: clone(component) }, false, 'copyComponent'),

        pasteComponent: () => {
          const { clipboard } = get()
          if (!clipboard) return null
          return { ...clipboard, id: crypto.randomUUID() } as ComponentMetadata
        },

        clearClipboard: () => set({ clipboard: null }, false, 'clearClipboard'),
        setDirty: (isDirty: boolean) => set({ isDirty }, false, 'setDirty'),
        setZoom: (zoom: number) =>
          set({ zoom: Math.min(200, Math.max(25, zoom)) }, false, 'setZoom'),
        toggleGrid: () =>
          set((s: DesignerState) => ({ gridEnabled: !s.gridEnabled }), false, 'toggleGrid'),
        toggleSnapToGrid: () =>
          set((s: DesignerState) => ({ snapToGrid: !s.snapToGrid }), false, 'toggleSnapToGrid'),
        reset: () => set(initialState, false, 'reset'),
      }),
      { name: 'DesignerStore' }
    ),
    {
      // Only track changes to currentLayout and actionDescription
      partialize: (state: DesignerState) => ({
        currentLayout: state.currentLayout,
        actionDescription: state.actionDescription,
      }),
      limit: 50, // Max history size
    }
  )
) as unknown as import('zustand').UseBoundStore<
  import('zustand').StoreApi<DesignerStore> & {
    temporal: import('zundo').TemporalState<DesignerState>
  }
>
