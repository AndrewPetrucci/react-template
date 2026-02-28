import { Router } from 'express'
import { pool } from '../../db.js'
import { generateSelectAllSql, generateInsertSql, getInsertableColumnNames } from '../../schema/helpers.js'
import { tableName, columns } from '../../schema/items/index.js'

const router = Router()

const selectAllSql = generateSelectAllSql(tableName, columns)
const insertSql = generateInsertSql(tableName, columns)
const insertableColumns = getInsertableColumnNames(columns)

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(selectAllSql)
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch items' })
  }
})

router.post('/', async (req, res) => {
  const params = insertableColumns.map((col) => req.body[col]?.trim?.() ?? req.body[col])
  const missing = insertableColumns.filter((col, i) => params[i] === undefined || params[i] === '')
  if (missing.length > 0) {
    return res.status(400).json({ error: `${missing.join(', ')} is required` })
  }
  try {
    const { rows } = await pool.query(insertSql, params)
    res.status(201).json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create item' })
  }
})

export default router
