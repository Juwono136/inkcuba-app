import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../../utils/axios';

const getErrorMessage = (err) =>
  err.response?.data?.message || err.message || 'Something went wrong';

export const fetchUsers = createAsyncThunk(
  'adminUsers/fetchUsers',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/api/admin/users', { params });
      return data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const createUser = createAsyncThunk(
  'adminUsers/createUser',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/api/admin/users', payload);
      return data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const updateUser = createAsyncThunk(
  'adminUsers/updateUser',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/api/admin/users/${id}`, payload);
      return data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const deleteUser = createAsyncThunk(
  'adminUsers/deleteUser',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/admin/users/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

const initialState = {
  items: [],
  page: 1,
  limit: 10,
  total: 0,
  sortBy: 'createdAt',
  sortOrder: 'desc',
  search: '',
  role: 'all',
  status: 'all',
  loading: false,
  error: null,
};

const adminUsersSlice = createSlice({
  name: 'adminUsers',
  initialState,
  reducers: {
    setQuery(state, { payload }) {
      state.page = payload.page ?? state.page;
      state.limit = payload.limit ?? state.limit;
      state.search = payload.search ?? state.search;
      state.role = payload.role ?? state.role;
      state.status = payload.status ?? state.status;
      state.sortBy = payload.sortBy ?? state.sortBy;
      state.sortOrder = payload.sortOrder ?? state.sortOrder;
    },
    resetState() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.items = payload.data ?? [];
        state.total = payload.meta?.total ?? 0;
        state.page = payload.meta?.page ?? state.page;
        state.limit = payload.meta?.limit ?? state.limit;
        state.sortBy = payload.meta?.sortBy ?? state.sortBy;
        state.sortOrder = payload.meta?.sortOrder ?? state.sortOrder;
      })
      .addCase(fetchUsers.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload ?? 'Failed to fetch users';
      })
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createUser.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload ?? 'Failed to create user';
      })
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateUser.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload ?? 'Failed to update user';
      })
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteUser.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload ?? 'Failed to delete user';
      });
  },
});

export const { setQuery, resetState } = adminUsersSlice.actions;
export default adminUsersSlice.reducer;

