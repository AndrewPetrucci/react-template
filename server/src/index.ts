import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import path from 'path'
import { existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { ensureDatabase, ensureSchema } from './db.js'
import itemsRouter from './routes/items/index.js'
import authRouter from './routes/auth/index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many attempts, try again later' },
})
app.use('/api/auth', authLimiter)

app.get('/.well-known/appspecific/com.chrome.devtools.json', (_, res) => {
  res.status(200).json({})
})

app.use('/api/items', itemsRouter)
app.use('/api/auth', authRouter)

app.get('/api/health', (_, res) => {
  res.json({ status: 'ok' })
})

const clientOut = path.join(__dirname, '../../client/out')
const clientDist = path.join(__dirname, '../../client/dist')
const staticDir = existsSync(clientOut) ? clientOut : clientDist
const isNextExport = staticDir === clientOut
if (staticDir) {
  app.use(express.static(staticDir))
  app.get('*', (req, res) => {
    if (isNextExport) {
      const subpath = req.path.replace(/^\//, '').split('?')[0] || ''
      const htmlFile = subpath === '' ? 'index.html' : subpath + '.html'
      const file = path.join(staticDir, htmlFile)
      const fallback = existsSync(path.join(staticDir, '404.html'))
        ? path.join(staticDir, '404.html')
        : path.join(staticDir, 'index.html')
      res.sendFile(existsSync(file) ? file : fallback)
    } else {
      res.sendFile(path.join(staticDir, 'index.html'))
    }
  })
}

ensureDatabase()
  .then(() => ensureSchema())
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`)
    })
  })
  .catch((err: Error) => {
    console.error('Failed to ensure database:', err.message)
    process.exit(1)
  })
