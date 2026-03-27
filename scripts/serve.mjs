import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const defaultEntry = 'Reihengeschaeftsrechner_22.html'

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
}

function resolveRequestPath(urlPath) {
  const pathname = decodeURIComponent(new URL(urlPath, 'http://localhost').pathname)
  const target = pathname === '/' ? `/${defaultEntry}` : pathname
  const normalized = path.normalize(target).replace(/^(\.\.[/\\])+/, '')
  return path.join(rootDir, normalized)
}

async function runCheck() {
  const requiredFiles = [
    'CLAUDE.md',
    'README.md',
    'RGR_CHANGELOG.md',
    'RGR_TODO.md',
    'Reihengeschaeftsrechner_22.html',
    'index.html',
    'package.json',
  ]

  const results = await Promise.all(
    requiredFiles.map(async (relativePath) => {
      const absolutePath = path.join(rootDir, relativePath)
      await stat(absolutePath)
      return relativePath
    }),
  )

  console.log(`Projektstruktur OK (${results.length} Dateien geprueft).`)
}

async function runPagesCheck() {
  const requiredFiles = [
    'docs/index.html',
    'docs/.nojekyll',
    'docs/assets/styles/app.css',
    'docs/assets/scripts/app.js',
  ]

  const results = await Promise.all(
    requiredFiles.map(async (relativePath) => {
      const absolutePath = path.join(rootDir, relativePath)
      await stat(absolutePath)
      return relativePath
    }),
  )

  console.log(`Pages-Struktur OK (${results.length} Dateien geprueft).`)
}

if (process.argv.includes('--check')) {
  runCheck().catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
} else if (process.argv.includes('--check-pages')) {
  runPagesCheck().catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
} else {
  const host = process.env.HOST || '127.0.0.1'
  const port = Number(process.env.PORT || 4173)

  const server = createServer(async (request, response) => {
    try {
      const filePath = resolveRequestPath(request.url || '/')
      const file = await readFile(filePath)
      const ext = path.extname(filePath)

      response.writeHead(200, {
        'Content-Type': mimeTypes[ext] || 'application/octet-stream',
        'Cache-Control': 'no-store',
      })
      response.end(file)
    } catch {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
      response.end('Datei nicht gefunden.')
    }
  })

  server.listen(port, host, () => {
    console.log(`Reihengeschaeftsrechner laeuft auf http://${host}:${port}`)
    console.log(`Startseite: http://${host}:${port}/`)
  })
}
