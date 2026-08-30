import { Navigate, Outlet } from 'react-router-dom';

import { useAuthStore } from '../store/authStore.js';
import { ROLE_HOME } from './roleNav.js';

/** Prevent authenticated users from reopening login, registration, or reset flows. */
export default function PublicOnlyRoute() {
  const user = useAuthStore((state) => state.user);
  const home = ROLE_HOME[user?.role];
  return user && home ? <Navigate to={home} replace /> : <Outlet />;
}
