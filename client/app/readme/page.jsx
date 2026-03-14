import path from 'path'
import fs from 'fs'
import Link from 'next/link'
import MarkdownContent from '@/components/MarkdownContent'

function getReadmeContent() {
  try {
    const readmePath = path.join(process.cwd(), '..', 'README.md')
    return fs.readFileSync(readmePath, 'utf8')
  } catch {
    return '# README\n\nThe README.md file could not be loaded.'
  }
}

export default function ReadmePage() {
  const readme = getReadmeContent()

  return (
    <main>
      <MarkdownContent content={readme} />
    </main>
  )
}
