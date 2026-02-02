import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/app/providers";
import { LoadingSpinner } from "@/shared/ui/atoms/LoadingSpinner";

/**
 * Protected route wrapper
 * Redirects to login if not authenticated
 * @param {{ children: React.ReactNode }} props
 */
export function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login, preserving the intended destination
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return children;
}
