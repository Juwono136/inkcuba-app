import { configureStore } from '@reduxjs/toolkit'
import projectReducer from '../features/projects/projectSlice'
import authReducer from '../features/auth/authSlice'

export const store = configureStore({
  reducer: {
    projects: projectReducer,
    auth: authReducer,
  },
  // Redux Toolkit includes thunk middleware by default
  // No need to add it manually
})

