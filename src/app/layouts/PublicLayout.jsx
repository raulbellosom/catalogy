import { Outlet } from "react-router-dom";
import { Navbar } from "@/shared/ui/organisms/Navbar";

/**
 * Public layout for landing and catalog pages
 * Includes navbar and footer
 */
export function PublicLayout() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Navbar showAuthButtons={true} />
      <Outlet />
    </div>
  );
}
