import { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Import Components
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import PublicRoute from "./components/layout/PublicRoute";
import LoadingSpinner from "./components/common/LoadingSpinner";

import "./App.css";

// Contoh: Dashboard nanti bisa di-lazy load jika kodenya besar
// const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));

function App() {
  return (
    <>
      <Router>
        {/* 3. Bungkus Routes dengan Suspense agar Loader muncul saat pindah halaman berat */}
        <Suspense fallback={<LoadingSpinner fullScreen={true} />}>
          <Routes>
            {/* Public Routes */}
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<LoginPage />} />
            </Route>

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route
                path="/dashboard"
                element={
                  <div className="p-10 text-center min-h-screen">
                    <h1 className="text-2xl font-bold text-[#1B211A]">Dashboard Area</h1>
                    <p className="text-gray-500">Welcome to InkCuba Workspace.</p>

                    {/* Contoh penggunaan Loader Inline (bukan full screen) */}
                    <div className="mt-10 border border-gray-200 rounded-lg p-10">
                      <h3 className="mb-4">Recent Projects</h3>
                      {/* Simulasi loading data tabel */}
                      <LoadingSpinner fullScreen={false} size="md" text="Fetching Data..." />
                    </div>
                  </div>
                }
              />
            </Route>

            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </Suspense>
      </Router>

      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#333",
            color: "#fff",
            fontSize: "14px",
            borderRadius: "8px",
          },
          success: {
            iconTheme: { primary: "#fff", secondary: "#333" },
          },
        }}
      />
    </>
  );
}

export default App;
