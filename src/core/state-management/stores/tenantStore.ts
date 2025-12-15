// ============================================================================
// Tenant Store - Global Tenant State
// ============================================================================

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { TenantTheme } from '../../types'

interface TenantState {
  tenantId: string | null
  theme: TenantTheme | null
  locale: string
  isLoading: boolean
  error: string | null
}

interface TenantActions {
  setTenant: (id: string, theme: TenantTheme) => void
  setLocale: (locale: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

type TenantStore = TenantState & TenantActions

const initialState: TenantState = {
  tenantId: null,
  theme: null,
  locale: 'en',
  isLoading: true,
  error: null,
}

export const useTenantStore = create<TenantStore>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        setTenant: (id, theme) =>
          set({ tenantId: id, theme, isLoading: false, error: null }, false, 'setTenant'),

        setLocale: (locale) => set({ locale }, false, 'setLocale'),

        setLoading: (isLoading) => set({ isLoading }, false, 'setLoading'),

        setError: (error) => set({ error, isLoading: false }, false, 'setError'),

        reset: () => set(initialState, false, 'reset'),
      }),
      {
        name: 'tenant-storage',
        partialize: (state) => ({ locale: state.locale }),
      }
    ),
    { name: 'TenantStore' }
  )
)
