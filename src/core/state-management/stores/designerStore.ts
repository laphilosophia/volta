// ============================================================================
// Designer Store - Dashboard Builder State
// ============================================================================

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { ComponentMetadata } from '../../types'

interface DesignerState {
  mode: 'edit' | 'preview'
  selectedComponent: string | null
  hoveredComponent: string | null
  clipboard: ComponentMetadata | null
  history: Array<{
    action: string
    state: unknown
    timestamp: number
  }>
  historyIndex: number
  isDirty: boolean
  zoom: number
  gridEnabled: boolean
  snapToGrid: boolean
}

interface DesignerActions {
  setMode: (mode: 'edit' | 'preview') => void
  selectComponent: (componentId: string | null) => void
  hoverComponent: (componentId: string | null) => void
  copyComponent: (component: ComponentMetadata) => void
  pasteComponent: () => ComponentMetadata | null
  clearClipboard: () => void
  addToHistory: (action: string, state: unknown) => void
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean
  setDirty: (dirty: boolean) => void
  setZoom: (zoom: number) => void
  toggleGrid: () => void
  toggleSnapToGrid: () => void
  reset: () => void
}

type DesignerStore = DesignerState & DesignerActions

const MAX_HISTORY = 50

const initialState: DesignerState = {
  mode: 'edit',
  selectedComponent: null,
  hoveredComponent: null,
  clipboard: null,
  history: [],
  historyIndex: -1,
  isDirty: false,
  zoom: 100,
  gridEnabled: true,
  snapToGrid: true,
}

export const useDesignerStore = create<DesignerStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setMode: (mode) => set({ mode }, false, 'setMode'),

      selectComponent: (componentId) =>
        set({ selectedComponent: componentId }, false, 'selectComponent'),

      hoverComponent: (componentId) =>
        set({ hoveredComponent: componentId }, false, 'hoverComponent'),

      copyComponent: (component) =>
        set({ clipboard: JSON.parse(JSON.stringify(component)) }, false, 'copyComponent'),

      pasteComponent: () => {
        const { clipboard } = get()
        if (!clipboard) return null

        // Return a copy with new ID
        return {
          ...clipboard,
          id: crypto.randomUUID(),
        }
      },

      clearClipboard: () => set({ clipboard: null }, false, 'clearClipboard'),

      addToHistory: (action, state) =>
        set(
          (prevState) => {
            // Remove any future history entries if we're in the middle of history
            const newHistory = prevState.history.slice(0, prevState.historyIndex + 1)

            // Add new entry
            newHistory.push({
              action,
              state: JSON.parse(JSON.stringify(state)),
              timestamp: Date.now(),
            })

            // Limit history size
            if (newHistory.length > MAX_HISTORY) {
              newHistory.shift()
            }

            return {
              history: newHistory,
              historyIndex: newHistory.length - 1,
              isDirty: true,
            }
          },
          false,
          'addToHistory'
        ),

      undo: () =>
        set(
          (state) => {
            if (state.historyIndex > 0) {
              return { historyIndex: state.historyIndex - 1 }
            }
            return state
          },
          false,
          'undo'
        ),

      redo: () =>
        set(
          (state) => {
            if (state.historyIndex < state.history.length - 1) {
              return { historyIndex: state.historyIndex + 1 }
            }
            return state
          },
          false,
          'redo'
        ),

      canUndo: () => get().historyIndex > 0,

      canRedo: () => {
        const { historyIndex, history } = get()
        return historyIndex < history.length - 1
      },

      setDirty: (isDirty) => set({ isDirty }, false, 'setDirty'),

      setZoom: (zoom) => set({ zoom: Math.min(200, Math.max(25, zoom)) }, false, 'setZoom'),

      toggleGrid: () => set((state) => ({ gridEnabled: !state.gridEnabled }), false, 'toggleGrid'),

      toggleSnapToGrid: () =>
        set((state) => ({ snapToGrid: !state.snapToGrid }), false, 'toggleSnapToGrid'),

      reset: () => set(initialState, false, 'reset'),
    }),
    { name: 'DesignerStore' }
  )
)
