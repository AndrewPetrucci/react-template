'use client'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { verifyEmail, clearError } from '@/lib/authSlice'

function VerifyEmailForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const dispatch = useDispatch()
  const router = useRouter()
  const { loading, error } = useSelector((state) => state.auth)

  const handleSubmit = async (e) => {
    e.preventDefault()
    dispatch(clearError())
    if (password !== confirm) return
    const result = await dispatch(verifyEmail({ token, newPassword: password }))
    if (!result.error) router.push('/')
  }

  if (!token) {
    return (
      <main>
        <p className="error">Missing verification token.</p>
        <Link href="/">Home</Link>
      </main>
    )
  }

  return (
    <main>
      <h2>Set your password</h2>
      <p>Choose a password to finish signing up.</p>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>
        <div>
          <label htmlFor="confirm">Confirm password</label>
          <input
            id="confirm"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
          {password && confirm && password !== confirm && (
            <span className="error">Passwords do not match</span>
          )}
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Setting password…' : 'Set password'}
        </button>
      </form>
      <p>
        <Link href="/">Home</Link>
      </p>
    </main>
  )
}

export default function VerifyEmail() {
  return (
    <Suspense fallback={<main><p>Loading…</p></main>}>
      <VerifyEmailForm />
    </Suspense>
  )
}
