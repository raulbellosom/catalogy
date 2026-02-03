import { Link } from "react-router-dom";
import { Button } from "@/shared/ui/atoms/Button";
import { Logo } from "@/shared/ui/atoms/Logo";
import { ThemeToggle } from "@/shared/ui/molecules/ThemeToggle";

/**
 * Navbar component - Shared across public pages
 * @param {Object} props
 * @param {boolean} [props.showAuthButtons=true] - Show login/register buttons
 * @param {string} [props.currentPath] - Current route path to show contextual buttons
 */
export function Navbar({ showAuthButtons = true, currentPath = "" }) {
  // Determine if we're on login or register page
  const isLoginPage = currentPath.includes("/auth/login");
  const isRegisterPage = currentPath.includes("/auth/register");
  const isAuthPage = isLoginPage || isRegisterPage;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-bg)]/90 backdrop-blur-md border-b border-[var(--color-border)]">
      <div className="max-w-6xl mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
        {/* Logo */}
        <Logo className="hover:opacity-80 transition-opacity" />

        {/* Actions */}
        {showAuthButtons && (
          <div className="flex items-center gap-2">
            <ThemeToggle />

            {/* Show contextual buttons based on current page */}
            {isAuthPage ? (
              // On auth pages, show the opposite action
              isLoginPage ? (
                <Link to="/auth/register">
                  <Button size="sm" className="text-xs sm:text-sm">
                    Crear cuenta
                  </Button>
                </Link>
              ) : (
                <Link to="/auth/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs sm:text-sm"
                  >
                    Iniciar sesión
                  </Button>
                </Link>
              )
            ) : (
              // On other pages, show both buttons
              <>
                <Link to="/auth/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs sm:text-sm"
                  >
                    Iniciar sesión
                  </Button>
                </Link>
                <Link to="/auth/register" className="hidden sm:block">
                  <Button size="sm" className="text-xs sm:text-sm">
                    Crear cuenta
                  </Button>
                </Link>
              </>
            )}
          </div>
        )}

        {!showAuthButtons && (
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        )}
      </div>
    </header>
  );
}
