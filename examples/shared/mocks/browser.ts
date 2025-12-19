import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

// Browser worker for MSW
export const worker = setupWorker(...handlers)

// Helper to start MSW in development
export async function startMockServer() {
  if (typeof window === 'undefined') {
    console.warn('MSW: Cannot start in non-browser environment')
    return
  }

  await worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: {
      url: '/mockServiceWorker.js',
    },
  })

  console.log('[MSW] Mock server started')
}
