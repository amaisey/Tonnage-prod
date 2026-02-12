import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

// Auto-stamp sw.js and version.json with a unique build timestamp
// so the browser always detects a new service worker on each deploy.
function swVersionPlugin() {
  return {
    name: 'sw-version-stamp',
    writeBundle({ dir }) {
      const outDir = dir || 'dist'
      const buildTime = new Date().toISOString()
      const buildId = Date.now().toString(36)

      // Stamp sw.js with unique cache name + version
      const swPath = resolve(outDir, 'sw.js')
      try {
        let sw = readFileSync(swPath, 'utf-8')
        sw = sw.replace(
          /const CACHE_NAME = '.*?'/,
          `const CACHE_NAME = 'workout-tracker-${buildId}'`
        )
        sw = sw.replace(
          /const APP_VERSION = '.*?'/,
          `const APP_VERSION = '${buildTime}'`
        )
        writeFileSync(swPath, sw)
      } catch (e) {
        console.warn('sw-version-stamp: could not process sw.js', e.message)
      }

      // Stamp version.json
      const vjPath = resolve(outDir, 'version.json')
      try {
        writeFileSync(vjPath, JSON.stringify({ version: buildId, buildTime }, null, 2))
      } catch (e) {
        console.warn('sw-version-stamp: could not process version.json', e.message)
      }

      console.log(`✅ SW stamped: build ${buildId} (${buildTime})`)
    }
  }
}

export default defineConfig({
  plugins: [react(), swVersionPlugin()],
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
