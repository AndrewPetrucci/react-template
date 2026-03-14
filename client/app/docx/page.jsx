'use client'
import Link from 'next/link'
import DocxViewer from '@/components/DocxViewer'

const DOCX_URL = '/Resume.docx'

export default function DocxPage() {
  return (
    <main>
      <h2>Document</h2>
      <p className="muted" style={{ marginBottom: '1rem' }}>
        Place .docx files in <code>client/public/</code> to serve them at <code>/filename.docx</code>.
      </p>
      <DocxViewer src={DOCX_URL} />
    </main>
  )
}
