import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { getMe, setAuthReady, logout } from './features/auth/authSlice';
import { isTokenExpired } from './utils/jwt';
import Loader from './common/Loader';
import ProtectedRoute from './components/layout/ProtectedRoute';
import RouteLoader from './components/layout/RouteLoader';
import Footer from './components/layout/Footer';
import ScrollToTopButton from './components/layout/ScrollToTopButton';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import AboutPage from './pages/AboutPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import FirstLoginPasswordPage from './pages/FirstLoginPasswordPage';
import PlaceholderPage from './pages/PlaceholderPage';
import AdminUserManagementPage from './pages/AdminUserManagementPage';
import './App.css';

function AppRoutes() {
  const dispatch = useDispatch();
  const { accessToken, authLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    if (accessToken) {
      if (isTokenExpired(accessToken)) {
        dispatch(logout());
      } else {
        dispatch(getMe());
      }
    } else {
      dispatch(setAuthReady());
    }
  }, [dispatch, accessToken]);

  if (authLoading && accessToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <Loader size="lg" text="Loading..." />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/projects" element={<ProjectsPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route
        path="/first-login-password"
        element={
          <ProtectedRoute>
            <FirstLoginPasswordPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminUserManagementPage />
          </ProtectedRoute>
        }
      />
      <Route path="/admin/supervision" element={<ProtectedRoute allowedRoles={['admin']}><PlaceholderPage title="Supervision Monitoring" message="Monitor submission status. (Coming soon)" /></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><PlaceholderPage title="Analytics & Reports" message="Generate reports. (Coming soon)" /></ProtectedRoute>} />

      <Route path="/lecturer/workspaces" element={<ProtectedRoute allowedRoles={['lecturer']}><PlaceholderPage title="My Workspaces" message="Create and manage workspaces. (Coming soon)" /></ProtectedRoute>} />
      <Route path="/lecturer/students" element={<ProtectedRoute allowedRoles={['lecturer']}><PlaceholderPage title="Student List" message="Upload Excel or add students manually. (Coming soon)" /></ProtectedRoute>} />
      <Route path="/lecturer/cards" element={<ProtectedRoute allowedRoles={['lecturer']}><PlaceholderPage title="Define Cards" message="Create and assign cards. (Coming soon)" /></ProtectedRoute>} />
      <Route path="/lecturer/review" element={<ProtectedRoute allowedRoles={['lecturer']}><PlaceholderPage title="Review Submissions" message="Review and approve submissions. (Coming soon)" /></ProtectedRoute>} />

      <Route path="/student/workspace" element={<ProtectedRoute allowedRoles={['student']}><PlaceholderPage title="My Workspace" message="View your workspace and cards. (Coming soon)" /></ProtectedRoute>} />
      <Route path="/student/submit" element={<ProtectedRoute allowedRoles={['student']}><PlaceholderPage title="Submit Portfolio" message="Submit your project or portfolio. (Coming soon)" /></ProtectedRoute>} />
      <Route path="/student/feedback" element={<ProtectedRoute allowedRoles={['student']}><PlaceholderPage title="View Feedback" message="See feedback and submit revisions. (Coming soon)" /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-base-200">
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: { background: '#303030', color: '#F0F2E5' },
            success: { iconTheme: { primary: '#3B613A' } },
            error: { iconTheme: { primary: '#ef4444' } },
          }}
        />
        <RouteLoader />
        <div className="flex-1">
          <AppRoutes />
        </div>
        <ScrollToTopButton />
        <Footer />
      </div>
    </BrowserRouter>
  );
}
