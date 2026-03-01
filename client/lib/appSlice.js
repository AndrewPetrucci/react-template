'use client'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from './api'

export const fetchItems = createAsyncThunk(
  'app/fetchItems',
  async (_, { rejectWithValue }) => {
    try {
      const data = await api('/items')
      return data
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

const appSlice = createSlice({
  name: 'app',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
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
        state.items = Array.isArray(action.payload) ? action.payload : []
      })
      .addCase(fetchItems.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearError } = appSlice.actions
export default appSlice.reducer
