'use client'
import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMe, logout } from '@/lib/authSlice'

export default function Header() {
  const dispatch = useDispatch()
  const { user, meChecked } = useSelector((state) => state.auth)
  const meFetchedRef = useRef(false)

  useEffect(() => {
    if (meFetchedRef.current) return
    meFetchedRef.current = true
    dispatch(fetchMe())
  }, [dispatch])

  const handleLogout = () => dispatch(logout())

  return (
    <header>
      <h1>
        <Link href="/">React Redux PostgreSQL</Link>
      </h1>
      <nav>
        {meChecked &&
          (user ? (
            <>
              <span>{user.email}</span>
              {user.email_verified_at ? null : <span className="muted"> (unverified)</span>}
              <Link href="/components">Components</Link>
              <button type="button" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login">Log in</Link>
              <Link href="/signup">Sign up</Link>
              <Link href="/components">Components</Link>
            </>
          ))}
      </nav>
    </header>
  )
}
