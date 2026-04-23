import { execSync } from 'child_process'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// TODO: workaround — derive version from git tags; replace with a proper versioning system later
const appVersion = (() => {
  try {
    return execSync('git describe --tags --always').toString().trim()
  } catch {
    return 'unknown'
  }
})()

export default defineConfig({
  base: '/acorn/',
  plugins: [tailwindcss(), react()],
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
  },
})
