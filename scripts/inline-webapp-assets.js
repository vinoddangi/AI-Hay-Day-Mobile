import fs from 'fs'
import path from 'path'

const webappDir = path.resolve('scripts', 'apps-script', 'webapp')
const assetsDir = path.join(webappDir, 'assets')
const indexPath = path.join(webappDir, 'index.html')

if (!fs.existsSync(indexPath)) {
  console.error('index.html not found in webapp folder')
  process.exit(1)
}

let html = fs.readFileSync(indexPath, 'utf8')

// Inline CSS files referenced as href="assets/*.css"
html = html.replace(/<link[^>]*href="(assets\/[^"]+\.css)"[^>]*>/g, (m, href) => {
  const file = path.join(webappDir, href)
  if (!fs.existsSync(file)) return ''
  const css = fs.readFileSync(file, 'utf8')
  return `<style>${css}</style>`
})

// Inline JS modules referenced as src="assets/*.js"
html = html.replace(/<script[^>]*src="(assets\/[^"]+\.js)"[^>]*><\/script>/g, (m, src) => {
  const file = path.join(webappDir, src)
  if (!fs.existsSync(file)) return ''
  const js = fs.readFileSync(file, 'utf8')
  return `<script>${js}</script>`
})

fs.writeFileSync(indexPath, html, 'utf8')
console.log('Inlined assets into index.html')

// Remove JS and CSS files from assets dir to avoid clasp trying to parse them
if (fs.existsSync(assetsDir)) {
  const entries = fs.readdirSync(assetsDir)
  entries.forEach((e) => {
    if (e.endsWith('.js') || e.endsWith('.css')) {
      const p = path.join(assetsDir, e)
      fs.unlinkSync(p)
      console.log('Removed', p)
    }
  })
}

process.exit(0)
