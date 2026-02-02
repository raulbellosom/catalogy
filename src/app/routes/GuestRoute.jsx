import { Navigate } from "react-router-dom";
import { useAuth } from "@/app/providers";
import { LoadingSpinner } from "@/shared/ui/atoms/LoadingSpinner";

/**
 * Guest route wrapper
 * Redirects to dashboard if already authenticated
 * Used for login, register, and landing pages
 * @param {{ children: React.ReactNode, redirectTo?: string }} props
 */
export function GuestRoute({ children, redirectTo = "/app" }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}
