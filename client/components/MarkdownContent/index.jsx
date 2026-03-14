'use client'
import ReactMarkdown from 'react-markdown'
import './MarkdownContent.css'

export default function MarkdownContent({ content }) {
  return (
    <article className="readme-content">
      <ReactMarkdown
        components={{
          a: ({ href, children }) => (
            <a
              href={href}
              target={href?.startsWith('http') ? '_blank' : undefined}
              rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  )
}
