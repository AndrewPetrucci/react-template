import Link from 'next/link'

export default function Home() {
  return (
    <main>
      <h2>Home</h2>
      <p>This is a template for a React app with a RESTful backend API and auth.</p>
      <h3>Demos</h3>
      <ul>
        <li>
          <Link href="/components">Components</Link>
        </li>
      </ul>
      <h3>Features</h3>
      <ul>
        <li>React</li>
        <li>Next.js</li>
        <li>Express</li>
        <li>PostgreSQL</li>
        <li>JWT</li>
      </ul>
    </main>
  )
}
