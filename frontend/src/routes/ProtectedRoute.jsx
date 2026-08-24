import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuthStore } from '../store/authStore.js';

/**
 * Mirrors the backend's authenticate + authorize(...roles) pattern on the
 * frontend: no user -> /login; wrong role for this branch -> redirected to
 * their own home instead of a raw 403 page, since landing them somewhere
 * useful beats a dead end.
 */
export default function ProtectedRoute({ allowedRoles }) {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
