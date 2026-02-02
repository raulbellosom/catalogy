import { Link, Outlet } from "react-router-dom";
import { ArrowLeft, Store } from "lucide-react";
import { Button } from "@/shared/ui/atoms/Button";
import { ThemeToggle } from "@/shared/ui/molecules/ThemeToggle";
import { Footer } from "@/shared/ui/organisms/Footer";

/**
 * Layout for legal pages (privacy, terms, disclaimer)
 * Consistent header with Store icon and back button
 */
export function LegalLayout() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
      {/* Header - consistent with other pages */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-bg)]/90 backdrop-blur-md border-b border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
          {/* Back button */}
          <Link to="/">
            <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Volver</span>
            </Button>
          </Link>

          {/* Logo and Theme Toggle */}
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Store className="w-6 h-6 sm:w-7 sm:h-7 text-[var(--color-primary)]" />
              <span className="text-lg sm:text-xl font-bold text-[var(--color-fg)]">
                Catalogy
              </span>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12 pt-20 sm:pt-24">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
