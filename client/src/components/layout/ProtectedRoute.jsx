import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = () => {
  const { user } = useSelector((state) => state.auth);

  // Jika tidak ada user, redirect ke login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Jika ada, tampilkan halaman anak (Outlet)
  return <Outlet />;
};

export default ProtectedRoute;
