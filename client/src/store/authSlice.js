import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '../api'

const tokenKey = 'token'

export const signup = createAsyncThunk(
  'auth/signup',
  async ({ email }, { rejectWithValue }) => {
    const data = await api('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
    // No token until user verifies email and sets password; return nothing so we don't set user
    return null
  }
)

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    const data = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    if (data.token) localStorage.setItem(tokenKey, data.token)
    return data.user
  }
)

export const logout = createAsyncThunk('auth/logout', async () => {
  localStorage.removeItem(tokenKey)
})

export const fetchMe = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  if (!localStorage.getItem(tokenKey)) return null
  const data = await api('/auth/me')
  return data.user
})

export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async ({ token, newPassword }, { rejectWithValue }) => {
    const data = await api('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    })
    if (data.token) localStorage.setItem(tokenKey, data.token)
    return data.user
  }
)

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    await api('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  }
)

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, newPassword }, { rejectWithValue }) => {
    await api('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    })
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    loading: false,
    error: null,
    meChecked: false,
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    const setLoading = (state) => {
      state.loading = true
      state.error = null
    }
    const setUser = (state, action) => {
      state.loading = false
      state.user = action.payload
      state.error = null
    }
    const setError = (state, action) => {
      state.loading = false
      state.error = action.payload || action.error?.message || 'Request failed'
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
