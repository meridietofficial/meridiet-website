import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const isSsrBuild = process.env.VITE_SSR === '1'

export default defineConfig({
  plugins: [react()],

  server: {
    host: true,
    port: 5173,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
    },
  },

  build: {
    outDir: isSsrBuild ? 'dist-ssr' : 'dist',

    ...(isSsrBuild && {
      ssr: true,
      rollupOptions: {
        input: 'src/entry-server.tsx',
      },
    }),

    ...(!isSsrBuild && {
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('agora-rtc-sdk-ng')) return 'agora'
            if (id.includes('@aws-sdk'))          return 'aws-sdk'
            if (id.includes('react-dom') || id.includes('react-router-dom')) return 'react-vendor'
            if (id.includes('react/'))            return 'react-vendor'
            if (id.includes('lucide-react'))      return 'lucide'
            if (id.includes('@react-oauth'))      return 'google-oauth'
            if (id.includes('country-state-city')) return 'location'
          },
        },
      },
    }),
  },
})
