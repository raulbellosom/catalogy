import { Outlet, Link } from "react-router-dom";
import { Store } from "lucide-react";
import { ThemeToggle } from "@/shared/ui/molecules/ThemeToggle";

/**
 * Auth layout for login, register, forgot password pages
 * Centered card layout with branding
 */
export function AuthLayout() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col items-center justify-center p-4 safe-top safe-bottom">
      {/* Theme toggle in corner */}
      <div className="fixed top-4 right-4">
        <ThemeToggle />
      </div>

      {/* Logo/Brand */}
      <Link
        to="/"
        className="flex items-center gap-2 mb-8 text-[var(--color-primary)] hover:opacity-80 transition-opacity"
      >
        <Store className="w-8 h-8" />
        <span className="text-2xl font-bold text-[var(--color-fg)]">
          Catalogy
        </span>
      </Link>

      {/* Auth card */}
      <div className="w-full max-w-md">
        <div className="bg-[var(--color-card)] border border-[var(--color-card-border)] rounded-2xl shadow-lg p-6 sm:p-8">
          <Outlet />
        </div>
      </div>

      {/* Footer */}
      <p className="mt-8 text-sm text-[var(--color-fg-muted)]">
        Powered by RacoonDevs
      </p>
    </div>
  );
}
