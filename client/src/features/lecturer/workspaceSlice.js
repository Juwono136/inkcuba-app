import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../../utils/axios';

const getErrorMessage = (err) =>
  err.response?.data?.message || err.message || 'Something went wrong';

export const fetchWorkspaces = createAsyncThunk(
  'lecturerWorkspaces/fetchWorkspaces',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/api/lecturer/workspaces', { params });
      return data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const createWorkspace = createAsyncThunk(
  'lecturerWorkspaces/createWorkspace',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/api/lecturer/workspaces', payload);
      return data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const fetchWorkspaceById = createAsyncThunk(
  'lecturerWorkspaces/fetchWorkspaceById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/api/lecturer/workspaces/${id}`);
      return data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const updateWorkspace = createAsyncThunk(
  'lecturerWorkspaces/updateWorkspace',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/api/lecturer/workspaces/${id}`, payload);
      return data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const deleteWorkspace = createAsyncThunk(
  'lecturerWorkspaces/deleteWorkspace',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/lecturer/workspaces/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const uploadStudentList = createAsyncThunk(
  'lecturerWorkspaces/uploadStudentList',
  async ({ workspaceId, formData }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(
        `/api/lecturer/workspaces/${workspaceId}/students/upload`,
        formData
      );
      return data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const addStudentsBatch = createAsyncThunk(
  'lecturerWorkspaces/addStudentsBatch',
  async ({ workspaceId, studentIds }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(
        `/api/lecturer/workspaces/${workspaceId}/students/batch`,
        { studentIds }
      );
      return data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const createCard = createAsyncThunk(
  'lecturerWorkspaces/createCard',
  async ({ workspaceId, payload }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(
        `/api/lecturer/workspaces/${workspaceId}/cards`,
        payload
      );
      return data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const updateCard = createAsyncThunk(
  'lecturerWorkspaces/updateCard',
  async ({ workspaceId, cardId, payload }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(
        `/api/lecturer/workspaces/${workspaceId}/cards/${cardId}`,
        payload
      );
      return data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const deleteCard = createAsyncThunk(
  'lecturerWorkspaces/deleteCard',
  async ({ workspaceId, cardId }, { rejectWithValue }) => {
    try {
      await api.delete(
        `/api/lecturer/workspaces/${workspaceId}/cards/${cardId}`
      );
      return cardId;
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
  status: 'all',
  loading: false,
  error: null,
  currentWorkspace: null,
  actionLoading: false,
};

const lecturerWorkspacesSlice = createSlice({
  name: 'lecturerWorkspaces',
  initialState,
  reducers: {
    setQuery(state, { payload }) {
      if (payload.page !== undefined) state.page = payload.page;
      if (payload.limit !== undefined) state.limit = payload.limit;
      if (payload.search !== undefined) state.search = payload.search;
      if (payload.status !== undefined) state.status = payload.status;
      if (payload.sortBy !== undefined) state.sortBy = payload.sortBy;
      if (payload.sortOrder !== undefined) state.sortOrder = payload.sortOrder;
    },
    setCurrentWorkspace(state, { payload }) {
      state.currentWorkspace = payload;
    },
    clearCurrentWorkspace(state) {
      state.currentWorkspace = null;
    },
    resetState() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkspaces.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWorkspaces.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.items = payload.data ?? [];
        state.total = payload.meta?.total ?? 0;
        state.page = payload.meta?.page ?? state.page;
        state.limit = payload.meta?.limit ?? state.limit;
        state.sortBy = payload.meta?.sortBy ?? state.sortBy;
        state.sortOrder = payload.meta?.sortOrder ?? state.sortOrder;
      })
      .addCase(fetchWorkspaces.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload ?? 'Failed to fetch workspaces';
      })
      .addCase(createWorkspace.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(createWorkspace.fulfilled, (state, { payload }) => {
        state.actionLoading = false;
        if (payload.workspace) {
          state.items = [payload.workspace, ...state.items];
          state.total += 1;
        }
      })
      .addCase(createWorkspace.rejected, (state, { payload }) => {
        state.actionLoading = false;
        state.error = payload ?? 'Failed to create workspace';
      })
      .addCase(fetchWorkspaceById.fulfilled, (state, { payload }) => {
        state.currentWorkspace = payload.workspace ?? null;
      })
      .addCase(fetchWorkspaceById.rejected, (state) => {
        state.currentWorkspace = null;
      })
      .addCase(updateWorkspace.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updateWorkspace.fulfilled, (state, { payload }) => {
        state.actionLoading = false;
        if (payload.workspace) {
          const idx = state.items.findIndex((w) => w.id === payload.workspace.id);
          if (idx !== -1) state.items[idx] = payload.workspace;
          if (state.currentWorkspace?.id === payload.workspace.id) {
            state.currentWorkspace = payload.workspace;
          }
        }
      })
      .addCase(updateWorkspace.rejected, (state, { payload }) => {
        state.actionLoading = false;
        state.error = payload ?? 'Failed to update workspace';
      })
      .addCase(deleteWorkspace.fulfilled, (state, { payload }) => {
        state.items = state.items.filter((w) => w.id !== payload);
        state.total = Math.max(0, state.total - 1);
        if (state.currentWorkspace?.id === payload) {
          state.currentWorkspace = null;
        }
      })
      .addCase(uploadStudentList.fulfilled, (state, { payload }) => {
        if (state.currentWorkspace && payload.totalInWorkspace !== undefined) {
          state.currentWorkspace.studentCount = payload.totalInWorkspace;
        }
        const id = state.currentWorkspace?.id;
        if (id) {
          const w = state.items.find((x) => x.id === id);
          if (w && payload.totalInWorkspace !== undefined) {
            w.studentCount = payload.totalInWorkspace;
          }
        }
      })
      .addCase(createCard.fulfilled, (state, { payload }) => {
        if (payload.card && state.currentWorkspace) {
          state.currentWorkspace.cards = state.currentWorkspace.cards ?? [];
          state.currentWorkspace.cards.push(payload.card);
          state.currentWorkspace.cardCount = (state.currentWorkspace.cardCount ?? 0) + 1;
        }
        const id = state.currentWorkspace?.id;
        if (id && payload.card) {
          const w = state.items.find((x) => x.id === id);
          if (w) w.cardCount = (w.cardCount ?? 0) + 1;
        }
      })
      .addCase(updateCard.fulfilled, (state, { payload }) => {
        if (payload.card && state.currentWorkspace?.cards) {
          const idx = state.currentWorkspace.cards.findIndex(
            (c) => c.id === payload.card.id
          );
          if (idx !== -1) state.currentWorkspace.cards[idx] = payload.card;
        }
      })
      .addCase(deleteCard.fulfilled, (state, { payload }) => {
        if (state.currentWorkspace?.cards) {
          state.currentWorkspace.cards = state.currentWorkspace.cards.filter(
            (c) => c.id !== payload
          );
          state.currentWorkspace.cardCount = Math.max(
            0,
            (state.currentWorkspace.cardCount ?? 0) - 1
          );
        }
        const w = state.items.find((x) => x.id === state.currentWorkspace?.id);
        if (w) w.cardCount = Math.max(0, (w.cardCount ?? 0) - 1);
      });
  },
});

export const {
  setQuery,
  setCurrentWorkspace,
  clearCurrentWorkspace,
  resetState,
} = lecturerWorkspacesSlice.actions;
export default lecturerWorkspacesSlice.reducer;
