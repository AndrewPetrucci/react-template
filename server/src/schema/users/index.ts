import {
  generateCreateTableSql,
  getPrimaryKey,
  getForeignKeys,
  getUniqueConstraints,
} from '../helpers.js'
import type { ColumnMeta } from '../helpers.js'

/** Table name. */
export const tableName = 'users'

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
  email: {
    name: 'email',
    order: 1,
    type: 'VARCHAR(255)',
    isNull: false,
    isPrimaryKey: false,
    isDefault: false,
    isUnique: true,
  },
  password_hash: {
    name: 'password_hash',
    order: 2,
    type: 'VARCHAR(255)',
    isNull: true,
    isPrimaryKey: false,
    isDefault: false,
  },
  email_verified_at: {
    name: 'email_verified_at',
    order: 3,
    type: 'TIMESTAMPTZ',
    isNull: true,
    isPrimaryKey: false,
    isDefault: false,
  },
  created_at: {
    name: 'created_at',
    order: 4,
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
export const seedRows: unknown[][] = []
