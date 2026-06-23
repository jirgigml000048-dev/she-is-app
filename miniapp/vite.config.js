import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import { cpSync, existsSync } from 'fs'
import { join } from 'path'

// Copies cloudfunctions/ into the WeChat dist directory after each build
function copyCloudFunctions() {
  return {
    name: 'copy-cloudfunctions',
    closeBundle() {
      const src = join(process.cwd(), 'cloudfunctions')
      if (!existsSync(src)) return
      // Works for both dev and build output
      const targets = [
        join(process.cwd(), 'dist', 'dev', 'mp-weixin', 'cloudfunctions'),
        join(process.cwd(), 'dist', 'build', 'mp-weixin', 'cloudfunctions'),
      ]
      targets.forEach(dest => {
        try {
          cpSync(src, dest, { recursive: true })
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
