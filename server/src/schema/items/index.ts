import {
  generateCreateTableSql,
  getPrimaryKey,
  getForeignKeys,
  getUniqueConstraints,
} from '../helpers.js'
import type { ColumnMeta } from '../helpers.js'

/** Table name. */
export const tableName = 'items'

/** Map of column name → column metadata. */
export const columns: Record<string, ColumnMeta> = {
  id: {
    name: 'id',
    order: 0,
    type: 'SERIAL',
    isNull: false,
    isPrimaryKey: true,
    isDefault: true,
  },
  name: {
    name: 'name',
    order: 1,
    type: 'VARCHAR(255)',
    isNull: false,
    isPrimaryKey: false,
    isDefault: false,
  },
  created_at: {
    name: 'created_at',
    order: 2,
    type: 'TIMESTAMPTZ',
    isNull: true,
    isPrimaryKey: false,
    isDefault: true,
    defaultExpr: 'NOW()',
  },
}

export const primaryKey = getPrimaryKey(columns)
export const foreignKeys = getForeignKeys(columns)
export const uniqueConstraints = getUniqueConstraints(columns)
export const createTableSql = generateCreateTableSql(tableName, columns)

/** Seed rows inserted when the table is empty. */
export const seedRows: unknown[][] = [['First item'], ['Second item']]
