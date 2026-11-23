import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AppContext.jsx';
import { Loading } from './ui.jsx';

export function RequireAuth({ role }) {
  const { user, authReady } = useAuth();
  const location = useLocation();
  if (!authReady) return <Loading />;
  if (!user) return <Navigate to={role === 'ADMIN' ? '/admin/login' : '/login'} replace state={{ from: location.pathname + location.search }} />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return <Outlet />;
}
