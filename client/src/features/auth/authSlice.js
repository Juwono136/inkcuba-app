import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  isAuthenticated: false,
  user: null,
  selectedRole: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setSelectedRole: (state, action) => {
      state.selectedRole = action.payload
    },
    login: (state, action) => {
      state.isAuthenticated = true
      state.user = action.payload
    },
    logout: (state) => {
      state.isAuthenticated = false
      state.user = null
      state.selectedRole = null
    },
  },
})

export const { setSelectedRole, login, logout } = authSlice.actions
export default authSlice.reducer

