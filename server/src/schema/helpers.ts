export interface ColumnMeta {
  name: string
  order?: number
  type?: string
  isNull?: boolean
  isPrimaryKey?: boolean
  isDefault?: boolean
  defaultExpr?: string
  isUnique?: boolean
  uniqueGroup?: string
  references?: { table: string; column?: string }
}

/**
 * Column names sorted by each column's order property (default 0).
 */
export function getOrderedColumnNames(columns: Record<string, ColumnMeta>): string[] {
  return Object.entries(columns)
    .sort(([, a], [, b]) => (a.order ?? 0) - (b.order ?? 0))
    .map(([name]) => name)
}

/**
 * Primary key column(s) from columns where isPrimaryKey is true.
 */
export function getPrimaryKey(columns: Record<string, ColumnMeta>): string | string[] {
  const order = getOrderedColumnNames(columns)
  const names = Object.entries(columns)
    .filter(([, c]) => c.isPrimaryKey)
    .map(([name]) => name)
  names.sort((a, b) => order.indexOf(a) - order.indexOf(b))
  return names.length === 1 ? names[0]! : names
}

/**
 * Foreign keys from columns that have a references property.
 */
export function getForeignKeys(
  columns: Record<string, { references?: { table: string; column?: string } }>
): { column: string; references: { table: string; column?: string } }[] {
  return Object.entries(columns)
    .filter(([, c]) => c.references)
    .map(([column, { references }]) => ({ column, references: references! }))
}

/**
 * Unique constraints from columns: isUnique (single-column) or uniqueGroup (composite).
 */
export function getUniqueConstraints(
  columns: Record<string, ColumnMeta & { uniqueGroup?: string }>
): string[][] {
  const result: string[][] = []
  const byGroup: Record<string, string[]> = {}
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
 * Build CREATE TABLE IF NOT EXISTS from table name and columns map.
 */
export function generateCreateTableSql(
  tableName: string,
  columns: Record<string, ColumnMeta>
): string {
  const order = getOrderedColumnNames(columns)
  const defs = order
    .map((name) => {
      const col = columns[name]
      if (!col) return null
      const parts = [`${col.name} ${col.type}`]
      if (col.isNull === false) parts.push('NOT NULL')
      if (col.isPrimaryKey) parts.push('PRIMARY KEY')
      if (col.isUnique) parts.push('UNIQUE')
      if (col.isDefault && col.defaultExpr) parts.push(`DEFAULT ${col.defaultExpr}`)
      return parts.join(' ')
    })
    .filter(Boolean) as string[]
  return `CREATE TABLE IF NOT EXISTS ${tableName} (\n  ${defs.join(',\n  ')}\n)`
}

/**
 * Column names that are insertable (not SERIAL primary key, not server-only default).
 */
export function getInsertableColumnNames(columns: Record<string, ColumnMeta>): string[] {
  const order = getOrderedColumnNames(columns)
  return order.filter((name) => {
    const col = columns[name]
    if (!col) return false
    const isSerialPk =
      col.isPrimaryKey && (col.type === 'SERIAL' || col.type === 'BIGSERIAL')
    const isServerDefault = col.isDefault && col.defaultExpr
    return !isSerialPk && !isServerDefault
  })
}

/**
 * SELECT all columns FROM table, with optional ORDER BY.
 */
export function generateSelectAllSql(
  tableName: string,
  columns: Record<string, ColumnMeta>,
  orderBy?: string
): string {
  const names = getOrderedColumnNames(columns)
  const selectList = names.join(', ')
  if (orderBy) {
    return `SELECT ${selectList} FROM ${tableName} ORDER BY ${orderBy}`
  }
  const pk = getPrimaryKey(columns)
  const orderCol =
    names.find((n) => columns[n]?.defaultExpr === 'NOW()') ??
    (Array.isArray(pk) ? pk[0] : pk)
  const dir = columns[orderCol!]?.defaultExpr === 'NOW()' ? 'DESC' : 'DESC'
  return `SELECT ${selectList} FROM ${tableName} ORDER BY ${orderCol} ${dir}`
}

/**
 * INSERT INTO table (insertable columns) VALUES ($1, $2, ...) RETURNING all columns.
 */
export function generateInsertSql(
  tableName: string,
  columns: Record<string, ColumnMeta>
): string {
  const insertable = getInsertableColumnNames(columns)
  const returning = getOrderedColumnNames(columns).join(', ')
  const placeholders = insertable.map((_, i) => `$${i + 1}`).join(', ')
  const insertList = insertable.join(', ')
  return `INSERT INTO ${tableName} (${insertList}) VALUES (${placeholders}) RETURNING ${returning}`
}
