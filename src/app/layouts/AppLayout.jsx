import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard,
  Store,
  Package,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Users,
} from "lucide-react";
import { useAuth } from "@/app/providers";
import { useIsAdmin } from "@/shared/hooks";
import { ThemeToggle } from "@/shared/ui/molecules/ThemeToggle";
import { motion, AnimatePresence } from "motion/react";

/**
 * @typedef {Object} NavItem
 * @property {string} path
 * @property {string} label
 * @property {React.ComponentType} icon
 */

/** @type {NavItem[]} */
const NAV_ITEMS = [
  { path: "/app", label: "Dashboard", icon: LayoutDashboard },
  { path: "/app/store", label: "Mi tienda", icon: Store },
  { path: "/app/products", label: "Productos", icon: Package },
  { path: "/app/settings", label: "Configuracion", icon: Settings },
];

/**
 * App layout for authenticated dashboard pages
 * Includes sidebar navigation (desktop) and bottom nav (mobile)
 */
export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-secondary)]">
      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[var(--color-card)] border-b border-[var(--color-card-border)] safe-top">
        <div className="flex items-center justify-between h-14 px-4">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 -ml-2 text-[var(--color-fg)]"
            aria-label="Abrir menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-semibold text-[var(--color-fg)]">Catalogy</span>
          <ThemeToggle />
        </div>
      </header>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-50 bg-black/50"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-72 bg-[var(--color-card)] safe-top safe-bottom"
            >
              <div className="flex items-center justify-between h-14 px-4 border-b border-[var(--color-card-border)]">
                <span className="font-semibold text-[var(--color-fg)]">
                  Menu
                </span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 -mr-2 text-[var(--color-fg)]"
                  aria-label="Cerrar menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <nav className="p-4 flex-1 overflow-y-auto">
                <MobileNavItems onNavigate={() => setIsMobileMenuOpen(false)} />

                {/* Legal links */}
                <div className="mt-4 pt-4 border-t border-[var(--color-border)] space-y-2">
                  <Link
                    to="/legal/privacy"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-primary)] transition-colors px-3 py-2"
                  >
                    Aviso de privacidad
                  </Link>
                  <Link
                    to="/legal/terms"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-primary)] transition-colors px-3 py-2"
                  >
                    Términos de uso
                  </Link>
                </div>

                <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-[var(--color-error)] hover:bg-[var(--color-error-bg)] transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Cerrar sesion</span>
                  </button>
                </div>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:left-0 lg:top-0 lg:bottom-0 lg:w-64 bg-[var(--color-card)] border-r border-[var(--color-card-border)]">
        {/* Logo */}
        <div className="flex items-center gap-2 h-16 px-6 border-b border-[var(--color-card-border)]">
          <Store className="w-7 h-7 text-[var(--color-primary)]" />
          <span className="text-xl font-bold text-[var(--color-fg)]">
            Catalogy
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <DesktopNavItems />
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--color-card-border)]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-[var(--color-fg-secondary)] truncate">
              {user?.email}
            </span>
            <ThemeToggle />
          </div>

          {/* Legal links */}
          <div className="mb-4 space-y-1">
            <Link
              to="/legal/privacy"
              className="block text-xs text-[var(--color-fg-muted)] hover:text-[var(--color-primary)] transition-colors"
            >
              Aviso de privacidad
            </Link>
            <Link
              to="/legal/terms"
              className="block text-xs text-[var(--color-fg-muted)] hover:text-[var(--color-primary)] transition-colors"
            >
              Términos de uso
            </Link>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-[var(--color-error)] hover:bg-[var(--color-error-bg)] transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar sesion</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:pl-64 pt-14 lg:pt-0 min-h-screen">
        <div className="p-4 lg:p-6 safe-bottom">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

/**
 * Desktop navigation items
 */
function DesktopNavItems() {
  const { data: isAdmin, isLoading } = useIsAdmin();

  return (
    <ul className="space-y-1">
      {NAV_ITEMS.map((item) => (
        <li key={item.path}>
          <NavLink
            to={item.path}
            end={item.path === "/app"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? "bg-[var(--color-primary)] text-[var(--color-primary-fg)]"
                  : "text-[var(--color-fg-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-fg)]"
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        </li>
      ))}
      {!isLoading && isAdmin && (
        <>
          <li className="my-2 border-t border-[var(--color-border)] pt-2"></li>
          <li>
            <NavLink
              to="/app/admin/users"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? "bg-[var(--color-primary)] text-[var(--color-primary-fg)]"
                    : "text-[var(--color-fg-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-fg)]"
                }`
              }
            >
              <Users className="w-5 h-5" />
              <span>Usuarios</span>
            </NavLink>
          </li>
        </>
      )}
    </ul>
  );
}

/**
 * Mobile navigation items
 * @param {{ onNavigate: () => void }} props
 */
function MobileNavItems({ onNavigate }) {
  const { data: isAdmin, isLoading } = useIsAdmin();

  return (
    <ul className="space-y-1">
      {NAV_ITEMS.map((item) => (
        <li key={item.path}>
          <NavLink
            to={item.path}
            end={item.path === "/app"}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-[var(--color-primary)] text-[var(--color-primary-fg)]"
                  : "text-[var(--color-fg-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-fg)]"
              }`
            }
          >
            <div className="flex items-center gap-3">
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </div>
            <ChevronRight className="w-5 h-5 opacity-50" />
          </NavLink>
        </li>
      ))}
      {!isLoading && isAdmin && (
        <>
          <li className="my-2 border-t border-[var(--color-border)] pt-2"></li>
          <li>
            <NavLink
              to="/app/admin/users"
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-[var(--color-primary)] text-[var(--color-primary-fg)]"
                    : "text-[var(--color-fg-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-fg)]"
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5" />
                <span>Usuarios</span>
              </div>
              <ChevronRight className="w-5 h-5 opacity-50" />
            </NavLink>
          </li>
        </>
      )}
    </ul>
  );
}
