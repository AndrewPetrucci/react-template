import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchItems } from '../store/appSlice'
import Table from '../components/Table'

const ITEMS_COLUMNS = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'created_at', label: 'Created' },
]

function formatDate(iso) {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    return Number.isNaN(d.getTime()) ? iso : d.toLocaleString()
  } catch {
    return iso
  }
}

export default function ComponentsDemo() {
  const dispatch = useDispatch()
  const { items, loading, error } = useSelector((state) => state.app)

  useEffect(() => {
    dispatch(fetchItems())
  }, [dispatch])

  const tableData = (items || []).map((item) => ({
    ...item,
    created_at: formatDate(item.created_at),
  }))

  return (
    <main>
      <h2>UI components</h2>
      <p>
        <Link to="/">← Home</Link>
      </p>

      <section className="demo-section">
        <h3>Table</h3>
        <p>Items from the API rendered in a table.</p>
        {loading && <p>Loading…</p>}
        {error && <p className="error">{error}</p>}
        {!loading && !error && (
          <Table
            columns={ITEMS_COLUMNS}
            data={tableData}
            keyField="id"
            emptyMessage="No items yet. Add some in the database."
          />
        )}
      </section>
    </main>
  )
}
