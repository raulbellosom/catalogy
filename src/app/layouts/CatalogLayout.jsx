import { Outlet } from "react-router-dom";
import { useSubdomainContext } from "@/app/providers";

/**
 * CatalogLayout
 * Layout específico para el catálogo público de la tienda.
 * A diferencia del PublicLayout, este layout es más ligero y permite
 * que cada template de catálogo renderice su propio Navbar y Footer
 * coherente con su diseño.
 */
export function CatalogLayout() {
  const { store } = useSubdomainContext();

  return (
    <div className="min-h-screen bg-(--color-bg) flex flex-col">
      <main className="flex-1">
        <Outlet context={{ store }} />
      </main>
    </div>
  );
}
