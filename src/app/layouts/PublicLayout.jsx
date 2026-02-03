import { Outlet } from "react-router-dom";
import { Navbar } from "@/shared/ui/organisms/Navbar";
import { Footer } from "@/shared/ui/organisms/Footer";

/**
 * Public layout for landing and catalog pages
 * Includes navbar and footer
 */
export function PublicLayout() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
      <Navbar showAuthButtons={true} />
      <main className="flex-1 pt-14 sm:pt-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
