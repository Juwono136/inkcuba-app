import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

/**
 * Call after store is created. Injects store so interceptors can read state and dispatch.
 * Avoids circular dependency (store -> authSlice -> api -> store).
 */
export function setupAxiosInterceptors(store) {
  api.interceptors.request.use(
    (config) => {
      const state = store.getState();
      const token = state.auth?.accessToken;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        store.dispatch({ type: 'auth/logout' });
      }
      if (error.response?.status === 429) {
        console.warn('Rate limited; do not treat as auth failure.');
      }
      return Promise.reject(error);
    }
  );
}

export default api;
