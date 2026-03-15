import './Table.css'

export interface TableColumn {
  key: string
  label: string
}

export interface TableProps<T = Record<string, unknown>> {
  columns: TableColumn[]
  data: T[]
  keyField?: string
  emptyMessage?: string
}

/**
 * Reusable table component.
 */
export default function Table<T extends Record<string, unknown>>({
  columns,
  data,
  keyField = 'id',
  emptyMessage = 'No data',
}: TableProps<T>) {
  if (!data?.length) {
    return <p className="table-empty">{emptyMessage}</p>
  }
  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={(row[keyField] ?? row.id ?? i) as string}>
              {columns.map((col) => (
                <td key={col.key}>{(row[col.key] ?? '—') as React.ReactNode}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
