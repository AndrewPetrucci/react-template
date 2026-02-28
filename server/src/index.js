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

// Avoid 404 + strict CSP for Chrome DevTools (prevents console CSP violation)
app.get('/.well-known/appspecific/com.chrome.devtools.json', (_, res) => {
  res.status(200).json({})
})

app.use('/api/items', itemsRouter)
app.use('/api/auth', authRouter)

app.get('/api/health', (_, res) => {
  res.json({ status: 'ok' })
})

// Serve the built React app from client/dist when it exists (e.g. after npm run build)
const clientDist = path.join(__dirname, '../../client/dist')
if (existsSync(clientDist)) {
  app.use(express.static(clientDist))
  app.get('*', (_, res) => {
    res.sendFile(path.join(clientDist, 'index.html'))
  })
}

ensureDatabase()
  .then(() => ensureSchema())
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`)
    })
  })
  .catch((err) => {
    console.error('Failed to ensure database:', err.message)
    process.exit(1)
  })
