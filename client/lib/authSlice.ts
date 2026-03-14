'use client'
import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import { api } from './api'

const tokenKey = 'token'

export interface AuthUser {
  email: string
  email_verified_at?: string | null
  [key: string]: unknown
}

export const signup = createAsyncThunk(
  'auth/signup',
  async ({ email }: { email: string }, { rejectWithValue }) => {
    await api('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
    return null
  }
)

export const login = createAsyncThunk(
  'auth/login',
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    const data = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    if (data.token && typeof window !== 'undefined')
      localStorage.setItem(tokenKey, data.token as string)
    return data.user as AuthUser
  }
)

export const logout = createAsyncThunk('auth/logout', async () => {
  if (typeof window !== 'undefined') localStorage.removeItem(tokenKey)
})

export const fetchMe = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  if (typeof window === 'undefined' || !localStorage.getItem(tokenKey)) return null
  const data = await api('/auth/me')
  return data.user as AuthUser | null
})

export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async (
    { token, newPassword }: { token: string; newPassword: string },
    { rejectWithValue }
  ) => {
    const data = await api('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    })
    if (data.token && typeof window !== 'undefined')
      localStorage.setItem(tokenKey, data.token as string)
    return data.user as AuthUser
  }
)

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email: string, { rejectWithValue }) => {
    await api('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  }
)

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (
    { token, newPassword }: { token: string; newPassword: string },
    { rejectWithValue }
  ) => {
    await api('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    })
  }
)

interface AuthState {
  user: AuthUser | null
  loading: boolean
  error: string | null
  meChecked: boolean
}

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    loading: false,
    error: null,
    meChecked: false,
  } as AuthState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    const setLoading = (state: AuthState) => {
      state.loading = true
      state.error = null
    }
    const setUser = (state: AuthState, action: PayloadAction<AuthUser | null>) => {
      state.loading = false
      state.user = action.payload
      state.error = null
    }
    const setError = (state: AuthState, action: { payload?: unknown; error?: { message?: string } }) => {
      state.loading = false
      state.error = (action.payload as string) || action.error?.message || 'Request failed'
    }

    builder
      .addCase(signup.pending, setLoading)
      .addCase(signup.fulfilled, (state) => {
        state.loading = false
        state.error = null
      })
      .addCase(signup.rejected, setError)
      .addCase(login.pending, setLoading)
      .addCase(login.fulfilled, setUser)
      .addCase(login.rejected, setError)
      .addCase(logout.fulfilled, (state) => {
        state.user = null
      })
      .addCase(fetchMe.pending, (state) => {
        state.meChecked = false
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload
        state.meChecked = true
      })
      .addCase(fetchMe.rejected, (state) => {
        state.user = null
        state.meChecked = true
      })
      .addCase(verifyEmail.pending, setLoading)
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload ?? state.user
        state.error = null
      })
      .addCase(verifyEmail.rejected, setError)
      .addCase(forgotPassword.pending, setLoading)
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false
        state.error = null
      })
      .addCase(forgotPassword.rejected, setError)
      .addCase(resetPassword.pending, setLoading)
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false
        state.error = null
      })
      .addCase(resetPassword.rejected, setError)
  },
})

export const { clearError } = authSlice.actions
export default authSlice.reducer
