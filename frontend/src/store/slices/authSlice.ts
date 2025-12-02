import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface User {
  _id: string
  name: string
  username: string
  email: string
  role: 'admin' | 'faculty' | 'student' | 'user'
  status: 'active' | 'inactive'
}

interface AuthState {
  accessToken: string | null
  user: User | null
}

const initialState: AuthState = { accessToken: null, user: null }

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ accessToken: string; user: User }>) {
      state.accessToken = action.payload.accessToken
      state.user = action.payload.user
    },
    clearCredentials(state) {
      state.accessToken = null
      state.user = null
    }
  }
})

export const { setCredentials, clearCredentials } = authSlice.actions
export default authSlice.reducer
