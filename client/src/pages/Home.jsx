import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchItems } from '../store/appSlice'

export default function Home() {
  const dispatch = useDispatch()
  const { items, loading, error } = useSelector((state) => state.app)

  useEffect(() => {
    dispatch(fetchItems())
  }, [dispatch])

  return (
    <main>
      <h2>Items</h2>
      {loading && <p>Loading…</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && (
        <ul>
          {items.length === 0 ? (
            <li>No items yet. Add some in the database.</li>
          ) : (
            items.map((item) => (
              <li key={item.id}>{item.name || item.title}</li>
            ))
          )}
        </ul>
      )}
    </main>
  )
}
