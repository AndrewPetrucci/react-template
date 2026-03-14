'use client'
import { useEffect, useRef, useState } from 'react'
import './DocxViewer.css'

export interface DocxViewerProps {
  src: string
  className?: string
}

type DocxStatus = 'loading' | 'ok' | 'error'

export default function DocxViewer({ src, className = '' }: DocxViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<DocxStatus>('loading')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!containerRef.current || !src) return

    let cancelled = false

    async function renderDocx() {
      try {
        const res = await fetch(src)
        if (!res.ok) throw new Error(`Failed to load document (${res.status})`)
        const blob = await res.blob()

        if (cancelled) return

        const { renderAsync } = await import('docx-preview')
        await renderAsync(blob, containerRef.current!, undefined, {
          className: 'docx-preview-container',
        })

        if (!cancelled) setStatus('ok')
      } catch (err) {
        if (!cancelled) {
          setError((err as Error).message || 'Failed to render document')
          setStatus('error')
        }
      }
    }

    renderDocx()
    return () => {
      cancelled = true
    }
  }, [src])

  return (
    <div className={className}>
      {status === 'loading' && <p>Loading document…</p>}
      {status === 'error' && <p className="error">{error}</p>}
      <div
        ref={containerRef}
        className="docx-viewer"
        style={{
          minHeight: status === 'ok' ? 400 : 0,
        }}
      />
    </div>
  )
}
