import { useAuth } from '../context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

export const useProtectedRoute = (allowedRoles?: string[]) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return null;
};