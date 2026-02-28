/**
 * Column names sorted by each column's order property (default 0).
 * @param {Record<string, { order?: number }>} columns
 * @returns {string[]}
 */
export function getOrderedColumnNames(columns) {
  return Object.entries(columns)
    .sort(([, a], [, b]) => (a.order ?? 0) - (b.order ?? 0))
    .map(([name]) => name)
}

/**
 * Primary key column(s) from columns where isPrimaryKey is true.
 * Order follows each column's order property.
 * @param {Record<string, { name: string, order?: number, isPrimaryKey?: boolean }>} columns
 * @returns {string | string[]} Single column name or array for composite key.
 */
export function getPrimaryKey(columns) {
  const order = getOrderedColumnNames(columns)
  const names = Object.entries(columns)
    .filter(([, c]) => c.isPrimaryKey)
    .map(([name]) => name)
  names.sort((a, b) => order.indexOf(a) - order.indexOf(b))
  return names.length === 1 ? names[0] : names
}

/**
 * Foreign keys from columns that have a references property.
 * Column metadata: references: { table: string, column?: string } (column defaults to target primary key).
 * @param {Record<string, { references?: { table: string, column?: string } }>} columns
 * @returns {{ column: string, references: { table: string, column?: string } }[]}
 */
export function getForeignKeys(columns) {
  return Object.entries(columns)
    .filter(([, c]) => c.references)
    .map(([column, { references }]) => ({ column, references }))
}

/**
 * Unique constraints from columns: isUnique (single-column) or uniqueGroup (composite, same group = one constraint).
 * Column order follows each column's order property.
 * Column metadata: isUnique?: boolean, uniqueGroup?: string.
 * @param {Record<string, { name: string, order?: number, isUnique?: boolean, uniqueGroup?: string }>} columns
 * @returns {string[][]} e.g. [['email'], ['tenant_id', 'slug']]
 */
export function getUniqueConstraints(columns) {
  const result = []
  const byGroup = /** @type {Record<string, string[]>} */ ({})
  const order = getOrderedColumnNames(columns)

  for (const [name, col] of Object.entries(columns)) {
    if (col.isUnique) result.push([name])
    if (col.uniqueGroup) {
      (byGroup[col.uniqueGroup] ??= []).push(name)
    }
  }
  for (const names of Object.values(byGroup)) {
    if (names.length > 0) {
      names.sort((a, b) => order.indexOf(a) - order.indexOf(b))
      result.push(names)
    }
  }
  return result
}

/**
 * Build a CREATE TABLE IF NOT EXISTS statement from a table name and columns map.
 * Column order follows each column's order property.
 * @param {string} tableName - Table name (not quoted; use identifier-safe names).
 * @param {Record<string, { name: string, order?: number, type: string, isNull: boolean, isPrimaryKey: boolean, isDefault: boolean, defaultExpr?: string }>} columns - Map of column name → column metadata.
 * @returns {string} SQL string for CREATE TABLE IF NOT EXISTS.
 */
export function generateCreateTableSql(tableName, columns) {
  const order = getOrderedColumnNames(columns)
  const defs = order.map((name) => {
    const col = columns[name]
    if (!col) return null
    const parts = [`${col.name} ${col.type}`]
    if (col.isNull === false) parts.push('NOT NULL')
    if (col.isPrimaryKey) parts.push('PRIMARY KEY')
    if (col.isUnique) parts.push('UNIQUE')
    if (col.isDefault && col.defaultExpr) parts.push(`DEFAULT ${col.defaultExpr}`)
    return parts.join(' ')
  }).filter(Boolean)
  return `CREATE TABLE IF NOT EXISTS ${tableName} (\n  ${defs.join(',\n  ')}\n)`
}

/**
 * Column names that are insertable (not SERIAL primary key, not server-only default like NOW()).
 * @param {Record<string, { type?: string, isPrimaryKey?: boolean, isDefault?: boolean, defaultExpr?: string }>} columns
 * @returns {string[]}
 */
export function getInsertableColumnNames(columns) {
  const order = getOrderedColumnNames(columns)
  return order.filter((name) => {
    const col = columns[name]
    if (!col) return false
    const isSerialPk = col.isPrimaryKey && (col.type === 'SERIAL' || col.type === 'BIGSERIAL')
    const isServerDefault = col.isDefault && col.defaultExpr
    return !isSerialPk && !isServerDefault
  })
}

/**
 * SELECT all columns FROM table, with optional ORDER BY.
 * @param {string} tableName
 * @param {Record<string, { name: string, order?: number }>} columns
 * @param {string} [orderBy] - e.g. 'created_at DESC'. If omitted, uses first column with defaultExpr 'NOW()' DESC, else primary key DESC.
 * @returns {string} SQL string.
 */
export function generateSelectAllSql(tableName, columns, orderBy) {
  const names = getOrderedColumnNames(columns)
  const selectList = names.join(', ')
  if (orderBy) {
    return `SELECT ${selectList} FROM ${tableName} ORDER BY ${orderBy}`
  }
  const pk = getPrimaryKey(columns)
  const orderCol = names.find((n) => columns[n]?.defaultExpr === 'NOW()') ?? (Array.isArray(pk) ? pk[0] : pk)
  const dir = columns[orderCol]?.defaultExpr === 'NOW()' ? 'DESC' : 'DESC'
  return `SELECT ${selectList} FROM ${tableName} ORDER BY ${orderCol} ${dir}`
}

/**
 * INSERT INTO table (insertable columns) VALUES ($1, $2, ...) RETURNING all columns.
 * @param {string} tableName
 * @param {Record<string, { name: string, order?: number, type?: string, isPrimaryKey?: boolean, isDefault?: boolean, defaultExpr?: string }>} columns
 * @returns {string} SQL string. Use with params in same order as getInsertableColumnNames(columns).
 */
export function generateInsertSql(tableName, columns) {
  const insertable = getInsertableColumnNames(columns)
  const returning = getOrderedColumnNames(columns).join(', ')
  const placeholders = insertable.map((_, i) => `$${i + 1}`).join(', ')
  const insertList = insertable.join(', ')
  return `INSERT INTO ${tableName} (${insertList}) VALUES (${placeholders}) RETURNING ${returning}`
}
