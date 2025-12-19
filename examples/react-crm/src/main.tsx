import { ThemeProvider, VoltaProvider } from '@voltakit/volta/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'

// Volta configuration
const voltaConfig = {
  baseUrl: '/api',
  enableDevTools: true,
  cache: {
    staleTime: 30000,
    cacheTime: 300000,
  },
}

// Theme configuration
interface CRMTheme {
  mode: 'light' | 'dark'
  colors: {
    primary: string
    background: string
  }
}

const themeConfig = {
  defaultTheme: {
    mode: 'light' as const,
    colors: {
      primary: '#6366f1',
      background: '#f8fafc',
    },
  },
}

// Start mock server before rendering
async function start() {
  const { startMockServer } = await import('@shared/mocks')
  await startMockServer()

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <VoltaProvider config={voltaConfig}>
        <ThemeProvider<CRMTheme> config={themeConfig}>
          <App />
        </ThemeProvider>
      </VoltaProvider>
    </StrictMode>
  )
}

start()
