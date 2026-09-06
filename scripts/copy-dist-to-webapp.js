import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const distDir = path.resolve(__dirname, '..', 'dist')
const webappDir = path.resolve(__dirname, 'apps-script', 'webapp')

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return
  const stat = fs.statSync(src)
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true })
    const entries = fs.readdirSync(src)
    entries.forEach((e) => copyRecursive(path.join(src, e), path.join(dest, e)))
  } else {
    fs.copyFileSync(src, dest)
  }
}

function prepare() {
  if (!fs.existsSync(distDir)) {
    console.error('dist directory not found. Run `npm run build` first.')
    process.exit(1)
  }

  // ensure webapp dir exists
  if (!fs.existsSync(webappDir)) fs.mkdirSync(webappDir, { recursive: true })

  // copy assets and files
  // copy entire dist into webappDir
  // but replace absolute /assets/ paths to relative assets/
  const indexPath = path.join(distDir, 'index.html')
  if (!fs.existsSync(indexPath)) {
    console.error('dist/index.html not found')
    process.exit(1)
  }

  // copy all files
  copyRecursive(distDir, webappDir)

  // fix index.html asset paths
  let indexHtml = fs.readFileSync(path.join(webappDir, 'index.html'), 'utf8')
  // Replace occurrences of /assets/ or \"/assets/ with assets/
  indexHtml = indexHtml.replace(/(["'])\/assets\//g, '$1assets/')
  // Also replace src="/" references to ./
  indexHtml = indexHtml.replace(/href=\"\//g, 'href="')

  fs.writeFileSync(path.join(webappDir, 'index.html'), indexHtml, 'utf8')
  console.log('Copied dist ->', webappDir)
}

prepare()
