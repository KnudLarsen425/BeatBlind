import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    sourcemap: false,
    target: 'es2020',
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/spotify-embed': {
        target: 'https://open.spotify.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/spotify-embed/, '/embed'),
      },
      '/deezer': {
        target: 'https://api.deezer.com',
        changeOrigin: true,
        followRedirects: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/deezer/, ''),
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
  },
  appType: 'spa',
})
