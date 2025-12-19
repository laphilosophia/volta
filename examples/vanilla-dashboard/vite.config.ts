import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    alias: {
      '@shared': resolve(__dirname, '../shared'),
      '@voltakit/volta/core': resolve(__dirname, '../../src/core/index.ts'),
      '@voltakit/volta/react': resolve(__dirname, '../../src/react/index.ts'),
      '@voltakit/volta/layers': resolve(__dirname, '../../src/layers/index.ts'),
    },
  },
  server: {
    port: 3001,
  },
})
