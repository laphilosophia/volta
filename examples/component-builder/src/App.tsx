// ============================================================================
// Component Builder - Main App
// ============================================================================

import {
  useCreateStore,
  useVolta,
  useVoltaMutation,
  useVoltaStore,
} from '@voltakit/volta/react'
import { useCallback, useEffect, useState } from 'react'
import { Canvas } from './components/Canvas'
import { Palette } from './components/Palette'
import { Properties } from './components/Properties'
import { getBuilderMeta, listBuilderComponents, registerBaseComponents } from './registry/components'

import type { CanvasItem, HistoryState, LayoutState, SelectionState } from './types'

// ============================================================================
// App Component
// ============================================================================

export default function App() {
  const { isReady } = useVolta()
  const [isDark, setIsDark] = useState(false)

  // Register base components on mount
  useEffect(() => {
    if (isReady) {
      registerBaseComponents()
      console.log('[Builder] Registered components:', listBuilderComponents())
    }
  }, [isReady])

  // ──────────────────────────────────────────────────────────────────────────
  // Stores
  // ──────────────────────────────────────────────────────────────────────────

  const layoutStore = useCreateStore<LayoutState>('builder-layout', {
    initialState: { items: [] },
    devTools: true,
  })

  const selectionStore = useCreateStore<SelectionState>('builder-selection', {
    initialState: { selectedId: null },
    devTools: true,
  })

  const historyStore = useCreateStore<HistoryState>('builder-history', {
    initialState: {
      past: [],
      present: { items: [] },
      future: [],
    },
    devTools: true,
  })

  // Get store states
  const layout = useVoltaStore(layoutStore!)
  const selection = useVoltaStore(selectionStore!)
  const history = useVoltaStore(historyStore!)

  // Derived: selected item
  const selectedItem = layout?.items.find(i => i.id === selection?.selectedId) || null

  // Derived: can undo/redo
  const canUndo = (history?.past.length ?? 0) > 0
  const canRedo = (history?.future.length ?? 0) > 0

  // ──────────────────────────────────────────────────────────────────────────
  // Actions
  // ──────────────────────────────────────────────────────────────────────────

  const pushHistory = useCallback(() => {
    if (!historyStore || !layout) return
    historyStore.setState({
      past: [...(history?.past || []), history?.present || { items: [] }],
      present: layout,
      future: [],
    })
  }, [historyStore, layout, history])

  const addItem = useCallback((componentId: string) => {
    if (!layoutStore || !layout) return

    pushHistory()

    const meta = getBuilderMeta(componentId)
    const newItem: CanvasItem = {
      id: `item-${Date.now()}`,
      componentId,
      props: { ...(meta?.defaultProps || {}) },
      gridColumn: 'span 4',
    }

    layoutStore.setState({ items: [...layout.items, newItem] })
  }, [layoutStore, layout, pushHistory])

  const removeItem = useCallback((id: string) => {
    if (!layoutStore || !layout) return

    pushHistory()
    layoutStore.setState({ items: layout.items.filter(i => i.id !== id) })

    if (selection?.selectedId === id) {
      selectionStore?.setState({ selectedId: null })
    }
  }, [layoutStore, layout, selection, selectionStore, pushHistory])

  const selectItem = useCallback((id: string | null) => {
    selectionStore?.setState({ selectedId: id })
  }, [selectionStore])

  const updateItemProps = useCallback((id: string, props: Partial<CanvasItem['props']>) => {
    if (!layoutStore || !layout) return

    pushHistory()
    layoutStore.setState({
      items: layout.items.map(i =>
        i.id === id ? { ...i, props: { ...i.props, ...props } } : i
      ),
    })
  }, [layoutStore, layout, pushHistory])

  const updateItemTheme = useCallback((id: string, theme: CanvasItem['theme']) => {
    if (!layoutStore || !layout) return

    pushHistory()
    layoutStore.setState({
      items: layout.items.map(i =>
        i.id === id ? { ...i, theme: { ...i.theme, ...theme } } : i
      ),
    })
  }, [layoutStore, layout, pushHistory])

  const undo = useCallback(() => {
    if (!historyStore || !canUndo || !history) return

    const previous = history.past[history.past.length - 1]
    const newPast = history.past.slice(0, -1)

    historyStore.setState({
      past: newPast,
      present: previous,
      future: [history.present, ...history.future],
    })

    layoutStore?.setState(previous)
  }, [historyStore, layoutStore, history, canUndo])

  const redo = useCallback(() => {
    if (!historyStore || !canRedo || !history) return

    const next = history.future[0]
    const newFuture = history.future.slice(1)

    historyStore.setState({
      past: [...history.past, history.present],
      present: next,
      future: newFuture,
    })

    layoutStore?.setState(next)
  }, [historyStore, layoutStore, history, canRedo])

  // Theme toggle
  const toggleTheme = useCallback(() => {
    const newDark = !isDark
    setIsDark(newDark)
    document.documentElement.setAttribute('data-theme', newDark ? 'dark' : 'light')
  }, [isDark])

  // ──────────────────────────────────────────────────────────────────────────
  // Mutation: Save layout
  // ──────────────────────────────────────────────────────────────────────────

  const { mutate: saveLayout, isLoading: isSaving } = useVoltaMutation<
    { success: boolean },
    LayoutState
  >('/layouts', {
    method: 'POST',
    onSuccess: () => {
      console.log('[Builder] Layout saved!')
    },
  })

  const handleSave = useCallback(() => {
    if (layout) {
      saveLayout(layout)
    }
  }, [layout, saveLayout])

  // ──────────────────────────────────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────────────────────────────────

  if (!isReady || !layoutStore) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        Initializing Builder...
      </div>
    )
  }

  return (
    <div className="builder">
      {/* Header */}
      <header className="builder-header">
        <div className="header-left">
          <button
            className="btn btn-secondary btn-icon"
            onClick={undo}
            disabled={!canUndo}
            title="Undo"
          >
            ↩
          </button>
          <button
            className="btn btn-secondary btn-icon"
            onClick={redo}
            disabled={!canRedo}
            title="Redo"
          >
            ↪
          </button>
        </div>

        <div className="header-center">
          <span className="header-title">🔧 Volta Component Builder</span>
        </div>

        <div className="header-right">
          <button className="btn btn-secondary btn-icon" onClick={toggleTheme} title="Toggle theme">
            {isDark ? '☀️' : '🌙'}
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : '💾 Save'}
          </button>
        </div>
      </header>

      {/* Palette */}
      <Palette onAddItem={addItem} />

      {/* Canvas */}
      <Canvas
        items={layout?.items || []}
        selectedId={selection?.selectedId || null}
        onSelectItem={selectItem}
        onRemoveItem={removeItem}
        onAddItem={addItem}
      />

      {/* Properties */}
      <Properties
        item={selectedItem}
        onUpdateProps={updateItemProps}
        onUpdateTheme={updateItemTheme}
        onRemove={() => selectedItem && removeItem(selectedItem.id)}
      />
    </div>
  )
}
