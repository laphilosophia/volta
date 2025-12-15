// ============================================================================
// Runtime Store - Application Runtime State
// ============================================================================

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface RuntimeState {
  currentPage: string | null
  queryCache: Record<string, unknown>
  isNavigating: boolean
  sidebarOpen: boolean
  notifications: Notification[]
}

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}

interface RuntimeActions {
  setCurrentPage: (pageId: string) => void
  cacheQuery: (key: string, data: unknown) => void
  clearQueryCache: (key?: string) => void
  setNavigating: (navigating: boolean) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  addNotification: (notification: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  reset: () => void
}

type RuntimeStore = RuntimeState & RuntimeActions

const initialState: RuntimeState = {
  currentPage: null,
  queryCache: {},
  isNavigating: false,
  sidebarOpen: true,
  notifications: [],
}

export const useRuntimeStore = create<RuntimeStore>()(
  devtools(
    (set) => ({
      ...initialState,

      setCurrentPage: (pageId) =>
        set({ currentPage: pageId, isNavigating: false }, false, 'setCurrentPage'),

      cacheQuery: (key, data) =>
        set(
          (state) => ({
            queryCache: { ...state.queryCache, [key]: data },
          }),
          false,
          'cacheQuery'
        ),

      clearQueryCache: (key) =>
        set(
          (state) => {
            if (key) {
              const newCache = { ...state.queryCache }
              delete newCache[key]
              return { queryCache: newCache }
            }
            return { queryCache: {} }
          },
          false,
          'clearQueryCache'
        ),

      setNavigating: (isNavigating) => set({ isNavigating }, false, 'setNavigating'),

      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen }), false, 'toggleSidebar'),

      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }, false, 'setSidebarOpen'),

      addNotification: (notification) =>
        set(
          (state) => ({
            notifications: [...state.notifications, { ...notification, id: crypto.randomUUID() }],
          }),
          false,
          'addNotification'
        ),

      removeNotification: (id) =>
        set(
          (state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
          }),
          false,
          'removeNotification'
        ),

      clearNotifications: () => set({ notifications: [] }, false, 'clearNotifications'),

      reset: () => set(initialState, false, 'reset'),
    }),
    { name: 'RuntimeStore' }
  )
)
