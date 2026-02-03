/**
 * StoreFooter Component
 *
 * Footer de tienda.
 */
import { appConfig } from "@/shared/lib/env";

export function StoreFooter({ store, variant = "simple" }) {
  const currentYear = new Date().getFullYear();

  const baseClasses = "py-8 mt-auto border-t";
  const variants = {
    simple: "bg-[var(--background)] border-[var(--border)]",
    dark: "bg-gray-900 border-gray-800 text-white",
    prominent: "bg-[var(--card)] border-[var(--border)]",
  };

  return (
    <footer
      className={`${baseClasses} ${variants[variant] || variants.simple}`}
    >
      <div className="container mx-auto px-4 text-center">
        <h3 className="font-semibold text-lg mb-2">{store.name}</h3>
        {store.description && (
          <p className="text-sm opacity-70 mb-6 max-w-md mx-auto">
            {store.description}
          </p>
        )}

        <div className="text-xs opacity-50 space-y-2">
          <p>
            © {currentYear} {store.name}. Todos los derechos reservados.
          </p>
          <p>
            Powered by{" "}
            <a
              href={appConfig.baseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline text-[var(--primary)]"
            >
              Catalogy
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
