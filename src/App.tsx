// ============================================================================
// Root Application Component
// ============================================================================

import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ErrorBoundary, LoadingScreen } from './components/common'
import { useTenantStore } from './core/state-management'

// Lazy-loaded modules for code splitting
const Designer = lazy(() => import('./designer'))
const Runtime = lazy(() => import('./runtime'))

// ============================================================================
// Main App Component
// ============================================================================

const App: React.FC = () => {
  const { tenantId, isLoading } = useTenantStore()

  // Show loading while tenant is being loaded
  if (isLoading || !tenantId) {
    return <LoadingScreen />
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            {/* Designer Mode - Low-Code Dashboard Builder */}
            <Route path="/designer/*" element={<Designer />} />

            {/* Runtime Mode - Production Application */}
            <Route path="/app/*" element={<Runtime />} />

            {/* Default redirect to app */}
            <Route path="*" element={<Navigate to="/app" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
