/**
 * Reusable table component.
 */
export default function Table({ columns, data, keyField = 'id', emptyMessage = 'No data' }) {
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
          {data.map((row) => (
            <tr key={row[keyField] ?? row.id}>
              {columns.map((col) => (
                <td key={col.key}>{row[col.key] ?? '—'}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
