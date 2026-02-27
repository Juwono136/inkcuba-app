import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * Protects routes by authentication and optional role.
 * - If not authenticated → redirect to /login (with return url in state).
 * - If authenticated but role not in allowedRoles → show 403 / redirect to forbidden or home.
 *
 * @param {React.ReactNode} children - Content to render when access is allowed
 * @param {string[]} [allowedRoles] - Optional. Roles that can access (e.g. ['admin', 'lecturer']). If omitted, any authenticated user can access.
 * @param {string} [redirectTo] - Where to send when not authenticated (default: '/login')
 * @param {string} [forbiddenRedirectTo] - Where to send when role is not allowed (default: '/')
 */
export default function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = '/login',
  forbiddenRedirectTo = '/',
}) {
  const { isAuthenticated, authLoading, user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg text-[#3B613A]" aria-label="Loading" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (user?.mustChangePassword && location.pathname !== '/first-login-password') {
    return <Navigate to="/first-login-password" replace />;
  }

  if (allowedRoles != null && Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    const role = user?.role;
    const hasRole = role && allowedRoles.includes(role);
    if (!hasRole) {
      return <Navigate to={forbiddenRedirectTo} state={null} replace />;
    }
  }

  return children;
}
