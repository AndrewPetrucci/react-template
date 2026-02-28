/**
 * Reusable table component.
 * @param {Object} props
 * @param {Array<{ key: string, label: string }>} props.columns - Column definitions (key = row field, label = header text)
 * @param {Array<Object>} props.data - Array of row objects
 * @param {string} [props.keyField='id'] - Field to use as React key for each row
 * @param {string} [props.emptyMessage='No data'] - Message when data is empty
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
