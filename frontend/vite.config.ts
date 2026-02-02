import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import process from 'node:process'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env variables (including those from Docker)
  const env = loadEnv(mode, process.cwd(), '')
  
  // Parse FRONTEND_ORIGIN into a list of hostnames to satisfy Vite's security check
  const origins = (env.FRONTEND_ORIGIN || '').split(',')
  const allowedHosts = origins.map(url => {
    try {
      const u = url.trim()
      if (!u) return null
      return new URL(u).hostname
    } catch {
      return null
    }
  }).filter(Boolean) as string[]

  const port = parseInt(env.FRONTEND_PORT || '3000', 10)

  return {
    plugins: [react()],
    server: {
      // Allow the hosts defined in our single-source-of-truth .env file
      allowedHosts: allowedHosts.length > 0 ? allowedHosts : true,
      host: true,
      port: port,
    }
  }
})

