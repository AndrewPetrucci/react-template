'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useDispatch, useSelector } from 'react-redux'
import { forgotPassword, clearError } from '@/lib/authSlice'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const dispatch = useDispatch()
  const { loading, error } = useSelector((state) => state.auth)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    dispatch(clearError())
    const result = await dispatch(forgotPassword(email))
    if (!result.error) setSent(true)
  }

  if (sent) {
    return (
      <main>
        <p>If that email is registered, you will receive a reset link.</p>
        <Link href="/login">Back to login</Link>
      </main>
    )
  }

  return (
    <main>
      <h2>Forgot password</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Sending…' : 'Send reset link'}
        </button>
      </form>
      <p>
        <Link href="/login">Back to login</Link>
      </p>
    </main>
  )
}
