'use client'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { resetPassword, clearError } from '@/lib/authSlice'
import { RootState } from '@/lib/store'
import type { AppDispatch } from '@/lib/store'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams?.get('token') ?? null
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const dispatch = useDispatch<AppDispatch>()
  const { loading, error } = useSelector((state: RootState) => state.auth)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (password !== confirm || !token) return
    dispatch(clearError())
    const result = await dispatch(resetPassword({ token, newPassword: password }))
    if ((result as { error?: unknown }).error == null) setDone(true)
  }

  if (!token) {
    return (
      <main>
        <p className="error">Missing reset token.</p>
        <Link href="/forgot-password">Request a new link</Link>
      </main>
    )
  }
  if (done) {
    return (
      <main>
        <p>Password has been reset.</p>
        <Link href="/login">Log in</Link>
      </main>
    )
  }

  return (
    <main>
      <h2>Reset password</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="password">New password</label>
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
        <button type="submit" disabled={loading || password !== confirm}>
          {loading ? 'Resetting…' : 'Reset password'}
        </button>
      </form>
      <p>
        <Link href="/login">Back to login</Link>
      </p>
    </main>
  )
}

export default function ResetPassword() {
  return (
    <Suspense fallback={<main><p>Loading…</p></main>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
