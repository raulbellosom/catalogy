import {
  Outlet,
  NavLink,
  useNavigate,
  Link,
  useLocation,
} from "react-router-dom";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Store,
  Package,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Users,
  User,
  Sparkles,
  Tag,
  Palette,
} from "lucide-react";
import { useAuth } from "@/app/providers";
import { useIsAdmin, useUserStore, useProfile } from "@/shared/hooks";
import { storage, BUCKETS } from "@/shared/lib/appwrite";
import { Button } from "@/shared/ui/atoms/Button";
import { Logo } from "@/shared/ui/atoms/Logo";
import { FullScreenLoader } from "@/shared/ui/molecules/FullScreenLoader";
import { ThemeToggle } from "@/shared/ui/molecules/ThemeToggle";
import { motion, AnimatePresence } from "motion/react";

/**
 * @typedef {Object} NavItem
 * @property {string} to
 * @property {string} label
 * @property {React.ComponentType} icon
 * @property {boolean} exact
 */

/** @type {NavItem[]} */
const NAV_ITEMS = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, exact: true },
  {
    to: "/app/store?tab=general",
    label: "Mi tienda",
    icon: Store,
    exact: false,
  },
  {
    to: "/app/store?tab=appearance",
    label: "Apariencia",
    icon: Palette,
    exact: false,
  },
  {
    to: "/app/store?tab=categories",
    label: "Categorías",
    icon: Tag,
    exact: false,
  },
  {
    to: "/app/store?tab=products",
    label: "Productos",
    icon: Package,
    exact: false,
  },
  { to: "/app/settings", label: "Configuracion", icon: Settings, exact: false },
];

/**
 * Desktop/Mobile navigation item with smooth animations
 * @param {Object} props
 * @param {string} props.to
 * @param {React.ComponentType} props.icon
 * @param {string} props.label
 * @param {boolean} [props.collapsed]
 * @param {boolean} [props.exact]
 * @param {() => void} [props.onClick]
 */
function NavItem({ to, icon: Icon, label, collapsed, onClick }) {
  const { search, pathname } = useLocation();

  const isActive = () => {
    const targetUrl = new URL(to, window.location.origin);
    const targetPath = targetUrl.pathname;
    const targetTab = targetUrl.searchParams.get("tab");

    // Match pathname
    if (pathname !== targetPath) return false;

    // If target has a tab, current search must match it
    const currentTab = new URLSearchParams(search).get("tab");
    if (targetTab) {
      return currentTab === targetTab;
    }

    // If target has NO tab, current search must also have no tab (or at least not 'products' etc.)
    return !currentTab || currentTab === "general";
  };

  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={() =>
        `group flex items-center overflow-hidden transition-all relative select-none mx-2 my-0.5 rounded-xl ${
          isActive()
            ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
            : "text-[var(--color-fg-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-fg)]"
        }`
      }
      title={collapsed ? label : undefined}
    >
      {() => (
        <>
          {/* Active indicator */}
          {isActive() && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-[var(--color-primary)] rounded-r-full"></div>
          )}

          {/* Icon area - fixed width */}
          <div className="flex h-11 w-12 shrink-0 items-center justify-center">
            <Icon
              className={`h-5 w-5 transition-transform ${
                isActive() ? "scale-105" : "group-hover:scale-105"
              }`}
            />
          </div>

          {/* Text - smooth reveal with grid technique */}
          <div
            className={`grid transition-[grid-template-columns] duration-300 ease-in-out ${
              collapsed ? "grid-cols-[0fr]" : "grid-cols-[1fr]"
            }`}
          >
            <span className="overflow-hidden whitespace-nowrap text-sm font-semibold pr-3">
              {label}
            </span>
          </div>
        </>
      )}
    </NavLink>
  );
}

/**
 * Mobile bottom nav item
 * @param {Object} props
 * @param {string} props.to
 * @param {React.ComponentType} props.icon
 * @param {boolean} [props.exact]
 */
function MobileNavItem({ to, icon: Icon, label }) {
  const { search, pathname } = useLocation();

  const isActive = () => {
    const targetUrl = new URL(to, window.location.origin);
    const targetPath = targetUrl.pathname;
    const targetTab = targetUrl.searchParams.get("tab");

    if (pathname !== targetPath) return false;

    const currentTab = new URLSearchParams(search).get("tab");
    if (targetTab) return currentTab === targetTab;

    return !currentTab || currentTab === "general";
  };

  return (
    <NavLink
      to={to}
      className={() =>
        `flex flex-col items-center gap-1 rounded-xl py-2 px-3 text-xs font-semibold transition-all relative ${
          isActive()
            ? "text-[var(--color-primary)]"
            : "text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
        }`
      }
    >
      {() => (
        <>
          <motion.div
            initial={false}
            animate={{
              scale: isActive() ? 1.15 : 1,
              y: isActive() ? -2 : 0,
            }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Icon className="h-5 w-5" />
          </motion.div>
          <span className="truncate max-w-[64px]">{label}</span>
          {isActive() && (
            <motion.div
              layoutId="mobile-nav-indicator"
              className="absolute -top-0.5 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full bg-[var(--color-primary)]"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
        </>
      )}
    </NavLink>
  );
}

/**
 * User avatar component
 * @param {Object} props
 * @param {string} props.name
 * @param {string} [props.avatarUrl] - URL of the avatar image
 * @param {string} [props.size]
 */
function UserAvatar({ name, avatarUrl, size = "md" }) {
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  };

  const initials =
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";

  // If avatar URL exists, show image
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name || "Avatar"}
        className={`${sizeClasses[size]} rounded-full object-cover ring-2 ring-[var(--color-card)] ring-offset-2 ring-offset-[var(--color-bg)]`}
      />
    );
  }

  // Fallback to initials
  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-hover)] flex items-center justify-center font-bold text-white ring-2 ring-[var(--color-card)] ring-offset-2 ring-offset-[var(--color-bg)]`}
    >
      {initials}
    </div>
  );
}

/**
 * Desktop navigation items
 * @param {Object} props
 * @param {boolean} props.collapsed
 */
function DesktopNavItems({ collapsed }) {
  const { data: isAdmin, isLoading } = useIsAdmin();

  return (
    <>
      {NAV_ITEMS.map((item) => (
        <NavItem key={item.to} {...item} collapsed={collapsed} />
      ))}
      {!isLoading && isAdmin && (
        <>
          <div className="my-2 border-t border-[var(--color-border)] mx-2"></div>
          <NavItem
            to="/app/admin/users"
            label="Usuarios"
            icon={Users}
            collapsed={collapsed}
            exact={false}
          />
        </>
      )}
    </>
  );
}

/**
 * Mobile drawer navigation items
 * @param {Object} props
 * @param {() => void} props.onNavigate
 */
function MobileDrawerNavItems({ onNavigate }) {
  const { data: isAdmin, isLoading } = useIsAdmin();

  return (
    <>
      {NAV_ITEMS.map((item) => (
        <NavItem key={item.to} {...item} onClick={onNavigate} />
      ))}
      {!isLoading && isAdmin && (
        <>
          <div className="my-2 border-t border-[var(--color-border)] mx-2"></div>
          <NavItem
            to="/app/admin/users"
            label="Usuarios"
            icon={Users}
            onClick={onNavigate}
            exact={false}
          />
        </>
      )}
    </>
  );
}

/**
 * App layout for authenticated dashboard pages
 * Includes collapsible sidebar (desktop), bottom nav (mobile), and top navbar
 */
export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data: store, isLoading: loadingStore } = useUserStore();
  const { data: profile } = useProfile();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // Get avatar URL from profile
  const avatarUrl = profile?.avatarFileId
    ? storage.getFilePreview(BUCKETS.AVATARS, profile.avatarFileId).href
    : null;

  // Sidebar collapsed state (persisted in localStorage)
  const [collapsed, setCollapsed] = useState(() => {
    const stored = localStorage.getItem("sidebar-collapsed");
    return stored === "true";
  });

  const toggleSidebar = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    localStorage.setItem("sidebar-collapsed", String(newState));
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
  }, [window.location.pathname]);

  const displayName = user?.name || user?.email?.split("@")[0] || "Usuario";

  // Force redirect to dashboard if trying to access other routes without a store
  useEffect(() => {
    if (!loadingStore && !store) {
      // Allow only the dashboard route (where wizard lives)
      // and admin routes (if applicable, but let's keep it simple for now)
      if (
        location.pathname !== "/app" &&
        !location.pathname.startsWith("/app/admin")
      ) {
        navigate("/app", { replace: true });
      }
    }
  }, [store, loadingStore, location.pathname, navigate]);

  if (loadingStore) {
    return <FullScreenLoader />;
  }

  // ================= ONBOARDING LAYOUT (NO STORE) =================
  if (!loadingStore && !store) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-secondary)] flex flex-col">
        {/* Simple Header */}
        <header className="fixed top-0 left-0 right-0 h-16 border-b border-[var(--color-card-border)] bg-[var(--color-card)]/80 backdrop-blur-lg px-6 flex items-center justify-between z-20">
          <div className="flex items-center gap-2">
            <Logo />
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-[var(--color-fg-muted)] hover:text-[var(--color-error)]"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </header>

        {/* Centered Content */}
        <main className="flex-1 flex items-center justify-center pt-16 p-4">
          <div className="w-full max-w-4xl">
            <AnimatePresence mode="wait">
              <motion.div
                key="onboarding"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* Simple Footer */}
        <footer className="py-4 text-center text-xs text-[var(--color-fg-muted)]">
          <a
            href="https://racoondevs.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--color-primary)]"
          >
            Powered by RacoonDevs
          </a>
        </footer>
      </div>
    );
  }

  // ================= STANDARD LAYOUT (HAS STORE) =================
  return (
    <div className="min-h-screen bg-[var(--color-bg-secondary)]">
      {/* ========== DESKTOP SIDEBAR ========== */}
      <aside
        className={`hidden lg:flex lg:flex-col lg:fixed lg:left-0 lg:top-0 lg:bottom-0 bg-[var(--color-card)] border-r border-[var(--color-card-border)] transition-all duration-300 ease-in-out z-30 ${
          collapsed ? "lg:w-16" : "lg:w-64"
        }`}
      >
        {/* Logo area */}
        <div className="flex h-16 items-center border-b border-[var(--color-card-border)] overflow-hidden px-4">
          {/* Using Logo component which handles text and icon */}
          {collapsed ? (
            <div className="flex h-full w-full items-center justify-center">
              <Logo variant="icon" />
            </div>
          ) : (
            <Logo variant="full" />
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <DesktopNavItems collapsed={collapsed} />
        </nav>

        {/* Footer - collapse button */}
        <div className="border-t border-[var(--color-card-border)]">
          <button
            onClick={toggleSidebar}
            className="flex h-12 w-full items-center justify-center hover:bg-[var(--color-bg-tertiary)] transition-colors"
            aria-label={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4 text-[var(--color-fg-secondary)]" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-[var(--color-fg-secondary)]" />
            )}
          </button>
        </div>
      </aside>

      {/* ========== DESKTOP TOP NAVBAR ========== */}
      <header
        className={`hidden lg:flex lg:fixed lg:top-0 lg:right-0 lg:h-16 lg:items-center lg:justify-between border-b border-[var(--color-card-border)] bg-[var(--color-card)]/80 backdrop-blur-lg px-6 transition-all duration-300 ease-in-out z-20 ${
          collapsed ? "lg:left-16" : "lg:left-64"
        }`}
      >
        {/* Breadcrumb or page title */}
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-[var(--color-primary)]" />
          <h1 className="text-lg font-bold text-[var(--color-fg)]">
            Panel de control
          </h1>
        </div>

        {/* Right side - theme toggle and user profile */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="h-8 w-px bg-[var(--color-border)]"></div>

          {/* User profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-[var(--color-bg-tertiary)] transition-colors group"
            >
              <div className="text-right">
                <div className="text-sm font-bold text-[var(--color-fg)] max-w-[150px] truncate">
                  {displayName}
                </div>
                <div className="text-xs text-[var(--color-fg-secondary)]">
                  {user?.email}
                </div>
              </div>
              <UserAvatar name={displayName} avatarUrl={avatarUrl} size="md" />
            </button>

            {/* Dropdown menu */}
            <AnimatePresence>
              {isProfileMenuOpen && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsProfileMenuOpen(false)}
                  />

                  {/* Menu */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-64 bg-[var(--color-card)] border border-[var(--color-card-border)] rounded-xl shadow-lg overflow-hidden z-50"
                  >
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-[var(--color-border)]">
                      <div className="text-sm font-bold text-[var(--color-fg)]">
                        {displayName}
                      </div>
                      <div className="text-xs text-[var(--color-fg-secondary)] truncate">
                        {user?.email}
                      </div>
                    </div>

                    {/* Menu items */}
                    <div className="py-2">
                      <button
                        onClick={() => {
                          navigate("/app/settings");
                          setIsProfileMenuOpen(false);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-[var(--color-fg-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-fg)] transition-colors"
                      >
                        <User className="h-4 w-4" />
                        <span>Mi perfil</span>
                      </button>
                      <button
                        onClick={() => {
                          navigate("/app/settings");
                          setIsProfileMenuOpen(false);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-[var(--color-fg-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-fg)] transition-colors"
                      >
                        <Settings className="h-4 w-4" />
                        <span>Configuracion</span>
                      </button>
                    </div>

                    {/* Legal links */}
                    <div className="border-t border-[var(--color-border)] py-2">
                      <Link
                        to="/legal/privacy"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="block px-4 py-2 text-xs text-[var(--color-fg-muted)] hover:text-[var(--color-primary)] transition-colors"
                      >
                        Aviso de privacidad
                      </Link>
                      <Link
                        to="/legal/terms"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="block px-4 py-2 text-xs text-[var(--color-fg-muted)] hover:text-[var(--color-primary)] transition-colors"
                      >
                        Términos de uso
                      </Link>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-[var(--color-border)] p-2">
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsProfileMenuOpen(false);
                        }}
                        className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-[var(--color-error)] hover:bg-[var(--color-error-bg)] transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Cerrar sesion</span>
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* ========== DESKTOP MAIN CONTENT ========== */}
      <main
        className={`hidden lg:block lg:min-h-screen lg:pt-16 lg:pb-16 transition-all duration-300 ease-in-out ${
          collapsed ? "lg:pl-16" : "lg:pl-64"
        }`}
      >
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={window.location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* ========== DESKTOP FOOTER ========== */}
      <footer
        className={`hidden lg:flex lg:fixed lg:bottom-0 lg:right-0 lg:h-12 lg:items-center lg:justify-end border-t border-[var(--color-card-border)] bg-[var(--color-card)]/50 backdrop-blur-sm px-6 transition-all duration-300 ease-in-out ${
          collapsed ? "lg:left-16" : "lg:left-64"
        }`}
      >
        <a
          href="https://racoondevs.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium text-[var(--color-fg-muted)] hover:text-[var(--color-primary)] transition-colors"
        >
          Powered by RacoonDevs
        </a>
      </footer>

      {/* ========== MOBILE HEADER ========== */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[var(--color-card)]/90 backdrop-blur-lg border-b border-[var(--color-card-border)] safe-top">
        <div className="flex items-center justify-between h-14 px-4">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 -ml-2 rounded-lg hover:bg-[var(--color-bg-tertiary)] transition-colors"
            aria-label="Abrir menu"
          >
            <Menu className="w-6 h-6 text-[var(--color-fg)]" />
          </button>
          <div className="flex items-center gap-2">
            <Logo variant="icon" />
            <span className="font-bold text-[var(--color-fg)]">Catalogy</span>
          </div>

          <ThemeToggle />
        </div>
      </header>

      {/* ========== MOBILE DRAWER ========== */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Drawer */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-80 max-w-[85vw] bg-[var(--color-card)] safe-top safe-bottom overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between h-14 px-4 border-b border-[var(--color-card-border)]">
                <span className="font-bold text-[var(--color-fg)]">Menú</span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 -mr-2 rounded-lg hover:bg-[var(--color-bg-tertiary)] transition-colors"
                  aria-label="Cerrar menu"
                >
                  <X className="w-6 h-6 text-[var(--color-fg)]" />
                </button>
              </div>

              {/* User info */}
              <div className="p-4 border-b border-[var(--color-border)]">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-primary)]/5">
                  <UserAvatar
                    name={displayName}
                    avatarUrl={avatarUrl}
                    size="lg"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-[var(--color-fg)] truncate">
                      {displayName}
                    </div>
                    <div className="text-xs text-[var(--color-fg-secondary)] truncate">
                      {user?.email}
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="p-2">
                <MobileDrawerNavItems
                  onNavigate={() => setIsMobileMenuOpen(false)}
                />
              </nav>

              {/* Theme toggle */}
              <div className="px-4 py-3 border-t border-[var(--color-border)]">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[var(--color-fg-secondary)]">
                    Tema
                  </span>
                  <ThemeToggle />
                </div>
              </div>

              {/* Legal links */}
              <div className="px-4 py-3 border-t border-[var(--color-border)] space-y-2">
                <Link
                  to="/legal/privacy"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-primary)] transition-colors"
                >
                  Aviso de privacidad
                </Link>
                <Link
                  to="/legal/terms"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-primary)] transition-colors"
                >
                  Términos de uso
                </Link>
              </div>

              {/* Logout */}
              <div className="p-4 border-t border-[var(--color-border)]">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-[var(--color-error)] hover:bg-[var(--color-error-bg)] transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Cerrar sesion</span>
                </button>
              </div>

              {/* Powered by */}
              <div className="p-4 border-t border-[var(--color-border)]">
                <a
                  href="https://racoondevs.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center text-xs text-[var(--color-fg-muted)] hover:text-[var(--color-primary)] transition-colors"
                >
                  Powered by RacoonDevs
                </a>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ========== MOBILE MAIN CONTENT ========== */}
      <main className="lg:hidden min-h-screen safe-top">
        {/* Explicit spacer for fixed header */}
        <div className="h-24" aria-hidden="true" />
        <div className="p-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={window.location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Explicit spacer for bottom nav */}
        <div className="h-32 safe-bottom" aria-hidden="true" />
      </main>

      {/* ========== MOBILE BOTTOM NAV ========== */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--color-card-border)] bg-[var(--color-card)]/90 backdrop-blur-lg safe-bottom">
        <div className="grid grid-cols-4 gap-1 px-2 py-1.5">
          {NAV_ITEMS.slice(0, 4).map((item) => (
            <MobileNavItem key={item.to} {...item} />
          ))}
        </div>
      </nav>
    </div>
  );
}
