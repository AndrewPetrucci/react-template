'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMe, logout } from '@/lib/authSlice'
import ButtonList from '@/components/ButtonList'
import './Header.css'

const THEME_KEY = 'app-theme'
const THEME_OPTIONS = [
  { display: 'Light', value: 'light', backgroundColor: '#f5f5f5', color: '#1a1a1a' },
  { display: 'Dark', value: 'dark', backgroundColor: '#1a1a1a', color: '#e5e5e5' },
]

export default function Header() {
  const dispatch = useDispatch()
  const { user, meChecked } = useSelector((state) => state.auth)
  const meFetchedRef = useRef(false)
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    if (meFetchedRef.current) return
    meFetchedRef.current = true
    dispatch(fetchMe())
  }, [dispatch])

  useEffect(() => {
    const stored = typeof document !== 'undefined' && localStorage.getItem(THEME_KEY)
    if (stored && ['light', 'dark'].includes(stored)) {
      setTheme(stored)
      document.body.dataset.theme = stored
    }
  }, [])

  const handleLogout = () => dispatch(logout())

  const handleThemeSelect = (item) => {
    const value = item.value
    setTheme(value)
    document.body.dataset.theme = value
    if (typeof localStorage !== 'undefined') localStorage.setItem(THEME_KEY, value)
  }

  return (
    <header className="header-nav">
      <h1>
        <Link href="/">React Redux PostgreSQL</Link>
      </h1>
      <nav className="nav-links">
        <Link href="/readme">Readme</Link>
        <Link href="/docx">Document</Link>
        <Link href="/components">Components</Link>
      </nav>
      <nav className="nav-auth" aria-label="Account">
        <div className="nav-auth-links">
          {!meChecked ? (
            <>
              <Link href="/login">Log in</Link>
              <Link href="/signup">Sign up</Link>
            </>
          ) : user ? (
            <>
              <span>{user.email}</span>
              {user.email_verified_at ? null : <span className="muted"> (unverified)</span>}
              <button type="button" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login">Log in</Link>
              <Link href="/signup">Sign up</Link>
            </>
          )}
        </div>
        <div className="nav-auth-theme">
          <ButtonList
            items={THEME_OPTIONS}
            onSelect={handleThemeSelect}
            className="header-theme-list"
          />
        </div>
      </nav>
    </header>
  )
}
