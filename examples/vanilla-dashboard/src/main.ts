// ============================================================================
// Volta Vanilla Dashboard - Main Entry Point
// Demonstrates Volta's framework-agnostic API
// ============================================================================

import {
  clearRegistry,
  createStore,
  destroyVolta,
  getComponentTypes,
  getPendingRequestCount,
  getStore,
  getVoltaStatus,
  initVolta,
  invalidate,
  isNetworkOnline,
  listComponents,
  mutate,
  query,
  register,
  store,
  voltaQuery,
} from '@voltakit/volta/core'

import { startMockServer } from '@shared/mocks'
import type { ApiResponse, DashboardStats, User } from '@shared/types'

// ============================================================================
// App State Store
// ============================================================================

interface UIState {
  viewMode: 'table' | 'cards'
  lastFetchTime: string | null
  searchQuery: string
  statusFilter: string
}

// ============================================================================
// Initialize Application
// ============================================================================

async function initApp() {
  try {
    // Start MSW mock server
    await startMockServer()

    // Initialize Volta
    initVolta({
      baseUrl: '/api',
      enableDevTools: true,
      cache: {
        staleTime: 30000, // 30 seconds
        cacheTime: 300000, // 5 minutes
      },
      retry: {
        count: 3,
        delay: 1000,
      },
    })

    // Create UI state store
    createStore<UIState>('ui', {
      initialState: {
        viewMode: 'table',
        lastFetchTime: null,
        searchQuery: '',
        statusFilter: '',
      },
    })

    // Update status indicator
    updateStatusIndicator()

    // Load initial data
    await loadDashboardData()
    await loadUsers()

    // Setup event listeners
    setupEventListeners()

    console.log('[App] Initialized successfully')
  } catch (error) {
    console.error('[App] Initialization failed:', error)
    showError('Application failed to initialize')
  }
}

// ============================================================================
// Data Loading
// ============================================================================

async function loadDashboardData() {
  try {
    const response = await voltaQuery<ApiResponse<DashboardStats>>('/stats')
    renderStats(response.data)
  } catch (error) {
    console.error('[App] Failed to load stats:', error)
    showStatsError()
  }
}

async function loadUsers(search?: string, status?: string) {
  try {
    // Build query params
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (status) params.set('status', status)

    const endpoint = `/users${params.toString() ? `?${params}` : ''}`
    const response = await voltaQuery<ApiResponse<User[]>>(endpoint)

    renderUsers(response.data)
    updateLastFetchTime()
  } catch (error) {
    console.error('[App] Failed to load users:', error)
    showUsersError()
  }
}

async function createUser(userData: Partial<User>) {
  try {
    await mutate<ApiResponse<User>>('/users', userData, {
      method: 'POST',
      invalidates: ['/users'],
    })

    // Reload users after creation
    await loadUsers()
    closeModal()
  } catch (error) {
    console.error('[App] Failed to create user:', error)
    alert('Failed to create user')
  }
}

async function deleteUser(userId: string) {
  if (!confirm('Are you sure you want to delete this user?')) {
    return
  }

  try {
    await mutate(`/users/${userId}`, undefined, {
      method: 'DELETE',
      invalidates: ['/users'],
    })

    // Reload users after deletion
    await loadUsers()
  } catch (error) {
    console.error('[App] Failed to delete user:', error)
    alert('Failed to delete user')
  }
}

// ============================================================================
// Rendering
// ============================================================================

function renderStats(stats: DashboardStats) {
  const container = document.getElementById('stats-container')!

  container.innerHTML = `
    <div class="stat-card">
      <div class="stat-label">Total Users</div>
      <div class="stat-value">${stats.totalUsers.toLocaleString()}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Active Users</div>
      <div class="stat-value">${stats.activeUsers.toLocaleString()}</div>
      <div class="stat-trend positive">
        ↑ ${Math.round((stats.activeUsers / stats.totalUsers) * 100)}%
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Total Revenue</div>
      <div class="stat-value">$${(stats.totalRevenue / 1000).toFixed(0)}K</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Monthly Growth</div>
      <div class="stat-value">${stats.monthlyGrowth}%</div>
      <div class="stat-trend ${stats.monthlyGrowth > 0 ? 'positive' : 'negative'}">
        ${stats.monthlyGrowth > 0 ? '↑' : '↓'} Last 30 days
      </div>
    </div>
  `
}

function renderUsers(users: User[]) {
  const tbody = document.getElementById('users-tbody')!

  if (users.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="loading-cell">No users found</td>
      </tr>
    `
    return
  }

  tbody.innerHTML = users
    .map(
      (user) => `
    <tr data-user-id="${user.id}">
      <td>
        <img
          src="${user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}"
          alt="${user.name}"
          class="user-avatar"
        />
      </td>
      <td><strong>${user.name}</strong></td>
      <td>${user.email}</td>
      <td><span class="badge badge-${user.role}">${user.role}</span></td>
      <td><span class="badge badge-${user.status}">${user.status === 'active' ? 'Active' : 'Inactive'}</span></td>
      <td>
        <button class="btn btn-sm btn-danger delete-user-btn" data-user-id="${user.id}">
          Delete
        </button>
      </td>
    </tr>
  `
    )
    .join('')

  // Add delete handlers
  tbody.querySelectorAll<HTMLButtonElement>('.delete-user-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const userId = btn.dataset.userId!
      deleteUser(userId)
    })
  })
}

function showStatsError() {
  const container = document.getElementById('stats-container')!
  container.innerHTML = `
    <div class="stat-card" style="grid-column: 1 / -1; text-align: center; color: var(--color-error);">
      Failed to load statistics
    </div>
  `
}

function showUsersError() {
  const tbody = document.getElementById('users-tbody')!
  tbody.innerHTML = `
    <tr>
      <td colspan="6" class="loading-cell" style="color: var(--color-error);">
        Failed to load users
      </td>
    </tr>
  `
}

function showError(message: string) {
  alert(message)
}

// ============================================================================
// UI Updates
// ============================================================================

function updateStatusIndicator() {
  const indicator = document.getElementById('status-indicator')!
  const status = getVoltaStatus()
  indicator.textContent = `Volta: ${status}`
  indicator.className = `status ${status}`
}

function updateLastFetchTime() {
  const store = getStore<UIState>('ui')
  if (store) {
    const now = new Date().toLocaleTimeString('tr-TR')
    store.setState({ lastFetchTime: now })

    const el = document.getElementById('last-fetch')!
    el.textContent = now
  }
}

function updateNetworkStatus() {
  const networkEl = document.getElementById('network-status')!
  const pendingEl = document.getElementById('pending-count')!

  networkEl.textContent = isNetworkOnline() ? '🟢 Online' : '🔴 Offline'
  pendingEl.textContent = String(getPendingRequestCount())
}

function updateStoreState() {
  const store = getStore<UIState>('ui')
  if (store) {
    const el = document.getElementById('store-state')!
    el.textContent = store.getState().viewMode
  }
}

function toggleViewMode() {
  const store = getStore<UIState>('ui')
  if (store) {
    const current = store.getState().viewMode
    store.setState({ viewMode: current === 'table' ? 'cards' : 'table' })
    updateStoreState()
  }
}

// ============================================================================
// Modal
// ============================================================================

function openModal() {
  const modal = document.getElementById('add-user-modal') as HTMLDialogElement
  modal.showModal()
}

function closeModal() {
  const modal = document.getElementById('add-user-modal') as HTMLDialogElement
  modal.close()
  ;(document.getElementById('add-user-form') as HTMLFormElement).reset()
}

// ============================================================================
// Event Listeners
// ============================================================================

function setupEventListeners() {
  // Search input
  const searchInput = document.getElementById('search-input') as HTMLInputElement
  let searchTimeout: ReturnType<typeof setTimeout>

  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
      const store = getStore<UIState>('ui')
      const statusFilter = store?.getState().statusFilter || ''
      loadUsers(searchInput.value, statusFilter)
    }, 300)
  })

  // Status filter
  const statusFilter = document.getElementById('status-filter') as HTMLSelectElement
  statusFilter.addEventListener('change', () => {
    const store = getStore<UIState>('ui')
    if (store) {
      store.setState({ statusFilter: statusFilter.value })
    }
    loadUsers(searchInput.value, statusFilter.value)
  })

  // Add user button
  document.getElementById('add-user-btn')!.addEventListener('click', openModal)

  // Modal cancel button
  document.getElementById('cancel-modal')!.addEventListener('click', closeModal)

  // Add user form
  const form = document.getElementById('add-user-form') as HTMLFormElement
  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const formData = new FormData(form)
    createUser({
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      role: formData.get('role') as User['role'],
    })
  })

  // Invalidate cache button
  document.getElementById('invalidate-btn')!.addEventListener('click', () => {
    invalidate('/users')
    invalidate('/stats')
    loadDashboardData()
    loadUsers()
  })

  // Toggle view button
  document.getElementById('toggle-view-btn')!.addEventListener('click', toggleViewMode)

  // Registry buttons
  document
    .getElementById('register-sample-btn')!
    .addEventListener('click', registerSampleComponents)
  document.getElementById('clear-registry-btn')!.addEventListener('click', handleClearRegistry)

  // Update network status periodically
  setInterval(updateNetworkStatus, 1000)

  // Initial UI state update
  updateStoreState()
  updateNetworkStatus()
  renderRegistry()
}

// ============================================================================
// Component Registry Demo
// ============================================================================

let sampleCounter = 0

const sampleComponentDefinitions = [
  {
    name: 'UserCard',
    type: 'display',
    description: 'User profile card',
    hasDataBinding: true,
    hasStateBinding: false,
    hasThemeBinding: true,
  },
  {
    name: 'DataTable',
    type: 'display',
    description: 'Data table component',
    hasDataBinding: true,
    hasStateBinding: true,
    hasThemeBinding: true,
  },
  {
    name: 'SearchInput',
    type: 'input',
    description: 'Search input field',
    hasDataBinding: false,
    hasStateBinding: true,
    hasThemeBinding: false,
  },
  {
    name: 'StatCard',
    type: 'display',
    description: 'Statistics card',
    hasDataBinding: true,
    hasStateBinding: false,
    hasThemeBinding: true,
  },
  {
    name: 'ActionButton',
    type: 'action',
    description: 'Action button',
    hasDataBinding: false,
    hasStateBinding: true,
    hasThemeBinding: true,
  },
]

function registerSampleComponents() {
  const sample = sampleComponentDefinitions[sampleCounter % sampleComponentDefinitions.length]
  sampleCounter++

  const componentName = `${sample.name}_${sampleCounter}`

  // Build component definition with bindings using Volta's ComponentRegistry API
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const definition: any = {
    type: sample.type,
  }

  // Add data binding if component has it
  if (sample.hasDataBinding) {
    definition.data = query({ endpoint: '/users', staleTime: 60000 })
  }

  // Add state binding if component has it
  if (sample.hasStateBinding) {
    definition.state = store({ initial: { isActive: false, count: 0 } })
  }

  // Add theme binding if component has it
  if (sample.hasThemeBinding) {
    definition.theme = ['colors.primary', 'colors.background', 'spacing.md']
  }

  // Register component
  const result = register(componentName, definition)

  console.log(`[Registry] Registered: ${componentName}`, result)
  renderRegistry()
}

function handleClearRegistry() {
  clearRegistry()
  sampleCounter = 0
  renderRegistry()
  console.log('[Registry] Cleared all components')
}

function renderRegistry() {
  const container = document.getElementById('registry-container')!
  const countEl = document.getElementById('component-count')!
  const typesEl = document.getElementById('component-types')!

  const components = listComponents()
  const types = getComponentTypes()

  countEl.textContent = String(components.length)
  typesEl.textContent = types.length > 0 ? types.join(', ') : '-'

  if (components.length === 0) {
    container.innerHTML = '<div class="registry-empty">No components registered yet</div>'
    return
  }

  container.innerHTML = components
    .map(({ key, definition }) => {
      const sample = sampleComponentDefinitions.find((s) => key.startsWith(s.name)) || {
        description: 'Custom component',
        hasDataBinding: false,
        hasStateBinding: false,
        hasThemeBinding: false,
      }

      const bindings = []
      // Check actual bindings from definition
      if (definition.data) bindings.push('<span class="binding-tag data">DATA</span>')
      if (definition.state) bindings.push('<span class="binding-tag state">STATE</span>')
      if (definition.theme && definition.theme.length > 0)
        bindings.push('<span class="binding-tag theme">THEME</span>')

      return `
        <div class="component-card">
          <div class="component-card-header">
            <span class="component-card-title">${key}</span>
            <span class="component-card-type">${definition.type}</span>
          </div>
          <p class="component-card-meta">${sample.description}</p>
          <div class="component-card-bindings">
            ${bindings.join('')}
          </div>
        </div>
      `
    })
    .join('')
}

// ============================================================================
// Start Application
// ============================================================================

initApp()

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  destroyVolta()
})
