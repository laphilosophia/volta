/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'

// Library-focused config (no Vite plugins for build)
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    exclude: ['**/node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['**/*.d.ts', '**/*.spec.ts', '**/*.test.ts', '**/index.ts', '**/types/**'],
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
