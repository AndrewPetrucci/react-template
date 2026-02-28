import {
  generateCreateTableSql,
  getPrimaryKey,
  getForeignKeys,
  getUniqueConstraints,
} from '../helpers.js'

/** Table name. */
export const tableName = 'items'

/** Map of column name → column metadata. */
export const columns = {
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

/** Primary key column(s), derived from columns. */
export const primaryKey = getPrimaryKey(columns)

/** Foreign keys, derived from columns (add references to column metadata to use). */
export const foreignKeys = getForeignKeys(columns)

/** Unique constraints, derived from columns (add isUnique or uniqueGroup to column metadata to use). */
export const uniqueConstraints = getUniqueConstraints(columns)

/** Items table DDL – used for create-if-not-exists at startup. */
export const createTableSql = generateCreateTableSql(tableName, columns)

/** Seed rows inserted when the table is empty. */
export const seedRows = [
  ['First item'],
  ['Second item'],
]
