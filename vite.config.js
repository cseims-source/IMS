import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // By setting the root to 'frontend', Vite will serve index.html from that directory
  // and resolve all asset paths relative to it. This effectively runs the 'frontend'
  // app while the commands are run from the project's main directory.
  root: 'frontend',
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Your backend server
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
