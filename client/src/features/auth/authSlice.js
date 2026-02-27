import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../utils/axios';

const getErrorMessage = (err) =>
  err.response?.data?.message || err.message || 'Something went wrong';

export const login = createAsyncThunk(
  'auth/login',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/api/auth/login', payload);
      return data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/api/auth/register', payload);
      return data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/api/auth/forgot-password', payload);
      return data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/api/auth/reset-password', payload);
      return data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async (token, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/api/auth/verify-email/${encodeURIComponent(token)}`);
      return data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const resendVerification = createAsyncThunk(
  'auth/resendVerification',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/api/auth/resend-verification', payload);
      return data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const getMe = createAsyncThunk(
  'auth/getMe',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/api/auth/me');
      return data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const updatePasswordAfterLogin = createAsyncThunk(
  'auth/updatePasswordAfterLogin',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/api/auth/me/password', payload);
      return data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

const initialState = {
  user: null,
  accessToken: (typeof localStorage !== 'undefined' && localStorage.getItem('inkcuba_token')) || null,
  isAuthenticated: false,
  loading: false,
  authLoading: true,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.authLoading = false;
      state.error = null;
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('inkcuba_token');
      }
    },
    setAuthReady: (state) => {
      state.authLoading = false;
    },
    setCredentials: (state, { payload }) => {
      state.user = payload.user;
      state.accessToken = payload.accessToken;
      state.isAuthenticated = !!payload.accessToken;
      if (payload.accessToken && typeof localStorage !== 'undefined') {
        localStorage.setItem('inkcuba_token', payload.accessToken);
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const setPending = (state) => {
      state.loading = true;
      state.error = null;
    };
    const setFulfilled = (state, action, saveToken = true) => {
      state.loading = false;
      state.error = null;
      const payload = action.payload;
      if (payload?.user) state.user = payload.user;
      if (saveToken && payload?.accessToken) {
        state.accessToken = payload.accessToken;
        state.isAuthenticated = true;
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('inkcuba_token', payload.accessToken);
        }
      }
    };
    const setRejected = (state, action) => {
      state.loading = false;
      state.error = action.payload ?? 'Request failed';
    };

    builder
      .addCase(login.pending, setPending)
      .addCase(login.fulfilled, (state, action) => setFulfilled(state, action, true))
      .addCase(login.rejected, setRejected)
      .addCase(register.pending, setPending)
      .addCase(register.fulfilled, (state, action) => setFulfilled(state, action, true))
      .addCase(register.rejected, setRejected)
      .addCase(forgotPassword.pending, setPending)
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(forgotPassword.rejected, setRejected)
      .addCase(resetPassword.pending, setPending)
      .addCase(resetPassword.fulfilled, (state, action) => setFulfilled(state, action, true))
      .addCase(resetPassword.rejected, setRejected)
      .addCase(verifyEmail.pending, setPending)
      .addCase(verifyEmail.fulfilled, (state, action) => setFulfilled(state, action, true))
      .addCase(verifyEmail.rejected, setRejected)
      .addCase(resendVerification.pending, setPending)
      .addCase(resendVerification.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(resendVerification.rejected, setRejected)
      .addCase(getMe.pending, (state) => {
        state.authLoading = true;
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.authLoading = false;
        state.user = action.payload?.user ?? null;
        state.isAuthenticated = !!state.accessToken;
      })
      .addCase(getMe.rejected, (state) => {
        state.authLoading = false;
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem('inkcuba_token');
        }
      })
      .addCase(updatePasswordAfterLogin.pending, setPending)
      .addCase(updatePasswordAfterLogin.fulfilled, (state, action) =>
        setFulfilled(state, action, true)
      )
      .addCase(updatePasswordAfterLogin.rejected, setRejected);
  },
});

export const { logout, setAuthReady, setCredentials, clearError } = authSlice.actions;
export default authSlice.reducer;
