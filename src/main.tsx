// ============================================================================
// Main Application Entry Point
// ============================================================================

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { initApiClient } from './core/api/client'
import './core/i18n/config'
import { useTenantStore } from './core/state-management'
import { themeManager } from './core/theme-engine'
import './index.css'
import { voltaConfig } from './voltaboard.config'

/**
 * Bootstrap the application:
 * 1. Extract tenant ID from subdomain or path
 * 2. Load tenant-specific theme
 * 3. Initialize i18n
 * 4. Render the app
 */
async function bootstrap() {
  console.log('🚀 Volta starting...')

  // Extract tenant ID from subdomain (e.g., acme.yourapp.com → acme)
  // In development, default to 'default' tenant
  const hostname = window.location.hostname
  let tenantId = 'default'

  if (hostname !== 'localhost' && !hostname.startsWith('127.0.0.1')) {
    const subdomain = hostname.split('.')[0]
    if (subdomain && subdomain !== 'www') {
      tenantId = subdomain
    }
  }

  // Initialize API Client
  console.log('🔌 Initializing Headless API Client...')
  initApiClient(voltaConfig)

  console.log(`📦 Loading tenant: ${tenantId}`)

  // Initialize dark mode preference
  themeManager.initDarkMode()

  // Load tenant theme
  try {
    const theme = await themeManager.loadTheme(tenantId)
    useTenantStore.getState().setTenant(tenantId, theme)
    console.log('🎨 Theme loaded successfully')
  } catch {
    console.warn('⚠️ Failed to load theme, using defaults')
    const defaultTheme = themeManager.getDefaultTheme()
    useTenantStore.getState().setTenant(tenantId, defaultTheme)
  }

  // Render the app
  const root = document.getElementById('root')
  if (!root) {
    throw new Error('Root element not found')
  }

  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )

  console.log('✅ Volta ready')
}

// Start bootstrap
bootstrap().catch((error) => {
  console.error('❌ Failed to start application:', error)
})
