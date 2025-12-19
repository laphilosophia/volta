import { ThemeProvider, VoltaProvider } from '@voltakit/volta/react'
import { StrictMode } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
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
interface BuilderTheme {
  mode: 'light' | 'dark'
  colors: {
    primary: string
    accent: string
    background: string
  }
}

const themeConfig = {
  defaultTheme: {
    mode: 'light' as const,
    colors: {
      primary: '#6366f1',
      accent: '#06b6d4',
      background: '#f8fafc',
    },
  },
}

// Start mock server and render app
async function start() {
  const { startMockServer } = await import('@shared/mocks')
  await startMockServer()

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <VoltaProvider config={voltaConfig}>
        <ThemeProvider<BuilderTheme> config={themeConfig}>
          <DndProvider backend={HTML5Backend}>
            <App />
          </DndProvider>
        </ThemeProvider>
      </VoltaProvider>
    </StrictMode>
  )
}

start()
