import axios from "axios";

const API_URL = "/api/v1";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Agar cookie refresh token bisa dikirim/diterima
});

// 1. Request Interceptor: Tempel Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Response Interceptor: Handle Token Expired (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Jika error 401 (Unauthorized) dan bukan saat sedang login
    if (error.response && error.response.status === 401) {
      // Cek apakah error bukan berasal dari input login yang salah
      // Biasanya backend kirim pesan spesifik, tapi cara paling aman:
      // Jika token tidak valid, hapus storage dan redirect

      if (!window.location.pathname.includes("/login")) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        window.location.href = "/login"; // Redirect paksa ke login
      }
    }
    return Promise.reject(error);
  }
);

export default api;
