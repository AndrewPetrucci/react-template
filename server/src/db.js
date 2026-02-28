import pg from 'pg'
import { createTableSql, seedRows } from './schema/items/index.js'

const { Pool } = pg

function getConnectionString(connectToDatabase = undefined) {
  const db = connectToDatabase ?? process.env.PG_DATABASE ?? 'postgres'
  if (process.env.DATABASE_URL) {
    try {
      const url = new URL(process.env.DATABASE_URL)
      url.pathname = '/' + (db || 'postgres')
      return url.toString()
    } catch (_) {
      return process.env.DATABASE_URL
    }
  }
  const user = process.env.PG_USER ?? 'postgres'
  const password = process.env.PG_PASSWORD ?? ''
  const host = process.env.PG_HOST ?? 'localhost'
  const port = process.env.PG_PORT ?? '5432'
  const encoded = encodeURIComponent(password)
  return `postgresql://${user}:${encoded}@${host}:${port}/${db}`
}

/** Create the app database if it doesn't exist (connects to 'postgres' to run CREATE DATABASE). */
export async function ensureDatabase() {
  let targetDb = process.env.PG_DATABASE ?? 'react_template'
  if (process.env.DATABASE_URL) {
    try {
      const url = new URL(process.env.DATABASE_URL)
      const dbFromUrl = (url.pathname.slice(1).split('/')[0] || '').trim() || 'postgres'
      if (dbFromUrl === 'postgres') return
      targetDb = dbFromUrl
    } catch (_) {}
  }
  const client = new pg.Client({
    connectionString: getConnectionString('postgres'),
    ...(process.env.NODE_ENV === 'production' && { ssl: { rejectUnauthorized: false } }),
  })
  try {
    await client.connect()
    const { rows } = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [targetDb]
    )
    if (rows.length === 0) {
      await client.query(`CREATE DATABASE "${targetDb.replace(/"/g, '""')}"`)
      console.log(`Created database: ${targetDb}`)
    }
  } finally {
    await client.end()
  }
}

/** Create the items table (and seed once) if it doesn't exist. */
export async function ensureSchema() {
  await pool.query(createTableSql)
  const { rows } = await pool.query('SELECT 1 FROM items LIMIT 1')
  if (rows.length === 0) {
    for (const [name] of seedRows) {
      await pool.query('INSERT INTO items (name) VALUES ($1)', [name])
    }
    console.log('Seeded items table')
  }
}

export const pool = new Pool({
  connectionString: getConnectionString(),
  ...(process.env.NODE_ENV === 'production' && { ssl: { rejectUnauthorized: false } }),
})

pool.on('error', (err) => {
  console.error('Unexpected pool error', err)
})
