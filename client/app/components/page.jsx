'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { useDispatch, useSelector } from 'react-redux'
import { fetchItems } from '@/lib/appSlice'
import Table from '@/components/Table'
import MarkdownContent from '@/components/MarkdownContent'
import DocxViewer from '@/components/DocxViewer'

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

      <section className="demo-section">
        <h3>Markdown</h3>
        <p>Renders markdown with headings, lists, code, and links.</p>
        <MarkdownContent
          content={`## Sample markdown

**Bold** and *italic* text.

- List item one
- List item two

\`inline code\` and a [link to home](/).

\`\`\`js
const greeting = "Hello, world!"
\`\`\`
`}
        />
      </section>

      <section className="demo-section">
        <h3>Document viewer</h3>
        <p>Renders a .docx file (hw.docx) with docx-preview.</p>
        <DocxViewer src="/hw.docx" />
      </section>
    </main>
  )
}
