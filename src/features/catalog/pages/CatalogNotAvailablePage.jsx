import { Link } from "react-router-dom";
import { Store, Clock } from "lucide-react";

/**
 * Page shown when catalog exists but is not published
 */
export function CatalogNotAvailablePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-[var(--color-warning-bg)] rounded-full flex items-center justify-center mb-6">
        <Clock className="w-10 h-10 text-[var(--color-warning)]" />
      </div>
      <h1 className="text-3xl font-bold text-[var(--color-fg)] mb-2">
        Catalogo no disponible
      </h1>
      <p className="text-[var(--color-fg-secondary)] mb-8 max-w-md">
        Este catalogo aun no ha sido publicado. Vuelve pronto para ver los
        productos.
      </p>
      <a
        href="https://catalog.racoondevs.com"
        className="inline-flex items-center gap-2 text-[var(--color-primary)] hover:underline"
      >
        <Store className="w-5 h-5" />
        Crea tu propio catalogo
      </a>
    </div>
  );
}
