'use client'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from './api'

export interface AppItem {
  id?: number
  name?: string
  created_at?: string
  [key: string]: unknown
}

export const fetchItems = createAsyncThunk(
  'app/fetchItems',
  async (_, { rejectWithValue }) => {
    try {
      const data = await api('/items')
      return data as AppItem[] | { items?: AppItem[] }
    } catch (err) {
      return rejectWithValue((err as Error).message)
    }
  }
)

interface AppState {
  items: AppItem[]
  loading: boolean
  error: string | null
}

const appSlice = createSlice({
  name: 'app',
  initialState: {
    items: [],
    loading: false,
    error: null,
  } as AppState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchItems.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchItems.fulfilled, (state, action) => {
        state.loading = false
        const payload = action.payload as AppItem[] | { items?: AppItem[] } | undefined
        state.items = Array.isArray(payload) ? payload : (payload && 'items' in payload ? payload.items : []) ?? []
      })
      .addCase(fetchItems.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError } = appSlice.actions
export default appSlice.reducer
