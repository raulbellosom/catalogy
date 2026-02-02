import { Outlet, Link, useLocation } from "react-router-dom";
import { Store } from "lucide-react";
import { Navbar } from "@/shared/ui/organisms/Navbar";
import { Footer } from "@/shared/ui/organisms/Footer";

/**
 * Auth layout for login, register, forgot password pages
 * Centered card layout with branding, navbar and footer
 * Optimized with 100dvh for mobile devices
 */
export function AuthLayout() {
  const location = useLocation();

  return (
    <div className="min-h-[100dvh] bg-[var(--color-bg)] flex flex-col">
      {/* Navbar */}
      <Navbar showAuthButtons={true} currentPath={location.pathname} />

      {/* Main content - centered, grows to fill space */}
      <main className="flex-1 flex items-center justify-center px-4 py-6 pt-20 sm:pt-24">
        <div className="w-full max-w-md">
          {/* Logo/Brand - visible on mobile */}
          <Link
            to="/"
            className="flex md:hidden items-center gap-2 mb-4 text-[var(--color-primary)] hover:opacity-80 transition-opacity justify-center"
          >
            <Store className="w-6 h-6" />
            <span className="text-lg font-bold text-[var(--color-fg)]">
              Catalogy
            </span>
          </Link>

          {/* Auth card con efecto de vidrio y sombra moderna */}
          <div className="w-full relative">
            {/* Efectos de fondo decorativos */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] rounded-2xl blur-lg opacity-20 animate-pulse-slow"></div>

            <div className="relative bg-[var(--color-card)] border border-[var(--color-card-border)] rounded-2xl shadow-2xl p-4 sm:p-6 backdrop-blur-xl">
              <Outlet />
            </div>
          </div>
        </div>
      </main>

      {/* Footer - hidden on small screens to save space */}
      <div className="hidden md:block flex-shrink-0">
        <Footer />
      </div>

      {/* Estilos globales para animaciones */}
      <style>{`
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.1;
          }
          50% {
            opacity: 0.2;
          }
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
