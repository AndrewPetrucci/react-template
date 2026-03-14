import Link from 'next/link'

export default function CheckEmail() {
  return (
    <main>
      <h2>Check your email</h2>
      <p>
        We sent you a link to verify your email and set your password. Click the link in the email
        to continue.
      </p>
      <p>
        <Link href="/login">Back to log in</Link>
      </p>
    </main>
  )
}
