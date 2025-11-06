import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
// projectService is imported but not used in initial render - this is fine
import projectService from './projectService'

const initialState = {
  projects: [],
  categories: [],
  loading: false,
  error: null,
  totalProjects: 0,
  currentPage: 1,
  filters: {
    batch: 'all',
    program: 'all',
    course: 'all',
    search: '',
    sortBy: 'top-recommended',
  },
}

export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async (params, { rejectWithValue }) => {
    try {
      const response = await projectService.getProjects(params)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const fetchCategories = createAsyncThunk(
  'projects/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await projectService.getCategories()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    resetFilters: (state) => {
      state.filters = initialState.filters
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Projects
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false
        state.projects = action.payload.projects || []
        state.totalProjects = action.payload.total || 0
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch Categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false
        state.categories = action.payload.categories || []
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { setFilters, resetFilters, setCurrentPage } = projectSlice.actions
export default projectSlice.reducer

