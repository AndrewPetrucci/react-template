import ReduxProvider from '@/components/ReduxProvider'
import Header from '@/components/Header'
import './globals.css'

export const metadata = {
  title: 'React Redux PostgreSQL',
  description: 'Full-stack template with React, Redux, Express, PostgreSQL',
}

export default function RootLayout({ children }) {
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
