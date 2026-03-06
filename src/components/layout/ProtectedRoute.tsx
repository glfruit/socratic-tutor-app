import { Navigate, Outlet, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  isAuthenticated: boolean;
}

export function ProtectedRoute({ isAuthenticated }: ProtectedRouteProps) {
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
