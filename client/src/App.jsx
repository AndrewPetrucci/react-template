import { useEffect, useRef } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMe, logout } from './store/authSlice'
import Home from './pages/Home'
import Signup from './pages/Signup'
import Login from './pages/Login'
import CheckEmail from './pages/CheckEmail'
import VerifyEmail from './pages/VerifyEmail'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'

export default function App() {
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
    <div className="app">
      <header>
        <h1>
          <Link to="/">React Redux PostgreSQL</Link>
        </h1>
        <nav>
          {meChecked && (
            user ? (
              <>
                <span>{user.email}</span>
                {user.email_verified_at ? null : (
                  <span className="muted"> (unverified)</span>
                )}
                <button type="button" onClick={handleLogout}>
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login">Log in</Link>
                <Link to="/signup">Sign up</Link>
              </>
            )
          )}
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/check-email" element={<CheckEmail />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </div>
  )
}
