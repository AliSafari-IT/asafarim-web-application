import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { useEffect, useRef } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const { addNotification } = useNotification();
  const location = useLocation();
  const notificationShown = useRef(false);

  // Add notifications based on auth state - but only for role-based access
  useEffect(() => {
    if (isLoading) return;

    // Only show notification for role-based access denial
    // Authentication notifications are handled in Home component
    if (isAuthenticated && requiredRole && user?.role !== requiredRole && !notificationShown.current) {
      addNotification({
        type: 'error',
        message: `Access denied. You need ${requiredRole} role to view this page.`,
        duration: 6000
      });
      notificationShown.current = true;
    }
  }, [isAuthenticated, user?.role, requiredRole, isLoading, addNotification]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  // Check if user needs to authenticate
  if (!isAuthenticated) {
    // Save the attempted location so we can redirect back after login
    return <Navigate to="/" state={{ from: location, showLogin: true }} replace />;
  }

  // Check role-based access if requiredRole is specified
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
  
export default ProtectedRoute;
