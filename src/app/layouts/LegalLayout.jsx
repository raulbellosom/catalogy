import { Link, Outlet } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/shared/ui/atoms/Button";
import { Navbar } from "@/shared/ui/organisms/Navbar";
import { Footer } from "@/shared/ui/organisms/Footer";

/**
 * Layout for legal pages (privacy, terms, disclaimer)
 * Uses shared Navbar but adds a back button
 */
export function LegalLayout() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
      {/* Navbar with custom back button */}
      <header className="sticky top-0 z-50 bg-[var(--color-bg)]/80 backdrop-blur-md border-b border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Use Navbar component content but add back button */}
          <Link to="/" className="flex items-center gap-2">
            <svg
              className="w-7 h-7 text-[var(--color-primary)]"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
              <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9" />
              <path d="M12 3v6" />
            </svg>
            <span className="text-xl font-bold text-[var(--color-fg)]">
              Catalogy
            </span>
          </Link>
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
