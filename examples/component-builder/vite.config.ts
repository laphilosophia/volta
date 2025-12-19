import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@voltakit/volta': resolve(__dirname, '../../src'),
      '@shared': resolve(__dirname, '../shared'),
    },
  },
  server: {
    port: 3003,
  },
})
