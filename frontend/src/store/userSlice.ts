import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { User } from '../contexts/UserContext'

interface UserState {
  currentUser: User | null
}

const initialState: UserState = {
  currentUser: (() => {
    try {
      const stored = localStorage.getItem('currentUser')
      return stored ? JSON.parse(stored) : null
    } catch (error) {
      console.warn('Failed to parse stored user:', error)
      return null
    }
  })(),
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setCurrentUser(state, action: PayloadAction<User | null>) {
      state.currentUser = action.payload
      // Persist to localStorage
      if (action.payload) {
        localStorage.setItem('currentUser', JSON.stringify(action.payload))
      } else {
        localStorage.removeItem('currentUser')
      }
    },
    logout(state) {
      state.currentUser = null
      localStorage.removeItem('currentUser')
    },
  },
})

export const { setCurrentUser, logout } = userSlice.actions
export default userSlice.reducer