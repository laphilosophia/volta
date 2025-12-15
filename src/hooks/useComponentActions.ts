// ============================================================================
// useComponentActions Hook - Designer Component Operations
// ============================================================================

import { useCallback } from 'react'
import { componentRegistry } from '../core/component-registry'
import { useDesignerStore } from '../core/state-management'
import type { ComponentMetadata, DataSourceConfig } from '../core/types'

interface UseComponentActionsOptions {
  onAddComponent?: (component: ComponentMetadata) => void
  onUpdateComponent?: (componentId: string, updates: Partial<ComponentMetadata>) => void
  onDeleteComponent?: (componentId: string) => void
}

interface UseComponentActionsReturn {
  /** Create a new component of the given type */
  createComponent: (type: string) => ComponentMetadata | null

  /** Handle adding a component to the designer */
  handleAddComponent: (type: string) => void

  /** Handle updating component props */
  handleUpdateProps: (componentId: string, props: Record<string, unknown>) => void

  /** Handle updating component data source */
  handleUpdateDataSource: (componentId: string, dataSource: DataSourceConfig) => void

  /** Handle deleting the selected component */
  handleDeleteComponent: () => void

  /** Handle copying the selected component */
  handleCopyComponent: (component: ComponentMetadata | null) => void

  /** Handle pasting from clipboard */
  handlePaste: () => ComponentMetadata | null
}

/**
 * Provides common component operations for the designer.
 */
export function useComponentActions({
  onAddComponent,
  onUpdateComponent,
  onDeleteComponent,
}: UseComponentActionsOptions = {}): UseComponentActionsReturn {
  const { selectedComponent, copyComponent, pasteComponent, selectComponent, setDirty } =
    useDesignerStore()

  // Create a new component instance
  const createComponent = useCallback((type: string): ComponentMetadata | null => {
    const definition = componentRegistry.get(type)
    if (!definition) {
      console.warn(`Component type "${type}" not found in registry`)
      return null
    }

    return {
      id: crypto.randomUUID(),
      type,
      props: { ...definition.defaultProps },
      dataSource: { type: 'static' },
    }
  }, [])

  // Handle adding a component
  const handleAddComponent = useCallback(
    (type: string) => {
      const newComponent = createComponent(type)
      if (!newComponent) return

      onAddComponent?.(newComponent)
      // History handled by store middleware
      selectComponent(newComponent.id)
      setDirty(true)
    },
    [createComponent, onAddComponent, selectComponent, setDirty]
  )

  // Handle updating props
  const handleUpdateProps = useCallback(
    (componentId: string, props: Record<string, unknown>) => {
      onUpdateComponent?.(componentId, { props })
      // History handled by store middleware
      setDirty(true)
    },
    [onUpdateComponent, setDirty]
  )

  // Handle updating data source
  const handleUpdateDataSource = useCallback(
    (componentId: string, dataSource: DataSourceConfig) => {
      onUpdateComponent?.(componentId, { dataSource })
      // History handled by store middleware
      setDirty(true)
    },
    [onUpdateComponent, setDirty]
  )

  // Handle deleting component
  const handleDeleteComponent = useCallback(() => {
    if (!selectedComponent) return

    onDeleteComponent?.(selectedComponent)
    // History handled by store middleware
    selectComponent(null)
    setDirty(true)
  }, [selectedComponent, onDeleteComponent, selectComponent, setDirty])

  // Handle copying component
  const handleCopyComponent = useCallback(
    (component: ComponentMetadata | null) => {
      if (component) {
        copyComponent(component)
      }
    },
    [copyComponent]
  )

  // Handle pasting component
  const handlePaste = useCallback(() => {
    const pastedComponent = pasteComponent()
    if (!pastedComponent) return null

    onAddComponent?.(pastedComponent)
    // History handled by store middleware
    selectComponent(pastedComponent.id)
    setDirty(true)

    return pastedComponent
  }, [pasteComponent, onAddComponent, selectComponent, setDirty])

  return {
    createComponent,
    handleAddComponent,
    handleUpdateProps,
    handleUpdateDataSource,
    handleDeleteComponent,
    handleCopyComponent,
    handlePaste,
  }
}
