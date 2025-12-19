// ============================================================================
// Volta React CRM - Main Application
// Demonstrates Volta's React hooks and adapters
// ============================================================================
// NOTE: Only imports from @voltakit/volta/react - no core or layers imports!

import { useCallback, useState } from 'react'

// Everything from React adapter - single entry point
import {
  useCreateStore,
  useVolta,
  useVoltaMutation,
  useVoltaQuery,
  useVoltaStore,
} from '@voltakit/volta/react'

// Shared Types
import type { Customer, DashboardStats } from '@shared/types'

// ============================================================================
// Types
// ============================================================================

interface FilterState {
  showActive: boolean
  sortBy: 'value' | 'name'
}

// ============================================================================
// Main App Component
// ============================================================================

export default function App() {
  const { isReady } = useVolta()

  const [isDark, setIsDark] = useState(false)
  const [activeView, setActiveView] = useState<'dashboard' | 'customers'>('dashboard')

  // Theme toggle using local state
  const handleToggleTheme = useCallback(() => {
    const newIsDark = !isDark
    setIsDark(newIsDark)
    document.documentElement.setAttribute('data-theme', newIsDark ? 'dark' : 'light')
  }, [isDark])

  if (!isReady) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        Initializing Volta...
      </div>
    )
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-logo">📊 Volta CRM</div>
        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveView('dashboard')}
          >
            🏠 Dashboard
          </button>
          <button
            className={`nav-item ${activeView === 'customers' ? 'active' : ''}`}
            onClick={() => setActiveView('customers')}
          >
            👥 Customers
          </button>
        </nav>
      </aside>

      <main className="main-content">
        <header className="page-header">
          <h1 className="page-title">{activeView === 'dashboard' ? 'Dashboard' : 'Customers'}</h1>
          <div className="header-actions">
            <button className="theme-toggle" onClick={handleToggleTheme}>
              {isDark ? '☀️' : '🌙'}
            </button>
          </div>
        </header>

        {activeView === 'dashboard' ? <DashboardView /> : <CustomersView />}
      </main>
    </div>
  )
}

// ============================================================================
// Dashboard View
// ============================================================================

function DashboardView() {
  const { data: stats, isLoading, error, refetch } = useVoltaQuery<DashboardStats>('/stats')

  // Create store using React hook (handles Volta lifecycle internally)
  const filtersStore = useCreateStore<FilterState>('dashboard-filters', {
    initialState: { showActive: true, sortBy: 'value' },
  })

  // Subscribe to store state
  const filterState = useVoltaStore(filtersStore!)

  const toggleActive = useCallback(() => {
    filtersStore?.setState({ showActive: !filterState.showActive })
  }, [filtersStore, filterState.showActive])

  const toggleSort = useCallback(() => {
    filtersStore?.setState({
      sortBy: filterState.sortBy === 'value' ? 'name' : 'value',
    })
  }, [filtersStore, filterState.sortBy])

  if (isLoading || !filtersStore) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        Loading dashboard...
      </div>
    )
  }

  if (error) {
    return (
      <div className="error">
        Failed to load dashboard: {error.message}
        <button className="btn btn-primary" onClick={() => refetch()} style={{ marginLeft: 16 }}>
          Retry
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Users</div>
          <div className="stat-value">{stats?.totalUsers?.toLocaleString() ?? '-'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Users</div>
          <div className="stat-value">{stats?.activeUsers?.toLocaleString() ?? '-'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value">${((stats?.totalRevenue ?? 0) / 1000).toFixed(0)}K</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Monthly Growth</div>
          <div className="stat-value">{stats?.monthlyGrowth ?? 0}%</div>
        </div>
      </div>

      <div className="hook-demo">
        <div className="hook-card">
          <h3>
            📡 <code>useVoltaQuery</code>
          </h3>
          <p>Auto-caching data fetcher with loading states.</p>
          <button className="btn btn-secondary" onClick={() => refetch()} style={{ marginTop: 12 }}>
            Refetch Data
          </button>
        </div>

        <div className="hook-card">
          <h3>
            🗄️ <code>useVoltaStore</code>
          </h3>
          <p>Reactive state store subscription.</p>
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button
              className={`btn ${filterState.showActive ? 'btn-primary' : 'btn-secondary'}`}
              onClick={toggleActive}
            >
              Active: {filterState.showActive ? 'ON' : 'OFF'}
            </button>
            <button className="btn btn-secondary" onClick={toggleSort}>
              Sort: {filterState.sortBy}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ============================================================================
// Customers View
// ============================================================================

function CustomersView() {
  const { data: customers, isLoading, error, refetch } = useVoltaQuery<Customer[]>('/customers')

  const { mutate, isLoading: isMutating } = useVoltaMutation<
    Customer,
    { name: string; company: string; email: string; phone: string; status: string; value: number }
  >('/customers', {
    method: 'POST',
    invalidates: ['/customers'],
    onSuccess: () => refetch(),
  })

  const handleAddCustomer = () => {
    mutate({
      name: `New Customer ${Date.now()}`,
      company: 'Acme Inc.',
      email: `customer${Date.now()}@example.com`,
      phone: '+1 555 000 0000',
      status: 'lead',
      value: Math.floor(Math.random() * 100000),
    })
  }

  if (isLoading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        Loading customers...
      </div>
    )
  }

  if (error) {
    return <div className="error">Failed to load customers: {error.message}</div>
  }

  return (
    <>
      <div className="customers-section">
        <div className="section-header">
          <h2 className="section-title">All Customers ({customers?.length ?? 0})</h2>
          <button className="btn btn-primary" onClick={handleAddCustomer} disabled={isMutating}>
            {isMutating ? 'Adding...' : '+ Add Customer'}
          </button>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Company</th>
              <th>Email</th>
              <th>Status</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {customers?.map((customer) => (
              <tr key={customer.id}>
                <td>
                  <strong>{customer.name}</strong>
                </td>
                <td>{customer.company}</td>
                <td>{customer.email}</td>
                <td>
                  <span className={`badge badge-${customer.status}`}>{customer.status}</span>
                </td>
                <td>${customer.value.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="hook-demo" style={{ marginTop: 24 }}>
        <div className="hook-card">
          <h3>
            ✏️ <code>useVoltaMutation</code>
          </h3>
          <p>Handles POST/PUT/DELETE with callbacks.</p>
        </div>
      </div>
    </>
  )
}
