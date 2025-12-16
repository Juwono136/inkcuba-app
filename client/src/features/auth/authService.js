import api from "../../services/api";

// Login User
const login = async (userData) => {
  const response = await api.post("/auth/login", userData);

  if (response.data) {
    // 1. Simpan Access Token (PENTING untuk Authorization Header)
    if (response.data.token) {
      localStorage.setItem("accessToken", response.data.token);
    }

    // 2. Simpan User Info (untuk ditampilkan di Navbar/Dashboard)
    if (response.data.data && response.data.data.user) {
      localStorage.setItem("user", JSON.stringify(response.data.data.user));
    } else if (response.data.user) {
      // Fallback jika struktur response berbeda
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
  }
  return response.data;
};

// Logout User
const logout = async () => {
  // Panggil endpoint logout backend (untuk hapus cookie refresh token)
  try {
    await api.get("/auth/logout");
  } catch (error) {
    console.error("Logout error", error);
  }
  // Hapus data di client
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
};

const authService = {
  login,
  logout,
};

export default authService;
