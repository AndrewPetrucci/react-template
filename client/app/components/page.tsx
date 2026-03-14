'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { useDispatch, useSelector } from 'react-redux'
import { fetchItems } from '@/lib/appSlice'
import { RootState, type AppDispatch } from '@/lib/store'
import type { AppItem } from '@/lib/appSlice'
import type { TableColumn } from '@/components/Table'
import type { ButtonListItem } from '@/components/ButtonList'
import Table from '@/components/Table'
import MarkdownContent from '@/components/MarkdownContent'
import DocxViewer from '@/components/DocxViewer'
import ButtonList from '@/components/ButtonList'

const ITEMS_COLUMNS: TableColumn[] = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'created_at', label: 'Created' },
]

function formatDate(iso: string | undefined): string {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    return Number.isNaN(d.getTime()) ? iso : d.toLocaleString()
  } catch {
    return iso
  }
}

export default function ComponentsDemo() {
  const dispatch = useDispatch<AppDispatch>()
  const { items, loading, error } = useSelector((state: RootState) => state.app)

  useEffect(() => {
    dispatch(fetchItems())
  }, [dispatch])

  const tableData = (items || []).map((item: AppItem) => ({
    ...item,
    created_at: formatDate(item.created_at as string),
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
        <h3>Button list</h3>
        <p>Renders one button per item in an array.</p>
        <ButtonList
          items={[
            { display: 'First', value: 'first', backgroundColor: '#2563eb', color: '#fff' },
            { display: 'Second', value: 'second', backgroundColor: '#059669', color: '#fff' },
            { display: 'Third', value: 'third', backgroundColor: '#d97706', color: '#fff' },
            { display: 'Fourth', value: 'fourth', backgroundColor: '#dc2626', color: '#fff' },
          ] as ButtonListItem[]}
          onSelect={(item, index) =>
            window.alert(
              `Clicked: ${(item as ButtonListItem).display} (value: ${(item as ButtonListItem).value})`
            )
          }
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
