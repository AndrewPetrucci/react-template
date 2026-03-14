import type { Metadata } from 'next'
import ReduxProvider from '@/components/ReduxProvider'
import Header from '@/components/Header'
import './globals.css'

export const metadata: Metadata = {
  title: 'React Redux PostgreSQL',
  description: 'Full-stack template with React, Redux, Express, PostgreSQL',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>
          <div className="app">
            <Header />
            {children}
          </div>
        </ReduxProvider>
      </body>
    </html>
  )
}
