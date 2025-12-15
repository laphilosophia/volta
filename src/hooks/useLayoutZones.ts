// ============================================================================
// useLayoutZones Hook - Layout Zone Management
// ============================================================================

import { useCallback, useMemo } from 'react'
import type { ComponentMetadata } from '../core/types'
import type { LayoutTemplate } from '../core/types/layout'

interface UseLayoutZonesOptions {
  layout: LayoutTemplate
  onLayoutChange: (layout: LayoutTemplate) => void
}

interface UseLayoutZonesReturn {
  /** Get all components from all zones */
  allComponents: ComponentMetadata[]

  /** Find a component by ID across all zones */
  findComponent: (componentId: string) => ComponentMetadata | undefined

  /** Find which zone contains a component */
  findComponentZone: (componentId: string) => string | undefined

  /** Add a component to a specific zone */
  addComponentToZone: (zoneId: string, component: ComponentMetadata) => void

  /** Remove a component from any zone */
  removeComponent: (componentId: string) => void

  /** Update a component's props */
  updateComponentProps: (componentId: string, props: Record<string, unknown>) => void

  /** Reorder components within a zone */
  reorderInZone: (zoneId: string, oldIndex: number, newIndex: number) => void
}

/**
 * Custom hook to manage layout zones and their components.
 * Provides utility functions for common zone operations.
 */
export function useLayoutZones({
  layout,
  onLayoutChange,
}: UseLayoutZonesOptions): UseLayoutZonesReturn {
  // Memoized list of all components
  const allComponents = useMemo(
    () => layout.zones.flatMap((zone) => zone.components),
    [layout.zones]
  )

  // Find a component by ID
  const findComponent = useCallback(
    (componentId: string) => {
      for (const zone of layout.zones) {
        const component = zone.components.find((c) => c.id === componentId)
        if (component) return component
      }
      return undefined
    },
    [layout.zones]
  )

  // Find which zone contains a component
  const findComponentZone = useCallback(
    (componentId: string) => {
      for (const zone of layout.zones) {
        if (zone.components.some((c) => c.id === componentId)) {
          return zone.id
        }
      }
      return undefined
    },
    [layout.zones]
  )

  // Add component to zone
  const addComponentToZone = useCallback(
    (zoneId: string, component: ComponentMetadata) => {
      const updatedZones = layout.zones.map((zone) =>
        zone.id === zoneId ? { ...zone, components: [...zone.components, component] } : zone
      )
      onLayoutChange({ ...layout, zones: updatedZones })
    },
    [layout, onLayoutChange]
  )

  // Remove component
  const removeComponent = useCallback(
    (componentId: string) => {
      const updatedZones = layout.zones.map((zone) => ({
        ...zone,
        components: zone.components.filter((c) => c.id !== componentId),
      }))
      onLayoutChange({ ...layout, zones: updatedZones })
    },
    [layout, onLayoutChange]
  )

  // Update component props
  const updateComponentProps = useCallback(
    (componentId: string, props: Record<string, unknown>) => {
      const updatedZones = layout.zones.map((zone) => ({
        ...zone,
        components: zone.components.map((comp) =>
          comp.id === componentId ? { ...comp, props: { ...comp.props, ...props } } : comp
        ),
      }))
      onLayoutChange({ ...layout, zones: updatedZones })
    },
    [layout, onLayoutChange]
  )

  // Reorder components within a zone
  const reorderInZone = useCallback(
    (zoneId: string, oldIndex: number, newIndex: number) => {
      const updatedZones = layout.zones.map((zone) => {
        if (zone.id !== zoneId) return zone

        const newComponents = [...zone.components]
        const [moved] = newComponents.splice(oldIndex, 1)
        newComponents.splice(newIndex, 0, moved)

        return { ...zone, components: newComponents }
      })

      onLayoutChange({ ...layout, zones: updatedZones })
    },
    [layout, onLayoutChange]
  )

  return {
    allComponents,
    findComponent,
    findComponentZone,
    addComponentToZone,
    removeComponent,
    updateComponentProps,
    reorderInZone,
  }
}
