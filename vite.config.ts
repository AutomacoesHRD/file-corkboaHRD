import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron/simple'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    electron({
      main: {
        // Processo principal do Electron
        entry: 'electron/main.ts',
        vite: {
          build: {
            outDir: 'dist/electron',
            // Externalizar todas as dependências nativas
            rollupOptions: {
              external: ['electron', 'electron/main', 'path', 'fs', 'crypto', 'stream', 'events', 'util', 'os', 'tar'],
            },
          },
        },
      },
      preload: {
        // Script de preload
        input: 'electron/preload.ts',
        vite: {
          build: {
            outDir: 'dist/electron',
            rollupOptions: {
              external: ['electron', 'electron/main'],
            },
          },
        },
      },
    }),
  ],
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist/renderer',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
  },
})
