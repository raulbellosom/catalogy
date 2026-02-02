import { Link } from "react-router-dom";
import { Store } from "lucide-react";
import { Button } from "@/shared/ui/atoms/Button";
import { ThemeToggle } from "@/shared/ui/molecules/ThemeToggle";

/**
 * Navbar component - Shared across public pages
 * @param {Object} props
 * @param {boolean} [props.showAuthButtons=true] - Show login/register buttons
 */
export function Navbar({ showAuthButtons = true }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-bg)]/80 backdrop-blur-md border-b border-[var(--color-border)] safe-top">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <Store className="w-7 h-7 text-[var(--color-primary)]" />
          <span className="text-xl font-bold text-[var(--color-fg)]">
            Catalogy
          </span>
        </Link>

        {/* Actions */}
        {showAuthButtons && (
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link to="/auth/login">
              <Button variant="ghost" size="sm">
                Iniciar sesión
              </Button>
            </Link>
            <Link to="/auth/register" className="hidden sm:block">
              <Button size="sm">Crear cuenta</Button>
            </Link>
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
