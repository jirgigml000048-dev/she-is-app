import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import { cpSync, existsSync, readFileSync, rmSync, writeFileSync } from 'fs'
import { join } from 'path'

function ensureCloudFunctionRoot(projectRoot) {
  const configPath = join(projectRoot, 'project.config.json')
  if (!existsSync(configPath)) return
  const config = JSON.parse(readFileSync(configPath, 'utf8'))
  if (config.cloudfunctionRoot === 'cloudfunctions/') return
  config.cloudfunctionRoot = 'cloudfunctions/'
  writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`)
}

function removeRemoteAssetCopies(projectRoot) {
  // Story covers are loaded from OSS in stories.js. Keep the source originals,
  // but do not duplicate them inside the mini program upload package.
  const coversDir = join(projectRoot, 'static', 'covers')
  if (existsSync(coversDir)) {
    rmSync(coversDir, { recursive: true, force: true })
    console.log('[Assets] excluded remote story covers from ' + projectRoot)
  }
}

// Copies cloudfunctions/ and marks the folder for WeChat DevTools after each build.
function copyCloudFunctions() {
  return {
    name: 'copy-cloudfunctions',
    closeBundle() {
      const src = join(process.cwd(), 'cloudfunctions')
      if (!existsSync(src)) return
      // Works for both dev and build output
      const targets = [
        join(process.cwd(), 'dist', 'dev', 'mp-weixin'),
        join(process.cwd(), 'dist', 'build', 'mp-weixin'),
      ]
      targets.forEach(projectRoot => {
        try {
          removeRemoteAssetCopies(projectRoot)
          const dest = join(projectRoot, 'cloudfunctions')
          cpSync(src, dest, { recursive: true })
          ensureCloudFunctionRoot(projectRoot)
          console.log('[CloudBase] cloudfunctions → ' + dest)
        } catch (_) {}
      })
    }
  }
}

export default defineConfig({
  plugins: [
    uni(),
    copyCloudFunctions(),
  ],
})
