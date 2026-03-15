import pg from 'pg'
import * as itemsSchema from './schema/items/index.js'
import * as usersSchema from './schema/users/index.js'

const { Pool, Client } = pg

interface TableSchema {
  createTableSql: string
  tableName: string
  seedColumns: string[] | null
  seedRows: unknown[][]
}

const tableSchemas: TableSchema[] = [
  {
    createTableSql: itemsSchema.createTableSql,
    tableName: itemsSchema.tableName,
    seedColumns: ['name'],
    seedRows: itemsSchema.seedRows,
  },
  {
    createTableSql: usersSchema.createTableSql,
    tableName: usersSchema.tableName,
    seedColumns: null,
    seedRows: usersSchema.seedRows ?? [],
  },
]

function getConnectionString(connectToDatabase?: string): string {
  if (process.env.DATABASE_URL) {
    try {
      const url = new URL(process.env.DATABASE_URL)
      if (connectToDatabase !== undefined) {
        url.pathname = '/' + (connectToDatabase || 'postgres')
      }
      return url.toString()
    } catch {
      return process.env.DATABASE_URL
    }
  }
  const db = connectToDatabase ?? process.env.PG_DATABASE ?? 'postgres'
  const user = process.env.PG_USER ?? 'postgres'
  const password = process.env.PG_PASSWORD ?? ''
  const host = process.env.PG_HOST ?? 'localhost'
  const port = process.env.PG_PORT ?? '5432'
  const encoded = encodeURIComponent(password)
  return `postgresql://${user}:${encoded}@${host}:${port}/${db}`
}

/** Create the app database if it doesn't exist. */
export async function ensureDatabase(): Promise<void> {
  let targetDb = process.env.PG_DATABASE ?? 'react_template'
  if (process.env.DATABASE_URL) {
    try {
      const url = new URL(process.env.DATABASE_URL)
      const dbFromUrl = (url.pathname.slice(1).split('/')[0] || '').trim() || 'postgres'
      if (dbFromUrl === 'postgres') return
      targetDb = dbFromUrl
    } catch {
      /* ignore */
    }
  }
  const client = new Client({
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

/** Create tables (and seed once) from registered schemas. */
export async function ensureSchema(): Promise<void> {
  for (const { createTableSql, tableName, seedColumns, seedRows } of tableSchemas) {
    await pool.query(createTableSql)
    if (tableName === usersSchema.tableName) {
      try {
        await pool.query('ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL')
      } catch {
        /* column already nullable or table new */
      }
    }
    if (seedColumns?.length && seedRows?.length) {
      const { rows } = await pool.query(`SELECT 1 FROM ${tableName} LIMIT 1`)
      if (rows.length === 0) {
        for (const row of seedRows) {
          const placeholders = row.map((_, i) => `$${i + 1}`).join(', ')
          await pool.query(
            `INSERT INTO ${tableName} (${seedColumns.join(', ')}) VALUES (${placeholders})`,
            row
          )
        }
        console.log(`Seeded ${tableName} table`)
      }
    }
  }
}

export const pool = new Pool({
  connectionString: getConnectionString(),
  ...(process.env.NODE_ENV === 'production' && { ssl: { rejectUnauthorized: false } }),
})

pool.on('error', (err: Error) => {
  console.error('Unexpected pool error', err)
})
