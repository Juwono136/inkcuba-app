import { configureStore } from '@reduxjs/toolkit'
import projectReducer from '../features/projects/projectSlice'

export const store = configureStore({
  reducer: {
    projects: projectReducer,
  },
  // Redux Toolkit includes thunk middleware by default
  // No need to add it manually
})

