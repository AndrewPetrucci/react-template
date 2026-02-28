import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams, Link } from 'react-router-dom'
import { resetPassword, clearError } from '../store/authSlice'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const dispatch = useDispatch()
  const { loading, error } = useSelector((state) => state.auth)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirm || !token) return
    dispatch(clearError())
    const result = await dispatch(resetPassword({ token, newPassword: password }))
    if (!result.error) setDone(true)
  }

  if (!token) {
    return (
      <main>
        <p className="error">Missing reset token.</p>
        <Link to="/forgot-password">Request a new link</Link>
      </main>
    )
  }
  if (done) {
    return (
      <main>
        <p>Password has been reset.</p>
        <Link to="/login">Log in</Link>
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
        <Link to="/login">Back to login</Link>
      </p>
    </main>
  )
}
