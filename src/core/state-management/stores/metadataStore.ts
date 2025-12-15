// ============================================================================
// Metadata Store - Page & Component Configuration State
// ============================================================================

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { ComponentMetadata, PageMetadata } from '../../types'

interface MetadataState {
  pages: Record<string, PageMetadata>
  components: Record<string, ComponentMetadata>
  isLoading: boolean
  error: string | null
}

interface MetadataActions {
  setPage: (pageId: string, metadata: PageMetadata) => void
  setPages: (pages: Record<string, PageMetadata>) => void
  setComponent: (componentId: string, metadata: ComponentMetadata) => void
  updateComponentProps: (componentId: string, props: Record<string, unknown>) => void
  removePage: (pageId: string) => void
  removeComponent: (componentId: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

type MetadataStore = MetadataState & MetadataActions

const initialState: MetadataState = {
  pages: {},
  components: {},
  isLoading: false,
  error: null,
}

export const useMetadataStore = create<MetadataStore>()(
  devtools(
    (set) => ({
      ...initialState,

      setPage: (pageId, metadata) =>
        set(
          (state) => ({
            pages: { ...state.pages, [pageId]: metadata },
          }),
          false,
          'setPage'
        ),

      setPages: (pages) => set({ pages }, false, 'setPages'),

      setComponent: (componentId, metadata) =>
        set(
          (state) => ({
            components: { ...state.components, [componentId]: metadata },
          }),
          false,
          'setComponent'
        ),

      updateComponentProps: (componentId, props) =>
        set(
          (state) => ({
            components: {
              ...state.components,
              [componentId]: {
                ...state.components[componentId],
                props: { ...state.components[componentId]?.props, ...props },
              },
            },
          }),
          false,
          'updateComponentProps'
        ),

      removePage: (pageId) =>
        set(
          (state) => {
            const { [pageId]: _, ...remainingPages } = state.pages
            return { pages: remainingPages }
          },
          false,
          'removePage'
        ),

      removeComponent: (componentId) =>
        set(
          (state) => {
            const { [componentId]: _, ...remainingComponents } = state.components
            return { components: remainingComponents }
          },
          false,
          'removeComponent'
        ),

      setLoading: (isLoading) => set({ isLoading }, false, 'setLoading'),

      setError: (error) => set({ error, isLoading: false }, false, 'setError'),

      reset: () => set(initialState, false, 'reset'),
    }),
    { name: 'MetadataStore' }
  )
)
